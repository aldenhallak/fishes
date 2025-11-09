# Hasura Messages 表权限配置指南

## 配置步骤

1. 登录 Hasura Console
2. 进入 Data → messages 表 → Permissions 标签
3. 为 `user` 角色配置以下权限

---

## Select 权限

允许用户查看：
- 自己发送的留言
- 发给自己的留言
- 所有公开留言

**配置：**

```json
{
  "filter": {
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
}
```

**允许的列：**
- [x] id
- [x] sender_id
- [x] receiver_id
- [x] fish_id
- [x] message_type
- [x] visibility
- [x] content
- [x] created_at

---

## Insert 权限

只允许用户以自己的身份发送留言

**配置：**

```json
{
  "check": {
    "sender_id": {
      "_eq": "X-Hasura-User-Id"
    }
  }
}
```

**允许的列：**
- [x] sender_id (set from session variable `X-Hasura-User-Id`)
- [x] receiver_id
- [x] fish_id
- [x] message_type
- [x] visibility
- [x] content

**列预设值：**
```json
{
  "sender_id": "X-Hasura-User-Id"
}
```

---

## Delete 权限

只允许删除自己发送或接收的留言

**配置：**

```json
{
  "filter": {
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
}
```

---

## Update 权限

❌ 不需要配置（本系统不支持编辑留言）

---

## 注意事项

1. **频率限制**：在 API 层实现（1分钟内最多1条留言）
2. **内容长度**：数据库约束已设置（1-50字符）
3. **XSS防护**：在前端显示时转义 HTML
4. **关系查询**：确保配置了与 `users` 和 `fish` 表的关系

---

## 关系配置

### Object Relationships

1. **sender** → users
   - Foreign key: `sender_id` → `users.user_id`

2. **receiver** → users
   - Foreign key: `receiver_id` → `users.user_id`

3. **fish** → fish
   - Foreign key: `fish_id` → `fish.id`

### Array Relationships (在其他表中配置)

1. **users.sent_messages** → messages
   - Foreign key: `messages.sender_id` → `user_id`

2. **users.received_messages** → messages
   - Foreign key: `messages.receiver_id` → `user_id`

3. **fish.messages** → messages
   - Foreign key: `messages.fish_id` → `id`

---

## 验证权限

执行迁移后，可以在 Hasura Console 的 API Explorer 中测试：

```graphql
# 查询公开留言
query GetPublicMessages {
  messages(where: {visibility: {_eq: "public"}}, limit: 10) {
    id
    content
    sender_id
    created_at
  }
}

# 插入留言
mutation SendMessage {
  insert_messages_one(object: {
    fish_id: "your-fish-uuid",
    message_type: "to_fish",
    visibility: "public",
    content: "Hello!"
  }) {
    id
  }
}
```

