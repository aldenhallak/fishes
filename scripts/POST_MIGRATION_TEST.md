# 🧪 迁移后测试验证指南

## ✅ 前置条件检查

- [x] 数据库迁移脚本执行成功
- [x] 在 Hasura 中已 track 新表
- [x] Hasura 元数据已重新加载

---

## 📝 测试清单

### 第一部分：GraphQL API 测试（5分钟）

#### 1.1 测试 Fish 表新字段

在 Hasura Console → **API** 标签中执行：

```graphql
query TestFishNewFields {
  fish(limit: 3) {
    id
    user_id
    fish_name          # 新字段
    personality_type   # 新字段
    image_url
    created_at
    upvotes
  }
}
```

**✅ 预期结果：**
- 查询成功返回
- `fish_name` 和 `personality_type` 可能为 `null`（正常，新字段还没数据）
- 其他字段正常显示

---

#### 1.2 测试社区聊天会话表

```graphql
query TestCommunityChatSessions {
  community_chat_sessions(limit: 5, order_by: {created_at: desc}) {
    id
    topic
    time_of_day
    participant_fish_ids
    dialogues
    display_duration
    created_at
    expires_at
  }
}
```

**✅ 预期结果：**
- 查询成功（即使返回空数组也正常）
- 表结构正确

---

#### 1.3 测试用户订阅表

```graphql
query TestUserSubscriptions {
  user_subscriptions(limit: 5) {
    user_id
    plan
    stripe_customer_id
    stripe_subscription_id
    is_active
    cancel_at_period_end
    current_period_start
    current_period_end
    created_at
    updated_at
  }
}
```

**✅ 预期结果：**
- 查询成功
- 如果有现有用户，应该看到默认的 `free` 订阅

---

#### 1.4 测试最近聊天视图

```graphql
query TestRecentChatSessionsView {
  recent_chat_sessions(limit: 5) {
    id
    topic
    time_of_day
    participant_fish_ids
    message_count
    display_duration
    created_at
  }
}
```

**✅ 预期结果：**
- 查询成功（空结果正常）

---

#### 1.5 测试添加鱼的名字和个性

```graphql
mutation TestAddFishPersonality {
  update_fish(
    where: {id: {_eq: "YOUR_FISH_ID_HERE"}},
    _set: {
      fish_name: "Bubbles",
      personality_type: "cheerful"
    }
  ) {
    affected_rows
    returning {
      id
      fish_name
      personality_type
    }
  }
}
```

**📝 操作步骤：**
1. 先运行 `query TestFishNewFields` 获取一个 fish ID
2. 替换 `YOUR_FISH_ID_HERE` 为实际的 ID
3. 执行 mutation

**✅ 预期结果：**
- `affected_rows: 1`
- 返回更新后的鱼信息

---

### 第二部分：后端 API 测试（10分钟）

#### 2.1 检查环境变量

确认 `.env` 文件包含以下变量：

```bash
# COZE AI
COZE_API_KEY=your_coze_api_key
COZE_BOT_ID=your_bot_id

# Hasura
HASURA_ENDPOINT=https://your-hasura-project.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your_admin_secret

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

**需要配置？** 参考 `ENV_SETUP_GUIDE.md`

---

#### 2.2 启动本地开发服务器

```bash
# 安装依赖（如果还没有）
npm install

# 启动 Vercel 开发服务器
vercel dev
```

**✅ 预期输出：**
```
> Ready! Available at http://localhost:3000
```

---

#### 2.3 测试 COZE AI 集成

**方法 A：使用浏览器测试**

1. 打开浏览器开发者工具（F12）
2. 在 Console 中执行：

```javascript
// 测试触发社区聊天
fetch('http://localhost:3000/api/fish/community-chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    participantCount: 3,
    topic: 'Morning Greetings',
    timeOfDay: 'morning'
  })
})
.then(res => res.json())
.then(data => console.log('✅ Response:', data))
.catch(err => console.error('❌ Error:', err));
```

**方法 B：使用 curl 测试**

```bash
curl -X POST http://localhost:3000/api/fish/community-chat \
  -H "Content-Type: application/json" \
  -d '{
    "participantCount": 3,
    "topic": "Morning Greetings",
    "timeOfDay": "morning"
  }'
