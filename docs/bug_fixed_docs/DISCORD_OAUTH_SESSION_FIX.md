# Discord OAuth 登录 Session 问题修复

## 修复日期
2025-11-19

## 问题描述

Discord OAuth 登录后，Supabase 回调成功，但用户信息没有显示。

### 错误日志
```
supabase-init.js:207  🔔 认证状态变化: INITIAL_SESSION undefined
auth-ui.js:82 🔔 Auth state changed: INITIAL_SESSION
supabase-init.js:173  ❌ 获取用户失败: Auth session missing!
```

### 根本原因

1. **时序问题**：OAuth 回调后，`onAuthStateChange` 触发 `INITIAL_SESSION` 事件，但此时 session 可能是 `undefined`

2. **重复获取用户**：`updateAuthUI()` 方法调用 `getCurrentUser()` 重新获取用户，但此时 session 还未建立，导致 "Auth session missing!" 错误

3. **数据丢失**：虽然 `onAuthStateChange` 回调中已经有 `session.user` 数据，但没有使用，而是重新获取导致失败

## 解决方案

### 修改 1：传递 session.user 到 updateAuthUI

**文件**：`src/js/auth-ui.js`

**位置**：`initializeAsync()` 方法（第 75-93 行）

**修改前**：
```javascript
window.supabaseAuth.onAuthStateChange((event, session) => {
  console.log('🔔 Auth state changed:', event);
  this.updateAuthUI();  // ❌ 没有使用 session.user
});
```

**修改后**：
```javascript
window.supabaseAuth.onAuthStateChange((event, session) => {
  console.log('🔔 Auth state changed:', event, session?.user?.email || 'no user');
  // ✅ 传递 session 中的 user，避免重新获取
  this.updateAuthUI(session?.user || null);
});
```

### 修改 2：updateAuthUI 接受可选的 user 参数

**文件**：`src/js/auth-ui.js`

**位置**：`updateAuthUI()` 方法（第 624-660 行）

**修改前**：
```javascript
async updateAuthUI() {
  if (!window.supabaseAuth) return;
  
  const user = await window.supabaseAuth.getCurrentUser();  // ❌ 总是重新获取
  this.currentUser = user;
  // ...
}
```

**修改后**：
```javascript
async updateAuthUI(userFromSession = null) {
  if (!window.supabaseAuth) return;
  
  // ✅ 优先使用传入的 user，否则重新获取
  let user = userFromSession;
  if (user === null) {
    user = await window.supabaseAuth.getCurrentUser();
  }
  
  this.currentUser = user;
  
  if (user) {
    console.log('✅ 用户已登录:', user.email);
    // ...
  } else {
    console.log('ℹ️ 用户未登录');
    // ...
  }
}
```

### 修改 3：增强 Discord 用户信息提取

**文件**：`src/js/auth-ui.js`

**位置**：`ensureUserExistsInDatabase()` 方法（第 665-760 行）

**增强内容**：
1. 添加详细的调试日志
2. 支持更多 Discord 用户元数据字段

**修改后**：
```javascript
async ensureUserExistsInDatabase(user) {
  try {
    console.log('🔍 检查用户是否存在于数据库:', user.id);
    console.log('📋 用户元数据:', user.user_metadata);
    
    // ... 检查用户逻辑 ...
    
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
    
    // ... 创建用户逻辑 ...
  }
}
```

## 工作原理

### 修复前的流程
```
Discord OAuth 回调
  ↓
onAuthStateChange(INITIAL_SESSION, session)
  ↓
updateAuthUI()
  ↓
getCurrentUser() ❌ 失败：Auth session missing!
  ↓
用户信息丢失
```

### 修复后的流程
```
Discord OAuth 回调
  ↓
onAuthStateChange(INITIAL_SESSION, session)
  ↓
updateAuthUI(session.user) ✅ 直接使用 session 中的 user
  ↓
保存用户信息到 localStorage
  ↓
创建数据库用户记录
  ↓
显示用户菜单 ✅ 成功
```

## 测试步骤

### 1. 清除旧数据
```javascript
// 在浏览器控制台执行
localStorage.clear();
```

### 2. 测试 Discord 登录
1. 访问应用首页
2. 点击登录按钮
3. 选择 "Sign in with Discord"
4. 在 Discord 授权页面点击 "Authorize"
5. 等待回调到应用

### 3. 验证成功标志

**控制台日志应该显示**：
```
✅ Supabase config loaded from API
✅ Supabase client initialized
🔔 Auth state changed: SIGNED_IN user@example.com
✅ 用户已登录: user@example.com
🔍 检查用户是否存在于数据库: xxx-xxx-xxx
📋 用户元数据: { full_name: "...", avatar_url: "...", ... }
👤 提取的用户信息: { displayName: "...", avatarUrl: "...", email: "..." }
📝 创建新用户记录: xxx-xxx-xxx
✅ 用户记录创建成功
```

**UI 应该显示**：
- ✅ 右上角显示用户头像和名称
- ✅ 点击头像显示下拉菜单
- ✅ 菜单中有 "Profile", "My Fish", "Sign Out" 等选项

### 4. 验证数据库
查询 `users` 表，应该有新创建的记录：
```sql
SELECT id, email, display_name, avatar_url 
FROM users 
WHERE email = 'your-discord-email@example.com';
```

### 5. 测试再次登录
1. 刷新页面
2. 应该自动保持登录状态
3. 控制台应该显示：
   ```
   ✅ 用户已登录: user@example.com
   ✅ 用户已存在于数据库中
   ```

## Discord 用户元数据字段

Discord OAuth 提供的用户元数据可能包含：

| 字段 | 说明 | 示例 |
|------|------|------|
| `full_name` | 全名 | "John Doe" |
| `name` | 用户名 | "johndoe" |
| `user_name` | 用户名（备用） | "johndoe" |
| `preferred_username` | 首选用户名 | "johndoe#1234" |
| `avatar_url` | 头像 URL | "https://cdn.discordapp.com/avatars/..." |
| `email` | 邮箱 | "user@example.com" |
| `email_verified` | 邮箱是否验证 | true |
| `provider_id` | Discord 用户 ID | "123456789" |

## 兼容性

此修复同时兼容：
- ✅ Google OAuth
- ✅ Discord OAuth
- ✅ 其他 OAuth 提供商（Twitter, Facebook, Reddit, Apple）
- ✅ 邮箱/密码登录

## 注意事项

1. **首次登录**：Discord 用户首次登录时会自动创建 `users` 表记录
2. **用户名优先级**：优先使用 `full_name`，其次 `name`，最后使用邮箱前缀
3. **头像 URL**：Discord 提供的头像 URL 是 CDN 链接，可以直接使用
4. **邮箱验证**：Discord OAuth 返回的邮箱已验证，无需额外验证

## 相关文件

- `src/js/auth-ui.js` - 认证 UI 组件
- `src/js/supabase-init.js` - Supabase 初始化
- `docs/bug_fixed_docs/AUTO_CREATE_USER_ON_OAUTH_LOGIN.md` - OAuth 自动创建用户文档

## 后续优化建议

1. **错误重试**：如果创建用户失败，可以添加重试机制
2. **离线支持**：缓存用户信息，支持离线访问
3. **用户信息更新**：定期同步 Discord 头像和用户名变更
4. **多账号绑定**：支持同一用户绑定多个 OAuth 账号

---

**修复状态**：✅ 已完成并测试通过
