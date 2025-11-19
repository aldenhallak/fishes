# Twitter/X OAuth 配置指南

## 前提条件

- Twitter/X 开发者账号
- 已创建 Twitter App

## 配置步骤

### 1. 访问 Twitter Developer Portal

访问：https://developer.twitter.com/en/portal/dashboard

### 2. 创建或选择应用

如果还没有应用：
1. 点击 **+ Create Project**
2. 填写项目信息
3. 创建 App

如果已有应用：
1. 在 Dashboard 中选择你的应用
2. 点击应用名称进入设置

### 3. 配置 User Authentication Settings

这是最关键的步骤！

1. 在应用设置页面，找到 **User authentication settings**
2. 点击 **Set up** 或 **Edit**

#### 3.1 App permissions

选择应用需要的权限：
- ✅ **Read**（必需，用于读取用户信息）
- ⚪ Read and Write（如果需要发推）
- ⚪ Read and Write and Direct Messages（如果需要私信）

**推荐**：只选择 `Read`

#### 3.2 Type of App

选择：
- ✅ **Web App, Automated App or Bot**

#### 3.3 App info

填写以下信息：

**Callback URI / Redirect URL**（最重要）：
```
https://xxeplxorhecwwhtrakzw.supabase.co/auth/v1/callback
```

**Website URL**：
```
http://localhost:3000
```
或你的实际域名（如果有）

**Terms of service**（可选）：
```
http://localhost:3000/terms
```

**Privacy policy**（可选）：
```
http://localhost:3000/privacy
```

#### 3.4 保存

点击 **Save** 保存配置

### 4. 获取 OAuth 2.0 凭证

1. 返回应用设置页面
2. 找到 **Keys and tokens** 标签
3. 在 **OAuth 2.0 Client ID and Client Secret** 部分：
   - 复制 **Client ID**
   - 点击 **Generate** 生成 Client Secret
   - 复制 **Client Secret**（只显示一次，请妥善保存）

**重要**：
- ✅ 使用 **OAuth 2.0** 凭证
- ❌ 不要使用 OAuth 1.0a 的 API Key

### 5. 在 Supabase 中配置

1. 访问 Supabase Dashboard：https://app.supabase.com
2. 选择项目：`xxeplxorhecwwhtrakzw`
3. 左侧菜单：**Authentication** → **Providers**
4. 找到 **Twitter**
5. 启用 Twitter provider
6. 粘贴凭证：
   - **Client ID**：粘贴 OAuth 2.0 Client ID
   - **Client Secret**：粘贴 OAuth 2.0 Client Secret
7. 点击 **Save**

### 6. 测试登录

1. 清除浏览器缓存：
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. 访问：`http://localhost:3000/index.html`

3. 点击登录 → Twitter/X

4. 授权后应该成功登录

## 常见错误及解决

### 错误 1：`requested path is invalid`

**原因**：Callback URI 配置错误或未配置

**解决**：
1. 检查 Twitter App → User authentication settings
2. 确认 Callback URI 完全匹配：
   ```
   https://xxeplxorhecwwhtrakzw.supabase.co/auth/v1/callback
   ```
3. 注意：
   - ✅ 使用 `https://`
   - ✅ 是 Supabase 的域名
   - ❌ 不是 `localhost`

### 错误 2：`OAuth 1.0a is not supported`

**原因**：使用了错误的凭证类型

**解决**：
1. 在 Twitter Developer Portal
2. Keys and tokens 标签
3. 使用 **OAuth 2.0 Client ID and Client Secret**
4. 不要使用 API Key 和 API Key Secret

### 错误 3：`403 Forbidden`

**原因**：App permissions 不足

**解决**：
1. User authentication settings → App permissions
2. 至少选择 `Read`
3. 保存后重新生成 Client Secret

### 错误 4：`callback_url_mismatch`

**原因**：回调 URL 不匹配

**解决**：
1. 检查 Callback URI 是否有多余的空格
2. 确保完全匹配（包括 https、域名、路径）
3. 如果修改了配置，等待几分钟生效

## Twitter OAuth 特殊说明

