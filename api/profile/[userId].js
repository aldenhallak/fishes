/**
 * 更新用户配置文件 API
 * PUT /api/profile/{userId}
 *
 * 功能：
 * 1. 验证用户 token
 * 2. 更新用户显示名称（displayName）
 * 3. 返回更新结果
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 初始化 Supabase 客户端
let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

async function queryHasura(query, variables = {}) {
  if (!HASURA_GRAPHQL_ENDPOINT || !HASURA_ADMIN_SECRET) {
    throw new Error('Hasura配置缺失，请检查 .env.local 文件');
  }

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
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

/**
 * 验证用户token并获取用户信息
 */
async function getUserFromToken(token) {
  if (!supabase) {
    throw new Error('Supabase未配置');
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new Error('无效的token');
  }

  return data.user;
}

module.exports = async function handler(req, res) {
  // 只接受 PUT 方法
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. 获取并验证token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '未授权：缺少token'
      });
    }

    const token = authHeader.substring(7);
    const user = await getUserFromToken(token);
    const authenticatedUserId = user.id;

    // 2. 获取URL中的userId
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '缺少用户ID'
      });
    }

    // 3. 验证用户只能更新自己的配置文件
    if (decodeURIComponent(userId) !== authenticatedUserId) {
      return res.status(403).json({
        success: false,
        error: '无权限：只能更新自己的配置文件'
      });
    }

    // 4. 获取请求体中的数据
    const { displayName } = req.body;

    if (!displayName || !displayName.trim()) {
      return res.status(400).json({
        success: false,
        error: '显示名称不能为空'
      });
    }

    console.log('📝 更新用户配置文件，用户ID:', authenticatedUserId, '新名称:', displayName);

    // 5. 检查 users 表中是否有 display_name 字段
    const checkUserQuery = `
      query CheckUser($userId: String!) {
        users_by_pk(id: $userId) {
          id
          email
        }
      }
    `;

    const checkResult = await queryHasura(checkUserQuery, { userId: authenticatedUserId });
    
    if (!checkResult.users_by_pk) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    // 6. 更新用户的 display_name
    const updateMutation = `
      mutation UpdateUserDisplayName($userId: String!, $displayName: String!) {
        update_users_by_pk(
          pk_columns: { id: $userId },
          _set: { display_name: $displayName }
        ) {
          id
          email
          display_name
          created_at
        }
      }
    `;

    const updateResult = await queryHasura(updateMutation, {
      userId: authenticatedUserId,
      displayName: displayName.trim()
    });

    if (!updateResult.update_users_by_pk) {
      throw new Error('更新失败：用户不存在或无权限');
    }

    console.log('✅ 用户配置文件更新成功');

    return res.json({
      success: true,
      message: '配置文件更新成功',
      user: updateResult.update_users_by_pk
    });

  } catch (error) {
    console.error('❌ 更新用户配置文件失败:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '服务器错误',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

