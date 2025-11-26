/**
 * 简单的 Supabase 配置测试端点
 * GET /api/test-supabase
 */

module.exports = async function handler(req, res) {
  console.log('[Test Supabase] Handler called');
  console.log('[Test Supabase] Method:', req.method);
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    console.log('[Test Supabase] SUPABASE_URL exists:', !!supabaseUrl);
    console.log('[Test Supabase] SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
      });
    }
    
    return res.status(200).json({
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      success: true
    });
  } catch (error) {
    console.error('[Test Supabase] Error:', error);
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

