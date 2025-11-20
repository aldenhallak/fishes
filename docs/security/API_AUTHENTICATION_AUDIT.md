# API 鉴权安全审计报告

## 审计日期
2025-11-20

## 问题概述

在审计过程中发现，多个关键 API 端点**缺少鉴权保护**，任何人都可以未经授权调用这些 API，存在严重的安全风险。

## 🚨 高危漏洞

### 1. 群聊 API (group-chat)
**端点**: `/api/fish-api?action=group-chat`  
**问题**: 
- ❌ 无需登录即可调用
- ❌ 可以伪造 userId 参数
- ❌ 消耗 Coze API 配额
- ❌ 可能被恶意刷接口

**影响**:
- 未授权用户可以无限生成群聊内容
- 可能导致 API 费用暴增
- 可能被用于 DDoS 攻击

### 2. 独白 API (monologue)
**端点**: `/api/fish-api?action=monologue`  
**状态**: ✅ 允许公开访问（设计决策）
**说明**: 
- 独白功能作为公开展示功能，允许未登录用户访问
- 使用预存储的内容，不消耗 AI API
- 通过数据库查询实现，性能开销较小
- 可以通过 Rate Limiting 防止滥用

### 3. 其他未鉴权的 API

#### 已发现的问题端点：
- `/api/fish-api?action=submit` - 提交新鱼（部分保护）
- `/api/fish-api?action=create` - 创建鱼（部分保护）
- `/api/fish-api?action=update-info` - 更新鱼信息（无保护）
- `/api/fish-api?action=update-chat-settings` - 更新聊天设置（无保护）
- `/api/fish-api?action=list` - 获取鱼列表（公开，合理）
- `/api/fish-api?action=get-battle-fish` - 获取战斗鱼（公开，合理）
- `/api/fish-api?action=community-chat` - 社区聊天（需检查）

#### 已有鉴权保护的端点：
- ✅ `/api/fish-api?action=favorite` - 收藏鱼（有 Bearer token 验证）
- ✅ `/api/fish-api?action=unfavorite` - 取消收藏（有 Bearer token 验证）
- ✅ `/api/fish-api?action=my-tank` - 我的鱼缸（有 Bearer token 验证）
- ✅ `/api/profile/[userId]` - 用户资料（有完整鉴权）

## 🛡️ 已实施的修复

### 1. 创建鉴权中间件

**文件**: `lib/api_handlers/middleware/auth.js`

**功能**:
- `verifyAuth(req)` - 验证 Authorization header
- `requireAuth(req, res)` - 要求必须登录
- `requireUserIdMatch(req, res, userId)` - 验证用户 ID 匹配
- `extractUserId(req)` - 从多个来源提取用户 ID（优先级：token > body > query）
- `getUserFromToken(token)` - 从 Supabase token 获取用户信息

**安全特性**:
- 支持 Bearer token 验证
- 区分认证来源（token/body/query）
- 记录安全警告
- 统一错误处理

### 2. 更新群聊 API

**文件**: `lib/api_handlers/fish/chat/group.js`

