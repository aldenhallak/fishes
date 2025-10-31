/**
 * 战斗结算API
 * POST /api/battle/resolve
 */

const hasura = require('../../lib/hasura');
const redis = require('../../lib/redis');
const battle = require('../../lib/battle');

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
    const { attackerId, defenderId } = req.body;
    
    if (!attackerId || !defenderId) {
      return res.status(400).json({ 
        error: '缺少必需参数：attackerId 和 defenderId' 
      });
    }
    
    // 1. 尝试从缓存获取鱼数据
    let attacker = await redis.getCachedFish(attackerId);
    let defender = await redis.getCachedFish(defenderId);
    
    // 2. 如果缓存没有，从数据库查询
    if (!attacker || !defender) {
      const fishQuery = `
        query GetBattleFish($attackerId: uuid!, $defenderId: uuid!) {
          attacker: fish_by_pk(id: $attackerId) {
            id
            user_id
            talent
            level
            upvotes
            downvotes
            health
            max_health
            experience
            is_alive
          }
          defender: fish_by_pk(id: $defenderId) {
            id
            user_id
            talent
            level
            upvotes
            downvotes
            health
            max_health
            experience
            is_alive
          }
        }
      `;
      
      const fishData = await hasura.query(fishQuery, { attackerId, defenderId });
      attacker = attacker || fishData.attacker;
      defender = defender || fishData.defender;
      
      if (!attacker || !defender) {
        return res.status(404).json({ error: '鱼不存在' });
      }
    }
    
    // 3. 验证战斗合法性
    const validation = battle.validateBattle(attacker, defender);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: '战斗无效', 
        reasons: validation.errors 
      });
    }
    
    // 4. 获取战斗配置（优先从缓存）
    let config = await redis.getCachedBattleConfig();
    if (!config) {
      config = await hasura.getBattleConfig();
      if (config) {
        await redis.cacheBattleConfig(config);
      }
    }
    
    if (!config) {
      return res.status(500).json({ error: '战斗配置未初始化' });
    }
    
    // 5. 执行战斗结算
    const result = battle.resolveBattle(attacker, defender, config);
    
    // 6. 计算升级
    const winnerNewExp = (result.winner.id === attackerId ? attacker.experience : defender.experience) + result.winner.expGained;
    const winnerLevel = result.winner.id === attackerId ? attacker.level : defender.level;
    const levelUpResult = battle.calculateLevelUp(winnerNewExp, winnerLevel);
    
    // 7. 准备数据库更新
    const winnerUpdates = {
      experience: levelUpResult.remainingExp,
      level: levelUpResult.newLevel
    };
    
    // 如果升级，增加最大血量
    if (levelUpResult.leveledUp) {
      winnerUpdates.max_health = (result.winner.id === attackerId ? attacker.max_health : defender.max_health) + 2;
    }
    
    const loserUpdates = {
      health: result.loser.newHealth,
      is_alive: !result.loser.died
    };
    
    // 8. 批量更新数据库（一次事务）
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
          _set: $winnerUpdates,
          _inc: { total_wins: 1 }
        ) {
          id
          level
          experience
          max_health
        }
        update_loser: update_fish_by_pk(
          pk_columns: { id: $loserId },
          _set: $loserUpdates,
          _inc: { total_losses: 1 }
        ) {
          id
          health
          is_alive
        }
        insert_battle_log_one(object: $battleLog) {
          id
        }
      }
    `;
    
    const battleLog = battle.createBattleLog(attacker, defender, result);
    
    await hasura.mutation(updateMutation, {
      winnerId: result.winner.id,
      loserId: result.loser.id,
      winnerUpdates,
      loserUpdates,
      battleLog
    });
    
    // 9. 失效缓存
    await redis.invalidateFishCache(attackerId);
    await redis.invalidateFishCache(defenderId);
    
    // 10. 返回结果
    return res.status(200).json({
      success: true,
      winner: {
        id: result.winner.id,
        userId: result.winner.userId,
        isAttacker: result.winner.id === attackerId,
        expGained: result.winner.expGained,
        leveledUp: levelUpResult.leveledUp,
        newLevel: levelUpResult.newLevel
      },
      loser: {
        id: result.loser.id,
        userId: result.loser.userId,
        healthLost: result.loser.healthLost,
        newHealth: result.loser.newHealth,
        died: result.loser.died
      },
      powers: result.powers
    });
    
  } catch (error) {
    console.error('战斗结算失败:', error);
    return res.status(500).json({ 
      error: '服务器错误',
      message: error.message 
    });
  }
};

