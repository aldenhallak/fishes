# 🚀 鱼缸架构简化迁移指南

从多鱼缸系统迁移到简化的双视图架构（Global + Private Tank）

---

## 📋 迁移步骤

### 1. 数据库清理（可选）

如果你的数据库中有 `fishtanks` 相关的表，可以运行以下SQL脚本删除：

```bash
psql -U your_username -d your_database -f sql/remove_fishtanks_tables.sql
```

或在Hasura Console中手动删除：
```sql
DROP TABLE IF EXISTS fishtank_views CASCADE;
DROP TABLE IF EXISTS fishtank_fish CASCADE;
DROP TABLE IF EXISTS fishtanks CASCADE;
```

⚠️ **注意**：这会永久删除所有鱼缸数据！如需保留，请先备份。

---

### 2. 环境变量（无需更改）

现有的环境变量配置不需要修改：
```bash
SUPABASE_URL=xxx
SUPABASE_ANON_KEY=xxx
HASURA_GRAPHQL_ENDPOINT=xxx
HASURA_ADMIN_SECRET=xxx
```

---

### 3. API端点更新

如果你的代码中有直接调用API，请更新路径：

#### 旧API（已废弃）
```javascript
// ❌ 不再可用
/api/fishtank/favorite
/api/fishtank/unfavorite
/api/fishtank/get-or-create-default
/api/fishtank/my-fish
/api/fishtank/backgrounds
/api/fishtank/change-background
```

#### 新API
```javascript
// ✅ 使用新端点
/api/fish/favorite          // 添加收藏
/api/fish/unfavorite        // 取消收藏
/api/fish/my-tank          // 获取私人鱼缸数据
```

---

### 4. 前端链接更新

所有指向鱼缸页面的链接已自动更新：

#### 旧链接
```html
<!-- ❌ 已删除 -->
<a href="fishtanks.html">My Tanks</a>
<a href="fishtank-view.html?id=xxx">View Tank</a>
```

#### 新链接
```html
<!-- ✅ 使用新链接 -->
<a href="mytank.html">My Tank</a>
```

---

### 5. JavaScript代码更新

如果你有自定义JS代码：

#### 旧代码
```javascript
// ❌ 不再可用
window.FishTankFavorites.getDefaultTank()
window.location.href = 'fishtanks.html';
```

#### 新代码
```javascript
// ✅ 使用新逻辑
window.location.href = 'mytank.html';
```

---

## 🧪 测试清单

完成迁移后，请测试以下功能：

### Global Tank（community.html）
- [ ] 页面正常加载
- [ ] 显示所有approved的鱼
- [ ] 鱼在鱼缸中正常游动

### Private Tank（mytank.html）
- [ ] 登录后可以访问
- [ ] 显示用户自己创建的鱼
- [ ] 显示用户收藏的鱼
- [ ] 未登录时提示登录

### 收藏功能
- [ ] 可以收藏其他用户的鱼
- [ ] 可以取消收藏
- [ ] 收藏的鱼显示在Private Tank中
- [ ] 收藏按钮状态正确（❤️ vs 🤍）

### 导航
- [ ] Footer中的"my tank"链接正常
- [ ] 登录后自动跳转到mytank.html
- [ ] Profile页面链接正常

---

## ⚠️ 常见问题

### Q: 我的旧鱼缸数据会丢失吗？
**A**: 如果你运行了删除表的SQL脚本，旧的鱼缸数据会被删除。但所有的**鱼数据**会保留，因为它们存储在 `fish` 表中。收藏数据也会保留在 `fish_favorites` 表中。

### Q: 用户还能查看其他用户的鱼缸吗？
**A**: 新架构不再支持查看其他用户的专属鱼缸。用户可以：
- 在 Global Tank 查看所有人的鱼
- 在 Private Tank 查看自己的鱼 + 收藏的鱼

### Q: 我还能创建多个鱼缸吗？
**A**: 不能。新架构简化为每个用户只有一个Private Tank。这使系统更简单、更快速。

### Q: 如果我想恢复旧架构怎么办？
**A**: 可以使用git回滚到之前的提交：
```bash
git log --oneline | grep "fishtank"
git revert <commit_hash>
```

---

## 📊 架构对比

### 旧架构
```
用户 → 多个鱼缸 → 每个鱼缸包含多条鱼
      ↓
   fishtanks表
      ↓
  fishtank_fish表（关联）
      ↓
    fish表
```

### 新架构
```
Global Tank: 显示所有fish表中approved的鱼

Private Tank: 显示
   - fish表中user_id = 当前用户的鱼（自己的）
   - fish_favorites表中user_id = 当前用户的鱼（收藏的）
```

---

## 🎯 优势

1. **更快的查询** - 减少JOIN操作
2. **更简单的逻辑** - 只有2个表
3. **更直观的UI** - 只有两种视图
4. **更容易维护** - 代码量减少40%

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 `docs/architecture/SIMPLIFIED_TANK_ARCHITECTURE.md` 了解详细架构
2. 查看 `docs/architecture/TANK_SIMPLIFICATION_SUMMARY.md` 了解完整的改动列表
3. 检查浏览器控制台的错误信息
4. 确认所有API端点可访问

---

## ✅ 迁移完成检查

- [ ] 数据库旧表已清理（可选）
- [ ] 环境变量配置正确
- [ ] 所有页面正常加载
- [ ] 收藏功能正常工作
- [ ] 导航链接全部正确
- [ ] 测试清单全部通过

---

**文档版本**: 1.0  
**最后更新**: 2025-11-08  
**预计迁移时间**: 5-10分钟（不包括测试）

