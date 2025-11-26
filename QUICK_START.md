# 快速启动指南

## 解决部署问题的快速步骤

如果你的应用在本地运行正常但部署后出现 500 错误，按以下步骤操作：

### 1️⃣ 检查本地配置（30秒）

```bash
npm run check:env
```

如果看到 ❌，在 `.env.local` 中添加缺失的环境变量。

### 2️⃣ 在 Vercel 配置环境变量（5分钟）

1. 打开 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 → Settings → Environment Variables
3. 复制 `.env.local` 中的所有变量到 Vercel
4. 确保每个变量都选择了所有环境（Production, Preview, Development）

**最重要的变量**：
```
HASURA_GRAPHQL_ENDPOINT
HASURA_ADMIN_SECRET
QINIU_ACCESS_KEY
QINIU_SECRET_KEY
QINIU_BUCKET
QINIU_BASE_URL
SUPABASE_URL
SUPABASE_ANON_KEY
```

### 3️⃣ 重新部署（1分钟）

1. Vercel Dashboard → Deployments
2. 最新部署 → "..." → Redeploy

### 4️⃣ 验证部署（2分钟）

访问（将 `your-project-xxx` 替换为你的实际 Vercel URL）：

```
https://your-project-xxx.vercel.app/api/diagnostics
```

检查：
- ✅ `envVars` 中所有变量都应该是 `true`
- ✅ `modules` 中所有模块都应该是 `"status": "ok"`
- ✅ `handlers` 中所有处理器都应该是 `"status": "ok"`

如果有错误，查看错误信息并修复对应的配置。

### 5️⃣ 测试功能（3分钟）

- [ ] 用户登录
- [ ] 提交鱼（图片上传）
- [ ] 查看消息（未读计数）
- [ ] 浏览鱼列表

## 如果仍有问题

### 查看详细日志

1. Vercel Dashboard → Deployments → 最新部署 → Functions
2. 点击失败的函数查看日志
3. 查找类似以下的错误信息：
   ```
   ❌ QINIU_SECRET_KEY is not configured
   ```

### 常见错误速查

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| `Upload handler not available` | 七牛云配置缺失 | 设置 `QINIU_*` 环境变量 |
| `Unread count handler not available` | Hasura 配置缺失 | 设置 `HASURA_*` 环境变量 |
| `QINIU_ACCESS_KEY is not configured` | 七牛云密钥未设置 | 在 Vercel 添加 `QINIU_ACCESS_KEY` |
| `HASURA_GRAPHQL_ENDPOINT is not configured` | Hasura 端点未设置 | 在 Vercel 添加 `HASURA_GRAPHQL_ENDPOINT` |

### 获取帮助

如果问题仍未解决，查看详细文档：
- [完整部署指南](./VERCEL_DEPLOYMENT.md)
- [故障排查指南](./DEPLOYMENT_TROUBLESHOOTING.md)
- [修复总结](./DEPLOYMENT_FIXES_SUMMARY.md)

## 本地开发

```bash
# 安装依赖
npm install

# 检查配置
npm run check:env

# 启动开发服务器
npm run dev

# 或使用 Vercel 环境
npm run dev:vercel
```

## 预防措施

每次部署前：

```bash
# 1. 检查配置
npm run check:env

# 2. 测试 Hasura（可选）
npm run test:hasura

# 3. 本地测试（可选）
npm run dev
```

## 关键文件

| 文件 | 用途 |
|-----|------|
| `.env.local` | 本地环境变量 |
| `.env.vercel.example` | Vercel 配置模板 |
| `api/diagnostics.js` | 诊断 API |
| `scripts/check-env.js` | 环境检查脚本 |

## 提示

💡 **部署后立即检查**: 每次部署后立即访问 `/api/diagnostics` 确认配置正确

💡 **环境隔离**: 可以为 Production 和 Preview 使用不同的环境变量

💡 **安全**: 不要在代码中硬编码密钥，始终使用环境变量

💡 **监控**: 定期检查 Vercel 函数日志，及早发现问题

