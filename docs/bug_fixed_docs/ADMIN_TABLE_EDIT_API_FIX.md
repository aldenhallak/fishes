# 管理员表编辑器 API 端点修复

## 问题描述

在访问 `http://localhost:3000/admin-table-edit.html?table=user_subscriptions` 时，页面显示错误：
```
⚠️ 错误：API endpoint not found
```

## 问题原因

前端表编辑器 (`admin-table-edit.html`) 调用了动态 API 端点 `/api/admin/tables/{tableName}`，但该路由在服务器上不存在。虽然后端处理器 `lib/api_handlers/admin/tables/[tableName].js` 已经实现，但缺少：
1. 对应的 API 路由文件
2. 服务器对嵌套动态路由的支持

## 解决方案

### 1. 创建嵌套目录结构
```bash
mkdir api\admin\tables
```

### 2. 创建动态路由文件

创建 `api/admin/tables/[tableName].js` 文件：

```javascript
const tableHandler = require('../../../lib/api_handlers/admin/tables/[tableName].js');

module.exports = async function handler(req, res) {
  try {
    const pathParts = req.url.split('?')[0].split('/');
    const tableName = pathParts[pathParts.length - 1];
    
    if (!tableName || tableName === 'tables') {
      return res.status(400).json({ 
        success: false,
        error: '缺少表名参数' 
      });
    }
    
    req.query = req.query || {};
    req.query.tableName = tableName;
    
    return await tableHandler(req, res);
  } catch (error) {
    console.error('[Admin Table API] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
```

### 3. 更新服务器路由处理逻辑

修改 `server.js` 中的动态路由处理，添加对嵌套动态路由的支持：

```javascript
// 检查动态路由 (例如 /api/profile/[userId] 或 /api/admin/tables/[tableName])
const pathParts = apiPath.split('/');
if (pathParts.length >= 2) {
  const basePath = pathParts.slice(0, -1).join('/');
  const dynamicParam = pathParts[pathParts.length - 1];
  
  let dynamicHandlerFile = null;
  let paramName = null;
  
  // 特殊处理：admin/tables/[tableName]
  if (basePath === 'admin/tables') {
    dynamicHandlerFile = `./api/${basePath}/[tableName].js`;
    paramName = 'tableName';
  }
  // profile/[userId]
  else if (pathParts[0] === 'profile') {
    dynamicHandlerFile = `./api/${basePath}/[userId].js`;
    paramName = 'userId';
  }
  // 默认使用 [id]
  else {
    dynamicHandlerFile = `./api/${basePath}/[id].js`;
    paramName = 'id';
  }
  
  if (dynamicHandlerFile && fs.existsSync(dynamicHandlerFile)) {
    const handler = require(dynamicHandlerFile);
    req.query = req.query || {};
    req.query[paramName] = dynamicParam;
    // ... 包装响应对象和调用处理器
  }
}
```

## 修复效果

### API 响应示例

**请求**：`GET /api/admin/tables/user_subscriptions?limit=5&offset=0`

**响应**：
```json
{
  "success": true,
  "data": {
    "tableName": "user_subscriptions",
    "columns": [
      {
        "name": "id",
        "type": "Int",
        "isNullable": true
      },
      {
        "name": "user_id",
        "type": "String",
        "isNullable": true
      },
      {
        "name": "plan",
        "type": "String",
        "isNullable": true
      },
      // ... 其他列
    ],
    "rows": [
      {
        "id": 32,
        "user_id": "f4933d0f-35a0-4aa1-8de5-ba407714b65c",
        "plan": "admin",
        "is_active": true,
        // ... 其他字段
      }
      // ... 其他行
    ],
    "pagination": {
      "limit": 5,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### 支持的操作

现在 API 支持完整的 CRUD 操作：

1. **GET** `/api/admin/tables/{tableName}` - 获取表数据
   - 参数：`limit`, `offset`, `order_by`, `order_direction`
   - 返回：列定义、行数据、分页信息

2. **PUT** `/api/admin/tables/{tableName}` - 批量更新
   - Body：`{ "updates": [{ "id": 1, "data": { "field": "value" } }] }`
   - 返回：更新结果和统计信息

3. **DELETE** `/api/admin/tables/{tableName}?ids=1,2,3` - 批量删除
   - 参数：`ids` (逗号分隔的ID列表)
   - 返回：删除结果和统计信息

## 功能验证

### 测试方法

1. **命令行测试**
   ```bash
   curl "http://localhost:3000/api/admin/tables/user_subscriptions?limit=5"
   ```

2. **浏览器测试**
   访问任意表编辑页面：
   - `http://localhost:3000/admin-table-edit.html?table=user_subscriptions`
   - `http://localhost:3000/admin-table-edit.html?table=fish`
   - `http://localhost:3000/admin-table-edit.html?table=users`
   - `http://localhost:3000/admin-table-edit.html?table=group_chat`

### 验证结果

- ✅ API 端点正常响应（状态码 200）
- ✅ 成功返回表结构信息（11 个列）
- ✅ 成功返回表数据（4 行记录）
- ✅ 分页功能正常
- ✅ 页面可以正常加载和编辑数据

## 文件变更

### 新增文件
- `api/admin/tables/[tableName].js` - 动态表数据 API 路由

### 修改文件
- `server.js` - 添加嵌套动态路由支持和调试日志

### 相关文件
- `lib/api_handlers/admin/tables/[tableName].js` - 后端处理器（已存在）
- `src/js/admin-table-editor.js` - 前端编辑器脚本（已存在）
- `admin-table-edit.html` - 前端编辑页面（已存在）

## 技术要点

### 动态路由匹配

服务器现在支持三种动态路由模式：
1. `/api/admin/tables/{tableName}` → `[tableName].js`
2. `/api/profile/{userId}` → `[userId].js`
3. 其他路径使用默认的 `[id].js`

### 路由参数传递

动态参数通过 `req.query` 对象传递给后端处理器：
```javascript
req.query.tableName = 'user_subscriptions';
```

### 调试支持

添加了详细的调试日志，方便排查路由问题：
```
[API] GET /api/admin/tables/user_subscriptions
[Dynamic Route Check] pathParts: ['admin', 'tables', 'user_subscriptions']
[Dynamic Route] basePath: admin/tables, dynamicParam: user_subscriptions
[Dynamic Route] Matched admin/tables pattern
[Dynamic Route] Checking file: ./api/admin/tables/[tableName].js, exists: true
```

## 修复日期
2025-11-27

## 状态
✅ 已修复并测试通过

## 后续建议

1. 移除或注释掉生产环境中的调试日志
2. 考虑添加速率限制和权限验证
3. 为危险表（如 `user_economy`）添加额外的操作确认

