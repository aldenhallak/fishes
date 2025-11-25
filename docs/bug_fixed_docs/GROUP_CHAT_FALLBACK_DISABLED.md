# 群聊Fallback机制禁用修复

## 问题描述
群聊系统在API调用失败时会自动启用fallback模式，显示预设的简单对话。用户要求禁用这个fallback机制，当API失败时应该直接失败而不是使用备用方案。

## 错误日志
```
POST http://127.0.0.1:53308/api/fish-api?action=group-chat 500 (Internal Server Error)
Failed to generate chat session: Error: API error: Internal Server Error
⚠️ 群聊使用了fallback模式，未保存到数据库，不会计入使用统计
```

## 根本原因
`community-chat-manager.js`中的`generateChatSession`方法在多个地方调用`generateFallbackSession()`作为备用方案：

1. **第182行**：用户未登录时
2. **第208行**：API返回403错误时  
3. **第238行**：API建议使用fallback时
4. **第293行**：catch块中API调用异常时

## 解决方案
修改所有fallback调用点，将`return this.generateFallbackSession()`改为`return null`：

### 1. 用户未登录处理
```javascript
// 修改前
if (!currentUserId) {
  console.log('❌ User not logged in, cannot generate AI group chat. Using fallback.');
  return this.generateFallbackSession();
}

// 修改后  
if (!currentUserId) {
  console.log('❌ User not logged in, cannot generate AI group chat. Fallback disabled.');
  return null;
}
```

### 2. API错误处理
```javascript
// 修改前
if (response.status === 403) {
  console.warn('API returned 403, using fallback chat');
  return this.generateFallbackSession();
}

// 修改后
if (response.status === 403) {
  console.warn('API returned 403, fallback disabled');
  return null;
}
```

### 3. API建议fallback处理
```javascript
// 修改前
if (data.useFallback) {
  console.warn('API suggests using fallback:', data.message);
  return this.generateFallbackSession();
}

// 修改后
if (data.useFallback) {
  console.warn('API suggests using fallback, but fallback is disabled:', data.message);
  return null;
}
```

### 4. 异常捕获处理
```javascript
// 修改前
} catch (error) {
  console.error('Failed to generate chat session:', error);
  return this.generateFallbackSession();
}

// 修改后
} catch (error) {
  console.error('Failed to generate chat session:', error);
  console.log('❌ Fallback disabled, returning null instead of fallback session');
  return null;
}
```

### 5. 更新startAutoChatSession方法
移除fallback模式检查逻辑：
```javascript
// 修改前
if (session) {
  if (!session.sessionId) {
    console.warn('⚠️ 群聊使用了fallback模式，未保存到数据库，不会计入使用统计');
  } else {
    console.log('✅ 群聊已保存到数据库，sessionId:', session.sessionId);
  }
  this.startSession(session);
} else {
  console.error('Failed to start chat session');
}

// 修改后
if (session) {
  console.log('✅ 群聊已保存到数据库，sessionId:', session.sessionId);
  this.startSession(session);
} else {
  console.log('❌ 群聊生成失败，fallback已禁用');
}
```

## 修改文件
1. **src/js/community-chat-manager.js**：
   - 第180-182行：用户未登录处理
   - 第205-208行：API 403错误处理
   - 第216-238行：API建议fallback处理
   - 第291-294行：异常捕获处理
   - 第576-581行：移除fallback检查逻辑

2. **tank.html**：
   - 第950行：版本号从v=2.0更新为v=2.1

## 预期结果
- API调用失败时不再显示fallback对话
- 控制台显示明确的"fallback已禁用"信息
- 群聊生成失败时直接失败，不会有任何对话显示
- 保留升级提示功能（当达到使用限制时）

## 验证步骤
1. 清除浏览器缓存（Ctrl+Shift+Delete）
2. 硬刷新页面（Ctrl+F5）
3. 触发API失败场景（如服务器错误、网络问题）
4. 确认控制台显示"fallback已禁用"而不是fallback对话
5. 确认页面上不会显示任何群聊对话

## 技术说明
- `generateFallbackSession()`方法仍然保留，以防将来需要重新启用
- 所有错误处理逻辑保持完整，只是返回null而不是fallback session
- 升级提示功能不受影响，仍会在达到使用限制时显示
