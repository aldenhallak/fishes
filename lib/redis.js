/**
 * Redis客户端封装（Upstash）
 * 用于并发控制、缓存和队列管理
 */

const Redis = require('ioredis');

// 创建Redis连接
let redis = null;

function getRedisClient() {
  if (redis) return redis;
  
  const redisUrl = process.env.UPSTASH_REDIS_URL;
  
  if (!redisUrl) {
    console.warn('⚠️ UPSTASH_REDIS_URL not set, Redis功能将不可用');
    return null;
  }
  
  try {
    redis = new Redis(redisUrl, {
      tls: {}, // Upstash需要TLS
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: true
    });
    
    redis.on('error', (err) => {
      console.error('Redis连接错误:', err);
    });
    
    redis.on('connect', () => {
      console.log('✅ Redis连接成功');
    });
    
    return redis;
  } catch (error) {
    console.error('Redis初始化失败:', error);
    return null;
  }
}

/**
 * 测试Redis连接
 */
async function testConnection() {
  const client = getRedisClient();
  if (!client) return false;
  
  try {
    await client.connect();
    await client.ping();
    console.log('✅ Redis连接测试成功');
    return true;
  } catch (error) {
    console.error('❌ Redis连接测试失败:', error.message);
    return false;
  }
}

// ====================================
// 战斗模式用户管理
// ====================================

/**
 * 获取当前战斗模式在线人数
 */
async function getBattleUserCount() {
  const client = getRedisClient();
  if (!client) return 0;
  
  try {
    return await client.scard('battle:active_users');
  } catch (error) {
    console.error('获取在线人数失败:', error);
    return 0;
  }
}

/**
 * 添加用户到战斗模式
 */
async function addBattleUser(userId, fishId) {
  const client = getRedisClient();
  if (!client) return false;
  
  try {
    await client.sadd('battle:active_users', userId);
    await client.setex(`battle:fish:${userId}`, 1800, fishId); // 30分钟过期
    return true;
  } catch (error) {
    console.error('添加战斗用户失败:', error);
    return false;
  }
}

/**
 * 移除用户从战斗模式
 */
async function removeBattleUser(userId) {
  const client = getRedisClient();
  if (!client) return false;
  
  try {
    await client.srem('battle:active_users', userId);
    await client.del(`battle:fish:${userId}`);
    return true;
  } catch (error) {
    console.error('移除战斗用户失败:', error);
    return false;
  }
}

/**
 * 检查用户是否在战斗模式
 */
async function isBattleUser(userId) {
  const client = getRedisClient();
  if (!client) return false;
  
  try {
    return await client.sismember('battle:active_users', userId);
  } catch (error) {
    console.error('检查用户状态失败:', error);
    return false;
  }
}

/**
 * 获取用户的鱼ID
 */
async function getUserFishId(userId) {
  const client = getRedisClient();
  if (!client) return null;
  
  try {
    return await client.get(`battle:fish:${userId}`);
  } catch (error) {
    console.error('获取用户鱼ID失败:', error);
    return null;
  }
}

/**
 * 刷新用户心跳
 */
async function refreshHeartbeat(userId, fishId) {
  const client = getRedisClient();
  if (!client) return false;
  
  try {
    await client.setex(`battle:fish:${userId}`, 1800, fishId);
    return true;
  } catch (error) {
    console.error('刷新心跳失败:', error);
    return false;
  }
}

// ====================================
// 队列管理
// ====================================

/**
 * 添加用户到等待队列
 */
async function addToQueue(userId) {
  const client = getRedisClient();
  if (!client) return -1;
  
  try {
    const timestamp = Date.now();
    await client.zadd('battle:queue', timestamp, userId);
    return await client.zrank('battle:queue', userId);
  } catch (error) {
    console.error('添加到队列失败:', error);
    return -1;
  }
}

/**
 * 从队列移除用户
 */
async function removeFromQueue(userId) {
  const client = getRedisClient();
  if (!client) return false;
  
  try {
    await client.zrem('battle:queue', userId);
    return true;
  } catch (error) {
    console.error('从队列移除失败:', error);
    return false;
  }
}

/**
 * 获取队列长度
 */
async function getQueueLength() {
  const client = getRedisClient();
  if (!client) return 0;
  
  try {
    return await client.zcard('battle:queue');
  } catch (error) {
    console.error('获取队列长度失败:', error);
    return 0;
  }
}

/**
 * 获取队列中的前N个用户
 */
