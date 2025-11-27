# GraphQL 查询错误修复

## 问题描述

编辑和删除鱼时出现错误：
```
message: 'unexpected variables in variableValues: userId',
extensions: { path: '$', code: 'validation-failed' }
```

## 根本原因

在 `fish_by_pk` 查询中错误地传入了 `userId` 变量。根据 GraphQL schema，`fish_by_pk` 只接受 `id` 参数：

```graphql
fish_by_pk(id: uuid!): fish
```

## 修复内容

### 1. 修复 update-info.js

**之前的错误代码**：
```javascript
const ownershipQuery = `
    query CheckFishOwnership($fishId: uuid!, $userId: String!) {
        fish_by_pk(id: $fishId) {
            id
            user_id
        }
    }
`;

const ownershipResult = await executeGraphQL(ownershipQuery, { fishId, userId });
```

**修复后的代码**：
```javascript
const ownershipQuery = `
    query CheckFishOwnership($fishId: uuid!) {
        fish_by_pk(id: $fishId) {
            id
            user_id
        }
    }
`;

const ownershipResult = await executeGraphQL(ownershipQuery, { fishId });
```

### 2. 修复 delete.js

**之前的错误代码**：
```javascript
const ownershipQuery = `
    query CheckFishOwnership($fishId: uuid!, $userId: String!) {
        fish_by_pk(id: $fishId) {
            id
            user_id
            fish_name
            is_alive
        }
    }
`;

const ownershipResult = await executeGraphQL(ownershipQuery, { fishId, userId });
```

**修复后的代码**：
```javascript
const ownershipQuery = `
    query CheckFishOwnership($fishId: uuid!) {
        fish_by_pk(id: $fishId) {
            id
            user_id
            fish_name
            is_alive
        }
    }
`;

const ownershipResult = await executeGraphQL(ownershipQuery, { fishId });
```

## 关键点

1. **GraphQL 查询定义中移除 `$userId`**：不再在查询变量中声明 `userId`
2. **executeGraphQL 调用中移除 `userId`**：只传入 `{ fishId }`
3. **权限验证仍然有效**：查询返回 `user_id` 字段后，在代码中比对 `fish.user_id === userId`

## 验证流程

权限验证的流程：
1. 通过 `fishId` 查询鱼信息（包含 `user_id` 字段）
2. 在代码中比较 `fish.user_id` 与请求中的 `userId`
3. 如果不匹配，返回 403 错误

```javascript
if (fish.user_id !== userId) {
    return res.status(403).json({
        success: false,
        error: 'You do not have permission to edit/delete this fish'
    });
}
```

## 测试步骤

### 1. 测试编辑功能

访问 http://localhost:3000/rank.html，找到你的鱼：

1. 点击 **✏️ 编辑** 按钮
2. 修改鱼的名称或个性
3. 点击 **Save Changes**
4. 应该成功保存并刷新页面

### 2. 测试删除功能

1. 点击 **🗑️ 删除** 按钮
2. 确认删除
3. 应该成功删除，鱼从页面消失

### 3. 检查服务器日志

应该看到类似的日志（无错误）：
```
[Fish Update Info] Received request: {...}
[Fish Update Info] Fish updated successfully
```

或

```
[Fish Delete] Received request: {...}
[Fish Delete] Fish deleted successfully
```

## 已修复的文件

1. ✅ `lib/api_handlers/fish/update-info.js` - 第60-71行
2. ✅ `lib/api_handlers/fish/delete.js` - 第38-51行

## 服务器状态

✅ 服务器已重启
✅ 运行在端口 3000
✅ PID: 21904

## 下一步

现在可以测试完整的编辑和删除流程了！

1. 刷新浏览器页面 (Ctrl+Shift+R)
2. 找到你自己的鱼
3. 测试编辑功能
4. 测试删除功能

所有功能现在应该正常工作！🎉

