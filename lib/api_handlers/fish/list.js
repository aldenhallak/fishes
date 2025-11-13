/**
 * 获取鱼列表API
 * GET /api/fish/list?sort=hot&limit=20&offset=0&userId=xxx
 * 
 * 支持的排序方式：
 * - hot: 热门（点赞-点踩）
 * - recent: 最新
 * - top: 最高点赞
 * - controversial: 争议（点赞和点踩都多）
 * - random: 随机
 */

require('dotenv').config({ path: '.env.local' });

// Hasura客户端使用fetch（Vercel环境支持）
const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

async function queryHasura(query, variables = {}) {
  const response = await fetch(HASURA_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET
    },
    body: JSON.stringify({ query, variables })
  });
  
  const result = await response.json();
  
  if (result.errors) {
    console.error('Hasura错误:', result.errors);
    throw new Error(result.errors[0].message);
  }
  
  return result.data;
}

function getOrderBy(sort) {
  switch (sort) {
    case 'hot':
      // 按分数排序（点赞-点踩）
      return [{ upvotes: 'desc' }, { downvotes: 'asc' }];
    
    case 'recent':
      // 按创建时间排序
      return [{ created_at: 'desc' }];
    
    case 'top':
      // 按点赞数排序
      return [{ upvotes: 'desc' }];
    
    case 'controversial':
      // 争议：点赞和点踩都多的
      return [{ upvotes: 'desc' }, { downvotes: 'desc' }];
    
    case 'random':
      // 随机（使用UUID排序实现简单随机）
      return [{ id: 'asc' }]; // 实际使用时应该用RANDOM()
    
    default:
      return [{ created_at: 'desc' }];
  }
}

module.exports = async function handler(req, res) {
  // 允许GET和POST请求
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // 获取参数（支持query string和body）
    const params = req.method === 'GET' ? req.query : req.body;
    const {
      sort = 'recent',
      limit = 20,
      offset = 0,
      userId = null
    } = params;
    
    // 验证参数
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    
    if (limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ 
        error: 'Invalid limit (must be 1-100)' 
      });
    }
    
    // 构建查询
    const orderBy = getOrderBy(sort);
    
    // 构建where条件
    const whereCondition = {
      is_approved: { _eq: true },
      reported: { _eq: false }
    };
    
    // 如果指定了userId，只查询该用户的鱼
    if (userId) {
      whereCondition.user_id = { _eq: userId };
    }
    
    // 特殊处理：random排序需要不同的查询
    let query;
    if (sort === 'random') {
      query = `
        query GetRandomFish($limit: Int!, $where: fish_bool_exp!) {
          fish(
            limit: $limit,
            where: $where,
            order_by: {id: asc}
          ) {
            id
            user_id
            image_url
            artist
            created_at
            talent
            level
            experience
            health
            max_health
            upvotes
            downvotes
            battle_power
            is_alive
            is_in_battle_mode
            position_row
            total_wins
            total_losses
          }
        }
      `;
    } else {
      query = `
        query GetFish($limit: Int!, $offset: Int!, $where: fish_bool_exp!, $orderBy: [fish_order_by!]) {
          fish(
            limit: $limit,
            offset: $offset,
            where: $where,
            order_by: $orderBy
          ) {
            id
            user_id
            image_url
            artist
            created_at
            talent
            level
            experience
            health
            max_health
            upvotes
            downvotes
            battle_power
            is_alive
            is_in_battle_mode
            position_row
            total_wins
            total_losses
          }
          
          fish_aggregate(where: $where) {
            aggregate {
              count
            }
          }
        }
      `;
    }
    
    // 执行查询
    const variables = {
      limit: limitNum,
      offset: offsetNum,
      where: whereCondition,
      orderBy: orderBy
    };
    
    const data = await queryHasura(query, variables);
    
    // random排序的后处理：打乱数组
    if (sort === 'random' && data.fish) {
      data.fish = data.fish
        .sort(() => Math.random() - 0.5)
        .slice(0, limitNum);
    }
    
    // 返回结果
    return res.json({
      success: true,
      fish: data.fish || [],
      total: data.fish_aggregate?.aggregate?.count || data.fish?.length || 0,
      limit: limitNum,
      offset: offsetNum,
      hasMore: data.fish?.length === limitNum
    });
    
  } catch (error) {
    console.error('获取鱼列表失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



