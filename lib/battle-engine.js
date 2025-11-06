/**
 * 战斗引擎核心逻辑
 */

const hasura = require('./hasura');
const redis = require('./redis');

/**
 * 计算战斗力
 * battlePower = level * levelWeight + talent * talentWeight + upvotes * upvoteWeight
 */
function calculateBattlePower(fish, config) {
  const { level, talent, upvotes } = fish;
  const { level_weight, talent_weight, upvote_weight } = config;
  
  const battlePower = 
    level * level_weight +
    talent * talent_weight +
    upvotes * upvote_weight;
  
  return parseFloat(battlePower.toFixed(2));
}

/**
 * 计算升级所需经验
 * expNeeded = baseExp * (multiplier ^ (level - 1))
 */
function calculateExpForLevelUp(level, config) {
  const { exp_for_level_up_base, exp_for_level_up_multiplier } = config;
  return Math.floor(
    exp_for_level_up_base * 
    Math.pow(exp_for_level_up_multiplier, level - 1)
  );
}

/**
 * 应用随机因子
 */
function applyRandomFactor(power, randomFactor) {
  const variation = power * randomFactor;
  const randomValue = (Math.random() * 2 - 1) * variation; // -variation to +variation
  return power + randomValue;
}

/**
 * 结算战斗
 * @param {Object} attacker - 攻击方鱼数据
 * @param {Object} defender - 防守方鱼数据
 * @param {Object} config - 战斗配置
 * @returns {Object} 战斗结果
 */
async function resolveBattle(attacker, defender, config) {
  // 1. 计算双方战斗力
  const attackerPower = calculateBattlePower(attacker, config);
  const defenderPower = calculateBattlePower(defender, config);
  
  // 2. 应用随机因子
  const attackerFinalPower = applyRandomFactor(attackerPower, config.random_factor);
  const defenderFinalPower = applyRandomFactor(defenderPower, config.random_factor);
  
  // 3. 判断胜负
  const attackerWins = attackerFinalPower > defenderFinalPower;
  const winner = attackerWins ? attacker : defender;
  const loser = attackerWins ? defender : attacker;
  
  // 4. 计算经验和血量变化
  const expGained = config.exp_per_win;
  const healthLost = config.health_loss_per_defeat;
  
  // 5. 更新胜者数据
  let winnerUpdates = {
    experience: winner.experience + expGained,
    total_wins: winner.total_wins + 1,
    battle_power: attackerWins ? attackerPower : defenderPower
  };
  
  // 检查是否升级
  const expNeeded = calculateExpForLevelUp(winner.level, config);
  if (winnerUpdates.experience >= expNeeded) {
    winnerUpdates.level = winner.level + 1;
    winnerUpdates.experience = winnerUpdates.experience - expNeeded;
    winnerUpdates.max_health = winner.max_health + config.max_health_per_level;
    winnerUpdates.levelUp = true;
  }
  
  // 6. 更新败者数据
  const newHealth = Math.max(0, loser.health - healthLost);
  const isDead = newHealth <= 0; // 使用 <= 0 避免浮点数精度问题
  
  let loserUpdates = {
    health: newHealth,
    total_losses: loser.total_losses + 1,
    is_alive: !isDead,
    battle_power: attackerWins ? defenderPower : attackerPower
  };
  
  if (isDead) {
    loserUpdates.is_in_battle_mode = false; // 死亡后自动退出战斗模式
  }
  
  // 7. 移动位置（向上或向下一行）
  const winnerMove = Math.random() > 0.5 ? 1 : -1;
  const loserMove = Math.random() > 0.5 ? 1 : -1;
  
  winnerUpdates.position_row = Math.max(0, Math.min(9, winner.position_row + winnerMove));
  loserUpdates.position_row = Math.max(0, Math.min(9, loser.position_row + loserMove));
  
  // 8. 返回结果
  return {
    winnerId: winner.id,
    loserId: loser.id,
    attackerWins,
    
    attackerPower,
    defenderPower,
    attackerFinalPower,
    defenderFinalPower,
    
    winnerUpdates,
    loserUpdates,
    
    expGained,
    healthLost,
    isDead,
    
    randomFactor: config.random_factor
  };
}

/**
 * 处理被动经验增长
 * @param {Object} fish - 鱼数据
 * @param {Object} config - 战斗配置
 */
function calculatePassiveExp(fish, config) {
  const now = new Date();
  const lastUpdate = new Date(fish.last_exp_update);
  const secondsPassed = Math.floor((now - lastUpdate) / 1000);
  
  const expGained = secondsPassed * config.exp_per_second;
  
  return {
    expGained,
    newExperience: fish.experience + expGained,
    secondsPassed
  };
}

/**
 * 检查并处理升级
 */
function processLevelUp(fish, newExp, config) {
  let level = fish.level;
  let experience = newExp;
  let maxHealth = fish.max_health;
  let levelsGained = 0;
  
  while (true) {
    const expNeeded = calculateExpForLevelUp(level, config);
    if (experience >= expNeeded) {
      level++;
      experience -= expNeeded;
      maxHealth += config.max_health_per_level;
      levelsGained++;
    } else {
      break;
    }
  }
  
  return {
    level,
    experience,
    maxHealth,
    levelsGained
  };
}

/**
 * 更新鱼的战斗力（应该定期更新）
 */
async function updateFishBattlePower(fishId) {
  try {
    // 获取配置（优先从缓存）
    let config = await redis.getCachedBattleConfig();
    if (!config) {
      config = await hasura.getBattleConfig();
      await redis.cacheBattleConfig(config);
    }
    
    // 获取鱼数据
    const fish = await hasura.getFishById(fishId);
    if (!fish) return null;
    
    // 计算战斗力
    const battlePower = calculateBattlePower(fish, config);
    
    // 更新数据库
    await hasura.updateFish(fishId, { battle_power: battlePower });
    
    // 失效缓存
    await redis.invalidateFishCache(fishId);
    
    return battlePower;
  } catch (error) {
    console.error('更新战斗力失败:', error);
    throw error;
  }
}

/**
 * 批量更新所有鱼的战斗力（管理员使用）
 */
async function recalculateAllBattlePowers() {
  try {
    const config = await hasura.getBattleConfig();
    const fishes = await hasura.getBattleFishes(1000); // 获取所有战斗模式的鱼
    
    const updates = fishes.map(fish => ({
      id: fish.id,
      data: {
        battle_power: calculateBattlePower(fish, config)
      }
    }));
    
    await hasura.batchUpdateFish(updates);
    
    console.log(`✅ 已更新 ${updates.length} 条鱼的战斗力`);
    return updates.length;
  } catch (error) {
    console.error('批量更新战斗力失败:', error);
    throw error;
  }
}

module.exports = {
  calculateBattlePower,
  calculateExpForLevelUp,
  applyRandomFactor,
  resolveBattle,
  calculatePassiveExp,
  processLevelUp,
  updateFishBattlePower,
  recalculateAllBattlePowers
};



