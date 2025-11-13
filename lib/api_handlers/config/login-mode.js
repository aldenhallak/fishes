/**
 * 登录模式配置 API
 * GET /api/config/login-mode
 * 
 * 返回登录模式配置（仅限开发环境）
 * 当 LOGIN_MODE=AUTO 时，返回自动登录凭据
 */

require('dotenv').config({ path: '.env.local' });

module.exports = async function handler(req, res) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // 仅在开发环境提供（允许未设置 NODE_ENV 的情况，视为开发环境）
  // 只有在明确设置为 'production' 时才拒绝
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      error: 'Login mode config not available in production' 
    });
  }
  
  // 检查是否为本地环境（额外安全措施）
  const hostname = req.headers.host || '';
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('::1');
  if (!isLocalhost && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      error: 'Login mode config only available in localhost' 
    });
  }

  try {
    // 从环境变量读取登录模式
    const loginMode = process.env.LOGIN_MODE || 'MANUAL';
    
    // 读取用户凭据（兼容 DEF_USER 和 DEF_USE）
    const email = process.env.DEF_USER || process.env.DEF_USE || null;
    const password = process.env.DEF_PASS || null;

    console.log('🔐 Login mode config requested');
    console.log(`   Mode: ${loginMode}`);
    console.log(`   Email: ${email ? '***' : 'not set'}`);

    return res.status(200).json({
      loginMode: loginMode,
      email: email,
      password: password,
      autoLoginEnabled: loginMode === 'AUTO' && email && password
    });
  } catch (error) {
    console.error('获取登录模式配置失败:', error);
    return res.status(500).json({
      error: '服务器错误',
      details: error.message
    });
  }
};

