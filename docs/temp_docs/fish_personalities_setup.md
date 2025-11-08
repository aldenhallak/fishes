# 鱼个性系统设置指南

## 概述

创建了一个标准化的鱼个性系统，包含20种符合美国文化且有趣的个性类型。

## 数据库结构

### fish_personalities 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | TEXT | 个性名称（英文，唯一） |
| description | TEXT | 个性细节描述 |
| created_at | TIMESTAMP | 创建时间 |

## 20种预设个性

1. **sassy** - 粗鲁大胆型（像R级动画中满口脏话的泰迪熊）
2. **nerdy** - 书呆子型
3. **surfer_dude** - 冲浪少年
4. **southern_belle** - 南方淑女
5. **brooklyn_tough** - 布鲁克林硬汉
6. **valley_girl** - 山谷女孩
7. **conspiracy_theorist** - 阴谋论者
8. **drama_queen** - 戏剧女王
9. **dad_jokes** - 老爹笑话
10. **karen** - 投诉达人凯伦
11. **hipster** - 潮人
12. **couch_potato** - 沙发土豆
13. **gym_bro** - 健身兄弟
14. **foodie** - 美食家
15. **tech_geek** - 技术极客
16. **gossip_girl** - 八卦女孩
17. **grumpy_old_timer** - 暴躁老头
18. **cheerleader** - 乐观啦啦队长
19. **sarcastic_millennial** - 讽刺的千禧一代
20. **zen_master** - 禅宗大师

## 执行步骤

### 1. 执行 SQL

```bash
psql -U your_username -d your_database -f sql/create_personalities_table.sql
```

### 2. 在 Hasura Console 中配置

#### 2.1 Track 表
1. 打开 Hasura Console
2. 进入 Data 标签
3. 找到 `fish_personalities` 表
4. 点击 "Track" 按钮

#### 2.2 建立关系

**fish 表 -> fish_personalities（对象关系）**
- Relationship Type: Object Relationship
- Relationship Name: `personality_detail`
- Reference Schema: `public`
- Reference Table: `fish_personalities`
- From: `fish.personality`
- To: `fish_personalities.name`

**fish_monologues 表 -> fish_personalities（对象关系）**
- Relationship Type: Object Relationship
- Relationship Name: `personality_detail`
- Reference Schema: `public`
- Reference Table: `fish_personalities`
- From: `fish_monologues.personality`
- To: `fish_personalities.name`

**fish_personalities -> fish（数组关系）**
- Relationship Type: Array Relationship
- Relationship Name: `fishes`
- Reference Schema: `public`
- Reference Table: `fish`
- From: `fish_personalities.name`
- To: `fish.personality`

**fish_personalities -> fish_monologues（数组关系）**
- Relationship Type: Array Relationship
- Relationship Name: `monologues`
- Reference Schema: `public`
- Reference Table: `fish_monologues`
- From: `fish_personalities.name`
- To: `fish_monologues.personality`

## GraphQL 查询示例

### 查询所有个性及其描述

```graphql
query GetAllPersonalities {
  fish_personalities {
    id
    name
    description
    created_at
  }
}
```

### 查询特定个性的所有鱼

```graphql
query GetSassyFishes {
  fish_personalities(where: {name: {_eq: "sassy"}}) {
    name
    description
    fishes {
      id
      fish_name
      image_url
      upvotes
      user {
        display_name
      }
    }
  }
}
```

### 查询鱼及其个性详情

```graphql
query GetFishWithPersonality {
  fish(limit: 10) {
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

### 查询特定个性的自语内容

```graphql
query GetMonologuesByPersonality {
  fish_personalities(where: {name: {_eq: "sassy"}}) {
    name
    description
    monologues {
      id
      content
      created_at
    }
  }
}
```

### 创建新鱼时选择个性

```graphql
mutation CreateFishWithPersonality {
  insert_fish_one(object: {
    fish_name: "Sassy Sally"
    personality: "sassy"
    image_url: "https://..."
    user_id: "user123"
  }) {
    id
    fish_name
    personality
    personality_detail {
      description
    }
  }
}
```

## API 集成建议

### 前端选择器数据
可以创建一个 API 端点返回所有可用个性：

```javascript
// 获取个性列表供前端选择器使用
const personalities = await fetch('/api/personalities')
  .then(r => r.json());

// 返回格式：
[
  { 
    value: "sassy", 
    label: "Sassy", 
    description: "Crude, bold, and unapologetically sarcastic..." 
  },
  // ...
]
```

### 后端验证
在创建鱼时验证个性值是否有效：

```python
valid_personalities = get_all_personality_names()
if fish_data.personality and fish_data.personality not in valid_personalities:
    raise ValueError(f"Invalid personality: {fish_data.personality}")
```

## 数据迁移注意事项

- 现有的 `fish` 表中 `personality` 字段如果包含自定义值，会被设置为 `NULL`
- 建议在迁移前备份数据
- 如果要保留自定义个性，需要先将它们添加到 `fish_personalities` 表中

## 扩展个性

如需添加新个性：

```sql
INSERT INTO fish_personalities (name, description) 
VALUES ('new_personality', 'Detailed description of this personality type...');
```

## 个性使用统计查询

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

