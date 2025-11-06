# Rank Page 调试指南

## 问题描述

在访问 `http://localhost:3000/rank.html?userId=11312701-f1d2-43f8-a13d-260eac812b7a` 时，看不到用户的鱼。

## 快速诊断步骤

### 1. 运行诊断脚本

1. 访问 `http://localhost:3000/rank.html?userId=YOUR_USER_ID`
2. 打开浏览器开发者工具 (F12)
3. 切换到 Console 标签
4. 复制粘贴以下脚本并运行：

```javascript
// 将 debug-rank-page.js 的内容粘贴到控制台
```

或者直接在控制台运行：

```javascript
(async function debugRankPage() {
  console.log('🔍 开始诊断 rank.html 页面...');
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');
  console.log('userId:', userId);
  
  // 测试 GraphQL API
  const query = `
    query GetUserFish($userId: String!) {
      fish(where: { user_id: { _eq: $userId }, is_approved: { _eq: true } }, limit: 5) {
        id
        artist
        image_url
        created_at
      }
    }
  `;
  
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { userId } })
  });
  
  const result = await response.json();
  console.log('API 响应:', result);
  console.log('鱼数量:', result.data?.fish?.length || 0);
})();
```

### 2. 检查常见问题

#### 问题 1: userId 参数缺失或错误

**症状**: URL 中没有 `userId` 参数，或者 userId 格式不正确

**解决方法**: 
- 确保 URL 格式正确：`http://localhost:3000/rank.html?userId=YOUR_USER_ID`
- userId 应该是 UUID 格式，例如：`11312701-f1d2-43f8-a13d-260eac812b7a`

#### 问题 2: GraphQL API 返回空数据

**症状**: API 请求成功，但 `result.data.fish` 为空数组

**可能原因**:
1. 该用户没有已批准的鱼 (`is_approved = true`)
2. 数据库中没有该用户的鱼
3. userId 不匹配

**检查方法**:
```javascript
// 在控制台运行
(async function() {
  const userId = new URLSearchParams(window.location.search).get('userId');
  
  // 查询该用户的所有鱼（包括未批准的）
  const query = `
    query GetAllUserFish($userId: String!) {
      fish(where: { user_id: { _eq: $userId } }) {
        id
        artist
        is_approved
        is_alive
        created_at
      }
    }
  `;
  
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { userId } })
  });
  
  const result = await response.json();
  console.log('该用户的所有鱼:', result.data.fish);
  console.log('已批准的鱼:', result.data.fish.filter(f => f.is_approved));
})();
```

#### 问题 3: GraphQL API 请求失败

**症状**: 控制台显示网络错误或 500 错误

**解决方法**:
1. 检查后端服务器是否运行：`npm run dev`
2. 检查 `.env.local` 配置：
   - `HASURA_GRAPHQL_ENDPOINT` 是否正确
   - `HASURA_ADMIN_SECRET` 是否正确
3. 查看后端服务器终端的错误日志

#### 问题 4: 鱼未批准 (is_approved = false)

**症状**: 数据库中有用户的鱼，但 rank.html 不显示

**原因**: rank.html 的查询条件中包含 `is_approved: { _eq: true }`，只显示已批准的鱼

**解决方法**:
1. 在 Hasura Console 中手动批准鱼：
   ```sql
   UPDATE fish 
   SET is_approved = true 
   WHERE user_id = 'YOUR_USER_ID';
   ```

2. 或者临时修改查询条件（仅用于测试）：
   - 打开 `src/js/fish-utils.js`
   - 找到 `getFishFromHasura` 函数
   - 在第 362 行，将 `is_approved: { _eq: true }` 改为 `is_approved: { _eq: true, _is_null: false }`
   - 或者直接删除这个条件（会显示所有鱼）

### 3. 验证数据库中的鱼

在 Hasura Console 中运行以下查询：

```graphql
query GetUserFish {
  fish(where: { user_id: { _eq: "11312701-f1d2-43f8-a13d-260eac812b7a" } }) {
    id
    artist
    image_url
    created_at
    is_approved
    is_alive
    user_id
  }
}
```

如果返回空结果，说明该用户确实没有鱼。

### 4. 测试修复

如果所有检查都通过，但仍然看不到鱼，请：

1. 清空浏览器缓存
2. 强制刷新页面 (Ctrl + Shift + R)
3. 检查是否有 JavaScript 错误
4. 查看 Network 标签中的 GraphQL 请求和响应

## 常见错误信息

### "field not found" 错误

```
field 'XXX' not found in type: 'fish'
```

**解决方法**: 检查 GraphQL 查询中请求的字段是否在 Hasura schema 中存在。

### CORS 错误

```
Access to fetch at '...' has been blocked by CORS policy
```

**解决方法**: rank.html 使用 `/api/graphql` 代理，不应该出现 CORS 错误。如果出现，检查是否直接访问了 Hasura URL。

### 401 Unauthorized

```
JWTExpired / JWTInvalid
```

**解决方法**: 这通常不影响公开的 rank.html 页面，因为它使用 admin secret 查询数据。

## 相关文件

- **前端**: `rank.html`, `src/js/rank.js`, `src/js/fish-utils.js`
- **后端**: `api/graphql.js`
- **配置**: `.env.local`

## 联系支持

如果问题仍然存在，请提供：
1. 浏览器控制台的完整错误信息
2. 诊断脚本的输出
3. Network 标签中的 GraphQL 请求和响应
4. 后端服务器终端的日志








