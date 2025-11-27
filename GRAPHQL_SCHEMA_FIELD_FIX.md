# GraphQL Schema 字段修复

## 问题描述

编辑和删除鱼时出现 GraphQL 验证错误：

### 编辑错误
```
field 'updated_at' not found in type: 'fish'
```

### 删除错误
```
field 'is_alive' not found in type: 'fish'
```

## 根本原因

API 代码中使用了不存在的字段。根据 `graphql/schema.graphql`，`fish` 类型的实际字段为：

```graphql
type fish {
  artist: String
  chat_frequency: Int
  created_at: timestamp
  fish_name: String
  id: uuid!
  image_url: String!
  is_approved: Boolean
  personality: String
  report_count: Int
  reported: Boolean
  upvotes: Int!
  user_id: String!
  # ... 关系字段
}
```

**不存在的字段**：
- ❌ `is_alive` 
- ❌ `updated_at`

**可用字段**：
- ✅ `is_approved` - 可用于软删除
- ✅ `created_at` - 创建时间（没有更新时间字段）

## 修复内容

### 1. 修复 update-info.js

**移除 `updated_at` 字段**：

**之前**：
```javascript
mutation UpdateFish($fishId: uuid!, $fishName: String!, $personality: String!) {
    update_fish_by_pk(
        pk_columns: { id: $fishId },
        _set: {
            fish_name: $fishName,
            personality: $personality
        }
    ) {
        id
        fish_name
        personality
        updated_at  // ❌ 不存在
    }
}
```

**修复后**：
```javascript
mutation UpdateFish($fishId: uuid!, $fishName: String!, $personality: String!) {
    update_fish_by_pk(
        pk_columns: { id: $fishId },
        _set: {
            fish_name: $fishName,
            personality: $personality
        }
    ) {
        id
        fish_name
        personality  // ✅ 移除了 updated_at
    }
}
```

### 2. 修复 delete.js

**改用 `is_approved` 字段进行软删除**：

**之前**：
```javascript
// 查询
query CheckFishOwnership($fishId: uuid!) {
    fish_by_pk(id: $fishId) {
        id
        user_id
        fish_name
        is_alive  // ❌ 不存在
    }
}

// 删除
mutation DeleteFish($fishId: uuid!) {
    update_fish_by_pk(
        pk_columns: { id: $fishId },
        _set: {
            is_alive: false  // ❌ 不存在
        }
    ) {
        id
        fish_name
        is_alive  // ❌ 不存在
        updated_at  // ❌ 不存在
    }
}
```

**修复后**：
```javascript
// 查询
query CheckFishOwnership($fishId: uuid!) {
    fish_by_pk(id: $fishId) {
        id
        user_id
        fish_name
        is_approved  // ✅ 使用 is_approved
    }
}

// 删除（软删除）
mutation DeleteFish($fishId: uuid!) {
    update_fish_by_pk(
        pk_columns: { id: $fishId },
        _set: {
            is_approved: false  // ✅ 设置为 false 实现软删除
        }
    ) {
        id
        fish_name
        is_approved  // ✅ 返回 is_approved
    }
}
```

## 软删除策略

由于没有 `is_alive` 字段，使用 `is_approved = false` 实现软删除：

### 优点
1. ✅ 数据保留在数据库中
2. ✅ 可以通过管理员审核恢复
3. ✅ 符合现有的审核系统架构

### 工作原理
1. 用户删除鱼时，设置 `is_approved = false`
2. 鱼列表查询通常会过滤 `is_approved = false` 的记录
3. 鱼从用户视图中消失，但数据仍存在
4. 管理员可以查看和恢复被删除的鱼

## 修改的文件

1. ✅ `lib/api_handlers/fish/update-info.js` - 移除 `updated_at` 字段
2. ✅ `lib/api_handlers/fish/delete.js` - 改用 `is_approved` 实现软删除

## 服务器状态

✅ 服务器已重启  
✅ 运行端口: 3000  
✅ 新进程 PID: 9676 和 17828

## 测试步骤

### 1. 测试编辑功能

1. 刷新浏览器 (Ctrl+Shift+R)
2. 找到你的鱼，点击 ✏️ 编辑
3. 修改名称或个性
4. 点击 "Save Changes"
5. **预期结果**：成功保存，无 GraphQL 错误

### 2. 测试删除功能

1. 找到你的鱼，点击 🗑️ 删除
2. 确认删除
3. **预期结果**：
   - 鱼从页面消失
   - 数据库中 `is_approved = false`
   - 无 GraphQL 错误

### 3. 检查服务器日志

应该看到成功的日志：
```
[Fish Update Info] Received request: {...}
[Fish Update Info] Fish updated successfully: {...}
```

或

```
[Fish Delete] Received request: {...}
[Fish Delete] Fish deleted successfully: {...}
```

## 数据库验证

删除后检查数据库：

```sql
-- 查看被"删除"的鱼（is_approved = false）
SELECT id, fish_name, user_id, is_approved, created_at
FROM fish
WHERE id = 'YOUR_FISH_ID';

-- 应该看到 is_approved = false
```

## 恢复被删除的鱼

如果需要恢复，可以运行：

```sql
UPDATE fish
SET is_approved = true
WHERE id = 'YOUR_FISH_ID' AND user_id = 'YOUR_USER_ID';
```

或通过管理员界面审核恢复。

## 总结

所有 GraphQL schema 不匹配的问题已修复：

✅ 移除不存在的 `updated_at` 字段  
✅ 移除不存在的 `is_alive` 字段  
✅ 使用 `is_approved` 实现软删除  
✅ 所有查询和 mutation 与 schema 匹配  

功能现在应该完全正常工作！🎉

