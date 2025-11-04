/**
 * 提交新鱼API
 * POST /api/fish/submit
 * Body: { userId, imageUrl, artist }
 * 
 * 功能：
 * 1. 验证用户身份
 * 2. 检查鱼食余额（需要2个鱼食）
 * 3. 生成随机天赋值（25-75）
 * 4. 创建鱼记录
 * 5. 扣除鱼食
 * 6. 记录经济日志
 */

require('dotenv').config({ path: '.env.local' });

const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

// 检查环境变量配置
console.log('\n=== Hasura配置检查 ===');
console.log('HASURA_GRAPHQL_ENDPOINT:', HASURA_GRAPHQL_ENDPOINT || '未设置');
console.log('HASURA_ADMIN_SECRET:', HASURA_ADMIN_SECRET ? '已设置' : '未设置');
console.log('========================\n');

// 验证Hasura配置
if (!HASURA_GRAPHQL_ENDPOINT) {
  console.error('❌ 错误：HASURA_GRAPHQL_ENDPOINT 未设置');
  console.error('请在 .env.local 文件中设置：');
  console.error('HASURA_GRAPHQL_ENDPOINT=https://your-project.hasura.app/v1/graphql');
}

if (!HASURA_ADMIN_SECRET) {
  console.error('❌ 错误：HASURA_ADMIN_SECRET 未设置');
  console.error('请在 .env.local 文件中设置：');
  console.error('HASURA_ADMIN_SECRET=your-admin-secret');
}

// 创建新鱼消耗的鱼食数量
const CREATE_COST = 2;

async function queryHasura(query, variables = {}) {
  if (!HASURA_GRAPHQL_ENDPOINT || !HASURA_ADMIN_SECRET) {
    throw new Error('Hasura配置缺失，请检查 .env.local 文件');
  }

  console.log('发送GraphQL请求到:', HASURA_GRAPHQL_ENDPOINT);
  console.log('查询变量:', JSON.stringify(variables, null, 2));

  const response = await fetch(HASURA_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET
    },
    body: JSON.stringify({ query, variables })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('HTTP错误:', response.status, response.statusText);
    console.error('响应内容:', errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  console.log('GraphQL响应:', JSON.stringify(result, null, 2));
  
  if (result.errors) {
    console.error('Hasura错误:', result.errors);
    throw new Error(result.errors[0].message);
  }
  
  return result.data;
}

/**
 * 获取天赋评级
 */
function getTalentRating(talent) {
  if (talent >= 70) return { grade: 'S', color: '#FFD700', text: '传说' };
  if (talent >= 60) return { grade: 'A', color: '#9370DB', text: '卓越' };
  if (talent >= 50) return { grade: 'B', color: '#4169E1', text: '优秀' };
  if (talent >= 40) return { grade: 'C', color: '#32CD32', text: '良好' };
  return { grade: 'D', color: '#808080', text: '普通' };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { userId, imageUrl, artist } = req.body;
    
    // 验证参数
    if (!userId || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: '缺少必填字段：userId 或 imageUrl'
      });
    }
    
    // 验证imageUrl格式
    if (!imageUrl.startsWith('http')) {
      return res.status(400).json({
        success: false,
        error: '无效的图片URL'
      });
    }
    
    // 1. 获取或创建用户经济数据
    const getOrCreateEconomyQuery = `
      query GetOrCreateEconomy($userId: String!) {
        user_economy_by_pk(user_id: $userId) {
          user_id
          fish_food
        }
      }
    `;
    
    let economyData = await queryHasura(getOrCreateEconomyQuery, { userId });
    
    // 如果用户经济数据不存在，创建一个
    if (!economyData.user_economy_by_pk) {
      const createEconomyQuery = `
        mutation CreateEconomy($userId: String!) {
          insert_user_economy_one(object: { user_id: $userId, fish_food: 10 }) {
            user_id
            fish_food
          }
        }
      `;
      
      economyData = await queryHasura(createEconomyQuery, { userId });
      economyData.user_economy_by_pk = economyData.insert_user_economy_one;
    }
    
    const economy = economyData.user_economy_by_pk;
    
    // 2. 检查鱼食余额
    if (economy.fish_food < CREATE_COST) {
      return res.json({
        success: false,
        insufficientFunds: true,
        message: '鱼食不足，无法创建新鱼',
        current: economy.fish_food,
        required: CREATE_COST
      });
    }
    
    // 3. 生成随机天赋值（25-75）
    const talent = Math.floor(Math.random() * 51) + 25;
    
    // 4. 执行事务：创建鱼 + 扣除鱼食 + 记录日志
    const transactionQuery = `
      mutation SubmitFish(
        $userId: String!
        $imageUrl: String!
        $artist: String!
        $talent: Int!
      ) {
        insert_fish_one(
          object: {
            user_id: $userId
            image_url: $imageUrl
            artist: $artist
            talent: $talent
            level: 1
            experience: 0
            health: 10
            max_health: 10
            upvotes: 0
            downvotes: 0
            battle_power: 0
            is_alive: true
            is_approved: true
            is_in_battle_mode: false
            position_row: 0
            total_wins: 0
            total_losses: 0
          }
        ) {
          id
          user_id
          image_url
          artist
          talent
          level
          health
          max_health
          created_at
        }
        
        update_user_economy_by_pk(
          pk_columns: { user_id: $userId }
          _inc: { fish_food: -2 total_spent: 2 }
        ) {
          fish_food
        }
      }
    `;
    
    const result = await queryHasura(transactionQuery, {
      userId,
      imageUrl,
      artist: artist || 'Anonymous',
      talent
    });
    
    const newFish = result.insert_fish_one;
    const newBalance = result.update_user_economy_by_pk.fish_food;
    
    // 5. 记录经济日志（单独查询，因为需要鱼ID）
    const logQuery = `
      mutation LogEconomy($userId: String!, $fishId: uuid!, $amount: Int!, $balance: Int!) {
        insert_economy_log_one(
          object: {
            user_id: $userId,
            fish_id: $fishId,
            action: "create",
            amount: $amount,
            balance_after: $balance
          }
        ) {
          id
        }
      }
    `;
    
    await queryHasura(logQuery, {
      userId,
      fishId: newFish.id,
      amount: -CREATE_COST,
      balance: newBalance
    });
    
    // 6. 返回成功结果
    return res.json({
      success: true,
      message: '创建成功！',
      fish: {
        id: newFish.id,
        imageUrl: newFish.image_url,
        artist: newFish.artist,
        talent: newFish.talent,
        level: newFish.level,
        health: newFish.health,
        maxHealth: newFish.max_health,
        createdAt: newFish.created_at
      },
      economy: {
        fishFood: newBalance,
        spent: CREATE_COST
      },
      talentRating: getTalentRating(talent)
    });
    
  } catch (error) {
    console.error('创建鱼失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



