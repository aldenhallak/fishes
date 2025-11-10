/**
 * 认证UI组件
 * 管理登录模态框和用户界面
 */

// 社交登录提供商配置
const OAUTH_PROVIDERS = [
  { 
    id: 'google', 
    name: 'Google', 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
    color: '#4285F4'
  },
  { 
    id: 'twitter', 
    name: 'X (Twitter)', 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    color: '#000000'
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    color: '#1877F2'
  },
  { 
    id: 'discord', 
    name: 'Discord', 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
    color: '#5865F2'
  },
  { 
    id: 'apple', 
    name: 'Apple', 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>`,
    color: '#000000'
  },
  { 
    id: 'reddit', 
    name: 'Reddit', 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>`,
    color: '#FF4500'
  }
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
    
    // 等待Supabase初始化
    await this.waitForSupabase();
    
    // 创建UI元素
    this.createLoginModal();
    this.createUserMenu();
    
    // 监听认证状态变化
    if (window.supabaseAuth) {
      window.supabaseAuth.onAuthStateChange((event, session) => {
        console.log('🔔 Auth state changed:', event);
        this.updateAuthUI();
      });
    }
    
    // 开发环境自动登录（如果设置了环境变量）
    await this.checkAutoLogin();
    
    // 初始化UI状态
    await this.updateAuthUI();
  }

  /**
   * 等待Supabase初始化完成
   */
  async waitForSupabase() {
    let attempts = 0;
    const maxAttempts = 50; // 最多等待5秒
    
    while (attempts < maxAttempts) {
      if (window.supabaseAuth && window.supabaseAuth.client) {
        console.log('✅ Supabase initialized successfully');
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    console.warn('⚠️ Supabase initialization timeout');
    return false;
  }

  /**
   * 检查开发环境自动登录
   */
  async checkAutoLogin() {
    // 检查是否已登录
    const currentUser = await window.supabaseAuth?.getCurrentUser();
    if (currentUser) {
      console.log('✅ User already logged in, skipping auto-login');
      return;
    }

    // 从localStorage读取开发环境登录凭据
    const devEmail = localStorage.getItem('DEV_USER');
    const devPass = localStorage.getItem('DEV_PASS');
    
    if (devEmail && devPass) {
      console.log('🔧 Development auto-login enabled');
      console.log('📧 Email:', devEmail);
      
      try {
        const { data, error } = await window.supabaseAuth.client.auth.signInWithPassword({
          email: devEmail,
          password: devPass
        });
        
        if (error) {
          console.error('❌ Auto-login failed:', error.message);
        } else {
          console.log('✅ Auto-login successful');
          
          // 存储用户信息
          if (data.user) {
            localStorage.setItem('userToken', data.session.access_token);
            localStorage.setItem('userData', JSON.stringify(data.user));
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
      }
    } else {
      console.log('ℹ️ No development credentials found in localStorage');
      console.log('ℹ️ To enable auto-login, set:');
      console.log('   localStorage.setItem("DEV_USER", "your-email@example.com")');
      console.log('   localStorage.setItem("DEV_PASS", "your-password")');
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
      <div class="auth-modal-content">
        <button class="auth-modal-close" aria-label="Close">&times;</button>
        <div class="auth-modal-header">
          <h2>🐟 Sign in to FishTalk</h2>
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
    // 获取导航栏 - 支持两种类名
    const navLinks = document.querySelector('.game-nav-links') || document.querySelector('.nav-links');
    if (!navLinks) {
      console.error('❌ 未找到导航栏元素');
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
        <img class="user-avatar" src="" alt="User avatar">
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
    const closeBtn = this.modal.querySelector('.auth-modal-close');
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
    console.log('Checking supabaseAuth:', window.supabaseAuth);
    console.log('Checking supabase client:', window.supabaseAuth?.client);
    
    if (!window.supabaseAuth) {
      console.error('❌ window.supabaseAuth is not available');
      this.showError('Authentication system not initialized. Please refresh the page and try again.');
      return;
    }
    
    if (!window.supabaseAuth.signInWithOAuth) {
      console.error('❌ signInWithOAuth function not available');
      this.showError('OAuth login function not available. Please refresh the page and try again.');
      return;
    }
    
    if (!window.supabaseAuth.client) {
      console.error('❌ Supabase client not initialized');
      this.showError('Supabase client not initialized. Please check your configuration.');
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
    
    const modal = document.createElement('div');
    modal.style.cssText = 'background: white; padding: 30px; border-radius: 16px; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);';
    
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
   */
  async updateAuthUI() {
    if (!window.supabaseAuth) return;
    
    const user = await window.supabaseAuth.getCurrentUser();
    this.currentUser = user;
    
    if (user) {
      // 已登录：显示用户信息并保存到localStorage
      await this.saveUserToLocalStorage(user);
      // 确保用户在数据库中存在
      await this.ensureUserExistsInDatabase(user);
      this.showUserMenu(user);
    } else {
      // 未登录：清除localStorage并显示登录按钮
      this.clearUserFromLocalStorage();
      this.showLoginButton();
    }
  }
  
  /**
   * 确保用户在数据库中存在
   */
  async ensureUserExistsInDatabase(user) {
    try {
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
      
      const displayName = user.user_metadata?.name || 
                         user.user_metadata?.full_name || 
                         user.email?.split('@')[0] || 
                         'User';
      
      const avatarUrl = user.user_metadata?.avatar_url || 
                       user.user_metadata?.picture;
      
      const createUserMutation = `
        mutation CreateUser($userId: String!, $email: String!, $displayName: String!, $avatarUrl: String) {
          insert_users_one(
            object: { 
              id: $userId, 
              email: $email,
              display_name: $displayName,
              avatar_url: $avatarUrl,
              is_banned: false
            }
          ) {
            id
            email
            display_name
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
            displayName: displayName,
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
  showUserMenu(user) {
    if (!this.userContainer) return;
    
    // 获取用户信息
    const userName = user.user_metadata?.name || 
                     user.user_metadata?.full_name || 
                     user.email?.split('@')[0] || 
                     'User';
    
    const avatarUrl = user.user_metadata?.avatar_url || 
                      user.user_metadata?.picture || 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366F1&color=fff`;
    
    console.log('Setting user avatar:', avatarUrl);
    console.log('User name:', userName);
    
    // 更新用户信息
    const avatar = this.userContainer.querySelector('.user-avatar');
    const name = this.userContainer.querySelector('.user-name');
    
    if (avatar) {
      // 添加错误处理标志，防止无限循环
      let errorHandled = false;
      
      // 添加错误处理：如果图片加载失败，使用备用头像
      avatar.onerror = () => {
        if (!errorHandled) {
          errorHandled = true;
          console.warn('Avatar failed to load, using fallback');
          avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366F1&color=fff&size=96`;
        }
      };
      
      // 添加加载成功日志
      avatar.onload = () => {
        console.log('✅ Avatar loaded successfully');
      };
      
      // 设置referrer policy，允许Google头像加载
      avatar.referrerPolicy = 'no-referrer';
      
      // 设置图片源（放在最后，这样事件处理器已经绑定）
      avatar.src = avatarUrl;
    }
    
    if (name) name.textContent = userName;
    
    // 显示用户容器，隐藏登录按钮
    this.userContainer.style.display = 'flex';
    if (this.loginBtn) {
      this.loginBtn.style.display = 'none';
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
   * 获取当前用户
   */
  getCurrentUser() {
    return this.currentUser;
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

console.log('✅ 认证UI模块已加载');

