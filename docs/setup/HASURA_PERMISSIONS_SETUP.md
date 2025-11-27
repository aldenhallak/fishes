# 🔐 Hasura 权限配置详细指南

## 📋 配置清单

按照计划阶段3，需要配置以下权限规则：

---

## 🎯 Step 1: 更新 battle_config 表结构

首先确保表结构正确。在 Hasura Console → Data → SQL 执行：

```sql
ALTER TABLE battle_config
ADD COLUMN IF NOT EXISTS max_battle_users INT DEFAULT 50,
ADD COLUMN IF NOT EXISTS battle_cooldown_seconds INT DEFAULT 30;
```

验证：
```sql
SELECT * FROM battle_config WHERE id = 1;
```

---

## 🔑 Step 2: 配置 JWT 集成

### 2.1 获取 Supabase JWT Secret

1. 登录 Supabase Dashboard
2. 进入 Project Settings → API
3. 找到 **JWT Settings** 部分
4. 复制 **JWT Secret**

### 2.2 配置 Hasura

在 Hasura 环境变量中添加：

```bash
HASURA_GRAPHQL_JWT_SECRET={"type":"HS256","key":"YOUR_SUPABASE_JWT_SECRET"}
```

**重要**：将 `YOUR_SUPABASE_JWT_SECRET` 替换为实际的 JWT Secret。

---

## 🛡️ Step 3: 配置表权限

### 3.1 fish 表权限

#### Select (查询) - 公开读取

**Role**: `public` 和 `user`

**Permission**:
- Without any checks (允许查询所有已审核的鱼)

**Filter**:
```json
{
  "is_approved": {
    "_eq": true
  },
  "reported": {
    "_eq": false
  }
}
```

**Columns**: 允许所有列

---

#### Insert (插入) - 仅认证用户

**Role**: `user`

**Permission**:
- With custom check

**Check**:
```json
{
  "user_id": {
    "_eq": "X-Hasura-User-Id"
  }
}
```

**Column presets**:
- `user_id`: `x-hasura-user-id`
- `created_at`: `now()`

**Columns**: 允许插入
- `image_url`
- `artist`
- `talent` (系统生成)

---

#### Update (更新) - 仅所有者

**Role**: `user`

**Permission**:
- With custom check

**Check**:
```json
{
  "user_id": {
    "_eq": "X-Hasura-User-Id"
  }
}
```

**Columns**: 允许更新
- `is_in_battle_mode`
- `position_row`

**系统字段不允许用户更新**：
- `level`
- `experience`
- `health`
- `battle_power`

---

#### Delete (删除) - 仅所有者

**Role**: `user`

**Permission**:
- With custom check

**Check**:
```json
{
  "user_id": {
    "_eq": "X-Hasura-User-Id"
  }
}
```

---

### 3.2 votes 表权限

#### Select (查询) - 仅自己的投票

**Role**: `user`

**Permission**:
```json
{
  "user_id": {
    "_eq": "X-Hasura-User-Id"
  }
}
```

**Columns**: 所有列

---

#### Insert (插入) - 认证用户

**Role**: `user`

**Permission**:
```json
{
  "user_id": {
    "_eq": "X-Hasura-User-Id"
  }
}
```

**Column presets**:
- `user_id`: `x-hasura-user-id`
- `created_at`: `now()`

**Columns**: 允许插入
- `fish_id`
- `vote_type`

---

### 3.3 reports 表权限

#### Insert (插入) - 任何人（包括匿名）

**Role**: `public` 和 `user`

**Permission**: Without any checks

**Column presets**:
- `created_at`: `now()`
- `status`: `'pending'`

**Columns**: 允许插入
- `fish_id`
- `reporter_ip`
- `reason`
- `user_agent`
- `url`

---

#### Select (查询) - 仅管理员

**Role**: `admin`

**Permission**: Without any checks

**Columns**: 所有列

---

### 3.4 battle_config 表权限

#### Select (查询) - 公开读取

**Role**: `public` 和 `user`

**Permission**: Without any checks

**Columns**: 所有列

---

#### Update (更新) - 仅管理员

**Role**: `admin`

**Permission**: Without any checks

**Columns**: 所有配置列

---

### 3.5 user_economy 表权限

#### Select (查询) - 仅自己的数据

**Role**: `user`

**Permission**:
```json
{
  "user_id": {
    "_eq": "X-Hasura-User-Id"
  }
}
```

**Columns**: 所有列

---

#### Insert (插入) - 自动创建

**Role**: `user`

**Permission**:
```json
{
  "user_id": {
    "_eq": "X-Hasura-User-Id"
  }
}
```

**Column presets**:
- `user_id`: `x-hasura-user-id`
- `fish_food`: `10`
- `created_at`: `now()`

