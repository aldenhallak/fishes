# 鱼聊天功能数据库文档

## 概述

本文档描述鱼聊天功能所需的数据库结构变更，包括用户表扩展、鱼个性字段调整、自语表和全局参数表。

---

## 数据库变更

### 1. users 表扩展

扩展用户表以支持"主人"信息，用于鱼聊天时生成更个性化的对话。

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `feeder_name` | VARCHAR(100) | 主人昵称（可选） |
| `feeder_info` | TEXT | 主人信息描述（可选） |

**用途**：
- 传递给Coze API作为parameters的一部分
- 让鱼在聊天时可以提及或讨论主人

---

### 2. fish 表字段调整

将 `personality_type` 重命名为 `personality`，并扩展长度支持自定义输入。

| 原字段名 | 新字段名 | 类型变更 |
|----------|----------|----------|
| `personality_type` | `personality` | VARCHAR(50) → VARCHAR(100) |

**变更原因**：
- 更简洁的命名
- 支持用户自定义个性描述（不限于预设的cheerful/shy/brave/lazy）
- 传递给Coze API时更灵活

**注意**：fish_name字段已存在，无需添加

---

### 3. fish_monologues 表（新建）

存储按个性分类的预设自语内容，采用美式动画电影幽默风格的英文内容。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 唯一标识符 |
| `personality` | VARCHAR(100) | NOT NULL | 个性类型 |
| `content` | TEXT | NOT NULL | 自语内容（英文） |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 创建时间 |

**索引**：
- `idx_fish_monologues_personality` ON `personality`

**预置内容统计**：
- **cheerful**（开朗）: 15条 - 积极向上、充满活力
- **shy**（害羞）: 15条 - 腼腆可爱、自我对话
- **brave**（勇敢）: 15条 - 英雄气概、鼓舞人心
- **lazy**（懒惰）: 15条 - 慵懒幽默、热爱放松
- **default**（默认）: 10条 - 通用内容，适用于自定义个性

**内容风格**：
参考《海底总动员》《疯狂动物城》《功夫熊猫》等美国主流动画电影的诙谐幽默风格。

---

### 4. global_params 表（新建）

存储系统级可调整参数，方便灵活配置聊天频率和参与数量。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `key` | VARCHAR(100) | PRIMARY KEY | 参数键名 |
| `value` | TEXT | NOT NULL | 参数值 |
| `description` | TEXT | | 参数说明 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**预置参数**：

| Key | Value | Description |
|-----|-------|-------------|
| `fish_chat_participant_count` | "5" | 群聊参与鱼数量 |
| `group_chat_interval_ms` | "30000" | 群聊间隔（毫秒），30秒 |
| `monologue_interval_ms` | "10000" | 自语间隔（毫秒），10秒 |

**用途**：
- 无需重启服务即可调整聊天行为
- 通过更新数据库记录来配置系统参数
- 后端通过 `lib/global-params.js` 读取（带缓存）

---

### 5. fish_monologue_logs 表（新建）

存储鱼的自语日志记录（实际发生的自语）。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 唯一标识符 |
| `fish_id` | UUID | NOT NULL, FK → fish(id) | 鱼的UUID |
| `fish_name` | VARCHAR(100) | | 鱼的名称（冗余存储） |
| `personality` | VARCHAR(100) | | 鱼的个性 |
| `message` | TEXT | NOT NULL | 自语内容 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| `expires_at` | TIMESTAMP | DEFAULT NOW() + 30天 | 过期时间 |

**索引**：
- `idx_monologue_logs_fish_id` ON `fish_id`
- `idx_monologue_logs_created` ON `created_at`
- `idx_monologue_logs_expires` ON `expires_at`

**用途**：
- 记录每条鱼实际说出的自语
- 便于分析鱼的活跃度
- 追踪自语内容效果
- 30天后自动清理

---

### 6. group_chat 表（已存在，已更新）

**说明**：原 `community_chat_sessions` 表已改名为 `group_chat`

**重要更新**：`expires_at` 默认值已从7天改为**30天**。

**用途**：
- 存储群聊完整对话内容
- 支持历史回看功能
- 便于内容审核和质量分析

**数据保留策略**：
- 群聊记录：保留30天
- 自语记录：保留30天
- 可通过定时任务自动清理过期数据

**已删除**：`recent_chat_sessions` 表（功能重复，已移除）

---

## 迁移脚本

**文件位置**: `scripts/add-fish-chat-features.sql`

**执行方式**:
```bash
# Hasura Console SQL页面直接执行
# 或通过psql命令行
psql -h <host> -U <user> -d <database> -f scripts/add-fish-chat-features.sql
```

**验证**:
脚本执行后会显示每种个性的自语数量统计。

---

## GraphQL Schema 影响

### 需要更新的类型：

1. **fish 表**:
   - `personality_type: String` → `personality: String`

2. **users 表**:
   - 新增 `feeder_name: String`
   - 新增 `feeder_info: String`

3. **新增类型**:
   - `fish_monologues` 表
   - `global_params` 表

**操作**: 在Hasura Console重新Track这些表和字段

---

## 使用示例

### 读取全局参数
```javascript
const { getGlobalParam } = require('./lib/global-params');

const participantCount = await getGlobalParam('fish_chat_participant_count'); // "5"
const groupInterval = await getGlobalParam('group_chat_interval_ms'); // "30000"
```

### 查询鱼的自语
```sql
-- 按个性随机获取1条自语
SELECT content 
FROM fish_monologues 
WHERE personality = 'cheerful' 
ORDER BY RANDOM() 
LIMIT 1;
```

### 查询鱼的完整聊天参数
```sql
-- 获取鱼及其主人信息
SELECT 
  f.id as fish_id,
  f.fish_name,
  f.personality,
  u.feeder_name,
  u.feeder_info
FROM fish f
JOIN users u ON f.user_id = u.id
WHERE f.id = ANY($1);
```

---

## 注意事项

1. **向后兼容**: `personality` 字段重命名会影响现有代码，需要全局搜索 `personality_type` 并替换
2. **自语内容**: 全部为英文，如需中文需另外维护
3. **自定义个性**: 如果用户输入的个性在 `fish_monologues` 中没有对应内容，使用 `default` 类型的自语
4. **参数更新**: 修改 `global_params` 表后，缓存会在一定时间后刷新（具体时间由 `lib/global-params.js` 配置）

---

## 相关文档

- [鱼聊天API文档](./FISH_CHAT_API.md)
- [实现细节](../temp_docs/FISH_CHAT_IMPLEMENTATION.md)
- [Coze参数文档](https://www.coze.cn/open/docs/developer_guides/chat_v3)

---

**创建日期**: 2025-11-08  
**最后更新**: 2025-11-08

