# ⚡ 5分钟快速开始指南

## 📝 前置条件

- [ ] Node.js 16+ 已安装
- [ ] Git 已安装
- [ ] 有Supabase账号
- [ ] 有Vercel账号

---

## 🚀 快速部署（5步）

### Step 1: 配置Supabase (2分钟)

```bash
# 1. 访问 https://supabase.com/ 创建项目
# 2. 记录配置信息：
#    - Project URL: https://xxx.supabase.co
#    - anon key: eyJhbGci...
#    - JWT Secret: (Settings → API → JWT Settings)
#    - PostgreSQL连接字符串: (Settings → Database)
```

### Step 2: 配置Hasura (2分钟)

```bash
# 1. 在Hasura Console连接Supabase的PostgreSQL
# 2. 在SQL标签页执行：scripts/migrate-database.sql
# 3. Track所有表（Data标签页点击Track按钮）
# 4. 记录Hasura Admin Secret
```

### Step 3: 替换文件 (30秒)

```bash
# 备份
cp src/js/fish-utils.js src/js/fish-utils.backup.js

# 替换
mv src/js/fish-utils-new.js src/js/fish-utils.js
cp package.json.new package.json
```

### Step 4: 更新配置 (30秒)

编辑 `public/supabase-config.js`:
```javascript
window.SUPABASE_URL = 'https://xxx.supabase.co'; // 你的URL
window.SUPABASE_ANON_KEY = 'eyJhbGci...'; // 你的key
```

创建 `.env.local`:
```env
HASURA_GRAPHQL_ENDPOINT=https://your-hasura.com/v1/graphql
HASURA_ADMIN_SECRET=your-secret
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
UPSTASH_REDIS_URL=redis://xxx (可选)
```

### Step 5: 部署 (1分钟)

```bash
# 推送代码
git add .
git commit -m "feat: backend rebuild complete"
git push

# Vercel会自动部署
# 在Vercel Dashboard配置环境变量（复制.env.local的内容）
```

---

## ✅ 验证

访问你的网站：
1. 注册账号 ✅
2. 画一条鱼并提交 ✅
3. 查看鱼缸 ✅
4. 点赞 ✅

成功！🎉

---

## 📖 详细文档

- 完整部署: `DEPLOYMENT_FINAL.md`
- 前端迁移: `MIGRATION_GUIDE.md`
- Hasura配置: `docs/HASURA_SETUP.md`
- API文档: `API_DOCUMENTATION.md`

---

## 🆘 遇到问题？

**Supabase未初始化**
→ 检查HTML是否正确引入SDK（参考MIGRATION_GUIDE.md）

**API返回404**
→ 确保api/文件夹已推送到Vercel

**数据库连接失败**
→ 检查Hasura是否正确连接PostgreSQL

---

祝你好运！🚀



