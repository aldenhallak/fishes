# Hasura 关联设置详细步骤

## 🔗 在 Hasura Console 中设置关联

### 1. 打开 Hasura Console
访问你的 Hasura Console（通常是 http://localhost:8080 或你的 Hasura 端点）

### 2. 设置 group_chat -> users 关联

1. 进入 **Data** 页面
2. 选择 **group_chat** 表
3. 点击 **Relationships** 标签
4. 在 **Object Relationships** 部分点击 **Add**
5. 填写以下信息：
   - **Relationship Name**: `initiator_user`
   - **Reference Schema**: `public`
   - **Reference Table**: `users`
   - **From**: `initiator_user_id`
   - **To**: `id`
6. 点击 **Save**

### 3. 设置 users -> group_chat 关联

1. 选择 **users** 表
2. 点击 **Relationships** 标签
3. 在 **Array Relationships** 部分点击 **Add**
4. 填写以下信息：
   - **Relationship Name**: `initiated_group_chats`
   - **Reference Schema**: `public`
   - **Reference Table**: `group_chat`
   - **From**: `id`
   - **To**: `initiator_user_id`
5. 点击 **Save**

## 🧪 测试关联

在 Hasura Console 的 **GraphiQL** 页面中运行以下查询：

```graphql
query TestGroupChatRelationships {
  # 测试 group_chat -> users 关联
  group_chat(limit: 5, order_by: {created_at: desc}) {
    id
    topic
    created_at
    initiator_user_id
    initiator_user {
      id
      feeder_name
      email
      display_name
    }
  }
  
  # 测试 users -> group_chat 关联
  users(limit: 3, where: {initiated_group_chats: {}}) {
    id
    feeder_name
    email
    initiated_group_chats(limit: 5, order_by: {created_at: desc}) {
      id
      topic
      created_at
    }
  }
}
```

## ✅ 验证成功标志

如果设置成功，你应该看到：
- group_chat 记录包含 `initiator_user` 对象
- users 记录包含 `initiated_group_chats` 数组
- 没有 GraphQL 错误

## 🔧 故障排查

### 问题：关联不显示
- 确保外键约束已正确添加
- 检查字段名称是否正确���配
- 确认表中有相关数据

### 问题：GraphQL 查询失败
- 检查关联名称是否正确
- 确认权限设置允许查询相关表
- 查看 Hasura Console 的错误信息

### 问题：数据不一致
- 运行验证查询检查数据完整性
- 考虑清理无效的 `initiator_user_id` 记录

## 📊 使用新关联的查询示例

```graphql
# 查询特定用户发起的群聊
query GetUserGroupChats($userId: String!) {
  users_by_pk(id: $userId) {
    feeder_name
    initiated_group_chats(
      order_by: {created_at: desc}
      limit: 10
    ) {
      id
      topic
      created_at
      participant_fish_ids
    }
  }
}

# 查询今日群聊统计
query GetTodayGroupChats($todayStart: timestamp!) {
  group_chat_aggregate(
    where: {created_at: {_gte: $todayStart}}
  ) {
    aggregate {
      count
    }
    nodes {
      initiator_user {
        feeder_name
      }
      topic
      created_at
    }
  }
}
```
