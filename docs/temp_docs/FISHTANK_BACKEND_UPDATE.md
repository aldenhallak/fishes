# 鱼缸功能后端配置更新

## 更新内容

鱼缸功能现在支持通过环境变量选择使用Hasura数据库或原作者后端。

## 快速配置

### 1. 选择后端

在`.env.local`文件中配置：

**选项A：使用Hasura（推荐）**
```bash
FISHTANK_BACKEND=hasura
HASURA_GRAPHQL_ENDPOINT=https://your-hasura-project.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-admin-secret
```

**选项B：使用原作者后端**
```bash
FISHTANK_BACKEND=original
ORIGINAL_BACKEND_URL=https://fishes-be-571679687712.northamerica-northeast1.run.app
```

### 2. 使用Hasura需要创建表

执行以下SQL脚本（在Hasura Console或PostgreSQL）：
```bash
scripts/create-fishtank-tables.sql
```

配置Hasura权限，参考：`docs/FISHTANK_QUICKSTART.md`

### 3. 重启服务器

```bash
npm run dev
```

## 新增文件

### 前端
- `src/js/fishtank-adapter.js` - 后端适配器
- `src/js/fishtank-hasura.js` - Hasura GraphQL封装

### 后端API
- `api/graphql.js` - GraphQL代理
- `api/config/fishtank.js` - 配置读取
- `api/config/fishtank-backend.js` - 配置API端点

### 数据库
- `scripts/create-fishtank-tables.sql` - 鱼缸表创建脚本

### 配置
- 更新了`env.local.example`

### 文档
- `docs/FISHTANK_README.md` - 总览文档
- `docs/FISHTANK_QUICKSTART.md` - 快速开始
- `docs/FISHTANK_HASURA_MIGRATION.md` - 详细迁移指南
- `docs/bug_fixed_docs/FISHTANK_BACKEND_CONFIG.md` - 配置指南

## 修改的文件

- `fishtanks.html` - 引入新的JS文件
- `fishtank-view.html` - 引入新的JS文件

## 使用方法

前端代码无需修改，自动使用适配器：

```javascript
// 原来的代码保持不变
const tanks = await window.fishtankAdapter.getMyTanks(userId);
```

适配器会根据配置自动选择使用Hasura或原作者后端。

## 优势

1. **灵活切换**：可以随时在Hasura和原作者后端之间切换
2. **平滑迁移**：先使用原作者后端，准备好后切换到Hasura
3. **向后兼容**：现有代码无需修改
4. **自主控制**：使用Hasura后完全控制数据

## 推荐使用

**生产环境**：使用Hasura
**开发测试**：可以使用原作者后端快速开始，后期迁移到Hasura

## 相关文档

- 完整文档：`docs/FISHTANK_README.md`
- 快速开始：`docs/FISHTANK_QUICKSTART.md`
- 配置详解：`docs/bug_fixed_docs/FISHTANK_BACKEND_CONFIG.md`

## 注意事项

⚠️ 两个后端的数据是独立的，切换后端不会同步数据
⚠️ 原作者后端可能随时不可用，建议尽快迁移到Hasura
✅ 已在HTML文件中引入必要的JS文件
✅ 无需修改业务逻辑代码

## 测试清单

- [ ] 配置环境变量
- [ ] 创建Hasura表（如果使用Hasura）
- [ ] 访问fishtanks.html
- [ ] 创建鱼缸
- [ ] 添加鱼到鱼缸
- [ ] 查看鱼缸列表
- [ ] 分享鱼缸链接

## 更新日期

2024-11-03

