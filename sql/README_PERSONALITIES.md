# 鱼个性系统快速开始

## 概述

本系统为鱼创建了20种**纯粹通用的个性特征**（不涉及职业、地域、角色等因素），并建立了与自语表和鱼表的关联关系。

## 快速执行步骤

✅ **重要提示**：SQL 脚本支持**幂等性**，可以安全地重复运行！
- 表已存在时自动跳过
- 数据已存在时自动更新
- 索引已存在时自动跳过
- 执行失败后可直接重新运行

### 方式一：通过 Hasura Console（推荐）

1. **登录 Hasura Console**
   ```
   打开浏览器访问你的 Hasura Console
   ```

2. **执行 SQL**
   - 点击顶部的 "Data" 标签
   - 点击左侧的 "SQL"
   - 复制 `sql/create_personalities_table.sql` 的内容
   - 粘贴到 SQL 编辑器
   - 点击 "Run!" 按钮
   - ✅ **如果执行失败，直接重新运行即可！**

3. **Track 表**
   - 执行成功后，会看到 "untracked tables or views" 提示
   - 点击 "Track" 按钮追踪 `fish_personalities` 表

4. **运行 Node.js 脚本插入数据**
   ```bash
   cd D:\BaiduSyncdisk\CODE_PRJ\fish_art
   node scripts/setup-personalities.js
   ```

5. **建立表关系**（在 Hasura Console 中）
   
   **a) fish -> fish_personalities (对象关系)**
   - 进入 Data > fish > Relationships
   - 点击 "Add a relationship"
   - Relationship Type: Object Relationship
   - Relationship Name: `personality_detail`
   - Reference: fish_personalities
   - From: personality → To: name
   - 点击 "Save"

   **b) fish_monologues -> fish_personalities (对象关系)**
   - 进入 Data > fish_monologues > Relationships
   - 点击 "Add a relationship"
   - Relationship Type: Object Relationship
   - Relationship Name: `personality_detail`
   - Reference: fish_personalities
   - From: personality → To: name
   - 点击 "Save"

   **c) fish_personalities -> fish (数组关系)**
   - 进入 Data > fish_personalities > Relationships
   - 点击 "Add a relationship"
   - Relationship Type: Array Relationship
   - Relationship Name: `fishes`
   - Reference: fish
   - From: name → To: personality
   - 点击 "Save"

   **d) fish_personalities -> fish_monologues (数组关系)**
   - 进入 Data > fish_personalities > Relationships
   - 点击 "Add a relationship"
   - Relationship Type: Array Relationship
   - Relationship Name: `monologues`
   - Reference: fish_monologues
   - From: name → To: personality
   - 点击 "Save"

### 方式二：通过 psql 命令行

1. **执行 SQL**
   ```bash
   psql -U your_username -d your_database -f sql/create_personalities_table.sql
   ```

2. **运行 Node.js 脚本**
   ```bash
   node scripts/setup-personalities.js
   ```

3. **在 Hasura Console 建立关系**（同上方式一的第5步）

## 验证安装

执行脚本后会自动验证，你应该看到：

```
✅ 成功插入/更新 20 条个性数据

🔍 验证数据...
✅ 共有 20 种个性

个性列表：
1. brooklyn_tough
2. cheerleader
3. conspiracy_theorist
4. couch_potato
5. dad_jokes
...
```

## 20种个性列表

| 个性名称 | 特征 |
|---------|------|
| sassy | 粗鲁大胆满口脏话（像R级动画中的泰迪熊） |
| nerdy | 书呆子，总是纠正别人 |
| surfer_dude | 冲浪少年，超级放松 |
| southern_belle | 南方淑女，甜蜜中带刺 |
| brooklyn_tough | 布鲁克林硬汉，直来直去 |
| valley_girl | 山谷女孩，"like literally" |
| conspiracy_theorist | 阴谋论者 |
| drama_queen | 戏剧女王 |
| dad_jokes | 老爹笑话专家 |
| karen | 投诉达人 |
| hipster | 潮人 |
| couch_potato | 沙发土豆 |
| gym_bro | 健身兄弟 |
| foodie | 美食家 |
| tech_geek | 技术极客 |
| gossip_girl | 八卦女孩 |
| grumpy_old_timer | 暴躁老头 |
| cheerleader | 乐观啦啦队长 |
| sarcastic_millennial | 讽刺的千禧一代 |
| zen_master | 禅宗大师 |

