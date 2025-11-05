# Tank.js userId字段名称不匹配修复

## 问题描述

**时间**: 2025-11-04

**症状**:
- 用户有鱼（profile显示1条），但Battle按钮提示"你还没有画过鱼！"
- `window.fishes`数组存在且有数据
- 但所有鱼的`userId`都是`null`

**根本原因**: 字段名称不匹配
- Hasura数据库使用 `user_id` (snake_case)
- tank.js只检查 `userId` 和 `UserId`，遗漏了 `user_id`

## 问题定位过程

### 1. 检查window.fishes数组

```javascript
window.fishes.length  // 4 (有鱼)
window.fishes[0].userId  // null (问题！)
window.fishes[0].user_id  // undefined (没有这个字段)
```

### 2. 检查数据库返回的数据

**文件**: `src/js/fish-utils.js` (第371行)

GraphQL查询包含 `user_id`：
```graphql
query GetFish {
    fish {
        id
        user_id  # ← Hasura数据库字段名
        artist
        image_url
    }
}
```

### 3. 检查数据转换

**文件**: `src/js/fish-utils.js` (第413-421行)

```javascript
return result.data.fish.map(fish => ({
    id: fish.id,
    data: () => ({
        ...fish,  // ← 包含 user_id
        Artist: fish.artist,
        Image: fish.image_url
    })
}));
```

数据包含 `user_id`。

### 4. 检查鱼对象创建

**文件**: `src/js/tank.js` (第416行)

```javascript
userId: fishData.userId || fishData.UserId || null
//                                            ^^^^ 问题：user_id被忽略，设为null
```

## 根本原因

### 数据库Schema vs 前端代码

**数据库（Hasura PostgreSQL）**:
- 使用 snake_case: `user_id`, `image_url`, `created_at`
- 这是SQL数据库的标准命名约定

**前端JavaScript**:
- 习惯用 camelCase: `userId`, `imageUrl`, `createdAt`
- 或 PascalCase: `UserId`, `ImageUrl`（兼容旧的Firestore格式）

### 不完整的兼容性处理

**其他字段的处理（正确）**:
```javascript
artist: fishData.artist || fishData.Artist || 'Anonymous',  // ✅ 同时检查两种
createdAt: fishData.createdAt || fishData.CreatedAt || null,  // ✅ 同时检查两种
```

**userId字段的处理（错误）**:
```javascript
userId: fishData.userId || fishData.UserId || null  // ❌ 漏了user_id
```

## 解决方案

### 修复代码

**文件**: `src/js/tank.js`  
**行数**: 416

```javascript
// 修复前
userId: fishData.userId || fishData.UserId || null

// 修复后
userId: fishData.userId || fishData.UserId || fishData.user_id || null
```

### 版本号更新

**文件**: `tank.html`  
**行数**: 601

```html
<!-- 修复前 -->
<script src="src/js/tank.js?v=2.3"></script>

<!-- 修复后 -->
<script src="src/js/tank.js?v=2.4"></script>
```

## 测试验证

### 浏览器控制台测试

```javascript
// 刷新页面后
console.log(window.fishes[0].userId);  
// 预期: "11312701-f1d2-43f8-a13d-260eac812b7a" (用户实际ID)
// 之前: null

// 查找用户的鱼
const user = await window.supabaseAuth.getUser();
const userFish = window.fishes.filter(f => f.userId === user.id);
console.log(userFish.length);  
// 预期: 1 或更多
// 之前: 0
```

### Battle按钮测试

1. 按 `Ctrl+Shift+R` 刷新页面
2. 等待鱼加载（显示 "X swimming"）
3. 点击 "⚔️ Battle" 按钮

**预期结果**:
- ✅ 找到用户的鱼
- ✅ 提示进入战斗模式或显示战斗选项
- ❌ 不再显示"你还没有画过鱼"

## 相关修复链

这是Battle功能的第5个修复：

