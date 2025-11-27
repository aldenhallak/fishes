# Hasura 留言权限快速配置指南

## 方法一：使用 Hasura Console UI（推荐）

### 步骤 1：打开 Hasura Console

1. 访问你的 Hasura Console 地址
2. 登录后进入 **Data** → **messages** 表

### 步骤 2：配置 Select 权限

1. 点击 **Permissions** 标签
2. 找到 **user** 角色，点击 **Select** 权限的 **+** 按钮
3. 在 **Row select permissions** 中：
   - 选择 **With custom check**
   - 粘贴以下内容：

```json
{
  "_or": [
    {
      "sender_id": {
        "_eq": "X-Hasura-User-Id"
      }
    },
    {
      "receiver_id": {
        "_eq": "X-Hasura-User-Id"
      }
    },
    {
      "visibility": {
        "_eq": "public"
      }
    }
  ]
}
```

4. 在 **Columns select permissions** 中，勾选：
   - ✅ id
   - ✅ sender_id
   - ✅ receiver_id
   - ✅ fish_id
   - ✅ message_type
   - ✅ visibility
   - ✅ content
   - ✅ created_at

5. 点击 **Save Permissions**

### 步骤 3：配置 Insert 权限

1. 点击 **user** 角色的 **Insert** 权限的 **+** 按钮
2. 在 **Row insert permissions** 中：
   - 选择 **With custom check**
   - 粘贴：

```json
{
  "sender_id": {
    "_eq": "X-Hasura-User-Id"
  }
}
```

3. 在 **Columns insert permissions** 中，勾选：
   - ✅ sender_id
   - ✅ receiver_id
   - ✅ fish_id
   - ✅ message_type
   - ✅ visibility
   - ✅ content

4. 在 **Column presets** 中：
   - 点击 **Add a new preset**
   - Column: `sender_id`
   - Preset value: `X-Hasura-User-Id`

5. 点击 **Save Permissions**

### 步骤 4：配置 Delete 权限

1. 点击 **user** 角色的 **Delete** 权限的 **+** 按钮
2. 在 **Row delete permissions** 中：
   - 选择 **With custom check**
   - 粘贴：

```json
{
  "_or": [
    {
      "sender_id": {
        "_eq": "X-Hasura-User-Id"
      }
    },
    {
      "receiver_id": {
        "_eq": "X-Hasura-User-Id"
      }
    }
  ]
}
```

3. 点击 **Save Permissions**

### 步骤 5：配置关系（Relationships）

#### 在 messages 表中添加关系：

1. 点击 **Relationships** 标签
2. 点击 **Add a new relationship**

**关系 1：sender**
- Relationship name: `sender`
- Relationship type: `Object Relationship`
- Reference table: `users`
- From: `sender_id`
- To: `id`
- 点击 **Save**

**关系 2：receiver**
- Relationship name: `receiver`
- Relationship type: `Object Relationship`
- Reference table: `users`
- From: `receiver_id`
- To: `id`
- 点击 **Save**

**关系 3：fish**
- Relationship name: `fish`
- Relationship type: `Object Relationship`
- Reference table: `fish`
- From: `fish_id`
- To: `id`
- 点击 **Save**

#### 在 users 表中添加关系：

1. 进入 **Data** → **users** 表 → **Relationships**
2. 点击 **Add a new relationship**

**关系 1：sent_messages**
- Relationship name: `sent_messages`
- Relationship type: `Array Relationship`
- Reference table: `messages`
- From: `id`
- To: `sender_id`
- 点击 **Save**

**关系 2：received_messages**
- Relationship name: `received_messages`
- Relationship type: `Array Relationship`
- Reference table: `messages`
- From: `id`
- To: `receiver_id`
- 点击 **Save**

#### 在 fish 表中添加关系：

1. 进入 **Data** → **fish** 表 → **Relationships**
2. 点击 **Add a new relationship**

**关系：messages**
- Relationship name: `messages`
- Relationship type: `Array Relationship`
- Reference table: `messages`
- From: `id`
- To: `fish_id`
- 点击 **Save**

---

## 方法二：使用 Hasura CLI（高级）

如果你使用 Hasura CLI 管理项目，可以导出 metadata 并手动编辑：

```bash
# 导出当前 metadata
hasura metadata export

# 编辑 metadata/databases/default/tables/messages.yaml
# 添加权限配置

# 应用更改
hasura metadata apply
```

---

## 验证配置

配置完成后，在 Hasura Console 的 **API** 标签中测试：

### 测试查询公开留言：

```graphql
query {
  messages(
    where: {visibility: {_eq: "public"}}
    limit: 5
    order_by: {created_at: desc}
  ) {
    id
    content
    sender_id
    created_at
    sender {
      display_name
    }
  }
}
```

### 测试插入留言（需要登录）：

```graphql
mutation {
  insert_messages_one(object: {
    fish_id: "your-fish-uuid"
    message_type: "to_fish"
    visibility: "public"
    content: "测试留言"
  }) {
    id
    content
  }
}
```

---

## 常见问题

### Q: 提示 "permission denied"
A: 检查：
1. 是否已登录（需要有效的 JWT token）
2. X-Hasura-User-Id 是否正确设置
3. 权限配置是否正确保存

### Q: 看不到关系数据
A: 确保：
1. 关系已正确配置
2. 在查询中明确请求关系字段
3. 有权限访问关联的表

### Q: 无法插入留言
A: 检查：
1. Insert 权限是否配置
2. sender_id 预设值是否正确
3. 所有必填字段是否提供

---

## 完成检查清单

- [ ] messages 表已创建
- [ ] Select 权限已配置
- [ ] Insert 权限已配置
- [ ] Delete 权限已配置
- [ ] sender 关系已配置
- [ ] receiver 关系已配置
- [ ] fish 关系已配置
- [ ] users.sent_messages 关系已配置
- [ ] users.received_messages 关系已配置
- [ ] fish.messages 关系已配置
- [ ] 测试查询成功
- [ ] 测试插入成功
- [ ] 测试删除成功

