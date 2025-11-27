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
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }
  
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    console.log('[Test Supabase] SUPABASE_URL exists:', !!supabaseUrl);
    console.log('[Test Supabase] SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      res.writeHead(500);
      return res.end(JSON.stringify({
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
      }));
    }
    
    res.writeHead(200);
    return res.end(JSON.stringify({
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      success: true
    }));
  } catch (error) {
    console.error('[Test Supabase] Error:', error);
    res.writeHead(500);
    return res.end(JSON.stringify({
      error: error.message,
      stack: error.stack
    }));
  }
};

