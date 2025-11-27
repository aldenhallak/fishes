/**
 * 登录状态缓存管理模块
 * 优化登录状态检测，减少不必要的 API 调用
 */

class AuthCache {
  constructor() {
    // 内存缓存
    this.cache = {
      user: null,
      session: null,
      timestamp: 0,
      isValid: false
    };
    
    // 缓存配置
    this.config = {
      // 缓存有效期（5分钟）
      cacheExpiry: 5 * 60 * 1000,
      // Session 检查间隔（30秒）
      sessionCheckInterval: 30 * 1000,
      // localStorage 键名
      storageKeys: {
        user: 'auth_cache_user',
        session: 'auth_cache_session',
        timestamp: 'auth_cache_timestamp'
      }
    };
    
    // 定时器
    this.sessionCheckTimer = null;
    
    // 初始化
    this.init();
  }
  
  /**
   * 初始化缓存
   */
  init() {
    console.log('🔐 初始化登录状态缓存...');
    
    // 从 localStorage 恢复缓存
    this.restoreFromStorage();
    
    // 启动定期 session 检查
    this.startSessionCheck();
    
    // 监听 storage 事件（多标签页同步）
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('auth_cache_')) {
        console.log('🔄 检测到其他标签页的登录状态变化，重新加载缓存');
        this.restoreFromStorage();
      }
    });
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // 页面变为可见时，检查缓存是否过期
        if (this.isCacheExpired()) {
          console.log('📱 页面变为可见，缓存已过期，重新验证');
          this.refresh();
        }
      }
    });
  }
  
  /**
   * 从 localStorage 恢复缓存
   */
  restoreFromStorage() {
    try {
      const userStr = localStorage.getItem(this.config.storageKeys.user);
      const sessionStr = localStorage.getItem(this.config.storageKeys.session);
      const timestampStr = localStorage.getItem(this.config.storageKeys.timestamp);
      
      if (userStr && sessionStr && timestampStr) {
        const timestamp = parseInt(timestampStr, 10);
        const now = Date.now();
        
        // 检查缓存是否过期
        if (now - timestamp < this.config.cacheExpiry) {
          this.cache.user = JSON.parse(userStr);
          this.cache.session = JSON.parse(sessionStr);
          this.cache.timestamp = timestamp;
          this.cache.isValid = true;
          
          console.log('✅ 从 localStorage 恢复登录状态缓存', {
            userId: this.cache.user?.id,
            age: Math.round((now - timestamp) / 1000) + 's'
          });
          
          return true;
        } else {
          console.log('⏰ localStorage 中的缓存已过期');
          this.clearStorage();
        }
      }
    } catch (error) {
      console.error('❌ 恢复缓存失败:', error);
      this.clearStorage();
    }
    
    return false;
  }
  
  /**
   * 保存缓存到 localStorage
   */
  saveToStorage() {
    try {
      if (this.cache.isValid && this.cache.user && this.cache.session) {
        localStorage.setItem(this.config.storageKeys.user, JSON.stringify(this.cache.user));
        localStorage.setItem(this.config.storageKeys.session, JSON.stringify(this.cache.session));
        localStorage.setItem(this.config.storageKeys.timestamp, this.cache.timestamp.toString());
        
        console.log('💾 登录状态缓存已保存到 localStorage');
      }
    } catch (error) {
      console.error('❌ 保存缓存失败:', error);
    }
  }
  
  /**
   * 清除 localStorage 缓存
   */
  clearStorage() {
    localStorage.removeItem(this.config.storageKeys.user);
    localStorage.removeItem(this.config.storageKeys.session);
    localStorage.removeItem(this.config.storageKeys.timestamp);
  }
  
  /**
   * 检查缓存是否过期
   */
  isCacheExpired() {
    if (!this.cache.isValid) return true;
    
    const now = Date.now();
    const age = now - this.cache.timestamp;
    
    return age >= this.config.cacheExpiry;
  }
  
  /**
   * 获取缓存的用户信息（同步）
   * @returns {User|null}
   */
  getCachedUser() {
    if (this.cache.isValid && !this.isCacheExpired()) {
      return this.cache.user;
    }
    return null;
  }
  
  /**
   * 获取缓存的 session（同步）
   * @returns {Session|null}
   */
  getCachedSession() {
    if (this.cache.isValid && !this.isCacheExpired()) {
      return this.cache.session;
    }
    return null;
  }
  
  /**
   * 获取用户信息（带缓存）
   * @param {boolean} forceRefresh - 强制刷新
   * @returns {Promise<User|null>}
   */
  async getUser(forceRefresh = false) {
    // 如果缓存有效且未过期，直接返回缓存
    if (!forceRefresh && this.cache.isValid && !this.isCacheExpired()) {
      console.log('✅ 使用缓存的用户信息', { userId: this.cache.user?.id });
      return this.cache.user;
    }
    
    // 缓存无效或过期，从 Supabase 获取
    return await this.refresh();
  }
  
  /**
   * 获取 session（带缓存）
   * @param {boolean} forceRefresh - 强制刷新
   * @returns {Promise<Session|null>}
   */
  async getSession(forceRefresh = false) {
    // 如果缓存有效且未过期，直接返回缓存
    if (!forceRefresh && this.cache.isValid && !this.isCacheExpired()) {
      console.log('✅ 使用缓存的 session');
      return this.cache.session;
    }
    
    // 缓存无效或过期，从 Supabase 获取
    await this.refresh();
    return this.cache.session;
  }
  
  /**
   * 检查用户是否已登录（同步，使用缓存）
   * @returns {boolean}
   */
  isLoggedIn() {
    const user = this.getCachedUser();
    return !!user;
  }
  
  /**
   * 刷新缓存（从 Supabase 获取最新数据）
   * @returns {Promise<User|null>}
   */
  async refresh() {
    try {
      if (!window.supabaseAuth) {
        console.warn('⚠️ Supabase 未初始化');
        return null;
      }
      
      if (!window.supabaseAuth.client) {
        console.warn('⚠️ Supabase client 未初始化');
        return null;
      }
      
      console.log('🔄 刷新登录状态缓存...');
      
      // 直接调用 Supabase API，避免通过 getCurrentUser/getSession 造成递归
      const { data: { user }, error: userError } = await window.supabaseAuth.client.auth.getUser();
      const { data: { session }, error: sessionError } = await window.supabaseAuth.client.auth.getSession();
      
      if (userError || sessionError) {
        console.warn('⚠️ 刷新缓存失败:', userError || sessionError);
        this.clear();
        return null;
      }
      
      if (user && session) {
        // 更新缓存
        this.cache.user = user;
        this.cache.session = session;
        this.cache.timestamp = Date.now();
        this.cache.isValid = true;
        
        // 保存到 localStorage
        this.saveToStorage();
        
        // 同步到旧的 localStorage 键（兼容性）
        this.syncLegacyStorage(user, session);
        
        console.log('✅ 登录状态缓存已更新', { userId: user.id, email: user.email });
        
        return user;
      } else {
        // 用户未登录
        this.clear();
        return null;
      }
    } catch (error) {
      console.error('❌ 刷新缓存失败:', error);
      return null;
    }
  }
  
  /**
   * 同步到旧的 localStorage 键（兼容性）
   */
  syncLegacyStorage(user, session) {
    try {
      // 保存用户信息（兼容旧代码）
      const userData = {
        id: user.id,
        uid: user.id,
        userId: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        user_metadata: user.user_metadata
      };
      
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      if (session?.access_token) {
        localStorage.setItem('userToken', session.access_token);
      }
    } catch (error) {
      console.error('❌ 同步旧 localStorage 失败:', error);
    }
  }
  
  /**
   * 清除缓存
   */
  clear() {
    console.log('🗑️ 清除登录状态缓存');
    
    // 清除内存缓存
    this.cache.user = null;
    this.cache.session = null;
    this.cache.timestamp = 0;
    this.cache.isValid = false;
    
    // 清除 localStorage
    this.clearStorage();
    
    // 清除旧的 localStorage 键（兼容性）
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
  }
  
  /**
   * 启动定期 session 检查
   */
  startSessionCheck() {
    // 清除已存在的定时器
    if (this.sessionCheckTimer) {
      clearInterval(this.sessionCheckTimer);
    }
    
    // 启动新的定时器
    this.sessionCheckTimer = setInterval(async () => {
      // 只在缓存有效且页面可见时检查
      if (this.cache.isValid && !document.hidden) {
        console.log('⏰ 定期检查 session 有效性...');
        await this.refresh();
      }
    }, this.config.sessionCheckInterval);
    
    console.log('✅ 已启动定期 session 检查', {
      interval: this.config.sessionCheckInterval / 1000 + 's'
    });
  }
  
  /**
   * 停止定期 session 检查
   */
  stopSessionCheck() {
    if (this.sessionCheckTimer) {
      clearInterval(this.sessionCheckTimer);
      this.sessionCheckTimer = null;
      console.log('🛑 已停止定期 session 检查');
    }
  }
  
  /**
   * 销毁实例
   */
  destroy() {
    this.stopSessionCheck();
    this.clear();
  }
}

// 创建全局实例
window.authCache = new AuthCache();

// 导出到全局
window.AuthCache = AuthCache;

console.log('✅ 登录状态缓存模块已加载');
