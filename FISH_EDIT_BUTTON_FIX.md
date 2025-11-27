# 鱼编辑/删除按钮不显示问题修复

## 问题描述
用户反馈在 rank.html 页面上，自己的鱼卡片只显示投票控制按钮（👍 0 ☆ 🚩），没有出现编辑（✏️）和删除（🗑️）按钮。

## 根本原因
1. `rank.js` 在加载鱼数据之前没有初始化用户ID缓存
2. `isUserFish()` 函数依赖 `cachedUserId` 和 `userIdChecked`，但这些值没有被初始化
3. 导致 `isUserFish()` 始终返回 `false`，无法识别用户自己的鱼

## 已实施的修复

### 1. 导出 `initializeUserCache` 函数
**文件**: `src/js/fish-utils.js`

添加了函数导出：
```javascript
window.initializeUserCache = initializeUserCache;
```

### 2. 在页面加载时初始化用户缓存
**文件**: `src/js/rank.js`

在 `DOMContentLoaded` 事件中添加：
```javascript
// Initialize user cache first (critical for identifying user's fish)
if (window.initializeUserCache) {
    await window.initializeUserCache();
    console.log('✅ User cache initialized for rank page');
}
```

### 3. 确保 userId 字段映射正确
**文件**: `src/js/rank.js`

在鱼数据映射中确保 `userId` 字段可用：
```javascript
const fish = {
    ...data,
    docId: doc.id,
    // Ensure userId is available (may be user_id in data)
    userId: data.userId || data.user_id || data.UserId
};
```

### 4. 添加调试日志
添加了调试日志以便排查问题：
- 鱼数据结构日志
- `isUserFish()` 检查结果日志

## 测试步骤

### 1. 刷新页面并检查控制台
打开浏览器开发者工具（F12），访问 `http://localhost:3000/rank.html`

应该看到以下日志：
```
✅ User cache initialized for rank page
✅ 用户已登录，ID已缓存
🐟 Sample fish data structure: {...}
```

### 2. 检查用户ID是否正确缓存
在浏览器控制台中运行：
```javascript
console.log('Current user ID:', window.getCurrentUserId ? await window.getCurrentUserId() : 'Not available');
```

### 3. 检查鱼的 userId 字段
在控制台中查看鱼数据：
```javascript
// 假设 allFishData 在 rank.js 中可用
console.log('First fish:', allFishData[0]);
console.log('Fish userId:', allFishData[0].userId);
```

### 4. 手动测试 isUserFish
```javascript
// 测试 isUserFish 函数
if (window.isUserFish && allFishData[0]) {
    console.log('Is user fish?', window.isUserFish(allFishData[0]));
}
```

### 5. 验证按钮显示
找到你自己的鱼卡片，检查是否显示：
- ✏️ 编辑按钮
- 🗑️ 删除按钮
- 没有 🚩 举报按钮

## 如果问题仍然存在

### 检查清单

#### 1. 确认已登录
```javascript
console.log('Logged in?', localStorage.getItem('userToken') ? 'Yes' : 'No');
```

#### 2. 确认用户ID缓存
```javascript
// 在 fish-utils.js 中设置了这些变量
// 你可以通过调试器检查它们
```

#### 3. 检查鱼数据结构
查看 Network 标签中 GraphQL 请求的响应，确认：
- 鱼数据包含 `user_id` 或 `userId` 字段
- 该字段值与当前用户ID匹配

#### 4. 检查 HTML 结构
在 Elements 标签中检查鱼卡片的 HTML：
```html
<!-- 应该看到类似这样的结构（对于你自己的鱼） -->
<div class="fish-card user-fish-highlight" data-fish-id="...">
    ...
    <div class="voting-controls">
        <button class="vote-btn upvote-btn">👍 0</button>
        <button class="edit-btn">✏️</button>
        <button class="delete-btn">🗑️</button>
    </div>
</div>

<!-- 对于其他用户的鱼 -->
<div class="fish-card" data-fish-id="...">
    ...
    <div class="voting-controls">
        <button class="vote-btn upvote-btn">👍 0</button>
        <button class="favorite-btn">☆</button>
        <button class="report-btn">🚩</button>
    </div>
</div>
```

### 强制重新初始化

如果问题仍然存在，在控制台中手动重新初始化：
```javascript
// 1. 清除缓存
localStorage.clear();
sessionStorage.clear();

// 2. 刷新页面
location.reload();

// 3. 检查是否需要重新登录
```

### API 数据结构检查

如果鱼数据中的 userId 字段名称不同，需要更新映射逻辑。

检查 `lib/api_handlers/fish/list.js` 返回的数据格式，确保包含用户ID字段。

典型的 Hasura 查询应该包含：
```graphql
query GetFish {
  fish {
    id
    user_id
    fish_name
    personality
    ...
  }
}
```

## 预期结果

修复后，你应该能够：
1. ✅ 看到自己鱼卡片上的编辑和删除按钮
2. ✅ 其他用户的鱼显示举报按钮
3. ✅ 点击编辑按钮打开编辑模态框
4. ✅ 点击删除按钮打开删除确认对话框

## 重启服务器

如果修改了服务器端代码，需要重启：
```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
node server.js
```

## 清除浏览器缓存

有时浏览器缓存会导致问题：
1. 打开开发者工具
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

或者使用快捷键：
- Chrome/Edge: `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac)
- Firefox: `Ctrl+F5` (Windows) 或 `Cmd+Shift+R` (Mac)

## 联系支持

如果以上步骤都无法解决问题，请提供以下信息：
1. 浏览器控制台的完整日志
2. Network 标签中 fish API 请求的响应
3. 用户ID和鱼ID（如果可以的话）
4. 浏览器和操作系统信息

