# 🚀 快速开始指南 - Fish Art 社区聊天系统

## ⚠️ 重要：数据库迁移

**在开始之前，您必须先完成数据库迁移！**

由于 Hasura GraphQL 的元数据依赖，需要按特定顺序操作：

👉 **请先阅读并执行：** [`scripts/HASURA_MIGRATION_STEPS.md`](scripts/HASURA_MIGRATION_STEPS.md)

该指南包含：
1. 在 Hasura 中取消跟踪战斗相关表和关系（必须先做！）
2. 执行 SQL 迁移脚本
3. 跟踪新表并设置权限
4. 验证迁移成功

**⏱️ 预计耗时：** 15分钟（包含备份和验证）

---

## ⚡ 数据库迁移完成后：5分钟设置

### 步骤 1: 环境变量（1分钟）

创建 `.env` 文件，内容如下：
```env
COZE_API_KEY=your_key_here
COZE_BOT_ID=your_bot_id_here
HASURA_ENDPOINT=your_endpoint
HASURA_ADMIN_SECRET=your_secret
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

详见 `ENV_SETUP_GUIDE.md`。

### 步骤 2: 启动服务器（1分钟）

```bash
vercel dev
# 或
npm run dev
```

### 步骤 3: 观看效果！（1分钟）

1. 打开 http://localhost:3000/tank.html
2. 打开浏览器控制台（F12）
3. 等待10秒
4. 观看对话气泡出现！🎉

---

## 📝 刚才发生了什么？

### 数据库变更：
- ✅ 为 fish 表添加了 `fish_name` 和 `personality_type` 字段
- ✅ 移除了所有战斗字段（talent、level、health 等）
- ✅ 删除了 `battle_log` 和 `battle_config` 表
- ✅ 创建了 `community_chat_sessions` 表
- ✅ 创建了 `user_subscriptions` 表

### 新功能：
- ✅ 鱼可以有名字和个性（cheerful 开朗、shy 害羞、brave 勇敢、lazy 慵懒）
- ✅ 每5分钟自动生成 AI 社区聊天
- ✅ 带有淡入淡出动画的精美对话气泡
- ✅ 无重叠气泡（基于行的布局）
- ✅ 自动选择参与者和话题

---

## 🎮 试用一下

### 添加一条有个性的鱼：

1. 前往首页
2. 画一条鱼
3. 输入名字："Bubbles"
4. 选择个性："Cheerful"（开朗）
5. 提交！

### 手动触发聊天：

打开控制台并运行：
```javascript
communityChatManager.startAutoChatSession();
```

### 检查状态：

```javascript
console.log(communityChatManager.getState());
console.log(tankLayoutManager.getStats());
```

---

## 📊 系统概览

```
用户画鱼 → 提交时附带名字 + 个性
                 ↓
鱼存储到数据库，包含 personality_type
                 ↓
每5分钟：社区聊天管理器
                 ↓
选择 5-8 条鱼 → 调用 COZE AI → 生成对话
                 ↓
消息排队 → 依次显示（间隔6秒）
                 ↓
对话气泡出现在鱼缸中，颜色匹配个性
```

---

## 🎨 个性颜色

- **Cheerful 开朗** 🟡 - 黄色/橙色渐变
- **Shy 害羞** 🔵 - 浅蓝色渐变  
- **Brave 勇敢** 🔴 - 红色/橙色渐变
- **Lazy 慵懒** 🟣 - 薰衣草色渐变

---

## 🔍 验证是否正常工作

### 检查控制台输出：
```
✅ Tank Layout Manager initialized
✅ Community Chat Manager initialized
Scheduling auto-chats every 5 minutes
Generating chat session: "Morning Greetings" with 6 fish
[1/7] Bubbles: Good morning everyone! 🌅
[2/7] Shadow: Um... morning. *swims quietly*
...
```

### 检查浏览器：
- 应该能看到鱼上方的对话气泡
- 气泡平滑淡入
- 每6秒一个新气泡
- 不同个性有不同颜色
- 气泡永不与鱼重叠

### 检查数据库：
```sql
-- 验证字段已添加
SELECT fish_name, personality_type FROM fish LIMIT 5;

-- 检查聊天会话
SELECT * FROM community_chat_sessions ORDER BY created_at DESC LIMIT 3;
```

---

## 🐛 常见问题

### 没有对话出现？

```javascript
// 检查管理器是否初始化
console.log(tankLayoutManager, communityChatManager);

// 检查符合条件的鱼
console.log('Fish with names:', fishes.filter(f => f.fish_name).length);
```

### COZE API 错误？

- 检查 `COZE_API_KEY` 设置是否正确
- 验证 `COZE_BOT_ID` 是否匹配你的机器人
- 查看浏览器开发工具中的网络标签
- 如果 API 失败，系统会使用备用对话

### 数据库错误？

```sql
-- 验证迁移成功运行
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'fish' AND column_name = 'fish_name';
-- 应该返回1行
```

---

## 📚 完整文档

- **实施进度：** `IMPLEMENTATION_PROGRESS.md`（详细）
- **实施摘要：** `IMPLEMENTATION_SUMMARY.md`（概览）
- **数据库迁移：** `scripts/MIGRATION_GUIDE_COMPLETE.md`
- **环境设置：** `ENV_SETUP_GUIDE.md`
- **本文件：** 快速参考

---

## 🎯 下一步（可选）

### 核心系统已完成！可选增强功能：

1. **调整自动聊天频率：**
```javascript
// 在 tank.js 中修改间隔：
communityChatManager.scheduleAutoChats(10); // 10分钟而不是5分钟
```

2. **添加手动触发按钮：**
```html
<button onclick="communityChatManager.startAutoChatSession()">
  开始社区聊天
</button>
```

3. **自定义对话颜色：**
```javascript
// 在 tank-layout-manager.js 中修改 getPersonalityColors()
```

4. **实现 Stripe 订阅**（Phase 4）
5. **添加设置页面**用于鱼的自定义（Phase 5）
6. **完全隐藏战斗 UI**（Phase 6）

---

## 💰 成本估算

**COZE API：**
- 每5分钟1次聊天 = 每天约288次聊天
- 每次聊天约 $0.002
- **每月约 $17-20**

**降低成本的技巧：**
- 将间隔增加到10-15分钟
- 更频繁地使用备用对话
- 实施缓存（Phase 8）

---

## ✅ 成功检查清单

- [ ] 数据库迁移已完成
- [ ] 环境变量已设置
- [ ] 开发服务器正在运行
- [ ] 在浏览器中打开了 tank.html
- [ ] 看到关于管理器初始化的控制台日志
- [ ] 等待10秒进行首次聊天
- [ ] 看到对话气泡出现
- [ ] 气泡有个性颜色
- [ ] 每约6秒出现新气泡
- [ ] 控制台无错误

---

## 🎉 完成！

你的鱼缸现在是一个**活跃的社交社区**，鱼儿们可以：
- 拥有独特的名字和个性
- 自然地相互聊天
- 展示精美的对话气泡
- 使用 AI 生成对话
- 创造生动、引人入胜的氛围

**欢迎来到 Fish Art 2.0！🐠💬**

---

## 📞 需要帮助？

1. 检查控制台日志（浏览器按 F12）
2. 查看 `IMPLEMENTATION_SUMMARY.md`
3. 查看 `MIGRATION_GUIDE_COMPLETE.md` 解决数据库问题
4. 查看网络标签检查 API 错误

**最常见的解决方法：** 添加环境变量后重启服务器！

