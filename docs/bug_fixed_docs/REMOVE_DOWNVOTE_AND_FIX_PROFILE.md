# 移除Downvote功能并修复Profile页面连接

## 修复日期
2025-11-04

## 问题描述

1. **Profile页面后端连接问题**
   - `profile.html` 页面直接连接到原作者后端 API
   - 未使用 Hasura 数据库，导致数据不一致

2. **Downvote功能移除需求**
   - 用户要求只保留点赞（upvote）功能
   - 移除点踩（downvote）功能和 score 计算
   - 简化投票系统，只显示点赞数

## 解决方案

### 1. 修复Profile页面后端连接

#### 1.1 创建Hasura GraphQL查询函数

在 `src/js/profile.js` 中创建 `getUserProfileFromHasura()` 函数：

```javascript
async function getUserProfileFromHasura(userId) {
    const query = `
        query GetUserProfile($userId: String!) {
            users_by_pk(id: $userId) {
                id
                display_name
                email
                avatar_url
                created_at
                total_fish_created
                reputation_score
                fishes_aggregate {
                    aggregate {
                        count
                        sum {
                            upvotes
                        }
                    }
                }
            }
        }
    `;
    // 调用 /api/graphql 端点
}
```

#### 1.2 修改Profile UI

**profile.html:**
- 移除 "Total Downvotes" 统计项
- 移除 "Total Score" 统计项（现在只显示upvotes）
- 保留 "Fish Created" 和 "Total Upvotes" 统计

**profile.js:**
- 移除 `totalDownvotes` 和 `totalScore` 的显示逻辑
- 移除分数颜色设置代码

### 2. 移除Downvote功能

#### 2.1 数据库迁移

创建 `scripts/remove-downvotes.sql`:

```sql
-- 删除所有downvote类型的投票记录
DELETE FROM public.votes WHERE vote_type = 'down';

-- 移除fish表的downvotes字段
ALTER TABLE public.fish DROP COLUMN IF EXISTS downvotes;

-- 添加约束确保只有'up'类型的投票
ALTER TABLE public.votes ADD CONSTRAINT votes_type_check CHECK (vote_type = 'up');
```

#### 2.2 修改API端点

**api/vote/vote.js:**
- 移除 'down' 投票类型支持
- 简化逻辑为只处理 upvote/cancel upvote
- 更新GraphQL查询，不再查询 downvotes 字段
- 响应中移除 `downvotes` 和 `score` 字段

#### 2.3 修改前端JavaScript

**fish-utils.js:**
- 删除 `calculateScore()` 函数
- 修改 `createVotingControlsHTML()` 函数签名：
  - 从 `(fishId, upvotes, downvotes, includeScore, cssClass)` 
  - 改为 `(fishId, upvotes, cssClass)`
- 移除 downvote 按钮HTML
- 移除 score 显示
- 从GraphQL查询中删除 `downvotes` 字段

**rank.js:**
- 移除所有 `calculateScore(fish)` 调用
- 移除 `fish.score` 相关显示逻辑
- 删除 "Sort by Score" 排序选项
- 修改 `createFishCard()` 函数，移除 score 和 downvote 按钮
- 修改 `handleVote()` 函数，只处理 upvote 逻辑
- 修改 `updateFishCard()` 函数，移除 downvote 元素更新
- 移除客户端 score 排序逻辑

**tank.js:**
- 修改 `createFish()` 函数参数，移除 `downvotes` 和 `score`
- 修改 `showFishDetails()` 函数：
  - 将 score 显示改为 upvotes 显示
  - 更新 `createVotingControlsHTML()` 调用
- 修改 `handleVote()` 函数，只处理 upvote 逻辑
- 移除 downvote 相关的 DOM 元素更新

#### 2.4 修改HTML和CSS

**profile.html:**
- 移除 `total-downvotes` 和 `total-score` 统计项

**rank.html:**
- 删除 `.downvote-btn` 和 `.downvote-btn:hover` CSS样式

**tank.html:**
- 删除 `.downvote-btn` 和 `.downvote-btn:hover` CSS样式

## 修改文件清单

### 数据库
- `scripts/remove-downvotes.sql` - 新建
- `scripts/EXECUTE_MIGRATION.md` - 新建

### API
- `api/vote/vote.js` - 修改

### 前端JavaScript
- `src/js/profile.js` - 修改
- `src/js/fish-utils.js` - 修改
- `src/js/rank.js` - 修改
- `src/js/tank.js` - 修改

### HTML
- `profile.html` - 修改
- `rank.html` - 修改 (CSS)
- `tank.html` - 修改 (CSS)

## 测试要点

### 1. Profile页面
- ✅ 访问 `http://localhost:3000/profile.html?userId={userId}`
- ✅ 确认数据从Hasura加载
- ✅ 统计只显示 "Fish Created" 和 "Total Upvotes"
- ✅ 没有 "Total Downvotes" 和 "Total Score" 显示

### 2. 投票功能
- ✅ 点击点赞按钮可以增加点赞数
- ✅ 再次点击可以取消点赞
- ✅ 没有点踩按钮显示
- ✅ 投票响应只包含 upvotes

### 3. 排名页面 (rank.html)
- ✅ 鱼卡片只显示点赞按钮
- ✅ 没有 score 显示
- ✅ 排序选项中没有 "Sort by Score"
- ✅ 投票功能正常工作

### 4. 鱼缸页面 (tank.html)
- ✅ 鱼的详情模态框只显示 upvotes
- ✅ 没有 downvote 按钮
- ✅ 投票功能正常工作

## 数据库Schema变更

### 变更前
```sql
fish {
  id uuid
  upvotes int
  downvotes int  -- 已删除
  ...
}

votes {
  vote_type varchar  -- 可以是 'up' 或 'down'
}
```

### 变更后
```sql
fish {
  id uuid
  upvotes int
  -- downvotes 字段已删除
  ...
}

votes {
  vote_type varchar  -- 只能是 'up'（添加了约束）
}
```

## API变更

### 投票API响应格式

**变更前:**
```json
{
  "success": true,
  "action": "upvote",
  "upvotes": 10,
  "downvotes": 2,
  "score": 8
}
```

**变更后:**
```json
{
  "success": true,
  "action": "upvote",
  "upvotes": 10
}
```

## 回滚方案

如果需要回滚此变更：

1. **数据库回滚:**
   ```sql
   -- 添加回downvotes字段
   ALTER TABLE public.fish ADD COLUMN downvotes INT DEFAULT 0;
   
   -- 移除约束
   ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_type_check;
   ```

2. **代码回滚:**
   - 使用 Git 回滚到此次修改之前的提交
   - 或手动恢复被修改的文件

## 注意事项

1. **数据丢失:** 所有 downvote 数据已被永久删除，无法恢复
2. **兼容性:** 旧版本前端代码将无法正确显示（因为 downvotes 字段已删除）
3. **缓存清理:** 用户可能需要清除浏览器缓存以看到最新的UI变化
4. **Profile数据:** Profile页面现在从Hasura加载，数据源已改变

## 相关文档

- `docs/bug_fixed_docs/AUTH_CHECK_OPTIMIZATION.md` - 认证检查优化
- `docs/bug_fixed_docs/FISH_SUBMIT_FOREIGN_KEY_FIX.md` - 鱼提交外键修复
- `scripts/EXECUTE_MIGRATION.md` - 数据库迁移执行说明

## 后续优化建议

1. 考虑添加其他互动方式（如收藏、分享）
2. 优化投票按钮的视觉反馈
3. 添加投票历史记录功能
4. 实现实时投票更新（使用 Hasura subscriptions）


























