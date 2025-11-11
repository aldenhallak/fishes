# User Subscriptions 主键迁移指南

## 概述

将 `user_subscriptions` 表的主键从 `user_id` 改为自增 `id` 字段，以支持用户多次订阅。

## 迁移步骤

### 1. 执行 SQL 迁移

在 Hasura Console 的 SQL 编辑器中执行：

```sql
-- 见 sql/refactor_user_subscriptions_complete.sql
```

### 2. 刷新 Hasura 元数据

1. 进入 Hasura Console → **Data** → `user_subscriptions` 表
2. 点击右上角的 **Reload** 或 **Track All**
3. 检查表结构，确认 `id` 字段已出现并标记为主键

### 3. 更新 GraphQL Schema

Hasura 会自动检测新的主键，但需要手动刷新：
- 进入 Hasura Console → **Data** → `user_subscriptions`
- 点击 **Modify** 标签
- 确认 `id` 字段存在且为主键
- 点击 **Reload Metadata**（在 Settings 中）

## 代码更新

### 需要修改的查询模式

#### 旧方式（基于 user_id 主键查询）：
```graphql
query {
  user_subscriptions_by_pk(user_id: "user-id") {
    plan
    is_active
  }
}
```

#### 新方式（查询用户的所有订阅）：
```graphql
query {
  user_subscriptions(
    where: { 
      user_id: { _eq: "user-id" }
      is_active: { _eq: true }
    }
    order_by: { created_at: desc }
    limit: 1
  ) {
    id
    plan
    is_active
    created_at
  }
}
```

### 需要更新的文件

1. **`api/middleware/membership.js`**
   - `getUserMembership()` 函数中的查询
   - 从 `user_subscription` (单数) 改为 `user_subscriptions` (复数)
   - 获取最新的活跃订阅

2. **`src/js/fish-settings.js`**
   - `loadMembershipInfo()` 函数中的查询
   - 同样需要改为查询列表并获取最新记录

3. **`src/js/membership-icons.js`**
   - `getUserMembershipTier()` 函数
   - 查询用户订阅列表

## 查询用户当前订阅的最佳实践

```graphql
query GetUserCurrentSubscription($userId: String!) {
  user_subscriptions(
    where: { 
      user_id: { _eq: $userId }
      is_active: { _eq: true }
    }
    order_by: { created_at: desc }
    limit: 1
  ) {
    id
    plan
    is_active
    created_at
    member_type {
      id
      name
      max_fish_count
      can_self_talk
      can_group_chat
      can_promote_owner
    }
  }
}
```

## 支持的功能

迁移后支持：

1. ✅ 用户可以有多个订阅记录（历史记录）
2. ✅ 通过 `is_active` 字段标记当前活跃订阅
3. ✅ 通过 `created_at` 排序获取最新订阅
4. ✅ 保留订阅历史记录

## 注意事项

- `user_id` 不再是唯一约束，可以有重复值
- 查询用户订阅时，需要添加 `is_active = true` 过滤条件
- 建议总是按 `created_at DESC` 排序，获取最新订阅
- 如果用户有多条活跃订阅，需要业务逻辑决定使用哪一条

