/**
 * Supabase 公开配置API
 * GET /api/config/supabase
 * 
 * 返回客户端所需的Supabase配置
 */

require('dotenv').config({ path: '.env.local' });

module.exports = async function handler(req, res) {
  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    // 从环境变量读取配置
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    // 检查配置是否存在
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase配置未设置');
      console.error('请在 .env.local 中设置：');
      console.error('  SUPABASE_URL=https://your-project.supabase.co');
      console.error('  SUPABASE_ANON_KEY=your-anon-key');
      
      return res.status(500).json({
        error: 'Supabase配置未设置',
        message: '请在 .env.local 文件中配置 SUPABASE_URL 和 SUPABASE_ANON_KEY'
      });
    }

    // 返回公开配置（ANON_KEY是公开的，可以安全地返回给客户端）
    return res.status(200).json({
      url: supabaseUrl,
      anonKey: supabaseAnonKey
    });
  } catch (error) {
    console.error('获取Supabase配置失败:', error);
    return res.status(500).json({
      error: '服务器错误',
      details: error.message
    });
  }
};






















