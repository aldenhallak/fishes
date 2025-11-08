# 鱼缸功能文档汇总

## 概述

鱼缸功能允许用户创建自定义鱼缸集合，组织和展示自己喜欢的鱼作品。

## 快速开始

**选择你的使用方式：**

### 方式A：使用原作者后端（最快，5分钟）

适合快速测试，无需配置数据库。

1. 在`.env.local`中设置：
   ```bash
   FISHTANK_BACKEND=original
   ORIGINAL_BACKEND_URL=https://fishes-be-571679687712.northamerica-northeast1.run.app
   ```

2. 重启服务器，访问`fishtanks.html`即可使用

⚠️ **注意**：依赖第三方服务，不建议长期使用

### 方式B：使用Hasura数据库（推荐，15分钟）

适合生产环境，完全自主控制。

1. 参考：[快速开始指南](./FISHTANK_QUICKSTART.md)
2. 配置Hasura并创建表
3. 在`.env.local`中设置：
   ```bash
   FISHTANK_BACKEND=hasura
   ```

## 文档索引

### 使用指南

| 文档 | 说明 | 适用场景 |
|------|------|----------|
| [FISHTANK_QUICKSTART.md](./FISHTANK_QUICKSTART.md) | 5分钟快速开始 | 首次使用Hasura |
| [bug_fixed_docs/FISHTANK_BACKEND_CONFIG.md](./bug_fixed_docs/FISHTANK_BACKEND_CONFIG.md) | 后端配置详解 | 配置和切换后端 |

### 技术文档

| 文档 | 说明 | 适用场景 |
|------|------|----------|
| [FISHTANK_HASURA_MIGRATION.md](./FISHTANK_HASURA_MIGRATION.md) | Hasura迁移完整指南 | 深入了解Hasura实现 |
| [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) | 数据库设计文档 | 了解数据结构 |

### 相关脚本

| 文件 | 说明 |
|------|------|
| `scripts/create-fishtank-tables.sql` | 创建鱼缸表的SQL脚本 |

### 前端文件

| 文件 | 说明 |
|------|------|
| `src/js/fishtank-adapter.js` | 后端适配器（自动选择） |
| `src/js/fishtank-hasura.js` | Hasura GraphQL API |
| `src/js/fishtanks.js` | 鱼缸管理页面逻辑 |
| `src/js/fishtank-view.js` | 鱼缸查看页面逻辑 |

### API端点

| 端点 | 说明 |
|------|------|
| `/api/config/fishtank-backend` | 获取后端配置 |
| `/api/graphql` | GraphQL代理（Hasura） |

## 功能特性

### 已实现功能

- ✅ 创建/编辑/删除鱼缸
- ✅ 公开/私有鱼缸设置
- ✅ 添加/移除鱼到鱼缸
- ✅ 鱼缸列表（我的/公开/发现）
- ✅ 鱼缸分享链接
- ✅ 鱼缸浏览统计
- ✅ 鱼缸搜索和过滤
- ✅ 鱼缸排序（最新/最多浏览/名称）
- ✅ 鱼在鱼缸中游动动画

### 计划功能

- ⏳ 鱼缸分类/标签
- ⏳ 鱼缸评论系统
- ⏳ 鱼缸收藏功能
- ⏳ 鱼缸活动动态

## 配置选项

### 环境变量

```bash
# 必需：选择后端类型
FISHTANK_BACKEND=hasura|original

# Hasura后端配置（FISHTANK_BACKEND=hasura时需要）
HASURA_GRAPHQL_ENDPOINT=https://your-hasura.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-secret

# 原作者后端URL（FISHTANK_BACKEND=original时需要）
ORIGINAL_BACKEND_URL=https://fishes-be-571679687712...
```

## 数据库表结构

### fishtanks（鱼缸表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | TEXT | 所有者ID |
| name | TEXT | 鱼缸名称 |
| description | TEXT | 描述 |
| is_public | BOOLEAN | 是否公开 |
| share_id | TEXT | 分享ID |
| fish_count | INTEGER | 鱼数量 |
| view_count | INTEGER | 浏览次数 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### fishtank_fish（鱼缸-鱼关联表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| fishtank_id | UUID | 鱼缸ID |
| fish_id | UUID | 鱼ID |
| added_at | TIMESTAMP | 添加时间 |