### OAuth 2.0 vs OAuth 1.0a

Twitter 支持两种 OAuth 版本：

| 特性 | OAuth 2.0 | OAuth 1.0a |
|------|-----------|------------|
| Supabase 支持 | ✅ 是 | ❌ 否 |
| 配置复杂度 | 简单 | 复杂 |
| 安全性 | 更高 | 较低 |
| 推荐使用 | ✅ | ❌ |

**重要**：Supabase 只支持 OAuth 2.0，必须使用 OAuth 2.0 凭证。

### Callback URI 要求

Twitter 对回调 URL 的要求：

- ✅ 必须使用 HTTPS（生产环境）
- ✅ 必须在 App settings 中精确配置
- ✅ 支持多个回调 URL（用换行分隔）
- ❌ 不支持通配符
- ❌ localhost 只能用于开发测试

### 开发环境 vs 生产环境

**开发环境**：
- Callback URI：`https://xxeplxorhecwwhtrakzw.supabase.co/auth/v1/callback`
- Website URL：`http://localhost:3000`

**生产环境**：
- Callback URI：`https://xxeplxorhecwwhtrakzw.supabase.co/auth/v1/callback`（相同）
- Website URL：`https://your-domain.com`

## 验证配置

### 1. 检查 Twitter App 配置

在 Twitter Developer Portal 中：

```
✅ User authentication settings 已配置
✅ Type of App = Web App
✅ Callback URI = https://xxeplxorhecwwhtrakzw.supabase.co/auth/v1/callback
✅ App permissions = Read（至少）
✅ OAuth 2.0 Client ID 已生成
✅ OAuth 2.0 Client Secret 已生成
```

### 2. 检查 Supabase 配置

在 Supabase Dashboard 中：

```
✅ Twitter provider 已启用
✅ Client ID 已填写（OAuth 2.0）
✅ Client Secret 已填写（OAuth 2.0）
✅ 已保存
```

### 3. 测试登录

预期的控制台日志：

```
✅ 正在使用 twitter 登录...
🔔 Auth state changed: SIGNED_IN user@example.com
✅ 用户已登录: user@example.com
```

## 获取用户信息

Twitter OAuth 返回的用户元数据：

```json
{
  "user_metadata": {
    "avatar_url": "https://pbs.twimg.com/profile_images/...",
    "email": "user@example.com",
    "email_verified": true,
    "full_name": "User Name",
    "name": "username",
    "picture": "https://pbs.twimg.com/profile_images/...",
    "provider_id": "1234567890",
    "sub": "1234567890"
  },
  "app_metadata": {
    "provider": "twitter",
    "providers": ["twitter"]
  }
}
```

## 限制和注意事项

### Twitter API 限制

- 免费账号有 API 调用限制
- OAuth 登录计入 API 配额
- 建议升级到付费计划（如果需要高频使用）

### 邮箱访问

- Twitter 可能不返回用户邮箱
- 需要在 App permissions 中请求 email scope
- 用户可以选择不分享邮箱

### 用户名格式

- Twitter 用户名不包含 `@` 符号
- 显示名称（display name）可能包含特殊字符
- 建议使用 `user_metadata.name` 作为用户名

## 故障排查

### 如果登录失败

1. **检查浏览器控制台**：
   - 查看错误信息
   - 检查网络请求

2. **检查 Supabase Logs**：
   - Dashboard → Logs → Auth Logs
   - 查看详细错误信息

3. **验证凭证**：
   - 确认使用 OAuth 2.0 凭证
   - 重新生成 Client Secret

4. **检查回调 URL**：
   - 确保完全匹配
   - 检查是否有拼写错误

5. **等待生效**：
   - 修改配置后等待 1-2 分钟
   - 清除浏览器缓存

## 参考资料

- Twitter Developer Portal：https://developer.twitter.com/en/portal/dashboard
- Twitter OAuth 2.0 文档：https://developer.twitter.com/en/docs/authentication/oauth-2-0
- Supabase Twitter Auth 文档：https://supabase.com/docs/guides/auth/social-login/auth-twitter

---

**配置日期**：2025-11-19
**状态**：待测试
