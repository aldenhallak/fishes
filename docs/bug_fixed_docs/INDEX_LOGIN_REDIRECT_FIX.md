# 主页登录后跳转到 Tank 页面的问题修复

## 问题描述

用户反馈：在主页（index.html）登录后，有时会自动跳转到 tank 页面（tank.html?view=my），而不是留在主页。

## 问题原因

### 根本原因

`localStorage.loginRedirect` 的残留值导致了不期望的重定向。

### 问题场景

1. **用户操作序列**：
   ```
   用户访问 tank.html?view=my（未登录）
   → 系统设置 localStorage.loginRedirect = "tank.html?view=my"
   → 用户点击登录，跳转到登录页面
   → 用户取消登录，返回主页
   → 用户在主页点击登录按钮
   → OAuth 登录成功
   → 系统读取 localStorage.loginRedirect（仍然是 tank.html?view=my）
   → 自动跳转到 tank 页面 ❌
   ```

2. **预期行为**：
   ```
   用户在主页点击登录
   → OAuth 登录成功
   → 留在主页 ✅
   ```

### 技术细节

**问题代码位置**：

1. `showEmailLoginForm()` 方法（第 530 行）：
   ```javascript
   const redirectUrl = localStorage.getItem('loginRedirect') || window.location.href;
   ```
   使用了旧的 `loginRedirect`，即使当前在主页。

2. `handleOAuthLogin()` 方法：
   没有清除旧的 `loginRedirect`。

3. `showLoginModal()` 方法：
   没有清除旧的 `loginRedirect`。

## 解决方案

### 1. showLoginModal() - 清除旧的重定向

在主页显示登录模态框时，清除任何现有的 `loginRedirect`：

```javascript
showLoginModal() {
  // 🔧 修复：在主页显示登录模态框时，清除任何现有的 loginRedirect
  const currentPath = window.location.pathname;
  const isOnIndex = currentPath === '/' || 
                    currentPath === '/index.html' || 
                    currentPath.endsWith('/index.html');
  
  if (isOnIndex) {
    const existingRedirect = localStorage.getItem('loginRedirect');
    if (existingRedirect) {
      console.log('🧹 Clearing existing loginRedirect on index page:', existingRedirect);
      localStorage.removeItem('loginRedirect');
    }
  }
  
  // ... 显示模态框
}
```

### 2. handleOAuthLogin() - OAuth 登录前清除

在 OAuth 登录前清除旧的 `loginRedirect`：

```javascript
async handleOAuthLogin(provider) {
  // 🔧 修复：在主页 OAuth 登录时，清除任何现有的 loginRedirect
  const currentPath = window.location.pathname;
  const isOnIndex = currentPath === '/' || 
                    currentPath === '/index.html' || 
                    currentPath.endsWith('/index.html');
  
  if (isOnIndex) {
    const existingRedirect = localStorage.getItem('loginRedirect');
    if (existingRedirect) {
      console.log('🧹 Clearing existing loginRedirect before OAuth:', existingRedirect);
      localStorage.removeItem('loginRedirect');
    }
  }
  
  // ... 继续 OAuth 流程
}
```

### 3. showEmailLoginForm() - 邮箱登录使用当前页面

从主页跳转到邮箱登录页时，忽略旧的 `loginRedirect`：

```javascript
showEmailLoginForm() {
  // 🔧 修复：从主页登录时，使用当前页面而不是旧的 loginRedirect
  const currentPath = window.location.pathname;
  const isOnIndex = currentPath === '/' || 
                    currentPath === '/index.html' || 
                    currentPath.endsWith('/index.html');
  
  let redirectUrl;
  if (isOnIndex) {
    // 在主页：忽略旧的 loginRedirect，使用当前页面
    redirectUrl = window.location.href;
    console.log('📍 Email login from index page, redirectUrl:', redirectUrl);
  } else {
    // 在其他页面：使用 loginRedirect 或当前页面
    redirectUrl = localStorage.getItem('loginRedirect') || window.location.href;
    console.log('📍 Email login from other page, redirectUrl:', redirectUrl);
  }
  
  // 跳转到邮箱登录页面
  window.location.href = `/login.html?redirect=${encodeURIComponent(redirectUrl)}`;
}
```

## 修改的文件

- `src/js/auth-ui.js` - 添加了 loginRedirect 清除逻辑

