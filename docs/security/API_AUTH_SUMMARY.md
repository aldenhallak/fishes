# API 鉴权实施总结

## 📋 概述

本文档总结了 Fish Art 项目中 API 鉴权的实施情况和策略。

## 🎯 核心策略

### 群聊 API - 必须登录
- **端点**: `/api/fish-api?action=group-chat`
- **要求**: 必须提供有效的用户 ID
- **原因**: 调用 Coze AI API，有成本，需要限制访问
- **实施**: ✅ 已完成

### 独白 API - 公开访问
- **端点**: `/api/fish-api?action=monologue`
- **要求**: 无需登录
- **原因**: 使用预存储内容，无 AI API 成本，作为公开展示功能
- **实施**: ✅ 已完成

## 🔐 鉴权实施详情

### 1. 后端 API 保护

#### 群聊 API (`lib/api_handlers/fish/chat/group.js`)
```javascript
// 使用 extractUserId 中间件
const { extractUserId } = require('../../middleware/auth');

// 在 handler 中验证
const userIdInfo = await extractUserId(req);

if (!userIdInfo.userId) {
    return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required. Please log in to use group chat.',
        requiresAuth: true
    });
}
```

**支持的认证方式**：
1. Authorization header (Bearer token) - 最安全
2. Request body 中的 userId - 向后兼容
3. Query parameter 中的 userId - 向后兼容

#### 独白 API (`lib/api_handlers/fish/chat/monologue.js`)
```javascript
// 无需鉴权，公开访问
console.log('[Fish Monologue] Public access allowed (no authentication required)');
```

### 2. 前端访问控制

#### 未登录用户 (`src/js/tank.js`)
```javascript
if (!isUserLoggedIn) {
    console.log('🔒 User not logged in');
    console.log('❌ Group chat disabled (requires login)');
    console.log('✅ Monologue allowed (public feature)');
    
    // 禁用群聊
    communityChatManager.setGroupChatEnabled(false);
    updateGroupChatButton(false);
    updateFishTalkToggle(false);
    
    // 独白使用用户偏好设置
    let monologueEnabled = false;
    const userMonologuePreference = localStorage.getItem('monologueEnabled');
    if (userMonologuePreference !== null) {
        monologueEnabled = userMonologuePreference === 'true';
    }
    communityChatManager.setMonologueEnabled(monologueEnabled);
    
    return; // 不继续初始化群聊相关配置
}
```

#### 已登录用户
- 群聊功能正常启用（根据配置和用户偏好）
- 独白功能正常启用（根据配置和用户偏好）
- 显示使用情况统计

### 3. API 调用保护 (`src/js/community-chat-manager.js`)

```javascript
// 在 generateChatSession 中检查用户登录状态
if (!currentUserId) {
    console.log('❌ User not logged in, cannot generate AI group chat. Using fallback.');
    return this.generateFallbackSession();
}
```

## 📊 功能对比

| 功能 | 需要登录 | 消耗 AI API | 前端控制 | 后端验证 | 备注 |
|------|---------|------------|---------|---------|------|
| 群聊 | ✅ 是 | ✅ 是 (Coze) | ✅ 已实施 | ✅ 已实施 | 有成本，必须限制 |
| 独白 | ❌ 否 | ❌ 否 | ✅ 已实施 | ❌ 无需 | 预存储内容，公开展示 |
| 鱼列表 | ❌ 否 | ❌ 否 | - | ❌ 无需 | 公开数据 |
| 我的鱼缸 | ✅ 是 | ❌ 否 | ✅ 已实施 | ✅ 已实施 | 个人数据 |
| 收藏/取消收藏 | ✅ 是 | ❌ 否 | ✅ 已实施 | ✅ 已实施 | 个人操作 |

## 🛡️ 安全措施

### 已实施
1. ✅ 群聊 API 要求用户 ID
2. ✅ 前端禁用未登录用户的群聊功能
3. ✅ 错误处理优化，避免暴露敏感信息
4. ✅ 日志记录认证来源和状态
5. ✅ 每日使用限额检查（基于会员等级）

### 建议添加
1. ⏳ Rate Limiting（限流）- 防止 API 滥用
2. ⏳ IP 白名单 - 生产环境保护
3. ⏳ 请求签名 - 防止重放攻击
4. ⏳ 监控和告警 - 异常调用检测

## 🔄 用户体验流程

### 未登录用户访问 tank.html
1. 页面加载
2. 检测到未登录
3. 群聊按钮显示为禁用状态
4. 独白功能可以正常使用（如果用户启用）
5. 控制台显示友好提示：
   - 🔒 User not logged in
   - ❌ Group chat disabled (requires login)
   - ✅ Monologue allowed (public feature)

### 已登录用户访问 tank.html
1. 页面加载
2. 验证用户身份
3. 显示群聊使用情况
4. 根据配置和用户偏好启用功能
5. 群聊和独白功能正常工作

### 用户尝试使用群聊（未登录）
1. 前端阻止：按钮禁用，无法点击
2. 如果绕过前端：API 返回 401 错误
3. 前端显示：需要登录的提示
4. 使用 fallback 内容代替

## 📝 开发者注意事项

### 添加新的需要鉴权的 API
1. 导入鉴权中间件：
   ```javascript
   const { extractUserId, requireAuth } = require('../../middleware/auth');
   ```

2. 在 handler 中验证：
   ```javascript
   const userIdInfo = await extractUserId(req);
   if (!userIdInfo.userId) {
       return res.status(401).json({
           success: false,
           error: 'Unauthorized',
           message: 'Authentication required.'
       });
   }
   ```

3. 使用验证后的用户 ID：
   ```javascript
   const userId = userIdInfo.userId;
   // 继续处理...
   ```

### 前端调用需要鉴权的 API
```javascript
// 推荐方式：使用 Bearer token
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

const response = await fetch('/api/fish-api?action=group-chat', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        tankFishIds: [...]
    })
});

// 向后兼容方式：在 body 中传递 userId
const response = await fetch('/api/fish-api?action=group-chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        userId: currentUserId,
        tankFishIds: [...]
    })
});
```

## 🎯 未来改进

### 短期（1-2周）
- [ ] 为所有写操作 API 添加鉴权
- [ ] 实施基础 Rate Limiting
- [ ] 添加 API 调用监控

### 中期（1-2月）
- [ ] 升级到强制 Bearer token 鉴权
- [ ] 实施完整的 CORS 策略
- [ ] 添加请求签名验证

### 长期（3-6月）
- [ ] API 版本控制
- [ ] 完整的安全审计系统
- [ ] 自动化安全测试

## 📚 相关文档

- [API 鉴权安全审计报告](./API_AUTHENTICATION_AUDIT.md)
- [群聊未授权访问修复](../bug_fixed_docs/GROUP_CHAT_UNAUTHORIZED_FIX.md)
- [鉴权中间件源码](../../lib/api_handlers/middleware/auth.js)

---

**最后更新**: 2025-11-20  
**维护者**: 开发团队