1. **FISH_UPLOAD_FORMIDABLE_FIX.md** - 上传卡住
2. **FISH_SUBMIT_DOWNVOTES_FIX.md** - 提交失败
3. **SUPABASE_GETUSER_FIX.md** - getUser方法
4. **TANK_FISHES_EXPORT_FIX.md** - fishes数组导出
5. **TANK_USER_ID_FIELD_FIX.md** ← 本次 - userId字段名

## 技术要点

### 命名约定差异

**SQL/PostgreSQL (snake_case)**:
```sql
CREATE TABLE fish (
    user_id UUID,
    image_url TEXT,
    created_at TIMESTAMP
);
```

**JavaScript (camelCase)**:
```javascript
const fish = {
    userId: '...',
    imageUrl: '...',
    createdAt: new Date()
};
```

### 多格式兼容模式

当需要支持多种数据源时：

```javascript
// ✅ 推荐：列出所有可能的变体
userId: data.userId || data.UserId || data.user_id || null

// ❌ 不推荐：只检查一种
userId: data.user_id

// 💡 更好：使用getter统一处理
Object.defineProperty(fishObj, 'userId', {
    get() {
        return this.user_id || this.UserId || this.userId || null;
    }
});
```

### 为什么不统一转换？

**选项1: 在API层统一转换**
```javascript
// fish-utils.js
return result.data.fish.map(fish => ({
    id: fish.id,
    data: () => ({
        ...fish,
        userId: fish.user_id,  // ← 转换
        imageUrl: fish.image_url,
        createdAt: fish.created_at
    })
}));
```

**选项2: 在使用层兼容多种格式** (当前采用)
```javascript
// tank.js
userId: fishData.userId || fishData.user_id
```

我们选择选项2因为：
- ✅ 兼容多种后端（Hasura + 原作者后端）
- ✅ 不破坏现有代码
- ✅ 灵活性更高

## 类似问题检查

### 其他可能受影响的字段

建议检查以下字段是否也有同样问题：

```javascript
// tank.js中的其他字段
artist: fishData.artist || fishData.Artist  // ✅ OK
createdAt: fishData.createdAt || fishData.CreatedAt  // ✅ OK
upvotes: fishData.upvotes  // ⚠️ 可能需要检查Upvotes?

// 其他文件中的userId引用
// 全局搜索: fishData.userId || fishData.UserId
// 确保都添加了 || fishData.user_id
```

### 推荐的全局检查

```bash
# 搜索所有userId字段访问
grep -r "fishData\.userId" src/
grep -r "fish\.userId" src/
grep -r "\.userId" src/ | grep -v "user_id"
```

## 修改文件列表

1. **src/js/tank.js** (第416行)
   - 添加 `fishData.user_id` 到userId字段检查

2. **tank.html** (第601行)
   - 更新版本号到 `v=2.4`

## 修复日期

2025-11-04

## 修复者

AI Assistant (Claude Sonnet 4.5)

## 用户操作指南

**请您按 `Ctrl+Shift+R` 强制刷新页面**，然后：

1. 等待鱼加载完成
2. 点击Battle按钮
3. 应该能看到您的鱼并进入战斗模式

**验证修复**:
```javascript
// F12打开控制台
console.log(window.fishes.find(f => f.artist === 'lovetey'));
// 应该能看到您的鱼，且userId不是null
```

## 经验总结

1. **字段名称要一致**: 或提供完整的兼容性检查
2. **测试多种数据源**: Hasura vs Firestore vs 原作者API
3. **使用TypeScript**: 编译时就能发现这类问题
4. **代码审查**: 类似的字段应该有类似的处理方式

## 相关文档

- `TANK_FISHES_EXPORT_FIX.md` - fishes导出修复
- `DATABASE_DESIGN.md` - 数据库字段定义
- `UPLOAD_SUBMIT_COMPLETE_FIX_SUMMARY.md` - 完整修复总结

