# AI Fish Group Chat 使用限制测试指南

## 概述
AI Fish Group Chat 功能已更新：
- ✅ 所有会员等级都可以使用
- ✅ 免费用户每天限制次数（默认5次）
- ✅ Plus和Premium用户无限制使用

## 数据库配置

### 1. 添加全局参数
执行SQL脚本添加必要的全局参数：

```bash
# 在Hasura Console或数据库客户端中执行
psql -U your_user -d your_database -f database-update-group-chat-limit.sql
```

或手动执行：
```sql
INSERT INTO global_params (key, value, description, updated_at)
VALUES (
    'free_daily_group_chat_limit',
    '5',
    '免费用户每天可使用 AI Fish Group Chat 的最大次数',
    NOW()
)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();
```

### 2. 验证参数
```sql
SELECT * FROM global_params WHERE key = 'free_daily_group_chat_limit';
```

## 测试场景

### 场景 1: 免费用户 - 正常使用
**前提条件：**
- 用户无活跃订阅（free tier）
- 今日使用次数 < 5

**预期结果：**
- ✅ AI Fish Group Chat 成功生成
- ✅ 控制台显示：`[AI Fish Group Chat] Free user {userId}: {usage}/{limit} used today, allowed: true`
- ✅ 鱼缸中显示聊天内容

**测试步骤：**
1. 打开浏览器控制台
2. 刷新页面等待群聊自动触发
3. 观察控制台日志和UI显示

### 场景 2: 免费用户 - 达到每日限制
**前提条件：**
- 用户无活跃订阅（free tier）
- 今日使用次数 >= 5

**预期结果：**
- ⚠️ API返回限制消息
- ⚠️ 使用fallback对话
- ⚠️ 控制台显示：`API suggests using fallback: 免费会员每天可生成 AI Fish Group Chat {usage}/{limit} 次。`
- ✅ 显示升级提示

**测试步骤：**
1. 在同一天内多次触发群聊（手动或等待自动触发）
2. 第6次触发时观察控制台和UI
3. 验证fallback对话是否显示

### 场景 3: Plus用户 - 无限制使用
**前提条件：**
- 用户有活跃的Plus订阅

**预期结果：**
- ✅ 无论使用多少次都能成功生成
- ✅ 控制台显示：`[AI Fish Group Chat] User {userId} is plus, unlimited access`
- ✅ 没有限制提示

**测试步骤：**
1. 使用Plus用户账号登录
2. 多次触发群聊（>5次）
3. 验证都能正常生成

### 场景 4: Premium用户 - 无限制使用
**前提条件：**
- 用户有活跃的Premium订阅

**预期结果：**
- ✅ 无论使用多少次都能成功生成
- ✅ 控制台显示：`[AI Fish Group Chat] User {userId} is premium, unlimited access`
- ✅ 没有限制提示

## 验证检查点

### 后端日志
在服务器端查看以下日志：

```
[AI Fish Group Chat] Starting generation...
[AI Fish Group Chat] Participant count: {count}
[AI Fish Group Chat] Using provided tank fish IDs: {count}
[AI Fish Group Chat] Selected {count} fish from {total} available
[AI Fish Group Chat] User {userId} has {count} group chats today
[AI Fish Group Chat] Free user {userId}: {usage}/{limit} used today, allowed: {true/false}
[AI Fish Group Chat] Generation successful!
```

### 前端日志
在浏览器控制台查看：

```
✅ AI Fish Group Chat generated: {count} messages
🎭 [Chat UI] 开始显示聊天: {...}
✅ Chat features initialized: AI Fish Group Chat ON, Monologue ON, Cost Saving OFF
```

### 数据库查询
验证group_chat表中的记录：

```sql
-- 查看今日某用户的群聊次数
SELECT 
    gc.id,
    gc.created_at,
    gc.topic,
    gc.participant_fish_ids
FROM group_chat gc
WHERE gc.created_at >= CURRENT_DATE
AND EXISTS (
    SELECT 1 FROM fish f
    WHERE f.user_id = 'USER_ID_HERE'
    AND f.id = ANY(gc.participant_fish_ids)
)
ORDER BY gc.created_at DESC;
```

## 环境变量配置

确保 `.env.local` 中有以下配置：

```env
# 群聊功能开关
GROUP_CHAT=ON

# 群聊间隔时间（分钟）
GROUP_CHAT_INTERVAL_TIME=1

# 自语功能开关
MONO_CHAT=ON

# 费用节省功能开关
CHAT_COST_SAVING=OFF

# 费用节省参数
CHAT_COST_SAVING_INACTIVE_TIME=3
CHAT_COST_SAVING_MAX_TALKING_TIME=8
```

## 故障排查

### 问题：群聊不触发
**检查：**
1. 确认 `GROUP_CHAT=ON` 在 `.env.local` 中
2. 查看控制台是否有错误
3. 检查 `communityChatManager.isGroupChatEnabled()` 返回值

### 问题：限制未生效
**检查：**
1. 确认全局参数已添加到数据库
2. 查看后端日志中的用户tier判断
3. 验证用户订阅状态

### 问题：所有用户都显示已达到限制
**检查：**
1. 确认fish表中有user_id字段
2. 检查selectRandomFish函数是否返回user_id
3. 验证getUserDailyGroupChatUsage函数的查询逻辑

## 调整限制次数

如需修改免费用户的每日限制次数，更新全局参数：

```sql
UPDATE global_params
SET value = '10', updated_at = NOW()
WHERE key = 'free_daily_group_chat_limit';
```

更改将在缓存过期（60秒）后生效，或重启服务器后立即生效。

## 完成标准

- ✅ 免费用户每天限制5次（可配置）
- ✅ Plus/Premium用户无限制
- ✅ 达到限制时显示友好提示
- ✅ 所有日志使用 "AI Fish Group Chat" 名称
- ✅ Fallback对话正常工作
- ✅ 数据库正确记录群聊会话

