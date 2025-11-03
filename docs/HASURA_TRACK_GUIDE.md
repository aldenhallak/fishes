# Hasura表跟踪指南

## ✅ SQL执行成功了吗？

如果你看到"Untracked tables or views"列表显示了以下表，说明SQL**已经成功执行**：

- battle_config
- battle_fish (视图)
- battle_log
- economy_log
- fish
- fish_with_scores (视图)
- reports
- user_economy
- user_fish_summary (视图)
- votes

## 🎯 为什么表在左侧看不到？

Hasura需要**"跟踪"（Track）**表才能：
- ✅ 在左侧Data Manager中显示
- ✅ 通过GraphQL API访问
- ✅ 配置权限和关系

## 🔧 如何跟踪表？

### 方法1：一键跟踪所有（推荐）⭐

1. 在"Untracked tables or views"区域
2. 点击右上角的 **"Track All"** 按钮
3. 等待几秒钟
4. 完成！左侧会显示所有表

### 方法2：逐个跟踪

如果需要选择性跟踪：

1. 找到要跟踪的表（如`fish`）
2. 点击该表旁边的 **"Track"** 按钮
3. 重复操作其他表

## ✅ 验证是否成功

跟踪完成后，左侧应该显示：

```
📂 public
  ├── 📄 battle_config
  ├── 📄 battle_fish (视图)
  ├── 📄 battle_log
  ├── 📄 economy_log
  ├── 📄 fish
  ├── 📄 fish_with_scores (视图)
  ├── 📄 reports
  ├── 📄 user_economy
  ├── 📄 user_fish_summary (视图)
  └── 📄 votes
```

## 🧪 测试GraphQL API

跟踪后，可以在API标签页测试：

```graphql
# 查询鱼的数量
query {
  fish_aggregate {
    aggregate {
      count
    }
  }
}

# 查询战斗配置
query {
  battle_config_by_pk(id: 1) {
    level_weight
    talent_weight
    upvote_weight
  }
}

# 查询所有鱼（前10条）
query {
  fish(limit: 10, order_by: {created_at: desc}) {
    id
    artist
    level
    talent
    upvotes
  }
}
```

## 🔗 下一步：配置关系

跟踪表后，建议配置外键关系（可选，但推荐）：

### fish → votes (一对多)
- Relationship: votes
- Type: Array relationship
- Reference: votes.fish_id → fish.id

### fish → reports (一对多)
- Relationship: reports
- Type: Array relationship
- Reference: reports.fish_id → fish.id

### battle_log → fish (多对一)
- Relationship: attacker
- Type: Object relationship
- Reference: battle_log.attacker_id → fish.id

- Relationship: defender
- Type: Object relationship
- Reference: battle_log.defender_id → fish.id

这样就可以通过GraphQL轻松查询关联数据了！

## ❓ 常见问题

**Q: Track All后还是看不到表？**  
A: 刷新浏览器页面，或清除缓存

**Q: 可以只Track部分表吗？**  
A: 可以，但建议Track所有表，因为它们相互关联

**Q: 视图和表有什么区别？**  
A: 视图是虚拟表，数据来自其他表的查询结果。在Hasura中，视图和表的使用方式相同。

**Q: Track后可以取消吗？**  
A: 可以，在表的设置中点击"Untrack"

---

完成！现在你的Hasura已经完全配置好了！🎉



