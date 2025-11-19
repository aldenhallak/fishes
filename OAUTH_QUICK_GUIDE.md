# 社交登录快速配置指南

## 📊 当前状态

✅ **代码已完成**：前端和后端已支持所有平台  
⚠️ **需要配置**：在 Supabase Dashboard 中启用各平台

## 🎯 支持的平台

| 平台 | 状态 | 难度 | 成本 | 推荐度 |
|------|------|------|------|--------|
| Google | ✅ 已配置 | ⭐⭐ | 免费 | ⭐⭐⭐⭐⭐ |
| Discord | ⚠️ 待配置 | ⭐⭐ | 免费 | ⭐⭐⭐⭐⭐ |
| Reddit | ⚠️ 待配置 | ⭐⭐ | 免费 | ⭐⭐⭐⭐ |
| Twitter | ⚠️ 待配置 | ⭐⭐⭐ | 免费* | ⭐⭐⭐⭐ |
| Facebook | ⚠️ 待配置 | ⭐⭐⭐ | 免费 | ⭐⭐⭐⭐ |
| Apple | ⚠️ 待配置 | ⭐⭐⭐⭐⭐ | $99/年 | ⭐⭐ |

*Twitter 免费版有 API 限制

## 🚀 推荐实施顺序

### 第一批（立即实施）
1. **Discord** - 30分钟，最简单
2. **Reddit** - 30分钟，很简单

### 第二批（1-2周内）
3. **Twitter** - 1小时，需要开发者账号
4. **Facebook** - 2小时，需要审核

### 第三批（长期考虑）
5. **Apple** - 需要付费开发者账号

## 📝 配置步骤概览

### 1. Discord（推荐首选）

```
1. 访问 https://discord.com/developers/applications
2. 创建新应用
3. OAuth2 → 添加回调 URL:
   https://xxeplxorhecwwhtrakzw.supabase.co/auth/v1/callback
4. 复制 Client ID 和 Client Secret
5. Supabase Dashboard → Authentication → Providers → Discord
6. 粘贴凭证，保存
```

### 2. Reddit

```
1. 访问 https://www.reddit.com/prefs/apps
2. 创建 "web app"
3. 设置回调 URL:
   https://xxeplxorhecwwhtrakzw.supabase.co/auth/v1/callback
4. 复制 Client ID 和 Secret
5. Supabase Dashboard → Authentication → Providers → Reddit
6. 粘贴凭证，保存
```

### 3. Twitter

```
1. 访问 https://developer.twitter.com/en/portal/dashboard
2. 创建项目和应用（需要开发者账号）
3. 启用 OAuth 2.0
4. 设置回调 URL:
   https://xxeplxorhecwwhtrakzw.supabase.co/auth/v1/callback
5. 复制 Client ID 和 Secret
6. Supabase Dashboard → Authentication → Providers → Twitter
7. 粘贴凭证，保存
```

### 4. Facebook

```
1. 访问 https://developers.facebook.com/
2. 创建应用（Consumer 类型）
3. 添加 Facebook Login 产品
4. 设置回调 URL:
   https://xxeplxorhecwwhtrakzw.supabase.co/auth/v1/callback
5. 复制 App ID 和 App Secret
6. Supabase Dashboard → Authentication → Providers → Facebook
7. 粘贴凭证，保存
8. 开发模式下添加测试用户
```

## ⚠️ 重要提醒

### Apple 登录的特殊情况

**需要**：
- Apple Developer 账号（$99/年）
- 复杂的配置流程（App ID, Service ID, 私钥等）

**建议**：
- 如果没有 Apple Developer 账号，**暂时跳过**
- 可以在前端隐藏 Apple 登录按钮
- 仅在有 iOS 应用计划时再考虑

### 隐藏未配置的平台

如果某些平台暂时不配置，可以修改 `src/js/auth-ui.js`:

```javascript
const OAUTH_PROVIDERS = [
  { id: 'google', name: 'Google', enabled: true, ... },
  { id: 'discord', name: 'Discord', enabled: false, ... },  // 设为 false
  // ...
].filter(p => p.enabled);  // 添加过滤
```

## ✅ 测试清单

配置完成后，测试每个平台：

- [ ] 点击登录按钮
- [ ] 跳转到 OAuth 提供商
- [ ] 授权并回调
- [ ] 用户信息正确显示
- [ ] 头像和名称正确
- [ ] 登出功能正常
- [ ] 再次登录使用现有账号

## 🔧 故障排查

### 错误：Provider is not enabled

**原因**：Supabase 中未启用该提供商

**解决**：
1. 检查 Supabase Dashboard → Authentication → Providers
2. 确保对应平台已启用（开关打开）
3. 确认 Client ID 和 Secret 正确

### 错误：Redirect URI mismatch

**原因**：回调 URL 配置不匹配

**解决**：
1. 确保使用 Supabase 标准回调 URL：
   ```
   https://xxeplxorhecwwhtrakzw.supabase.co/auth/v1/callback
   ```
2. 在各平台开发者控制台中检查回调 URL
3. 确保没有多余的斜杠或参数

### 错误：Invalid credentials

**原因**：Client ID 或 Secret 错误

**解决**：
1. 重新复制凭证（注意不要有空格）
2. 确认使用的是正确的凭证类型（OAuth 2.0）
3. 检查凭证是否过期或被撤销

## 📚 详细文档

完整的实施计划和详细步骤，请查看：
- `docs/setup/OAUTH_PROVIDERS_IMPLEMENTATION_PLAN.md`

## 🎯 建议的下一步

1. **立即开始**：配置 Discord（30分钟）
2. **本周完成**：配置 Reddit（30分钟）
3. **下周计划**：配置 Twitter 或 Facebook
4. **长期考虑**：Apple（如有需要）

---

**需要帮助？** 查看浏览器控制台和 Supabase Logs
