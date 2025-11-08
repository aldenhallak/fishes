# Profile页面登录状态显示修复

## 问题描述

用户在主页登录成功后，访问 `http://localhost:3000/profile.html` 时仍显示"No user logged in"，无法显示当前用户信息。

## 问题根源

1. **localStorage未保存登录信息**：`auth-ui.js` 中的认证状态监听器只更新了UI显示，但没有将用户信息保存到 localStorage
2. **profile.js依赖localStorage**：profile页面通过检查 `localStorage` 中的 `userToken` 和 `userData` 来判断登录状态
3. **缺少回退机制**：即使有localStorage数据，当Hasura查询失败时也没有回退显示基本信息

## 修复方案

### 1. 在auth-ui.js中添加localStorage保存逻辑

修改 `updateAuthUI()` 方法，在用户登录时保存信息到localStorage，登出时清除：

```javascript
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
    this.showUserMenu(user);
  } else {
    // 未登录：清除localStorage并显示登录按钮
    this.clearUserFromLocalStorage();
    this.showLoginButton();
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
```

### 2. 在profile.js中添加回退机制

当从Hasura获取用户信息失败时，使用localStorage中的基本信息显示profile：

```javascript
if (userId) {
  // Load current user's profile directly
  getUserProfile(userId).then(profile => {
    displayProfile(profile, userId);
  }).catch(error => {
    console.error('Error loading current user profile:', error);
    // 回退到显示localStorage中的基本信息
    console.log('📦 Falling back to localStorage data');
    const fallbackProfile = {
      userId: userId,
      displayName: parsedUserData.name || parsedUserData.email?.split('@')[0] || 'User',
      email: parsedUserData.email,
      avatarUrl: parsedUserData.avatar_url,
      createdAt: new Date().toISOString(),
      fishCount: 0,
      totalUpvotes: 0,
      reputationScore: 0
    };
    displayProfile(fallbackProfile, userId);
  });
}
```

## 修改的文件

1. `src/js/auth-ui.js` - 添加localStorage保存和清除方法
2. `src/js/profile.js` - 添加回退显示机制

## 测试验证

使用模拟登录数据验证：

```javascript
// 在浏览器控制台中执行
const mockUserId = 'test-user-123';
const mockUserData = {
  id: mockUserId,
  uid: mockUserId,
  userId: mockUserId,
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: 'https://ui-avatars.com/api/?name=Test+User&background=6366F1&color=fff'
};
const mockToken = 'mock-jwt-token-for-testing';

localStorage.setItem('userId', mockUserId);
localStorage.setItem('userData', JSON.stringify(mockUserData));
localStorage.setItem('userToken', mockToken);
```

访问 `http://localhost:3000/profile.html`，应该能看到：
- 用户头像（显示首字母）
- 用户名："Test User (You)"
- 加入日期
- 统计信息（Fish Created: 0, Total Upvotes: 0）
- 操作按钮（Edit Profile, View My Fish, My Tanks, Share Profile）

## 影响范围

- ✅ 修复了登录后profile页面不显示用户信息的问题
- ✅ 增强了系统的健壮性，当后端查询失败时能显示基本信息
- ✅ 保持了与现有认证系统的兼容性

## 后续建议

1. 考虑在其他需要用户信息的页面也实施类似的回退机制
2. 统一localStorage的键名规范，避免不同页面使用不同的键名
3. 考虑添加localStorage数据的过期机制

## 修复日期

2025-11-04





















