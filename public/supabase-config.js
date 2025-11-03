/**
 * Supabase 公开配置
 * 在HTML中直接引入，设置全局配置
 * 
 * 使用方法：
 * <script src="/supabase-config.js"></script>
 * <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 * <script src="/src/js/supabase-init.js"></script>
 */

// 这些值在生产环境由Vercel自动注入
// 开发环境需要手动配置
window.SUPABASE_URL = 'YOUR_SUPABASE_URL';
window.SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// 提示：请在部署前替换上面的值，或通过Vercel环境变量注入
console.log('📝 Supabase配置已加载，请确保已设置正确的URL和KEY');



