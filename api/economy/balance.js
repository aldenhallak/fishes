/**
 * 查询鱼食余额API
 * GET /api/economy/balance?userId=xxx
 */

require('dotenv').config({ path: '.env.local' });
const hasura = require('../../lib/hasura');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing userId'
      });
    }
    
    // 获取用户经济数据（不存在会自动创建）
    const economy = await hasura.getUserEconomy(userId);
    
    return res.json({
      success: true,
      userId: economy.user_id,
      fishFood: economy.fish_food,
      lastDailyBonus: economy.last_daily_bonus,
      createdAt: economy.created_at
    });
    
  } catch (error) {
    console.error('查询余额失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
};



