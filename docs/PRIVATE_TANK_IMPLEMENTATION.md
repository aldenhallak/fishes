# 私人鱼缸系统实施文档
## Private Fish Tank Implementation

实施日期：2025年11月5日

---

## 📋 概述

本次实施完成了私人鱼缸系统的重大重构，将多鱼缸系统改造为每个用户一个私人鱼缸的模式，并添加了鱼收藏功能和背景切换功能。

## 🗄️ 数据库更改

### 1. 新建表：fish_favorites

用于存储用户收藏的鱼。

```sql
CREATE TABLE fish_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  fish_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_user_fish_favorite UNIQUE(user_id, fish_id),
  CONSTRAINT fk_favorite_fish FOREIGN KEY (fish_id) REFERENCES fish(id) ON DELETE CASCADE
);
```

**索引：**
- `idx_favorites_user` on `user_id`
- `idx_favorites_fish` on `fish_id`
- `idx_favorites_created` on `created_at DESC`

### 2. 修改表：fishtanks

添加背景和默认鱼缸支持。

```sql
ALTER TABLE fishtanks 
  ADD COLUMN background_url TEXT DEFAULT NULL,
  ADD COLUMN is_default BOOLEAN DEFAULT FALSE;
```

**新索引：**
- `idx_fishtanks_user_default` on `(user_id, is_default) WHERE is_default = TRUE`

### 3. 数据迁移

**迁移脚本位置：** `scripts/migrate-user-tanks.sql`

迁移步骤：
1. 为没有鱼缸的用户创建默认私人鱼缸
2. 为现有用户将第一个鱼缸标记为默认鱼缸
3. 将所有非默认鱼缸的鱼移动到默认鱼缸
4. 删除所有非默认鱼缸
5. 确保所有鱼缸设置为私有

**⚠️ 注意：** 运行迁移前请备份数据！

---

## 🔌 API端点

### 1. `/api/fishtank/get-or-create-default` (GET)

获取或创建用户的默认私人鱼缸。

**认证：** 需要Bearer Token

**响应：**
```json
{
  "success": true,
  "fishtank": {
    "id": "uuid",
    "user_id": "string",
    "name": "My Private Tank",
    "background_url": "/backgrounds/bg-1.svg",
    "is_default": true,
    ...
  }
}
```

### 2. `/api/fishtank/my-fish` (GET)

获取用户私人鱼缸中的所有鱼（自己创建的 + 收藏的）。

**认证：** 需要Bearer Token

**响应：**
```json
{
  "success": true,
  "fish": [
    {
      "id": "uuid",
      "isOwn": true,  // 或 isFavorited: true
      ...
    }
  ],
  "stats": {
    "totalFish": 10,
    "ownFish": 6,
    "favoritedFish": 4,
    "avgLevel": 5.2
  }
}
```

### 3. `/api/fishtank/favorite` (POST)

添加鱼到收藏。

**认证：** 需要Bearer Token

**请求体：**
```json
{
  "fishId": "uuid"
}
```

**限制：**
- 不能收藏自己的鱼
- 最多收藏100条鱼（可配置）

### 4. `/api/fishtank/unfavorite` (POST)

从收藏中移除鱼。

**认证：** 需要Bearer Token

**请求体：**
```json
{
  "fishId": "uuid"
}
```

### 5. `/api/fishtank/backgrounds` (GET)

获取可用的背景图列表。

**无需认证**

**响应：**
```json
{
  "success": true,
  "backgrounds": [
    {
      "id": 1,
      "url": "/backgrounds/bg-1.svg",
      "name": "Ocean Blue",
      "cost": 0,
      "description": "Classic blue ocean background"
    },
    ...
  ]
}
```

### 6. `/api/fishtank/change-background` (POST)

更换鱼缸背景。

**认证：** 需要Bearer Token

**请求体：**
```json
{
  "backgroundId": 2
}
```

**费用：**
- 部分背景需要消耗鱼食（fish food）
- 如果余额不足会返回错误

---

## 📂 新建文件

### JavaScript模块

1. **`src/js/fishtank-favorites.js`**
   - 封装所有收藏相关功能
   - 提供缓存机制减少API调用
   - 导出 `window.FishTankFavorites` 全局对象

2. **`src/js/private-fishtank.js`**
   - 私人鱼缸页面逻辑
   - 处理鱼展示、背景切换、统计信息

### CSS样式

