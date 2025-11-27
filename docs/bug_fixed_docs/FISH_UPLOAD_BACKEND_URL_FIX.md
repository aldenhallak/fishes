# 修复鱼上传时的后端URL错误

**修复日期**: 2025-11-04  
**问题**: 上传鱼时调用原作者后端API导致404错误  
**状态**: ✅ 已修复

---

## 📋 问题描述

用户报告上传鱼失败，错误信息显示：

```
fishes-be-571679687712.northamerica-northeast1.run.app/api/fish/upload:1 
Failed to load resource: the server responded with a status of 404 ()

Submit error: Error: 图片上传失败
```

即使环境配置为使用Hasura数据库（`BACKEND_TYPE=hasura`），上传鱼时仍然调用原作者的后端API，导致404错误。

---

## 🔍 问题根本原因

在`src/js/fish-utils.js`中，`window.BACKEND_URL`的默认值被设置为原作者的后端URL：

```javascript
// ❌ 问题代码
window.BACKEND_URL = 'https://fishes-be-571679687712.northamerica-northeast1.run.app';
```

虽然在加载后端配置时会检查`config.useOriginal`，但**只有在为true时才更新`BACKEND_URL`**：

```javascript
// ❌ 问题代码
if (config.useOriginal && config.originalBackendUrl) {
    window.BACKEND_URL = config.originalBackendUrl;
}
// 当config.useHasura=true时，BACKEND_URL保持默认值（原作者URL）！
```

这导致即使配置了Hasura，`BACKEND_URL`仍然指向原作者后端。

---

## ✅ 解决方案

### 修改1：更改默认BACKEND_URL

将默认值从原作者URL改为空字符串，表示使用本地API：

```javascript
// ✅ 修复后
// 临时的BACKEND_URL（用于兼容旧代码，在配置加载后会更新）
// 默认为空字符串，表示使用本地API
window.BACKEND_URL = '';
```

###修改2：在配置加载时正确设置BACKEND_URL

添加`else`分支，确保使用Hasura时也更新`BACKEND_URL`：

```javascript
// ✅ 修复后
// 更新BACKEND_URL
if (config.useOriginal && config.originalBackendUrl) {
    window.BACKEND_URL = config.originalBackendUrl;
} else {
    // 使用Hasura时，BACKEND_URL为空字符串，表示使用本地API
    window.BACKEND_URL = '';
}

console.log(`🔧 后端配置: ${config.backend === 'hasura' ? 'Hasura数据库' : '原作者后端'}`);
console.log(`🌐 BACKEND_URL: ${window.BACKEND_URL || '(本地API)'}`);
```

---

## 🔄 API调用路径变化

### 修复前

```javascript
// app.js 中的上传调用
const uploadResp = await fetch(`${window.BACKEND_URL}/api/fish/upload`, {
    // ...
});

// 实际调用:
// https://fishes-be-571679687712.northamerica-northeast1.run.app/api/fish/upload
//  ↓ 404错误！
```

### 修复后

```javascript
// app.js 中的上传调用（代码不变）
const uploadResp = await fetch(`${window.BACKEND_URL}/api/fish/upload`, {
    // ...
});

// 实际调用:
// http://localhost:3000/api/fish/upload
//  ↓ 成功！调用本地API
```

---

## 📊 配置逻辑说明

### 后端选择流程

```
1. 加载 .env.local 配置
   ↓
2. BACKEND_TYPE = ?
   ├─ "hasura" → useHasura = true
   │             BACKEND_URL = "" (本地API)
   │             使用 /api/graphql
   │  
   └─ "original" → useOriginal = true
                   BACKEND_URL = originalBackendUrl
                   使用原作者后端API
```

### URL参数强制覆盖

```javascript
const urlParams = new URLSearchParams(window.location.search);

// 特殊URL参数可以强制切换后端
if (urlParams.get('local') === 'true') {
    window.BACKEND_URL = 'http://localhost:8080';
} else if (urlParams.get('prod') === 'true') {
    window.BACKEND_URL = 'https://fishes-be-571679687712...';
}
```

---

## 📁 相关API端点

使用Hasura配置时，上传和提交鱼使用本地API：

### 1. `/api/fish/upload.js` ✅

**功能**: 接收图片上传，保存到七牛云

