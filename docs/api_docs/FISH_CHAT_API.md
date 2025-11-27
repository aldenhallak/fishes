# 鱼聊天功能 API 文档

## 概述

本文档描述鱼聊天功能相关的API接口，包括内容合规检测、鱼信息更新、群聊生成和自语生成。

---

## API 列表

### 1. 内容合规检测

**端点**: `POST /api/fish/moderation/check`

**描述**: 使用Coze AI对用户输入的鱼信息进行内容合规检测。

**请求体**:
```json
{
  "personality": "cheerful",
  "feeder_name": "Ocean Lover",
  "feeder_info": "An artist who loves marine life"
}
```

**参数说明**:
- `personality` (string, optional): 鱼的个性描述
- `feeder_name` (string, optional): 主人昵称
- `feeder_info` (string, optional): 主人信息

**响应**:
```json
{
  "success": true,
  "is_compliant": true,
  "details": {
    "personality": {
      "is_compliant": true,
      "reason": ""
    },
    "feeder_name": {
      "is_compliant": true,
      "reason": ""
    },
    "feeder_info": {
      "is_compliant": true,
      "reason": ""
    }
  },
  "reason": ""
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "Content moderation failed",
  "details": "Error message"
}
```

**环境变量**:
- `COZE_API_KEY`: Coze API密钥
- `COZE_MODERATION_BOT_ID`: 内容审核Bot ID
- `COZE_API_BASE_URL`: Coze API基础URL（可选，默认 https://api.coze.cn）

---

### 2. 更新鱼信息

**端点**: `POST /api/fish/update-info`

**描述**: 更新鱼的名称、个性以及用户的主人信息。

**请求头**:
- `Authorization`: Bearer {token} （可选，如果启用认证）

**请求体**:
```json
{
  "fishId": "uuid-of-fish",
  "fishName": "Nemo",
  "personality": "cheerful",
  "userId": "uuid-of-user",
  "feederName": "Ocean Lover",
  "feederInfo": "An artist who loves marine life"
}
```

**参数说明**:
- `fishId` (string, required): 鱼的UUID
- `fishName` (string, required): 鱼的名称
- `personality` (string, required): 鱼的个性
- `userId` (string, required): 用户UUID
- `feederName` (string, optional): 主人昵称
- `feederInfo` (string, optional): 主人信息

**响应**:
```json
{
  "success": true,
  "message": "Fish information updated successfully",
  "fish": {
    "id": "uuid",
    "fish_name": "Nemo",
    "personality": "cheerful",
    "updated_at": "2025-11-08T10:30:00Z"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "Failed to update fish information",
  "details": "Error message"
}
```

---

### 3. 生成群聊

**端点**: `GET|POST /api/fish/chat/group`

**描述**: 从鱼缸随机选取N条鱼，生成一次群聊对话（使用Coze AI with parameters）。

**查询参数**: 无（参与数量从global_params表读取）

**响应**:
```json
{
  "success": true,
  "sessionId": "uuid-of-saved-session",
  "dialogues": [
    {
      "fishName": "Nemo",
      "message": "Hey everyone! What a beautiful day in the tank!"
    },
    {
      "fishName": "Dory",
      "message": "I just swam here... but I forgot why. Anyone remember?"
    }
  ],
  "participantCount": 5,
  "topic": "Group Chat",
  "participants": [
    {
      "fish_id": "uuid-1",
      "fish_name": "Nemo",
      "personality": "cheerful",
      "feeder_name": "Ocean Lover",
      "feeder_info": "An artist..."
    }
  ]
}
```

**响应字段说明**:
- `sessionId` (string): 保存到数据库的会话ID（可用于回看）
- `dialogues` (array): 对话数组，每个元素包含fishName和message
- `participantCount` (number): 参与鱼的数量
- `topic` (string): 对话主题
- `participants` (array): 参与鱼的完整信息

**数据保存**:
- 所有群聊记录自动保存到 `group_chat` 表
- 保留期限：30天
- 包含完整对话内容、参与鱼ID、时段、主题等信息

**错误响应**:
```json
{
  "success": false,
  "error": "Failed to generate group chat",
  "details": "Error message"
}
```

**依赖的全局参数**:
- `fish_chat_participant_count`: 群聊参与鱼数量（默认5）

