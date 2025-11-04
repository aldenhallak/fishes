# 鱼缸功能后端配置指南

## 问题描述

鱼缸页面(`fishtanks.html`, `fishtank-view.html`)当前连接到原作者的后端API，需要支持选择使用Hasura数据库或原作者后端。

## 解决方案

通过环境变量`FISHTANK_BACKEND`控制鱼缸功能使用哪个后端：
- **hasura**: 使用自建Hasura数据库（推荐）
- **original**: 使用原作者后端（临时方案）

## 配置方法

### 方法1：使用Hasura数据库（推荐）

1. **配置环境变量**

在`.env.local`文件中设置：

```bash
# 鱼缸后端选择
FISHTANK_BACKEND=hasura

# Hasura配置（如果还没有配置）
HASURA_GRAPHQL_ENDPOINT=https://your-hasura-project.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-hasura-admin-secret
```

2. **创建数据库表**

在Hasura Console执行：

```bash
# 方式1：在Hasura Console的SQL标签页
粘贴并执行 scripts/create-fishtank-tables.sql 的内容

# 方式2：使用psql
psql -h your-db-host -U postgres -d your-db -f scripts/create-fishtank-tables.sql
```

3. **配置Hasura权限**

参考文档：[FISHTANK_QUICKSTART.md](../FISHTANK_QUICKSTART.md)

4. **测试功能**

访问 `fishtanks.html` 并测试：
- ✅ 创建鱼缸
- ✅ 查看鱼缸列表
- ✅ 添加鱼到鱼缸
- ✅ 分享鱼缸

### 方法2：使用原作者后端（临时方案）

如果暂时不想迁移到Hasura，可以继续使用原作者后端：

在`.env.local`文件中设置：

```bash
# 鱼缸后端选择
FISHTANK_BACKEND=original

# 原作者后端URL
ORIGINAL_BACKEND_URL=https://fishes-be-571679687712.northamerica-northeast1.run.app
```

**注意**：使用原作者后端的限制：
- ⚠️ 依赖第三方服务，可能随时不可用
- ⚠️ 无法自定义功能
- ⚠️ 数据存储在第三方服务器
- ⚠️ 不建议长期使用

## 技术实现

### 架构图

```
┌─────────────────┐
│  前端页面       │
│ fishtanks.html  │
└────────┬────────┘
         │
         ├─ fishtank-adapter.js (适配器层)
         │         │
         │         ├──── 配置检查: /api/config/fishtank-backend
         │         │
         │         ├──[HASURA]──► fishtank-hasura.js ──► /api/graphql ──► Hasura
         │         │
         │         └──[ORIGINAL]──► REST API ──► 原作者后端
         │
         └─ fishtanks.js (业务逻辑)
```

### 文件说明

| 文件 | 说明 |
|------|------|
| `src/js/fishtank-adapter.js` | 适配器层，自动选择后端 |
| `src/js/fishtank-hasura.js` | Hasura GraphQL API封装 |
| `api/config/fishtank-backend.js` | 配置API端点 |
| `api/config/fishtank.js` | 后端配置读取 |
| `api/graphql.js` | GraphQL代理端点 |
| `scripts/create-fishtank-tables.sql` | 数据库表创建脚本 |

### API使用示例

前端代码无需关心使用哪个后端，统一使用适配器：

```javascript
// 获取我的鱼缸
const tanks = await window.fishtankAdapter.getMyTanks(userId);

// 创建鱼缸
const newTank = await window.fishtankAdapter.createTank({
    name: '我的鱼缸',
    description: '描述',
    isPublic: true
});

// 添加鱼
await window.fishtankAdapter.addFishToTank(tankId, fishId);
```

## 切换后端

### 从原作者后端切换到Hasura

1. 完成Hasura配置（创建表、配置权限）
2. 修改`.env.local`：
   ```bash
   FISHTANK_BACKEND=hasura
   ```
3. 重启开发服务器
4. 测试功能

### 从Hasura切换回原作者后端

1. 修改`.env.local`：
   ```bash
   FISHTANK_BACKEND=original
   ```
2. 重启开发服务器

**注意**：两个后端的数据是独立的，切换后端不会同步数据。

## 故障排除

### 问题1：前端报错"Failed to load backend config"

**原因**：无法访问配置API

**解决**：
1. 检查`api/config/fishtank-backend.js`文件是否存在
2. 检查开发服务器是否正常运行
3. 查看浏览器控制台的网络请求

### 问题2：使用Hasura时报错"GraphQL request failed"

**原因**：Hasura配置错误或权限问题

**解决**：
1. 检查`.env.local`中的`HASURA_GRAPHQL_ENDPOINT`是否正确
2. 检查Hasura表权限配置
3. 查看Hasura Console的错误日志

### 问题3：使用原作者后端时报错"Failed to load tanks"

**原因**：原作者后端服务不可用或认证失败

**解决**：
1. 检查网络连接
2. 检查用户是否已登录
3. 考虑切换到Hasura后端

## 数据迁移（可选）

如果需要将原作者后端的数据迁移到Hasura：

```javascript
// 这是一个示例脚本，需要根据实际情况调整
async function migrateData() {
    // 1. 从原作者后端获取数据
    const oldBackendUrl = 'https://fishes-be-571679687712...';
    const response = await fetch(`${oldBackendUrl}/api/fishtanks/my-tanks`);
    const data = await response.json();
    
    // 2. 转换数据格式
    const tanks = data.fishtanks.map(tank => ({
        name: tank.name,
        description: tank.description,
        is_public: tank.isPublic,
        user_id: getCurrentUserId()
    }));
    
    // 3. 插入到Hasura
    for (const tank of tanks) {
        await window.fishtankHasura.createTank(tank);
    }
}
```

## 推荐配置

对于生产环境，强烈推荐使用Hasura：

```bash
# .env.local (生产环境)
FISHTANK_BACKEND=hasura
HASURA_GRAPHQL_ENDPOINT=https://your-hasura-project.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-secure-secret
```

对于开发和测试，可以根据需要选择：

```bash
# .env.local (开发环境 - 使用Hasura)
FISHTANK_BACKEND=hasura
HASURA_GRAPHQL_ENDPOINT=http://localhost:8080/v1/graphql
HASURA_ADMIN_SECRET=dev-secret

# 或者使用原作者后端进行快速测试
FISHTANK_BACKEND=original
ORIGINAL_BACKEND_URL=https://fishes-be-571679687712.northamerica-northeast1.run.app
```

## 相关文档

- [Hasura迁移指南](../FISHTANK_HASURA_MIGRATION.md)
- [快速开始指南](../FISHTANK_QUICKSTART.md)
- [数据库设计文档](../DATABASE_DESIGN.md)

## 更新日期

2024-11-03

## 作者

AI Assistant

