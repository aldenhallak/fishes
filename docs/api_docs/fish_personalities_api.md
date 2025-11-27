# Fish Personalities API 文档

## 概述

鱼个性系统提供了20种符合美国文化的有趣个性类型，每条鱼可以关联一个个性，自语内容也按个性分类。

**版本**: 1.0.0  
**创建日期**: 2025-11-08

**数据统计**:
- 20 种个性类型
- 每种个性 20 条自语 = 400 条个性化自语
- 20 条通用自语（供自定义个性使用）
- 总计 420 条自语

## 数据库结构

### fish_personalities 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | SERIAL | PRIMARY KEY | 主键，自增整数 |
| name | TEXT | UNIQUE, NOT NULL | 个性名称（英文，唯一标识） |
| description | TEXT | NOT NULL | 个性详细描述 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

### 关系

- **fish.personality** → **fish_personalities.name** (外键，可为空)
- **fish_monologues.personality** → **fish_personalities.name** (外键)

## 预设个性列表

**设计原则**：
- 纯粹的性格特征，不涉及职业、地域、角色等因素
- 按美国文化中的受欢迎程度排序

| # | 个性名称 | 中文名 | 特征描述 | 受欢迎度 |
|---|---------|--------|---------|----------|
| 1 | funny | 搞笑幽默型 | 总是开玩笑让人笑，生活是喜剧 | ⭐⭐⭐⭐⭐ |
| 2 | cheerful | 开朗乐观型 | 永远积极向上，传播正能量 | ⭐⭐⭐⭐⭐ |
| 3 | brave | 勇敢无畏型 | 敢于冒险，从不退缩 | ⭐⭐⭐⭐⭐ |
| 4 | playful | 爱玩好动型 | 不正经，把生活当游戏 | ⭐⭐⭐⭐ |
| 5 | curious | 好奇探索型 | 对一切都感兴趣 | ⭐⭐⭐⭐ |
| 6 | energetic | 精力充沛型 | 永动机般，停不下来 | ⭐⭐⭐⭐ |
| 7 | calm | 冷静淡定型 | 泰山崩于前而不惊 | ⭐⭐⭐⭐ |
| 8 | gentle | 温柔体贴型 | 善良柔和，不伤害任何人 | ⭐⭐⭐⭐ |
| 9 | sarcastic | 讽刺挖苦型 | 嘴毒，靠讽刺沟通 | ⭐⭐⭐ |
| 10 | dramatic | 戏剧化型 | 夸张表演，小事变大事 | ⭐⭐⭐ |
| 11 | naive | 天真单纯型 | 容易相信，看不穿骗局 | ⭐⭐⭐ |
| 12 | shy | 害羞内向型 | 不爱出风头，喜欢旁观 | ⭐⭐⭐ |
| 13 | anxious | 焦虑不安型 | 总是担心，压力山大 | ⭐⭐ |
| 14 | stubborn | 固执己见型 | 绝不妥协，不撞南墙不回头 | ⭐⭐ |
| 15 | serious | 严肃认真型 | 一本正经，没有玩笑 | ⭐⭐ |
| 16 | lazy | 懒惰懈怠型 | 能躺绝不站，躺平专家 | ⭐⭐ |
| 17 | grumpy | 暴躁易怒型 | 对一切都不满，总是抱怨 | ⭐ |
| 18 | aggressive | 好斗攻击型 | 爱打架，视一切为竞争 | ⭐ |
| 19 | cynical | 愤世嫉俗型 | 看透一切，认为都是空 | ⭐ |
| 20 | crude | 粗鲁低俗型 | 像R级动画中满口脏话的泰迪熊 🐻 | ⭐ |

## GraphQL API

### 查询所有个性

```graphql
query GetAllPersonalities {
  fish_personalities(order_by: {name: asc}) {
    id
    name
    description
    created_at
  }
}
```

**响应示例**:
```json
{
  "data": {
    "fish_personalities": [
      {
        "id": 1,
        "name": "funny",
        "description": "Hilarious and always cracking jokes...",
        "created_at": "2025-11-08T10:00:00Z"
      }
    ]
  }
}
```

### 查询特定个性

```graphql
query GetPersonality($name: String!) {
  fish_personalities(where: {name: {_eq: $name}}) {
    id
    name
    description
    fishes_aggregate {
      aggregate {
        count
      }
    }
    monologues_aggregate {
      aggregate {
        count
      }
    }
  }
}
```

