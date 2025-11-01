/**
 * 复活鱼API
 * POST /api/economy/revive
 */

require('dotenv').config({ path: '.env.local' });
const hasura = require('../../lib/hasura');
const redis = require('../../lib/redis');

// 复活消耗的鱼食数量
const REVIVE_COST = 5;

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
    
    // 1. 获取鱼数据
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
    
    if (fish.is_alive) {
      return res.json({
        success: false,
        alreadyAlive: true,
        message: '鱼还活着，无需复活'
      });
    }
    
    // 2. 获取用户经济数据
    const economy = await hasura.getUserEconomy(userId);
    
    if (economy.fish_food < REVIVE_COST) {
      return res.json({
        success: false,
        insufficientFunds: true,
        message: '鱼食不足',
        current: economy.fish_food,
        required: REVIVE_COST
      });
    }
    
    // 3. 执行事务：扣除鱼食 + 复活鱼 + 记录日志
    const transactionMutation = `
      mutation ReviveFish(
        $userId: String!,
        $fishId: uuid!,
        $reviveCost: Int!,
        $maxHealth: Int!
      ) {
        update_user_economy_by_pk(
          pk_columns: { user_id: $userId },
          _inc: { fish_food: -$reviveCost, total_spent: $reviveCost }
        ) {
          fish_food
        }
        
        update_fish_by_pk(
          pk_columns: { id: $fishId },
          _set: { 
            is_alive: true,
            health: $maxHealth,
            is_in_battle_mode: false
          }
        ) {
          is_alive
          health
        }
        
        insert_economy_log_one(
          object: {
            user_id: $userId,
            fish_id: $fishId,
            action: "revive",
            amount: -$reviveCost,
            balance_after: 0
          }
        ) {
          id
        }
      }
    `;
    
    const result = await hasura.mutation(transactionMutation, {
      userId,
      fishId,
      reviveCost: REVIVE_COST,
      maxHealth: fish.max_health
    });
    
    // 4. 失效缓存
    await redis.invalidateFishCache(fishId);
    
    return res.json({
      success: true,
      message: `复活成功！${fish.artist || '你的鱼'} 重获新生`,
      fish: {
        id: fishId,
        health: fish.max_health,
        isAlive: true
      },
      economy: {
        fishFood: result.update_user_economy_by_pk.fish_food,
        spent: REVIVE_COST
      }
    });
    
  } catch (error) {
    console.error('复活失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
};



