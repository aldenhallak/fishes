/**
 * 触发战斗API
 * POST /api/battle/trigger
 * 当两条鱼在前端碰撞时调用
 */

require('dotenv').config({ path: '.env.local' });
const hasura = require('../../lib/hasura');
const redis = require('../../lib/redis');
const battleEngine = require('../../lib/battle-engine');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { attackerId, defenderId } = req.body;
    
    if (!attackerId || !defenderId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // 1. 获取战斗配置（优先从缓存）
    let config = await redis.getCachedBattleConfig();
    if (!config) {
      config = await hasura.getBattleConfig();
      await redis.cacheBattleConfig(config);
    }
    
    // 2. 获取双方鱼数据（优先从缓存）
    let attacker = await redis.getCachedFish(attackerId);
    if (!attacker) {
      attacker = await hasura.getFishById(attackerId);
      if (attacker) {
        await redis.cacheFish(attackerId, attacker);
      }
    }
    
    let defender = await redis.getCachedFish(defenderId);
    if (!defender) {
      defender = await hasura.getFishById(defenderId);
      if (defender) {
        await redis.cacheFish(defenderId, defender);
      }
    }
    
    // 3. 验证
    if (!attacker || !defender) {
      return res.status(404).json({
        success: false,
        error: '鱼不存在'
      });
    }
    
    if (!attacker.is_alive || !defender.is_alive) {
      return res.status(400).json({
        success: false,
        error: '死鱼无法战斗'
      });
    }
    
    if (!attacker.is_in_battle_mode || !defender.is_in_battle_mode) {
      return res.status(400).json({
        success: false,
        error: '鱼不在战斗模式'
      });
    }
    
    // 4. 结算战斗
    const battleResult = await battleEngine.resolveBattle(attacker, defender, config);
    
    // 5. 更新数据库
    await hasura.updateFish(battleResult.winnerId, battleResult.winnerUpdates);
    await hasura.updateFish(battleResult.loserId, battleResult.loserUpdates);
    
    // 6. 记录战斗日志
    await hasura.logBattle({
      attackerId,
      defenderId,
      winnerId: battleResult.winnerId,
      attackerPower: battleResult.attackerPower,
      defenderPower: battleResult.defenderPower,
      randomFactor: battleResult.randomFactor,
      expGained: battleResult.expGained,
      healthLost: battleResult.healthLost
    });
    
    // 7. 失效缓存
    await redis.invalidateFishCache(attackerId);
    await redis.invalidateFishCache(defenderId);
    
    // 8. 如果有鱼死亡，从战斗模式移除
    if (battleResult.isDead) {
      const deadFish = battleResult.loserId;
      const deadFishData = deadFish === attackerId ? attacker : defender;
      await redis.removeBattleUser(deadFishData.user_id);
    }
    
    // 9. 返回结果给前端播放动画
    return res.json({
      success: true,
      winnerId: battleResult.winnerId,
      loserId: battleResult.loserId,
      attackerWins: battleResult.attackerWins,
      
      // 战斗详情
      battle: {
        attackerPower: battleResult.attackerPower,
        defenderPower: battleResult.defenderPower,
        attackerFinalPower: battleResult.attackerFinalPower,
        defenderFinalPower: battleResult.defenderFinalPower,
        powerDiff: Math.abs(battleResult.attackerFinalPower - battleResult.defenderFinalPower)
      },
      
      // 变化
      changes: {
        winner: {
          id: battleResult.winnerId,
          expGained: battleResult.expGained,
          levelUp: battleResult.winnerUpdates.levelUp || false,
          newLevel: battleResult.winnerUpdates.level,
          newPosition: battleResult.winnerUpdates.position_row
        },
        loser: {
          id: battleResult.loserId,
          healthLost: battleResult.healthLost,
          newHealth: battleResult.loserUpdates.health,
          isDead: battleResult.isDead,
          newPosition: battleResult.loserUpdates.position_row
        }
      }
    });
    
  } catch (error) {
    console.error('战斗触发失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