---

#### Update (更新) - 通过API（不允许直接更新）

**Note**: 经济数据只能通过后端API更新，不配置直接更新权限。

---

### 3.6 battle_log 表权限

#### Select (查询) - 相关用户可查询

**Role**: `user`

**Permission**:
```json
{
  "_or": [
    {
      "attacker": {
        "user_id": {
          "_eq": "X-Hasura-User-Id"
        }
      }
    },
    {
      "defender": {
        "user_id": {
          "_eq": "X-Hasura-User-Id"
        }
      }
    }
  ]
}
```

**Columns**: 所有列

---

#### Insert (插入) - 通过API（服务端）

**Note**: 战斗日志只能通过后端API创建，使用 admin secret。

---

### 3.7 economy_log 表权限

#### Select (查询) - 仅自己的记录

**Role**: `user`

**Permission**:
```json
{
  "user_id": {
    "_eq": "X-Hasura-User-Id"
  }
}
```

**Columns**: 所有列

---

#### Insert (插入) - 通过API（服务端）

**Note**: 经济日志只能通过后端API创建。

---

## 🔗 Step 4: 配置表关系

### fish 表关系

#### votes (一对多)
- **Relationship name**: `votes`
- **Type**: Array relationship
- **Reference**: `votes.fish_id → fish.id`

#### reports (一对多)
- **Relationship name**: `reports`
- **Type**: Array relationship
- **Reference**: `reports.fish_id → fish.id`

#### battle_logs_as_attacker (一对多)
- **Relationship name**: `battle_logs_as_attacker`
- **Type**: Array relationship
- **Reference**: `battle_log.attacker_id → fish.id`

#### battle_logs_as_defender (一对多)
- **Relationship name**: `battle_logs_as_defender`
- **Type**: Array relationship
- **Reference**: `battle_log.defender_id → fish.id`

---

### votes 表关系

#### fish (多对一)
- **Relationship name**: `fish`
- **Type**: Object relationship
- **Reference**: `votes.fish_id → fish.id`

---

### reports 表关系

#### fish (多对一)
- **Relationship name**: `fish`
- **Type**: Object relationship
- **Reference**: `reports.fish_id → fish.id`

---

### battle_log 表关系

#### attacker (多对一)
- **Relationship name**: `attacker`
- **Type**: Object relationship
- **Reference**: `battle_log.attacker_id → fish.id`

#### defender (多对一)
- **Relationship name**: `defender`
- **Type**: Object relationship
- **Reference**: `battle_log.defender_id → fish.id`

---

## ✅ 验证配置

### 测试查询（作为匿名用户）

```graphql
query TestPublicAccess {
  fish(limit: 5) {
    id
    artist
    level
    upvotes
  }
}
```

应该成功返回数据。

---

### 测试查询（作为认证用户）

**设置请求头**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

```graphql
query TestUserAccess {
  fish(where: { user_id: { _eq: "YOUR_USER_ID" } }) {
    id
    artist
    level
    experience
  }
  
  user_economy(where: { user_id: { _eq: "YOUR_USER_ID" } }) {
    fish_food
    total_earned
  }
}
```

应该只返回该用户的数据。

---

### 测试插入（作为认证用户）

```graphql
mutation TestInsertFish {
  insert_fish_one(object: {
    image_url: "https://example.com/fish.png"
    artist: "Test Artist"
    talent: 60
  }) {
    id
    user_id
  }
}
```

`user_id` 应该自动设置为当前用户ID。

---

## 🚨 安全检查清单

- [ ] JWT Secret 已正确配置
- [ ] 所有表的权限都已设置
- [ ] 用户只能访问自己的数据
- [ ] 匿名用户只能查询公开数据
- [ ] 关键操作（战斗、经济）只能通过后端API
- [ ] 测试查询通过
- [ ] 测试插入通过
- [ ] 测试更新权限正确

---

## 📚 参考资料

- [Hasura 权限文档](https://hasura.io/docs/latest/auth/authorization/permissions/)
- [Supabase JWT 集成](https://supabase.com/docs/guides/auth/jwt-auth)
- [GraphQL 权限最佳实践](https://hasura.io/docs/latest/auth/authorization/best-practices/)

---

## 🆘 常见问题

### Q: 权限配置后查询失败？
**A**: 检查 JWT Token 是否正确，确保 `x-hasura-user-id` claim 存在。

### Q: 如何测试不同角色的权限？
**A**: 在 Hasura Console 的 GraphiQL 中，可以切换不同的角色进行测试。

### Q: 匿名用户能做什么？
**A**: 只能查询已审核的鱼和提交举报，不能投票或创建鱼。

---

完成配置后，Hasura 权限系统将确保数据安全！🔒



