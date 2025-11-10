# Fish Art 会员系统指南

## 概述

Fish Art 现已实施三级会员制度：**Free**、**Plus** 和 **Premium**，为用户提供差异化的功能和权限。

## 会员等级对比

| 功能 | Free | Plus | Premium |
|------|------|------|---------|
| 最大鱼数量 | 1 条 | 5 条 | 20 条 |
| AI 聊天功能 | ❌ | ✅ | ✅ |
| 调节说话频率 | ❌ | ❌ | ✅ (1-10次/小时) |
| 鱼食经济系统 | ❌ (已弃用) | ❌ (已弃用) | ❌ (已弃用) |
| 战斗系统 | ❌ (已弃用) | ❌ (已弃用) | ❌ (已弃用) |

## 技术实现

### 1. 数据库架构

#### global_params 表
存储全局配置参数：

```sql
CREATE TABLE IF NOT EXISTS global_params (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**关键参数：**
- `free_max_fish`: Free会员最大鱼数量（默认: 1）
- `plus_max_fish`: Plus会员最大鱼数量（默认: 5）
- `premium_max_fish`: Premium会员最大鱼数量（默认: 20）
- `default_chat_frequency`: 默认说话频率（默认: 5次/小时）
- `premium_chat_frequency_min`: Premium会员最小频率（默认: 1）
- `premium_chat_frequency_max`: Premium会员最大频率（默认: 10）

#### user_subscriptions 表
存储用户订阅信息：

```sql
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'plus', 'premium')),
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### fish 表新增字段
```sql
ALTER TABLE fish ADD COLUMN IF NOT EXISTS chat_frequency INT DEFAULT 5 
  CHECK (chat_frequency >= 1 AND chat_frequency <= 10);
COMMENT ON COLUMN fish.chat_frequency IS '鱼的说话频率（1-10，每小时次数）仅Premium会员可调节';
```

### 2. 后端 API

#### Membership Middleware (`api/middleware/membership.js`)

提供以下功能函数：

- **`getUserMembership(userId)`**: 获取用户完整会员信息
- **`checkMembershipTier(userId)`**: 检查用户会员等级
- **`canCreateFish(userId)`**: 检查用户是否可以创建更多鱼
- **`canFishSpeak(userId)`**: 检查鱼是否可以说话（Plus+）
- **`canAdjustChatFrequency(userId)`**: 检查是否可以调节频率（Premium）

**示例用法：**

```javascript
const { canCreateFish } = require('../middleware/membership');

const check = await canCreateFish(userId);
if (!check.canCreate) {
  return res.status(403).json({
    error: 'Membership limit reached',
    message: check.reason,
    tier: check.tier,
    currentCount: check.currentCount,
    maxCount: check.maxCount
  });
}
```

#### Fish Submission API (`api/fish/submit.js`)

修改要点：
- 集成 `canCreateFish` 中间件
- 删除所有经济系统和战斗系统相关代码
- 只保留核心鱼创建功能

**简化后的流程：**
1. 验证用户存在
2. 检查会员权限（是否可以创建更多鱼）
3. 创建鱼记录
4. 返回结果

#### Chat Settings API (`api/fish/update-chat-settings.js`)

仅 Premium 会员可用，用于调节鱼的说话频率。

**请求格式：**
```json
{
  "userId": "user-id-string",
  "fishId": "fish-uuid",
  "chatFrequency": 7
}
```

**响应格式：**
```json
{
  "success": true,
  "message": "鱼的说话频率已更新！",
  "fish": {
    "id": "fish-uuid",
    "chat_frequency": 7
  }
}
```

### 3. 前端实现

#### Settings Page (`fish-settings.html`)

用户可以在此页面：
- 查看自己的会员等级
- 查看已创建的鱼列表
- **Premium会员专属**：为每条鱼调节说话频率

#### UI组件

**会员信息卡片：**
- 显示当前会员等级（Free/Plus/Premium）
- 显示鱼数量（当前/最大）
- 显示功能权限状态

**鱼列表：**
- 显示所有存活的鱼
- Premium会员可见频率调节滑块

**锁定功能提示：**
- Free/Plus会员可见升级提示
- 显示Premium专属功能列表

#### Navigation Integration

- `index.html`: 添加Settings按钮
- `myfish.html`: 添加Settings链接
- `src/js/auth-ui.js`: 登录后显示Settings链接

## 数据库迁移

### 步骤 1: 清理战斗系统

在 Hasura Console → DATA → SQL 中执行：

```bash
# 方式1：在Hasura Console直接执行
# 复制 database/migrations/drop_battle_system.sql 的内容

# 方式2：使用psql命令行（如果有直接数据库访问）
psql -h your_host -U your_user -d your_db < database/migrations/drop_battle_system.sql
```

**注意事项：**
1. 先在 Hasura Console 删除相关的 GraphQL relationships
2. 确认没有运行中的依赖战斗系统的代码
3. 执行前备份数据库

### 步骤 2: 配置会员参数

在 Hasura Console → DATA → SQL 中执行：

```bash
# 方式1：在Hasura Console直接执行
# 复制 database/migrations/setup_membership_params.sql 的内容

# 方式2：使用psql命令行
psql -h your_host -U your_user -d your_db < database/migrations/setup_membership_params.sql
```

### 步骤 3: 验证配置

```sql
-- 1. 检查global_params
SELECT * FROM global_params 
WHERE key LIKE '%fish%' OR key LIKE '%frequency%';

-- 2. 检查fish表字段
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'fish' AND column_name = 'chat_frequency';

-- 3. 检查用户订阅表
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'user_subscriptions';
```

## API 使用示例

### 检查用户是否可以创建鱼