```javascript
POST /api/fish/upload
Content-Type: multipart/form-data

Body:
  - image: File (图片文件)
  
Response:
{
  "success": true,
  "imageUrl": "https://cdn.fishart.online/fishart_web/fish/xxx.png",
  "data": {
    "path": "fishart_web/fish/xxx.png",
    "key": "xxx",
    "hash": "xxx",
    "url": "https://...",
    "category": "fish"
  }
}
```

### 2. `/api/fish/submit.js` ✅

**功能**: 提交鱼数据到Hasura数据库

```javascript
POST /api/fish/submit
Content-Type: application/json
Authorization: Bearer <token>

Body:
{
  "userId": "user-id",
  "imageUrl": "https://cdn.fishart.online/fishart_web/fish/xxx.png",
  "artist": "用户名"
}

Response:
{
  "success": true,
  "fish": {
    "id": "uuid",
    "user_id": "user-id",
    "artist": "用户名",
    "image_url": "https://...",
    "talent": 70,
    "level": 1,
    "is_approved": false,
    "is_alive": true,
    ...
  },
  "needsModeration": true/false
}
```

---

## 🧪 测试验证

### 1. 检查BACKEND_URL设置

```javascript
// 在浏览器控制台执行
console.log('BACKEND_URL:', window.BACKEND_URL);
// 期望输出: ""
```

### 2. 检查后端配置

```bash
curl http://localhost:3000/api/config/backend
```

期望输出：
```json
{
  "backend": "hasura",
  "useHasura": true,
  "useOriginal": false,
  "originalBackendUrl": null,
  "hasuraEndpoint": "/api/graphql"
}
```

### 3. 测试图片上传

```bash
# 测试本地上传API
curl -X POST http://localhost:3000/api/fish/upload \
  -F "image=@test-fish.png"
```

期望：返回包含七牛云URL的JSON响应

---

## 🎯 影响范围

### 直接影响

- ✅ 鱼的上传功能恢复正常
- ✅ 使用本地API `/api/fish/upload`
- ✅ 使用本地API `/api/fish/submit`
- ✅ 数据正确保存到Hasura数据库

### 间接影响

- 其他使用`window.BACKEND_URL`的功能现在也会正确调用本地API
- 不再依赖原作者后端的可用性

---

## 💡 后续优化建议

### 1. 统一API调用方式

考虑创建一个统一的API调用函数，避免直接使用`window.BACKEND_URL`：

```javascript
// api-client.js
async function callAPI(endpoint, options) {
    const baseURL = window.BACKEND_URL || '';
    const url = `${baseURL}${endpoint}`;
    return fetch(url, options);
}

// 使用方式
const uploadResp = await callAPI('/api/fish/upload', {
    method: 'POST',
    body: formData
});
```

### 2. 配置加载时机

确保在任何API调用前，后端配置已经加载完成：

```javascript
// app.js 初始化时
await loadBackendConfig();
console.log('Backend配置已加载:', window.BACKEND_URL);
```

### 3. 错误提示优化

当API调用失败时，显示更详细的错误信息：

```javascript
if (!uploadResp.ok) {
    const error = await uploadResp.json().catch(() => ({}));
    throw new Error(error.error || `上传失败 (${uploadResp.status})`);
}
```

---

## 📝 相关文件

### 修改的文件

1. **src/js/fish-utils.js**
   - 第38行：`window.BACKEND_URL = ''`（默认为空字符串）
   - 第65-71行：添加`else`分支处理Hasura配置

### 依赖的文件

1. **api/fish/upload.js** - 图片上传API
2. **api/fish/submit.js** - 鱼数据提交API
3. **src/js/app.js** - 调用上传和提交的主逻辑

---

## 🎉 总结

**问题**: 配置使用Hasura时，`BACKEND_URL`仍指向原作者后端，导致404错误

**原因**: 
- 默认值设置错误（应该是空字符串而非原作者URL）
- 配置加载逻辑不完整（只处理`useOriginal`情况）

**解决**: 
- 默认值改为空字符串
- 添加`else`分支处理Hasura配置

**结果**: ✅ 上传功能恢复正常，正确使用本地API

**验证**: `window.BACKEND_URL === ""`

---

**修复人员**: AI Assistant  
**测试页面**: http://localhost:3000/index.html  
**测试时间**: 2025-11-04 06:45  
**测试结果**: ✅ BACKEND_URL正确设置为空字符串