**变量**:
```json
{
  "name": "funny"
}
```

### 查询鱼及其个性详情

```graphql
query GetFishWithPersonality($limit: Int = 10) {
  fish(limit: $limit) {
    id
    fish_name
    personality
    personality_detail {
      name
      description
    }
    user {
      display_name
    }
  }
}
```

**响应示例**:
```json
{
  "data": {
    "fish": [
      {
        "id": "abc-123",
        "fish_name": "Grumpy Gary",
        "personality": "grumpy",
        "personality_detail": {
          "name": "grumpy",
          "description": "Perpetually irritable and quick to complain..."
        },
        "user": {
          "display_name": "John"
        }
      }
    ]
  }
}
```

### 查询特定个性的所有鱼

```graphql
query GetFishesByPersonality($personality: String!) {
  fish_personalities(where: {name: {_eq: $personality}}) {
    name
    description
    fishes(order_by: {upvotes: desc}, limit: 20) {
      id
      fish_name
      image_url
      upvotes
      created_at
      user {
        display_name
      }
    }
  }
}
```

### 查询自语（按个性）

```graphql
query GetMonologuesByPersonality($personality: String!) {
  fish_monologues(
    where: {personality: {_eq: $personality}}
    order_by: {created_at: desc}
  ) {
    id
    content
    personality
    personality_detail {
      name
      description
    }
    created_at
  }
}
```

### 个性使用统计

```graphql
query PersonalityStats {
  fish_personalities {
    name
    description
    fishes_aggregate {
      aggregate {
        count
      }
    }
    monologues_aggregate {
      aggregate {
        count
      }
    }
  }
}
```

## Mutations

### 创建鱼（指定个性）

```graphql
mutation CreateFishWithPersonality(
  $fish_name: String!
  $personality: String!
  $image_url: String!
  $user_id: String!
) {
  insert_fish_one(object: {
    fish_name: $fish_name
    personality: $personality
    image_url: $image_url
    user_id: $user_id
  }) {
    id
    fish_name
    personality
    personality_detail {
      name
      description
    }
  }
}
```

**变量**:
```json
{
  "fish_name": "Grumpy Gary",
  "personality": "grumpy",
  "image_url": "https://...",
  "user_id": "user123"
}
```

### 更新鱼的个性

```graphql
mutation UpdateFishPersonality($fish_id: uuid!, $personality: String!) {
  update_fish_by_pk(
    pk_columns: {id: $fish_id}
    _set: {personality: $personality}
  ) {
    id
    personality
    personality_detail {
      name
      description
    }
  }
}
```

### 添加自语（指定个性）

```graphql
mutation AddMonologue(
  $content: String!
  $personality: String!
) {
  insert_fish_monologues_one(object: {
    content: $content
    personality: $personality
  }) {
    id
    content
    personality
    personality_detail {
      name
      description
    }
  }
}
```

### 批量添加自语

```graphql
mutation BatchAddMonologues($monologues: [fish_monologues_insert_input!]!) {
  insert_fish_monologues(objects: $monologues) {
    affected_rows
    returning {
      id
      content
      personality
    }
  }
}
```

**变量示例**:
```json
{
  "monologues": [
    {
      "content": "Why did the fish blush? Because it saw the ocean's bottom! 😂",
      "personality": "funny"
    },
    {
      "content": "Everything is going to be amazing!",
      "personality": "cheerful"
    },
    {
      "content": "Ugh, not this again...",
      "personality": "grumpy"
    }
  ]
}
```

## REST API 封装

### GET /api/personalities

获取所有个性列表

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "value": "funny",
      "label": "Funny",
      "description": "Hilarious and always cracking jokes..."
    },
    {
      "value": "cheerful",
      "label": "Cheerful",
      "description": "Eternally optimistic and upbeat..."
    },
    {
      "value": "brave",
      "label": "Brave",
      "description": "Fearless and bold in the face of danger..."
    }
  ]
}
```

### GET /api/personalities/:name

获取特定个性详情

**参数**:
- `name`: 个性名称

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "grumpy",
    "description": "Perpetually irritable and quick to complain...",
    "stats": {
      "fish_count": 42,
      "monologue_count": 156
    }
  }
}
```

