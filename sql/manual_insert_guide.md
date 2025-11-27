# 在 Hasura Console 中手动添加/更新用户订阅

## 问题说明

`user_subscriptions` 表的主键是 `user_id`，这意味着：
- **每个用户只能有一条订阅记录**
- 如果用户已有记录，不能使用 INSERT，必须使用 UPDATE

## 解决方案

### 方法1：在 Hasura Console 的 Data 标签页中

1. 打开 Hasura Console → **Data** → `user_subscriptions` 表
2. 点击 **Browse Rows** 标签
3. 搜索用户ID：`f4933d0f-35a0-4aa1-8de5-ba407714b65c`
4. 如果找到记录：
   - 点击记录右侧的 **Edit** 按钮
   - 修改 `plan` 字段为 `plus`
   - 确保 `is_active` 为 `true`
   - 点击 **Save**
5. 如果没找到记录：
   - 点击 **Insert Row** 按钮
   - 填写：
     - `user_id`: `f4933d0f-35a0-4aa1-8de5-ba407714b65c`
     - `plan`: `plus`
     - `is_active`: `true`
   - 点击 **Save**

### 方法2：使用 SQL（推荐）

在 Hasura Console 的 **SQL** 标签页中执行：

```sql
-- 更新现有记录（如果存在）
UPDATE user_subscriptions 
SET plan = 'plus', is_active = true, updated_at = NOW()
WHERE user_id = 'f4933d0f-35a0-4aa1-8de5-ba407714b65c';

-- 如果用户没有记录，插入新记录
INSERT INTO user_subscriptions (user_id, plan, is_active)
SELECT 'f4933d0f-35a0-4aa1-8de5-ba407714b65c', 'plus', true
WHERE NOT EXISTS (
  SELECT 1 FROM user_subscriptions 
  WHERE user_id = 'f4933d0f-35a0-4aa1-8de5-ba407714b65c'
);
```

### 方法3：使用 GraphQL Mutation

在 Hasura Console 的 **API** 标签页中执行：

```graphql
mutation {
  insert_user_subscriptions_one(
    object: {
      user_id: "f4933d0f-35a0-4aa1-8de5-ba407714b65c"
      plan: "plus"
      is_active: true
    }
    on_conflict: {
      constraint: user_subscriptions_pkey
      update_columns: [plan, is_active]
    }
  ) {
    user_id
    plan
    is_active
  }
}
```

## 注意事项

- `user_id` 是主键，不能重复
- 如果用户已有记录，必须使用 UPDATE 或 upsert（on_conflict）
- `plan` 值必须是：`'free'`, `'plus'`, 或 `'premium'`（必须存在于 `member_types.id` 中）

