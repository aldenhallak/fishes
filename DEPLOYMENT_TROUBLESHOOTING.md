# 部署故障排查指南

本文档帮助诊断和解决部署后的常见问题。

## 问题诊断

### 1. 检查环境变量

运行本地检查脚本：

```bash
npm run check:env
```

这将验证所有必需的环境变量是否在 `.env.local` 中正确配置。

### 2. 访问诊断API

部署后，访问以下URL查看服务器诊断信息（仅在开发/预览环境可用）：

```
https://your-domain.vercel.app/api/diagnostics
```

这将返回：
- 环境信息
- 环境变量状态
- 模块加载状态
- Handler加载状态

## 常见错误及解决方案

### 错误 1: "Upload handler not available"

**原因**: 图片上传处理器加载失败

**检查项**:
1. 七牛云环境变量是否在 Vercel 后台配置？
   - `QINIU_ACCESS_KEY`
   - `QINIU_SECRET_KEY`
   - `QINIU_BUCKET`
   - `QINIU_BASE_URL`

2. `qiniu` npm包是否在 `package.json` 的 `dependencies` 中？

3. `formidable` npm包是否在 `package.json` 的 `dependencies` 中？

**解决方法**:

1. 在 Vercel Dashboard 中添加环境变量：
   - 进入项目 → Settings → Environment Variables
   - 添加所有七牛云相关变量
   - 重新部署

2. 如果变量已设置但仍报错，检查 Vercel 函数日志：
   - 进入 Deployments → 选择最新部署 → Functions
   - 查看错误日志

### 错误 2: "Unread count handler not available"

**原因**: 消息处理器加载失败

**检查项**:
1. Hasura环境变量是否配置？
   - `HASURA_GRAPHQL_ENDPOINT`
   - `HASURA_ADMIN_SECRET`

2. Hasura服务是否正常运行？

**解决方法**:

1. 确认 Hasura 配置：
   ```bash
   npm run test:hasura
   ```

2. 在 Vercel 添加 Hasura 环境变量并重新部署

### 错误 3: API返回 500 错误

**检查步骤**:

1. **查看 Vercel 函数日志**:
   - Vercel Dashboard → Deployments → 最新部署 → Functions
   - 点击出错的函数查看详细日志

2. **检查模块加载**:
   - 访问 `/api/diagnostics` 查看哪些模块加载失败
   - 根据失败原因配置相应的环境变量

3. **本地测试**:
   ```bash
   # 使用 Vercel CLI 本地测试
   npm run dev:vercel
   ```

## Vercel 环境变量配置清单

### 必需配置

#### Hasura (数据库)
```
HASURA_GRAPHQL_ENDPOINT=https://your-hasura.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-admin-secret
```

#### 七牛云 (文件存储)
```
QINIU_ACCESS_KEY=your-access-key
QINIU_SECRET_KEY=your-secret-key
QINIU_BUCKET=your-bucket-name
QINIU_BASE_URL=https://cdn.example.com
```

#### Supabase (身份认证)
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-anon-key
```

### 可选配置

```
QINIU_DIR_PATH=fish/
QINIU_ZONE=Zone_z2
```

## 配置环境变量步骤

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 `Settings` → `Environment Variables`
4. 对于每个变量：
   - Name: 变量名（如 `QINIU_ACCESS_KEY`）
   - Value: 变量值
   - Environment: 选择 `Production`, `Preview`, 和 `Development`
5. 点击 `Save`
6. 重新部署项目（Deployments → Redeploy）

## 验证部署

部署完成后，依次测试：

1. **用户认证**: 登录功能是否正常
2. **图片上传**: 提交鱼的功能是否正常
3. **消息系统**: 未读消息计数是否正常
4. **检查控制台**: 浏览器控制台是否有错误

## 获取帮助

如果问题仍未解决：

1. 导出 Vercel 函数日志
2. 访问 `/api/diagnostics` 获取诊断信息
3. 运行 `npm run check:env` 检查本地配置
4. 提供以上信息以便排查

## 开发环境测试

在推送到生产环境前，使用 Vercel CLI 本地测试：

```bash
# 安装 Vercel CLI（如果未安装）
npm i -g vercel

# 本地开发模式（使用 Vercel 环境）
vercel dev

# 或使用本地开发服务器
npm run dev
```

本地测试时，确保 `.env.local` 包含所有必需的环境变量。

