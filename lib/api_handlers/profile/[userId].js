/**
 * 更新用户配置文件 API
 * PUT /api/profile/{userId}
 *
 * 功能：
 * 1. 简化验证用户ID
 * 2. 直接更新数据库
 * 3. 返回更新结果
 * 
 * 最后更新: 2025-11-25 18:52 - 移除feeder_name，简化验证
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔄 Profile API加载 - 版本: 2025-11-25 18:52 (无feeder_name)');

const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

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
 * 简化的用户验证 - 直接从数据库验证用户存在性
 */
async function validateUser(userId) {
  console.log('🔐 验证用户ID:', userId);

  // 直接查询数据库验证用户是否存在
  const checkUserQuery = `
    query CheckUser($userId: String!) {
      users_by_pk(id: $userId) {
        id
        email
      }
    }
  `;

  console.log('🔍 执行用户验证查询:', checkUserQuery);
  const result = await queryHasura(checkUserQuery, { userId });
  
  if (!result.users_by_pk) {
    console.error('❌ 用户不存在:', userId);
    throw new Error('用户不存在');
  }

  console.log('✅ 用户验证成功:', result.users_by_pk.id);
  return result.users_by_pk;
}

module.exports = async function handler(req, res) {
  // 支持 GET 和 PUT 方法
  if (req.method === 'GET') {
    // GET 方法：获取用户资料
    try {
      // 1. 获取URL中的userId
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: '缺少用户ID'
        });
      }

      const decodedUserId = decodeURIComponent(userId);
      
      // 2. 验证用户存在（简化验证）
      await validateUser(decodedUserId);

      // 4. 查询用户资料
      const getUserQuery = `
        query GetUserProfile($userId: String!) {
          users_by_pk(id: $userId) {
            id
            email
            nick_name
            user_language
            about_me
            fish_talk
            created_at
          }
        }
      `;

      console.log('🔍 执行获取用户资料查询:', getUserQuery);
      const userResult = await queryHasura(getUserQuery, { userId: decodedUserId });
      
      if (!userResult.users_by_pk) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      return res.json({
        success: true,
        user: userResult.users_by_pk
      });

    } catch (error) {
      console.error('❌ 获取用户配置文件失败:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        userId: req.query.userId
      });
      return res.status(500).json({
        success: false,
        error: error.message || '服务器错误',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. 获取URL中的userId
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '缺少用户ID'
      });
    }

    const decodedUserId = decodeURIComponent(userId);
    
    // 2. 验证用户存在（简化验证）
    await validateUser(decodedUserId);

      // 4. 获取请求体中的数据
      const { nick_name, user_language, about_me, fish_talk } = req.body;

      console.log('📝 收到的请求体数据:', {
        nick_name: nick_name,
        user_language: user_language,
        about_me: about_me,
        fish_talk: fish_talk,
        hasNickName: nick_name !== undefined,
        hasUserLanguage: user_language !== undefined,
        hasAboutMe: about_me !== undefined,
        hasFishTalk: fish_talk !== undefined
      });

    // 至少需要更新一个字段
    if (nick_name === undefined && user_language === undefined && about_me === undefined && fish_talk === undefined) {
      console.log('❌ 所有字段都是undefined，返回400错误');
      return res.status(400).json({
        success: false,
        error: '至少需要提供一个要更新的字段'
      });
    }

    console.log('📝 更新用户配置文件，用户ID:', decodedUserId, {
      nick_name,
      user_language,
      about_me,
      fish_talk
    });

    // 3. 构建更新对象
    const updateFields = {};
    if (nick_name !== undefined) {
      updateFields.nick_name = nick_name && nick_name.trim() ? nick_name.trim() : null;
    }
    if (user_language !== undefined) {
      updateFields.user_language = user_language && user_language.trim() ? user_language.trim() : null;
    }
    if (about_me !== undefined) {
      updateFields.about_me = about_me && about_me.trim() ? about_me.trim() : null;
    }
    if (fish_talk !== undefined) {
      updateFields.fish_talk = fish_talk;
    }

    // 7. 更新用户信息
    const updateMutation = `
      mutation UpdateUserProfile($userId: String!, $updateFields: users_set_input!) {
        update_users_by_pk(
          pk_columns: { id: $userId },
          _set: $updateFields
        ) {
          id
          email
          nick_name
          user_language
          about_me
          fish_talk
          created_at
        }
      }
    `;

    const updateResult = await queryHasura(updateMutation, {
      userId: decodedUserId,
      updateFields: updateFields
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

