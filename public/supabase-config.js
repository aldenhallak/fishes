/**
 * Supabase 公开配置
 * 在HTML中直接引入，设置全局配置
 * 
 * 使用方法：
 * <script src="/supabase-config.js"></script>
 * <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 * <script src="/src/js/supabase-init.js"></script>
 */

// 开发环境：从API获取配置
// 生产环境：由Vercel自动注入环境变量
window.supabaseConfigReady = false;

(async function loadSupabaseConfig() {
  try {
    // 尝试从API获取配置
    const response = await fetch('/api/test-supabase');
    if (response.ok) {
      const config = await response.json();
      if (config.success) {
        window.SUPABASE_URL = config.url;
        window.SUPABASE_ANON_KEY = config.anonKey;
        console.log('✅ Supabase config loaded from API');
        window.supabaseConfigReady = true;
        window.dispatchEvent(new Event('supabaseConfigReady'));
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } else {
      throw new Error('Failed to load config from API');
    }
  } catch (error) {
    // 如果API加载失败，使用占位符（需要手动配置）
    console.warn('⚠️ Unable to load Supabase config:', error.message);
    console.warn('📝 Please configure environment variables or manually set window.SUPABASE_URL and window.SUPABASE_ANON_KEY');
    
    // 占位符
    window.SUPABASE_URL = window.SUPABASE_URL || 'YOUR_SUPABASE_URL';
    window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
    window.supabaseConfigReady = true;
    window.dispatchEvent(new Event('supabaseConfigReady'));
  }
})();



