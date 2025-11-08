# ⚡ Fish Art 快速部署指南

10分钟快速部署Fish Art到生产环境。

## 🎯 部署概览

```
Fish Art 技术栈:
- 前端: HTML/JS + Canvas
- 认证: Supabase Auth
- 数据库: PostgreSQL (Supabase)
- GraphQL: Hasura
- 存储: 七牛云 CDN
- 部署: Vercel Serverless
```

---

## 📦 第一步：准备服务（5分钟）

### 1. Supabase（数据库+认证）

```bash
# 1. 访问 https://supabase.com/ 并注册
# 2. 创建新项目，等待约2分钟
# 3. 记录以下信息：

Project URL: https://xxx.supabase.co
Anon Key: eyJxxxxx...
Service Role Key: eyJxxxxx... (保密)
JWT Secret: xxxxx
```

### 2. Hasura（GraphQL引擎）

```bash
# 1. 访问 https://hasura.io/ 并注册
# 2. 创建Cloud项目
# 3. 连接Supabase数据库：

Database URL: 
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres

# 4. 设置Admin Secret
HASURA_GRAPHQL_ADMIN_SECRET: your-strong-secret

# 5. 配置JWT Secret（从Supabase复制）
HASURA_GRAPHQL_JWT_SECRET: {"type":"HS256","key":"your-jwt-secret"}
```

### 3. 七牛云（图片存储）

```bash
# 1. 访问 https://www.qiniu.com/ 并注册
# 2. 完成实名认证（必需）
# 3. 创建存储空间：

空间名称: fish-art
区域: 华南 (Zone_z2)
访问控制: 公开空间

# 4. 获取密钥（个人中心 → 密钥管理）:
AccessKey: xxxxx
SecretKey: xxxxx (保密)

# 5. 配置CDN域名：
测试域名: xxxx.bkt.clouddn.com (30天免费)
# 或绑定自定义域名（需备案）
```

---

## 🗄️ 第二步：数据库初始化（2分钟）

### 执行迁移脚本

1. 打开Supabase SQL Editor
2. 复制 `scripts/migrate-database.sql` 内容
3. 点击 Run 执行

**验证：**
```sql
-- 检查表是否创建成功
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 应该看到7个表：
-- fish, votes, reports, battle_config, 
-- user_economy, battle_log, economy_log
```

---

## 🔐 第三步：配置Hasura权限（3分钟）

### 快速配置

1. 打开Hasura Console
2. 按照 `docs/HASURA_SETUP.md` 配置每个表的权限

**快捷方式：**
```yaml
# fish表权限示例
- role: user
  select:
    filter: { is_visible: { _eq: true }, deleted: { _eq: false } }
    columns: "*"
  insert:
    check: { user_id: { _eq: X-Hasura-User-Id } }
    columns: "*"
```

**测试权限：**
```graphql
query {
  fish(limit: 5) {
    id
    image
    artist
    created_at
  }
}
```

---

## 🚀 第四步：部署到Vercel（2分钟）

### 准备代码

```bash
# 1. 克隆或初始化Git仓库
git init
git add .
git commit -m "Initial commit"

# 2. 推送到GitHub/GitLab
git remote add origin https://github.com/yourusername/fish-art.git
git push -u origin main
```

### Vercel部署

```bash
# 方式1: 使用Vercel CLI
npm i -g vercel
vercel login
vercel

# 方式2: 通过Web界面
# 1. 访问 https://vercel.com/
# 2. Import Git Repository
# 3. 选择你的仓库
# 4. 配置环境变量（下一步）
# 5. Deploy
```

### 配置环境变量

在Vercel Project Settings → Environment Variables 中添加：

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
SUPABASE_JWT_SECRET=xxx

# Hasura
HASURA_GRAPHQL_ENDPOINT=https://xxx.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=xxx

# 七牛云
QINIU_ACCESS_KEY=xxx
QINIU_SECRET_KEY=xxx
QINIU_BUCKET=fish-art
QINIU_BASE_URL=https://xxx.bkt.clouddn.com
QINIU_DIR_PATH=fish/
QINIU_ZONE=Zone_z2

# Redis（可选，战斗系统需要）
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

**重要：** 确保在 Production, Preview, Development 都选中！

---

## ✅ 第五步：验证部署（1分钟）

### 功能测试

```bash
# 1. 访问你的Vercel URL
https://your-project.vercel.app

# 2. 测试注册登录
点击 Login → Sign Up → 填写邮箱密码

# 3. 测试绘制提交
绘制一条鱼 → Submit → 查看是否成功

# 4. 测试鱼列表
点击 View Tank → 应该能看到刚提交的鱼

# 5. 测试投票
点击 👍 或 👎 → 查看计数是否更新
```

