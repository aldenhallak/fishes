# 鱼聊天功能实现说明

## 功能概述

鱼聊天功能让鱼缸内的鱼能够进行两种形式的"交流"：
1. **群聊（Group Chat）**: 多条鱼通过Coze AI生成对话
2. **自语（Monologue）**: 单条鱼随机说出预设的独白

---

## 架构设计

### 整体流程

```
用户画鱼 → 上传成功 → 弹窗收集信息 → 合规检测 → 保存信息 → 进入鱼缸
                                                      ↓
                                            鱼缸页面定时触发聊天
                                                      ↓
                                            ┌─────────┴─────────┐
                                            │                   │
                                        群聊（30s）         自语（10s）
                                            │                   │
                                    Coze AI生成        预置内容随机
```

### 核心组件

1. **前端**:
   - `src/js/fish-info-modal.js`: 鱼信息收集弹窗
   - `src/js/app.js`: 画鱼提交逻辑
   - `test-coze-comprehensive.html`: Parameters测试页

2. **后端API**:
   - `api/fish/moderation/check.js`: 内容合规检测
   - `api/fish/update-info.js`: 更新鱼和用户信息
   - `api/fish/chat/group.js`: 群聊生成
   - `api/fish/chat/monologue.js`: 自语生成

3. **工具库**:
   - `lib/global-params.js`: 读取全局配置参数
   - `lib/hasura.js`: GraphQL查询执行

4. **数据库**:
   - `fish` 表: 增加 `personality` 字段
   - `users` 表: 增加 `feeder_name`, `feeder_info` 字段
   - `fish_monologues` 表: 存储预置自语内容（英文）
   - `global_params` 表: 存储系统参数

---

## 详细实现

### 1. 画鱼成功弹窗

**文件**: `src/js/fish-info-modal.js`

**流程**:
1. 用户完成画鱼并上传成功
2. 显示弹窗，要求输入：
   - 鱼名 (必填)
   - 个性 (必填)
   - 主人昵称 (可选)
   - 主人信息 (可选)
3. 点击确认后调用合规检测API
4. 检测通过后更新数据库
5. 显示成功消息并跳转到鱼缸

**关键代码**:
```javascript
window.showFishInfoModal(fishId, imageUrl, () => {
    // 完成后的回调
    showSuccessModal(uploadResult.imageUrl, needsModeration);
});
```

**UI特点**:
- 美观的卡片式设计
- 实时表单验证
- 加载状态提示
- 错误信息显示

---

### 2. 内容合规检测

**文件**: `api/fish/moderation/check.js`

**流程**:
1. 接收 personality, feeder_name, feeder_info
2. 对每个非空字段调用Coze审核Bot
3. 创建会话 → 发送消息 → 轮询结果
4. 解析AI返回的JSON格式判断
5. 汇总结果返回

**Coze Bot要求**:
返回格式：
```json
{
  "is_compliant": true/false,
  "reason": "explanation or empty"
}
```

**环境变量**:
```
COZE_MODERATION_BOT_ID=your-moderation-bot-id
```

---

### 3. 鱼信息更新

**文件**: `api/fish/update-info.js`

**流程**:
1. 验证必填字段
2. 更新 `fish` 表的 `fish_name` 和 `personality`
3. 更新 `users` 表的 `feeder_name` 和 `feeder_info`
4. 返回更新后的鱼信息

**GraphQL Mutation**:
```graphql
mutation UpdateFish($fishId: uuid!, $fishName: String!, $personality: String!) {
  update_fish_by_pk(
    pk_columns: { id: $fishId },
    _set: { fish_name: $fishName, personality: $personality }
  ) {
    id
    fish_name
    personality
    updated_at
  }
}
```

---

### 4. 群聊生成

**文件**: `api/fish/chat/group.js`

**流程**:
1. 从 `global_params` 读取 `fish_chat_participant_count` (默认5)
2. 从鱼缸随机选取N条已审核的鱼
3. 查询鱼的 `personality` 和用户的 `feeder_name`, `feeder_info`
4. 构造 `fish_array` 参数
5. 调用Coze API，传递 `custom_variables: { fish_array }`
6. 轮询获取AI生成的对话
7. 解析并返回对话内容

**Coze Parameters格式**:
```json
{
  "custom_variables": {
    "fish_array": [
      {
        "fish_id": "uuid",
        "fish_name": "Nemo",
        "personality": "cheerful",
        "feeder_name": "Ocean Lover",
        "feeder_info": "An artist..."
      }
    ]
  }
}
```

**AI Prompt**:
```
Generate a lively group chat conversation for these fish in the tank. 
Each fish should speak 1-2 times, reflecting their personality 
and occasionally mentioning their owner.
```

**Coze Bot配置建议**:
- 在对话流中访问 `{{fish_array}}`
- 使用循环处理每条鱼
- 输出JSON格式的对话数组

---

### 5. 自语生成

**文件**: `api/fish/chat/monologue.js`

**流程**:
1. 从鱼缸随机选取1条已审核的鱼
2. 根据鱼的 `personality` 查询 `fish_monologues` 表
3. 随机返回一条自语内容
4. 如果该个性无内容，fallback到 `default` 个性
5. 如果还没有，使用硬编码的默认自语

**查询优先级**:
1. 匹配的 personality (e.g., "cheerful")
2. "default" personality
3. 硬编码 fallback

