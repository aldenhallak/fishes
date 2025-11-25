/**
 * 认证UI组件
 * 管理登录模态框和用户界面
 */

// 社交登录提供商配置
// 只显示已配置的提供商
const OAUTH_PROVIDERS = [
  { 
    id: 'google', 
    name: 'Google', 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
    color: '#4285F4',
    enabled: true
  },
  { 
    id: 'discord', 
    name: 'Discord', 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
    color: '#5865F2',
    enabled: true
  }
  // 暂时隐藏未配置的提供商
  // { 
  //   id: 'twitter', 
  //   name: 'X (Twitter)', 
  //   icon: `...`,
  //   color: '#000000',
  //   enabled: false
  // },
  // { 
  //   id: 'facebook', 
  //   name: 'Facebook', 
  //   icon: `...`,
  //   color: '#1877F2',
  //   enabled: false
  // },
  // { 
  //   id: 'apple', 
  //   name: 'Apple', 
  //   icon: `...`,
  //   color: '#000000',
  //   enabled: false
  // },
  // { 
  //   id: 'reddit', 
  //   name: 'Reddit', 
  //   icon: `...`,
  //   color: '#FF4500',
  //   enabled: false
  // }
];

class AuthUI {
  constructor() {
    this.currentUser = null;
    this.modal = null;
    this.userMenu = null;
    this.loginBtn = null;
    this.userContainer = null;
  }

  /**
   * 初始化认证UI
   */
  async init() {
    console.log('🔐 Initializing Auth UI...');
    
    // 立即创建UI元素（不等待Supabase）
    this.createLoginModal();
    this.createUserMenu();
    
    // 立即显示登录按钮（默认状态）
    this.showLoginButton();
    
    // 异步等待Supabase初始化并更新UI
    this.initializeAsync();
  }
  
  /**
   * 异步初始化（不阻塞UI显示）
   */
  async initializeAsync() {
    // 等待Supabase初始化
    await this.waitForSupabase();
    
    // 监听认证状态变化
    if (window.supabaseAuth) {
      window.supabaseAuth.onAuthStateChange((event, session) => {
        console.log('🔔 Auth state changed:', event, session?.user?.email || 'no user');
        // 传递 session 中的 user，避免重新获取
        this.updateAuthUI(session?.user || null);
      });
    }
    
    // 开发环境自动登录（如果设置了环境变量）
    await this.checkAutoLogin();
    
    // 初始化UI状态
    await this.updateAuthUI();
    
    // 监听页面可见性变化（移动端从登录页返回时）
    document.addEventListener('visibilitychange', async () => {
      if (!document.hidden) {
        // 页面变为可见时，重新检查登录状态
        console.log('📱 页面变为可见，重新检查登录状态');
        await this.updateAuthUI();
      }
    });
    
    // 监听页面焦点变化（移动端切换应用时）
    window.addEventListener('focus', async () => {
      console.log('📱 窗口获得焦点，重新检查登录状态');
      await this.updateAuthUI();
    });
  }