**修改内容**:
```javascript
// 导入鉴权中间件
const { extractUserId } = require('../../middleware/auth');

// 在 handler 中添加鉴权检查
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

**效果**:
- ✅ 必须提供用户 ID（通过 token 或 body）
- ✅ 记录认证来源和状态
- ✅ 对非安全来源发出警告
- ✅ 返回明确的错误信息

### 3. 独白 API 保持公开访问

**文件**: `lib/api_handlers/fish/chat/monologue.js`

**设计决策**: 
- 独白功能作为公开展示功能，**不需要鉴权**
- 使用预存储的 `fish_monologues` 表内容，不调用 AI API
- 性能开销小，适合作为公开功能
- 可以吸引未注册用户了解产品

**保护措施**:
- 建议添加 Rate Limiting（基于 IP）
- 监控异常调用频率
- 数据库查询已优化

## 🔍 当前鉴权策略

### 三层鉴权策略

#### 1. 强制鉴权（最安全）
- 要求 Authorization header 中的 Bearer token
- 适用于：个人资料、收藏、我的鱼缸等个人数据操作

#### 2. 灵活鉴权（群聊 API）
- 优先使用 Bearer token
- 允许从 request body 或 query 获取 userId（记录警告）
- 必须提供有效的用户 ID
- 适用于：**群聊 API**（消耗 AI API 配额）

#### 3. 公开访问
- 无需鉴权
- 适用于：
  - **独白 API**（使用预存储内容，不消耗 AI API）
  - 鱼列表、战斗鱼等公开数据
  - 其他展示性功能

### 为什么采用灵活鉴权？

**优点**:
1. 向后兼容 - 不破坏现有前端代码
2. 渐进式迁移 - 可以逐步要求使用 token
3. 开发友好 - 便于测试和调试

**缺点**:
1. 安全性较弱 - 可以伪造 userId
2. 需要额外的限流保护
3. 需要监控异常调用

## 📋 待办事项

### 高优先级

- [ ] **为所有写操作 API 添加鉴权**
  - [ ] `update-info` - 更新鱼信息
  - [ ] `update-chat-settings` - 更新聊天设置
  - [ ] `submit` - 提交新鱼（增强现有保护）
  - [ ] `create` - 创建鱼（增强现有保护）

- [ ] **实施 Rate Limiting（限流）**
  - [ ] 基于 IP 的限流
  - [ ] 基于用户的限流
  - [ ] 基于 API 端点的限流

- [ ] **添加 API 日志和监控**
  - [ ] 记录所有 API 调用
  - [ ] 监控异常调用模式
  - [ ] 设置告警阈值

### 中优先级

- [ ] **升级到强制 Bearer token 鉴权**
  - [ ] 更新前端代码，所有请求携带 token
  - [ ] 移除 body/query 中的 userId 支持
  - [ ] 更新文档

- [ ] **实施 CORS 策略**
  - [ ] 限制允许的域名
  - [ ] 配置 CORS 白名单
  - [ ] 移除 `Access-Control-Allow-Origin: *`

- [ ] **添加请求签名验证**
  - [ ] 实施 HMAC 签名
  - [ ] 防止重放攻击
  - [ ] 添加时间戳验证

### 低优先级

- [ ] **API 版本控制**
  - [ ] 实施 v1/v2 版本
  - [ ] 逐步废弃旧版本

- [ ] **安全审计日志**
  - [ ] 记录所有鉴权失败
  - [ ] 记录可疑活动
  - [ ] 定期审查日志

## 🔐 最佳实践建议

### 1. 前端集成

**推荐做法**:
```javascript
// 获取 Supabase session token
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// 在所有 API 请求中携带 token
const response = await fetch('/api/fish-api?action=group-chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tankFishIds: [...],
    // 不再需要 userId，从 token 中提取
  })
});
```

### 2. 错误处理

**前端应该处理**:
- `401 Unauthorized` - 跳转到登录页
- `403 Forbidden` - 显示权限不足提示
- `429 Too Many Requests` - 显示限流提示

### 3. 监控指标

**应该监控的指标**:
- 401/403 错误率
- API 调用频率
- 异常 IP 地址
- 失败的鉴权尝试
- Coze API 消耗量

## 📊 风险评估

### 修复前
- **风险等级**: 🔴 高危
- **可能损失**: 数千美元 API 费用
- **攻击难度**: 极低（任何人都可以调用）
- **影响范围**: 所有未鉴权的 API

### 修复后（当前）
- **风险等级**: 🟡 中等
- **剩余风险**: 可以伪造 userId（如果不使用 token）
- **攻击难度**: 中等（需要知道有效的 userId）
- **保护措施**: 
  - 每日限额检查
  - 日志记录
  - 前端已禁用未登录访问

### 完全修复后（目标）
- **风险等级**: 🟢 低
- **保护措施**: 
  - 强制 Bearer token
  - Rate limiting
  - IP 白名单
  - 请求签名

## 🎯 迁移计划

### 阶段 1: 紧急修复（已完成）
- ✅ 创建鉴权中间件
- ✅ 为群聊和独白 API 添加基础鉴权
- ✅ 前端禁用未登录用户访问

### 阶段 2: 全面保护（进行中）
- 🔄 为所有写操作 API 添加鉴权
- 🔄 实施 Rate Limiting
- 🔄 添加监控和日志

### 阶段 3: 强化安全（计划中）
- ⏳ 升级到强制 Bearer token
- ⏳ 实施 CORS 策略
- ⏳ 添加请求签名

### 阶段 4: 持续改进（长期）
- ⏳ 定期安全审计
- ⏳ 更新安全策略
- ⏳ 监控和响应

## 📚 相关文档

- [鉴权中间件文档](../api_docs/AUTH_MIDDLEWARE.md)
- [API 安全最佳实践](../api_docs/API_SECURITY_BEST_PRACTICES.md)
- [前端鉴权集成指南](../api_docs/FRONTEND_AUTH_INTEGRATION.md)

## 🔗 参考资源

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**审计人员**: Cascade AI  
**审计日期**: 2025-11-20  
**下次审计**: 2025-12-20
