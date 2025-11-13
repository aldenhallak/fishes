/**
 * 获取战斗模式中的鱼
 * GET /api/fish/get-battle-fish
 */

const hasura = require('../../lib/hasura');

module.exports = async (req, res) => {
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
    const { userId } = req.query;
    
    // 查询战斗模式中的所有鱼
    const queryStr = `
      query GetBattleFish($userId: String) {
        fish(
          where: {
            is_in_battle_mode: { _eq: true },
            is_alive: { _eq: true }
          },
          limit: 100,
          order_by: { battle_power: desc }
        ) {
          id
          user_id
          artist
          image_url
          talent
          level
          experience
          health
          max_health
          upvotes
          downvotes
          battle_power
          total_wins
          total_losses
        }
      }
    `;
    
    const data = await hasura.query(queryStr, { userId });
    
    // 标记当前用户的鱼
    const fish = data.fish.map(f => ({
      ...f,
      isOwn: f.user_id === userId
    }));
    
    return res.status(200).json({
      success: true,
      fish,
      count: fish.length
    });
    
  } catch (error) {
    console.error('获取战斗鱼失败:', error);
    return res.status(500).json({ 
      error: '服务器错误',
      message: error.message 
    });
  }
};

