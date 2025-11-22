/**
 * 提交新鱼API
 * POST /api/fish/submit
 * Body: { userId, imageUrl, artist, fishName, personality, userInfo }
 * 
 * 功能：
 * 1. 确保用户记录存在（如果不存在则自动创建）
 * 2. 检查每日画鱼限制（基于会员类型的draw_fish_limit）
 * 3. 创建鱼记录
 * 
 * 注意：战斗系统和经济系统已弃用
 */

require('dotenv').config({ path: '.env.local' });
const { canDrawFishToday } = require('../middleware/membership');

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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { userId, imageUrl, artist, fishName, personality } = req.body;
    
    console.log('\n📥 收到提交请求:');
    console.log('  userId:', userId);
    console.log('  imageUrl:', imageUrl);
    console.log('  artist:', artist);
    console.log('  fishName:', fishName);
    console.log('  personality:', personality);
    
    // 验证参数
    if (!userId || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: '缺少必填字段：userId 或 imageUrl'
      });
    }
    
    // 验证鱼名字（可选，但如果提供则验证）
    if (fishName && fishName.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Fish name too long (max 50 characters)'
      });
    }
    
    // 验证imageUrl格式
    if (!imageUrl.startsWith('http')) {
      return res.status(400).json({
        success: false,
        error: '无效的图片URL'
      });
    }
    
    // 1. 确保用户记录存在（如果不存在则创建）
    const checkUserQuery = `
      query CheckUser($userId: String!) {
        users_by_pk(id: $userId) {
          id
          email
        }
      }
    `;
    
    let userData = await queryHasura(checkUserQuery, { userId });
    
    // 如果用户不存在，创建用户记录
    if (!userData.users_by_pk) {
      console.log('用户不存在，创建新用户记录:', userId);
      const createUserQuery = `
        mutation CreateUser($userId: String!) {
          insert_users_one(
            object: { 
              id: $userId, 
              email: "${userId}@test.local",
              nick_name: "测试用户",
              is_banned: false
            }
          ) {
            id
            email
          }
        }
      `;
      
      userData = await queryHasura(createUserQuery, { userId });
    }
    
    // 2. 检查每日画鱼限制（基于会员类型的draw_fish_limit）
    const dailyCheck = await canDrawFishToday(userId);
    if (!dailyCheck.canCreate) {
      return res.status(403).json({
        success: false,
        error: 'Daily drawing limit reached',
        message: dailyCheck.reason,
        tier: dailyCheck.tier,
        currentCount: dailyCheck.currentCount,
        maxLimit: dailyCheck.maxLimit
      });
    }
    
    // 3. 创建鱼记录
    console.log('  步骤4: 创建鱼记录...');
    const createFishQuery = `
      mutation SubmitFish(
        $userId: String!
        $imageUrl: String!
        $artist: String!
        $fishName: String
        $personality: String
      ) {
        insert_fish_one(
          object: {
            user_id: $userId
            image_url: $imageUrl
            artist: $artist
            fish_name: $fishName
            personality: $personality
            upvotes: 0
            is_approved: true
            report_count: 0
            reported: false
          }
        ) {
          id
          user_id
          image_url
          artist
          fish_name
          personality
          upvotes
          created_at
        }
      }
    `;
    
    const result = await queryHasura(createFishQuery, {
      userId,
      imageUrl,
      artist: artist || 'Anonymous',
      fishName: fishName || null,
      personality: personality || null
    });
    
    const newFish = result.insert_fish_one;
    
    console.log('✅ 鱼创建成功！');
    console.log('  ID:', newFish.id);
    console.log('  名字:', newFish.fish_name);
    console.log('  个性:', newFish.personality);
    
    // 4. 返回成功结果
    return res.json({
      success: true,
      message: '创建成功！',
      fish: {
        id: newFish.id,
        imageUrl: newFish.image_url,
        artist: newFish.artist,
        fishName: newFish.fish_name,
        personality: newFish.personality,
        upvotes: newFish.upvotes,
        createdAt: newFish.created_at
      }
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



