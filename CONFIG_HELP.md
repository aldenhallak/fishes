# ⚙️ 环境变量配置帮助

## 当前状态

✅ `.env.local` 文件已创建  
⚠️ 需要填写真实的配置值

---

## 📋 必填配置（Hasura）

### 1. HASURA_GRAPHQL_ENDPOINT

**在哪里找到**：
- 如果使用 Hasura Cloud：
  - 打开 https://cloud.hasura.io/
  - 选择您的项目
  - 复制 GraphQL Endpoint URL
  - 格式：`https://xxx.hasura.app/v1/graphql`

- 如果自建Hasura：
  - 使用您的服务器地址
  - 格式：`https://your-domain.com/v1/graphql`

**示例**：
```env
HASURA_GRAPHQL_ENDPOINT=https://my-fish-app.hasura.app/v1/graphql
```

### 2. HASURA_ADMIN_SECRET

**在哪里找到**：
- Hasura Cloud：Project → Settings → Env vars → `HASURA_GRAPHQL_ADMIN_SECRET`
- 自建Hasura：查看您启动Hasura时设置的环境变量

**如果没有设置**：
- 在Hasura Cloud项目设置中添加一个新的Admin Secret
- 建议使用至少32位的随机字符串

**示例**：
```env
HASURA_ADMIN_SECRET=MySecretKey123!@#$%
```

---

## 📋 可选配置（暂时可以跳过）

### Supabase 配置

如果还没创建Supabase项目，可以先使用占位符：

```env
SUPABASE_URL=https://placeholder.supabase.co
SUPABASE_ANON_KEY=placeholder-key
SUPABASE_SERVICE_ROLE_KEY=placeholder-key
SUPABASE_JWT_SECRET=placeholder-secret
```

**等创建Supabase项目后再填写真实值**。

### Redis 配置

如果暂时不需要并发控制，可以注释掉：

```env
# UPSTASH_REDIS_URL=redis://...
```

---

## ✅ 最小可用配置

**只需要这2个配置即可测试Hasura连接**：

```env
HASURA_GRAPHQL_ENDPOINT=https://YOUR-PROJECT.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=YOUR-ADMIN-SECRET

NODE_ENV=development
```

其他配置可以暂时留空或使用占位符。

---

## 🧪 测试步骤

### 1. 编辑配置文件

打开 `.env.local`（应该已在记事本中打开），填入您的配置。

### 2. 保存文件

按 `Ctrl+S` 保存。

### 3. 运行测试

```bash
npm run test:hasura
```

### 4. 预期结果

**成功**时会显示：
```
✅ Hasura连接成功！
✅ GraphQL API正常工作
✅ 数据库已连接
```

**失败**时会显示具体错误信息。

---

## 🔍 常见问题

### Q: "Failed to parse URL from undefined"
**A**: 环境变量未加载，确保：
1. `.env.local` 文件在项目根目录
2. 文件名正确（不是 `.env.local.txt`）
3. 已保存修改

### Q: "401 Unauthorized"
**A**: Admin Secret错误，检查：
1. Admin Secret是否正确复制
2. 是否有多余的空格
3. Hasura是否设置了Admin Secret

### Q: "Network error"
**A**: Endpoint地址错误，检查：
1. URL格式是否正确
2. 是否包含 `/v1/graphql`
3. 是否能在浏览器中访问

### Q: 如何验证配置是否正确？
**A**: 在浏览器中访问：
```
https://YOUR-PROJECT.hasura.app/console
```
如果能打开Hasura Console，说明地址正确。

---

## 📞 获取更多帮助

- Hasura文档: https://hasura.io/docs/
- Supabase文档: https://supabase.com/docs
- 项目文档: `DEPLOYMENT_FINAL.md`

---

## 🎯 下一步

配置完成后：
1. ✅ 测试Hasura连接: `npm run test:hasura`
2. ✅ 测试Redis连接（可选）: `npm run test:redis`
3. ✅ Track数据库表（在Hasura Console中）
4. ✅ 配置Hasura权限（参考 `docs/HASURA_SETUP.md`）

---

**提示**: 先只配置Hasura，测试通过后再配置其他服务。一步一步来！🚀

