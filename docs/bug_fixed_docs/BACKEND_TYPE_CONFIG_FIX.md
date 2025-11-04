# 后端类型配置功能实现

## 问题描述

1. 用户设置了环境变量`FISHTANK_BACKEND=hasura`
2. 访问`tank.html`页面时仍然连接到原作者后端
3. 不清楚是否需要运行`npm run build`编译

## 根本原因

- `fishtanks.html`和`fishtank-view.html`使用的鱼缸API已经支持配置切换
- **但**`tank.html`、`rank.html`等页面使用的鱼数据API仍然硬编码连接原作者后端
- `tank.html`（公共鱼缸）和`fishtanks.html`（用户鱼缸集合）是两个不同的功能：
  - `tank.html` = 显示所有鱼在一个大鱼缸游动
  - `fishtanks.html` = 用户创建的鱼缸集合

## 解决方案

### 1. 统一环境变量命名

将`FISHTANK_BACKEND`改为更通用的`BACKEND_TYPE`：

```bash
# 旧变量（仅影响鱼缸功能）
FISHTANK_BACKEND=hasura

# 新变量（影响所有功能）
BACKEND_TYPE=hasura
```

向后兼容：仍支持`FISHTANK_BACKEND`变量。

### 2. 修改`fish-utils.js`

添加后端配置加载和选择逻辑：

```javascript
// 加载后端配置
async function loadBackendConfig() {
    const response = await fetch('/api/config/backend');
    const config = await response.json();
    // 根据配置更新BACKEND_URL
}

// 修改getFishBySort函数
async function getFishBySort(sortType, limit, ...) {
    await loadBackendConfig();
    
    // 根据配置选择后端
    if (backendConfig.useHasura) {
        return await getFishFromHasura(...);
    } else {
        return await getFishFromOriginal(...);
    }
}
```

### 3. 新增Hasura鱼数据查询

创建`getFishFromHasura`函数，使用GraphQL查询：

```javascript
async function getFishFromHasura(sortType, limit, offset, userId) {
    const query = `
        query GetFish($limit: Int!, $offset: Int!) {
            fish(
                where: { is_approved: { _eq: true } }
                limit: $limit
                offset: $offset
                order_by: { created_at: desc }
            ) {
                id
                artist
                image_url
                created_at
                upvotes
                downvotes
            }
        }
    `;
    // 发送GraphQL请求...
}
```

### 4. 创建统一配置API

`api/config/backend.js` - 返回全局后端配置：

```javascript
module.exports = async (req, res) => {
    const backendType = process.env.BACKEND_TYPE || 'hasura';
    res.json({
        backend: backendType,
        useHasura: backendType === 'hasura',
        originalBackendUrl: backendType === 'original' ? '...' : null
    });
};
```

## 实现细节

### 新增文件

1. **`api/config/backend.js`**
   - 全局后端配置API
   - 读取`BACKEND_TYPE`环境变量
   - 返回配置给前端

### 修改文件

1. **`src/js/fish-utils.js`**
   - 添加`loadBackendConfig()`函数
   - 添加`getFishFromHasura()`函数
   - 修改`getFishBySort()`支持动态后端选择
   - 修改`BACKEND_URL`为可配置

2. **`env.local.example`**
   - 将`FISHTANK_BACKEND`重命名为`BACKEND_TYPE`
   - 添加配置说明

3. **`api/config/fishtank.js`**
   - 支持`BACKEND_TYPE`变量
   - 向后兼容`FISHTANK_BACKEND`

### 影响范围

现在所有页面都支持后端配置：

- ✅ `tank.html` - 公共鱼缸
- ✅ `rank.html` - 排行榜
- ✅ `profile.html` - 用户资料
- ✅ `fishtanks.html` - 用户鱼缸集合
- ✅ `fishtank-view.html` - 查看鱼缸

## 使用方法

### 配置步骤

1. **创建`.env.local`文件**

```bash
copy env.local.example .env.local
```

2. **编辑配置**