## 使用示例

### 前端集成

脚本会自动生成 `src/config/personalities.json`：

```javascript
import personalities from '@/config/personalities.json';

// 在表单中使用
<select name="personality">
  {personalities.map(p => (
    <option key={p.value} value={p.value} title={p.description}>
      {p.label}
    </option>
  ))}
</select>
```

### GraphQL 查询

```graphql
# 获取鱼及其个性详情
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

# 查询特定个性的所有鱼
query GetSassyFishes {
  fish_personalities(where: {name: {_eq: "sassy"}}) {
    name
    description
    fishes {
      id
      fish_name
      image_url
    }
  }
}
```

### 后端 API

```javascript
const { query } = require('./lib/hasura.js');

// 获取所有个性供选择
async function getPersonalitiesForSelect() {
  const result = await query(`
    query {
      fish_personalities(order_by: {name: asc}) {
        name
        description
      }
    }
  `);
  return result.fish_personalities;
}

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
```

## 故障排除

### 问题1：约束错误（外键 & NOT NULL）

**错误信息 A**：
```
insert or update on table "fish_monologues" violates foreign key constraint
Key (personality)=(default) is not present in table "fish_personalities"
```

**错误信息 B**：
```
null value in column "personality" violates not-null constraint
```

**原因**：
1. 表中存在无效的 personality 值（如 "default"）
2. personality 字段有 NOT NULL 约束

**✅ 已修复**：最新版 SQL 会自动处理，直接重新运行即可。

**手动修复**（如果已经遇到错误）：
```sql
-- 1. 移除 NOT NULL 约束
ALTER TABLE fish_monologues 
    ALTER COLUMN personality DROP NOT NULL;

-- 2. 查看无效数据
SELECT DISTINCT personality, COUNT(*) 
FROM fish_monologues 
WHERE personality IS NOT NULL 
AND personality NOT IN (SELECT name FROM fish_personalities)
GROUP BY personality;

-- 3. 清理无效数据（保留记录，设为 NULL）
UPDATE fish_monologues 
SET personality = NULL 
WHERE personality IS NOT NULL 
AND personality NOT IN (SELECT name FROM fish_personalities);

-- 4. 重新添加外键约束
ALTER TABLE fish_monologues DROP CONSTRAINT IF EXISTS fish_monologues_personality_fkey;
ALTER TABLE fish_monologues 
    ADD CONSTRAINT fish_monologues_personality_fkey 
    FOREIGN KEY (personality) REFERENCES fish_personalities(name) 
    ON UPDATE CASCADE ON DELETE RESTRICT;
```

📚 **详细文档**: `docs/bug_fixed_docs/fish_personalities_foreign_key_fix.md`

### 问题2：表已存在但脚本报错

**解决方案**：
```bash
# 删除旧表重新创建
psql -U your_username -d your_database -c "DROP TABLE IF EXISTS fish_personalities CASCADE;"
# 重新执行 SQL
psql -U your_username -d your_database -f sql/create_personalities_table.sql
```

### 问题3：Hasura 中看不到关系

**解决方案**：
1. 确保已 Track 表
2. 确保外键约束已创建
3. 在 Hasura Console 中手动添加关系（参考上方步骤5）
4. 刷新 Hasura metadata：Settings > Reload metadata

## 扩展个性

如需添加新个性：

```sql
INSERT INTO fish_personalities (name, description) 
VALUES ('your_personality', 'Detailed description...');
```

然后在 `scripts/setup-personalities.js` 中也添加对应数据以保持同步。

## 相关文档

- **详细文档**：`docs/temp_docs/fish_personalities_setup.md`
- **SQL 文件**：`sql/create_personalities_table.sql`
- **设置脚本**：`scripts/setup-personalities.js`
- **API 文档**：待更新到 `docs/api_docs/`

## 完成检查清单

- [ ] SQL 表创建成功
- [ ] 20条个性数据插入成功
- [ ] Hasura 中 track 了 fish_personalities 表
- [ ] 建立了4个表关系
- [ ] 生成了 src/config/personalities.json
- [ ] 前端可以正常选择个性
- [ ] GraphQL 查询可以正常获取关联数据

完成以上所有步骤后，鱼个性系统就正式上线了！🎉

