# Supabase 邮件认证配置指南

## 概述

本指南帮助您在 Supabase 项目中正确配置邮件认证功能，包括用户注册、登录和密码重置。

## 问题诊断

如果遇到 "Email address is invalid" 错误，通常是由以下原因导致：

1. **邮件提供商未启用**
2. **使用了测试域名邮箱**（如 example.com）
3. **邮件确认设置不当**
4. **邮件模板未配置**

## 配置步骤

### 1. 启用邮件认证提供商

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目
3. 点击左侧菜单 **Authentication** → **Providers**
4. 找到 **Email** 提供商
5. 确保 **Enable Email provider** 已开启
6. 点击 **Save** 保存

### 2. 配置邮件设置

#### 方法 A：使用 Supabase 内置邮件服务（推荐用于开发）

1. 在 **Authentication** → **Providers** → **Email** 中
2. 确保以下设置：
   - ✅ **Enable Email provider**: 已开启
   - ✅ **Confirm email**: 根据需求选择
     - 开启：用户注册后需要点击邮件链接确认
     - 关闭：用户注册后直接登录（开发环境推荐）
   - ✅ **Secure email change**: 建议开启

3. **重要**：在开发阶段，建议**关闭** "Confirm email" 以便快速测试

#### 方法 B：使用自定义 SMTP（推荐用于生产）

1. 进入 **Project Settings** → **Auth** → **SMTP Settings**
2. 配置您的 SMTP 服务器：
   ```
   Host: smtp.gmail.com (或其他 SMTP 服务器)
   Port: 587
   Username: your-email@gmail.com
   Password: your-app-password
   Sender email: your-email@gmail.com
   Sender name: Fish Art
   ```

3. 常用 SMTP 服务器配置：
   - **Gmail**: `smtp.gmail.com:587`
   - **QQ 邮箱**: `smtp.qq.com:587`
   - **163 邮箱**: `smtp.163.com:465`
   - **阿里云邮件**: `smtpdm.aliyun.com:465`

### 3. 配置邮件模板

1. 进入 **Authentication** → **Email Templates**
2. 配置以下模板：

#### 注册确认邮件 (Confirm signup)
```html
<h2>Welcome to Fish Art!</h2>
<p>Please click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

#### 密码重置邮件 (Reset password)
```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

#### 邮箱更改确认 (Change email address)
```html
<h2>Confirm Email Change</h2>
<p>Click the link below to confirm your new email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email Change</a></p>
```

### 4. 配置回调 URL

1. 进入 **Authentication** → **URL Configuration**
2. 设置以下 URL：

```
Site URL: http://localhost:3000 (开发环境)
        或 https://your-domain.com (生产环境)

Redirect URLs:
  - http://localhost:3000/**
  - https://your-domain.com/**
```

### 5. 测试邮件功能

#### 使用真实邮箱测试

**不要使用 test@example.com 等测试域名！**

建议使用：
- 您的真实邮箱（Gmail、QQ 邮箱等）
- 临时邮箱服务（如 [TempMail](https://temp-mail.org/)）

#### 测试步骤

1. 访问 `http://localhost:3000/test-auth.html`
2. 切换到"注册测试"标签
3. 使用真实邮箱注册：
   ```
   邮箱: your-real-email@gmail.com
   密码: test123456
   确认密码: test123456
   ```
4. 检查结果：
   - **已关闭邮件确认**：注册成功，直接登录
   - **已开启邮件确认**：检查邮箱，点击确认链接

### 6. 开发环境快速设置（跳过邮件验证）

如果您想在开发环境中快速测试，可以临时禁用邮件确认：

1. 进入 **Authentication** → **Providers** → **Email**
2. **关闭** "Confirm email"
3. 点击 **Save**

这样注册后会立即登录，无需邮件确认。

## 常见问题

### Q1: "Email address is invalid" 错误

**原因**：
- 使用了测试域名邮箱（example.com, test.com 等）
- 邮箱格式不正确
- Supabase 邮件提供商未启用

**解决方案**：
1. 使用真实邮箱地址
2. 检查邮件提供商是否已启用
3. 在开发环境中关闭"Confirm email"设置

### Q2: 收不到邮件

**原因**：
- SMTP 未配置或配置错误
- 邮件被标记为垃圾邮件
- 使用 Supabase 内置邮件服务（有发送限制）

**解决方案**：
1. 检查垃圾邮件文件夹
2. 配置自定义 SMTP 服务器
3. 检查 Supabase Dashboard 中的邮件发送日志

### Q3: 密码重置链接无效

**原因**：
- 链接已过期（默认 1 小时）
- 回调 URL 配置不正确

**解决方案**：
1. 重新请求密码重置链接
2. 检查 URL Configuration 中的回调 URL 设置
3. 确保 `reset-password.html` 正确处理 Supabase 的 recovery token

### Q4: 邮件确认后无法登录

**原因**：
- 会话过期
- 浏览器阻止 Cookie

**解决方案**：
1. 确认邮箱后，返回登录页面手动登录
2. 检查浏览器是否允许第三方 Cookie
3. 清除浏览器缓存后重试

## 验证配置

使用以下检查清单验证您的配置：

- [ ] Supabase 项目已创建
- [ ] Email 提供商已启用
- [ ] 邮件确认设置已配置（开发环境建议关闭）
- [ ] 回调 URL 已正确设置
- [ ] 邮件模板已配置（可选）
- [ ] 使用真实邮箱进行测试
- [ ] 开发服务器正常运行 (`npm run dev`)
- [ ] `.env.local` 文件已正确配置

## 测试文件

项目已包含以下测试页面：

1. **`test-auth.html`** - 完整的认证功能测试
   - 用户注册
   - 用户登录
   - 密码重置
   - 认证状态检查

2. **`login.html`** - 生产环境登录页面
   - 登录/注册表单
   - 密码找回
   - Google OAuth（可选）

3. **`reset-password.html`** - 密码重置页面
   - 处理邮件中的重置链接
   - 设置新密码

## 生产环境注意事项

部署到生产环境时，请确保：

1. **开启邮件确认**：保护应用安全
2. **配置自定义 SMTP**：提高邮件送达率
3. **设置正确的回调 URL**：使用生产域名
4. **自定义邮件模板**：提升用户体验
5. **配置 RLS 策略**：保护用户数据安全

## 下一步

配置完成后，您可以：

1. 在 `test-auth.html` 中测试完整的认证流程
2. 在实际页面中集成认证功能
3. 配置 Hasura 与 Supabase Auth 的集成
4. 添加用户个人资料管理功能

## 相关文件

- `src/js/supabase-init.js` - Supabase 认证核心功能
- `src/js/login.js` - 登录页面逻辑
- `src/js/reset-password.js` - 密码重置逻辑
- `public/supabase-config.js` - 配置加载
- `.env.local` - 环境变量配置

## 需要帮助？

如果遇到问题，请检查：

1. [Supabase 官方文档 - Email Auth](https://supabase.com/docs/guides/auth/auth-email)
2. [Supabase Dashboard - Logs](https://app.supabase.com) 查看错误日志
3. 浏览器开发者工具控制台

---

**提示**：在开发阶段，建议关闭"Confirm email"设置，这样可以快速测试注册和登录功能，无需每次都检查邮箱。

