/**
 * 获取用户鱼食余额
 * GET /api/economy/get-balance
 */

const hasura = require('../../lib/hasura');

module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: '缺少必需参数：userId' });
    }
    
    // 获取或创建用户经济记录
    const economy = await hasura.getUserEconomy(userId);
    
    return res.status(200).json({
      success: true,
      userId: economy.user_id,
      fishFood: economy.fish_food,
      lastDailyBonus: economy.last_daily_bonus
    });
    
  } catch (error) {
    console.error('获取余额失败:', error);
    return res.status(500).json({ 
      error: '服务器错误',
      message: error.message 
    });
  }
};

