# 快速设置 Hasura 关联（无外键约束）

## 🚀 第一步：执行SQL（可选）
在 Hasura Console 执行 `database-setup-relations-only.txt` 中的SQL来添加索引优化。

## 🔗 第二步：设置GraphQL关联

### 1. group_chat 表 → users 表关联

1. 打开 Hasura Console → **Data** → 选择 **group_chat** 表
2. 点击 **Relationships** 标签
3. 在 **Object Relationships** 部分点击 **Add**
4. 填写：
   - **Relationship Name**: `initiator_user`
   - **Reference Table**: `users`
   - **From**: `initiator_user_id` 
   - **To**: `id`
5. 点击 **Save**

### 2. users 表 → group_chat 表关联

1. 选择 **users** 表
2. 点击 **Relationships** 标签  
3. 在 **Array Relationships** 部分点击 **Add**
4. 填写：
   - **Relationship Name**: `initiated_group_chats`
   - **Reference Table**: `group_chat`
   - **From**: `id`
   - **To**: `initiator_user_id`
5. 点击 **Save**

## 🧪 第三步：测试关联

在 Hasura Console 的 **GraphiQL** 中测试：

```graphql
query TestGroupChatRelations {
  group_chat(limit: 3, order_by: {created_at: desc}) {
    id
    topic
    created_at
    initiator_user_id
    initiator_user {
      id
      feeder_name
      email
    }
  }
}
```

## ✅ 完成！

设置完成后：
- ✅ 可以通过GraphQL查询关联数据
- ✅ 群聊使用量计算应该正常工作
- ✅ 浏览器控制台应该显示正确的使用量

**不使用外键约束的好处**：
- 设置更简单
- 不会因为数据不一致而报错
- 更灵活的数据管理

**注意**：
- 需要手动确保数据一致性
- 删除用户时需要手动处理相关群聊记录
