/**
 * 战斗计算逻辑
 * 纯函数，可在前后端复用
 */

/**
 * 计算鱼的战斗力
 * @param {object} fish - 鱼数据
 * @param {object} config - 战斗配置
 * @returns {number} 战斗力（0-100）
 */
function calculateBattlePower(fish, config) {
  // 归一化各项数值到 0-100
  const normalizedLevel = Math.min(fish.level * 10, 100);
  const normalizedTalent = fish.talent || 50;
  const normalizedUpvotes = Math.min((fish.upvotes || 0) / 10, 100);
  
  // 加权计算
  const basePower = 
    normalizedLevel * (config.level_weight || 0.40) +
    normalizedTalent * (config.talent_weight || 0.35) +
    normalizedUpvotes * (config.upvote_weight || 0.25);
  
  return basePower;
}

/**
 * 判定战斗胜负
 * @param {object} fish1 - 鱼1
 * @param {object} fish2 - 鱼2
 * @param {object} config - 战斗配置
 * @returns {object} 战斗结果
 */
function resolveBattle(fish1, fish2, config) {
  // 计算战斗力
  const power1 = calculateBattlePower(fish1, config);
  const power2 = calculateBattlePower(fish2, config);
  
  // 添加随机因素 ±20%
  const randomFactor = config.random_factor || 0.20;
  const random1 = 1 + (Math.random() * 2 - 1) * randomFactor;
  const random2 = 1 + (Math.random() * 2 - 1) * randomFactor;
  
  const finalPower1 = power1 * random1;
  const finalPower2 = power2 * random2;
  
  // 判定胜负
  const winner = finalPower1 > finalPower2 ? fish1 : fish2;
  const loser = winner.id === fish1.id ? fish2 : fish1;
  const winnerPower = winner.id === fish1.id ? finalPower1 : finalPower2;
  const loserPower = winner.id === fish1.id ? finalPower2 : finalPower1;
  
  // 计算奖惩
  const expGained = config.exp_per_win || 50;
  const healthLost = config.health_loss_per_defeat || 1;
  const newLoserHealth = Math.max(0, loser.health - healthLost);
  const loserDied = newLoserHealth <= 0;
  
  return {
    winner: {
      id: winner.id,
      userId: winner.user_id,
      power: winnerPower,
      expGained
    },
    loser: {
      id: loser.id,
      userId: loser.user_id,
      power: loserPower,
      healthLost,
      newHealth: newLoserHealth,
      died: loserDied
    },
    powers: {
      fish1: finalPower1,
      fish2: finalPower2
    }
  };
}

/**
 * 计算升级
 * @param {number} currentExp - 当前经验
 * @param {number} currentLevel - 当前等级
 * @returns {object} 升级结果
 */
function calculateLevelUp(currentExp, currentLevel) {
  // 升级所需经验：100, 150, 225, 338...（递增50%）
  const expRequired = Math.floor(100 * Math.pow(1.5, currentLevel - 1));
  
  if (currentExp >= expRequired) {
    return {
      leveledUp: true,
      newLevel: currentLevel + 1,
      remainingExp: currentExp - expRequired,
      expRequired
    };
  }
  
  return {
    leveledUp: false,
    newLevel: currentLevel,
    remainingExp: currentExp,
    expRequired
  };
}

/**
 * 计算被动经验增长
 * @param {Date} lastUpdate - 最后更新时间
 * @param {number} expPerSecond - 每秒经验
 * @returns {number} 增长的经验
 */
function calculatePassiveExp(lastUpdate, expPerSecond = 1) {
  const now = new Date();
  const last = new Date(lastUpdate);
  const secondsElapsed = Math.floor((now - last) / 1000);
  
  return Math.max(0, secondsElapsed * expPerSecond);
}

/**
 * 验证战斗合法性
 * @param {object} fish1 - 鱼1
 * @param {object} fish2 - 鱼2
 * @returns {object} 验证结果
 */
function validateBattle(fish1, fish2) {
  const errors = [];
  
  if (!fish1 || !fish2) {
    errors.push('鱼数据不完整');
  }
  
  if (fish1.id === fish2.id) {
    errors.push('不能与自己战斗');
  }
  
  if (!fish1.is_alive) {
    errors.push('鱼1已死亡');
  }
  
  if (!fish2.is_alive) {
    errors.push('鱼2已死亡');
  }
  
  if (fish1.health <= 0) {
    errors.push('鱼1血量不足');
  }
  
  if (fish2.health <= 0) {
    errors.push('鱼2血量不足');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 生成战斗日志数据
 * @param {object} fish1 - 鱼1
 * @param {object} fish2 - 鱼2
 * @param {object} result - 战斗结果
 * @returns {object} 日志数据
 */
function createBattleLog(fish1, fish2, result) {
  return {
    attacker_id: fish1.id,
    defender_id: fish2.id,
    winner_id: result.winner.id,
    attacker_power: result.powers.fish1,
    defender_power: result.powers.fish2,
    exp_gained: result.winner.expGained,
    health_lost: result.loser.healthLost
  };
}

// 导出
module.exports = {
  calculateBattlePower,
  resolveBattle,
  calculateLevelUp,
  calculatePassiveExp,
  validateBattle,
  createBattleLog
};