### GET /api/personalities/:name/fishes

获取特定个性的鱼

**参数**:
- `name`: 个性名称
- `limit`: 限制数量（默认20）
- `offset`: 偏移量（默认0）

**响应**:
```json
{
  "success": true,
  "data": {
    "personality": "grumpy",
    "fishes": [...],
    "total": 42
  }
}
```

## 前端集成

### 使用预生成的配置文件

```javascript
import personalities from '@/config/personalities.json';

// 渲染选择器
function PersonalitySelect() {
  return (
    <select name="personality">
      <option value="">选择个性...</option>
      {personalities.map(p => (
        <option 
          key={p.value} 
          value={p.value}
          title={p.description}
        >
          {p.label}
        </option>
      ))}
    </select>
  );
}
```

### 动态加载

```javascript
async function loadPersonalities() {
  const query = `
    query {
      fish_personalities(order_by: {name: asc}) {
        name
        description
      }
    }
  `;
  
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  const { data } = await response.json();
  return data.fish_personalities;
}
```

## 后端验证

### Node.js 示例

```javascript
const { query } = require('./lib/hasura.js');

// 验证个性是否有效
async function validatePersonality(personalityName) {
  const result = await query(`
    query CheckPersonality($name: String!) {
      fish_personalities(where: {name: {_eq: $name}}) {
        name
      }
    }
  `, { name: personalityName });
  
  return result.fish_personalities.length > 0;
}

// 在创建鱼时使用
async function createFish(fishData) {
  if (fishData.personality) {
    const isValid = await validatePersonality(fishData.personality);
    if (!isValid) {
      throw new Error(`Invalid personality: ${fishData.personality}`);
    }
  }
  
  // 继续创建鱼...
}
```

## 错误处理

### 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 23503 | 外键约束违反 | 使用有效的个性名称 |
| 23505 | 唯一约束违反 | 个性名称已存在 |
| 23502 | NOT NULL 违反 | 提供必需字段 |

### 错误响应示例

```json
{
  "errors": [
    {
      "message": "Foreign key violation",
      "extensions": {
        "code": "constraint-violation",
        "path": "$.selectionSet.insert_fish_one"
      }
    }
  ]
}
```

## 性能优化

### 索引

系统已创建以下索引：
- `idx_fish_personality` on `fish(personality)`
- `idx_fish_monologues_personality` on `fish_monologues(personality)`

### 批量操作

使用批量插入而非循环插入：

```javascript
// ❌ 不好
for (const monologue of monologues) {
  await insertMonologue(monologue);
}

// ✅ 好
await insertMonologuesBatch(monologues);
```

## 测试

### 单元测试

```javascript
describe('Personality API', () => {
  test('should fetch all personalities', async () => {
    const personalities = await getPersonalities();
    expect(personalities).toHaveLength(20);
  });
  
  test('should validate personality', async () => {
    expect(await validatePersonality('funny')).toBe(true);
    expect(await validatePersonality('cheerful')).toBe(true);
    expect(await validatePersonality('brave')).toBe(true);
    expect(await validatePersonality('invalid')).toBe(false);
  });
});
```

### 测试页面

访问 `/test-personalities.html` 查看可视化测试界面

## 扩展和自定义

### 添加新个性

1. 在数据库中插入新记录：
```sql
INSERT INTO fish_personalities (name, description)
VALUES ('your_new_personality', 'Description...');
```

2. 更新 `scripts/setup-personalities.js` 中的数组

3. 重新生成前端配置文件：
```bash
node scripts/setup-personalities.js
```

### 自定义字段

如需为个性添加更多属性（如颜色、图标等），可以：

```sql
ALTER TABLE fish_personalities 
ADD COLUMN color TEXT,
ADD COLUMN icon TEXT;
```

然后更新相应的 GraphQL 查询和前端代码。

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0.0 | 2025-11-08 | 初始版本，包含20种个性 |

## 相关文档

- [设置指南](../sql/README_PERSONALITIES.md)
- [详细文档](../temp_docs/fish_personalities_setup.md)
- [GraphQL Schema](../../graphql/schema.graphql)

## 支持

如有问题，请参考：
1. 故障排除文档：`sql/README_PERSONALITIES.md`
2. 测试页面：`/test-personalities.html`
3. 项目文档：`docs/README.md`

