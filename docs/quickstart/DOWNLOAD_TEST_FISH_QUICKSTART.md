# 测试鱼数据下载快速指南

## ⚡ 3步快速完成

### 前提条件检查

确保`.env.local`已配置：
```bash
# Hasura
HASURA_GRAPHQL_ENDPOINT=https://your-project.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-admin-secret

# 七牛云
QINIU_ACCESS_KEY=your-key
QINIU_SECRET_KEY=your-secret
QINIU_BUCKET=your-bucket
QINIU_BASE_URL=https://your-cdn.com
QINIU_ZONE=Zone_na0
```

---

### 步骤1: 在Hasura创建fish_test表 (2分钟)

1. 打开Hasura Console → Data → SQL
2. 执行以下SQL（或复制`scripts/sql/create-fish-test-table.sql`的内容）：

```sql
CREATE TABLE IF NOT EXISTS fish_test (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  artist VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- 战斗系统字段
  talent INT NOT NULL DEFAULT 50,
  level INT NOT NULL DEFAULT 1,
  experience INT NOT NULL DEFAULT 0,
  health INT NOT NULL DEFAULT 10,
  max_health INT NOT NULL DEFAULT 10,
  battle_power DECIMAL(10,2) DEFAULT 0,
  last_exp_update TIMESTAMP DEFAULT NOW(),
  is_alive BOOLEAN DEFAULT TRUE,
  is_in_battle_mode BOOLEAN DEFAULT FALSE,
  position_row INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  total_losses INT DEFAULT 0,
  
  -- 原功能字段
  upvotes INT NOT NULL DEFAULT 0,
  downvotes INT NOT NULL DEFAULT 0,
  reported BOOLEAN DEFAULT FALSE,
  report_count INT DEFAULT 0,
  is_approved BOOLEAN DEFAULT TRUE,
  moderator_notes TEXT
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_fish_test_user_id ON fish_test(user_id);
CREATE INDEX IF NOT EXISTS idx_fish_test_created_at ON fish_test(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fish_test_level ON fish_test(level DESC);
```

3. **重要**: 在Hasura Console → Data → public，找到fish_test表，点击"Track"按钮

---

### 步骤2: 下载测试数据 (5-10分钟)

```bash
cd fish_art
node scripts/download-test-fish.js
```

脚本会：
- ✓ 从原作者API获取50条鱼数据
- ✓ 下载PNG图片
- ✓ 上传到七牛云
- ✓ 生成`temp/test-fish-data.json`

---

### 步骤3: 导入到Hasura (1-2分钟)

```bash
node scripts/import-test-fish.js
```

脚本会：
- ✓ 读取JSON数据
- ✓ 批量插入到fish_test表
- ✓ 显示统计信息

---

## ✅ 验证

在Hasura Console → API执行：

```graphql
query {
  fish_test_aggregate {
    aggregate {
      count
    }
  }
}
```

应该返回50条数据。

查看具体数据：

```graphql
query {
  fish_test(limit: 5, order_by: {created_at: desc}) {
    id
    artist
    image_url
    talent
    upvotes
  }
}
```

---

## 🎯 完成！

现在你有50条测试鱼数据可用于：
- 前端开发测试
- 战斗系统测试  
- 性能测试
- API测试

---

## 📚 详细文档

查看完整指南: `docs/temp_docs/TEST_FISH_DOWNLOAD_GUIDE.md`

---

## 🔧 故障排除

### fish_test表未找到
→ 确保在Hasura中Track了该表

### 七牛云上传失败  
→ 检查`.env.local`中的QINIU_ZONE配置

### Hasura连接失败
→ 检查`.env.local`中的Hasura配置

---

**现在可以开始测试了！** 🚀





















