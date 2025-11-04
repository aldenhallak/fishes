/**
 * 战斗历史API
 * GET /api/battle/history?fishId=xxx
 * 查询指定鱼的战斗历史记录
 */

require('dotenv').config({ path: '.env.local' });
const hasura = require('../../lib/hasura');

module.exports = async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { fishId, limit = '20' } = req.query;
    
    if (!fishId) {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数：fishId'
      });
    }
    
    // 查询战斗历史
    const query = `
      query GetBattleHistory($fishId: uuid!, $limit: Int!) {
        battle_log(
          where: {
            _or: [
              { attacker_id: { _eq: $fishId } },
              { defender_id: { _eq: $fishId } }
            ]
          }
          order_by: { created_at: desc }
          limit: $limit
        ) {
          id
          attacker_id
          defender_id
          winner_id
          attacker_power
          defender_power
          exp_gained
          health_lost
          created_at
          attacker {
            id
            artist
            level
          }
          defender {
            id
            artist
            level
          }
          winner {
            id
            artist
          }
        }
      }
    `;
    
    const result = await hasura.query(query, {
      fishId,
      limit: parseInt(limit)
    });
    
    const battles = result?.battle_log || [];
    
    // 格式化返回数据
    const formattedBattles = battles.map(battle => ({
      id: battle.id,
      attacker_id: battle.attacker_id,
      defender_id: battle.defender_id,
      winner_id: battle.winner_id,
      attacker_name: battle.attacker?.artist || '未知',
      defender_name: battle.defender?.artist || '未知',
      winner_name: battle.winner?.artist || '平局',
      attacker_power: battle.attacker_power,
      defender_power: battle.defender_power,
      exp_gained: battle.exp_gained,
      health_lost: battle.health_lost,
      created_at: battle.created_at,
      result: battle.winner_id === fishId ? 'win' : 
              (battle.winner_id === null ? 'draw' : 'lose')
    }));
    
    // 统计数据
    const stats = {
      total: formattedBattles.length,
      wins: formattedBattles.filter(b => b.result === 'win').length,
      losses: formattedBattles.filter(b => b.result === 'lose').length,
      draws: formattedBattles.filter(b => b.result === 'draw').length
    };
    
    return res.json({
      success: true,
      data: formattedBattles,
      stats
    });
    
  } catch (error) {
    console.error('查询战斗历史失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

