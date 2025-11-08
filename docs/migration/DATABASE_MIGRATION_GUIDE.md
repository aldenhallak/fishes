# 数据库迁移指南 - 对话系统

## 概述
这个迁移脚本为Fish Art添加对话系统支持，包括：
- 鱼名字和个性字段
- 用户订阅管理
- 鱼消息系统
- 对话缓存

## 迁移步骤

### 1. 备份数据库（重要！）
```bash
# 如果使用PostgreSQL
pg_dump -h your-host -U your-user -d fish_art > backup_$(date +%Y%m%d).sql

# 如果使用Hasura Cloud
# 在Hasura Console中导出数据
```

### 2. 执行迁移脚本
```bash
# 方法1: 使用psql命令行
psql -h your-host -U your-user -d fish_art -f scripts/migrate-dialogue-system.sql

# 方法2: 在Hasura Console中执行
# 1. 打开 Hasura Console
# 2. 进入 "Data" 标签
# 3. 选择 "SQL" 
# 4. 粘贴 scripts/migrate-dialogue-system.sql 的内容
# 5. 点击 "Run!"
```

### 3. 验证迁移
```sql
-- 检查新字段是否添加成功
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fish' 
AND column_name IN ('fish_name', 'personality_type');

-- 检查新表是否创建成功
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN (
    'user_subscriptions',
    'fish_messages',
    'fish_dialogue_cache',
    'subscription_history'
);

-- 检查索引是否创建
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('fish', 'user_subscriptions', 'fish_messages');
```

### 4. 在Hasura中Track新表

#### 4.1 Track Tables
1. 打开Hasura Console
2. 进入 "Data" 标签
3. 点击 "Track All" 或逐个Track以下表：
   - `user_subscriptions`
   - `fish_messages`
   - `fish_dialogue_cache`
   - `subscription_history`

#### 4.2 Track Relationships

**fish表关系：**
```
fish → fish_messages (一对多)
  - 关系名: messages
  - 类型: Array relationship
  - 配置: fish.id = fish_messages.fish_id

fish → fish_dialogue_cache (一对多)
  - 关系名: dialogue_cache
  - 类型: Array relationship
  - 配置: fish.id = fish_dialogue_cache.fish_id
```

**user_subscriptions表关系：**
```
user_subscriptions → users (多对一)
  - 关系名: user
  - 类型: Object relationship
  - 配置: user_subscriptions.user_id = users.id

user_subscriptions → subscription_history (一对多)
  - 关系名: history
  - 类型: Array relationship
  - 配置: user_subscriptions.user_id = subscription_history.user_id
```

**fish_messages表关系：**
```
fish_messages → fish (多对一)
  - 关系名: fish
  - 类型: Object relationship
  - 配置: fish_messages.fish_id = fish.id
```

### 5. 配置权限

#### 5.1 Anonymous Role (未登录用户)

**fish表：**
```yaml
select:
  columns: [id, user_id, image_url, artist, fish_name, personality_type, talent, level, upvotes, created_at]
  filter: 
    is_approved: {_eq: true}
    reported: {_eq: false}
```

**fish_messages表：**
```yaml
select:
  columns: [id, fish_id, message_type, content, created_at]
  filter:
    is_approved: {_eq: true}
```

#### 5.2 User Role (已登录用户)

**fish表：**
```yaml
select:
  columns: [*]  # 所有字段
  filter:
    _or:
      - user_id: {_eq: X-Hasura-User-Id}
      - is_approved: {_eq: true}

insert:
  check: {user_id: {_eq: X-Hasura-User-Id}}
  columns: [user_id, image_url, artist, fish_name, personality_type]
  set:
    user_id: X-Hasura-User-Id

update:
  filter: {user_id: {_eq: X-Hasura-User-Id}}
  columns: [fish_name, personality_type, artist]

delete:
  filter: {user_id: {_eq: X-Hasura-User-Id}}
```