**自语内容特点**:
- 全英文
- 美式动画幽默风格（参考Finding Nemo, Zootopia等）
- 按个性分类（cheerful, shy, brave, lazy, default）
- 每种个性15条，default 10条

**预置内容示例**:
```
cheerful: "Oh boy, oh boy! Today is going to be AMAZING!"
shy: "Um... is anyone watching me? I hope not. *hides behind plant*"
brave: "Fear? Never heard of it. I only know ADVENTURE!"
lazy: "Zzz... Oh, did I doze off again? My bad. Zzz..."
```

---

### 6. 全局参数管理

**文件**: `lib/global-params.js`

**功能**:
- 读取 `global_params` 表中的配置
- 60秒缓存，避免频繁查询
- 提供类型转换方法（Int, Float, Bool）

**使用示例**:
```javascript
const { getGlobalParamInt } = require('./lib/global-params');

const count = await getGlobalParamInt('fish_chat_participant_count', 5);
```

**预置参数**:
```sql
INSERT INTO global_params (key, value, description) VALUES
  ('fish_chat_participant_count', '5', 'Number of fish in group chat'),
  ('group_chat_interval_ms', '30000', 'Group chat interval (30s)'),
  ('monologue_interval_ms', '10000', 'Monologue interval (10s)');
```

---

## 前端集成

### 定时触发聊天

在鱼缸页面（如 `tank.html`）中：

```javascript
// 群聊定时器（30秒）
setInterval(async () => {
    try {
        const response = await fetch('/api/fish/chat/group');
        const data = await response.json();
        
        if (data.success) {
            displayGroupChat(data.dialogues);
        }
    } catch (error) {
        console.error('Group chat error:', error);
    }
}, 30000);

// 自语定时器（10秒）
setInterval(async () => {
    try {
        const response = await fetch('/api/fish/chat/monologue');
        const data = await response.json();
        
        if (data.success) {
            displayMonologue(data.fish, data.message);
        }
    } catch (error) {
        console.error('Monologue error:', error);
    }
}, 10000);
```

### 显示聊天内容

建议UI实现：
- 群聊：气泡对话框，显示鱼名和消息
- 自语：单个气泡，淡入淡出效果
- 位置：固定在屏幕底部或鱼缸某个区域
- 动画：平滑过渡，不干扰主界面

---

## 测试

### 1. Parameters测试

使用 `test-coze-comprehensive.html`:
1. 填写API Key和Bot ID
2. 加载示例鱼数组
3. 验证JSON格式
4. 发送测试请求
5. 查看AI回复

### 2. 完整流程测试

1. **画鱼测试**:
   - 打开 `index.html`
   - 画一条鱼并提交
   - 验证弹窗显示
   - 填写信息（测试违规内容）
   - 确认保存

2. **群聊测试**:
   ```bash
   curl http://localhost:3000/api/fish/chat/group
   ```

3. **自语测试**:
   ```bash
   curl http://localhost:3000/api/fish/chat/monologue
   ```

4. **合规检测测试**:
   ```bash
   curl -X POST http://localhost:3000/api/fish/moderation/check \
     -H "Content-Type: application/json" \
     -d '{"personality":"inappropriate content here"}'
   ```

---

## 部署清单

### 环境变量

`.env.local`:
```
COZE_API_KEY=your-api-key
COZE_BOT_ID=group-chat-bot-id
COZE_MODERATION_BOT_ID=moderation-bot-id
COZE_API_BASE_URL=https://api.coze.cn
```

### 数据库迁移

1. 执行 `scripts/add-fish-chat-features.sql`
2. 在Hasura Console重新Track表和字段
3. 验证GraphQL schema

### 前端部署

1. 确保 `src/js/fish-info-modal.js` 被引入
2. 在 `index.html` 中添加script标签
3. 清除浏览器缓存测试

### 后端部署

1. 确保所有API文件已部署
2. 重启Node.js服务
3. 测试API端点

---

## 性能优化

1. **缓存策略**:
   - Global params缓存60秒
   - 考虑添加Redis缓存群聊结果（避免短时间内重复生成）

2. **数据库优化**:
   - `fish_monologues` 表添加 `personality` 索引（已添加）
   - `fish` 表查询限制数量

3. **Coze API**:
   - 设置合理的轮询超时
   - 考虑使用stream模式加快响应（未来优化）

4. **前端优化**:
   - 聊天内容本地缓存
   - 控制DOM更新频率
   - 使用requestAnimationFrame做动画

---

## 已知问题与TODO

### 已知问题
- [ ] Coze轮询可能超时（15次*2s=30s），需要前端优雅处理
- [ ] 自语内容目前固定75条，后续可能需要更多
- [ ] 群聊AI输出格式不稳定，需要robust parsing

### 未来优化
- [ ] 添加聊天历史记录表，保存生成的对话
- [ ] 支持用户点赞/举报聊天内容
- [ ] 实现更复杂的对话主题（节日、天气等）
- [ ] 支持多语言自语内容
- [ ] 添加管理后台可视化编辑自语内容

---

## 参考资料

- [Coze API v3文档](https://www.coze.cn/open/docs/developer_guides/chat_v3)
- [Hasura GraphQL API](https://hasura.io/docs/latest/graphql/core/api-reference/graphql-api/)
- [美式幽默文化参考](https://tvtropes.org/pmwiki/pmwiki.php/Main/Cloudcuckoolander)

---

**文档版本**: 1.0  
**创建日期**: 2025-11-08  
**作者**: AI Assistant  
**最后更新**: 2025-11-08

