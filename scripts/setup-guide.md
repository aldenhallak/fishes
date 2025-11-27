# 🚀 战斗系统配置指南

## Step 1: 环境配置

### 1.1 复制环境变量文件

```bash
cp .env.example .env
```

### 1.2 配置Hasura

打开 `.env` 文件，填入您的Hasura信息：

```env
HASURA_GRAPHQL_ENDPOINT=https://your-hasura-server.com/v1/graphql
HASURA_ADMIN_SECRET=your-admin-secret-here
```

**获取方式**：
- 如果您已有Hasura服务器，从控制台获取
- 如果还没有，参考 [Hasura部署文档](https://hasura.io/docs/latest/deployment/deployment-guides/index/)

### 1.3 配置Redis（Upstash）

```env
UPSTASH_REDIS_URL=redis://default:password@endpoint.upstash.io:6379
```

**免费注册**：
1. 访问 https://upstash.com/
2. 创建账号（GitHub登录）
3. 创建Redis数据库（选择免费版）
4. 复制Redis URL

**注意**：免费版限制为10,000次请求/天，推荐使用付费版（$10/月）

---

## Step 2: 安装依赖

```bash
npm install
```

---

## Step 3: 数据库迁移

### 方法1：通过Hasura Console（推荐）

1. 打开Hasura Console
2. 点击 "SQL" 标签
3. 复制 `scripts/migrate-database.sql` 的全部内容
4. 粘贴并执行

### 方法2：通过psql命令

```bash
psql -U your_user -d your_database -f scripts/migrate-database.sql
```

---

## Step 4: 测试连接

### 4.1 测试Hasura

```bash
npm run test:hasura
```

预期输出：
```
✅ Hasura连接成功
✅ 成功，找到 X 条鱼
✅ 配置已就绪
```

### 4.2 测试Redis

```bash
npm run test:redis
```

预期输出：
```
✅ Redis连接成功
✅ 写入成功
✅ 读取成功
✅ 所有测试通过！
```

---

## Step 5: 下载测试数据（可选）

```bash
# 下载50条鱼数据
npm run download:fish

# 下载100条并包含图片
node scripts/download-fish-data.js --count=100 --images
```

数据将保存到 `test-data/` 目录，包括：
- `fish-data.json` - JSON格式
- `insert-fish.sql` - SQL插入脚本

导入方法：
```bash
psql -U your_user -d your_database -f test-data/insert-fish.sql
```

---

## Step 6: 本地开发

```bash
npm run dev
```

服务将在 http://localhost:3000 启动

---

## Step 7: 部署到Vercel

### 7.1 安装Vercel CLI

```bash
npm i -g vercel
```

### 7.2 登录

```bash
vercel login
```

### 7.3 设置环境变量

```bash
vercel env add HASURA_GRAPHQL_ENDPOINT
vercel env add HASURA_ADMIN_SECRET
vercel env add UPSTASH_REDIS_URL
```

### 7.4 部署

```bash
vercel --prod
```

---

## 📊 验证清单

- [ ] `.env` 文件已配置
- [ ] 依赖已安装 (`npm install`)
- [ ] 数据库已迁移（表已创建）
- [ ] Hasura连接测试通过
- [ ] Redis连接测试通过
- [ ] 测试数据已导入（可选）
- [ ] 本地开发服务器正常运行

---

## ⚠️ 常见问题

### Q1: Hasura连接失败

**检查**：
1. HASURA_GRAPHQL_ENDPOINT 是否正确（包含 `/v1/graphql`）
2. HASURA_ADMIN_SECRET 是否正确
3. 网络是否能访问Hasura服务器

### Q2: Redis连接失败

**检查**：
1. UPSTASH_REDIS_URL 格式是否正确
2. Redis数据库是否已创建
3. 是否选择了正确的地区（建议选最近的）

### Q3: 数据库迁移失败

**可能原因**：
1. fish表已存在但结构不同
2. 权限不足

**解决方案**：
- 检查现有表结构
- 手动执行每个ALTER TABLE语句
- 确保数据库用户有足够权限

### Q4: 免费版Redis不够用

**优化方案**：
1. 减少心跳频率（1分钟 → 5分钟）
2. 升级到付费版（$10/月）
3. 如果预算紧张，暂时不用Redis（牺牲并发控制）

---

## 📝 下一步

完成配置后，可以开始实施战斗系统：

1. ✅ 基础设施已就绪
2. ⏭️ 实现战斗结算API
3. ⏭️ 实现前端碰撞检测
4. ⏭️ 实现战斗动画
5. ⏭️ 实现经济系统

查看主计划文档了解详细步骤。