3. **`src/css/fishtank-favorites.css`**
   - 收藏按钮样式
   - 背景选择器样式
   - 私人鱼缸页面样式
   - Toast通知样式

### API实现

4. **`api/config/fishtank-config.js`** - 配置文件
5. **`api/fishtank/get-or-create-default.js`**
6. **`api/fishtank/my-fish.js`**
7. **`api/fishtank/favorite.js`**
8. **`api/fishtank/unfavorite.js`**
9. **`api/fishtank/backgrounds.js`**
10. **`api/fishtank/change-background.js`**

### 背景资源

11. **`public/backgrounds/bg-1.svg`** - Ocean Blue (免费)
12. **`public/backgrounds/bg-2.svg`** - Deep Sea (3鱼食)
13. **`public/backgrounds/bg-3.svg`** - Coral Reef (3鱼食)
14. **`public/backgrounds/bg-4.svg`** - Sunset Ocean (5鱼食)
15. **`public/backgrounds/bg-5.svg`** - Glacier Waters (5鱼食)
16. **`public/backgrounds/README.md`** - 背景图使用说明

### 数据库脚本

17. **`scripts/create-favorites-table.sql`** - 创建表的SQL
18. **`scripts/migrate-user-tanks.sql`** - 数据迁移SQL

---

## 🔄 修改的文件

### 1. `fishtanks.html`

**主要更改：**
- 重构为私人鱼缸页面
- 添加背景选择器UI
- 移除创建/删除鱼缸功能
- 显示自己的鱼和收藏的鱼（分类显示）
- 添加鱼缸统计信息
- 显示鱼食余额

**新增区域：**
- 背景选择器
- 统计卡片（总鱼数、自己的鱼、收藏的鱼、平均等级）
- 鱼分类展示（"My Fish" 和 "Favorite Fish"）

### 2. `rank.html`

**更改：**
- 添加 `fishtank-favorites.css` 引用
- 添加 `fishtank-favorites.js` 脚本引用

### 3. `src/js/rank.js`

**新增功能：**
- 在鱼卡片上添加收藏按钮
- `handleFavoriteClick()` 函数处理收藏切换
- `initializeFavoriteButtons()` 初始化收藏按钮状态
- 自动隐藏用户自己鱼的收藏按钮
- 未登录用户不显示收藏按钮

**更改位置：**
- `createFishCard()` 函数 (第186-231行)
- 页面初始化添加收藏按钮初始化 (第605-607行)
- 导出 `handleFavoriteClick` 函数 (第692行)

### 4. `src/js/fishtanks.js`

**修复：**
- 添加 `await` 到 `requireAuthentication()` 调用
- 防止已登录用户被重定向到登录页

---

## 💾 配置文件

### `api/config/fishtank-config.js`

```javascript
module.exports = {
  BACKGROUND_CHANGE_COST: 3,  // 默认背景更换费用
  BACKGROUNDS: [ /* 5个背景配置 */ ],
  MAX_FAVORITES_PER_USER: 100,
  DEFAULT_TANK_NAME: 'My Private Tank',
  DEFAULT_TANK_DESCRIPTION: 'My personal fish collection',
};
```

---

## 🎨 UI/UX改进

### 私人鱼缸页面

1. **背景选择器**
   - 网格布局显示所有背景
   - 点击预览和确认
   - 显示费用和余额
   - 余额不足时禁用按钮

2. **鱼展示**
   - 分类显示（自己的鱼 vs 收藏的鱼）
   - 鱼卡片显示徽章标识
   - 点击鱼查看详情
   - 收藏的鱼可以直接取消收藏

3. **统计信息**
   - 实时显示鱼数量统计
   - 显示平均等级
   - 显示鱼食余额

### 排名页面

1. **收藏按钮**
   - 位于投票和举报按钮旁边
   - 心形图标（🤍/❤️）
   - 点击切换收藏状态
   - Toast通知反馈
   - 自动隐藏用户自己的鱼

---

## 🧪 测试清单

### 数据库测试

- [ ] 创建 `fish_favorites` 表
- [ ] 修改 `fishtanks` 表添加新列
- [ ] 在Hasura中跟踪表和关系
- [ ] 运行数据迁移脚本
- [ ] 验证数据完整性

### API测试

- [ ] 测试获取/创建默认鱼缸
- [ ] 测试获取"我的鱼"（自己的+收藏的）
- [ ] 测试添加收藏
- [ ] 测试移除收藏
- [ ] 测试收藏限制（100条）
- [ ] 测试背景列表获取
- [ ] 测试背景更换（免费和付费）
- [ ] 测试鱼食余额扣除

