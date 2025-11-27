# 简化权限配置方案

## 方案说明

本方案**不需要配置 Hasura 权限**，所有权限控制都在 **API 层**实现。

### 优势

- ✅ 无需配置复杂的 Hasura 权限规则
- ✅ 权限逻辑集中在 API 代码中，易于理解和维护
- ✅ 更灵活，可以轻松调整权限逻辑

### 工作原理

1. **API 使用管理员权限**访问数据库（通过 `HASURA_ADMIN_SECRET`）
2. **API 层验证用户身份**（从请求中获取 userId）
3. **API 层过滤数据**（根据业务规则返回用户可见的数据）

---

## 数据库配置

### 1. 执行表创建脚本

```bash
# 在 Hasura Console 的 SQL 标签中执行
scripts/add-message-system.sql
```

### 2. 设置表权限（最小化配置）

在 Hasura Console 中，为 `messages` 表设置：

**所有角色（包括 user）：**
- ❌ **不需要配置任何权限**（API 使用管理员权限）

或者简单设置为：

**user 角色：**
- Select: **无权限**（不允许直接查询）
- Insert: **无权限**（不允许直接插入）
- Delete: **无权限**（不允许直接删除）

这样确保所有操作都通过 API 进行，API 层负责权限控制。

---

## API 权限控制逻辑

### 发送留言 (`POST /api/message/send`)

```javascript
// 权限控制：
1. 验证 userId 是否登录
2. 验证 sender_id = userId（确保用户只能以自己的身份发送）
3. 频率限制：1分钟内最多1条
4. 内容长度：1-50字符
```

### 查看鱼的留言 (`GET /api/message/fish-messages`)

```javascript
// 权限控制：
1. 查询该鱼的所有留言（管理员权限）
2. 判断当前用户是否为鱼的主人
3. 如果是主人：返回所有留言（公开+私密）
4. 如果不是主人：只返回公开留言
```

### 查看用户留言 (`GET /api/message/user-messages`)

```javascript
// 权限控制：
1. 查询发给该用户的所有留言（管理员权限）
2. 判断当前用户是否为查看目标用户本人
3. 如果是本人：返回所有留言（公开+私密）
4. 如果不是本人：只返回公开留言
```

### 删除留言 (`DELETE /api/message/delete`)

```javascript
// 权限控制：
1. 查询留言信息（管理员权限）
2. 验证：sender_id === userId 或 receiver_id === userId
3. 只有发送者或接收者可以删除
```

---

## 安全措施

### 1. API 层验证

所有 API 端点都会：
- ✅ 验证用户身份（userId）
- ✅ 验证操作权限（是否属于用户）
- ✅ 过滤返回数据（只返回用户有权查看的）

### 2. 数据库约束

数据库层面的保护：
- ✅ 外键约束（确保数据完整性）
- ✅ 内容长度约束（1-50字符）
- ✅ 业务逻辑约束（message_type 和 target 的匹配）

### 3. 频率限制

- ✅ Redis 缓存实现（1分钟内最多1条留言）

---

## 配置步骤

### 步骤 1：创建表

在 Hasura Console 的 SQL 标签中执行：

```sql
-- 执行 scripts/add-message-system.sql
```

### 步骤 2：设置表权限（可选，推荐）

在 Hasura Console → Data → messages → Permissions：

**user 角色：**
- Select: **无权限**
- Insert: **无权限**
- Delete: **无权限**

这样确保所有操作都通过 API。

### 步骤 3：测试 API

使用 Postman 或 curl 测试：

```bash
# 发送留言
curl -X POST http://localhost:3000/api/message/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "messageType": "to_fish",
    "targetId": "fish-uuid",
    "content": "你好！",
    "visibility": "public"
  }'

# 查看鱼的留言
curl "http://localhost:3000/api/message/fish-messages?fishId=fish-uuid&userId=user-123"

# 查看用户留言
curl "http://localhost:3000/api/message/user-messages?userId=user-123&currentUserId=user-123"

# 删除留言
curl -X DELETE http://localhost:3000/api/message/delete \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "message-uuid",
    "userId": "user-123"
  }'
```

---

## 注意事项

1. **API 必须使用管理员密钥**
   - 确保 `HASURA_ADMIN_SECRET` 环境变量已设置
   - API 使用管理员权限查询数据库

2. **用户身份验证**
   - 所有 API 都需要 `userId` 参数
   - 前端应该从登录状态中获取 userId

3. **数据过滤**
   - 所有查询结果都在 API 层过滤
   - 确保不会泄露用户无权查看的数据

4. **性能考虑**
   - 如果留言数量很大，考虑添加分页
   - 当前限制为最多 200 条（可在代码中调整）

---

## 与 Hasura 权限方案对比

| 特性 | Hasura 权限方案 | API 层权限方案（当前） |
|------|---------------|---------------------|
| 配置复杂度 | 高（需要配置多个权限规则） | 低（无需配置） |
| 灵活性 | 中（权限规则相对固定） | 高（代码中可灵活调整） |
| 性能 | 高（数据库层过滤） | 中（应用层过滤） |
| 维护性 | 中（权限分散在配置中） | 高（权限逻辑集中在代码中） |
| 适用场景 | 大型项目，需要细粒度权限 | 中小型项目，简单权限控制 |

---

## 完成检查清单

- [x] messages 表已创建
- [x] API 层权限控制已实现
- [x] 发送留言权限验证
- [x] 查看留言数据过滤
- [x] 删除留言权限验证
- [x] 频率限制已实现
- [x] 内容长度验证已实现
- [ ] 测试发送留言功能
- [ ] 测试查看留言功能
- [ ] 测试删除留言功能

