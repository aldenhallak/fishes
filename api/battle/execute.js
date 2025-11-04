/**
 * 执行战斗API
 * POST /api/battle/execute
 * 直接执行两条鱼之间的战斗（测试用）
 */

require('dotenv').config({ path: '.env.local' });
const hasura = require('../../lib/hasura');
const redis = require('../../lib/redis');
const battleEngine = require('../../lib/battle-engine');

module.exports = async function handler(req, res) {
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
    const { attackerId, defenderId } = req.body;
    
    if (!attackerId || !defenderId) {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数：attackerId 和 defenderId'
      });
    }
    
    if (attackerId === defenderId) {
      return res.status(400).json({
        success: false,
        error: '不能与自己战斗'
      });
    }
    
    // 1. 获取战斗配置（优先从缓存）
    let config = await redis.getCachedBattleConfig();
    if (!config) {
      const configQuery = `
        query GetBattleConfig {
          battle_config(limit: 1) {
            level_weight
            talent_weight
            upvote_weight
            random_factor
            exp_per_win
            health_loss_per_defeat
            exp_per_second
            exp_for_level_up_base
            exp_for_level_up_multiplier
            max_health_per_level
          }
        }
      `;
      
      const configResult = await hasura.query(configQuery);
      config = configResult?.battle_config?.[0];
      
      if (!config) {
        // 使用默认配置
        config = {
          level_weight: 40,
          talent_weight: 35,
          upvote_weight: 25,
          random_factor: 0.1,
          exp_per_win: 50,
          health_loss_per_defeat: 20,
          exp_per_second: 1,
          exp_for_level_up_base: 100,
          exp_for_level_up_multiplier: 1.5,
          max_health_per_level: 10
        };
      }
      
      await redis.cacheBattleConfig(config);
    }
    
    // 2. 获取双方鱼数据
    const fishQuery = `
      query GetBattleFish($attackerId: uuid!, $defenderId: uuid!) {
        attacker: fish_by_pk(id: $attackerId) {
          id
          user_id
          artist
          level
          talent
          upvotes
          health
          max_health
          experience
          is_alive
          total_wins
          total_losses
          battle_power
          position_row
        }
        defender: fish_by_pk(id: $defenderId) {
          id
          user_id
          artist
          level
          talent
          upvotes
          health
          max_health
          experience
          is_alive
          total_wins
          total_losses
          battle_power
          position_row
        }
      }
    `;
    
    const fishResult = await hasura.query(fishQuery, { attackerId, defenderId });
    const attacker = fishResult?.attacker;
    const defender = fishResult?.defender;
    
    // 3. 验证
    if (!attacker || !defender) {
      return res.status(404).json({
        success: false,
        error: '鱼不存在'
      });
    }
    
    if (!attacker.is_alive) {
      return res.status(400).json({
        success: false,
        error: `攻击方的鱼（${attacker.artist || attackerId}）已死亡`
      });
    }
    
    if (!defender.is_alive) {
      return res.status(400).json({
        success: false,
        error: `防守方的鱼（${defender.artist || defenderId}）已死亡`
      });
    }
    
    // 4. 结算战斗
    const battleResult = await battleEngine.resolveBattle(attacker, defender, config);
    
    // 5. 更新数据库
    const updateMutation = `
      mutation UpdateBattle(
        $winnerId: uuid!,
        $loserId: uuid!,
        $winnerUpdates: fish_set_input!,
        $loserUpdates: fish_set_input!,
        $battleLog: battle_log_insert_input!
      ) {
        update_winner: update_fish_by_pk(
          pk_columns: { id: $winnerId },
          _set: $winnerUpdates
        ) {
          id
          level
          experience
          health
          total_wins
        }
        update_loser: update_fish_by_pk(
          pk_columns: { id: $loserId },
          _set: $loserUpdates
        ) {
          id
          health
          is_alive
          total_losses
        }
        insert_battle_log_one(object: $battleLog) {
          id
          created_at
        }
      }
    `;
    
    // 准备更新数据
    const winnerUpdates = {
      experience: battleResult.winnerUpdates.experience,
      total_wins: battleResult.winnerUpdates.total_wins,
      battle_power: battleResult.winnerUpdates.battle_power,
      position_row: battleResult.winnerUpdates.position_row
    };
    
    if (battleResult.winnerUpdates.level) {
      winnerUpdates.level = battleResult.winnerUpdates.level;
    }
    
    if (battleResult.winnerUpdates.max_health) {
      winnerUpdates.max_health = battleResult.winnerUpdates.max_health;
    }
    
    const loserUpdates = {
      health: battleResult.loserUpdates.health,
      total_losses: battleResult.loserUpdates.total_losses,
      is_alive: battleResult.loserUpdates.is_alive,
      battle_power: battleResult.loserUpdates.battle_power,
      position_row: battleResult.loserUpdates.position_row
    };
    
    if (battleResult.loserUpdates.is_in_battle_mode !== undefined) {
      loserUpdates.is_in_battle_mode = battleResult.loserUpdates.is_in_battle_mode;
    }
    
    const battleLog = {
      attacker_id: attackerId,
      defender_id: defenderId,
      winner_id: battleResult.winnerId,
      attacker_power: battleResult.attackerPower,
      defender_power: battleResult.defenderPower,
      random_factor: battleResult.randomFactor,
      exp_gained: battleResult.expGained,
      health_lost: battleResult.healthLost
    };
    
    await hasura.mutation(updateMutation, {
      winnerId: battleResult.winnerId,
      loserId: battleResult.loserId,
      winnerUpdates,
      loserUpdates,
      battleLog
    });
    
    // 6. 失效缓存
    await redis.invalidateFishCache(attackerId);
    await redis.invalidateFishCache(defenderId);
    
    // 7. 返回结果
    return res.json({
      success: true,
      data: {
        winnerId: battleResult.winnerId,
        loserId: battleResult.loserId,
        attackerWins: battleResult.attackerWins,
        
        // 战斗详情
        battle: {
          attackerName: attacker.artist || 'Anonymous',
          defenderName: defender.artist || 'Anonymous',
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
            name: battleResult.winnerId === attackerId ? (attacker.artist || 'Anonymous') : (defender.artist || 'Anonymous'),
            expGained: battleResult.expGained,
            levelUp: battleResult.winnerUpdates.levelUp || false,
            newLevel: battleResult.winnerUpdates.level,
            newPosition: battleResult.winnerUpdates.position_row
          },
          loser: {
            id: battleResult.loserId,
            name: battleResult.loserId === attackerId ? (attacker.artist || 'Anonymous') : (defender.artist || 'Anonymous'),
            healthLost: battleResult.healthLost,
            newHealth: battleResult.loserUpdates.health,
            isDead: battleResult.isDead,
            newPosition: battleResult.loserUpdates.position_row
          }
        }
      }
    });
    
  } catch (error) {
    console.error('执行战斗失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

