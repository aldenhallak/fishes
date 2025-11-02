/**
 * Supabase 认证配置
 * 替换原有的Firebase认证系统
 */

// 注意：在浏览器环境中使用CDN引入的@supabase/supabase-js
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// 从环境变量或全局配置读取（生产环境从Vercel环境变量注入）
const SUPABASE_URL = window.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// 创建Supabase客户端
const supabase = window.supabase?.createClient 
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!supabase) {
  console.error('⚠️ Supabase SDK未加载，请确保引入了CDN脚本');
}

// ====================================
// 认证相关函数
// ====================================

/**
 * 用户注册
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 * @returns {Promise<{data, error}>}
 */
async function signUp(email, password) {
  if (!supabase) return { data: null, error: new Error('Supabase未初始化') };
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/index.html`
      }
    });
    
    if (error) throw error;
    
    console.log('✅ 注册成功:', data.user?.email);
    return { data, error: null };
  } catch (error) {
    console.error('❌ 注册失败:', error.message);
    return { data: null, error };
  }
}

/**
 * 用户登录
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 * @returns {Promise<{data, error}>}
 */
async function signIn(email, password) {
  if (!supabase) return { data: null, error: new Error('Supabase未初始化') };
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    console.log('✅ 登录成功:', data.user?.email);
    return { data, error: null };
  } catch (error) {
    console.error('❌ 登录失败:', error.message);
    return { data: null, error };
  }
}

/**
 * 用户登出
 * @returns {Promise<{error}>}
 */
async function signOut() {
  if (!supabase) return { error: new Error('Supabase未初始化') };
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    console.log('✅ 登出成功');
    return { error: null };
  } catch (error) {
    console.error('❌ 登出失败:', error.message);
    return { error };
  }
}

/**
 * 获取当前登录用户
 * @returns {Promise<User|null>}
 */
async function getCurrentUser() {
  if (!supabase) return null;
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('❌ 获取用户失败:', error.message);
    return null;
  }
}

/**
 * 获取当前会话
 * @returns {Promise<Session|null>}
 */
async function getSession() {
  if (!supabase) return null;
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('❌ 获取会话失败:', error.message);
    return null;
  }
}

/**
 * 监听认证状态变化
 * @param {Function} callback - 回调函数 (event, session) => {}
 * @returns {Object} 取消订阅的对象
 */
function onAuthStateChange(callback) {
  if (!supabase) {
    console.warn('⚠️ Supabase未初始化，无法监听认证状态');
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔔 认证状态变化:', event, session?.user?.email);
    callback(event, session);
  });
  
  return data;
}

/**
 * 发送密码重置邮件
 * @param {string} email - 邮箱
 * @returns {Promise<{data, error}>}
 */
async function resetPasswordForEmail(email) {
  if (!supabase) return { data: null, error: new Error('Supabase未初始化') };
  
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`
    });
    
    if (error) throw error;
    
    console.log('✅ 密码重置邮件已发送');
    return { data, error: null };
  } catch (error) {
    console.error('❌ 发送密码重置邮件失败:', error.message);
    return { data: null, error };
  }
}

/**
 * 更新密码
 * @param {string} newPassword - 新密码
 * @returns {Promise<{data, error}>}
 */
async function updatePassword(newPassword) {
  if (!supabase) return { data: null, error: new Error('Supabase未初始化') };
  
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    console.log('✅ 密码更新成功');
    return { data, error: null };
  } catch (error) {
    console.error('❌ 密码更新失败:', error.message);
    return { data: null, error };
  }
}

/**
 * 获取访问令牌（用于API调用）
 * @returns {Promise<string|null>}
 */
async function getAccessToken() {
  const session = await getSession();
  return session?.access_token || null;
}

// ====================================
// 辅助函数
// ====================================

/**
 * 检查用户是否已登录
 * @returns {Promise<boolean>}
 */
async function isLoggedIn() {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * 要求用户登录（如果未登录则跳转）
 * @param {string} redirectUrl - 登录后返回的URL
 */
async function requireAuth(redirectUrl) {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    const returnUrl = redirectUrl || window.location.href;
    window.location.href = `/login.html?returnUrl=${encodeURIComponent(returnUrl)}`;
  }
}

/**
 * 获取用户显示名称
 * @returns {Promise<string>}
 */
async function getUserDisplayName() {
  const user = await getCurrentUser();
  if (!user) return 'Anonymous';
  
  // 优先使用 user_metadata 中的 name
  if (user.user_metadata?.name) {
    return user.user_metadata.name;
  }
  
  // 否则使用邮箱前缀
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'User';
}

// ====================================
// 导出到全局
// ====================================

window.supabaseAuth = {
  // 客户端
  client: supabase,
  
  // 认证函数
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getSession,
  onAuthStateChange,
  resetPasswordForEmail,
  updatePassword,
  getAccessToken,
  
  // 辅助函数
  isLoggedIn,
  requireAuth,
  getUserDisplayName
};

// 兼容性：保留一些旧的全局变量名
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;

console.log('✅ Supabase认证模块已加载');

