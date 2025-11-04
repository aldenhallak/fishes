# 📥 GraphQL Schema 下载指南

## 功能说明

使用 GraphQL Code Generator 从 Hasura 下载数据库 schema 和自动生成 TypeScript 类型定义。

---

## ✨ 功能特性

1. **下载 GraphQL Schema**
   - 自动从 Hasura 下载完整的 GraphQL schema
   - 保存为 `graphql/schema.graphql`

2. **生成 TypeScript 类型**
   - 自动生成 TypeScript 类型定义
   - 保存为 `src/types/graphql.ts`
   - 提供完整的类型安全

3. **自动同步**
   - 支持环境变量配置
   - 一键下载最新 schema

---

## 🚀 使用方法

### 1. 确保环境变量已配置

编辑 `.env.local`，确保包含：

```env
HASURA_GRAPHQL_ENDPOINT=http://hasura-fishart-1.weweknow.com/v1/graphql
HASURA_ADMIN_SECRET=your-admin-secret
```

### 2. 运行下载命令

```bash
npm run download:schema
```

或使用 npm（推荐，因为会自动加载环境变量）：

```bash
npm run download:schema
```

### 3. 查看生成的文件

**GraphQL Schema**（`graphql/schema.graphql`）：
```graphql
type fish {
  id: uuid!
  user_id: String!
  image_url: String!
  artist: String
  created_at: timestamptz
  talent: Int!
  level: Int!
  ...
}

type Query {
  fish(where: fish_bool_exp): [fish!]!
  fish_aggregate(where: fish_bool_exp): fish_aggregate!
  ...
}
```

**TypeScript 类型**（`src/types/graphql.ts`）：
```typescript
export type Fish = {
  id: Scalars['uuid'];
  user_id: Scalars['String'];
  image_url: Scalars['String'];
  artist?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  talent: Scalars['Int'];
  level: Scalars['Int'];
  ...
};

export type Query = {
  fish: Array<Fish>;
  fish_aggregate: Fish_Aggregate;
  ...
};
```

---

## 📋 配置说明

### `codegen.json` 配置文件

```json
{
  "schema": [
    {
      "http://hasura-fishart-1.weweknow.com/v1/graphql": {
        "headers": {
          "x-hasura-admin-secret": "${HASURA_ADMIN_SECRET:admin_secret}"
        }
      }
    }
  ],
  "documents": [],
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

**配置说明**：
- `schema`: Hasura GraphQL 端点
- `headers`: 认证头（使用环境变量）
- `generates`: 生成文件的路径和插件

---

## 🎯 使用场景

### 1. 开发时的类型提示

```typescript
import { Fish, Query, Mutation } from '@/types/graphql';

// 完整的类型安全
const fish: Fish = {
  id: '123',
  user_id: 'user123',
  image_url: 'https://...',
  talent: 50,
  level: 1,
  // TypeScript 会提示所有必需字段
};
```

### 2. GraphQL 查询验证

有了 `schema.graphql` 文件，IDE 可以验证您的 GraphQL 查询：

```graphql
query GetFish {
  fish(where: { is_alive: { _eq: true } }) {
    id
    artist
    level
    talent
  }
}
```

### 3. 与 GraphQL Code Generator 深度集成

可以进一步配置生成：
- React Hooks
- GraphQL 操作类型
- 查询文档

---

## 🔄 工作流程

### 数据库更新后

每次更新数据库结构后，运行：

```bash
npm run download:schema
```

这会：
1. 连接到 Hasura
2. 下载最新的 schema
3. 生成/更新 TypeScript 类型
4. 保存文件到项目中

### 团队协作

建议：
- ✅ 将生成的文件提交到 Git
- ✅ 团队成员拉取代码后自动同步
- ✅ CI/CD 中也运行此命令验证

---

## ⚠️ 注意事项

### 1. 环境变量

确保 `HASURA_ADMIN_SECRET` 已正确设置，否则会失败：

```
❌ Error: Unauthorized
```

### 2. 网络连接

需要能访问 Hasura 端点：

```
❌ Error: ECONNREFUSED
```

检查：
- Hasura 服务是否运行
- 网络是否可达
- VPN 是否需要开启

### 3. 文件权限

生成的文件需要写入权限：
- `graphql/`
- `src/types/`

---

## 📊 生成内容示例

### Schema 包含的表

从您的 Hasura 中下载的 schema 将包括：

- ✅ `fish` - 鱼数据表
- ✅ `votes` - 投票记录
- ✅ `reports` - 举报记录
- ✅ `battle_config` - 战斗配置
- ✅ `user_economy` - 用户经济
- ✅ `battle_log` - 战斗日志
- ✅ `economy_log` - 经济日志

以及所有视图：
- ✅ `fish_rank`
- ✅ `fish_battle`
- ✅ `user_fish_summary`

### TypeScript 类型

生成的类型包括：
- ✅ 所有表的类型定义
- ✅ 输入类型（`_bool_exp`, `_insert_input` 等）
- ✅ 查询和变更类型
- ✅ 聚合类型
- ✅ 订阅类型

---

## 🛠️ 高级配置

### 自定义生成路径

修改 `codegen.json`：

```json
{
  "generates": {
    "./custom-path/schema.graphql": {
      "plugins": ["schema-ast"]
    },
    "./custom-types/database.ts": {
      "plugins": ["typescript"]
    }
  }
}
```

### 添加更多插件

可以生成更多内容：

```json
{
  "generates": {
    "./src/types/graphql-operations.ts": {
      "plugins": [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo"
      ]
    }
  }
}
```

需要安装对应插件：
```bash
npm install --save-dev @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo
```

---

## 🔍 故障排查

### 问题1：命令找不到

```bash
❌ 'graphql-codegen' is not recognized
```

**解决**：
```bash
npm install
```

### 问题2：认证失败

```bash
❌ Error: Unauthorized / Invalid x-hasura-admin-secret
```

**解决**：
检查 `.env.local` 中的 `HASURA_ADMIN_SECRET`

### 问题3：Schema 为空

**解决**：
1. 确认 Hasura 中已创建表
2. 确认表已被 Track
3. 重新运行 `npm run download:schema`

---

## 📚 参考资料

- [GraphQL Code Generator 文档](https://the-guild.dev/graphql/codegen)
- [Hasura GraphQL 文档](https://hasura.io/docs/)
- [TypeScript 类型定义](https://www.typescriptlang.org/)

---

## ✅ 完成检查清单

下载 schema 后，确认：

- [ ] `graphql/schema.graphql` 文件已生成
- [ ] `src/types/graphql.ts` 文件已生成
- [ ] TypeScript 编译无错误
- [ ] IDE 中有类型提示

---

祝使用愉快！🚀

