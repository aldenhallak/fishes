# 鱼缸功能快速启动指南

## 5分钟快速迁移到Hasura

### 步骤1：创建数据库表（2分钟）

1. 打开Hasura Console
2. 进入 `Data` → `SQL` 标签页
3. 复制并执行 `scripts/create-fishtank-tables.sql` 的内容
4. 点击 `Run!` 按钮

### 步骤2：配置表权限（2分钟）

在Hasura Console中：

1. **fishtanks表：**
   - 进入 `Data` → `fishtanks` → `Permissions`
   - 为`user` role添加权限：
     - Select: `{ "_or": [{ "is_public": { "_eq": true } }, { "user_id": { "_eq": "X-Hasura-User-Id" } }] }`
     - Insert: `{ "user_id": { "_eq": "X-Hasura-User-Id" } }`
     - Update: `{ "user_id": { "_eq": "X-Hasura-User-Id" } }`
     - Delete: `{ "user_id": { "_eq": "X-Hasura-User-Id" } }`

2. **fishtank_fish表：**
   - Select: `{ "_or": [{ "fishtank": { "is_public": { "_eq": true } } }, { "fishtank": { "user_id": { "_eq": "X-Hasura-User-Id" } } }] }`
   - Insert: `{ "_or": [{ "fishtank": { "user_id": { "_eq": "X-Hasura-User-Id" } } }, { "fishtank": { "is_public": { "_eq": true } } }] }`
   - Delete: `{ "fishtank": { "user_id": { "_eq": "X-Hasura-User-Id" } } }`

3. **fishtank_views表：**
   - Select: `{ "fishtank": { "user_id": { "_eq": "X-Hasura-User-Id" } } }`
   - Insert: `{}` (允许匿名)

### 步骤3：更新HTML文件（1分钟）

在 `fishtanks.html` 和 `fishtank-view.html` 中，在现有script标签之前添加：

```html
<script src="src/js/fishtank-hasura.js"></script>
```

### 测试

1. 打开浏览器访问 `fishtanks.html`
2. 登录你的账户
3. 点击"Create Tank"创建一个测试鱼缸
4. 如果成功创建，迁移完成！

### 遇到问题？

查看完整的迁移指南：[FISHTANK_HASURA_MIGRATION.md](./FISHTANK_HASURA_MIGRATION.md)

### 验证清单

- [ ] 数据库表创建成功
- [ ] Hasura权限配置完成
- [ ] 前端JS文件已引入
- [ ] 可以创建鱼缸
- [ ] 可以查看鱼缸列表
- [ ] 可以添加鱼到鱼缸

## 常见问题

**Q: 创建鱼缸时提示"permission denied"**

A: 检查Hasura中fishtanks表的Insert权限是否正确配置。

**Q: 看不到公开鱼缸**

A: 检查fishtanks表的Select权限是否包含公开鱼缸的条件。

**Q: GraphQL请求失败**

A: 
1. 检查`api/graphql.js`文件是否存在
2. 检查环境变量`HASURA_GRAPHQL_ENDPOINT`是否配置
3. 查看浏览器控制台的错误信息