```javascript
const response = await fetch('/api/fish/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id',
    imageUrl: 'https://example.com/fish.png',
    artist: 'Artist Name',
    fishName: 'My Fish',
    personality: 'cheerful',
    userInfo: 'Loves swimming'
  })
});

const result = await response.json();
if (!result.success) {
  // 如果是会员限制
  if (response.status === 403) {
    console.log(`会员等级: ${result.tier}`);
    console.log(`当前鱼数: ${result.currentCount}/${result.maxCount}`);
    console.log(`提示: ${result.message}`);
  }
}
```

### 更新鱼的说话频率（Premium only）

```javascript
const response = await fetch('/api/fish/update-chat-settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id',
    fishId: 'fish-uuid',
    chatFrequency: 8 // 1-10
  })
});

const result = await response.json();
if (result.success) {
  console.log('✅ 频率已更新:', result.fish.chat_frequency);
} else {
  console.error('❌ 更新失败:', result.message);
}
```

## 升级用户到 Plus/Premium

```sql
-- 创建Plus会员
INSERT INTO user_subscriptions (user_id, plan, is_active) 
VALUES ('user-id', 'plus', true)
ON CONFLICT (user_id) DO UPDATE SET 
  plan = 'plus', 
  is_active = true,
  updated_at = NOW();

-- 创建Premium会员
INSERT INTO user_subscriptions (user_id, plan, is_active) 
VALUES ('user-id', 'premium', true)
ON CONFLICT (user_id) DO UPDATE SET 
  plan = 'premium', 
  is_active = true,
  updated_at = NOW();

-- 降级为Free会员
DELETE FROM user_subscriptions WHERE user_id = 'user-id';
-- 或者
UPDATE user_subscriptions 
SET plan = 'free', is_active = false 
WHERE user_id = 'user-id';
```

## 测试清单

### 1. Free 会员测试
- [ ] 只能创建 1 条鱼
- [ ] 创建第 2 条鱼时显示错误提示
- [ ] 无法看到聊天频率调节功能
- [ ] Settings 页面显示 Free 等级

### 2. Plus 会员测试
- [ ] 可以创建最多 5 条鱼
- [ ] 创建第 6 条鱼时显示错误提示
- [ ] AI 聊天功能可用
- [ ] 无法调节聊天频率
- [ ] Settings 页面显示 Plus 等级

### 3. Premium 会员测试
- [ ] 可以创建最多 20 条鱼
- [ ] AI 聊天功能可用
- [ ] 可以调节每条鱼的说话频率（1-10）
- [ ] Settings 页面显示 Premium 等级
- [ ] 频率调节滑块正常工作

### 4. 数据库测试
- [ ] global_params 表有正确的参数
- [ ] fish 表有 chat_frequency 字段
- [ ] user_subscriptions 表存在且结构正确

## 故障排除

### 问题 1: 创建鱼时提示 "Membership limit reached"

**可能原因：**
- 用户已达到会员等级的鱼数量上限
- global_params 表中的配置不正确

**解决方法：**
```sql
-- 检查用户当前鱼数
SELECT COUNT(*) FROM fish WHERE user_id = 'user-id' AND is_alive = true;

-- 检查用户会员等级
SELECT plan FROM user_subscriptions WHERE user_id = 'user-id';

-- 检查全局参数
SELECT * FROM global_params WHERE key LIKE '%max_fish%';
```

### 问题 2: Premium会员无法调节频率

**可能原因：**
- fish 表缺少 chat_frequency 字段
- 用户实际上不是 Premium 会员

**解决方法：**
```sql
-- 添加 chat_frequency 字段
ALTER TABLE fish ADD COLUMN IF NOT EXISTS chat_frequency INT DEFAULT 5 
  CHECK (chat_frequency >= 1 AND chat_frequency <= 10);

-- 确认用户是 Premium 会员
UPDATE user_subscriptions 
SET plan = 'premium', is_active = true 
WHERE user_id = 'user-id';
```

### 问题 3: Settings 页面显示 "加载中..."

**可能原因：**
- Hasura配置错误
- CORS问题
- 网络请求失败

**解决方法：**
1. 打开浏览器 Console 查看错误信息
2. 确认 `config.js` 中的 `HASURA_GRAPHQL_ENDPOINT` 正确
3. 确认 Hasura 的 CORS 设置允许前端域名

## 后续扩展

### 1. 支付集成
- 集成 Stripe/PayPal 支付
- 创建订阅计划和价格表
- 实现自动升级/降级逻辑

### 2. 会员功能增强
- 自定义鱼的外观（Premium）
- 导出鱼的聊天记录（Plus+）
- 优先队列处理（Premium）

### 3. 监控和分析
- 记录会员升级/降级事件
- 统计各等级用户的鱼创建量
- 分析用户留存率

## 相关文件

### 后端
- `api/middleware/membership.js` - 会员权限中间件
- `api/fish/submit.js` - 鱼提交API（已集成会员检查）
- `api/fish/update-chat-settings.js` - 聊天频率设置API

### 前端
- `fish-settings.html` - 设置页面
- `src/js/fish-settings.js` - 设置页面逻辑
- `src/css/fish-settings.css` - 设置页面样式
- `index.html` - 添加了Settings按钮
- `myfish.html` - 添加了Settings链接
- `src/js/auth-ui.js` - 更新显示/隐藏Settings链接

### 数据库
- `database/migrations/drop_battle_system.sql` - 删除战斗系统
- `database/migrations/setup_membership_params.sql` - 配置会员参数

## 支持

如有问题，请查看：
1. 浏览器 Console 日志
2. Hasura Console 的 API Explorer
3. 数据库查询结果

---

**版本**: 1.0.0  
**最后更新**: 2024年11月10日  
**维护者**: Fish Art Team

