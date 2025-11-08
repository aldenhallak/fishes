# Supabase 邮件认证快速启动指南

## 🚀 5 分钟快速配置

### 第 1 步：检查环境变量（已完成 ✅）

您的 `.env.local` 文件已配置：
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 第 2 步：在 Supabase 中启用邮件认证

访问 [Supabase Dashboard](https://app.supabase.com)：

1. **Authentication** → **Providers** → **Email**
2. ✅ 开启 **Enable Email provider**
3. ⚠️ **关闭** "Confirm email"（开发环境推荐）
4. 点击 **Save**

### 第 3 步：配置回调 URL

在 **Authentication** → **URL Configuration** 中添加：

```
Site URL: http://localhost:3000

Redirect URLs:
  - http://localhost:3000/**
  - http://localhost:3000/index.html
  - http://localhost:3000/reset-password.html
```

### 第 4 步：测试功能

1. 确保开发服务器运行中：
   ```bash
   npm run dev
   ```

2. 访问测试页面：
   - http://localhost:3000/test-auth.html （完整测试）
   - http://localhost:3000/login.html （登录页面）

3. 使用**真实邮箱**测试注册：
   - ❌ 不要用：test@example.com
   - ✅ 使用：your-email@gmail.com

## 🎯 当前状态

### ✅ 已完成
- [x] 环境变量配置完成
- [x] 邮件认证代码已实现
- [x] 登录/注册界面已就绪
- [x] 密码重置功能已更新
- [x] 测试页面可用

### ⚠️ 需要配置
- [ ] **Supabase Dashboard 中启用 Email provider**
- [ ] **关闭 "Confirm email"（开发环境）**
- [ ] **配置回调 URL**
- [ ] **使用真实邮箱测试**

## 🔧 问题排查

### 错误：Email address is invalid

**原因**：使用了 test@example.com 等测试域名

**解决**：
1. 使用真实邮箱（Gmail、QQ 邮箱等）
2. 或者使用临时邮箱服务：https://temp-mail.org/

### 错误：Provider email is disabled

**原因**：Supabase 中未启用 Email provider

**解决**：
1. 访问 Supabase Dashboard
2. Authentication → Providers → Email
3. 开启 "Enable Email provider"

## 📚 完整文档

详细配置说明请查看：
- `docs/SUPABASE_EMAIL_AUTH_SETUP.md` - 完整配置指南
- `env.local.example` - 环境变量示例

## 🧪 测试页面

### test-auth.html
功能测试页面，包含：
- 用户注册
- 用户登录
- 密码重置
- 认证状态显示

### login.html
生产环境登录页面：
- Sign In / Sign Up 切换
- 忘记密码功能
- Google OAuth（可选）

### reset-password.html
密码重置页面：
- 处理邮件重置链接
- 设置新密码
- 已更新为 Supabase Auth API

## ⚡ 开发模式快速设置

为了快速开发测试，建议临时配置：

```
Supabase Dashboard:
└─ Authentication
   └─ Providers
      └─ Email
         ├─ Enable Email provider: ✅ ON
         └─ Confirm email: ❌ OFF (开发环境)
```

这样注册后可以直接登录，无需验证邮箱。

## 📞 需要帮助？

如果遇到问题：

1. 查看浏览器控制台错误信息
2. 检查 Supabase Dashboard → Logs
3. 参考 `docs/SUPABASE_EMAIL_AUTH_SETUP.md` 详细指南

---

**下一步**：完成上述配置后，使用真实邮箱在 `test-auth.html` 中测试注册功能！