**user_subscriptions表：**
```yaml
select:
  columns: [*]
  filter: {user_id: {_eq: X-Hasura-User-Id}}

# insert/update/delete 只能通过Stripe webhook (admin secret)
```

**fish_messages表：**
```yaml
select:
  columns: [*]
  filter:
    _or:
      - user_id: {_eq: X-Hasura-User-Id}
      - is_approved: {_eq: true}

insert:
  check: 
    _and:
      - user_id: {_eq: X-Hasura-User-Id}
      - fish: {user_id: {_eq: X-Hasura-User-Id}}  # 只能为自己的鱼添加消息
  columns: [fish_id, message_type, content]
  set:
    user_id: X-Hasura-User-Id
    ai_generated: false

update:
  filter: {user_id: {_eq: X-Hasura-User-Id}}
  columns: [content, message_type]

delete:
  filter: {user_id: {_eq: X-Hasura-User-Id}}
```

**fish_dialogue_cache表：**
```yaml
select:
  columns: [dialogue]  # 只允许读取对话内容
  filter: {fish: {user_id: {_eq: X-Hasura-User-Id}}}

# insert/update/delete 只能由系统管理
```

#### 5.3 Admin Role

所有表：
```yaml
select: {columns: [*], filter: {}}
insert: {check: {}, columns: [*]}
update: {filter: {}, columns: [*]}
delete: {filter: {}}
```

### 6. 测试API

#### 6.1 测试新字段
```graphql
# 查询带名字和个性的鱼
query GetFishWithDetails {
  fish(limit: 10) {
    id
    artist
    fish_name
    personality_type
    image_url
    talent
    level
    created_at
  }
}
```

#### 6.2 测试订阅查询
```graphql
query GetUserSubscription($userId: String!) {
  user_subscriptions_by_pk(user_id: $userId) {
    user_id
    plan
    is_active
    current_period_end
  }
}
```

#### 6.3 测试消息查询
```graphql
query GetFishMessages($fishId: uuid!) {
  fish_messages(
    where: {fish_id: {_eq: $fishId}, is_approved: {_eq: true}}
    order_by: {created_at: desc}
  ) {
    id
    message_type
    content
    created_at
  }
}
```

## 回滚方案

如果迁移出现问题，可以执行以下回滚：

```sql
-- 回滚fish表修改
ALTER TABLE fish DROP COLUMN IF EXISTS fish_name;
ALTER TABLE fish DROP COLUMN IF EXISTS personality_type;
DROP INDEX IF EXISTS idx_fish_name;
DROP INDEX IF EXISTS idx_fish_personality;

-- 删除新表
DROP TABLE IF EXISTS subscription_history CASCADE;
DROP TABLE IF EXISTS fish_dialogue_cache CASCADE;
DROP TABLE IF EXISTS fish_messages CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;

-- 删除触发器函数
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- 恢复备份（如果需要）
-- psql -h your-host -U your-user -d fish_art < backup_YYYYMMDD.sql
```

## 常见问题

### Q: 迁移失败："relation already exists"
A: 某些表或字段已经存在。检查是否之前已部分执行过迁移。可以单独执行每一步。

### Q: 权限配置后API仍然返回null
A: 检查：
1. Track的表是否包含所有需要的字段
2. Relationship是否正确配置
3. Permission filter是否太严格

### Q: 如何查看当前数据库schema
```sql
\dt                          -- 列出所有表
\d fish                      -- 查看fish表结构
\d+ user_subscriptions       -- 详细查看表结构
\di                          -- 列出所有索引
```

## 下一步

迁移完成后：
1. ✅ 更新GraphQL schema
2. ✅ 测试前端提交流程
3. ✅ 继续COZE AI集成
4. ✅ 实现Stripe订阅

---
**迁移脚本位置:** `scripts/migrate-dialogue-system.sql`
**创建日期:** 2025-11-05
**版本:** 1.0.0

