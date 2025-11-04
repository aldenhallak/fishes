/**
 * 匹配对手API
 * POST /api/battle/match
 * 为指定的鱼匹配一个合适的对手
 */

require('dotenv').config({ path: '.env.local' });
const hasura = require('../../lib/hasura');
const redis = require('../../lib/redis');

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
    const { fishId } = req.body;
    
    if (!fishId) {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数：fishId'
      });
    }
    
    // 1. 获取当前鱼的数据
    let myFish = await redis.getCachedFish(fishId);
    if (!myFish) {
      const query = `
        query GetFish($id: uuid!) {
          fish_by_pk(id: $id) {
            id
            user_id
            artist
            level
            talent
            upvotes
            health
            max_health
            battle_power
            is_alive
            is_in_battle_mode
          }
        }
      `;
      
      const result = await hasura.query(query, { id: fishId });
      myFish = result?.fish_by_pk;
      
      if (myFish) {
        await redis.cacheFish(fishId, myFish);
      }
    }
    
    if (!myFish) {
      return res.status(404).json({
        success: false,
        error: '鱼不存在'
      });
    }
    
    // 2. 验证鱼的状态
    if (!myFish.is_alive) {
      return res.status(400).json({
        success: false,
        error: '死亡的鱼无法战斗'
      });
    }
    
    // 3. 查找合适的对手
    // 匹配规则：等级相近（±3级）、战斗力相近、存活、不是自己
    const matchQuery = `
      query MatchOpponent($myFishId: uuid!, $minLevel: Int!, $maxLevel: Int!) {
        fish(
          where: {
            id: {_neq: $myFishId}
            is_alive: {_eq: true}
            level: {_gte: $minLevel, _lte: $maxLevel}
          }
          order_by: {battle_power: asc}
          limit: 10
        ) {
          id
          user_id
          artist
          level
          talent
          upvotes
          health
          max_health
          battle_power
          is_alive
        }
      }
    `;
    
    const minLevel = Math.max(1, myFish.level - 3);
    const maxLevel = myFish.level + 3;
    
    const matchResult = await hasura.query(matchQuery, {
      myFishId: fishId,
      minLevel,
      maxLevel
    });
    
    const candidates = matchResult?.fish || [];
    
    if (candidates.length === 0) {
      return res.status(404).json({
        success: false,
        error: '未找到合适的对手',
        message: '请尝试降低匹配要求或稍后再试'
      });
    }
    
    // 4. 选择战斗力最接近的对手
    const myBattlePower = myFish.battle_power || 0;
    candidates.sort((a, b) => {
      const diffA = Math.abs((a.battle_power || 0) - myBattlePower);
      const diffB = Math.abs((b.battle_power || 0) - myBattlePower);
      return diffA - diffB;
    });
    
    const opponent = candidates[0];
    
    // 5. 返回匹配结果
    return res.json({
      success: true,
      data: {
        myFish: {
          id: myFish.id,
          name: myFish.artist || 'Anonymous',
          level: myFish.level,
          battlePower: myFish.battle_power || 0
        },
        opponent: {
          id: opponent.id,
          fishId: opponent.id,
          name: opponent.artist || 'Anonymous',
          level: opponent.level,
          battlePower: opponent.battle_power || 0,
          health: opponent.health,
          maxHealth: opponent.max_health
        },
        matchInfo: {
          levelDiff: Math.abs(myFish.level - opponent.level),
          powerDiff: Math.abs((myFish.battle_power || 0) - (opponent.battle_power || 0)),
          totalCandidates: candidates.length
        }
      }
    });
    
  } catch (error) {
    console.error('匹配对手失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

