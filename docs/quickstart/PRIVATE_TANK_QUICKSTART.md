# 私人鱼缸系统快速开始指南
## Private Tank System - Quick Start Guide

---

## 🚨 重要提示

**页面地址已更新：**
- ❌ 旧地址：`/fishtanks.html` 
- ✅ 新地址：`/mytank.html` （更容易区分）

所有导航链接已自动更新。

---

## ⚡ 立即开始的3个步骤

### 第1步：数据库设置 (5分钟)

1. **登录到你的PostgreSQL数据库**

2. **执行创建表SQL**
```bash
# 方式1：使用psql命令行
psql -d your_database -f scripts/create-favorites-table.sql

# 方式2：在Hasura Console执行
# 复制 scripts/create-favorites-table.sql 内容并在SQL标签页执行
```

3. **在Hasura Console中跟踪表**
   - 打开Hasura Console
   - 进入 Data > fish_favorites
   - 点击 "Track" 按钮
   - 设置关系（可选，提高查询效率）

### 第2步：数据迁移（可选，如果有现有数据）

**⚠️ 重要：执行前务必备份数据！**

```bash
# 备份数据库
pg_dump your_database > backup_$(date +%Y%m%d).sql

# 执行迁移
psql -d your_database -f scripts/migrate-user-tanks.sql
```

**迁移会做什么？**
- 为每个用户创建一个默认私人鱼缸
- 将多个鱼缸的鱼合并到一个默认鱼缸
- 删除旧的额外鱼缸

**如果你的数据库是全新的，可以跳过这一步！**

### 第3步：启动服务器测试

```bash
# 安装依赖（如果还没有）
npm install

# 启动开发服务器
npm run dev

# 访问
open http://localhost:3000
```

---

## 🧪 测试功能

### 1. 测试私人鱼缸页面

1. 登录你的账号
2. 访问 `/mytank.html` （或点击导航栏的 "My Tank" 按钮）
3. 你应该能看到：
   - ✅ **全屏游动的鱼缸画布**（类似全局鱼缸）
   - ✅ 你创建的所有鱼在水中游动
   - ✅ 你收藏的鱼也在其中游动
   - ✅ 统计信息（自己的鱼、收藏的鱼、平均等级等）
   - ✅ 鱼上方显示标识（ME = 自己的，❤️ = 收藏的）

### 2. 测试收藏功能

1. 访问 `/rank.html` （排名页面）
2. 找到其他用户的鱼
3. 点击 🤍 按钮收藏
4. 返回 `/mytank.html` 查看你的收藏在鱼缸中游动

### 3. 测试喂食功能

1. 在私人鱼缸页面：
   - **桌面端**：按住 Shift + 点击，或右键点击投放食物
   - **移动端**：双击或长按投放食物
2. 观察鱼儿游向食物并吃掉它
3. 食物会缓缓下沉，15秒后消失

---

## 📁 重要文件位置

### 前端页面
- **私人鱼缸页面：** `mytank.html` - 全屏游动鱼缸界面 ⭐ NEW
- **旧版本（已废弃）：** `fishtanks.html` - 可以删除
- **排名页面（含收藏）：** `rank.html`
- **全局鱼缸（参考）：** `tank.html`

### JavaScript文件
- **私人鱼缸动画：** `src/js/private-fishtank-swim.js` - 新的游动动画逻辑
- **收藏功能：** `src/js/fishtank-favorites.js` - 收藏和背景管理
- **全局鱼缸（参考）：** `src/js/tank.js` - 原始动画逻辑

### 数据库脚本
- **创建表：** `scripts/create-favorites-table.sql`
- **数据迁移：** `scripts/migrate-user-tanks.sql`

### API端点
- **鱼缸API：** `api/fishtank/*.js` （6个端点）

### 配置文件
- **背景配置：** `api/config/fishtank-config.js`
- **环境变量：** `.env.local`（需要包含Supabase和Hasura配置）

---

## ✨ 特性说明

### 界面特点
- **全屏游动鱼缸**：私人鱼缸现在使用与全局鱼缸相同的全屏动画界面
- **鱼儿标识**：
  - 蓝色圆圈标记 "ME" = 你自己画的鱼
  - 红心 ❤️ = 你收藏的其他用户的鱼
  - 骷髅 💀 = 已死亡的鱼（游动速度较慢，会下沉）
- **统计信息**：底部控制栏显示自己的鱼数量、收藏数量、平均等级
- **喂食互动**：可以投喂食物，鱼儿会游过来吃

### 与全局鱼缸的区别
| 功能 | 全局鱼缸 (tank.html) | 私人鱼缸 (mytank.html) |
|------|---------------------|------------------------|
| 显示的鱼 | 所有用户的鱼（按排序） | 只显示自己的 + 收藏的鱼 |
| 战斗按钮 | ✅ 有 | ❌ 无 |
| 分享按钮 | ✅ 有 | ❌ 无 |
| 排序选项 | ✅ 有（最新/热门/随机） | ❌ 无 |
| 鱼食余额 | ❌ 不显示 | ✅ 显示 |
| 导航链接 | 所有主要页面 | 简化的导航 |

