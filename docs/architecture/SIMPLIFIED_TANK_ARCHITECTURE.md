# 🏗️ 简化的鱼缸架构

**更新日期**: 2025-11-08

## 📋 架构概述

从复杂的多鱼缸系统简化为两种视图：
- **Global Tank**（全局鱼缸）- 显示所有用户的鱼
- **Private Tank**（私人鱼缸）- 显示用户自己的鱼 + 收藏的鱼

---

## 🗄️ 数据库结构

### 保留的表

#### 1. `fish` 表
存储所有鱼的信息（已存在）

```sql
CREATE TABLE fish (
    id UUID PRIMARY KEY,
    user_id TEXT,  -- 鱼的创建者
    fish_name TEXT,
    personality TEXT,
    image_url TEXT,
    is_approved BOOLEAN,
    created_at TIMESTAMP,
    ...
);
```

#### 2. `fish_favorites` 表
简单的用户收藏关联（已存在）

```sql
CREATE TABLE fish_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    fish_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_fish_favorite UNIQUE(user_id, fish_id),
    CONSTRAINT fk_favorite_fish FOREIGN KEY (fish_id) REFERENCES fish(id) ON DELETE CASCADE
);

CREATE INDEX idx_fish_favorites_user_id ON fish_favorites(user_id);
CREATE INDEX idx_fish_favorites_fish_id ON fish_favorites(fish_id);
```

### 删除的表

- ❌ `fishtanks` - 不再需要多个鱼缸
- ❌ `fishtank_fish` - 不再需要鱼缸-鱼关联
- ❌ `fishtank_views` - 浏览记录不需要了

---

## 🔌 API 端点

### 保留并重命名

#### 1. 收藏功能
```
POST /api/fish/favorite     (原 /api/fishtank/favorite)
POST /api/fish/unfavorite   (原 /api/fishtank/unfavorite)
```

#### 2. Private Tank 查询
```
GET /api/fish/my-tank
```
- 返回用户自己创建的鱼 + 收藏的鱼
- 简化查询逻辑

### 删除的端点

- ❌ `/api/fishtank/get-or-create-default`
- ❌ `/api/fishtank/my-fish`（重构为/api/fish/my-tank）
- ❌ `/api/fishtank/backgrounds`
- ❌ `/api/fishtank/change-background`
- ❌ 所有其他fishtank相关端点

---

## 📱 前端页面

### 保留的页面

1. **community.html** - Global Tank
   - 显示所有approved的鱼
   - 保持现有功能

2. **mytank.html** - Private Tank（重构）
   - 显示：用户自己的鱼 + 收藏的鱼
   - 简化为单一视图，无需切换鱼缸

### 删除的页面

- ❌ `fishtanks.html` - 鱼缸列表
- ❌ `fishtank-view.html` - 单个鱼缸查看

### 删除的JS模块

- ❌ `fishtanks.js` - 鱼缸列表逻辑
- ❌ `fishtank-view.js` - 鱼缸查看逻辑
- ❌ `fishtank-hasura.js` - Hasura鱼缸查询
- ❌ `fishtank-adapter.js` - 鱼缸适配器
- ❌ `fishtank-view-battle.js` - 鱼缸战斗视图
- ❌ `private-fishtank-swim.js` - 私人鱼缸游泳逻辑
- ❌ `fishtank-config.js` - 鱼缸配置

### 保留并重构的JS模块

- ✅ `fishtank-favorites.js` → 重命名为 `fish-favorites.js`
  - 简化为纯收藏功能
  - 移除鱼缸相关逻辑

---

## 🔄 查询逻辑

### Global Tank (community.html)
```sql
-- 显示所有approved的鱼
SELECT * FROM fish 
WHERE is_approved = true 
ORDER BY created_at DESC;
```

### Private Tank (mytank.html)
```sql
-- 显示用户自己的鱼 + 收藏的鱼
SELECT f.* 
FROM fish f
WHERE f.user_id = $userId           -- 用户自己的鱼
   OR f.id IN (                      -- 用户收藏的鱼
       SELECT fish_id 
       FROM fish_favorites 
       WHERE user_id = $userId
   )
ORDER BY f.created_at DESC;
```

