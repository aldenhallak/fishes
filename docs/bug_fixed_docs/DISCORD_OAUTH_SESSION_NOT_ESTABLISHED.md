# Discord OAuth Session 未建立问题诊断

## 问题描述

Discord OAuth 授权成功，回调到应用，但是 `INITIAL_SESSION` 事件中 session 是 `undefined`，导致用户无法登录。

### 错误日志

```
🔄 OAuth callback detected, skipping auto-login  ✅ 检测到回调
🔔 认证状态变化: INITIAL_SESSION undefined  ❌ session 是 undefined
❌ 获取用户失败: Auth session missing!
ℹ️ 用户未登录
```

## 可能的原因

### 1. 回调 URL 配置不匹配 ⭐⭐⭐⭐⭐

**最常见的原因**

#### 检查方法

1. **Discord Application 设置**
   - 访问：https://discord.com/developers/applications
   - 选择你的应用
   - OAuth2 → Redirects
   - 检查配置的回调 URL

2. **Supabase Dashboard 设置**
   - 访问：https://app.supabase.com
   - 选择项目：`xxeplxorhecwwhtrakzw`
   - Authentication → Providers → Discord
   - 查看 "Callback URL (for OAuth)"

3. **代码中的配置**
   - 文件：`src/js/supabase-init.js` 第 146 行
   - 当前配置：`redirectTo: '${window.location.origin}/index.html'`

#### 正确的配置

所有三处必须完全一致：

```
Discord Application:
  https://xxeplxorhecwwhtrakzw.supabase.co/auth/v1/callback

Supabase Dashboard:
  https://xxeplxorhecwwhtrakzw.supabase.co/auth/v1/callback

代码中 (开发环境):
  http://localhost:3000/index.html
```

**注意**：
- Discord 配置的是 **Supabase 的回调 URL**，不是你的应用 URL
- 代码中的 `redirectTo` 是 **Supabase 处理完 OAuth 后跳转到的页面**

### 2. Supabase Provider 未正确配置 ⭐⭐⭐⭐

#### 检查方法

1. 访问 Supabase Dashboard
2. Authentication → Providers → Discord
3. 检查：
   - ✅ Discord Enabled 开关是否打开
   - ✅ Client ID 是否正确
   - ✅ Client Secret 是否正确

#### 获取正确的凭证

1. 访问：https://discord.com/developers/applications
2. 选择你的应用
3. OAuth2 → General
4. 复制：
   - **Client ID**（在页面顶部）
   - **Client Secret**（点击 "Reset Secret" 或 "Copy" 获取）

### 3. Discord Application 配置错误 ⭐⭐⭐

#### 检查清单

在 Discord Developer Portal 中：

- [ ] OAuth2 → Redirects 中添加了 Supabase 回调 URL
- [ ] OAuth2 → Scopes 中至少勾选了 `identify` 和 `email`
- [ ] Application 类型正确（不是 Bot）

#### 必需的 Scopes

```
✅ identify - 获取用户基本信息
✅ email - 获取用户邮箱
```

### 4. 浏览器缓存或 Cookie 问题 ⭐⭐

#### 解决方法

1. 清除浏览器缓存
2. 清除 Cookies（特别是 Supabase 相关的）
3. 使用隐私/无痕模式测试
4. 尝试不同的浏览器

### 5. CORS 或网络问题 ⭐

#### 检查方法

1. 打开浏览器开发者工具
2. Network 标签
3. 查看是否有失败的请求
4. 检查是否有 CORS 错误

## 诊断步骤

### 步骤 1：使用调试工具

我已经创建了一个 OAuth 回调调试工具：

```
访问：http://localhost:3000/debug-oauth-callback.html
```

然后重新进行 Discord 登录，授权后会跳转到这个调试页面，显示：
- URL 参数
- OAuth Token
- Session 状态
- 错误信息
- 诊断建议

### 步骤 2：检查 URL 参数

Discord OAuth 回调后，URL 应该包含：

**成功的情况**：
```
http://localhost:3000/index.html#access_token=xxx&refresh_token=xxx&expires_in=3600&token_type=bearer
```

**失败的情况**：
```
http://localhost:3000/index.html?error=access_denied&error_description=...
```

### 步骤 3：手动测试 Supabase Session

在浏览器控制台执行：

```javascript
// 获取 session
const { data: { session }, error } = await window.supabaseAuth.client.auth.getSession();
console.log('Session:', session);
console.log('Error:', error);

// 如果 session 存在，查看用户信息
if (session) {
  console.log('User:', session.user);
  console.log('Provider:', session.user.app_metadata?.provider);
  console.log('User metadata:', session.user.user_metadata);
}
```