---

## 🔧 常见问题

### Q: 私人鱼缸页面没有显示鱼？
**A:** 按以下步骤调试：

1. **确认已登录**：页面应显示鱼食余额
2. **打开浏览器控制台** (F12)，查看是否有以下日志：
   ```
   🐠 Loading fish for user: [你的用户ID]
   ✅ Loaded X fish from database
   🐟 Created X fish objects for animation
   ```
3. **如果看到 "Not logged in" 错误**：
   - 先访问 `/login.html` 登录
   - 刷新 `/mytank.html` 页面

4. **如果看到 "0 fish loaded"**：
   - 确认你已经画过鱼（访问 `/index.html` 画鱼）
   - 在控制台运行：
     ```javascript
     window.supabaseAuth.getCurrentUser().then(u => console.log('User ID:', u.id))
     ```
   - 检查 Hasura 数据库中是否有你的鱼数据

5. **如果看到 Hasura 错误**：
   - 检查 `window.HASURA_ENDPOINT` 是否正确
   - 确认 Hasura 服务正常运行

### Q: 鱼不会游动？
**A:**
1. 检查浏览器控制台是否有JavaScript错误
2. 确保 `private-fishtank-swim.js` 正确加载
3. 刷新页面重试

### Q: 收藏按钮在哪里？
**A:** 
- 收藏按钮在排名页面 (`rank.html`) 和全局鱼缸 (`tank.html`) 上
- 在每条鱼旁边会显示 🤍 或 ❤️ 图标
- 点击即可收藏/取消收藏

### Q: 投喂食物没有反应？
**A:** 确保：
1. **桌面端**：按住 Shift 键后点击，或使用右键点击
2. **移动端**：快速双击或长按屏幕
3. 鱼如果在附近会自动游过来吃食物

### Q: 数据库迁移出错？
**A:**
1. 恢复备份：`psql -d your_database < backup.sql`
2. 检查表结构是否正确
3. 查看错误日志

### Q: API返回401错误？
**A:**
1. 检查 `.env.local` 配置
2. 确认Supabase token有效
3. 检查Hasura admin secret

---

## 📊 监控和日志

### 查看收藏统计
```sql
SELECT COUNT(*) as total_favorites FROM fish_favorites;
SELECT user_id, COUNT(*) as fav_count 
FROM fish_favorites 
GROUP BY user_id 
ORDER BY fav_count DESC 
LIMIT 10;
```

### 查看鱼缸统计
```sql
SELECT COUNT(*) as total_tanks FROM fishtanks WHERE is_default = TRUE;
SELECT COUNT(DISTINCT user_id) as users_with_tanks FROM fishtanks;
```

---

## 🚀 性能优化建议

1. **添加数据库索引** （如果表很大）
```sql
CREATE INDEX CONCURRENTLY idx_fish_favorites_combined 
ON fish_favorites(user_id, fish_id, created_at DESC);
```

2. **启用CDN** 缓存背景图片

3. **配置Redis** 缓存收藏状态（高级）

---

## 📞 获取帮助

- **详细文档：** 查看 `docs/PRIVATE_TANK_IMPLEMENTATION.md`
- **Hasura文档：** https://hasura.io/docs/
- **Supabase文档：** https://supabase.com/docs

---

## ✅ 完成清单

部署前确认：

- [ ] 数据库表已创建 (`fish_favorites`)
- [ ] Hasura已跟踪表
- [ ] 环境变量已配置
- [ ] 已测试私人鱼缸页面（游动动画）
- [ ] 已测试收藏功能
- [ ] 已测试喂食功能
- [ ] 鱼儿标识正常显示（ME/❤️/💀）
- [ ] 统计信息正确显示
- [ ] 数据已迁移（如有现有数据）

---

## 🎯 改进总结

**本次更新内容：**
1. ✅ 将私人鱼缸页面改造为全屏游动鱼缸（与全局鱼缸界面一致）
2. ✅ 只显示用户自己的鱼和收藏的鱼
3. ✅ 移除了不必要的按钮（战斗、分享等）
4. ✅ 保留了核心功能（喂食、统计、导航）
5. ✅ 添加了鱼儿标识（ME/❤️/💀）
6. ✅ 创建了新的JavaScript动画文件 (`private-fishtank-swim.js`)

**与全局鱼缸的关系：**
- 界面布局完全一致
- 动画逻辑相似（基于 `tank.js` 改造）
- 主要区别：显示的鱼只限于用户自己的和收藏的

---

**祝你使用愉快！🐠**

如果遇到问题，请检查浏览器控制台和服务器日志。