或使用 Hasura GraphQL：
```graphql
query GetMyTankFish($userId: String!) {
  # 用户自己的鱼
  ownFish: fish(
    where: {user_id: {_eq: $userId}}
    order_by: {created_at: desc}
  ) {
    id
    fish_name
    image_url
    personality
    created_at
  }
  
  # 用户收藏的鱼
  favoriteFish: fish_favorites(
    where: {user_id: {_eq: $userId}}
    order_by: {created_at: desc}
  ) {
    fish {
      id
      fish_name
      image_url
      personality
      created_at
      user_id
    }
  }
}
```

---

## 🎯 收藏功能

### 逻辑简化

**添加收藏**：
1. 检查是否已收藏
2. 检查是否是自己的鱼（不能收藏自己的）
3. 检查鱼是否approved
4. 插入到`fish_favorites`表

**取消收藏**：
1. 从`fish_favorites`表删除记录

**查询收藏状态**：
```sql
SELECT EXISTS(
    SELECT 1 FROM fish_favorites 
    WHERE user_id = $userId AND fish_id = $fishId
) as is_favorited;
```

---

## 🚀 迁移步骤

### 1. 数据库清理（可选）
```sql
-- 备份数据（如果需要）
-- ...

-- 删除旧表
DROP TABLE IF EXISTS fishtank_views CASCADE;
DROP TABLE IF EXISTS fishtank_fish CASCADE;
DROP TABLE IF EXISTS fishtanks CASCADE;
```

### 2. API重构
- ✅ 保留 favorite/unfavorite 端点
- ✅ 创建新的 /api/fish/my-tank 端点
- ❌ 删除其他 fishtank 端点

### 3. 前端重构
- ✅ 重构 mytank.html 为简化的私人鱼缸
- ❌ 删除 fishtanks.html 和相关代码
- ✅ 更新导航链接
- ✅ 简化收藏JS模块

### 4. 测试
- [ ] 测试 Global Tank 显示
- [ ] 测试 Private Tank 显示（自己的+收藏的）
- [ ] 测试收藏/取消收藏功能
- [ ] 测试未登录状态的处理

---

## 📦 简化的优势

1. **更简单的数据模型** - 只需要2个表
2. **更快的查询** - 减少JOIN操作
3. **更直观的UI** - 只有两种视图
4. **更少的代码** - 删除大量不必要的复杂逻辑
5. **更容易维护** - 减少bug和复杂性

---

## 🔗 相关文档

- [原有私人鱼缸文档](../features/PRIVATE_TANK_IMPLEMENTATION.md)（已废弃）
- [收藏功能API文档](../api_docs/FISH_FAVORITES_API.md)（待创建）
- [数据库Schema](../../sql/)

---

## ⚠️ 注意事项

1. 如果有用户创建了多个鱼缸，迁移前需要决定如何处理这些数据
2. Private Tank现在只是一个"视图"，不是实际的表
3. 收藏限制（MAX_FAVORITES_PER_USER）可以保留
4. 所有现有的收藏数据会保留（fish_favorites表）

---

## 🎨 UI/UX变化

### 导航栏
**之前**：
```
Home | Community | My Tank | My Fishtanks | Profile
```

**现在**：
```
Home | Community | My Tank | Profile
```

### My Tank页面
**之前**：
- 下拉选择鱼缸
- 鱼缸设置按钮
- 背景切换
- 鱼缸命名/描述

**现在**：
- 简单标签切换："My Fish" | "Favorites"
- 或直接显示所有（自己的+收藏的）
- 无需任何设置

---

## 🔧 配置更新

### 环境变量（无需变化）
```bash
SUPABASE_URL=xxx
SUPABASE_ANON_KEY=xxx
HASURA_GRAPHQL_ENDPOINT=xxx
HASURA_ADMIN_SECRET=xxx
```

### 删除的配置
- `MAX_FISHTANKS_PER_USER`（不再需要）
- `MAX_FISH_PER_TANK`（不再需要）
- `BACKGROUNDS` 配置（可选：如果Global Tank也不需要背景切换）

---

**文档版本**: 1.0  
**最后更新**: 2025-11-08  
**状态**: 🚧 进行中

