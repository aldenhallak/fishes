/**
 * 战斗模式心跳API
 * POST /api/battle/heartbeat
 */

const redis = require('../../lib/redis');

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
    
    if (!userId || !fishId) {
      return res.status(400).json({ 
        error: '缺少必需参数：userId 和 fishId' 
      });
    }
    
    // 更新心跳（延长30分钟）
    await redis.updateHeartbeat(userId, fishId);
    
    // 返回当前状态
    const stats = await redis.getStats();
    
    return res.status(200).json({
      success: true,
      ...stats
    });
    
  } catch (error) {
    console.error('心跳更新失败:', error);
    return res.status(500).json({ 
      error: '服务器错误',
      message: error.message 
    });
  }
};

