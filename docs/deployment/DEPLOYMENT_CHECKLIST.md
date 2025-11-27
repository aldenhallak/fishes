# 🚀 Fish Art 部署检查清单

完整的部署前检查清单，确保所有配置正确。

## 📋 部署前检查

### ✅ 1. 数据库配置

- [ ] **PostgreSQL数据库已创建**
  - 推荐使用 Supabase 免费Postgres
  - 或自建PostgreSQL 14+
  
- [ ] **运行数据库迁移脚本**
  ```bash
  # 在Hasura Console或psql中执行
  scripts/migrate-database.sql
  ```
  
- [ ] **验证表结构**
  - 7个表：fish, votes, reports, battle_config, user_economy, battle_log, economy_log
  - 3个视图：fish_rank, fish_battle, user_fish_summary
  - 2个触发器

---

### ✅ 2. Supabase配置

- [ ] **创建Supabase项目**
  - 访问 https://supabase.com/
  - 创建新项目
  
- [ ] **获取项目凭证**
  - Project URL
  - Anon Key
  - Service Role Key (秘密，仅服务端使用)
  
- [ ] **配置JWT Secret**
  - 在项目设置中找到JWT Secret
  - 用于Hasura认证
  
- [ ] **配置认证提供商（可选）**
  - Email/Password (必需)
  - Google OAuth (可选)
  
- [ ] **配置邮箱模板**
  - 欢迎邮件
  - 密码重置邮件
  - 邮箱验证

参考：`docs/HASURA_SETUP.md`

---

### ✅ 3. Hasura配置

- [ ] **部署Hasura Cloud**
  - 访问 https://hasura.io/
  - 创建新项目
  
- [ ] **连接数据库**
  - 使用Supabase的连接字符串
  - 或自建Postgres连接
  
- [ ] **配置环境变量**
  ```
  HASURA_GRAPHQL_ADMIN_SECRET=your-secret
  HASURA_GRAPHQL_JWT_SECRET={"type":"HS256","key":"your-jwt-secret"}
  ```
  
- [ ] **配置权限规则**
  - 按照 `docs/HASURA_SETUP.md` 配置所有表的权限
  - 测试CRUD操作
  
- [ ] **配置关系**
  - fish → votes (一对多)
  - fish → reports (一对多)
  - user_economy → fish (一对多)

参考：`docs/HASURA_SETUP.md`

---

### ✅ 4. Redis配置（可选但推荐）

- [ ] **选择Redis服务**
  - 推荐：Upstash Redis (免费10K请求/天)
  - 或：Redis Labs
  - 或：自建Redis
  
- [ ] **获取连接信息**
  - Redis URL或REST API URL
  - Redis Token (Upstash)
  
- [ ] **测试连接**
  ```bash
  npm run test:redis
  ```

---

### ✅ 5. 七牛云配置

- [ ] **注册并认证七牛云账号**
  - 访问 https://www.qiniu.com/
  - 完成实名认证
  
- [ ] **创建存储空间**
  - 空间名称：`fish-art`
  - 区域：华南 (Zone_z2) 或就近
  - 访问控制：公开空间
  
- [ ] **获取密钥**
  - AccessKey
  - SecretKey
  - ⚠️ 保密，不要提交到Git
  
- [ ] **配置CDN域名**
  - 测试域名（30天免费）
  - 或绑定自定义域名（需备案）
  
- [ ] **测试上传**
  ```bash
  # 在本地测试上传功能
  npm run dev
  # 绘制并提交一条鱼
  ```

参考：`docs/QINIU_SETUP.md`

---

### ✅ 6. 环境变量配置

#### 本地开发 (`.env.local`)

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
SUPABASE_JWT_SECRET=xxx

# Hasura
HASURA_GRAPHQL_ENDPOINT=https://xxx.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=xxx

