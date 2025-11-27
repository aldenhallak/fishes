# 鱼缸功能迁移至Hasura指南

## 概述

本文档说明如何将鱼缸功能从原作者的后端迁移到自建的Hasura数据库。

## 当前状态

- ❌ 鱼缸功能当前连接到原作者后端：`https://fishes-be-571679687712.northamerica-northeast1.run.app`
- ✅ 已创建Hasura数据库表结构
- ✅ 已创建GraphQL API封装
- ⏳ 等待部署和测试

## 迁移步骤

### 1. 在Hasura中创建数据库表

在Hasura控制台执行以下SQL脚本（或直接在PostgreSQL数据库执行）：

```bash
# 在Hasura Console的SQL标签页执行
cat scripts/create-fishtank-tables.sql
```

**或者使用Hasura CLI：**

```bash
# 如果使用Hasura CLI
hasura migrate create create_fishtank_tables
# 然后将SQL内容复制到生成的迁移文件中
hasura migrate apply
```

### 2. 在Hasura中配置权限

在Hasura Console中为以下表配置权限：

#### fishtanks表权限

**Select（查询）：**
- 公开鱼缸：所有人可见
- 私有鱼缸：仅所有者可见

```json
{
  "_or": [
    { "is_public": { "_eq": true } },
    { "user_id": { "_eq": "X-Hasura-User-Id" } }
  ]
}
```

**Insert（插入）：**
- 需要认证
- user_id必须与当前用户匹配

```json
{
  "user_id": { "_eq": "X-Hasura-User-Id" }
}
```

**Update（更新）：**
- 仅所有者可更新自己的鱼缸

```json
{
  "user_id": { "_eq": "X-Hasura-User-Id" }
}
```

**Delete（删除）：**
- 仅所有者可删除自己的鱼缸

```json
{
  "user_id": { "_eq": "X-Hasura-User-Id" }
}
```

#### fishtank_fish表权限

**Select（查询）：**
- 公开鱼缸：所有人可见
- 私有鱼缸：仅所有者可见

```json
{
  "_or": [
    { "fishtank": { "is_public": { "_eq": true } } },
    { "fishtank": { "user_id": { "_eq": "X-Hasura-User-Id" } } }
  ]
}
```

**Insert（插入）：**
- 鱼缸所有者或公开鱼缸的任何用户

```json
{
  "_or": [
    { "fishtank": { "user_id": { "_eq": "X-Hasura-User-Id" } } },
    { "fishtank": { "is_public": { "_eq": true } } }
  ]
}
```

**Delete（删除）：**
- 仅鱼缸所有者

```json
{
  "fishtank": { "user_id": { "_eq": "X-Hasura-User-Id" } }
}
```

#### fishtank_views表权限

**Select（查询）：**
- 仅鱼缸所有者可查看浏览记录

```json
{
  "fishtank": { "user_id": { "_eq": "X-Hasura-User-Id" } }
}
```

**Insert（插入）：**
- 所有人可记录浏览（匿名也可以）

```json
{}
```

### 3. 在Hasura中配置关系

在Hasura Console中配置表之间的关系：

**fishtanks表：**
- `fish` - array relationship到`fishtank_fish`（通过fishtank_id）
- `views` - array relationship到`fishtank_views`（通过fishtank_id）

**fishtank_fish表：**
- `fishtank` - object relationship到`fishtanks`（通过fishtank_id）
- `fish` - object relationship到`fish`（通过fish_id）

**fishtank_views表：**
- `fishtank` - object relationship到`fishtanks`（通过fishtank_id）

### 4. 更新前端HTML文件

在使用鱼缸功能的HTML文件中引入新的JS文件：

**fishtanks.html:**
```html
<!-- 在现有script标签之前添加 -->
<script src="src/js/fishtank-hasura.js"></script>
```

**fishtank-view.html:**
```html
<!-- 在现有script标签之前添加 -->
<script src="src/js/fishtank-hasura.js"></script>
```

### 5. 修改fishtanks.js使用Hasura API

替换所有使用`BACKEND_URL`的REST API调用为Hasura GraphQL调用：

**示例修改：**

```javascript
// 旧代码（REST API）
async function loadMyTanks() {
    const response = await fetch(`${BACKEND_URL}/api/fishtanks/my-tanks`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    return data.fishtanks;
}

// 新代码（Hasura GraphQL）
async function loadMyTanks() {
    const userId = currentUser.id;
    const tanks = await window.fishtankHasura.getMyTanks(userId);
    return tanks;
}
```

### 6. 配置环境变量

确保以下环境变量已配置：