  /**
   * 等待Supabase初始化完成
   */
  async waitForSupabase(maxWaitMs = 3000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      if (window.supabaseAuth && window.supabaseAuth.client) {
        console.log(`✅ Supabase initialized successfully (${Date.now() - startTime}ms)`);
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.warn(`⚠️ Supabase initialization timeout after ${maxWaitMs}ms`);
    return false;
  }

  /**
   * 检查开发环境自动登录
   * 仅在主页（index.html 或根路径）执行自动登录
   */
  async checkAutoLogin() {
    // 检查 URL 中是否有 OAuth 回调参数（access_token, code 等）
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hasOAuthCallback = urlParams.has('code') || 
                            urlParams.has('access_token') || 
                            hashParams.has('access_token') ||
                            urlParams.has('error');
    
    if (hasOAuthCallback) {
      console.log('🔄 OAuth callback detected, skipping auto-login');
      return;
    }
    
    // 检查是否已登录
    const currentUser = await window.supabaseAuth?.getCurrentUser();
    if (currentUser) {
      console.log('✅ User already logged in, skipping auto-login');
      return;
    }

    // 仅在开发环境（localhost）检查自动登录
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.log('ℹ️ Auto-login only available in development (localhost)');
      return;
    }

    // 仅在主页执行自动登录
    const currentPath = window.location.pathname;
    const isIndexPage = currentPath === '/' || 
                        currentPath === '/index.html' || 
                        currentPath.endsWith('/index.html') ||
                        currentPath === '/index';
    
    if (!isIndexPage) {
      console.log('ℹ️ Auto-login only available on index page, current path:', currentPath);
      return;
    }

    try {
      console.log('🔍 Checking auto-login configuration...');
      
      // 从API获取登录模式配置
      const response = await fetch('/api/config-api?action=login-mode');
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch login mode config:', response.status, errorText);
        console.log('ℹ️ Could not fetch login mode config, skipping auto-login');
        return;
      }

      const config = await response.json();
      console.log('📋 Login mode config received:', { 
        loginMode: config.loginMode, 
        autoLoginEnabled: config.autoLoginEnabled,
        hasEmail: !!config.email,
        hasPassword: !!config.password
      });
      
      // 检查是否启用自动登录
      if (config.loginMode !== 'AUTO' || !config.autoLoginEnabled) {
        console.log('ℹ️ Auto-login disabled (LOGIN_MODE != AUTO or not enabled)');
        return;
      }

      if (!config.email || !config.password) {
        console.log('ℹ️ Auto-login credentials not configured (DEF_USER/DEF_PASS missing)');
        return;
      }

      console.log('🔧 Auto-login enabled (LOGIN_MODE=AUTO)');
      console.log('📧 Email:', config.email);
      
      // 等待Supabase初始化（最多等待5秒）
      console.log('⏳ Waiting for Supabase initialization...');
      const supabaseReady = await this.waitForSupabase(5000);
      if (!supabaseReady) {
        console.warn('⚠️ Supabase initialization timeout, cannot perform auto-login');
        console.warn('💡 This may be due to network issues preventing CDN from loading');
        console.warn('💡 Please check your internet connection and try refreshing the page');
        return;
      }
      
      console.log('✅ Supabase initialized, attempting auto-login...');
      
      // 执行自动登录
      const { data, error } = await window.supabaseAuth.client.auth.signInWithPassword({
        email: config.email,
        password: config.password
      });
      
      if (error) {
        console.error('❌ Auto-login failed:', error.message);
        console.error('❌ Error details:', error);
      } else {
        console.log('✅ Auto-login successful');
        
        // 存储用户信息
        if (data.user && data.session) {
          localStorage.setItem('userToken', data.session.access_token);
          localStorage.setItem('userData', JSON.stringify(data.user));
          console.log('💾 User data saved to localStorage');
        }
        
        // 检查是否有重定向URL（但不要从index跳转）
        const redirectUrl = localStorage.getItem('loginRedirect');
        const currentPath = window.location.pathname;
        const isOnIndex = currentPath.includes('index.html') || currentPath === '/';
        
        if (redirectUrl && redirectUrl !== window.location.href && !isOnIndex) {
          localStorage.removeItem('loginRedirect');
          window.location.href = redirectUrl;
        } else {
          // Clear redirect if on index page
          localStorage.removeItem('loginRedirect');
        }
      }
    } catch (error) {
      console.error('❌ Auto-login exception:', error);
      console.error('❌ Error stack:', error.stack);
      // 如果是Supabase未初始化错误，提供更友好的提示
      if (error.message && (error.message.includes('null') || error.message.includes('Cannot read'))) {
        console.warn('💡 Supabase SDK may not be loaded due to network issues');
        console.warn('💡 Please check your internet connection and try refreshing the page');
      }
    }
  }

  /**
   * 创建登录模态框
   */
  createLoginModal() {
    // 创建模态框容器
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'auth-modal';
    modal.style.display = 'none';
    
    modal.innerHTML = `
      <div class="auth-modal-overlay"></div>
      <div class="auth-modal-content has-title-banner">
        <div class="modal-title-banner">
          <h2>🐟 Sign in to FishTalk</h2>
        </div>
        <button class="modal-close-btn" aria-label="Close">&times;</button>
        <div class="modal-content-area">
          <div class="auth-modal-header">
            <p>Choose your preferred sign-in method</p>
          </div>
        <div class="auth-modal-body">
          <!-- 邮箱登录 -->
          <button class="oauth-btn email-login-btn" id="email-login-btn">
            <span class="oauth-btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </span>
            <span class="oauth-btn-text">Sign in with Email</span>
          </button>
          
          <!-- 分隔线 -->
          <div class="auth-divider">
            <span>or continue with</span>
          </div>
          
          <!-- OAuth 社交登录 -->
          ${OAUTH_PROVIDERS.map(provider => `
            <button class="oauth-btn oauth-btn-${provider.id}" data-provider="${provider.id}">
              <span class="oauth-btn-icon">${provider.icon}</span>
              <span class="oauth-btn-text">Sign in with ${provider.name}</span>
            </button>
          `).join('')}
        </div>
          <div class="auth-modal-footer">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.modal = modal;
    
    // 绑定事件
    this.bindModalEvents();
  }

  /**
   * 创建用户菜单
   */
  createUserMenu() {
    // 检查是否为tank页面，如果是则不创建用户菜单
    if (window.location.pathname.includes('tank.html') || 
        window.location.pathname.endsWith('/tank') ||
        document.title.includes('Fish Tank')) {
      console.log('🐟 Tank page detected, skipping user menu creation');
      return;
    }
    
    // 获取导航栏 - 支持多种类名和结构
    const navLinks = document.querySelector('.game-nav-links') || 
                     document.querySelector('.nav-links');
    if (!navLinks) {
      console.log('ℹ️ 未找到用户菜单容器，跳过用户菜单创建');
      return;
    }
    
    // 创建登录按钮
    const loginBtn = document.createElement('button');
    loginBtn.id = 'login-btn';
    loginBtn.className = 'game-btn game-btn-orange';
    loginBtn.innerHTML = `
      <span>👤</span>
      <span>Sign In</span>
    `;
    loginBtn.onclick = () => this.showLoginModal();
    
    // 创建用户容器
    const userContainer = document.createElement('div');
    userContainer.id = 'user-container';
    userContainer.className = 'user-container';
    userContainer.style.display = 'none';
    userContainer.innerHTML = `
      <button class="user-menu-trigger" aria-label="User menu">
        <span class="user-name"></span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="user-dropdown">
        <a href="profile.html" class="user-dropdown-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Profile
        </a>
        <a href="profile.html#messages" class="user-dropdown-item" id="messages-menu-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          Messages
        </a>
        <button class="user-dropdown-item" id="logout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sign Out
        </button>
      </div>
    `;
    
    // 插入到导航栏
    navLinks.appendChild(loginBtn);
    navLinks.appendChild(userContainer);
    
    this.loginBtn = loginBtn;
    this.userContainer = userContainer;
    
    // 绑定用户菜单事件
    this.bindUserMenuEvents();
  }

  /**
   * 绑定模态框事件
   */
  bindModalEvents() {
    if (!this.modal) return;
    
    // 关闭按钮
    const closeBtn = this.modal.querySelector('.auth-modal-close, .modal-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => this.hideLoginModal();
    }
    
    // 点击遮罩关闭
    const overlay = this.modal.querySelector('.auth-modal-overlay');
    if (overlay) {
      overlay.onclick = () => this.hideLoginModal();
    }
    
    // 邮箱登录按钮
    const emailLoginBtn = this.modal.querySelector('#email-login-btn');
    if (emailLoginBtn) {
      emailLoginBtn.onclick = () => this.showEmailLoginForm();
    }
    
    // OAuth按钮
    const oauthBtns = this.modal.querySelectorAll('.oauth-btn[data-provider]');
    oauthBtns.forEach(btn => {
      btn.onclick = () => {
        const provider = btn.dataset.provider;
        this.handleOAuthLogin(provider);
      };
    });
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.style.display === 'flex') {
        this.hideLoginModal();
      }
    });
  }

  /**
   * 绑定用户菜单事件
   */
  bindUserMenuEvents() {
    if (!this.userContainer) return;
    
    // 用户菜单触发器
    const trigger = this.userContainer.querySelector('.user-menu-trigger');
    const dropdown = this.userContainer.querySelector('.user-dropdown');
    
    if (trigger && dropdown) {
      trigger.onclick = (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
      };
      
      // 点击外部关闭下拉菜单
      document.addEventListener('click', () => {
        dropdown.classList.remove('show');
      });
      
      dropdown.onclick = (e) => {
        e.stopPropagation();
      };
    }
    
    // 退出登录按钮
    const logoutBtn = this.userContainer.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = () => this.handleLogout();
    }
  }

  /**
   * 显示登录模态框
   */
  showLoginModal() {
    console.log('🔐 showLoginModal() called');
    console.log('Modal element:', this.modal);
    
    if (this.modal) {
      console.log('Setting modal display to flex');
      this.modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    } else {
      console.error('❌ Modal element not found');
    }
  }

  /**
   * 隐藏登录模态框
   */
  hideLoginModal() {
    if (this.modal) {
      this.modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  /**
   * 显示邮箱登录表单
   */
  showEmailLoginForm() {
    // 隐藏当前模态框
    this.hideLoginModal();
    
    // 保存当前页面用于登录后重定向
    const redirectUrl = localStorage.getItem('loginRedirect') || window.location.href;
    
    // 跳转到邮箱登录页面
    window.location.href = `/login.html?redirect=${encodeURIComponent(redirectUrl)}`;
  }

  /**
   * 处理OAuth登录
   */
  async handleOAuthLogin(provider) {
    console.log(`🔐 Attempting to sign in with ${provider}...`);
    
    if (!window.supabaseAuth) {
      console.error('❌ window.supabaseAuth is not available');
      this.showError('Authentication system not initialized. Please refresh the page and try again.');
      return;
    }
    
    // 等待 Supabase 客户端初始化
    let retries = 0;
    const maxRetries = 50; // 最多等待5秒
    while (!window.supabaseAuth.client && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    if (!window.supabaseAuth.client) {
      console.error('❌ Supabase client not initialized after waiting');
      console.error('💡 Possible causes:');
      console.error('   1. Supabase configuration not loaded');
      console.error('   2. Network issues preventing CDN from loading');
      console.error('   3. Invalid SUPABASE_URL or SUPABASE_ANON_KEY');
      this.showError('Supabase client not initialized. Please check your configuration and network connection.');
      return;
    }
    
    if (!window.supabaseAuth.signInWithOAuth) {
      console.error('❌ signInWithOAuth function not available');
      this.showError('OAuth login function not available. Please refresh the page and try again.');
      return;
    }
    
    try {
      const { data, error } = await window.supabaseAuth.signInWithOAuth(provider);
      
      if (error) {
        console.error('Sign-in error:', error);
        this.handleOAuthError(provider, error);
      } else {
        console.log('✅ OAuth sign-in initiated successfully');
        // OAuth will auto-redirect, no need to manually close modal
      }
    } catch (error) {
      console.error('Sign-in exception:', error);
      this.handleOAuthError(provider, error);
    }
  }

  /**
   * 处理OAuth错误
   */
  handleOAuthError(provider, error) {
    console.error(`OAuth error for ${provider}:`, error);
    
    // 检查是否是provider未启用的错误
    if (error.message && (
      error.message.includes('provider is not enabled') ||
      error.message.includes('Unsupported provider') ||
      error.error_code === 'validation_failed'
    )) {
      this.showProviderNotEnabledError(provider);
    } else {
      this.showError(`Sign-in failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * 显示Provider未启用的错误提示
   */
  showProviderNotEnabledError(provider) {
    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
    const message = `
      <div style="text-align: left;">
        <h3 style="color: #f56565; margin-bottom: 12px;">🔒 ${providerName} Login Not Enabled</h3>
        <p style="margin-bottom: 12px;">To enable ${providerName} authentication, please:</p>
        <ol style="margin-left: 20px; line-height: 1.8;">
          <li>Go to your <a href="https://app.supabase.com" target="_blank" style="color: #6366F1;">Supabase Dashboard</a></li>
          <li>Navigate to <strong>Authentication → Providers</strong></li>
          <li>Find <strong>${providerName}</strong> and click to enable it</li>
          <li>Enter your ${providerName} OAuth credentials (Client ID & Secret)</li>
          <li>Add redirect URL: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${window.location.origin}/index.html</code></li>
          <li>Save and try again</li>
        </ol>
        <p style="margin-top: 12px; font-size: 14px; color: #666;">
          Need help? Check the <a href="https://supabase.com/docs/guides/auth/social-login" target="_blank" style="color: #6366F1;">Supabase OAuth docs</a>
        </p>
      </div>
    `;
    
    this.showError(message, 'Configuration Required');
  }

  /**
   * 显示错误提示
   */
  showError(message, title = 'Error') {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10001; backdrop-filter: blur(4px);';
    
    // 在移动端使用响应式宽度，避免占满屏幕
    const isMobile = window.innerWidth <= 768;
    const modal = document.createElement('div');
    modal.style.cssText = `background: white; padding: 30px; border-radius: 16px; max-width: ${isMobile ? 'calc(100vw - 40px)' : '500px'}; width: ${isMobile ? 'calc(100vw - 40px)' : '90%'}; box-shadow: 0 20px 60px rgba(0,0,0,0.3); box-sizing: border-box;`;
    
    modal.innerHTML = `
      <h2 style="color: #1f2937; margin-bottom: 16px; font-size: 20px;">${title}</h2>
      <div style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        ${message}
      </div>
      <button id="error-close-btn" class="cute-button cute-button-primary" style="width: 100%; padding: 12px;">
        Got it
      </button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    const closeBtn = modal.querySelector('#error-close-btn');
    const closeHandler = () => {
      document.body.removeChild(overlay);
    };
    
    closeBtn.onclick = closeHandler;
    overlay.onclick = (e) => {
      if (e.target === overlay) closeHandler();
    };
  }

  /**
   * 处理退出登录
   */
  async handleLogout() {
    if (!confirm('Are you sure you want to sign out?')) return;
    
    console.log('👋 Signing out...');
    
    if (window.supabaseAuth && window.supabaseAuth.signOut) {
      const { error } = await window.supabaseAuth.signOut();
      
      if (error) {
        console.error('Sign-out failed:', error);
        alert(`Sign-out failed: ${error.message}`);
      } else {
        console.log('✅ Signed out successfully');
        await this.updateAuthUI();
      }
    }
  }

  /**
   * 更新认证UI状态
   * @param {User|null} userFromSession - 从 session 中传入的用户对象（可选）
   */
  async updateAuthUI(userFromSession = null) {
    if (!window.supabaseAuth) return;
    
    // 优先使用传入的 user，否则重新获取
    let user = userFromSession;
    if (user === null) {
      user = await window.supabaseAuth.getCurrentUser();
    }
    
    this.currentUser = user;
    
    if (user) {
      console.log('✅ 用户已登录:', user.email);
      // 已登录：显示用户信息并保存到localStorage
      await this.saveUserToLocalStorage(user);
      // 确保用户在数据库中存在
      await this.ensureUserExistsInDatabase(user);
      this.showUserMenu(user);
      // 更新 Upgrade 按钮显示状态
      await this.updateUpgradeButtonVisibility(user);
      // 更新 Test 按钮显示状态（仅管理员可见）
      await this.updateTestButtonVisibility(user);
    } else {
      console.log('ℹ️ 用户未登录');
      // 未登录：清除localStorage并显示登录按钮
      this.clearUserFromLocalStorage();
      this.showLoginButton();
      // 隐藏 Upgrade 按钮
      this.hideUpgradeButtons();
      // 隐藏 Test 按钮
      this.hideTestButton();
    }
  }
  
  /**
   * 确保用户在数据库中存在
   */
  async ensureUserExistsInDatabase(user) {
    try {
      console.log('🔍 检查用户是否存在于数据库:', user.id);
      console.log('📋 用户元数据:', user.user_metadata);
      
      // 检查用户是否存在
      const checkUserQuery = `
        query CheckUser($userId: String!) {
          users_by_pk(id: $userId) {
            id
          }
        }
      `;
      
      const checkResponse = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: checkUserQuery,
          variables: { userId: user.id }
        })
      });
      
      if (!checkResponse.ok) {
        console.error('❌ 检查用户失败:', checkResponse.statusText);
        return;
      }
      
      const checkResult = await checkResponse.json();
      
      // 如果用户已存在，直接返回
      if (checkResult.data?.users_by_pk) {
        console.log('✅ 用户已存在于数据库中');
        return;
      }
      
      // 用户不存在，创建新用户
      console.log('📝 创建新用户记录:', user.id);
      
      // Discord 用户元数据字段可能不同，需要适配
      const displayName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.user_metadata?.user_name ||
                         user.user_metadata?.preferred_username ||
                         user.email?.split('@')[0] || 
                         'User';
      
      const avatarUrl = user.user_metadata?.avatar_url || 
                       user.user_metadata?.picture;
      
      console.log('👤 提取的用户信息:', { displayName, avatarUrl, email: user.email });
      
      const createUserMutation = `
        mutation CreateUser($userId: String!, $email: String!, $nickName: String!, $avatarUrl: String) {
          insert_users_one(
            object: { 
              id: $userId, 
              email: $email,
              nick_name: $nickName,
              avatar_url: $avatarUrl,
              is_banned: false
            }
          ) {
            id
            email
            nick_name
          }
        }
      `;
      
      const createResponse = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: createUserMutation,
          variables: { 
            userId: user.id,
            email: user.email,
            nickName: displayName,
            avatarUrl: avatarUrl
          }
        })
      });
      
      if (!createResponse.ok) {
        console.error('❌ 创建用户失败:', createResponse.statusText);
        return;
      }
      
      const createResult = await createResponse.json();
      
      if (createResult.errors) {
        console.error('❌ GraphQL创建用户错误:', createResult.errors);
        return;
      }
      
      console.log('✅ 用户记录创建成功:', createResult.data?.insert_users_one);
    } catch (error) {
      console.error('❌ 确保用户存在时出错:', error);
    }
  }

  /**
   * 保存用户信息到localStorage
   */
  async saveUserToLocalStorage(user) {
    try {
      // 获取session以获取access_token
      const session = await window.supabaseAuth.getSession();
      const token = session?.access_token;
      
      // 保存用户信息
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
      if (token) {
        localStorage.setItem('userToken', token);
      }
      
      console.log('✅ 用户信息已保存到localStorage:', { userId: user.id, email: user.email });
    } catch (error) {
      console.error('❌ 保存用户信息到localStorage失败:', error);
    }
  }

  /**
   * 从localStorage清除用户信息
   */
  clearUserFromLocalStorage() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    localStorage.removeItem('userToken');
    console.log('✅ 已从localStorage清除用户信息');
  }

  /**
   * 显示登录按钮
   */
  showLoginButton() {
    if (this.loginBtn) {
      this.loginBtn.style.display = 'flex';
      // 移除隐藏类
      this.loginBtn.classList.remove('auth-hidden');
    }
    if (this.userContainer) {
      this.userContainer.style.display = 'none';
    }
    
    // 隐藏"我的鱼"链接
    const myFishLink = document.getElementById('my-fish-link');
    if (myFishLink) {
      myFishLink.style.display = 'none';
    }
    
    // 隐藏"Settings"链接
    const settingsLink = document.getElementById('settings-link');
    if (settingsLink) {
      settingsLink.style.display = 'none';
    }
  }

  /**
   * 显示用户菜单
   */
  async showUserMenu(user) {
    if (!this.userContainer) return;
    
    // 获取用户信息 - 优先从数据库获取feeder_name
    let userName = user.user_metadata?.name || 
                   user.user_metadata?.full_name || 
                   user.user_metadata?.nick_name ||
                   user.email?.split('@')[0] || 
                   'User';
    
    // 尝试从数据库获取最新的feeder_name
    if (user && user.id) {
      try {
        const backendUrl = window.BACKEND_URL || '';
        const token = localStorage.getItem('userToken');
        if (token) {
          const profileResponse = await fetch(`${backendUrl}/api/profile/${encodeURIComponent(user.id)}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            // 优先使用 nick_name，然后是 feeder_name
            if (profileData.user && profileData.user.nick_name) {
              userName = profileData.user.nick_name;
              console.log('✅ 从数据库获取昵称 (nick_name):', userName);
            } else if (profileData.user && profileData.user.feeder_name) {
              userName = profileData.user.feeder_name;
              console.log('✅ 从数据库获取用户名 (feeder_name):', userName);
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ 获取用户profile失败，使用默认名称:', error);
      }
    }
    
    console.log('User name:', userName);
    
    // 更新用户信息（不显示头像）
    const name = this.userContainer.querySelector('.user-name');
    const trigger = this.userContainer.querySelector('.user-menu-trigger');
    
    if (name) name.textContent = userName;
    
    // 添加会员图标（不显示用户头像，只显示会员图标）
    if (trigger && typeof getUserMembershipTier === 'function' && typeof createMembershipIcon === 'function') {
      try {
        const tier = await getUserMembershipTier(user.id);
        const membershipIcon = createMembershipIcon(tier);
        
        // 移除已存在的会员图标
        const existingIcon = trigger.querySelector('.membership-icon');
        if (existingIcon) {
          existingIcon.remove();
        }
        
        // 将会员图标插入到用户名之前
        if (name) {
          trigger.insertBefore(membershipIcon, name);
        } else {
          trigger.insertBefore(membershipIcon, trigger.firstChild);
        }
      } catch (error) {
        console.error('Failed to load membership icon:', error);
      }
    }
    
    // 加载并显示未读消息数量
    await this.updateUnreadCount(user.id);
    
    // 显示用户容器，隐藏登录按钮
    this.userContainer.style.display = 'flex';
    if (this.loginBtn) {
      this.loginBtn.style.display = 'none';
      // 添加隐藏类以确保隐藏
      this.loginBtn.classList.add('auth-hidden');
    }
    
    // 显示"我的鱼"链接
    const myFishLink = document.getElementById('my-fish-link');
    if (myFishLink) {
      myFishLink.style.display = '';
    }
    
    // 显示"Settings"链接
    const settingsLink = document.getElementById('settings-link');
    if (settingsLink) {
      settingsLink.style.display = '';
    }
  }

  /**
   * 更新未读消息数量
   */
  async updateUnreadCount(userId) {
    if (!userId || !this.userContainer) return;
    
    try {
      const response = await fetch(`/api/message-api?action=unread-count&userId=${encodeURIComponent(userId)}`);
      if (!response.ok) {
        console.error('Failed to fetch unread count');
        return;
      }
      
      const data = await response.json();
      const unreadCount = data.unreadCount || 0;
      
      // 更新按钮上的未读消息徽章
      const trigger = this.userContainer.querySelector('.user-menu-trigger');
      if (trigger) {
        let badge = trigger.querySelector('.unread-badge');
        
        if (unreadCount > 0) {
          if (!badge) {
            badge = document.createElement('span');
            badge.className = 'unread-badge';
            trigger.appendChild(badge);
          }
          badge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
          badge.style.display = 'flex';
        } else if (badge) {
          badge.style.display = 'none';
        }
      }
      
      // 更新下拉菜单中的未读消息数量
      const messagesItem = this.userContainer.querySelector('#messages-menu-item');
      if (messagesItem) {
        let itemBadge = messagesItem.querySelector('.unread-badge');
        
        if (unreadCount > 0) {
          if (!itemBadge) {
            itemBadge = document.createElement('span');
            itemBadge.className = 'unread-badge';
            messagesItem.appendChild(itemBadge);
          }
          itemBadge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
          itemBadge.style.display = 'flex';
        } else if (itemBadge) {
          itemBadge.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Failed to update unread count:', error);
    }
  }

  /**
   * 获取当前用户
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * 更新 Upgrade 按钮的显示状态（仅对 free 和 plus 用户显示）
   */
  async updateUpgradeButtonVisibility(user) {
    if (!user) {
      this.hideUpgradeButtons();
      return;
    }

    try {
      // 获取用户会员等级
      let membershipTier = 'free';
      
      if (typeof getUserMembershipTier === 'function') {
        membershipTier = await getUserMembershipTier(user.id);
      } else {
        // Fallback: 通过 API 查询
        const query = `
          query GetUserSubscription($userId: String!) {
            user_subscriptions(
              where: {
                user_id: {_eq: $userId}
                is_active: {_eq: true}
              }
              order_by: {created_at: desc}
              limit: 1
            ) {
              plan
            }
          }
        `;

        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query,
            variables: { userId: user.id }
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.data?.user_subscriptions?.[0]?.plan) {
            membershipTier = result.data.user_subscriptions[0].plan.toLowerCase();
          }
        }
      }

      // 只对 free 和 plus 用户显示 Upgrade 按钮
      const shouldShow = membershipTier === 'free' || membershipTier === 'plus';
      
      if (shouldShow) {
        this.showUpgradeButtons();
      } else {
        this.hideUpgradeButtons();
      }

      // 调试信息
      if (window.location.search.includes('debug=upgrade')) {
        console.log('🔍 Upgrade Button Debug:', {
          userId: user.id,
          membershipTier: membershipTier,
          shouldShow: shouldShow,
          navButtonsFound: document.querySelectorAll('a[href="membership.html"].game-btn-purple, #nav-upgrade-btn').length,
          sidebarLinksFound: document.querySelectorAll('a[href="membership.html"].sidebar-link, #sidebar-upgrade-link').length
        });
        
        // 显示调试面板
        this.showDebugPanel({
          userId: user.id,
          membershipTier: membershipTier,
          shouldShow: shouldShow
        });
      }
    } catch (error) {
      console.error('❌ Failed to update upgrade button visibility:', error);
      // 出错时默认隐藏
      this.hideUpgradeButtons();
    }
  }

  /**
   * 显示 Upgrade 按钮
   */
  showUpgradeButtons() {
    // 导航栏按钮
    const navUpgradeBtns = document.querySelectorAll('a[href="membership.html"].game-btn-purple, #nav-upgrade-btn');
    navUpgradeBtns.forEach(btn => {
      btn.style.display = 'flex';
    });

    // 侧边栏链接
    const sidebarUpgradeLinks = document.querySelectorAll('a[href="membership.html"].sidebar-link, #sidebar-upgrade-link');
    sidebarUpgradeLinks.forEach(link => {
      link.style.display = 'flex';
    });
  }

  /**
   * 隐藏 Upgrade 按钮
   */
  hideUpgradeButtons() {
    // 导航栏按钮
    const navUpgradeBtns = document.querySelectorAll('a[href="membership.html"].game-btn-purple, #nav-upgrade-btn');
    navUpgradeBtns.forEach(btn => {
      btn.style.display = 'none';
    });

    // 侧边栏链接
    const sidebarUpgradeLinks = document.querySelectorAll('a[href="membership.html"].sidebar-link, #sidebar-upgrade-link');
    sidebarUpgradeLinks.forEach(link => {
      link.style.display = 'none';
    });
  }

  /**
   * 更新 Test 按钮显示状态（仅管理员可见）
   */
  async updateTestButtonVisibility(user) {
    try {
      // 等待 admin-auth.js 加载（最多等待2秒）
      let attempts = 0;
      const maxAttempts = 20;
      while (!window.adminAuth && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      // 检查 admin-auth.js 是否已加载
      if (!window.adminAuth) {
        console.warn('⚠️ admin-auth.js not loaded, hiding test button');
        this.hideTestButton();
        return;
      }

      // 检查管理员权限
      const isAdmin = await window.adminAuth.checkAdminAccess();
      
      if (isAdmin) {
        this.showTestButton();
        console.log('✅ Admin detected, showing test button');
      } else {
        this.hideTestButton();
        console.log('ℹ️ Not admin, hiding test button');
      }
    } catch (error) {
      console.error('❌ Failed to update test button visibility:', error);
      // 出错时默认隐藏
      this.hideTestButton();
    }
  }

  /**
   * 显示 Test 按钮
   */
  showTestButton() {
    const testBtns = document.querySelectorAll('a[href="test-center.html"].game-btn-white, #nav-test-btn');
    testBtns.forEach(btn => {
      btn.style.display = 'flex';
    });
  }

  /**
   * 隐藏 Test 按钮
   */
  hideTestButton() {
    const testBtns = document.querySelectorAll('a[href="test-center.html"].game-btn-white, #nav-test-btn');
    testBtns.forEach(btn => {
      btn.style.display = 'none';
    });
  }

  /**
   * 显示调试面板
   */
  showDebugPanel(debugInfo) {
    // 移除已存在的调试面板
    const existingPanel = document.getElementById('upgrade-debug-panel');
    if (existingPanel) {
      existingPanel.remove();
    }

    // 创建调试面板
    const panel = document.createElement('div');
    panel.id = 'upgrade-debug-panel';
    panel.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 16px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      border: 2px solid #FFD700;
    `;
    
    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #FFD700; padding-bottom: 8px;">
        <strong style="color: #FFD700;">🔍 Upgrade Debug</strong>
        <button onclick="this.parentElement.parentElement.remove()" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
      </div>
      <div style="line-height: 1.6;">
        <div><strong>User ID:</strong><br><span style="color: #4CAF50;">${debugInfo.userId.substring(0, 20)}...</span></div>
        <div style="margin-top: 8px;"><strong>Membership:</strong><br><span style="color: #FFD700;">${debugInfo.membershipTier.toUpperCase()}</span></div>
        <div style="margin-top: 8px;"><strong>Should Show:</strong><br><span style="color: ${debugInfo.shouldShow ? '#4CAF50' : '#FF3B30'};">${debugInfo.shouldShow ? 'YES ✓' : 'NO ✗'}</span></div>
        <div style="margin-top: 8px; font-size: 10px; color: #999;">
          Only Free & Plus users see Upgrade button
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    
    // 5秒后自动关闭
    setTimeout(() => {
      if (panel.parentElement) {
        panel.remove();
      }
    }, 5000);
  }
}

// 创建全局实例
window.authUI = new AuthUI();

// 自动初始化（在DOM加载后）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.authUI.init();
  });
} else {
  window.authUI.init();
}

// 导出全局函数，方便在 HTML 中直接调用
window.showLoginModal = function() {
  if (window.authUI && window.authUI.showLoginModal) {
    window.authUI.showLoginModal();
  } else {
    console.error('❌ AuthUI not initialized');
  }
};

console.log('✅ 认证UI模块已加载');

