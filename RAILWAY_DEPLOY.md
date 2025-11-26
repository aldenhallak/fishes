# Railway 部署指南

## 🚀 快速部署到 Railway（5分钟）

### 步骤 1: 准备代码

已完成！项目已包含：
- ✅ `server.js` - Railway 服务器
- ✅ `package.json` - 已包含 start 脚本
- ✅ 所有 API 路由和依赖

### 步骤 2: 推送到 GitHub

```bash
git add server.js RAILWAY_DEPLOY.md
git commit -m "Add Railway deployment support"
git push origin backend
```

### 步骤 3: 在 Railway 部署

1. **访问** [railway.app](https://railway.app/)
2. **登录** 使用 GitHub 账号
3. **点击** "New Project"
4. **选择** "Deploy from GitHub repo"
5. **选择** `fish_art` 仓库
6. **选择** `backend` 分支

Railway 会自动：
- ✅ 检测 Node.js 项目
- ✅ 运行 `npm install`
- ✅ 运行 `npm start`
- ✅ 分配域名

### 步骤 4: 配置环境变量

在 Railway Dashboard：

1. 点击你的项目
2. 选择 **Variables** 标签
3. 添加所有环境变量：

```
HASURA_GRAPHQL_ENDPOINT=http://hasura-fishart-1.weweknow.com/v1/graphql
HASURA_ADMIN_SECRET=admin_secret
QINIU_ACCESS_KEY=your_key
QINIU_SECRET_KEY=your_secret
QINIU_BUCKET=fishart
QINIU_BASE_URL=https://cdn.fishart.online
QINIU_DIR_PATH=fishart_web/
QINIU_ZONE=Zone_na0
SUPABASE_URL=https://xxeplxorhecwwhtrakzw.supabase.co
SUPABASE_ANON_KEY=your_key
NODE_ENV=production
```

### 步骤 5: 完成！

Railway 会自动：
- ✅ 重新部署
- ✅ 生成公开 URL（例如：`fish-art.railway.app`）
- ✅ 自动 HTTPS
- ✅ 自动重启

## 🎯 为什么 Railway 能解决 Vercel 的问题

### Vercel 的问题
- ❌ Serverless Functions 依赖打包复杂
- ❌ 每个函数独立打包
- ❌ 250MB 大小限制
- ❌ 10秒执行限制

### Railway 的优势
- ✅ 完整的 Node.js 进程
- ✅ 所有代码和依赖在同一环境
- ✅ 无大小限制
- ✅ 无执行时间限制
- ✅ 支持 WebSocket
- ✅ 支持长连接

## 📊 Railway vs Vercel

| 特性 | Railway | Vercel |
|------|---------|--------|
| 架构 | 传统服务器 | Serverless |
| 依赖处理 | ✅ 简单 | ❌ 复杂 |
| 项目结构 | ✅ 任意 | ⚠️ 有限制 |
| 执行时间 | ✅ 无限制 | ❌ 10秒（免费） |
| WebSocket | ✅ 支持 | ❌ 不支持 |
| 价格（起） | $5/月 | $20/月（Pro） |
| 免费额度 | $5/月 | ❌ 无 |

## 🔄 从 Vercel 迁移到 Railway

### 需要改动：
1. ✅ **无需改动** API 代码
2. ✅ **无需改动** 项目结构
3. ✅ **无需改动** 依赖配置
4. ✅ **无需** 特殊配置文件

### 只需添加：
- `server.js` - 已创建 ✅
- `start` 脚本 - 已在 package.json ✅

## 🆘 故障排查

### 如果部署失败：

1. **检查日志**：Railway Dashboard → Deployments → 查看日志
2. **检查端口**：确保使用 `process.env.PORT`
3. **检查依赖**：确保所有依赖在 `package.json`

### 常见问题：

**Q: 端口错误？**
A: Railway 自动设置 `PORT` 环境变量，server.js 已正确使用

**Q: 依赖安装失败？**
A: 检查 `package.json` 中的依赖是否正确

**Q: API 路由不工作？**
A: 检查 `api/` 目录结构是否正确

## 💰 成本估算

**免费开始**：
- ✅ 每月 $5 免费额度
- ✅ 足够运行小型项目

**实际成本**（估算）：
- 小流量: $0-2/月（在免费额度内）
- 中流量: $5-10/月
- 大流量: $15-30/月

比 Vercel Pro ($20/月) 更便宜！

## ✅ 部署检查清单

- [ ] 代码推送到 GitHub
- [ ] Railway 项目已创建
- [ ] 环境变量已配置
- [ ] 部署成功（绿色状态）
- [ ] 访问 Railway URL 正常
- [ ] 测试登录功能
- [ ] 测试图片上传
- [ ] 测试消息系统

## 🎉 完成！

你的应用现在运行在完整的 Node.js 环境中，所有依赖问题都解决了！

---

**遇到问题？**
- Railway 文档: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway

