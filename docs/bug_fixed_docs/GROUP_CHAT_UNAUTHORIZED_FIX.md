# 群聊功能未登录用户访问修复

## 问题描述

未登录用户访问 `tank.html` 时，群聊功能仍然被启用，导致：
1. 控制台报错：`❌ 获取用户失败: Auth session missing!`
2. API 调用失败：`POST /api/fish-api?action=group-chat 500 (Internal Server Error)`
3. 用户体验不佳：看到错误信息和失败的群聊尝试

## 根本原因

1. **初始化逻辑问题**：`initializeGroupChat()` 函数在页面加载时执行，但没有检查用户登录状态
2. **配置优先级问题**：群聊启用状态从 localStorage 或环境变量读取，不考虑用户是否登录
3. **错误处理不足**：`getCurrentUser()` 抛出的错误没有被正确捕获和处理
4. **API 调用缺少保护**：`generateChatSession()` 在用户未登录时仍然尝试调用 API

## 解决方案

### 1. 在 `tank.js` 中添加登录状态检查

**文件**：`src/js/tank.js`

**修改位置**：`initializeGroupChat()` 函数（第 2788-2836 行）

**修改内容**：
- 在函数开始时检查用户登录状态
- 尝试从多个来源获取用户 ID：
  - `getCurrentUserId()` 函数
  - `localStorage.getItem('userData')`
  - `localStorage.getItem('userId')`
- 如果用户未登录，强制禁用群聊功能（需要 AI API，有成本）
- 独白功能允许未登录访问（使用预存储内容，无 AI API 成本）
- 更新 UI 按钮状态
- 直接返回，不继续初始化

**关键代码**：
```javascript
// 检查用户登录状态
let isUserLoggedIn = false;
let currentUserId = null;

// Try getCurrentUserId function first
if (typeof getCurrentUserId === 'function') {
    try {
        currentUserId = await getCurrentUserId();
        isUserLoggedIn = !!currentUserId;
    } catch (error) {
        // User not logged in
        console.log('🔒 User not logged in, group chat will be disabled');
    }
}

// Fallback to localStorage
if (!currentUserId) {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const parsed = JSON.parse(userData);
            currentUserId = parsed.userId || parsed.uid || parsed.id;
            isUserLoggedIn = !!currentUserId;
        } catch (error) {
            // Ignore
        }
    }
    if (!currentUserId) {
        currentUserId = localStorage.getItem('userId');
        isUserLoggedIn = !!currentUserId;
    }
}

// 如果用户未登录，禁用群聊但允许独白（独白是公开展示功能）
if (!isUserLoggedIn) {
    console.log('🔒 User not logged in');
    console.log('❌ Group chat disabled (requires login)');
    console.log('✅ Monologue allowed (public feature)');
    
    // 禁用群聊
    communityChatManager.setGroupChatEnabled(false);
    updateGroupChatButton(false);
    updateFishTalkToggle(false);
    
    // 独白使用默认设置（允许启用）
    let monologueEnabled = false;
    const userMonologuePreference = localStorage.getItem('monologueEnabled');
    if (userMonologuePreference !== null) {
        monologueEnabled = userMonologuePreference === 'true';
        console.log(`Monologue: Using user preference: ${monologueEnabled ? 'ON' : 'OFF'}`);
    }
    communityChatManager.setMonologueEnabled(monologueEnabled);
    
    return; // 不继续初始化群聊相关配置
}
```

### 2. 优化错误处理

**文件**：`src/js/tank.js`

**修改位置**：`displayGroupChatUsage()` 函数（第 2731-2743 行）

**修改内容**：
- 捕获 `getCurrentUserId()` 抛出的错误
- 添加友好的日志信息，避免显示 "Auth session missing!" 错误

**关键代码**：
```javascript
try {
    currentUserId = await getCurrentUserId();
} catch (error) {
    // Ignore error silently (user not logged in)
    console.log('💬 User not logged in, skipping group chat usage display');
}
```

### 3. 在 `community-chat-manager.js` 中添加保护

**文件**：`src/js/community-chat-manager.js`

**修改位置 1**：`displayGroupChatUsage()` 方法（第 435-441 行）

**修改内容**：
- 同样优化错误处理，避免显示 "Auth session missing!" 错误

**修改位置 2**：`generateChatSession()` 方法（第 152-181 行）

**修改内容**：
- 在调用 API 前检查用户是否登录
- 如果用户未登录，直接使用 fallback 聊天内容，不调用 API

**关键代码**：
```javascript
// If user is not logged in, use fallback instead of calling API
if (!currentUserId) {
    console.log('❌ User not logged in, cannot generate AI group chat. Using fallback.');
    return this.generateFallbackSession();
}
```

## 修复效果

### 修复前
- ❌ 控制台显示错误：`Auth session missing!`
- ❌ API 调用失败：500 错误
- ❌ 群聊功能尝试启动但失败
- ❌ 用户看到错误信息

### 修复后
- ✅ 未登录用户访问时，群聊功能自动禁用
- ✅ 独白功能允许未登录用户使用（公开展示功能）
- ✅ 不会调用需要认证的群聊 API
- ✅ 控制台显示友好的日志信息
- ✅ 使用 fallback 聊天内容（如果群聊被触发）
- ✅ UI 按钮状态正确更新

**设计理由**：
- 群聊需要调用 Coze AI API，有成本，必须限制访问
- 独白使用预存储的内容，无 AI API 成本，可以作为公开展示功能吸引用户

## 测试建议

1. **未登录用户测试**：
   - 清除所有 cookies 和 localStorage
   - 访问 `tank.html`
   - 验证群聊按钮是否被禁用
   - 验证控制台没有错误信息

2. **已登录用户测试**：
   - 正常登录
   - 访问 `tank.html`
   - 验证群聊功能正常工作
   - 验证使用情况正确显示

3. **登录状态切换测试**：
   - 从登录状态切换到未登录状态
   - 刷新页面
   - 验证群聊功能被正确禁用

## 相关文件

- `src/js/tank.js` - 主要修复文件
- `src/js/community-chat-manager.js` - 辅助修复文件
- `lib/api_handlers/fish/chat/group.js` - API 处理器（未修改）

## 注意事项

1. 此修复兼容所有认证方式（OAuth、邮箱登录等）
2. 不影响已登录用户的正常使用
3. 保持了原有的 fallback 机制
4. 所有错误处理都是静默的，不会影响用户体验

## 相关记忆

此修复与以下记忆相关：
- Discord OAuth 登录修复
- 用户认证流程优化
