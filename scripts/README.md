# 🛠️ 测试脚本使用指南

## 下载鱼数据

### 快速开始

```bash
# 1. 下载50条鱼数据（不含图片，快速）
node scripts/download-fish-data.js

# 2. 下载100条鱼数据并下载图片（慢但完整）
node scripts/download-fish-data.js --count=100 --images

# 3. 只下载20条用于快速测试
node scripts/download-fish-data.js --count=20
```

### 输出文件

```
test-data/
├── fish-data.json        # JSON格式鱼数据
├── insert-fish.sql       # SQL插入脚本
└── images/               # 鱼图片（如果使用--images）
    ├── {fishId1}.png
    ├── {fishId2}.png
    └── ...
```

### 导入到数据库

**方法1：使用SQL脚本**
```bash
# PostgreSQL
psql -U your_user -d your_database -f test-data/insert-fish.sql

# 或通过Hasura Console
# 复制test-data/insert-fish.sql内容，在SQL标签页执行
```

**方法2：使用Node.js脚本**
```javascript
// scripts/import-to-hasura.js
const fs = require('fs');
const fishData = JSON.parse(fs.readFileSync('./test-data/fish-data.json'));

// 使用Hasura GraphQL批量插入
// ... (见下方完整脚本)
```

---

## Redis配置选择

### 方案对比

| 方案 | 成本 | 性能 | 推荐度 |
|-----|-----|------|--------|
| **Upstash付费版** | $10/月 | ⭐⭐⭐⭐⭐ | ✅ 推荐 |
| **减少心跳频率** | $0 | ⭐⭐⭐ | ⚠️ 可用 |
| **不用Redis** | $0 | ⭐⭐ | ❌ 不推荐 |

### 推荐配置：Upstash Pro

```bash
# 注册地址
https://upstash.com/

# 定价
- 100万次请求/月
- 1GB存储
- 支持持久化
- $10/月（年付$96）

# 免费试用
- 注册后有7天试用期
- 支持信用卡验证（不扣费）
```

---

## 下一步

1. ✅ 下载测试数据
2. ✅ 配置Redis（Upstash）
3. ⏳ 执行数据库迁移
4. ⏳ 开始实施战斗系统

