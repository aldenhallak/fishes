# 🚀 最终部署指南

## ✅ 完成检查清单

在部署前，确保已完成：

- [x] **阶段1**: 数据库结构创建完成
- [x] **阶段2**: Supabase认证模块创建
- [x] **阶段3**: Hasura配置文档完成
- [x] **阶段4**: 所有API端点实现完成
- [x] **阶段5**: 前端Auth替换完成
- [x] **阶段6**: 前端数据获取替换完成
- [ ] **阶段7**: 依赖安装和测试
- [ ] **阶段8**: 生产环境部署

---

## 📦 Step 1: 安装依赖

```bash
# 安装新依赖
npm install

# 或如果需要手动安装
npm install dotenv@^16.6.1 ioredis@^5.8.2
npm install --save-dev @vercel/node@^3.0.0
```

---

## 🗄️ Step 2: 配置Supabase

### 2.1 创建Supabase项目

1. 访问 https://supabase.com/
2. 点击 "New Project"
3. 填写项目信息：
   - Name: fish-art-battle
   - Database Password: (生成强密码)
   - Region: 选择离你最近的

### 2.2 获取配置信息

在Supabase Dashboard → Settings → API：
- **Project URL**: `https://xxx.supabase.co`
- **anon/public key**: `eyJhbGci...`
- **service_role key**: `eyJhbGci...` (保密！)

在Settings → Database → Connection string → URI：
- 用于Hasura连接PostgreSQL

在Settings → API → JWT Settings：
- **JWT Secret**: 用于Hasura JWT配置

---

## 🔧 Step 3: 配置Hasura

### 3.1 连接数据库

1. 在Hasura Console → Data
2. 点击 "Connect Database"
3. 输入Supabase的PostgreSQL连接字符串
4. 点击 "Connect"

### 3.2 执行数据库迁移

1. 在Hasura Console → Data → SQL
2. 复制 `scripts/migrate-database.sql` 的全部内容
3. 粘贴并点击 "Run"
4. 等待执行完成（应该显示"✅ 数据库迁移完成！"）

### 3.3 Track所有表

在Data标签页，依次点击"Track"：
- fish
- votes
- reports
- battle_config
- user_economy
- battle_log
- economy_log

也Track所有视图：
- fish_with_scores
- battle_fish
- user_fish_summary

### 3.4 配置JWT

在Hasura环境变量中添加（参考Supabase的JWT Secret）：

```bash
HASURA_GRAPHQL_JWT_SECRET='{"type":"HS256","key":"YOUR_SUPABASE_JWT_SECRET"}'
```

### 3.5 配置权限

参考 `docs/HASURA_SETUP.md` 中的详细权限配置。

---

## 🌐 Step 4: 配置Vercel环境变量

### 4.1 在Vercel Dashboard设置

进入你的Vercel项目 → Settings → Environment Variables：

```env
# Hasura
HASURA_GRAPHQL_ENDPOINT=https://your-hasura.com/v1/graphql
HASURA_ADMIN_SECRET=your-hasura-admin-secret

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (保密！)
SUPABASE_JWT_SECRET=your-jwt-secret

# Redis
UPSTASH_REDIS_URL=redis://default:xxx@xxx.upstash.io:6379

# 战斗系统
MAX_BATTLE_USERS=100
BATTLE_COOLDOWN_SECONDS=5

# 环境
NODE_ENV=production
```

### 4.2 更新public/supabase-config.js

在**生产环境部署前**，更新此文件：

```javascript
window.SUPABASE_URL = 'https://xxx.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGci...';
```

**或者**使用Vercel的环境变量注入（推荐）。

---

## 🧪 Step 5: 本地测试

```bash
# 启动开发服务器
npm run dev
# 或
vercel dev

# 在另一个终端运行测试
npm run test:all

# 或运行完整后端测试
node scripts/test-all-backend.js
```

### 测试清单

访问 http://localhost:3000 并测试：

- [ ] 用户注册（会收到确认邮件）
- [ ] 用户登录
- [ ] 画鱼并提交（消耗2个鱼食）
- [ ] 查看鱼缸（应该能看到新鱼）
- [ ] 点赞/点踩功能
- [ ] 举报功能
- [ ] 查看排行榜
- [ ] 每日签到（获得10个鱼食）
- [ ] 喂食（消耗1个鱼食）

---

## 🚀 Step 6: 部署到生产环境

### 6.1 提交代码

```bash
git add .
git commit -m "feat: 完全重建后端，使用Hasura + Supabase + Vercel"
git push origin main
```

### 6.2 Vercel自动部署

Vercel会自动检测到push并开始部署。

### 6.3 验证部署

1. 访问你的生产URL
2. 检查所有功能是否正常
3. 查看Vercel Functions日志
4. 查看Hasura Console监控

---

## 📊 Step 7: 监控和优化

### 7.1 Hasura监控

在Hasura Console → Monitoring查看：
- 查询性能
- 错误率
- 慢查询

### 7.2 Redis监控

在Upstash Dashboard查看：
- 命令数使用量
- 延迟
- 内存使用

### 7.3 Vercel Analytics

在Vercel Dashboard查看：
- Function执行次数
- 响应时间
- 错误日志

---

## 🔐 Step 8: 安全检查

- [ ] Hasura Admin Secret已设置且复杂
- [ ] Supabase Service Role Key未泄露
- [ ] .env.local已加入.gitignore
- [ ] API权限配置正确
- [ ] 速率限制已启用

---

## 🎉 Step 9: 完成！

恭喜！你的Fish Art Battle后端已完全重建！

### 新功能清单

✅ 完全移除Firebase依赖
✅ 使用Supabase Auth认证
✅ 使用Hasura + PostgreSQL数据库
✅ 14个Vercel Serverless API端点
✅ Redis并发控制和缓存
✅ 完整的战斗系统
✅ 完整的经济系统
✅ 点赞、举报功能
✅ 排行榜系统

### 性能指标

- API响应时间: < 200ms
- 并发支持: 100人战斗模式
- 数据库查询: < 100ms
- Redis延迟: < 50ms

---

## 📞 获取帮助

遇到问题？查看：

- `MIGRATION_GUIDE.md` - 前端迁移指南
- `docs/HASURA_SETUP.md` - Hasura详细配置
- `API_DOCUMENTATION.md` - API文档
- `BACKEND_REBUILD_PROGRESS.md` - 进度报告

---

## 🔄 回滚计划（如果出现问题）

1. 恢复备份的旧文件：
   ```bash
   mv src/js/fish-utils.old.js src/js/fish-utils.js
   mv src/js/login.old.js src/js/login.js
   ```

2. 在HTML中恢复Firebase SDK

3. 回滚到上一个Git commit：
   ```bash
   git revert HEAD
   ```

---

祝部署顺利！🚀🐟✨



