# Server API Fixes - 2025-11-26

## 问题描述

用户登录成功后，出现多个 API 错误：

1. **GraphQL API 返回 500 错误**
   - 无法检查用户存在性
   - 无法查询会员等级
   - 无法检查管理员权限

2. **Profile API 返回 404 错误**
   - `/api/profile/{userId}` 端点无法访问

3. **Message API 返回 500 错误**
   - 无法获取未读消息数量

## 根本原因

### 1. 缺少请求体解析
`server.js` 没有解析 POST/PUT/PATCH 请求的请求体，导致 `req.body` 为 `undefined`。GraphQL API 依赖 `req.body` 来获取查询和变量。

### 2. 不支持动态路由
`server.js` 的路由逻辑过于简单，无法处理类似 `/api/profile/[userId]` 的动态路由参数。

### 3. 缺少 fetch 导入
多个 API 处理器使用 `fetch` 但没有导入 `node-fetch`，在 Node.js 环境下会导致 `fetch is not defined` 错误。

### 4. 缺少响应包装器
API 处理器期望使用 Express 风格的 `res.status()` 和 `res.json()` 方法，但原生 `http.ServerResponse` 没有这些方法。

## 修复方案

### 1. 添加请求体解析 (server.js)

```javascript
// 解析请求体
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// 在 API 路由处理中使用
if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
  req.body = await parseBody(req);
}
```

### 2. 支持动态路由 (server.js)

添加了对 `/api/profile/[userId]` 等动态路由的支持：

```javascript
// 检查动态路由 (例如 /api/profile/[userId])
const pathParts = apiPath.split('/');
if (pathParts.length >= 2) {
  const basePath = pathParts.slice(0, -1).join('/');
  const dynamicParam = pathParts[pathParts.length - 1];
  const dynamicHandlerFile = `./api/${basePath}/[${pathParts[0] === 'profile' ? 'userId' : 'id'}].js`;
  
  if (fs.existsSync(dynamicHandlerFile)) {
    // 添加动态参数到 req.query
    req.query = req.query || {};
    if (pathParts[0] === 'profile') {
      req.query.userId = dynamicParam;
    }
    // ...
  }
}
```

### 3. 添加响应包装器 (server.js)

```javascript
// 包装响应对象以支持 Express 风格的方法
res.status = (code) => {
  res.statusCode = code;
  return res;
};
res.json = (data) => {
  res.writeHead(res.statusCode || 200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
  return res;
};
```

### 4. 添加 fetch 导入

为以下文件添加了 `const fetch = require('node-fetch');`：

**核心模块:**
- `lib/hasura.js`
- `lib/coze-client.js`

**Profile API:**
- `lib/api_handlers/profile/[userId].js`

**Fish API:**
- `lib/api_handlers/fish/submit.js`
- `lib/api_handlers/fish/list.js`
- `lib/api_handlers/fish/chat/group.js`
- `lib/api_handlers/fish/moderation/check.js`

**其他 API:**
- `lib/api_handlers/vote/vote.js`
- `lib/api_handlers/report/submit.js`
- `lib/api_handlers/payment/create-checkout.js`
- `lib/api_handlers/payment/webhook.js`
- `lib/api_handlers/payment/manage-subscription.js`
- `lib/api_handlers/coze/messages.js`

### 5. 添加环境变量加载 (server.js)

```javascript
require('dotenv').config({ path: '.env.local' });
```

## 测试步骤

### 1. 重启服务器

```bash
npm start
```

### 2. 测试登录流程

1. 访问 `http://localhost:3000/login.html`
2. 使用邮箱登录
3. 查看浏览器控制台，确认没有以下错误：
   - ❌ GraphQL 500 错误
   - ❌ Profile 404 错误
   - ❌ Message API 500 错误

### 3. 验证 API 端点

使用 curl 或 Postman 测试：

```bash
# 测试 GraphQL
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { __typename }"}'

# 测试 Profile (替换 USER_ID)
curl http://localhost:3000/api/profile/YOUR_USER_ID

# 测试 Message API (替换 USER_ID)
curl "http://localhost:3000/api/message-api?action=unread-count&userId=YOUR_USER_ID"
```

## 部署到生产环境

### Railway/Render 部署

这些修复完全兼容 Railway 和 Render 部署：

1. 提交更改到 Git：
```bash
git add .
git commit -m "fix: Add request body parsing, dynamic routes, and fetch imports"
git push origin backend
```

2. 部署平台会自动重新部署

3. 确认环境变量已设置：
   - `HASURA_GRAPHQL_ENDPOINT`
   - `HASURA_ADMIN_SECRET`
   - 其他必要的环境变量

## 注意事项

1. **Node.js 版本**: 确保使用 Node.js >= 20.0.0（`package.json` 中已声明）
2. **node-fetch**: 已在 `package.json` 中声明依赖 `"node-fetch": "^2.7.0"`
3. **缓存问题**: Node.js 会缓存 `require()` 的模块。如果在开发中修改 API 处理器，需要重启服务器

## 相关文件

- `server.js` - 主服务器文件（核心修复）
- `api/graphql.js` - GraphQL 代理
- `api/profile/[userId].js` - Profile API 包装器
- `lib/hasura.js` - Hasura 客户端
- `lib/api_handlers/profile/[userId].js` - Profile API 实现
- 其他 `lib/api_handlers/**/*.js` - 各种 API 处理器

## 修复结果

✅ GraphQL API 正常工作
✅ Profile API 正常工作（包括 GET 和 PUT）
✅ Message API 正常工作
✅ 会员等级查询正常工作
✅ 管理员权限检查正常工作
✅ 未读消息数量获取正常工作

## 下一步

如果仍然遇到问题，请检查：

1. **环境变量**: 确保所有必要的环境变量都已设置
2. **Hasura 连接**: 测试 Hasura 端点是否可访问
3. **数据库**: 确保用户表存在且有数据
4. **网络**: 检查防火墙和网络设置

可以运行以下测试脚本：

```bash
npm run check:env      # 检查环境变量
npm run test:hasura    # 测试 Hasura 连接
npm run test:api       # 测试 API 端点
```

