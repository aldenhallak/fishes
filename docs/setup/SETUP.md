# 🚀 战斗系统部署指南

## 📋 前置准备

### 1. Hasura服务器（必需）
您已经有自建Hasura服务器，需要：
- Hasura GraphQL端点URL
- Admin Secret密钥

### 2. Redis服务（必需）
推荐使用Upstash Redis：
- 访问 https://upstash.com/
- 注册账号（支持GitHub登录）
- 创建Redis数据库
- 选择免费版或Pro版（$10/月）
- 复制连接URL

### 3. Stripe账号（可选，用于支付）
- 访问 https://stripe.com/
- 注册账号
- 获取测试密钥

---

## 🛠️ 安装步骤

### Step 1: 配置环境变量

```bash
# 复制环境变量模板
cp .env.local.example .env.local

# 编辑配置
# 填入您的Hasura端点、Redis URL等
```

### Step 2: 安装依赖

```bash
# 安装Node.js依赖
npm install

# 或使用yarn
yarn install
```

需要的核心依赖：
```json
{
  "ioredis": "^5.3.2",
  "dotenv": "^16.3.1",
  "graphql": "^16.8.1",
  "graphql-request": "^6.1.0"
}
```

### Step 3: 执行数据库迁移

```bash
# 方法1：通过Hasura Console
# 1. 打开Hasura Console
# 2. 进入Data -> SQL标签页
# 3. 粘贴 scripts/migrate-database.sql 内容
# 4. 点击Run

# 方法2：通过psql命令行
psql -U your_user -d your_database -f scripts/migrate-database.sql
```

### Step 4: 测试连接

```bash
# 测试Hasura连接
node scripts/test-hasura-connection.js

# 应该看到：
# ✅ Hasura连接成功
# ✅ fish表查询成功
# ✅ battle_config配置就绪
```

### Step 5: 下载测试数据（可选）

```bash
# 下载50条鱼数据
node scripts/download-fish-data.js

# 下载100条并包含图片
node scripts/download-fish-data.js --count=100 --images

# 导入到数据库
psql -U your_user -d your_database -f test-data/insert-fish.sql
```

---

## 🔧 开发环境运行

### 启动开发服务器

```bash
# 如果使用Vercel开发环境
vercel dev

# 或使用Node.js
npm run dev
```

### 测试API

```bash
# 测试战斗API
curl -X POST http://localhost:3000/api/battle/enter-mode \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","fishId":"test-fish-id"}'
```

---

## 📊 验证部署

### 检查列表

- [ ] Hasura连接成功
- [ ] Redis连接成功
- [ ] 数据库表创建完成
- [ ] 测试数据导入成功
- [ ] API endpoints响应正常
- [ ] 前端页面加载正常

### 查询测试

在Hasura Console中运行：

```graphql
# 查询所有鱼
query {
  fish(limit: 10) {
    id
    artist
    level
    talent
    health
  }
}

# 查询战斗配置
query {
  battle_config_by_pk(id: 1) {
    level_weight
    talent_weight
    upvote_weight
    max_battle_users
  }
}
```

---

## 🚨 常见问题

### Q1: Hasura连接失败
- 检查 `HASURA_GRAPHQL_ENDPOINT` 是否正确
- 检查 `HASURA_ADMIN_SECRET` 是否正确
- 确认Hasura服务器可访问

### Q2: Redis连接失败
- 检查 `UPSTASH_REDIS_URL` 格式
- 确认Upstash数据库状态为Active
- 检查防火墙设置

### Q3: 数据库迁移失败
- 检查PostgreSQL版本（需要12+）
- 确认有足够的权限
- 查看错误日志

### Q4: 免费版Redis不够用
建议：
- 减少心跳频率（30秒 → 1分钟）
- 升级到Pro版（$10/月）
- 或实施方案C（不用Redis，直接用数据库）

---

## 📈 性能监控

### Hasura Console
- 访问 `https://your-hasura.com/console`
- 查看 Monitoring 标签页
- 监控查询性能

### Upstash Dashboard
- 登录 https://console.upstash.com/
- 查看数据库使用情况
- 监控命令数和延迟

### Vercel Dashboard
- 登录 https://vercel.com/dashboard
- 查看Function执行情况
- 监控API调用次数

---

## 🔐 安全建议

1. **不要提交 .env.local**
   - 已添加到 .gitignore
   - 使用Vercel环境变量管理

2. **使用强密钥**
   - Hasura Admin Secret至少32字符
   - 定期轮换密钥

3. **限制API访问**
   - 添加CORS配置
   - 实施速率限制

---

## 📞 技术支持

- Hasura文档: https://hasura.io/docs/
- Upstash文档: https://docs.upstash.com/
- 项目问题: 提交GitHub Issue

---

## ✅ 部署完成后

恭喜！战斗系统基础架构已就绪。

下一步：
1. 实施战斗API逻辑
2. 开发前端战斗UI
3. 集成支付系统
4. 压力测试
5. 生产环境部署



