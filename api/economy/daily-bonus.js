/**
 * 每日签到领取鱼食API
 * POST /api/economy/daily-bonus
 */

require('dotenv').config({ path: '.env.local' });
const hasura = require('../../lib/hasura');

// 每日奖励数量
const DAILY_BONUS_AMOUNT = 10;

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
    
    // 获取用户经济数据
    const economy = await hasura.getUserEconomy(userId);
    
    // 检查是否今天已签到
    if (economy.last_daily_bonus) {
      const lastBonus = new Date(economy.last_daily_bonus);
      const now = new Date();
      
      // 如果是同一天，不能重复签到
      if (
        lastBonus.getFullYear() === now.getFullYear() &&
        lastBonus.getMonth() === now.getMonth() &&
        lastBonus.getDate() === now.getDate()
      ) {
        return res.json({
          success: false,
          alreadyClaimed: true,
          message: '今天已签到过了',
          nextBonusIn: getNextBonusTime(lastBonus)
        });
      }
    }
    
    // 更新鱼食数量和签到时间
    const updateMutation = `
      mutation ClaimDailyBonus($userId: String!, $amount: Int!) {
        update_user_economy_by_pk(
          pk_columns: { user_id: $userId },
          _inc: { fish_food: $amount, total_earned: $amount },
          _set: { last_daily_bonus: "now()" }
        ) {
          user_id
          fish_food
          last_daily_bonus
        }
        insert_economy_log_one(
          object: {
            user_id: $userId,
            action: "daily_bonus",
            amount: $amount,
            balance_after: 0
          }
        ) {
          id
        }
      }
    `;
    
    const result = await hasura.mutation(updateMutation, {
      userId,
      amount: DAILY_BONUS_AMOUNT
    });
    
    return res.json({
      success: true,
      amount: DAILY_BONUS_AMOUNT,
      newBalance: result.update_user_economy_by_pk.fish_food,
      message: `签到成功！获得 ${DAILY_BONUS_AMOUNT} 个鱼食`
    });
    
  } catch (error) {
    console.error('签到失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
};

/**
 * 计算下次签到剩余时间
 */
function getNextBonusTime(lastBonus) {
  const tomorrow = new Date(lastBonus);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const now = new Date();
  const diff = tomorrow - now;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    hours,
    minutes,
    timestamp: tomorrow.toISOString()
  };
}



