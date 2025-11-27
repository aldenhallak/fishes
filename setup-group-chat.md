# 群聊功能一次性设置指南

## 🚀 快速执行

运行自动化脚本：
```bash
node setup-group-chat-complete.js
```

## 📋 手动步骤（如果需要）

### 1. 数据库迁移
如果脚本提示缺少字段，在 Hasura Console 执行：
```sql
ALTER TABLE group_chat ADD COLUMN initiator_user_id TEXT;
```

### 2. 添加外键约束（推荐）
```sql
ALTER TABLE group_chat 
ADD CONSTRAINT fk_group_chat_initiator_user 
FOREIGN KEY (initiator_user_id) REFERENCES users(id);
```

### 3. 设置 GraphQL 关联

#### 在 group_chat 表中添加 Object Relationship:
- **关联名**: `initiator_user`
- **字段映射**: `initiator_user_id` → `users.id`

#### 在 users 表中添加 Array Relationship:
- **关联名**: `initiated_group_chats`  
- **字段映射**: `id` → `group_chat.initiator_user_id`

## 🧪 验证步骤

1. **运行自动化脚本**：
   ```bash
   node setup-group-chat-complete.js
   ```

2. **测试浏览器功能**：
   - 打开 http://localhost:3000/tank.html
   - 打开浏览器开发者工具
   - 等待群聊自动触发
   - 检查控制台日志：`🎯 启动群聊：当前用户今日已用群聊数 X/5`

3. **验证使用量递增**：
   - 第一次应显示：`1/5`
   - 第二次应显示：`2/5`
   - 以此类推...

## 🔍 故障排查

### 问题：使用量始终显示 0/5
- **原因**: `initiator_user_id` 字段缺失或未正确保存
- **解决**: 运行自动化脚本检查和修复

### 问题：API 返回错误
- **检查**: 开发服务器是否运行 (`npm run dev`)
- **检查**: Hasura 连接是否正常
- **检查**: 环境变量配置是否正确

### 问题：外键约束冲突
- **原因**: 已存在无效的 `initiator_user_id` 数据
- **解决**: 清理无效数据或暂时不添加外键约束

## 📊 预期结果

执行完成后，你应该看到：
- ✅ initiator_user_id 字段已存在
- ✅ 基本群聊操作正常
- ✅ 使用量计算正确
- ✅ 群聊API正常工作
- 🎉 群聊功能设置完成！

## 🎯 下一步

1. 在浏览器中测试群聊功能
2. 观察使用量是否正确递增
3. 根据需要调整群聊间隔时间
4. 考虑添加更多的使用量限制逻辑