**环境变量**:
- `COZE_API_KEY`: Coze API密钥
- `COZE_BOT_ID`: 群聊Bot ID
- `COZE_API_BASE_URL`: Coze API基础URL（可选）

---

### 4. 生成自语

**端点**: `GET|POST /api/fish/chat/monologue`

**描述**: 随机选择一条鱼，返回该鱼的一条自语（从预置内容中随机读取）。

**查询参数**: 无

**响应**:
```json
{
  "success": true,
  "logId": "uuid-of-saved-log",
  "fish": {
    "id": "uuid",
    "name": "Nemo",
    "personality": "cheerful"
  },
  "message": "Oh boy, oh boy! Today is going to be AMAZING! I can feel it in my fins!"
}
```

**响应字段说明**:
- `logId` (string): 保存到数据库的日志ID
- `fish` (object): 说话的鱼的信息
  - `id`: 鱼的UUID
  - `name`: 鱼的名称
  - `personality`: 鱼的个性
- `message` (string): 自语内容（英文）

**数据保存**:
- 所有自语记录自动保存到 `fish_monologue_logs` 表
- 保留期限：30天
- 包含鱼ID、名称、个性、消息内容等信息

**错误响应**:
```json
{
  "success": false,
  "error": "Failed to generate monologue",
  "details": "Error message"
}
```

**依赖的全局参数**:
- `monologue_interval_ms`: 自语频率（毫秒），用于前端定时调用（默认10000ms）

**数据来源**:
- 从 `fish_monologues` 表按 `personality` 查询
- 如果该个性无内容，使用 `default` 个性的内容

---

## Coze Parameters 使用说明

### 参数结构

