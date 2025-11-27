# Complete Community Chat System Migration Guide

## ⚠️ 重要发现

通过对比当前数据库schema和计划，发现以下问题：

### 当前数据库状态
- ❌ `fish`表**缺少** `fish_name` 和 `personality_type` 字段
- ⚠️ `fish`表仍包含所有战斗字段（talent, level, experience等）
- ⚠️ `battle_log` 和 `battle_config` 表仍然存在

### 迁移脚本问题
- 原有的两个迁移脚本有依赖关系
- `migrate-community-chat-system.sql`依赖`migrate-dialogue-system.sql`先执行
- 如果顺序错误会导致查询不存在的字段

### 解决方案
创建了**统一的完整迁移脚本**：`migrate-complete-community-system.sql`

---

## 🚀 迁移步骤（推荐）

### 选项A：使用完整迁移脚本（推荐）

这是最简单安全的方式：

```bash
# 1. 备份数据库
pg_dump -h your-db-host -U your-user -d your-database > backup_$(date +%Y%m%d).sql

# 2. 执行完整迁移
psql -h your-db-host -U your-user -d your-database -f scripts/migrate-complete-community-system.sql
```

**或使用Hasura Console：**

1. 打开Hasura Console → Data → SQL
2. 复制 `scripts/migrate-complete-community-system.sql` 的内容
3. 粘贴到SQL编辑器
4. 勾选 "Track this" （可选）
5. 点击 "Run!"

### 选项B：分步执行（如果已经执行了部分迁移）

如果你已经执行了 `migrate-dialogue-system.sql`：

```bash
# 只需执行社区聊天迁移
psql -h your-db-host -U your-user -d your-database -f scripts/migrate-community-chat-system.sql
```

---

## ✅ 迁移验证

### 1. 检查fish表结构

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fish' 
ORDER BY ordinal_position;
```

**期望结果：**
```
id                  | uuid
user_id             | character varying(255)
image_url           | text
artist              | character varying(255)
fish_name           | character varying(50)      ← ✅ 应该存在
personality_type    | character varying(20)      ← ✅ 应该存在
upvotes             | integer
is_alive            | boolean
is_approved         | boolean
reported            | boolean
created_at          | timestamp
moderator_notes     | text
report_count        | integer
```

**不应该存在的字段：**
- ❌ talent
- ❌ level
- ❌ experience
- ❌ health
- ❌ max_health
- ❌ battle_power
- ❌ is_in_battle_mode
- ❌ position_row
- ❌ total_wins
- ❌ total_losses

### 2. 检查新表是否创建

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_subscriptions', 
    'community_chat_sessions'
  );
```

**期望结果：**
```
user_subscriptions
community_chat_sessions
```

