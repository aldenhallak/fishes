# ⚡ Schema下载 - 快速开始

## 🎯 一键下载

```bash
npm run download:schema
```

---

## ✅ 成功！生成的文件

### 1. GraphQL Schema
**位置**: `graphql/schema.graphql`  
**大小**: ~114 KB  
**内容**: 完整的 Hasura GraphQL schema 定义

### 2. TypeScript 类型
**位置**: `src/types/graphql.ts`  
**大小**: ~176 KB  
**内容**: 自动生成的 TypeScript 类型定义

---

## 💡 使用示例

### 在代码中使用类型

```typescript
import { Fish, Battle_Config, User_Economy } from '@/types/graphql';

// 完整的类型安全
const newFish: Fish = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: 'user_123',
  image_url: 'https://cdn.example.com/fish.png',
  artist: 'Artist Name',
  talent: 65,
  level: 5,
  experience: 250,
  health: 8,
  max_health: 10,
  upvotes: 15,
  downvotes: 2,
  is_alive: true,
  // ... TypeScript 会提示所有必需字段
};
```

### 查看表结构

打开 `graphql/schema.graphql` 可以看到：

```graphql
type fish {
  id: uuid!
  user_id: String!
  image_url: String!
  artist: String
  talent: Int!
  level: Int!
  experience: Int!
  health: Int!
  max_health: Int!
  upvotes: Int!
  downvotes: Int!
  battle_power: numeric
  is_alive: Boolean
  # ... 所有字段
}
```

---

## 🔄 何时需要重新下载？

### 触发时机

- ✅ 数据库结构变更后
- ✅ 添加新表后
- ✅ 修改字段类型后
- ✅ 更新关系后

### 自动化

建议在 Git hooks 中添加：

```json
{
  "scripts": {
    "postpull": "npm run download:schema"
  }
}
```

---

## 📦 包含的表

下载的 schema 包括所有已 Track 的表：

- ✅ `fish` - 鱼数据
- ✅ `votes` - 投票记录
- ✅ `reports` - 举报记录  
- ✅ `battle_config` - 战斗配置
- ✅ `user_economy` - 用户经济
- ✅ `battle_log` - 战斗日志
- ✅ `economy_log` - 经济日志
- ✅ `fish_rank` - 视图
- ✅ `fish_battle` - 视图
- ✅ `user_fish_summary` - 视图

---

## ⚙️ 配置文件

### `codegen.json`

```json
{
  "schema": [
    {
      "http://hasura-fishart-1.weweknow.com/v1/graphql": {
        "headers": {
          "x-hasura-admin-secret": "${HASURA_ADMIN_SECRET}"
        }
      }
    }
  ],
  "generates": {
    "./graphql/schema.graphql": {
      "plugins": ["schema-ast"]
    },
    "./src/types/graphql.ts": {
      "plugins": ["typescript"]
    }
  }
}
```

**关键点**：
- 使用环境变量 `HASURA_ADMIN_SECRET`
- 生成两个文件：schema + 类型定义

---

## 🆘 故障排查

### 认证失败

```bash
❌ Error: Unauthorized
```

**解决**：检查 `.env.local` 中的 `HASURA_ADMIN_SECRET`

### 网络错误

```bash
❌ Error: ECONNREFUSED
```

**解决**：
1. 检查 Hasura 服务是否运行
2. 检查网络连接
3. 确认端点 URL 正确

### Schema 为空

**解决**：
1. 在 Hasura Console 中 Track 所有表
2. 重新运行命令

---

## 📚 详细文档

查看完整文档：[docs/SCHEMA_DOWNLOAD_GUIDE.md](./SCHEMA_DOWNLOAD_GUIDE.md)

---

**就是这么简单！** 🚀