根据 [Coze API v3 文档](https://www.coze.cn/open/docs/developer_guides/chat_v3#57744ece)，群聊API向Coze传递 `parameters` 参数：

```json
{
  "bot_id": "your-bot-id",
  "user_id": "fish-tank-system",
  "stream": false,
  "auto_save_history": true,
  "additional_messages": [{
    "role": "user",
    "content": "Generate a group chat...",
    "content_type": "text"
  }],
  "parameters": {
    "fish_array": [
      {
        "fish_id": "uuid-1",
        "fish_name": "Nemo",
        "personality": "cheerful",
        "feeder_name": "Ocean Lover",
        "feeder_info": "An artist who loves marine life"
      },
      {
        "fish_id": "uuid-2",
        "fish_name": "Dory",
        "personality": "shy",
        "feeder_name": "Silent Fisher",
        "feeder_info": "Enjoys quiet moments"
      }
    ]
  }
}
```

### Coze Bot配置

在Coze平台的Bot中，parameters会自动注入到对话上下文，可以直接使用：

**在对话流中访问**：
```
{{fish_array[0].fish_name}}
{{fish_array[0].personality}}
{{fish_array[0].feeder_name}}
```

**在Prompt中使用**：
```
Please create a group chat with these fish:
{% for fish in fish_array %}
- {{fish.fish_name}} ({{fish.personality}})
  Owner: {{fish.feeder_name}} - {{fish.feeder_info}}
{% endfor %}
```

**注意**：
- 使用 `parameters` 字段，不是 `custom_variables`
- 参数值直接传递对象/数组，无需序列化为字符串
- Bot需要在对话流中配置相应的参数接收

---

## 测试

### 使用test-coze-comprehensive.html测试

1. 打开 `test-coze-comprehensive.html`
2. 填写 API Key 和 Bot ID
3. 在"Parameters测试"面板加载示例数据
4. 点击"发送带Parameters的请求"
5. 查看测试结果和日志

### 使用curl测试

**内容合规检测**:
```bash
curl -X POST http://localhost:3000/api/fish/moderation/check \
  -H "Content-Type: application/json" \
  -d '{"personality":"cheerful","feeder_name":"Test User"}'
```

**群聊生成**:
```bash
curl http://localhost:3000/api/fish/chat/group
```

**自语生成**:
```bash
curl http://localhost:3000/api/fish/chat/monologue
```

---

## 错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 405 | 方法不允许 |
| 500 | 服务器错误 |

---

## 数据清理策略

### 自动清理过期记录

**数据保留期限**：
- 群聊记录（`group_chat`）：30天
- 自语记录（`fish_monologue_logs`）：30天

**清理方法**：

1. **手动清理SQL**:
```sql
-- 清理过期的群聊记录
DELETE FROM group_chat 
WHERE expires_at < NOW();

-- 清理过期的自语记录
DELETE FROM fish_monologue_logs 
WHERE expires_at < NOW();
```

2. **定时任务清理**（推荐）:

使用 `pg_cron` 扩展（PostgreSQL）：
```sql
-- 启用 pg_cron 扩展
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 每天凌晨3点清理过期记录
SELECT cron.schedule(
  'cleanup-chat-records',
  '0 3 * * *',
  $$
  DELETE FROM group_chat WHERE expires_at < NOW();
  DELETE FROM fish_monologue_logs WHERE expires_at < NOW();
  $$
);
```

或使用Hasura定时事件（推荐）：
- 在Hasura Console创建Scheduled Trigger
- URL: `https://your-domain.com/api/cleanup/expired-chats`
- Cron: `0 3 * * *` （每天凌晨3点）

### 存储空间估算

**群聊记录**：
- 每条记录约3-5KB（5条鱼，10条消息）
- 假设每天100次群聊 = 400KB/天 ≈ 12MB/月
- 30天保留 ≈ 12MB

**自语记录**：
- 每条记录约0.5KB
- 假设每天1000次自语 = 500KB/天 ≈ 15MB/月
- 30天保留 ≈ 15MB

**总计**：约27MB/月（可忽略不计）

---

## 性能考虑

1. **Global Params缓存**: `global_params` 值缓存60秒，避免频繁数据库查询
2. **Coze API轮询**: 最多轮询15次（群聊）/10次（合规），间隔2秒
3. **随机鱼选择**: 群聊查询limit=N*3条记录后随机，保证多样性
4. **自语fallback**: 优先使用匹配personality的内容，其次default，最后硬编码
5. **数据库索引**: `fish_monologue_logs` 和 `community_chat_sessions` 已添加必要索引
6. **过期记录清理**: 通过 `expires_at` 索引快速删除过期数据

---

## 相关文档

- [数据库结构文档](./FISH_CHAT_DATABASE.md)
- [实现细节](../temp_docs/FISH_CHAT_IMPLEMENTATION.md)
- [Coze API文档](https://www.coze.cn/open/docs/developer_guides/chat_v3)

---

**创建日期**: 2025-11-08  
**最后更新**: 2025-11-08


## 概述

本文档描述鱼聊天功能相关的API接口，包括内容合规检测、鱼信息更新、群聊生成和自语生成。

---

## API 列表

### 1. 内容合规检测

**端点**: `POST /api/fish/moderation/check`

**描述**: 使用Coze AI对用户输入的鱼信息进行内容合规检测。

**请求体**:
```json
{
  "personality": "cheerful",
  "feeder_name": "Ocean Lover",
  "feeder_info": "An artist who loves marine life"
}
```

**参数说明**:
- `personality` (string, optional): 鱼的个性描述
- `feeder_name` (string, optional): 主人昵称
- `feeder_info` (string, optional): 主人信息

**响应**:
```json
{
  "success": true,
  "is_compliant": true,
  "details": {
    "personality": {
      "is_compliant": true,
      "reason": ""
    },
    "feeder_name": {
      "is_compliant": true,
      "reason": ""
    },
    "feeder_info": {
      "is_compliant": true,
      "reason": ""
    }
  },
  "reason": ""
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "Content moderation failed",
  "details": "Error message"
}
```

**环境变量**:
- `COZE_API_KEY`: Coze API密钥
- `COZE_MODERATION_BOT_ID`: 内容审核Bot ID
- `COZE_API_BASE_URL`: Coze API基础URL（可选，默认 https://api.coze.cn）

---

### 2. 更新鱼信息

**端点**: `POST /api/fish/update-info`

**描述**: 更新鱼的名称、个性以及用户的主人信息。

**请求头**:
- `Authorization`: Bearer {token} （可选，如果启用认证）

**请求体**:
```json
{
  "fishId": "uuid-of-fish",
  "fishName": "Nemo",
  "personality": "cheerful",
  "userId": "uuid-of-user",
  "feederName": "Ocean Lover",
  "feederInfo": "An artist who loves marine life"
}
```

**参数说明**:
- `fishId` (string, required): 鱼的UUID
- `fishName` (string, required): 鱼的名称
- `personality` (string, required): 鱼的个性
- `userId` (string, required): 用户UUID
- `feederName` (string, optional): 主人昵称
- `feederInfo` (string, optional): 主人信息

**响应**:
```json
{
  "success": true,
  "message": "Fish information updated successfully",
  "fish": {
    "id": "uuid",
    "fish_name": "Nemo",
    "personality": "cheerful",
    "updated_at": "2025-11-08T10:30:00Z"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "Failed to update fish information",
  "details": "Error message"
}
```

---

### 3. 生成群聊

**端点**: `GET|POST /api/fish/chat/group`

**描述**: 从鱼缸随机选取N条鱼，生成一次群聊对话（使用Coze AI with parameters）。

**查询参数**: 无（参与数量从global_params表读取）

**响应**:
```json
{
  "success": true,
  "sessionId": "uuid-of-saved-session",
  "dialogues": [
    {
      "fishName": "Nemo",
      "message": "Hey everyone! What a beautiful day in the tank!"
    },
    {
      "fishName": "Dory",
      "message": "I just swam here... but I forgot why. Anyone remember?"
    }
  ],
  "participantCount": 5,
  "topic": "Group Chat",
  "participants": [
    {
      "fish_id": "uuid-1",
      "fish_name": "Nemo",
      "personality": "cheerful",
      "feeder_name": "Ocean Lover",
      "feeder_info": "An artist..."
    }
  ]
}
```

**响应字段说明**:
- `sessionId` (string): 保存到数据库的会话ID（可用于回看）
- `dialogues` (array): 对话数组，每个元素包含fishName和message
- `participantCount` (number): 参与鱼的数量
- `topic` (string): 对话主题
- `participants` (array): 参与鱼的完整信息

**数据保存**:
- 所有群聊记录自动保存到 `group_chat` 表
- 保留期限：30天
- 包含完整对话内容、参与鱼ID、时段、主题等信息

**错误响应**:
```json
{
  "success": false,
  "error": "Failed to generate group chat",
  "details": "Error message"
}
```

**依赖的全局参数**:
- `fish_chat_participant_count`: 群聊参与鱼数量（默认5）

**环境变量**:
- `COZE_API_KEY`: Coze API密钥
- `COZE_BOT_ID`: 群聊Bot ID
- `COZE_API_BASE_URL`: Coze API基础URL（可选）

---

### 4. 生成自语

**端点**: `GET|POST /api/fish/chat/monologue`

**描述**: 随机选择一条鱼，返回该鱼的一条自语（从预置内容中随机读取）。

**查询参数**: 无

**响应**:
```json
{
  "success": true,
  "logId": "uuid-of-saved-log",
  "fish": {
    "id": "uuid",
    "name": "Nemo",
    "personality": "cheerful"
  },
  "message": "Oh boy, oh boy! Today is going to be AMAZING! I can feel it in my fins!"
}
```

**响应字段说明**:
- `logId` (string): 保存到数据库的日志ID
- `fish` (object): 说话的鱼的信息
  - `id`: 鱼的UUID
  - `name`: 鱼的名称
  - `personality`: 鱼的个性
- `message` (string): 自语内容（英文）

**数据保存**:
- 所有自语记录自动保存到 `fish_monologue_logs` 表
- 保留期限：30天
- 包含鱼ID、名称、个性、消息内容等信息

**错误响应**:
```json
{
  "success": false,
  "error": "Failed to generate monologue",
  "details": "Error message"
}
```

**依赖的全局参数**:
- `monologue_interval_ms`: 自语频率（毫秒），用于前端定时调用（默认10000ms）

**数据来源**:
- 从 `fish_monologues` 表按 `personality` 查询
- 如果该个性无内容，使用 `default` 个性的内容

---

## Coze Parameters 使用说明

### 参数结构

根据 [Coze API v3 文档](https://www.coze.cn/open/docs/developer_guides/chat_v3#57744ece)，群聊API向Coze传递 `parameters` 参数：

```json
{
  "bot_id": "your-bot-id",
  "user_id": "fish-tank-system",
  "stream": false,
  "auto_save_history": true,
  "additional_messages": [{
    "role": "user",
    "content": "Generate a group chat...",
    "content_type": "text"
  }],
  "parameters": {
    "fish_array": [
      {
        "fish_id": "uuid-1",
        "fish_name": "Nemo",
        "personality": "cheerful",
        "feeder_name": "Ocean Lover",
        "feeder_info": "An artist who loves marine life"
      },
      {
        "fish_id": "uuid-2",
        "fish_name": "Dory",
        "personality": "shy",
        "feeder_name": "Silent Fisher",
        "feeder_info": "Enjoys quiet moments"
      }
    ]
  }
}
```

### Coze Bot配置

在Coze平台的Bot中，parameters会自动注入到对话上下文，可以直接使用：

**在对话流中访问**：
```
{{fish_array[0].fish_name}}
{{fish_array[0].personality}}
{{fish_array[0].feeder_name}}
```

**在Prompt中使用**：
```
Please create a group chat with these fish:
{% for fish in fish_array %}
- {{fish.fish_name}} ({{fish.personality}})
  Owner: {{fish.feeder_name}} - {{fish.feeder_info}}
{% endfor %}
```

**注意**：
- 使用 `parameters` 字段，不是 `custom_variables`
- 参数值直接传递对象/数组，无需序列化为字符串
- Bot需要在对话流中配置相应的参数接收

---

## 测试

### 使用test-coze-comprehensive.html测试

1. 打开 `test-coze-comprehensive.html`
2. 填写 API Key 和 Bot ID
3. 在"Parameters测试"面板加载示例数据
4. 点击"发送带Parameters的请求"
5. 查看测试结果和日志

### 使用curl测试

**内容合规检测**:
```bash
curl -X POST http://localhost:3000/api/fish/moderation/check \
  -H "Content-Type: application/json" \
  -d '{"personality":"cheerful","feeder_name":"Test User"}'
```

**群聊生成**:
```bash
curl http://localhost:3000/api/fish/chat/group
```

**自语生成**:
```bash
curl http://localhost:3000/api/fish/chat/monologue
```

---

## 错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 405 | 方法不允许 |
| 500 | 服务器错误 |

---

## 数据清理策略

### 自动清理过期记录

**数据保留期限**：
- 群聊记录（`group_chat`）：30天
- 自语记录（`fish_monologue_logs`）：30天

**清理方法**：

1. **手动清理SQL**:
```sql
-- 清理过期的群聊记录
DELETE FROM group_chat 
WHERE expires_at < NOW();

-- 清理过期的自语记录
DELETE FROM fish_monologue_logs 
WHERE expires_at < NOW();
```

2. **定时任务清理**（推荐）:

使用 `pg_cron` 扩展（PostgreSQL）：
```sql
-- 启用 pg_cron 扩展
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 每天凌晨3点清理过期记录
SELECT cron.schedule(
  'cleanup-chat-records',
  '0 3 * * *',
  $$
  DELETE FROM group_chat WHERE expires_at < NOW();
  DELETE FROM fish_monologue_logs WHERE expires_at < NOW();
  $$
);
```

或使用Hasura定时事件（推荐）：
- 在Hasura Console创建Scheduled Trigger
- URL: `https://your-domain.com/api/cleanup/expired-chats`
- Cron: `0 3 * * *` （每天凌晨3点）

### 存储空间估算

**群聊记录**：
- 每条记录约3-5KB（5条鱼，10条消息）
- 假设每天100次群聊 = 400KB/天 ≈ 12MB/月
- 30天保留 ≈ 12MB

**自语记录**：
- 每条记录约0.5KB
- 假设每天1000次自语 = 500KB/天 ≈ 15MB/月
- 30天保留 ≈ 15MB

**总计**：约27MB/月（可忽略不计）

---

## 性能考虑

1. **Global Params缓存**: `global_params` 值缓存60秒，避免频繁数据库查询
2. **Coze API轮询**: 最多轮询15次（群聊）/10次（合规），间隔2秒
3. **随机鱼选择**: 群聊查询limit=N*3条记录后随机，保证多样性
4. **自语fallback**: 优先使用匹配personality的内容，其次default，最后硬编码
5. **数据库索引**: `fish_monologue_logs` 和 `community_chat_sessions` 已添加必要索引
6. **过期记录清理**: 通过 `expires_at` 索引快速删除过期数据

---

## 相关文档

- [数据库结构文档](./FISH_CHAT_DATABASE.md)
- [实现细节](../temp_docs/FISH_CHAT_IMPLEMENTATION.md)
- [Coze API文档](https://www.coze.cn/open/docs/developer_guides/chat_v3)

---

**创建日期**: 2025-11-08  
**最后更新**: 2025-11-08

