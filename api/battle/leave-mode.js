/**
 * 离开战斗模式API
 * POST /api/battle/leave-mode
 */

const redis = require('../../lib/redis');
const hasura = require('../../lib/hasura');

module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { userId, fishId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: '缺少必需参数：userId' });
    }
    
    // 1. 从Redis移除
    await redis.leaveBattleMode(userId);
    
    // 2. 如果提供了fishId，更新数据库
    if (fishId) {
      await hasura.updateFish(fishId, {
        is_in_battle_mode: false
      });
    }
    
    return res.status(200).json({ 
      success: true,
      message: '已离开战斗模式'
    });
    
  } catch (error) {
    console.error('离开战斗模式失败:', error);
    return res.status(500).json({ 
      error: '服务器错误',
      message: error.message 
    });
  }
};

