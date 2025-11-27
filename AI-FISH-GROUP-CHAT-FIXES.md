# AI Fish Group Chat 修复说明

## 🐛 修复的问题

### 问题 1：计数逻辑错误
**症状**：显示 `9/5 次`，超过限制但仍在统计

**原因**：
- 原逻辑统计的是"用户的鱼参与的所有群聊"
- 包括了其他用户发起的、但有该用户的鱼参与的群聊
- 导致计数不准确且超过限制

**修复方案**：
1. 添加 `initiator_user_id` 字段到 `group_chat` 表
2. 保存群聊时记录发起用户ID
3. 统计时只查询 `initiator_user_id` 匹配的记录
4. 使用 `group_chat_aggregate` 直接统计数量

### 问题 2：缺少升级提示弹窗
**症状**：达到限制后只在控制台显示消息，用户不知情

**修复方案**：
- 添加 `showUpgradePrompt()` 方法
- 创建精美的模态弹窗
- 显示使用进度条
- 提供"稍后再说"和"立即升级"按钮

## 📝 修改的文件

### 1. `api/fish/chat/group.js`

#### 修改 `getUserDailyGroupChatUsage()`
```javascript
// 旧逻辑：统计参与的所有群聊
const userChats = groupChats.filter(chat => {
    const participantIds = chat.participant_fish_ids || [];
    return participantIds.some(id => userFishIds.includes(id));
});

// 新逻辑：只统计用户发起的群聊
const query = `
    query GetUserDailyUsage($userId: String!, $todayStart: timestamp!) {
        group_chat_aggregate(
            where: {
                created_at: { _gte: $todayStart },
                initiator_user_id: { _eq: $userId }
            }
        ) {
            aggregate {
                count
            }
        }
    }
`;
```

#### 修改 `saveGroupChatSession()`
- 添加 `initiator_user_id` 参数
- 在mutation中包含该字段
- 保存时记录发起用户ID

#### 修改主处理函数
- 将 `requestingUserId` 传递给 `saveGroupChatSession()`

### 2. `src/js/community-chat-manager.js`

#### 添加 `showUpgradePrompt()` 方法
- 检测 `data.error === 'Daily limit reached'`
- 调用弹窗显示方法
- 防止5分钟内重复显示

#### 弹窗特性
- 🎣 精美的渐变图标
- 📊 进度条显示使用情况
- 💡 升级建议提示
- 🎨 现代化UI设计
- 📱 响应式布局

### 3. `database-update-group-chat-limit.sql`

合并了两个更新：
1. 添加 `initiator_user_id` 字段
2. 添加全局参数 `free_daily_group_chat_limit`
3. 创建必要的索引
4. 包含验证查询

### 4. `database/migrations/add_initiator_user_id_to_group_chat.sql`

独立的迁移文件，用于版本控制。

## 🚀 部署步骤

### 1. 执行数据库更新

```bash
# 方式1：使用合并脚本
psql -U your_user -d your_database -f database-update-group-chat-limit.sql

# 方式2：使用迁移文件
psql -U your_user -d your_database -f database/migrations/add_initiator_user_id_to_group_chat.sql
```

### 2. 验证数据库更新

```sql
-- 检查字段是否添加
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'group_chat' 
AND column_name = 'initiator_user_id';

-- 检查索引是否创建
SELECT indexname 
FROM pg_indexes
WHERE tablename = 'group_chat'
AND indexname LIKE '%initiator%';

-- 检查全局参数
SELECT * FROM global_params 
WHERE key = 'free_daily_group_chat_limit';
```

### 3. 重启服务

```bash
# 开发环境
npm run dev

# 生产环境
pm2 restart fish-art  # 或你的进程名
```

### 4. 测试验证

#### 测试计数准确性

