# 测试鱼数据下载和导入指南

## 概述

本指南说明如何从原作者后端下载测试鱼数据，并导入到自建Hasura数据库的fish_test表中。

## 实现方案

### 数据来源

- **原作者API**: `https://fishes-be-571679687712.northamerica-northeast1.run.app/api/fish`
- **图片存储**: Firebase Storage (PNG格式)
- **下载数量**: 50条鱼数据

### 数据处理流程

1. 从原作者API获取鱼数据
2. 下载PNG图片到本地
3. 上传图片到七牛云
4. 转换数据格式匹配fish表结构
5. 随机生成artist名称
6. 保存为JSON文件
7. 批量插入到Hasura fish_test表

## 使用步骤

### 前提条件

1. **Hasura配置** - 确保`.env.local`中配置了：
   ```env
   HASURA_GRAPHQL_ENDPOINT=https://your-project.hasura.app/v1/graphql
   HASURA_ADMIN_SECRET=your-admin-secret
   ```

2. **七牛云配置** - 确保`.env.local`中配置了：
   ```env
   QINIU_ACCESS_KEY=your-access-key
   QINIU_SECRET_KEY=your-secret-key
   QINIU_BUCKET=your-bucket
   QINIU_BASE_URL=https://your-cdn-domain.com
   QINIU_DIR_PATH=fishart_web/
   QINIU_ZONE=Zone_na0
   ```

### 步骤1: 创建fish_test表

在Hasura Console → Data → SQL执行：

```bash
cd scripts/sql
# 复制create-fish-test-table.sql的内容到Hasura SQL编辑器
```

或直接在SQL编辑器粘贴以下命令：

```sql
-- 完整SQL在 scripts/sql/create-fish-test-table.sql
CREATE TABLE IF NOT EXISTS fish_test (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  artist VARCHAR(255),
  -- ... 其他字段见SQL文件
);
```

**重要**: 创建表后，需要在Hasura中Track该表：
1. 在Hasura Console → Data → public
2. 找到"Untracked tables or views"区域
3. 点击fish_test表旁边的"Track"按钮

### 步骤2: 下载测试数据

运行下载脚本：

```bash
node scripts/download-test-fish.js
```

脚本会：
- 从原作者API获取50条鱼数据
- 下载每条鱼的PNG图片
- 上传图片到七牛云
- 生成`temp/test-fish-data.json`文件

**预计时间**: 5-10分钟（取决于网络速度）

### 步骤3: 导入到Hasura

运行导入脚本：

```bash
node scripts/import-test-fish.js
```

脚本会：
- 读取`temp/test-fish-data.json`
- 批量插入数据到fish_test表（每批10条）
- 显示进度和统计信息

**预计时间**: 1-2分钟

### 步骤4: 验证数据

在Hasura Console → API执行查询：

```graphql
query TestFishData {
  fish_test(limit: 10, order_by: {created_at: desc}) {
    id
    artist
    image_url
    talent
    level
    upvotes
    downvotes
    battle_power
    created_at
  }
}
```

或查询总数：

```graphql
query CountTestFish {
  fish_test_aggregate {
    aggregate {
      count
    }
  }
}
```

## 数据字段映射

| 原作者字段 | fish_test表字段 | 说明 |
|-----------|----------------|------|
| Image | image_url | PNG图片URL（转为七牛云） |
| Artist | artist | 随机生成名字 |
| upvotes | upvotes | 直接映射 |
| downvotes | downvotes | 直接映射 |
| score | - | 计算字段(upvotes - downvotes) |
| CreatedAt | created_at | 直接映射 |
| - | id | 自动生成UUID |
| - | user_id | 生成测试用user_id |
| - | level | 默认1 |
| - | health | 默认100 |
| - | max_health | 默认100 |
| - | experience | 默认0 |
| - | talent | 随机25-75 |
| - | battle_power | 根据talent计算 |

## 随机生成的Artist名称

脚本会从以下列表中随机选择artist名称：

- 小鱼画家
- 海洋艺术家
- 水下创作者
- 鱼类爱好者
- 海底世界
- 蓝色梦想
- 游泳的笔
- 色彩鱼人
- 深海画师
- 波浪艺术
- 鱼儿的朋友
- 创意海洋
- 水彩大师
- 鱼缸画家
- 海洋守护者
- 泡泡艺术家
- 彩虹鱼人
- 梦幻鱼类
- 画鱼达人
- 海洋诗人

## 文件结构

```
fish_art/
├── scripts/
│   ├── sql/
│   │   └── create-fish-test-table.sql  # 创建表SQL
│   ├── download-test-fish.js           # 下载脚本
│   └── import-test-fish.js             # 导入脚本
├── temp/
│   └── test-fish-data.json             # 下载的数据
└── docs/
    └── temp_docs/
        └── TEST_FISH_DOWNLOAD_GUIDE.md # 本文档
```

## 故障排除

### 问题1: fish_test表不存在

**错误信息**: `field "fish_test" not found in type: 'query_root'`

**解决方案**:
1. 在Hasura Console执行创建表SQL
2. 在Hasura中Track该表

### 问题2: 七牛云上传失败

**错误信息**: `incorrect region, please use up-xxx.qiniup.com`

**解决方案**:
检查`.env.local`中的`QINIU_ZONE`配置是否正确：
- 华东: `Zone_z0`
- 华北: `Zone_z1`
- 华南: `Zone_z2`
- 北美: `Zone_na0`
- 东南亚: `Zone_as0`

### 问题3: Hasura连接失败

**错误信息**: `HASURA_GRAPHQL_ENDPOINT not set`

**解决方案**:
确保`.env.local`文件存在且配置正确：
```env
HASURA_GRAPHQL_ENDPOINT=https://your-project.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-admin-secret
```

### 问题4: 图片下载失败

**错误信息**: `ENOTFOUND` 或网络超时

**解决方案**:
- 检查网络连接
- 尝试使用代理
- 减少下载数量（修改`CONFIG.downloadLimit`）

## 性能优化

### 批量大小调整

默认每批插入10条数据，可以在`import-test-fish.js`中调整：

```javascript
const CONFIG = {
  batchSize: 20  // 增加到20条每批
};
```

### 下载数量调整

默认下载50条，可以在`download-test-fish.js`中调整：

```javascript
const CONFIG = {
  downloadLimit: 100  // 增加到100条
};
```

## 清理数据

如需清空fish_test表重新导入：

```sql
-- 在Hasura Console → SQL执行
DELETE FROM fish_test;
```

或删除整个表：

```sql
DROP TABLE IF EXISTS fish_test CASCADE;
```

## 后续使用

导入的测试数据可用于：

1. **前端开发测试** - 测试鱼的显示和交互
2. **战斗系统测试** - 测试战斗匹配算法
3. **性能测试** - 测试大量数据的查询性能
4. **API测试** - 测试各种API端点

## 相关文档

- [Hasura表跟踪指南](../setup/HASURA_TRACK_GUIDE.md)
- [七牛云配置指南](../QINIU_SETUP.md)
- [数据库迁移指南](../setup/SCHEMA_DOWNLOAD_GUIDE.md)


