### fishtank_views（浏览记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| fishtank_id | UUID | 鱼缸ID |
| viewed_at | TIMESTAMP | 浏览时间 |
| viewer_ip | TEXT | 浏览者IP |

## API使用示例

### 获取鱼缸列表

```javascript
// 获取我的鱼缸
const myTanks = await window.fishtankAdapter.getMyTanks(userId);

// 获取公开鱼缸
const publicTanks = await window.fishtankAdapter.getPublicTanks(12, 0, 'updated_at');

// 获取特定用户的公开鱼缸
const userTanks = await window.fishtankAdapter.getUserPublicTanks(userId);
```

### 创建和管理鱼缸

```javascript
// 创建鱼缸
const newTank = await window.fishtankAdapter.createTank({
    name: '我的第一个鱼缸',
    description: '收集我最喜欢的鱼',
    isPublic: true
});

// 更新鱼缸
await window.fishtankAdapter.updateTank(tankId, {
    name: '新名称',
    description: '新描述',
    isPublic: false
});

// 删除鱼缸
await window.fishtankAdapter.deleteTank(tankId);
```

### 管理鱼缸中的鱼

```javascript
// 添加鱼到鱼缸
await window.fishtankAdapter.addFishToTank(tankId, fishId);

// 从鱼缸移除鱼
await window.fishtankAdapter.removeFishFromTank(tankId, fishId);

// 获取鱼缸详情（包含鱼列表）
const tankData = await window.fishtankAdapter.getTankById(tankId);
console.log(tankData.fishtank); // 鱼缸信息
console.log(tankData.fish);     // 鱼列表
```

### 统计和分析

```javascript
// 记录浏览
await window.fishtankAdapter.recordTankView(tankId);

// 获取统计信息
const stats = await window.fishtankAdapter.getTankStats(tankId);
console.log(stats.totalViews);    // 总浏览数
console.log(stats.recentViews);   // 30天内浏览数
console.log(stats.dailyViews);    // 每日浏览数据
```

## 故障排除

### 常见问题

**Q1: 页面显示"Failed to load backend config"**

A: 检查`api/config/fishtank-backend.js`是否存在，开发服务器是否运行

**Q2: 使用Hasura时报"permission denied"**

A: 检查Hasura表权限配置，参考[FISHTANK_QUICKSTART.md](./FISHTANK_QUICKSTART.md)

**Q3: 原作者后端连接失败**

A: 原作者服务可能不可用，建议切换到Hasura

### 调试方法

1. **查看后端配置**：
   ```javascript
   console.log(window.fishtankAdapter.getConfig());
   ```

2. **查看控制台错误**：
   打开浏览器开发者工具 → Console标签

3. **查看网络请求**：
   开发者工具 → Network标签 → 查看GraphQL或API请求

## 性能优化

### 前端优化

- 使用分页加载鱼缸列表
- 实现虚拟滚动（大量鱼时）
- 缓存鱼缸数据（localStorage）

### 后端优化

- Hasura查询缓存
- 数据库索引优化
- CDN加速图片加载

## 安全考虑

- ✅ 使用Hasura权限系统控制访问
- ✅ 私有鱼缸仅所有者可见
- ✅ 公开鱼缸任何人可查看
- ✅ 仅所有者可编辑/删除鱼缸
- ✅ 分享链接使用随机ID

## 贡献指南

欢迎贡献代码和建议！

### 添加新功能

1. 在Hasura中添加必要的表/字段
2. 更新`fishtank-hasura.js`添加GraphQL查询
3. 在`fishtank-adapter.js`中添加适配器方法
4. 更新文档

### 报告问题

在GitHub Issues中报告问题，包括：
- 使用的后端类型（Hasura/原作者）
- 错误信息
- 复现步骤

## 许可证

基于原项目许可证

## 联系方式

- GitHub Issues
- 项目文档：本目录

## 更新日志

### 2024-11-03
- ✨ 添加后端配置系统
- ✨ 支持Hasura和原作者后端切换
- 📝 完善文档

### 更早版本
- ✅ 基础鱼缸功能
- ✅ 鱼缸分享
- ✅ 浏览统计