### API测试

```bash
# 测试鱼列表API
curl https://your-project.vercel.app/api/fish/list?limit=5

# 应该返回JSON数据
{
  "success": true,
  "data": [...],
  "total": 123
}
```

---

## 🎨 可选配置

### 自定义域名

```bash
# 1. 在Vercel添加域名
Settings → Domains → Add Domain

# 2. 配置DNS记录
Type: CNAME
Name: @
Value: cname.vercel-dns.com

# 3. 等待DNS生效（5-30分钟）
```

### 邮箱模板自定义

```bash
# 1. Supabase Dashboard → Authentication → Email Templates
# 2. 自定义以下模板：
- Confirm Signup
- Reset Password
- Magic Link
```

### 七牛云自定义域名

```bash
# 1. 七牛云控制台 → 空间管理 → 域名管理
# 2. 添加自定义域名（需备案）
# 3. 配置CNAME记录：
Type: CNAME
Name: cdn
Value: xxx.qiniucdn.com

# 4. 更新环境变量
QINIU_BASE_URL=https://cdn.yourdomain.com
```

---

## 📊 监控和维护

### Vercel Analytics

```bash
# 免费，自动启用
# 查看：Vercel Dashboard → Analytics
```

### 七牛云用量监控

```bash
# 七牛云控制台 → 财务中心 → 消费记录
# 设置余额预警：个人中心 → 账户设置
```

### Hasura日志

```bash
# Hasura Console → Monitoring
# 查看GraphQL查询日志和性能
```

---

## 🔧 故障排查

### 问题：图片上传失败

```bash
# 检查1: 七牛云配置
node -e "console.log(require('./lib/qiniu/config').qiniuConfig)"

# 检查2: 七牛云空间权限
# 确保空间是"公开"状态

# 检查3: CDN域名
# 访问 QINIU_BASE_URL，确保可访问
```

### 问题：API返回401

```bash
# 检查1: Hasura JWT配置
# 确保JWT Secret与Supabase一致

# 检查2: 用户登录状态
# 浏览器Console检查localStorage

# 检查3: Hasura权限
# 在Hasura Console测试GraphQL查询
```

### 问题：部署失败

```bash
# 检查1: 环境变量
# 确保所有必需的环境变量都已设置

# 检查2: 构建日志
# Vercel Dashboard → Deployments → 查看日志

# 检查3: 依赖安装
npm install --legacy-peer-deps
```

---

## 📝 部署后清单

完成部署后，确认以下功能：

- [ ] ✅ 用户可以注册和登录
- [ ] ✅ 用户可以绘制并提交鱼
- [ ] ✅ 图片正确显示（七牛云CDN）
- [ ] ✅ 鱼列表正常加载
- [ ] ✅ 投票功能正常工作
- [ ] ✅ 举报功能可用
- [ ] ✅ 页面加载速度 < 3秒
- [ ] ✅ 图片加载速度 < 1秒

---

## 🎯 性能优化建议

### 1. 七牛云图片处理

```javascript
// 生成缩略图
const thumbnailUrl = `${imageUrl}?imageView2/1/w/200/h/200`;

// 压缩质量
const compressedUrl = `${imageUrl}?imageMogr2/quality/70`;

// 组合使用
const optimizedUrl = `${imageUrl}?imageView2/1/w/400/h/300/q/75`;
```

### 2. Hasura性能优化

```graphql
# 使用字段选择，只获取需要的数据
query {
  fish(limit: 10) {
    id
    image
    artist
    # 不要选择所有字段
  }
}
```

### 3. 前端优化

```javascript
// 使用图片懒加载
<img loading="lazy" src="...">

// 添加占位符
<img src="placeholder.png" data-src="actual-image.png">
```

---

## 🔗 相关资源

- [部署检查清单](./DEPLOYMENT_CHECKLIST.md)
- [Hasura配置指南](./HASURA_SETUP.md)
- [七牛云配置指南](./QINIU_SETUP.md)
- [进度报告](./plans/BACKEND_REBUILD_PROGRESS.md)

---

## 📞 获取帮助

遇到问题？

1. 查看 [部署检查清单](./DEPLOYMENT_CHECKLIST.md)
2. 检查 Vercel 部署日志
3. 查看 Hasura Console 错误
4. 检查浏览器 Console 错误

---

**🎉 恭喜！你的Fish Art项目已成功部署！**

**预计完成时间：10-15分钟**

**下一步：** 邀请用户测试，收集反馈，持续改进！