```bash
# Hasura GraphQL endpoint
HASURA_GRAPHQL_ENDPOINT=https://your-hasura-instance.hasura.app/v1/graphql

# Hasura admin secret（可选，用于服务端调用）
HASURA_ADMIN_SECRET=your-admin-secret
```

### 7. 测试功能

1. 创建鱼缸
2. 添加鱼到鱼缸
3. 查看鱼缸列表
4. 分享鱼缸链接
5. 删除鱼

### 8. 验证迁移成功

检查以下功能是否正常：

- [ ] 创建新鱼缸
- [ ] 查看我的鱼缸列表
- [ ] 查看公开鱼缸
- [ ] 添加鱼到鱼缸
- [ ] 从鱼缸移除鱼
- [ ] 编辑鱼缸信息
- [ ] 删除鱼缸
- [ ] 分享鱼缸链接
- [ ] 查看鱼缸统计
- [ ] 浏览计数正常工作

## 数据库表结构说明

### fishtanks表
存储鱼缸基本信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | TEXT | 所有者用户ID |
| name | TEXT | 鱼缸名称 |
| description | TEXT | 鱼缸描述 |
| is_public | BOOLEAN | 是否公开 |
| share_id | TEXT | 分享ID（唯一） |
| fish_count | INTEGER | 鱼数量（自动更新） |
| view_count | INTEGER | 浏览次数 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间（自动更新） |

### fishtank_fish表
存储鱼缸和鱼的关联关系。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| fishtank_id | UUID | 鱼缸ID（外键） |
| fish_id | UUID | 鱼ID（外键） |
| added_at | TIMESTAMP | 添加时间 |

### fishtank_views表
记录鱼缸浏览历史。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| fishtank_id | UUID | 鱼缸ID（外键） |
| viewed_at | TIMESTAMP | 浏览时间 |
| viewer_ip | TEXT | 浏览者IP（可选） |

## API函数说明

新的`fishtank-hasura.js`提供以下函数：

| 函数 | 说明 |
|------|------|
| `getMyTanks(userId)` | 获取用户的鱼缸列表 |
| `getPublicTanks(limit, offset, sortBy)` | 获取公开鱼缸列表 |
| `getUserPublicTanks(userId)` | 获取特定用户的公开鱼缸 |
| `getTankById(tankId)` | 通过ID获取鱼缸详情 |
| `getTankByShareId(shareId)` | 通过分享ID获取鱼缸 |
| `createTank(tankData)` | 创建新鱼缸 |
| `updateTank(tankId, updates)` | 更新鱼缸信息 |
| `deleteTank(tankId)` | 删除鱼缸 |
| `addFishToTank(tankId, fishId)` | 添加鱼到鱼缸 |
| `removeFishFromTank(tankId, fishId)` | 从鱼缸移除鱼 |
| `recordTankView(tankId, viewerIp)` | 记录鱼缸浏览 |
| `getTankStats(tankId)` | 获取鱼缸统计信息 |

## 故障排除

### GraphQL请求失败

**症状：** 前端显示"Failed to execute GraphQL query"

**解决方案：**
1. 检查Hasura endpoint配置是否正确
2. 检查Hasura权限设置
3. 查看浏览器控制台的详细错误信息
4. 检查网络请求的Headers和Response

### 权限错误

**症状：** "permission denied for table fishtanks"

**解决方案：**
1. 在Hasura Console检查表权限配置
2. 确保用户已登录且token有效
3. 检查Hasura的role配置

### 数据库连接错误

**症状：** "relation 'fishtanks' does not exist"

**解决方案：**
1. 确认已执行`create-fishtank-tables.sql`脚本
2. 检查Hasura是否正确track了这些表
3. 在Hasura Console的Data标签页检查表是否存在

## 性能优化建议

1. **启用GraphQL查询缓存**
   - 在Hasura中配置查询缓存
   - 为常用查询添加`@cached`指令

2. **优化数据库索引**
   - 已创建的索引应该足够，但可根据实际使用情况调整

3. **批量操作**
   - 使用GraphQL的批量查询减少请求次数

4. **分页**
   - 对大列表使用分页加载

## 下一步

完成迁移后，可以考虑：

1. 添加鱼缸分类/标签功能
2. 实现鱼缸搜索功能
3. 添加鱼缸评论功能
4. 实现鱼缸收藏功能
5. 添加鱼缸活动动态

## 相关文档

- [Hasura权限系统文档](../HASURA_PERMISSIONS_SETUP.md)
- [GraphQL Schema](../../graphql/schema.graphql)
- [数据库设计文档](../DATABASE_DESIGN.md)