# Redis (可选)
REDIS_URL=redis://localhost:6379
# 或
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# 七牛云
QINIU_ACCESS_KEY=xxx
QINIU_SECRET_KEY=xxx
QINIU_BUCKET=fish-art
QINIU_BASE_URL=https://cdn.fishart.online
QINIU_DIR_PATH=fish/
QINIU_ZONE=Zone_z2
```

#### Vercel部署

- [ ] **添加所有环境变量到Vercel**
  - Project Settings → Environment Variables
  - 选中 Production, Preview, Development
  
- [ ] **验证环境变量**
  ```bash
  vercel env ls
  ```

---

### ✅ 7. 代码检查

- [ ] **安装依赖**
  ```bash
  npm install
  ```
  
- [ ] **运行测试**
  ```bash
  npm run test:all
  ```
  
- [ ] **本地构建测试**
  ```bash
  npm run build
  ```
  
- [ ] **检查Linter错误**
  ```bash
  # 如果有eslint配置
  npm run lint
  ```

---

### ✅ 8. 前端配置

- [ ] **更新Supabase公开配置**
  - 编辑 `public/supabase-config.js`
  - 填入正确的URL和Anon Key
  
- [ ] **更新后端URL**
  - 检查 `src/js/fish-utils.js` 中的 `BACKEND_URL`
  - 生产环境应自动检测
  
- [ ] **测试前端功能**
  - [ ] 用户注册
  - [ ] 用户登录
  - [ ] 绘制并提交鱼
  - [ ] 查看鱼列表
  - [ ] 投票功能
  - [ ] 举报功能

---

### ✅ 9. Vercel部署

- [ ] **连接Git仓库**
  - GitHub/GitLab/Bitbucket
  
- [ ] **配置项目**
  - Framework Preset: Other
  - Build Command: (留空)
  - Output Directory: (留空)
  - Install Command: `npm install`
  
- [ ] **配置域名（可选）**
  - 添加自定义域名
  - 配置DNS记录
  
- [ ] **部署**
  ```bash
  vercel --prod
  ```
  
- [ ] **验证部署**
  - 访问生产URL
  - 测试所有功能

---

### ✅ 10. 部署后验证

- [ ] **功能测试**
  - [ ] 用户注册和登录
  - [ ] 绘制并提交鱼
  - [ ] 图片正确显示（七牛云CDN）
  - [ ] 鱼列表加载
  - [ ] 投票功能
  - [ ] 举报功能
  
- [ ] **性能测试**
  - [ ] 页面加载速度 < 3s
  - [ ] 图片加载速度 < 1s
  - [ ] API响应时间 < 500ms
  
- [ ] **监控配置**
  - [ ] Vercel Analytics（免费）
  - [ ] Sentry错误监控（可选）
  - [ ] 七牛云用量监控

---

## 🔧 常见问题排查

### 问题1: 图片上传失败

**排查步骤：**
1. 检查七牛云环境变量是否正确
2. 验证七牛云空间是否为公开
3. 检查CDN域名是否可访问
4. 查看浏览器Console错误

**解决方案：**
```bash
# 测试七牛云配置
node -e "require('./lib/qiniu/config').qiniuConfig"
```

---

### 问题2: API调用失败

**排查步骤：**
1. 检查Hasura是否连接数据库
2. 验证Hasura权限配置
3. 检查环境变量是否正确
4. 查看Vercel函数日志

**解决方案：**
```bash
# 测试API端点
npm run test:api
```

---

### 问题3: 用户无法登录

**排查步骤：**
1. 检查Supabase Auth配置
2. 验证JWT Secret是否匹配
3. 检查邮箱验证设置
4. 查看浏览器Network错误

**解决方案：**
- 在Supabase Dashboard检查用户状态
- 验证邮箱模板配置
- 检查CORS设置

---

## 📊 性能基准

部署后应达到的性能指标：

| 指标 | 目标值 | 测试方法 |
|------|--------|---------|
| 首页加载 | < 2s | Chrome DevTools |
| API响应 | < 300ms | Network面板 |
| 图片加载 | < 500ms | 七牛云CDN |
| 数据库查询 | < 100ms | Hasura Console |

---

## 🎯 发布检查

最终发布前：

- [ ] ✅ 所有环境变量已配置
- [ ] ✅ 数据库迁移已完成
- [ ] ✅ API测试全部通过
- [ ] ✅ 前端功能测试通过
- [ ] ✅ 性能达到基准
- [ ] ✅ 错误监控已配置
- [ ] ✅ 备份策略已制定
- [ ] ✅ 文档已更新

---

## 🔗 相关文档

- [Hasura配置指南](./HASURA_SETUP.md)
- [七牛云配置指南](./QINIU_SETUP.md)
- [进度报告](./plans/BACKEND_REBUILD_PROGRESS.md)
- [快速部署指南](./QUICK_DEPLOY.md)

---

**🎉 检查完成后，你的Fish Art项目就可以成功部署了！**

