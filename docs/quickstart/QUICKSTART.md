# 🚀 快速开始指南

5分钟快速部署Fish Art Battle系统！

---

## 📋 前置条件

- ✅ Node.js 16+ 已安装
- ✅ 已有Hasura服务器（自建）
- ✅ 已有PostgreSQL数据库

---

## ⚡ 5步快速部署

### Step 1: 克隆并安装依赖

```bash
cd fish_art
npm install ioredis dotenv
```

### Step 2: 配置环境变量

```bash
# 复制模板
cp .env.local.example .env.local

# 编辑配置（填入你的信息）
notepad .env.local  # Windows
# 或
nano .env.local     # Linux/Mac
```

需要填写：
```env
HASURA_GRAPHQL_ENDPOINT=https://your-hasura.com/v1/graphql
HASURA_ADMIN_SECRET=your-admin-secret

UPSTASH_REDIS_URL=redis://default:pwd@xxx.upstash.io:6379
```

### Step 3: 数据库迁移

打开Hasura Console → Data → SQL，粘贴并执行：
```bash
# 复制scripts/migrate-database.sql的内容到Hasura Console
```

或使用命令行：
```bash
psql -U your_user -d your_db -f scripts/migrate-database.sql
```

### Step 4: 测试连接

```bash
# 测试Hasura
node scripts/test-hasura-connection.js

# 测试Redis
node scripts/test-redis-connection.js
```

看到 ✅ 表示成功！

### Step 5: 启动开发服务器

```bash
npm run dev
# 或
vercel dev
```

访问 http://localhost:3000 🎉

---

## 🎮 测试功能

### 1. 测试API

在浏览器控制台输入：

```javascript
// 查询余额
fetch('/api/economy/balance?userId=test-user')
  .then(r => r.json())
  .then(console.log);

// 每日签到
fetch('/api/economy/daily-bonus', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({userId: 'test-user'})
}).then(r => r.json()).then(console.log);
```

### 2. 导入测试数据（可选）

```bash
# 下载50条鱼
node scripts/download-fish-data.js

# 导入到数据库（在Hasura Console执行生成的SQL）
```

### 3. 集成到前端

在 `tank.html` 中添加：

```html
<script src="/src/js/battle-client.js"></script>
<script src="/src/js/battle-animation.js"></script>

<script>
// 初始化战斗客户端
const userId = firebase.auth().currentUser.uid;
const fishId = 'your-fish-id';

BattleClient.init(userId, fishId);

// 进入战斗模式
document.getElementById('battle-mode-btn').onclick = async () => {
  const result = await BattleClient.enterBattleMode(userId, fishId);
  
  if (result.success) {
    console.log('成功进入战斗模式！');
  } else if (result.inQueue) {
    console.log(`排队中，位置：${result.position}`);
  }
};
</script>
```

---

## 🔥 Upstash Redis 注册（5分钟）

1. 访问 https://upstash.com/
2. 点击 "Sign Up"（支持GitHub登录）
3. 创建Redis数据库
4. 复制连接URL到 `.env.local`

**选择计划：**
- 免费版：10,000命令/天（不够用）
- Pro版：$10/月，100万命令（推荐）

---

## 📊 验证部署

运行检查清单：

```bash
# 1. 环境变量
node -e "require('dotenv').config({path:'.env.local'}); console.log('Hasura:', !!process.env.HASURA_GRAPHQL_ENDPOINT); console.log('Redis:', !!process.env.UPSTASH_REDIS_URL);"

# 2. Hasura连接
node scripts/test-hasura-connection.js

# 3. Redis连接
node scripts/test-redis-connection.js

# 4. API测试
curl http://localhost:3000/api/economy/balance?userId=test
```

全部✅即可！

---

## ⚠️ 常见问题

### Q1: "HASURA_GRAPHQL_ENDPOINT not set"

**解决：** 检查 `.env.local` 文件是否存在，路径是否正确

### Q2: Redis连接失败

**解决：** 
1. 检查Upstash URL格式：`redis://default:password@host:port`
2. 确认数据库状态为Active
3. 检查防火墙设置

### Q3: Hasura查询失败

**解决：**
1. 确认Admin Secret正确
2. 确认数据库迁移已完成
3. 在Hasura Console → Data 中Track所有表

### Q4: API返回404

**解决：** 确保在项目根目录运行 `vercel dev`，不是 `npm start`

---

## 🎯 下一步

- 📖 阅读 [API文档](API_DOCUMENTATION.md)
- 🛠️ 查看 [部署指南](SETUP.md)
- 🎨 集成前端UI
- 💰 配置Stripe支付

---

## 💡 快速命令参考

```bash
# 开发
npm run dev                    # 启动开发服务器

# 测试
npm run test:hasura           # 测试Hasura连接
npm run test:redis            # 测试Redis连接

# 数据
npm run download:fish         # 下载测试数据
node scripts/download-fish-data.js --count=100 --images

# 部署
vercel --prod                 # 部署到生产环境
```

---

## 📞 获取帮助

- 📚 [完整文档](README.md)
- 🐛 [提交Issue](https://github.com/yourusername/fish-art/issues)
- 💬 技术支持：support@fishart.com

祝您部署顺利！🐟✨



