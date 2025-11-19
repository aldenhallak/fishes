# OAuth 登录与自动登录冲突修复

## 修复日期
2025-11-19

## 问题描述

Discord OAuth 登录成功后，开发环境的自动登录功能立即覆盖了 OAuth 登录，导致显示的是邮箱账号而不是 Discord 账号。

### 问题表现

1. 用户点击 Discord 登录
2. Discord 授权成功，回调到应用
3. 应用检测到 `INITIAL_SESSION undefined`（session 还未建立）
4. 自动登录功能认为用户未登录，触发邮箱登录
5. 最终显示的是邮箱账号 `lovetey7101@2925.com`，而不是 Discord 账号

### 错误日志

```
🔔 Auth state changed: INITIAL_SESSION no user
ℹ️ 用户未登录
🔍 Checking auto-login configuration...
🔧 Auto-login enabled (LOGIN_MODE=AUTO)
📧 Email: lovetey7101@2925.com
✅ Auto-login successful
🔔 Auth state changed: SIGNED_IN lovetey7101@2925.com  ❌ 覆盖了 Discord 登录
```

## 根本原因

### 时序问题

```
1. Discord OAuth 回调
   ↓
2. onAuthStateChange(INITIAL_SESSION, undefined)
   ↓ (session 还未建立)
3. checkAutoLogin() 执行
   ↓
4. getCurrentUser() 返回 null
   ↓
5. 自动登录触发 ❌
   ↓
6. 邮箱登录覆盖 OAuth 登录
```

### 核心问题

`checkAutoLogin()` 在 OAuth 回调完成后立即执行，但此时：
- OAuth session 还未完全建立
- `getCurrentUser()` 返回 null
- 自动登录误认为用户未登录

## 解决方案

### 修改：检测 OAuth 回调参数

在 `checkAutoLogin()` 开始时，检查 URL 是否包含 OAuth 回调参数。如果有，则跳过自动登录。

**文件**：`src/js/auth-ui.js`

**位置**：`checkAutoLogin()` 方法（第 118-130 行）

**修改内容**：

```javascript
async checkAutoLogin() {
  // ✅ 检查 URL 中是否有 OAuth 回调参数
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
  
  // ... 其他自动登录逻辑
}
```

## OAuth 回调参数说明

不同的 OAuth 提供商可能使用不同的回调参数：

| 参数 | 说明 | 示例 |
|------|------|------|
| `code` | OAuth 授权码（query string） | `?code=abc123` |
| `access_token` | 访问令牌（hash fragment） | `#access_token=xyz789` |
| `error` | OAuth 错误 | `?error=access_denied` |

Supabase 使用 **hash fragment** 方式传递 token：
```
https://your-app.com/index.html#access_token=...&refresh_token=...&expires_in=3600
```

因此需要同时检查 `window.location.search` 和 `window.location.hash`。

## 工作原理

### 修复前的流程

```
Discord OAuth 回调
  ↓
URL: index.html#access_token=...
  ↓
checkAutoLogin() 执行
  ↓
getCurrentUser() → null (session 未建立)
  ↓
自动登录触发 ❌
  ↓
邮箱登录覆盖 Discord 登录
```

### 修复后的流程

```
Discord OAuth 回调
  ↓
URL: index.html#access_token=...
  ↓
checkAutoLogin() 执行
  ↓
检测到 access_token 参数 ✅
  ↓
跳过自动登录
  ↓
等待 OAuth session 建立
  ↓
显示 Discord 账号 ✅
```

## 测试步骤

### 1. 清除所有登录状态

```javascript
// 在浏览器控制台执行
localStorage.clear();
await window.supabaseAuth.signOut();
```

### 2. 测试 Discord OAuth 登录

1. 刷新页面
2. 点击登录按钮
3. 选择 "Sign in with Discord"
4. 在 Discord 授权页面点击 "Authorize"
5. 等待回调到应用

### 3. 验证成功标志

**控制台日志应该显示**：

```
✅ Supabase config loaded from API
✅ Supabase client initialized
🔄 OAuth callback detected, skipping auto-login  ✅ 关键日志
🔔 Auth state changed: SIGNED_IN discord-user@example.com
✅ 用户已登录: discord-user@example.com
```

**不应该出现**：
```
❌ 🔧 Auto-login enabled (LOGIN_MODE=AUTO)
❌ 📧 Email: lovetey7101@2925.com
```

**UI 应该显示**：
- ✅ Discord 账号的头像和名称
- ✅ 不是邮箱账号 `lovetey7101`

### 4. 测试正常的自动登录

为了确保自动登录功能仍然正常工作：

1. 登出
2. 清除 URL 中的 hash（直接访问 `http://localhost:3000/index.html`）
3. 刷新页面
4. 应该自动使用邮箱登录

**控制台日志应该显示**：
```
🔍 Checking auto-login configuration...
🔧 Auto-login enabled (LOGIN_MODE=AUTO)
📧 Email: lovetey7101@2925.com
✅ Auto-login successful
```

## 兼容性

此修复兼容：
- ✅ 所有 OAuth 提供商（Google, Discord, Twitter, Facebook, Reddit, Apple）
- ✅ 邮箱/密码登录
- ✅ 开发环境自动登录功能
- ✅ 生产环境（不受影响，因为自动登录仅在 localhost 启用）

## 检测的 OAuth 参数

| 参数 | 位置 | 提供商 |
|------|------|--------|
| `code` | Query string | 部分 OAuth 2.0 提供商 |
| `access_token` | Query string / Hash | Supabase, 部分提供商 |
| `error` | Query string | 所有提供商（错误情况） |

## 注意事项

1. **Hash Fragment**：Supabase 使用 hash fragment (`#`) 传递 token，不是 query string (`?`)
2. **URL 清理**：OAuth 登录成功后，Supabase 会自动清理 URL 中的 token
3. **自动登录范围**：仅在 localhost 且 index.html 页面启用
4. **生产环境**：不受影响，因为 `LOGIN_MODE=AUTO` 仅用于开发

## 相关文件

- `src/js/auth-ui.js` - 认证 UI 组件
- `.env.local` - 环境变量配置（LOGIN_MODE, DEF_USER, DEF_PASS）
- `docs/bug_fixed_docs/DISCORD_OAUTH_SESSION_FIX.md` - OAuth session 修复文档

## 后续优化建议

1. **延迟自动登录**：在 `initializeAsync()` 中延迟执行 `checkAutoLogin()`，等待 OAuth session 完全建立
2. **Session 检测**：使用 `getSession()` 而不是 `getCurrentUser()` 来检测登录状态
3. **配置选项**：添加环境变量控制是否跳过 OAuth 回调检测

## 开发环境配置

如果你想临时禁用自动登录，可以修改 `.env.local`：

```bash
# 禁用自动登录
LOGIN_MODE=MANUAL

# 或者删除凭证
# DEF_USER=
# DEF_PASS=
```

---

**修复状态**：✅ 已完成并测试通过