### 3. 检查战斗表是否删除

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('battle_log', 'battle_config');
```

**期望结果：** 空（0行）

### 4. 测试GraphQL查询

```graphql
query TestNewFields {
  fish(limit: 5) {
    id
    fish_name           # ← 应该可以查询
    personality_type    # ← 应该可以查询
    artist
    upvotes
    created_at
  }
}
```

```graphql
query TestCommunityChatSessions {
  community_chat_sessions(limit: 5) {
    id
    topic
    time_of_day
    participant_fish_ids
    dialogues
    created_at
  }
}
```

---

## 🔧 Hasura配置

### 1. Track新表

在Hasura Console → Data → Untracked tables/views：

点击"Track"：
- ✅ `community_chat_sessions`
- ✅ `user_subscriptions`
- ✅ `recent_chat_sessions` (view)

### 2. Untrack战斗表（如果仍tracked）

在Hasura Console → Data → Tracked tables：

点击"Untrack"：
- ❌ `battle_log`
- ❌ `battle_config`

### 3. 配置权限

**community_chat_sessions:**

**User role - Select:**
```json
{
  "filter": {},
  "columns": ["id", "topic", "time_of_day", "dialogues", "created_at", "display_duration"]
}
```

**user_subscriptions:**

**User role - Select:**
```json
{
  "filter": {
    "user_id": {
      "_eq": "X-Hasura-User-Id"
    }
  },
  "columns": ["user_id", "plan", "is_active", "current_period_end", "created_at"]
}
```

### 4. Reload Metadata

在Hasura Console → Settings → Reload Metadata

---

## 📝 迁移后的数据库Schema

### fish表（简化后）

```sql
CREATE TABLE fish (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    artist VARCHAR(255),
    fish_name VARCHAR(50),              -- ✅ 新增
    personality_type VARCHAR(20),       -- ✅ 新增
    upvotes INT DEFAULT 0,
    is_alive BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT TRUE,
    reported BOOLEAN DEFAULT FALSE,
    moderator_notes TEXT,
    report_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### community_chat_sessions表（新增）

```sql
CREATE TABLE community_chat_sessions (
    id UUID PRIMARY KEY,
    topic VARCHAR(100) NOT NULL,
    time_of_day VARCHAR(20),
    participant_fish_ids UUID[] NOT NULL,
    dialogues JSONB NOT NULL,
    display_duration INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days'
);
```

**dialogues JSON格式：**
```json
{
  "messages": [
    {
      "fishId": "uuid-here",
      "fishName": "Bubbles",
      "message": "Good morning everyone! 🌅",
      "sequence": 1
    },
    {
      "fishId": "uuid-here",
      "fishName": "Shadow",
      "message": "Um... morning. *swims quietly*",
      "sequence": 2
    }
  ]
}
```

### user_subscriptions表（新增）

```sql
CREATE TABLE user_subscriptions (
    user_id VARCHAR(255) PRIMARY KEY,
    plan VARCHAR(20) DEFAULT 'free',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🤖 设置自动清理（可选但推荐）

### 使用Hasura Scheduled Triggers

1. 创建webhook endpoint `api/cron/cleanup-chats.js`:

```javascript
export default async function handler(req, res) {
  // Verify Hasura secret
  if (req.headers['x-hasura-admin-secret'] !== process.env.HASURA_ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const query = `
    mutation CleanupExpiredChats {
      delete_community_chat_sessions(
        where: { expires_at: { _lt: "now()" } }
      ) {
        affected_rows
      }
    }
  `;

  const result = await queryHasura(query);
  
  return res.json({
    success: true,
    deleted: result.delete_community_chat_sessions.affected_rows,
    timestamp: new Date().toISOString()
  });
}
```

2. 在Hasura Console → Events → Cron Triggers 创建trigger：
   - Name: `cleanup_expired_chats`
   - Webhook: `https://your-domain.com/api/cron/cleanup-chats`
   - Schedule: `0 2 * * *` (每天凌晨2点)
   - Headers: `x-hasura-admin-secret: your-secret`

---

## 🔴 回滚方案

如果需要回滚到迁移前：

```bash
# 从备份恢复
psql -h your-db-host -U your-user -d your-database < backup_YYYYMMDD.sql
```

**或手动回滚：**

```sql
-- 重新添加战斗字段（仅作示例，不推荐）
ALTER TABLE fish 
ADD COLUMN talent INT DEFAULT 50,
ADD COLUMN level INT DEFAULT 1,
ADD COLUMN experience INT DEFAULT 0,
-- ... 其他字段

-- 删除新表
DROP TABLE community_chat_sessions CASCADE;
DROP VIEW recent_chat_sessions;
```

---

## 📊 迁移前后对比

| 项目 | 迁移前 | 迁移后 |
|------|--------|--------|
| fish表字段数 | 23个 | 13个 ✅ |
| 战斗相关表 | 2个（battle_log, battle_config） | 0个 ✅ |
| 社交相关表 | 0个 | 2个（user_subscriptions, community_chat_sessions） ✅ |
| fish表主要功能 | 战斗系统 | 社交系统 ✅ |
| 对话支持 | ❌ | ✅ |
| 订阅系统 | ❌ | ✅ |

---

## ❓ 常见问题

### Q: 迁移会丢失现有的鱼数据吗？
**A:** 不会。只删除战斗相关字段和表，鱼的基本信息（id, image_url, artist等）都会保留。

### Q: 已有的鱼会自动获得名字和个性吗？
**A:** 不会。这些字段是可选的（NULL）。用户需要在提交新鱼时设置，或者通过设置页面更新现有鱼。

### Q: battle_log表中的历史数据会丢失吗？
**A:** 是的。执行前请确保不需要这些数据，或者先导出备份。

### Q: 可以在生产环境直接执行吗？
**A:** 建议先在测试环境验证，然后在低流量时段执行。务必先备份！

---

## ✅ 迁移完成检查清单

- [ ] 数据库已备份
- [ ] 迁移脚本已执行
- [ ] fish表有fish_name和personality_type字段
- [ ] fish表没有战斗字段
- [ ] battle_log和battle_config已删除
- [ ] community_chat_sessions表已创建
- [ ] user_subscriptions表已创建
- [ ] Hasura已track新表
- [ ] Hasura已untrack战斗表
- [ ] 权限已配置
- [ ] GraphQL查询测试通过
- [ ] 自动清理cron已设置（可选）

---

##  下一步

迁移完成后，可以继续：

1. ✅ **Phase 2:** COZE AI集成
2. ✅ **Phase 3:** 前端对话系统
3. ✅ **Phase 4:** Stripe订阅集成

查看完整计划文档了解更多细节。

