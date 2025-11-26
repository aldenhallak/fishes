/**
 * 独白配置 API
 * GET /api/config/mono-chat
 * 
 * 返回独白功能配置
 * �?MONO_CHAT = ON 时，默认开启独白；= OFF 时默认关�? */

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

  try {
    // 从环境变量读取独白模式（默认 OFF�?    const monoChatMode = process.env.MONO_CHAT || 'OFF';
    const isEnabled = monoChatMode.toUpperCase() === 'ON';

    console.log('🗣�?Mono chat config requested');
    console.log(`   Mode: ${monoChatMode} (enabled: ${isEnabled})`);

    return res.status(200).json({
      monoChatMode: monoChatMode,
      enabled: isEnabled
    });
  } catch (error) {
    console.error('获取独白配置失败:', error);
    return res.status(500).json({
      error: '服务器错�?,
      details: error.message
    });
  }
};


