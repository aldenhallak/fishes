# Discord OAuth 登录测试步骤

## ✅ OAuth 配置已成功

从调试页面可以看到：
- ✅ Access Token 已获取
- ✅ Refresh Token 已获取
- ✅ 用户信息：tey7101@outlook.com
- ✅ Discord 用户名：tey7178

## 🧪 完整登录测试

### 步骤 1：清除状态

在浏览器控制台执行：
```javascript
localStorage.clear();
sessionStorage.clear();
await window.supabaseAuth?.signOut();
```

### 步骤 2：刷新页面

访问：`http://localhost:3000/index.html`

### 步骤 3：Discord 登录

1. 点击登录按钮
2. 选择 "Sign in with Discord"
3. 授权（如果需要）
4. 等待跳转回 index.html

### 步骤 4：验证成功标志

#### 控制台日志应该显示：

```
✅ Supabase config loaded from API
✅ Supabase client initialized
🔄 OAuth callback detected, skipping auto-login  ✅ 检测到 OAuth 回调
🔔 Auth state changed: SIGNED_IN tey7101@outlook.com  ✅ 登录成功
✅ 用户已登录: tey7101@outlook.com
🔍 检查用户是否存在于数据库: 96b328e6-fc0c-4aee-b657-8dc2ecbb2da5
📋 用户元数据: {
  avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png",
  custom_claims: { global_name: "tey" },
  email: "tey7101@outlook.com",
  email_verified: true,
  full_name: "tey7178",
  name: "tey7178#0",
  picture: "https://cdn.discordapp.com/embed/avatars/0.png",
  provider_id: "1204445502658318346"
}
```

#### UI 应该显示：

- ✅ 右上角显示用户头像（Discord 头像）
- ✅ 用户名显示为 "tey7178" 或 "tey"
- ✅ 点击头像显示菜单

#### 数据库应该：

- ✅ 自动创建用户记录（如果不存在）
- ✅ 用户 ID：96b328e6-fc0c-4aee-b657-8dc2ecbb2da5
- ✅ 邮箱：tey7101@outlook.com
- ✅ 显示名称：tey7178

## 🐛 如果仍然有问题

### 问题 A：显示"用户未登录"

**可能原因**：`onAuthStateChange` 中的 session 处理有问题

**检查**：
```javascript
// 在控制台执行
const { data: { session } } = await window.supabaseAuth.client.auth.getSession();
console.log('Session:', session);
console.log('User:', session?.user);
```

### 问题 B：显示邮箱账号而不是 Discord 账号

**可能原因**：自动登录仍然触发

**检查控制台**：
- 应该看到：`🔄 OAuth callback detected, skipping auto-login`
- 不应该看到：`🔧 Auto-login enabled`

### 问题 C：URL 中有 token 但没有登录

**可能原因**：`updateAuthUI` 没有正确处理 session.user

**检查**：
```javascript
// 查看 auth state change 事件
window.supabaseAuth.onAuthStateChange((event, session) => {
  console.log('Event:', event);
  console.log('Session:', session);
  console.log('User:', session?.user);
});
```

## 📊 预期的用户数据

从 JWT token 解码可以看到：

```json
{
  "sub": "96b328e6-fc0c-4aee-b657-8dc2ecbb2da5",
  "email": "tey7101@outlook.com",
  "app_metadata": {
    "provider": "discord",
    "providers": ["discord"]
  },
  "user_metadata": {
    "avatar_url": "https://cdn.discordapp.com/embed/avatars/0.png",
    "custom_claims": {
      "global_name": "tey"
    },
    "email": "tey7101@outlook.com",
    "email_verified": true,
    "full_name": "tey7178",
    "name": "tey7178#0",
    "picture": "https://cdn.discordapp.com/embed/avatars/0.png",
    "provider_id": "1204445502658318346"
  }
}
```

## 🎯 成功标准

- ✅ Discord OAuth 授权成功
- ✅ 获取到 access_token 和 refresh_token
- ✅ Supabase session 建立成功
- ✅ 用户信息正确显示（Discord 账号）
- ✅ 数据库中创建用户记录
- ✅ 自动登录不会覆盖 OAuth 登录

## 🔄 如果需要切换回邮箱登录

1. 登出
2. 修改 `.env.local`：
   ```bash
   LOGIN_MODE=AUTO
   ```
3. 刷新页面
4. 会自动使用邮箱登录

## 📝 下一步

测试成功后：
1. 测试其他 OAuth 提供商（Google, Twitter, Reddit 等）
2. 更新文档
3. 部署到生产环境

---

**测试时间**：2025-11-19
**测试状态**：✅ OAuth 配置成功，等待完整流程测试