## 测试场景

### 测试 1：主页 OAuth 登录（正常情况）

**步骤**：
1. 打开主页（未登录）
2. 点击登录按钮
3. 点击 "Sign in with Google"
4. 完成 Google 登录
5. 验证：应该留在主页 ✅

### 测试 2：主页 OAuth 登录（有旧的 loginRedirect）

**步骤**：
1. 在浏览器控制台设置：
   ```javascript
   localStorage.setItem('loginRedirect', 'tank.html?view=my');
   ```
2. 刷新主页
3. 点击登录按钮
4. 点击 "Sign in with Google"
5. 完成 Google 登录
6. 验证：应该留在主页（不跳转到 tank）✅

### 测试 3：主页邮箱登录（有旧的 loginRedirect）

**步骤**：
1. 在浏览器控制台设置：
   ```javascript
   localStorage.setItem('loginRedirect', 'tank.html?view=my');
   ```
2. 刷新主页
3. 点击登录按钮
4. 点击 "Sign in with Email"
5. 完成邮箱登录
6. 验证：应该回到主页（不跳转到 tank）✅

### 测试 4：从 Tank 页面登录（保持现有功能）

**步骤**：
1. 打开 tank.html?view=my（未登录）
2. 系统提示登录
3. 完成登录
4. 验证：应该回到 tank.html?view=my ✅

### 测试 5：从其他需要登录的页面登录

**步骤**：
1. 打开 profile.html（未登录）
2. 系统提示登录
3. 完成登录
4. 验证：应该回到 profile.html ✅

## 预期行为总结

| 场景 | 登录前页面 | 预期登录后页面 |
|-----|-----------|--------------|
| 主页登录 | index.html | index.html ✅ |
| Tank 页面登录 | tank.html?view=my | tank.html?view=my ✅ |
| Profile 页面登录 | profile.html | profile.html ✅ |
| 主页登录（有旧的 loginRedirect） | index.html | index.html ✅（忽略旧值）|

## 日志输出

修复后，在控制台会看到以下日志：

### 场景 1：主页显示登录模态框（有旧的 loginRedirect）
```
🧹 Clearing existing loginRedirect on index page: tank.html?view=my
🔐 showLoginModal() called
```

### 场景 2：主页 OAuth 登录（有旧的 loginRedirect）
```
🧹 Clearing existing loginRedirect before OAuth: tank.html?view=my
🔐 Attempting to sign in with google...
```

### 场景 3：主页邮箱登录
```
📍 Email login from index page, redirectUrl: http://localhost:3000/index.html
```

### 场景 4：其他页面登录
```
📍 Email login from other page, redirectUrl: http://localhost:3000/tank.html?view=my
```

## 相关代码逻辑

### loginRedirect 的设置时机

在 `src/js/fish-utils.js` 的 `redirectToLogin()` 方法中：

```javascript
function redirectToLogin(currentPage = null) {
  const redirectUrl = currentPage || window.location.href;
  const currentPath = window.location.pathname;
  
  // 只在非主页时保存 loginRedirect
  if (!currentPath.includes('index.html') && currentPath !== '/') {
    localStorage.setItem('loginRedirect', redirectUrl);
  } else {
    // 在主页时清除 loginRedirect
    localStorage.removeItem('loginRedirect');
  }
  
  // 显示登录模态框
  if (window.authUI && window.authUI.showLoginModal) {
    window.authUI.showLoginModal();
  }
}
```

### OAuth redirectTo 配置

在 `src/js/supabase-init.js` 的 `signInWithOAuth()` 方法中：

```javascript
const redirectTo = `${redirectOrigin}/index.html`;

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: provider,
  options: {
    redirectTo: redirectTo,  // 始终回到 index.html
    skipBrowserRedirect: false
  }
});
```

## 安全性考虑

1. ✅ 只清除主页的 loginRedirect，不影响其他页面的重定向功能
2. ✅ 仍然验证重定向 URL 的安全性（在 login.js 的 validateRedirectUrl）
3. ✅ 不允许跨域重定向
4. ✅ 保持向后兼容性

## 完成日期

2025-11-27

## 相关问题

- OAuth 登录加载状态优化（OAUTH_LOADING_STATE.md）
- 登录重定向逻辑（多个文件涉及）

## 开发者

AI Assistant (Claude)

