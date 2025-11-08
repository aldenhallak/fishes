# Fish Chat API 500错误修复

## 问题描述
- `/api/fish/chat/group` 返回 500 Internal Server Error
- `/api/fish/chat/monologue` 返回 500 Internal Server Error
- 鱼缸页面显示 "Failed to load resource: the server responded with a status of 500"

## 问题原因

### 1. 缺少 `executeGraphQL` 函数
`lib/hasura.js` 中只导出了 `query` 和 `mutation` 函数，但新的API文件使用了 `executeGraphQL` 函数。

### 2. 返回格式不匹配
API代码期望 `executeGraphQL` 返回完整的 `{data, errors}` 对象，但原来的 `query` 函数只返回 `data` 部分。

### 3. 服务器未重启
新创建的API文件需要重启开发服务器才能被Vercel dev识别。

## 解决方案

### 1. 修复 `lib/hasura.js`

创建了真正的 `executeGraphQL` 函数：

```javascript
/**
 * 执行GraphQL查询 - 返回完整的result对象（包含data和errors）
 */
async function executeGraphQL(query, variables = {}) {
  try {
    const response = await fetch(HASURA_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result; // 返回完整结果包含data和errors
  } catch (error) {
    console.error('Hasura query error:', error);
    throw error;
  }
}
```

### 2. 更新导出

```javascript
module.exports = {
  executeGraphQL, // 返回完整 {data, errors}
  query,          // 返回 result.data
  mutation,
  // ... other exports
};
```

### 3. 重启开发服务器

**请执行以下步骤：**

1. 停止当前运行的开发服务器（Ctrl+C）
2. 重新启动：
   ```bash
   node dev-server.js
   # 或
   vercel dev
   # 或
   npm run dev
   ```

## 验证

重启服务器后：

1. 访问 `http://localhost:3000/tank.html?capacity=50`
2. 检查浏览器控制台，应该不再看到500错误
3. 应该看到：
   - 群聊功能正常工作（每5分钟一次）
   - 自语功能正常工作（每15秒一次）
   - 聊天内容显示在鱼缸界面上

## 测试命令

手动测试API：

```bash
# 测试群聊API
curl http://localhost:3000/api/fish/chat/group

# 测试自语API
curl http://localhost:3000/api/fish/chat/monologue
```

## 相关文件
- `lib/hasura.js` - 修复executeGraphQL函数
- `api/fish/chat/group.js` - 群聊API
- `api/fish/chat/monologue.js` - 自语API
- `lib/global-params.js` - 全局参数工具

## 时间
2025-11-08




