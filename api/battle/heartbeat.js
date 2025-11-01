/**
 * 战斗模式心跳API
 * POST /api/battle/heartbeat
 * 前端每60秒调用一次，保持在线状态
 */

require('dotenv').config({ path: '.env.local' });
const redis = require('../../lib/redis');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { userId, fishId } = req.body;
    
    if (!userId || !fishId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields' 
      });
    }
    
    // 1. 检查用户是否在战斗模式
    const isIn = await redis.isBattleUser(userId);
    if (!isIn) {
      return res.json({
        success: false,
        inBattleMode: false,
        message: '您不在战斗模式中'
      });
    }
    
    // 2. 刷新心跳（重置过期时间）
    await redis.refreshHeartbeat(userId, fishId);
    
    // 3. 获取当前状态
    const currentUsers = await redis.getBattleUserCount();
    const MAX_BATTLE_USERS = parseInt(process.env.MAX_BATTLE_USERS) || 100;
    
    return res.json({
      success: true,
      inBattleMode: true,
      currentUsers,
      maxUsers: MAX_BATTLE_USERS,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('心跳失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
};
