/**
 * 进入战斗模式API
 * POST /api/battle/enter-mode
 */

require('dotenv').config({ path: '.env.local' });
const redis = require('../../lib/redis');
const hasura = require('../../lib/hasura');

// 最大战斗用户数（可从环境变量读取）
const MAX_BATTLE_USERS = parseInt(process.env.MAX_BATTLE_USERS) || 100;

module.exports = async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  console.log('[Battle Enter-Mode] 收到请求');
  console.log('[Battle Enter-Mode] req.body:', req.body);
  
  try {
    const { userId, fishId } = req.body;
    
    // 验证参数
    if (!userId || !fishId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: userId, fishId' 
      });
    }
    
    // 1. 检查Redis是否可用
    console.log('[Battle Enter-Mode] 检查Redis...');
    const redisClient = redis.getRedisClient();
    if (!redisClient) {
      console.log('⚠️  Redis未配置，跳过战斗模式检查');
      return res.status(503).json({
        success: false,
        error: 'Battle功能暂时不可用',
        message: 'Redis服务未配置或无法连接。请联系管理员配置REDIS_URL环境变量。',
        needsSetup: true
      });
    }
    console.log('[Battle Enter-Mode] Redis客户端可用');
    
    // 2. 检查用户是否已经在战斗模式
    const isAlreadyIn = await redis.isBattleUser(userId);
    if (isAlreadyIn) {
      const currentCount = await redis.getBattleUserCount();
      return res.json({
        success: true,
        alreadyIn: true,
        currentUsers: currentCount,
        maxUsers: MAX_BATTLE_USERS
      });
    }
    
    // 3. 获取当前在线人数
    const currentUsers = await redis.getBattleUserCount();
    
    // 4. 检查是否已满
    if (currentUsers >= MAX_BATTLE_USERS) {
      // 加入等待队列
      const position = await redis.addToQueue(userId);
      const queueLength = await redis.getQueueLength();
      const estimatedWait = Math.ceil(queueLength / 10) * 60; // 假设每分钟10人进入
      
      return res.json({
        success: false,
        inQueue: true,
        position: position + 1,
        queueLength,
        estimatedWait,
        currentUsers,
        maxUsers: MAX_BATTLE_USERS,
        message: '战斗模式已满，已加入等待队列'
      });
    }
    
    // 5. 验证鱼是否存在且属于该用户
    const fish = await hasura.getFishById(fishId);
    if (!fish) {
      return res.status(404).json({
        success: false,
        error: '鱼不存在'
      });
    }
    
    if (fish.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: '这不是你的鱼'
      });
    }
    
    if (!fish.is_alive) {
      return res.status(400).json({
        success: false,
        error: '鱼已死亡，无法进入战斗模式'
      });
    }
    
    // 6. 添加到战斗模式
    await redis.addBattleUser(userId, fishId);
    
    // 7. 更新数据库
    await hasura.updateFish(fishId, {
      is_in_battle_mode: true
    });
    
    // 8. 如果有队列，尝试让下一个进入
    const newCount = await redis.getBattleUserCount();
    if (newCount < MAX_BATTLE_USERS) {
      const queueLength = await redis.getQueueLength();
      if (queueLength > 0) {
        // 通知等待的用户（这里简化处理，实际可以用WebSocket或轮询）
        console.log(`队列中还有 ${queueLength} 人等待`);
      }
    }
    
    return res.json({
      success: true,
      currentUsers: newCount,
      maxUsers: MAX_BATTLE_USERS,
      message: '成功进入战斗模式'
    });
    
  } catch (error) {
    console.error('[Battle Enter-Mode] ❌ 错误:', error);
    console.error('[Battle Enter-Mode] 错误堆栈:', error.stack);
    console.error('[Battle Enter-Mode] 错误详情:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    // 如果是Redis连接错误
    if (error.message && (error.message.includes('Redis') || error.message.includes('connect'))) {
      return res.status(503).json({
        success: false,
        error: 'Battle功能暂时不可用',
        message: 'Redis连接失败: ' + error.message,
        needsSetup: true
      });
    }
    
    return res.status(500).json({
      success: false,
      error: '服务器错误',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
