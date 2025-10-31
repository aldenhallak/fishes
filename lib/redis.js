/**
 * Redis客户端封装（Upstash）
 * 用于并发控制和缓存
 */

const Redis = require('ioredis');

// 初始化Redis客户端
let redis = null;

function getRedisClient() {
  if (!redis && process.env.UPSTASH_REDIS_URL) {
    redis = new Redis(process.env.UPSTASH_REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    redis.on('error', (err) => {
      console.error('Redis错误:', err);
    });

    redis.on('connect', () => {
      console.log('✅ Redis已连接');
    });
  }
  return redis;
}

// ====================================
// 1. 战斗模式并发控制
// ====================================

/**
 * 检查战斗模式人数
 * @returns {Promise<number>} 当前人数
 */
async function getBattleUserCount() {
  const client = getRedisClient();
  if (!client) return 0;
  
  return await client.scard('battle:active_users');
}

/**
 * 用户进入战斗模式
 * @param {string} userId - 用户ID
 * @param {string} fishId - 鱼ID
 * @param {number} maxUsers - 最大人数限制
 * @returns {Promise<object>} 结果
 */
async function enterBattleMode(userId, fishId, maxUsers = 100) {
  const client = getRedisClient();
  if (!client) {
    throw new Error('Redis未配置');
  }
  
  const currentUsers = await client.scard('battle:active_users');
  
  if (currentUsers >= maxUsers) {
    // 加入队列
    const timestamp = Date.now();
    await client.zadd('battle:queue', timestamp, userId);
    const position = await client.zrank('battle:queue', userId);
    
    return {
      success: false,
      inQueue: true,
      position: position + 1,
      currentUsers,
      maxUsers
    };
  }
  
  // 加入战斗模式
  await client.sadd('battle:active_users', userId);
  await client.setex(`battle:fish:${userId}`, 1800, fishId); // 30分钟
  
  return {
    success: true,
    currentUsers: currentUsers + 1,
    maxUsers
  };
}

/**
 * 用户离开战斗模式
 * @param {string} userId - 用户ID
 */
async function leaveBattleMode(userId) {
  const client = getRedisClient();
  if (!client) return;
  
  await client.srem('battle:active_users', userId);
  await client.del(`battle:fish:${userId}`);
  await client.zrem('battle:queue', userId);
}

/**
 * 心跳更新
 * @param {string} userId - 用户ID
 * @param {string} fishId - 鱼ID
 */
async function updateHeartbeat(userId, fishId) {
  const client = getRedisClient();
  if (!client) return;
  
  await client.setex(`battle:fish:${userId}`, 1800, fishId);
}

/**
 * 检查队列状态
 * @param {string} userId - 用户ID
 * @param {number} maxUsers - 最大人数
 * @returns {Promise<object>} 队列状态
 */
async function checkQueueStatus(userId, maxUsers = 100) {
  const client = getRedisClient();
  if (!client) {
    return { canEnter: false, position: 0 };
  }
  
  const currentUsers = await client.scard('battle:active_users');
  const position = await client.zrank('battle:queue', userId);
  
  if (position === null) {
    return { canEnter: false, position: 0 };
  }
  
  const canEnter = currentUsers < maxUsers && position === 0;
  
  return {
    canEnter,
    position: position + 1,
    estimatedWait: Math.ceil(position / 10) * 60
  };
}

/**
 * 清理离线用户（定时任务）
 */
async function cleanupInactiveUsers() {
  const client = getRedisClient();
  if (!client) return;
  
  const activeUsers = await client.smembers('battle:active_users');
  let cleaned = 0;
  
  for (const userId of activeUsers) {
    const fishId = await client.get(`battle:fish:${userId}`);
    if (!fishId) {
      await client.srem('battle:active_users', userId);
      cleaned++;
    }
  }
  
  return cleaned;
}

// ====================================
// 2. 数据缓存
// ====================================

/**
 * 缓存鱼数据
 * @param {string} fishId - 鱼ID
 * @param {object} fishData - 鱼数据
 * @param {number} ttl - 过期时间（秒）
 */
async function cacheFish(fishId, fishData, ttl = 300) {
  const client = getRedisClient();
  if (!client) return;
  
  await client.setex(`fish:${fishId}`, ttl, JSON.stringify(fishData));
}

/**
 * 获取缓存的鱼数据
 * @param {string} fishId - 鱼ID
 * @returns {Promise<object|null>} 鱼数据或null
 */
async function getCachedFish(fishId) {
  const client = getRedisClient();
  if (!client) return null;
  
  const cached = await client.get(`fish:${fishId}`);
  return cached ? JSON.parse(cached) : null;
}

/**
 * 失效鱼缓存
 * @param {string} fishId - 鱼ID
 */
async function invalidateFishCache(fishId) {
  const client = getRedisClient();
  if (!client) return;
  
  await client.del(`fish:${fishId}`);
}

/**
 * 缓存战斗配置
 * @param {object} config - 配置数据
 */
async function cacheBattleConfig(config) {
  const client = getRedisClient();
  if (!client) return;
  
  await client.set('battle:config', JSON.stringify(config));
}

/**
 * 获取缓存的战斗配置
 * @returns {Promise<object|null>} 配置或null
 */
async function getCachedBattleConfig() {
  const client = getRedisClient();
  if (!client) return null;
  
  const cached = await client.get('battle:config');
  return cached ? JSON.parse(cached) : null;
}

/**
 * 失效配置缓存
 */
async function invalidateBattleConfig() {
  const client = getRedisClient();
  if (!client) return;
  
  await client.del('battle:config');
}

// ====================================
// 3. 速率限制
// ====================================

/**
 * 检查速率限制
 * @param {string} key - 限制键（如userId或IP）
 * @param {number} limit - 限制次数
 * @param {number} window - 时间窗口（秒）
 * @returns {Promise<boolean>} 是否超出限制
 */
async function checkRateLimit(key, limit = 10, window = 60) {
  const client = getRedisClient();
  if (!client) return false; // Redis不可用时不限制
  
  const current = await client.incr(`ratelimit:${key}`);
  
  if (current === 1) {
    await client.expire(`ratelimit:${key}`, window);
  }
  
  return current > limit;
}

// ====================================
// 4. 工具函数
// ====================================

/**
 * 测试Redis连接
 * @returns {Promise<boolean>} 是否连接成功
 */
async function testConnection() {
  try {
    const client = getRedisClient();
    if (!client) {
      console.warn('⚠️ Redis未配置');
      return false;
    }
    
    await client.ping();
    console.log('✅ Redis连接成功');
    return true;
  } catch (error) {
    console.error('❌ Redis连接失败:', error.message);
    return false;
  }
}

/**
 * 获取统计信息
 * @returns {Promise<object>} 统计数据
 */
async function getStats() {
  const client = getRedisClient();
  if (!client) return {};
  
  const [activeUsers, queueLength] = await Promise.all([
    client.scard('battle:active_users'),
    client.zcard('battle:queue')
  ]);
  
  return {
    activeUsers,
    queueLength,
    timestamp: Date.now()
  };
}

// 导出
module.exports = {
  getRedisClient,
  
  // 并发控制
  getBattleUserCount,
  enterBattleMode,
  leaveBattleMode,
  updateHeartbeat,
  checkQueueStatus,
  cleanupInactiveUsers,
  
  // 缓存
  cacheFish,
  getCachedFish,
  invalidateFishCache,
  cacheBattleConfig,
  getCachedBattleConfig,
  invalidateBattleConfig,
  
  // 速率限制
  checkRateLimit,
  
  // 工具
  testConnection,
  getStats
};

