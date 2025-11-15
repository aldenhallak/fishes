/**
 * Hasura配置API
 * GET /api/config-api?action=hasura
 * 
 * 返回Hasura GraphQL端点和Admin Secret（仅限前端使用，不暴露敏感信息）
 */

require('dotenv').config({ path: '.env.local' });

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const hasuraEndpoint = process.env.HASURA_GRAPHQL_ENDPOINT;
    const hasuraAdminSecret = process.env.HASURA_ADMIN_SECRET;

    if (!hasuraEndpoint) {
      return res.status(500).json({ 
        error: 'HASURA_GRAPHQL_ENDPOINT not configured' 
      });
    }

    // 只返回endpoint，不返回admin secret（前端不应该知道admin secret）
    // Admin secret应该只在后端使用
    res.status(200).json({
      endpoint: hasuraEndpoint,
      // 注意：admin secret不应该暴露给前端
      // 前端应该使用JWT token，而不是admin secret
      // 如果需要admin secret，应该通过后端API代理
      hasAdminSecret: !!hasuraAdminSecret
    });
  } catch (error) {
    console.error('Error getting Hasura config:', error);
    res.status(500).json({ error: 'Failed to get configuration' });
  }
};

