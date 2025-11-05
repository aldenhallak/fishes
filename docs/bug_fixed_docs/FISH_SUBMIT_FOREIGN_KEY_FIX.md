# 鱼提交外键约束错误修复

## 问题描述

在测试鱼管理页面（`test-fish-management.html`）提交新鱼时，出现以下错误：

```json
{
  "success": false,
  "error": "服务器错误",
  "details": "Foreign key violation. insert or update on table \"user_economy\" violates foreign key constraint \"fk_economy_user\""
}
```

## 错误原因

### 数据库结构

数据库有以下表结构和关系：
- `users` 表：存储用户信息，主键 `id: String!`
- `user_economy` 表：存储用户经济数据，`user_id` 字段通过外键约束 `fk_economy_user` 引用 `users.id`

### 问题分析

1. 测试页面使用随机生成的 `userId`：`test-user-` + Date.now()
2. API 尝试创建 `user_economy` 记录时，该 `userId` 在 `users` 表中不存在
3. 由于外键约束，插入操作失败

## 解决方案

修改 `api/fish/submit.js`，在创建 `user_economy` 记录之前，先确保用户记录存在：

### 修改步骤

#### 1. 添加用户检查逻辑

```javascript
// 1. 确保用户记录存在（如果不存在则创建）
const checkUserQuery = `
  query CheckUser($userId: String!) {
    users_by_pk(id: $userId) {
      id
      email
    }
  }
`;

let userData = await queryHasura(checkUserQuery, { userId });

// 如果用户不存在，创建用户记录
if (!userData.users_by_pk) {
  console.log('用户不存在，创建新用户记录:', userId);
  const createUserQuery = `
    mutation CreateUser($userId: String!) {
      insert_users_one(
        object: { 
          id: $userId, 
          email: "${userId}@test.local",
          display_name: "测试用户",
          is_banned: false
        }
      ) {
        id
        email
      }
    }
  `;
  
  userData = await queryHasura(createUserQuery, { userId });
}
```

#### 2. 更新处理流程

修改后的完整流程：
1. **确保用户记录存在**（如果不存在则自动创建）✅ 新增
2. 获取或创建用户经济数据
3. 检查鱼食余额（需要2个鱼食）
4. 生成随机天赋值（25-75）
5. 创建鱼记录
6. 扣除鱼食
7. 记录经济日志

## 测试验证

### 测试步骤
1. 访问 http://localhost:3000/test-fish-management.html
2. 在"图片URL"字段输入：`https://cdn.fishart.online/test/fish-test.png`
3. 点击"提交鱼"按钮

### 测试结果

✅ 成功创建鱼记录：

```json
{
  "success": true,
  "message": "创建成功！",
  "fish": {
    "id": "cf269df9-d4b3-4fd8-a6c7-7e8cecc5f147",
    "imageUrl": "https://cdn.fishart.online/test/fish-test.png",
    "artist": "Anonymous",
    "talent": 61,
    "level": 1,
    "health": 10,
    "maxHealth": 10,
    "createdAt": "2025-11-04T02:55:46.586546"
  },
  "economy": {
    "fishFood": 8,
    "spent": 2
  },
  "talentRating": {
    "grade": "A",
    "color": "#9370DB",
    "text": "卓越"
  }
}
```

## 修复效果

### 修复前
- ❌ 提交鱼失败，外键约束错误
- ❌ 无法使用测试用户ID

### 修复后
- ✅ 自动创建用户记录（如果不存在）
- ✅ 自动创建经济记录（如果不存在）
- ✅ 成功提交鱼并扣除鱼食
- ✅ 支持测试环境使用任意 userId

## 相关文件

- `fish_art/api/fish/submit.js` - 主要修改文件
  - 添加用户存在性检查
  - 自动创建不存在的用户记录
  - 更新流程注释

## 技术要点

1. **外键约束**：`user_economy.user_id` 必须引用已存在的 `users.id`
2. **自动创建**：测试环境下自动创建用户记录，提升开发体验
3. **数据完整性**：保留外键约束，确保数据库引用完整性
4. **测试友好**：支持使用任意 userId 进行测试，无需预先创建用户

## 修复日期

2025-11-04

## 影响范围

- 鱼提交API（`/api/fish/submit`）
- 测试页面（`test-fish-management.html`）
- 所有使用该API的功能

## 注意事项

- 生产环境中，应使用真实的 Supabase 用户ID
- 测试用户的邮箱格式为：`{userId}@test.local`
- 新用户初始鱼食余额为 10
- 创建一条鱼消耗 2 个鱼食












