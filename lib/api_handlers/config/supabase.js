/**
 * Supabase 公开配置API
 * GET /api/config/supabase
 * 
 * 返回客户端所需的Supabase配置
 * 
 * 注意：在 Vercel 中，环境变量通过 Dashboard 配置，不需要 dotenv
 */

module.exports = async function handler(req, res) {
  console.log('[Supabase Config] Handler called');
  console.log('[Supabase Config] Request method:', req.method);
  console.log('[Supabase Config] NODE_ENV:', process.env.NODE_ENV);
  
  // 只允许GET请求
  if (req.method !== 'GET') {
    console.log('[Supabase Config] Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    // 从环境变量读取配置（在 Vercel 上直接从 process.env 读取）
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    console.log('[Supabase Config] Checking environment variables...');
    console.log('[Supabase Config] SUPABASE_URL:', supabaseUrl ? `✅ Set (${supabaseUrl.substring(0, 30)}...)` : '❌ Missing');
    console.log('[Supabase Config] SUPABASE_ANON_KEY:', supabaseAnonKey ? `✅ Set (${supabaseAnonKey.substring(0, 20)}...)` : '❌ Missing');
    
    // 列出所有环境变量（仅用于调试，不输出敏感值）
    if (process.env.NODE_ENV === 'development') {
      console.log('[Supabase Config] Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    }

    // 检查配置是否存在
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase配置未设置');
      console.error('请在环境变量中设置：');
      console.error('  SUPABASE_URL=https://your-project.supabase.co');
      console.error('  SUPABASE_ANON_KEY=your-anon-key');
      console.error('在 Vercel 上，请在项目设置中配置这些环境变量');
      
      return res.status(500).json({
        error: 'Supabase配置未设置',
        message: '请在环境变量中配置 SUPABASE_URL 和 SUPABASE_ANON_KEY。在 Vercel 上，请在项目设置中配置这些环境变量。'
      });
    }

    // 验证 URL 格式
    try {
      new URL(supabaseUrl);
    } catch (urlError) {
      console.error('❌ Invalid SUPABASE_URL format:', supabaseUrl);
      return res.status(500).json({
        error: 'Invalid Supabase URL format',
        message: 'SUPABASE_URL must be a valid HTTP or HTTPS URL'
      });
    }

    // 返回公开配置（ANON_KEY是公开的，可以安全地返回给客户端）
    console.log('[Supabase Config] ✅ Configuration loaded successfully');
    return res.status(200).json({
      url: supabaseUrl,
      anonKey: supabaseAnonKey
    });
  } catch (error) {
    console.error('❌ 获取Supabase配置失败:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({
      error: '服务器错误',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};





