### 前端测试

- [ ] 测试私人鱼缸页面加载
- [ ] 测试背景选择和切换
- [ ] 测试鱼分类显示
- [ ] 测试统计信息显示
- [ ] 测试排名页面收藏按钮
- [ ] 测试收藏状态持久化
- [ ] 测试未登录状态
- [ ] 测试响应式布局（移动端）

---

## 📱 响应式设计

所有新UI组件都支持响应式设计：

- **桌面端：** 完整功能，网格布局
- **平板端：** 自适应网格列数
- **移动端：** 单列布局，按钮和卡片优化

---

## 🔒 权限和安全

1. **认证要求**
   - 所有收藏和背景更换操作需要登录
   - 使用Supabase JWT token验证

2. **数据验证**
   - 不能收藏自己的鱼
   - 不能收藏未审核的鱼
   - 背景更换检查余额
   - 收藏数量限制

3. **数据库约束**
   - 唯一约束：用户+鱼组合
   - 外键约束：级联删除
   - 默认鱼缸唯一索引

---

## 🚀 部署步骤

### 1. 数据库

```bash
# 1. 在Hasura/PostgreSQL中执行
psql -d your_database -f scripts/create-favorites-table.sql

# 2. 在Hasura Console中跟踪 fish_favorites 表

# 3. 设置表关系
#    - fish_favorites -> fish (object relationship)
#    - fish -> fish_favorites (array relationship)

# 4. 备份数据
pg_dump your_database > backup.sql

# 5. 执行迁移
psql -d your_database -f scripts/migrate-user-tanks.sql

# 6. 验证迁移结果
# SELECT user_id, COUNT(*) FROM fishtanks GROUP BY user_id;
```

### 2. 环境变量

确保 `.env.local` 包含：

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
HASURA_GRAPHQL_ENDPOINT=your_hasura_endpoint
HASURA_ADMIN_SECRET=your_hasura_secret
```

### 3. 前端部署

```bash
# 1. 上传背景图（如需使用真实图片替换SVG）
# 将图片放到 public/backgrounds/ 目录

# 2. 部署到Vercel/Netlify
git add .
git commit -m "feat: implement private fish tank system"
git push origin main

# 3. 验证部署
# - 检查所有API端点可访问
# - 测试收藏功能
# - 测试背景切换
```

---

## 📈 性能优化

1. **缓存机制**
   - 收藏状态本地缓存
   - 减少重复API调用

2. **懒加载**
   - 背景图片使用 `loading="lazy"`
   - 鱼图片异步加载

3. **批量操作**
   - 初始化时批量检查收藏状态

---

## 🐛 已知问题和限制

1. **背景图**
   - 当前使用SVG占位符
   - 生产环境应替换为高质量JPG/PNG图片

2. **tank.html页面**
   - 动画鱼缸页面不适合添加收藏按钮
   - 建议在未来版本添加"点击鱼查看详情"功能

3. **收藏限制**
   - 当前限制为100条
   - 可以在配置文件中调整

---

## 📝 待办事项

- [ ] 替换SVG背景为高质量图片
- [ ] 添加更多背景选项
- [ ] 实现收藏鱼的排序功能
- [ ] 添加批量取消收藏功能
- [ ] 在tank.html添加鱼点击查看详情
- [ ] 添加鱼缸装饰品系统
- [ ] 实现背景动画效果

---

## 💡 使用建议

### 对于用户

1. **收藏鱼：** 在排名页面点击心形按钮收藏喜欢的鱼
2. **管理收藏：** 访问"My Fish Tank"页面查看和管理收藏
3. **更换背景：** 点击背景选择器中的背景预览和确认
4. **获取鱼食：** 通过完成任务或创建鱼获得鱼食来解锁付费背景

### 对于开发者

1. **扩展背景：** 在 `api/config/fishtank-config.js` 中添加新背景
2. **调整费用：** 修改配置文件中的 `BACKGROUND_CHANGE_COST`
3. **自定义限制：** 修改 `MAX_FAVORITES_PER_USER`
4. **添加新功能：** 使用 `FishTankFavorites` 模块的现有方法

---

## 📞 支持

如有问题或建议，请联系开发团队或提交Issue到项目仓库。

---

**文档版本：** 1.0  
**最后更新：** 2025年11月5日