使用Hasura：
```bash
BACKEND_TYPE=hasura
HASURA_GRAPHQL_ENDPOINT=https://your-project.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-secret
```

或使用原作者后端：
```bash
BACKEND_TYPE=original
```

3. **重启服务器**

```bash
# 停止服务器 (Ctrl+C)
npm run dev
```

4. **清除浏览器缓存**

- F12 → 右键刷新按钮 → "清空缓存并硬性重新加载"

### 验证配置

访问任何页面，查看控制台：

```
🔧 后端配置: Hasura数据库
```

## 关于编译的问题

### Q: 是否需要运行`npm run build`？

**A: 不需要**

原因：
1. 我们修改的是前端JavaScript文件，直接被浏览器加载
2. 没有使用TypeScript、JSX等需要编译的语言
3. 没有使用webpack等打包工具

### 需要做的：

1. ✅ 配置`.env.local`文件
2. ✅ 重启开发服务器（让Node.js读取环境变量）
3. ✅ 清除浏览器缓存（避免加载旧JS文件）

### 不需要做的：

- ❌ `npm run build`
- ❌ 编译TypeScript
- ❌ 打包代码

## 数据流程

```
浏览器
  ↓
加载 fish-utils.js
  ↓
调用 loadBackendConfig()
  ↓
GET /api/config/backend
  ↓
Node.js 读取 BACKEND_TYPE 环境变量
  ↓
返回配置给浏览器
  ↓
根据配置选择后端：
  ├─ Hasura → /api/graphql → Hasura GraphQL
  └─ Original → 原作者后端 REST API
```

## 配置优先级

1. URL参数：`?local=true` 或 `?prod=true`（最高优先级，用于调试）
2. 环境变量：`BACKEND_TYPE`
3. 环境变量：`FISHTANK_BACKEND`（向后兼容）
4. 默认值：`hasura`

## 测试结果

### 使用Hasura

```bash
# .env.local
BACKEND_TYPE=hasura
```

**预期**：
- ✅ 控制台显示"Hasura数据库"
- ✅ 从Hasura加载鱼数据
- ✅ 所有GraphQL请求发送到`/api/graphql`

### 使用原作者后端

```bash
# .env.local
BACKEND_TYPE=original
```

**预期**：
- ✅ 控制台显示"原作者后端"
- ✅ 从原作者API加载数据
- ✅ 所有请求发送到`fishes-be-571679687712...`

## 故障排除

### 问题1：仍然连接到原作者后端

**检查清单**：
- [ ] `.env.local`文件是否存在（注意前面有点）
- [ ] 文件中配置了`BACKEND_TYPE=hasura`
- [ ] 已重启开发服务器
- [ ] 已清除浏览器缓存或使用隐私模式

**调试命令**（浏览器控制台）：
```javascript
fetch('/api/config/backend').then(r => r.json()).then(console.log);
```

### 问题2：配置API返回错误

**可能原因**：
- 服务器未运行
- 端口错误
- `api/config/backend.js`文件不存在

**解决**：
1. 确认服务器运行在正确端口
2. 检查终端错误信息

### 问题3：使用Hasura时无数据

**可能原因**：
- Hasura表未创建
- 数据未迁移
- 权限配置错误

**解决**：
1. 执行`scripts/create-fishtank-tables.sql`
2. 确认`fish`表有数据
3. 检查Hasura Console的权限设置

## 文件清单

### 新增

- `api/config/backend.js` - 全局后端配置API
- `docs/BACKEND_SWITCH_GUIDE.md` - 完整配置指南
- `BACKEND_CONFIG_README.md` - 快速配置说明

### 修改

- `src/js/fish-utils.js` - 支持动态后端选择
- `env.local.example` - 更新配置说明
- `api/config/fishtank.js` - 支持新变量名

## 相关文档

- [完整配置指南](../BACKEND_SWITCH_GUIDE.md)
- [鱼缸快速开始](../FISHTANK_QUICKSTART.md)
- [鱼缸功能总览](../FISHTANK_README.md)

## 更新日期

2024-11-03

## 作者

AI Assistant

