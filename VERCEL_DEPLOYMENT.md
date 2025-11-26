# Vercel 部署指南

本指南帮助你将 Fish Art Battle 项目部署到 Vercel。

## 前置要求

- GitHub/GitLab/Bitbucket 账号
- Vercel 账号（可以使用 GitHub 账号登录）
- 已配置好的 Hasura、七牛云和 Supabase 服务

## 快速部署步骤

### 1. 准备代码仓库

确保代码已推送到 Git 仓库（GitHub、GitLab 或 Bitbucket）。

### 2. 导入项目到 Vercel

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 选择你的 Git 仓库
4. 点击 "Import"

### 3. 配置项目设置

在导入页面：

- **Framework Preset**: 选择 `Other`
- **Root Directory**: 保持为 `./`
- **Build Command**: 留空
- **Output Directory**: 保持为 `.`

点击 "Deploy" 开始首次部署（此时会失败，因为环境变量未配置）。

### 4. 配置环境变量

#### 方法 1: 使用 Vercel Dashboard 手动配置

1. 进入项目 Settings → Environment Variables
2. 参考 `.env.vercel.example` 文件，逐个添加环境变量
3. 对于每个变量，确保选择所有环境（Production, Preview, Development）

**必需的环境变量**：

```bash
# Hasura
HASURA_GRAPHQL_ENDPOINT=http://hasura-fishart-1.weweknow.com/v1/graphql
HASURA_ADMIN_SECRET=your_admin_secret

# 七牛云
QINIU_ACCESS_KEY=your_access_key
QINIU_SECRET_KEY=your_secret_key
QINIU_BUCKET=fishart
QINIU_BASE_URL=https://cdn.fishart.online
QINIU_DIR_PATH=fishart_web/
QINIU_ZONE=Zone_na0

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Application
NODE_ENV=production
BACKEND_TYPE=hasura
```

#### 方法 2: 使用 Vercel CLI 批量导入

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 关联项目
vercel link

# 批量导入环境变量（从 .env.local）
vercel env pull .env.vercel
```

### 5. 重新部署

配置完环境变量后：

1. 进入 Deployments 标签页
2. 找到最新的部署
3. 点击右侧的 "..." → "Redeploy"
4. 选择 "Use existing Build Cache" → "Redeploy"

### 6. 验证部署

部署成功后：

1. **访问诊断页面**（仅 Preview 环境）:
   ```
   https://your-project-preview.vercel.app/api/diagnostics
   ```
   
2. **测试关键功能**:
   - 用户登录
   - 图片上传
   - 消息系统
   - 鱼列表加载

3. **检查函数日志**:
   - 在 Vercel Dashboard 中查看 Functions 标签
   - 查看是否有错误日志

## 常见问题排查

### 问题 1: 部署后 API 返回 500 错误

**原因**: 环境变量未正确配置或模块加载失败

**解决方法**:

1. 访问 `/api/diagnostics` 查看详细信息
2. 检查 Vercel Dashboard → Deployments → Functions 中的日志
3. 确认所有必需的环境变量都已设置
4. 重新部署

### 问题 2: "Handler not available" 错误

**原因**: 依赖模块初始化失败

**检查**:
- 环境变量是否完整配置
- 七牛云/Hasura 服务是否可访问
- 查看函数日志中的详细错误信息

**解决**:
1. 确认 `.env.vercel.example` 中的所有必需变量都已配置
2. 测试服务连接（使用 `/api/diagnostics`）
3. 重新部署

### 问题 3: 图片上传失败

**原因**: 七牛云配置错误

**检查**:
- `QINIU_ACCESS_KEY`
- `QINIU_SECRET_KEY`
- `QINIU_BUCKET`
- `QINIU_BASE_URL`

**解决**:
1. 在 Vercel 中重新检查这些变量
2. 确认七牛云存储桶和 CDN 域名正确
3. 测试七牛云密钥是否有效

### 问题 4: 消息系统错误

**原因**: Hasura 配置错误

**检查**:
- `HASURA_GRAPHQL_ENDPOINT`
- `HASURA_ADMIN_SECRET`

**解决**:
1. 确认 Hasura 服务可访问
2. 测试 Admin Secret 是否正确
3. 运行本地测试: `npm run test:hasura`

## 本地测试 Vercel 环境

在推送到生产环境前，使用 Vercel CLI 本地测试：

```bash
# 使用 Vercel 开发服务器
vercel dev

# 访问
http://localhost:3000
```

## 性能优化建议

### 1. 函数配置

在 `vercel.json` 中已配置：

```json
{
  "functions": {
    "api/**/*.js": {
      "memory": 512,
      "maxDuration": 10
    }
  }
}
```

如需调整：
- `memory`: 增加内存可提升性能（128-3008 MB）
- `maxDuration`: Pro 账号可设置为 60 秒

### 2. 环境变量缓存

Vercel 会缓存环境变量，修改后需要：
1. 重新部署
2. 或清除构建缓存后部署

### 3. 监控日志

定期检查：
- Function Logs（函数日志）
- Runtime Logs（运行时日志）
- Error Tracking（错误追踪）

## 持续集成/部署 (CI/CD)

Vercel 自动配置 CI/CD：

- **Production**: 推送到 `main`/`master` 分支自动部署
- **Preview**: 推送到其他分支或 PR 会创建预览部署
- **Development**: 本地使用 `vercel dev`

### 部署钩子

如需在部署前/后执行脚本，可在 `package.json` 添加：

```json
{
  "scripts": {
    "vercel-build": "npm run check:env && echo 'Build complete'",
    "postdeploy": "echo 'Deployment complete'"
  }
}
```

## 域名配置

### 添加自定义域名

1. 进入 Project Settings → Domains
2. 添加你的域名
3. 根据提示配置 DNS 记录
4. 等待 DNS 传播和 SSL 证书生成

## 安全建议

1. **环境变量安全**:
   - 不要在代码中硬编码密钥
   - 定期轮换密钥
   - 使用不同的密钥区分 Production 和 Preview 环境

2. **API 安全**:
   - 启用 CORS 限制
   - 添加速率限制
   - 验证请求来源

3. **监控**:
   - 启用 Vercel Analytics
   - 设置告警通知
   - 定期检查访问日志

## 回滚

如果新部署出现问题：

1. 进入 Deployments
2. 找到之前的稳定版本
3. 点击 "..." → "Promote to Production"

## 获取支持

- [Vercel 文档](https://vercel.com/docs)
- [部署故障排查](./DEPLOYMENT_TROUBLESHOOTING.md)
- [GitHub Issues](your-repo-issues-url)

## 检查清单

部署前检查：

- [ ] 所有必需的环境变量已配置
- [ ] 本地运行 `npm run check:env` 通过
- [ ] `vercel.json` 配置正确
- [ ] 所有依赖都在 `package.json` 的 `dependencies` 中
- [ ] 测试 API 端点工作正常
- [ ] 数据库连接正常
- [ ] 文件上传功能正常

部署后验证：

- [ ] 访问 `/api/diagnostics` 确认配置
- [ ] 测试用户登录
- [ ] 测试图片上传
- [ ] 测试消息系统
- [ ] 检查浏览器控制台无错误
- [ ] 检查 Vercel 函数日志无错误

