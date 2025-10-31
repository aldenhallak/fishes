/**
 * 查询队列状态API
 * POST /api/battle/queue-status
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
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: '缺少必需参数：userId' });
    }
    
    // 获取配置
    const config = await hasura.getBattleConfig();
    const maxUsers = config?.max_battle_users || 100;
    
    // 检查队列状态
    const status = await redis.checkQueueStatus(userId, maxUsers);
    
    return res.status(200).json(status);
    
  } catch (error) {
    console.error('查询队列状态失败:', error);
    return res.status(500).json({ 
      error: '服务器错误',
      message: error.message 
    });
  }
};

