# 用户登录状态频繁检查问题修复

## 问题描述

在鱼缸页面（`tank.html`），控制台频繁出现 `❌ 获取用户失败: Auth session missing!` 错误。分析发现 `isUserFish()` 函数在每帧动画中都被调用，而该函数每次都会调用 `getCurrentUser()` 检查用户认证状态。

### 问题根源

```
drawWigglingFish (每帧调用)
  ↓
isUserFish (每帧调用)
  ↓
getCurrentUserId (每帧调用)
  ↓
getCurrentUser (每帧调用)
  ↓
Supabase.getUser() (每帧调用，触发 Auth session missing!)
```

## 解决方案

### 1. 引入用户ID缓存机制

在 `fish-utils.js` 中添加全局缓存变量：

```javascript
// 缓存用户ID，避免每帧动画都检查认证状态
let cachedUserId = null;
let userIdChecked = false;
```

### 2. 创建初始化函数

新增 `initializeUserCache()` 函数，在页面加载时调用一次：

```javascript
async function initializeUserCache() {
    if (userIdChecked) return cachedUserId;
    
    userIdChecked = true;
    try {
        const user = await getCurrentUser();
        cachedUserId = user ? user.id : null;
        if (cachedUserId) {
            console.log('✅ 用户已登录，ID已缓存');
        }
    } catch (error) {
        console.log('ℹ️ 用户未登录');
        cachedUserId = null;
    }
    return cachedUserId;
}
```

### 3. 修改 `getCurrentUserId()` 使用缓存

```javascript
async function getCurrentUserId() {
    // 如果已检查过，直接返回缓存值
    if (userIdChecked) {
        return cachedUserId;
    }
    
    // 否则初始化缓存
    return await initializeUserCache();
}
```

### 4. 将 `isUserFish()` 改为同步函数

```javascript
function isUserFish(fish) {
    // 如果尚未检查用户ID，返回false（页面加载时会初始化）
    if (!userIdChecked) {
        return false;
    }
    
    if (!cachedUserId || !fish.userId) {
        return false;
    }
    return cachedUserId === fish.userId;
}
```

### 5. 整合 `updateAuthenticationUI()`

修改 `updateAuthenticationUI()` 函数，让它也使用缓存机制：

```javascript
async function updateAuthenticationUI() {
    // 如果用户缓存未初始化，先初始化
    if (!userIdChecked) {
        await initializeUserCache();
    }
    
    // 使用缓存的用户信息
    const isLoggedIn = cachedUserId !== null;
    let currentUser = null;
    
    // 只有在需要用户详细信息时才调用getCurrentUser
    if (isLoggedIn) {
        try {
            currentUser = await getCurrentUser();
        } catch (error) {
            // 如果获取失败，清除缓存
            cachedUserId = null;
            userIdChecked = true;
        }
    }
    
    // ... 更新UI逻辑 ...
}
```

## 修复效果

### 修复前
- 控制台每帧都输出 `❌ 获取用户失败: Auth session missing!`
- 每秒约60次认证检查（60fps）
- 严重影响性能和用户体验

### 修复后
- 页面加载时只检查一次用户登录状态
- 控制台干净，无重复错误
- `isUserFish()` 改为同步函数，性能大幅提升

## 相关文件

- `fish_art/src/js/fish-utils.js` - 核心修复文件
  - 添加缓存变量 `cachedUserId` 和 `userIdChecked`
  - 新增 `initializeUserCache()` 函数
  - 修改 `getCurrentUserId()` 使用缓存
  - 将 `isUserFish()` 改为同步函数
  - 修改 `updateAuthenticationUI()` 使用缓存

## 技术要点

1. **缓存机制**：页面加载时检查一次，后续使用缓存值
2. **同步优化**：将频繁调用的函数从异步改为同步
3. **延迟初始化**：首次访问时才初始化，避免阻塞页面加载
4. **容错处理**：如果缓存未初始化，返回安全的默认值（false/null）

## 测试验证

1. 打开浏览器开发者工具
2. 访问 http://localhost:3000/tank.html?capacity=30
3. 观察控制台输出：
   - ✅ 只有一次用户状态检查
   - ✅ 没有重复的 "Auth session missing!" 错误
   - ✅ 鱼缸正常显示和动画
   - ✅ 从Hasura成功加载鱼数据

## 修复日期

2025-11-04

## 影响范围

- 鱼缸页面（`tank.html`）
- 所有使用 `isUserFish()` 的页面
- 所有调用 `getCurrentUserId()` 的代码

## 注意事项

- 用户登录/登出后需要刷新页面才能更新缓存
- 如果需要实时监听登录状态变化，应在 `onAuthStateChange` 回调中更新缓存












