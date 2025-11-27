# 鱼编辑和删除功能测试指南

## 功能概述

此功能允许用户在 `rank.html?userId=xxx` 页面编辑和删除自己的鱼，包括：
- 修改鱼的名称
- 修改鱼的个性（预设或自定义）
- 删除鱼（软删除）

## 测试前准备

1. 启动开发服务器：
```bash
node server.js
```

2. 确保服务器运行在 http://localhost:3000

3. 确保你已经登录并且有自己创建的鱼

## 测试步骤

### 1. 访问Rank页面

访问任意用户的rank页面（包括你自己的）：
```
http://localhost:3000/rank.html?userId=YOUR_USER_ID
```

或者直接访问rank页面查看所有鱼：
```
http://localhost:3000/rank.html
```

### 2. 识别自己的鱼

- 你自己的鱼会有高亮显示（`user-fish-highlight` class）
- 你的鱼卡片上会显示 **✏️ 编辑** 和 **🗑️ 删除** 按钮
- 其他用户的鱼会显示 **🚩 举报** 按钮

### 3. 测试编辑功能

#### 3.1 编辑鱼名称
1. 点击你的鱼卡片上的 **✏️ 编辑** 按钮
2. 在弹出的模态框中，修改鱼的名称
3. 名称最多30个字符
4. 点击 **Save Changes** 保存
5. 验证：页面应该刷新，鱼卡片显示新名称

#### 3.2 编辑预设个性
1. 点击 **✏️ 编辑** 按钮
2. 从下拉菜单中选择一个预设个性（如 Funny, Cheerful, Brave等）
3. 点击 **Save Changes** 保存
4. 验证：保存成功并刷新页面

#### 3.3 编辑自定义个性（付费会员）
1. 点击 **✏️ 编辑** 按钮
2. 从下拉菜单选择 **✨ Custom**
3. 如果你是 **Premium** 或 **Plus** 会员：
   - 会看到自定义个性输入框（可用）
   - 输入自定义个性描述（最多50字符）
   - 点击 **Save Changes** 保存
   - 验证：保存成功
4. 如果你是 **Free** 会员：
   - 会看到自定义个性输入框（禁用状态）
   - 会看到升级提示
   - 尝试保存会收到权限错误

### 4. 测试删除功能

1. 点击你的鱼卡片上的 **🗑️ 删除** 按钮
2. 在确认对话框中阅读警告信息
3. 点击 **Delete Forever** 确认删除
4. 验证：
   - 鱼卡片从页面上淡出并移除
   - 显示成功提示
   - 鱼的 `is_alive` 字段在数据库中设置为 `false`

### 5. 权限测试

#### 5.1 无法编辑其他用户的鱼
- 其他用户的鱼卡片不显示编辑/删除按钮
- 只显示举报按钮

#### 5.2 API权限验证
尝试通过API直接编辑其他用户的鱼（使用工具如Postman）：
```
POST http://localhost:3000/api/fish-api?action=update-info
Content-Type: application/json

{
  "fishId": "OTHER_USER_FISH_ID",
  "fishName": "Hacked Name",
  "personality": "funny",
  "userId": "YOUR_USER_ID"
}
```

预期结果：返回 403 错误 "You do not have permission to edit this fish"

#### 5.3 自定义个性权限验证
作为免费用户尝试保存自定义个性：
```
POST http://localhost:3000/api/fish-api?action=update-info
Content-Type: application/json

{
  "fishId": "YOUR_FISH_ID",
  "fishName": "My Fish",
  "personality": "Custom personality text",
  "isCustomPersonality": true,
  "userId": "YOUR_USER_ID"
}
```

预期结果：返回 403 错误 "Custom personalities are only available for Premium and Plus members"

## API端点

### 更新鱼信息
```
POST /api/fish-api?action=update-info

请求体：
{
  "fishId": "uuid",
  "fishName": "string (max 30)",
  "personality": "string",
  "isCustomPersonality": boolean,
  "userId": "string"
}

响应：
{
  "success": true,
  "message": "Fish information updated successfully",
  "fish": { ... }
}
```

### 删除鱼
```
POST /api/fish-api?action=delete

请求体：
{
  "fishId": "uuid",
  "userId": "string"
}

响应：
{
  "success": true,
  "message": "Fish deleted successfully",
  "fish": { ... }
}
```

## 错误处理测试

### 1. 字段验证
- 空名称：应返回错误
- 名称超过30字符：应返回错误
- 自定义个性超过50字符：应返回错误

### 2. 权限错误
- 编辑其他用户的鱼：403错误
- 免费用户使用自定义个性：403错误

### 3. 未找到资源
- 不存在的fishId：404错误

### 4. 网络错误
- 服务器离线时点击保存：显示友好的错误提示

## 预期的预设个性列表

- 🎲 Random
- 😂 Funny
- 😊 Cheerful
- 💪 Brave
- 🎮 Playful
- 🔍 Curious
- ⚡ Energetic
- 😌 Calm
- 🌸 Gentle
- 😏 Sarcastic
- 🎭 Dramatic
- 🦋 Naive
- 😳 Shy
- 😰 Anxious
- 🤨 Stubborn
- 😐 Serious
- 😴 Lazy
- 😠 Grumpy
- 👊 Aggressive
- 🙄 Cynical
- 🐻 Crude

## 成功标准

✅ 用户可以在自己的鱼卡片上看到编辑和删除按钮  
✅ 编辑模态框正确显示当前鱼的名称和个性  
✅ 可以成功修改鱼的名称  
✅ 可以成功选择预设个性  
✅ 付费会员可以使用自定义个性  
✅ 免费会员看到自定义个性升级提示  
✅ 删除功能正常工作，鱼从页面移除  
✅ 所有权限验证正常工作  
✅ 错误提示清晰友好  
✅ UI响应流畅，无明显延迟  

## 已知限制

1. 删除是软删除（`is_alive = false`），鱼数据仍保留在数据库中
2. 自定义个性仅对 Premium 和 Plus 会员可用
3. 编辑后页面会刷新以显示更新的数据

## 数据库验证

编辑后检查数据库：
```sql
-- 查看鱼的信息
SELECT id, fish_name, personality, is_alive, updated_at 
FROM fish 
WHERE id = 'YOUR_FISH_ID';

-- 查看用户会员状态
SELECT u.id, us.plan, us.is_active
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE u.id = 'YOUR_USER_ID' AND us.is_active = true
ORDER BY us.created_at DESC
LIMIT 1;
```

## 问题排查

### 编辑按钮不显示
- 确认你已登录
- 确认这是你自己创建的鱼
- 检查浏览器控制台是否有JavaScript错误

### 保存失败
- 检查浏览器Network标签查看API响应
- 检查服务器日志查看详细错误信息
- 确认数据库连接正常

### 自定义个性不可用
- 确认你的会员等级
- 确认 `user_subscriptions` 表中有活跃的订阅记录
- 检查 `is_active = true` 字段