```

**✅ 预期响应：**
```json
{
  "success": true,
  "sessionId": "uuid-here",
  "topic": "Morning Greetings",
  "messageCount": 3,
  "participants": ["fish1", "fish2", "fish3"],
  "dialogues": [
    {
      "fishId": "uuid",
      "fishName": "Bubbles",
      "message": "Good morning everyone!",
      "sequence": 0
    }
    // ... 更多消息
  ]
}
```

**❌ 常见错误：**

1. **"COZE_API_KEY not found"**
   - 检查 `.env` 文件是否正确配置
   - 重启 `vercel dev`

2. **"No fish found with personality"**
   - 需要先给一些鱼添加 `personality_type`
   - 运行上面的 GraphQL mutation

3. **"COZE API request failed"**
   - 检查 COZE API Key 是否有效
   - 检查网络连接

---

### 第三部分：前端集成测试（10分钟）

#### 3.1 打开鱼缸页面

```bash
# 浏览器访问
http://localhost:3000/tank.html
```

---

#### 3.2 检查 JavaScript 加载

打开浏览器控制台（F12），应该看到：

```
✅ Tank Layout Manager initialized
✅ Community Chat Manager initialized
🎮 Scheduling auto-chats every 5 minutes
```

---

#### 3.3 手动触发聊天测试

在浏览器控制台执行：

```javascript
// 手动触发一次社区聊天
if (window.communityChatManager) {
  window.communityChatManager.triggerCommunityChat();
  console.log('✅ Community chat triggered!');
} else {
  console.error('❌ Community Chat Manager not initialized');
}
```

**✅ 预期结果：**
- 控制台显示 API 调用日志
- 10-15秒后，鱼缸中出现对话气泡
- 对话气泡在各行的专用区域显示
- 每条消息间隔约6秒

---

#### 3.4 检查对话气泡样式

对话气泡应该具有以下特性：
- ✅ 圆角矩形气泡
- ✅ 半透明白色背景
- ✅ 根据个性类型有不同边框颜色：
  - 🌟 `cheerful`: 金色边框
  - 😊 `shy`: 粉色边框
  - 💪 `brave`: 橙色边框
  - 😴 `lazy`: 蓝色边框
- ✅ 淡入动画效果
- ✅ 显示6秒后淡出

---

### 第四部分：数据持久化测试（5分钟）

#### 4.1 验证聊天会话已保存

返回 Hasura Console，查询：

```graphql
query CheckSavedSessions {
  community_chat_sessions(
    order_by: {created_at: desc},
    limit: 5
  ) {
    id
    topic
    created_at
    dialogues
  }
}
```

**✅ 预期结果：**
- 看到刚才生成的聊天会话
- `dialogues` 字段包含完整的对话 JSON

---

#### 4.2 检查用户订阅数据

```graphql
query CheckUserSubscriptions {
  user_subscriptions(limit: 10) {
    user_id
    plan
    is_active
  }
}
```

**✅ 预期结果：**
- 所有现有用户都有订阅记录
- 默认 `plan: "free"`, `is_active: false`

---

### 第五部分：性能测试（可选，5分钟）

#### 5.1 测试批量聊天生成

```javascript
// 在浏览器控制台执行
async function testBatchChats() {
  console.time('Batch Chat Generation');
  
  for (let i = 0; i < 5; i++) {
    const response = await fetch('http://localhost:3000/api/fish/community-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantCount: 3,
        topic: `Test Topic ${i}`,
        timeOfDay: 'afternoon'
      })
    });
    const data = await response.json();
    console.log(`Chat ${i+1}:`, data.success ? '✅' : '❌');
  }
  
  console.timeEnd('Batch Chat Generation');
}

testBatchChats();
```

**✅ 预期结果：**
- 所有请求成功
- 总耗时 < 30秒（取决于 COZE API 响应速度）

---

#### 5.2 检查数据库查询性能

在 Hasura Console SQL 标签执行：

```sql
-- 检查索引是否生效
EXPLAIN ANALYZE
SELECT * FROM community_chat_sessions
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 10;
```

**✅ 预期结果：**
- 使用索引扫描（Index Scan）
- 执行时间 < 10ms

---

## 🎯 完整测试总结

完成所有测试后，确认以下清单：

### 数据库层
- [x] Fish 表包含 `fish_name` 和 `personality_type` 字段
- [x] 所有战斗系统字段已删除
- [x] `community_chat_sessions` 表已创建并可查询
- [x] `user_subscriptions` 表已创建并可查询
- [x] `recent_chat_sessions` 视图可用
- [x] 所有索引已创建

### GraphQL API 层
- [x] 所有新表已在 Hasura 中 track
- [x] GraphQL 查询成功返回数据
- [x] GraphQL mutation 可以更新鱼的个性
- [x] 权限配置正确

### 后端 API 层
- [x] 环境变量配置正确
- [x] COZE AI 集成正常工作
- [x] `/api/fish/community-chat` 端点响应正常
- [x] 聊天数据成功保存到数据库

### 前端层
- [x] Tank Layout Manager 初始化成功
- [x] Community Chat Manager 初始化成功
- [x] 对话气泡正确显示
- [x] 动画效果正常
- [x] 自动聊天调度工作正常

---

## 🐛 常见问题排查

### 问题 1: 前端控制台报错 "CommunityChatManager is not defined"

**原因：** JavaScript 文件加载顺序错误

**解决：** 检查 `tank.html` 中的脚本加载顺序：
```html
<script src="src/js/tank-layout-manager.js"></script>
<script src="src/js/community-chat-manager.js"></script>
<script src="src/js/tank.js"></script>
```

### 问题 2: COZE API 调用失败

**原因：** API Key 无效或网络问题

**解决：**
1. 验证 COZE API Key: 登录 COZE 平台检查
2. 测试网络连接: `curl https://api.coze.com/v1/health`
3. 检查 Bot ID 是否正确

### 问题 3: 对话气泡不显示

**原因：** 鱼没有设置 `personality_type`

**解决：**
```graphql
mutation AddPersonality {
  update_fish(
    where: {personality_type: {_is_null: true}},
    _set: {personality_type: "cheerful"}
  ) {
    affected_rows
  }
}
```

### 问题 4: Hasura 权限错误

**原因：** 表权限未设置

**解决：** 在 Hasura Console 为新表设置适当权限（参考 `HASURA_MIGRATION_STEPS.md` 第四步）

---

## 🎉 测试通过？

**恭喜！** 🎊 您的社区聊天系统已经完全迁移并运行成功！

### 下一步：

1. **添加更多鱼的个性** - 让社区更丰富
2. **配置 Stripe 订阅** - 开始变现（参考待办任务）
3. **优化 COZE Prompt** - 提升对话质量
4. **部署到生产环境** - 使用 Vercel 部署

---

**测试时间：** 约 35 分钟  
**最后更新：** 2025-11-06