### 步骤 4：检查 Supabase Logs

1. 访问 Supabase Dashboard
2. Logs → Auth Logs
3. 查看最近的认证请求
4. 检查是否有错误信息

## 解决方案

### 方案 1：修正回调 URL（最常见）

#### Discord Application 配置

1. 访问：https://discord.com/developers/applications
2. 选择你的应用
3. OAuth2 → Redirects
4. 添加（如果没有）：
   ```
   https://xxeplxorhecwwhtrakzw.supabase.co/auth/v1/callback
   ```
5. 保存

#### 代码配置（可选）

如果你想在开发环境使用不同的回调页面：

```javascript
// src/js/supabase-init.js 第 143-148 行
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: provider,
  options: {
    redirectTo: `${window.location.origin}/debug-oauth-callback.html`,  // 改为调试页面
    skipBrowserRedirect: false
  }
});
```

### 方案 2：重新配置 Discord Provider

1. 访问 Discord Developer Portal
2. 重新生成 Client Secret
3. 复制新的 Client ID 和 Secret
4. 在 Supabase Dashboard 中更新
5. 保存并等待几分钟生效

### 方案 3：使用 PKCE 流程（推荐）

修改 OAuth 配置，使用更安全的 PKCE 流程：

```javascript
// src/js/supabase-init.js
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: provider,
  options: {
    redirectTo: `${window.location.origin}/index.html`,
    skipBrowserRedirect: false,
    // 添加 PKCE
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    }
  }
});
```

### 方案 4：清理并重试

```javascript
// 在浏览器控制台执行
localStorage.clear();
sessionStorage.clear();
await window.supabaseAuth.signOut();
// 然后刷新页面，重新登录
```

## 验证修复

### 成功的标志

1. **URL 中有 token**：
   ```
   #access_token=xxx&refresh_token=xxx
   ```

2. **控制台日志**：
   ```
   🔔 Auth state changed: SIGNED_IN user@example.com
   ✅ 用户已登录: user@example.com
   ```

3. **UI 显示**：
   - 右上角显示用户头像
   - 用户名显示正确

4. **Session 存在**：
   ```javascript
   const { data: { session } } = await window.supabaseAuth.client.auth.getSession();
   console.log(session); // 应该有值
   ```

## 常见错误及解决

### 错误 1：access_denied

```
?error=access_denied&error_description=The+user+denied+access
```

**原因**：用户在 Discord 授权页面点击了"取消"

**解决**：重新登录并点击"授权"

### 错误 2：redirect_uri_mismatch

```
?error=redirect_uri_mismatch
```

**原因**：Discord Application 中配置的回调 URL 与实际不匹配

**解决**：
1. 检查 Discord Application → OAuth2 → Redirects
2. 确保包含：`https://xxeplxorhecwwhtrakzw.supabase.co/auth/v1/callback`

### 错误 3：invalid_client

```
?error=invalid_client
```

**原因**：Client ID 或 Client Secret 错误

**解决**：
1. 重新复制 Discord 的 Client ID 和 Secret
2. 在 Supabase Dashboard 中更新
3. 确保没有多余的空格

### 错误 4：Session 为 null 但有 token

**原因**：Supabase 处理 token 时出错

**解决**：
1. 检查 Supabase Dashboard → Logs
2. 查看是否有 JWT 验证错误
3. 确认 Discord Provider 已启用

## 调试技巧

### 1. 使用调试页面

访问 `debug-oauth-callback.html` 可以看到详细的回调信息。

### 2. 监听认证事件

```javascript
window.supabaseAuth.onAuthStateChange((event, session) => {
  console.log('🔔 Auth Event:', event);
  console.log('📦 Session:', session);
  if (session) {
    console.log('👤 User:', session.user);
  }
});
```

### 3. 检查网络请求

在 Network 标签中查找：
- `auth/v1/token` - Token 交换请求
- `auth/v1/user` - 获取用户信息

### 4. 对比 Google OAuth

如果 Google OAuth 工作正常，对比两者的配置差异。

## 下一步

1. **立即执行**：
   - 访问 `http://localhost:3000/debug-oauth-callback.html`
   - 重新进行 Discord 登录
   - 查看调试信息

2. **检查配置**：
   - Discord Application 回调 URL
   - Supabase Dashboard Discord Provider
   - 代码中的 redirectTo

3. **报告问题**：
   - 如果仍然失败，记录调试页面显示的所有信息
   - 检查 Supabase Logs 中的错误

---

**需要帮助？** 提供以下信息：
1. 调试页面显示的内容
2. Supabase Logs 中的错误
3. Discord Application 的配置截图
