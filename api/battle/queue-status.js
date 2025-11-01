/**
 * 查询队列状态API
 * POST /api/battle/queue-status
 * 用于在排队时轮询状态
 */

require('dotenv').config({ path: '.env.local' });
const redis = require('../../lib/redis');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing userId' 
      });
    }
    
    // 1. 检查是否已经在战斗模式中
    const isInBattle = await redis.isBattleUser(userId);
    if (isInBattle) {
      return res.json({
        success: true,
        canEnter: false,
        inBattleMode: true,
        message: '您已在战斗模式中'
      });
    }
    
    // 2. 检查当前人数
    const currentUsers = await redis.getBattleUserCount();
    const MAX_BATTLE_USERS = parseInt(process.env.MAX_BATTLE_USERS) || 100;
    
    if (currentUsers < MAX_BATTLE_USERS) {
      // 可以进入
      await redis.removeFromQueue(userId);
      return res.json({
        success: true,
        canEnter: true,
        currentUsers,
        maxUsers: MAX_BATTLE_USERS,
        message: '现在可以进入战斗模式'
      });
    }
    
    // 3. 还在队列中
    const position = await redis.getQueuePosition(userId);
    const queueLength = await redis.getQueueLength();
    
    if (position === -1) {
      // 不在队列中（可能被移除了）
      return res.json({
        success: false,
        canEnter: false,
        inQueue: false,
        message: '您不在队列中，请重新加入'
      });
    }
    
    const estimatedWait = Math.ceil(position / 10) * 60; // 假设每分钟10人进入
    
    return res.json({
      success: true,
      canEnter: false,
      inQueue: true,
      position,
      queueLength,
      estimatedWait,
      currentUsers,
      maxUsers: MAX_BATTLE_USERS
    });
    
  } catch (error) {
    console.error('查询队列状态失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
};
