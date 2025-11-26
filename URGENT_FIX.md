# 🔥 紧急修复指南

## 当前状态
- ✅ 代码已更新，诊断工具已就绪
- ❌ Vercel 环境变量未配置，导致 500 错误

## 立即执行（10分钟）

### 1️⃣ 查看详细错误信息

访问诊断 API 查看具体问题：
```
https://www.fishart.online/api/diagnostics
```

预期会看到类似：
```json
{
  "envVars": {
    "HASURA_GRAPHQL_ENDPOINT": false,  // ❌ 未设置
    "QINIU_ACCESS_KEY": false           // ❌ 未设置
  },
  "modules": {
    "hasura": {
      "status": "error",
      "error": "HASURA_GRAPHQL_ENDPOINT is not configured"
    }
  }
}
```

### 2️⃣ 在 Vercel 配置环境变量

#### A. 打开 Vercel 设置
1. 访问 https://vercel.com/dashboard
2. 选择 **fishart** 项目
3. 进入 **Settings** → **Environment Variables**

#### B. 添加以下变量

从你的 `.env.local` 文件复制以下变量到 Vercel：

**数据库配置**:
```
HASURA_GRAPHQL_ENDPOINT = http://hasura-fishart-1.weweknow.com/v1/graphql
HASURA_ADMIN_SECRET = admin_secret
```

**七牛云配置**:
```
QINIU_ACCESS_KEY = cG7iQXwt2oeUeYs5AVV5bGEtZV_Z7MD3QQ7KE7Wc
QINIU_SECRET_KEY = uj4NgCfgkbzaKDXmVjmFXtOBZvbjmaw4Y9SHLEMO
QINIU_BUCKET = fishart
QINIU_BASE_URL = https://cdn.fishart.online
QINIU_DIR_PATH = fishart_web/
QINIU_ZONE = Zone_na0
```

**Supabase 配置**:
```
SUPABASE_URL = https://xxeplxorhecwwhtrakzw.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZXBseG9yaGVjd3dodHJha3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzMwMTksImV4cCI6MjA3NzY0OTAxOX0.uGKA5ceVq8b1Fwql-tjnsR2gi4UY6JizS25nXlvqU6g
```

**应用配置** (可选但推荐):
```
NODE_ENV = production
BACKEND_TYPE = hasura
```

#### C. 环境选择
⚠️ **重要**: 为每个变量选择所有环境：
- ✅ Production
- ✅ Preview  
- ✅ Development

#### D. 保存
点击每个变量的 **Save** 按钮。

### 3️⃣ 重新部署

配置完所有变量后：

1. 在 Vercel Dashboard，进入 **Deployments**
2. 找到最新的部署
3. 点击右侧的 **"..."** 按钮
4. 选择 **"Redeploy"**
5. 选择 **"Use existing Build Cache"**
6. 点击 **"Redeploy"** 确认

⏱️ 等待 1-2 分钟部署完成。

### 4️⃣ 验证修复

部署完成后，再次访问：
```
https://www.fishart.online/api/diagnostics
```

应该看到：
```json
{
  "envVars": {
    "HASURA_GRAPHQL_ENDPOINT": true,  // ✅
    "QINIU_ACCESS_KEY": true           // ✅
  },
  "modules": {
    "hasura": { "status": "ok" },      // ✅
    "qiniu-uploader": { "status": "ok" } // ✅
  },
  "handlers": {
    "fish-upload": { "status": "ok" },        // ✅
    "message-unread-count": { "status": "ok" } // ✅
  }
}
```

### 5️⃣ 测试功能

访问 https://www.fishart.online 并测试：
- [ ] 用户登录 ✅
- [ ] 提交鱼（图片上传）✅
- [ ] 查看消息（未读计数）✅

## 📸 截图指南

如果需要帮助，提供以下截图：

1. **Vercel 环境变量页面**
   - Settings → Environment Variables
   - 显示已添加的变量列表

2. **诊断 API 输出**
   - 访问 `/api/diagnostics` 的完整 JSON 输出

3. **Vercel 函数日志**
   - Deployments → Functions
   - `api/message-api` 和 `api/fish-api` 的日志

## ⚡ 快速检查清单

配置前：
- [ ] 准备好 `.env.local` 文件内容
- [ ] 确认有 Vercel 项目访问权限

配置时：
- [ ] 每个变量都选择了 3 个环境
- [ ] 变量名没有拼写错误
- [ ] 变量值没有多余的空格或引号

配置后：
- [ ] 已触发重新部署
- [ ] `/api/diagnostics` 显示全部 OK
- [ ] 实际功能测试通过

## 🆘 如果仍有问题

### 检查 Vercel 函数日志

1. Vercel Dashboard → Deployments
2. 选择最新部署 → Functions
3. 查看 `api/fish-api` 的日志输出
4. 现在会看到详细的错误信息，例如：
   ```
   [Fish API] Loading handler from: /var/task/lib/api_handlers/fish/upload.js
   [Fish API] ❌ Failed to load handler: ../lib/api_handlers/fish/upload.js
   [Fish API] Error: 七牛云配置缺失: QINIU_SECRET_KEY 未设置
   ```

### 常见问题

**Q: 添加环境变量后仍报错？**
A: 必须重新部署才能生效。修改环境变量不会自动触发部署。

**Q: 诊断 API 返回 403？**
A: 在 `api/diagnostics.js` 中暂时移除环境检查：
```javascript
// 注释掉这几行
// if (!isDev) {
//   return res.status(403).json({ ... });
// }
```

**Q: 某些模块显示 status: "error"？**
A: 查看错误详情，通常是对应的环境变量未设置。

## 📞 需要帮助？

如果按照以上步骤仍无法解决：

1. 提供 `/api/diagnostics` 的完整输出
2. 提供 Vercel 函数日志截图
3. 确认已执行所有检查清单项

---

**预计修复时间**: 10-15 分钟
**关键步骤**: 配置环境变量 → 重新部署 → 验证

