/**
 * 喂食（回血）API
 * POST /api/economy/feed
 */

require('dotenv').config({ path: '.env.local' });
const hasura = require('../../lib/hasura');
const redis = require('../../lib/redis');

// 喂食消耗的鱼食数量
const FEED_COST = 1;
// 恢复的血量
const HEALTH_RESTORED = 2;

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
    
    if (!fish.is_alive) {
      return res.status(400).json({
        success: false,
        error: '鱼已死亡，无法喂食'
      });
    }
    
    if (fish.health >= fish.max_health) {
      return res.json({
        success: false,
        fullHealth: true,
        message: '血量已满，无需喂食'
      });
    }
    
    // 2. 获取用户经济数据
    const economy = await hasura.getUserEconomy(userId);
    
    if (economy.fish_food < FEED_COST) {
      return res.json({
        success: false,
        insufficientFunds: true,
        message: '鱼食不足',
        current: economy.fish_food,
        required: FEED_COST
      });
    }
    
    // 3. 计算新血量
    const newHealth = Math.min(fish.max_health, fish.health + HEALTH_RESTORED);
    const actualHealing = newHealth - fish.health;
    
    // 4. 执行事务：扣除鱼食 + 恢复血量 + 记录日志
    const transactionMutation = `
      mutation FeedFish(
        $userId: String!,
        $fishId: uuid!,
        $newHealth: Int!,
        $feedCost: Int!
      ) {
        update_user_economy_by_pk(
          pk_columns: { user_id: $userId },
          _inc: { fish_food: -$feedCost, total_spent: $feedCost }
        ) {
          fish_food
        }
        
        update_fish_by_pk(
          pk_columns: { id: $fishId },
          _set: { health: $newHealth }
        ) {
          health
          max_health
        }
        
        insert_economy_log_one(
          object: {
            user_id: $userId,
            fish_id: $fishId,
            action: "feed",
            amount: -$feedCost,
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
      newHealth,
      feedCost: FEED_COST
    });
    
    // 5. 失效缓存
    await redis.invalidateFishCache(fishId);
    
    return res.json({
      success: true,
      message: `喂食成功！恢复了 ${actualHealing} 点血量`,
      fish: {
        health: newHealth,
        maxHealth: fish.max_health,
        healthRestored: actualHealing
      },
      economy: {
        fishFood: result.update_user_economy_by_pk.fish_food,
        spent: FEED_COST
      }
    });
    
  } catch (error) {
    console.error('喂食失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
};