async function getQueueUsers(count) {
  const client = getRedisClient();
  if (!client) return [];
  
  try {
    return await client.zrange('battle:queue', 0, count - 1);
  } catch (error) {
    console.error('获取队列用户失败:', error);
    return [];
  }
}

/**
 * 获取用户在队列中的位置
 */
async function getQueuePosition(userId) {
  const client = getRedisClient();
  if (!client) return -1;
  
  try {
    const rank = await client.zrank('battle:queue', userId);
    return rank !== null ? rank + 1 : -1; // 转换为1-based索引
  } catch (error) {
    console.error('获取队列位置失败:', error);
    return -1;
  }
}

// ====================================
// 缓存管理
// ====================================

/**
 * 缓存鱼数据
 */
async function cacheFish(fishId, fishData, ttl = 300) {
  const client = getRedisClient();
  if (!client) return false;
  
  try {
    await client.setex(`fish:${fishId}`, ttl, JSON.stringify(fishData));
    return true;
  } catch (error) {
    console.error('缓存鱼数据失败:', error);
    return false;
  }
}

/**
 * 获取缓存的鱼数据
 */
async function getCachedFish(fishId) {
  const client = getRedisClient();
  if (!client) return null;
  
  try {
    const data = await client.get(`fish:${fishId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('获取缓存鱼数据失败:', error);
    return null;
  }
}

/**
 * 失效鱼缓存
 */
async function invalidateFishCache(fishId) {
  const client = getRedisClient();
  if (!client) return false;
  
  try {
    await client.del(`fish:${fishId}`);
    return true;
  } catch (error) {
    console.error('失效缓存失败:', error);
    return false;
  }
}

/**
 * 缓存战斗配置
 */
async function cacheBattleConfig(config) {
  const client = getRedisClient();
  if (!client) return false;
  
  try {
    await client.set('battle:config', JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('缓存配置失败:', error);
    return false;
  }
}

/**
 * 获取缓存的战斗配置
 */
async function getCachedBattleConfig() {
  const client = getRedisClient();
  if (!client) return null;
  
  try {
    const data = await client.get('battle:config');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('获取缓存配置失败:', error);
    return null;
  }
}

/**
 * 失效战斗配置缓存
 */
async function invalidateBattleConfigCache() {
  const client = getRedisClient();
  if (!client) return false;
  
  try {
    await client.del('battle:config');
    return true;
  } catch (error) {
    console.error('失效配置缓存失败:', error);
    return false;
  }
}

// ====================================
// 速率限制
// ====================================

/**
 * 检查速率限制
 * @param {string} key - 限制的键（如userId或IP）
 * @param {number} maxRequests - 最大请求数
 * @param {number} windowSeconds - 时间窗口（秒）
 */
async function checkRateLimit(key, maxRequests = 10, windowSeconds = 60) {
  const client = getRedisClient();
  if (!client) return true; // Redis不可用时不限制
  
  try {
    const redisKey = `ratelimit:${key}`;
    const current = await client.incr(redisKey);
    
    if (current === 1) {
      await client.expire(redisKey, windowSeconds);
    }
    
    return current <= maxRequests;
  } catch (error) {
    console.error('速率限制检查失败:', error);
    return true; // 失败时不限制
  }
}

// ====================================
// 清理函数
// ====================================

/**
 * 清理过期的战斗用户
 */
async function cleanupExpiredUsers() {
  const client = getRedisClient();
  if (!client) return 0;
  
  try {
    const users = await client.smembers('battle:active_users');
    let removed = 0;
    
    for (const userId of users) {
      const fishId = await client.get(`battle:fish:${userId}`);
      if (!fishId) {
        await client.srem('battle:active_users', userId);
        removed++;
      }
    }
    
    return removed;
  } catch (error) {
    console.error('清理过期用户失败:', error);
    return 0;
  }
}

/**
 * 关闭Redis连接
 */
async function closeConnection() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

// 导出
module.exports = {
  getRedisClient,
  testConnection,
  
  // 战斗模式用户管理
  getBattleUserCount,
  addBattleUser,
  removeBattleUser,
  isBattleUser,
  getUserFishId,
  refreshHeartbeat,
  
  // 队列管理
  addToQueue,
  removeFromQueue,
  getQueueLength,
  getQueueUsers,
  getQueuePosition,
  
  // 缓存管理
  cacheFish,
  getCachedFish,
  invalidateFishCache,
  cacheBattleConfig,
  getCachedBattleConfig,
  invalidateBattleConfigCache,
  
  // 速率限制
  checkRateLimit,
  
  // 清理
  cleanupExpiredUsers,
  closeConnection
};