1. **查看今日统计**：
```sql
SELECT 
    u.email,
    COUNT(DISTINCT gc.id) as chat_count
FROM users u
LEFT JOIN group_chat gc ON gc.initiator_user_id = u.id 
    AND gc.created_at >= CURRENT_DATE
GROUP BY u.id, u.email
ORDER BY chat_count DESC;
```

2. **触发群聊**：
- 等待自动触发或手动触发
- 观察控制台日志

3. **预期日志**：
```
[AI Fish Group Chat] User {userId} has initiated {N} group chats today
[AI Fish Group Chat] Free user {userId}: {N}/5 used today, allowed: true
```

#### 测试达到限制

1. **触发5次群聊**（免费用户）
2. **第6次触发时**：
   - ✅ 控制台显示：`API suggests using fallback: 免费会员每天可生成 AI Fish Group Chat 5/5 次。`
   - ✅ 弹出精美的升级提示弹窗
   - ✅ 显示 `5/5` 使用情况
   - ✅ 显示进度条（100%）

3. **点击"立即升级"**：
   - 跳转到 `/membership.html`

4. **点击"稍后再说"**：
   - 关闭弹窗
   - 使用fallback对话

## 📊 弹窗预览

```
┌─────────────────────────────────────────┐
│                                         │
│              🎣 (渐变圆形图标)           │
│                                         │
│      AI Fish Group Chat 次数已用完      │
│    免费会员每天可生成 AI Fish Group     │
│              Chat 5/5 次。              │
│                                         │
│  ┌────────────────────────────────┐   │
│  │  今日已使用          5 / 5     │   │
│  │  ████████████████████ 100%      │   │
│  └────────────────────────────────┘   │
│                                         │
│  ┌────────────────────────────────┐   │
│  │ 💡 升级到 Plus 或 Premium 会员 │   │
│  │    可无限次使用 AI Fish Group   │   │
│  │           Chat                  │   │
│  └────────────────────────────────┘   │
│                                         │
│  ┌──────────┐  ┌──────────────────┐  │
│  │ 稍后再说 │  │  立即升级 ✨     │  │
│  └──────────┘  └──────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## 🔍 调试信息

### 后端日志
```
[AI Fish Group Chat] User {userId} has initiated {N} group chats today
[AI Fish Group Chat] Free user {userId}: {N}/5 used today, allowed: true/false
```

### 前端日志
```
API suggests using fallback: 免费会员每天可生成 AI Fish Group Chat {N}/{limit} 次。
📢 Upgrade prompt shown: {message, limitInfo}
```

### 数据库查询
```sql
-- 查看今日某用户的群聊
SELECT 
    gc.id,
    gc.created_at,
    gc.initiator_user_id,
    gc.topic
FROM group_chat gc
WHERE gc.initiator_user_id = 'USER_ID_HERE'
AND gc.created_at >= CURRENT_DATE
ORDER BY gc.created_at DESC;
```

## ⚠️ 注意事项

1. **旧数据处理**：
   - 已存在的 `group_chat` 记录 `initiator_user_id` 为 NULL
   - 不影响新记录的统计
   - 旧记录不会被计入任何用户的使用量

2. **时区问题**：
   - 统计使用UTC时间的当天00:00:00
   - 确保服务器时区配置正确

3. **弹窗防抖**：
   - 5分钟内只显示一次
   - 避免用户体验不佳

4. **降级处理**：
   - 查询失败时返回0，允许使用
   - 确保服务可用性

## ✅ 完成检查清单

- [x] 修复计数逻辑
- [x] 添加 `initiator_user_id` 字段
- [x] 更新保存逻辑
- [x] 添加升级弹窗
- [x] 创建数据库迁移脚本
- [x] 创建修复文档
- [ ] 执行数据库更新（需手动）
- [ ] 测试计数准确性（需手动）
- [ ] 测试弹窗显示（需手动）

## 📞 支持

如有问题，请检查：
1. 数据库更新是否成功执行
2. 后端日志是否显示正确的统计
3. 前端是否正确接收限制信息
4. 弹窗是否正确显示

