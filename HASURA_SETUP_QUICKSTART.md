# ⚡ Hasura 快速配置指南

## 🎯 3步快速配置

### Step 1: 更新 battle_config 表（30秒）

在 Hasura Console → Data → SQL：

```sql
ALTER TABLE battle_config
ADD COLUMN IF NOT EXISTS max_battle_users INT DEFAULT 50,
ADD COLUMN IF NOT EXISTS battle_cooldown_seconds INT DEFAULT 30;
```

**验证**：
```sql
SELECT * FROM battle_config;
```

---

### Step 2: Track 所有视图（1分钟）

在 Hasura Console → Data → public：

点击 **"Track All"** 按钮，Track以下视图：
- `fish_with_scores`
- `battle_fish`  
- `user_fish_summary`

---

### Step 3: 配置基本权限（5分钟）

#### fish 表（最重要）

**Select - 公开读取**：
- Role: `public`
- Filter: `{ "is_approved": { "_eq": true }, "reported": { "_eq": false } }`

**Insert - 认证用户**：
- Role: `user`
- Check: `{ "user_id": { "_eq": "X-Hasura-User-Id" } }`
- Preset: `user_id` = `x-hasura-user-id`

---

## ✅ 完成！

基本配置完成后，可以：
1. ✅ 查询鱼数据
2. ✅ 认证用户创建鱼
3. ✅ 权限控制生效

---

## 📚 详细配置

查看完整权限配置：`docs/HASURA_PERMISSIONS_SETUP.md`

---

**现在可以使用API了！** 🚀

