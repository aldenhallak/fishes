/**
 * 测试凭据配置 API
 * GET /api/config/test-credentials
 * 
 * 返回开发环境的测试账号信息（仅�?localhost�? */

// 在本地开发环境加�?.env.local，在生产环境（Vercel）直接从 process.env 读取
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (error) {
    // .env.local 文件不存在时忽略错误
  }
}

module.exports = async function handler(req, res) {
  // 只允�?GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // 仅在开发环境提供测试凭�?  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      error: 'Test credentials not available in production' 
    });
  }

  try {
    // 从环境变量读取测试凭据（兼容 DEF_USER �?DEF_USE�?    const email = process.env.DEF_USER || process.env.DEF_USE || 'test@example.com';
    const password = process.env.DEF_PASS || 'test123456';

    console.log('🧪 Providing test credentials for development');

    return res.status(200).json({
      email,
      password
    });
  } catch (error) {
    console.error('获取测试凭据失败:', error);
    return res.status(500).json({
      error: '服务器错�?,
      details: error.message
    });
  }
};


