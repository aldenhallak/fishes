# Hasura 配置指南

## 📋 前置条件

- ✅ PostgreSQL数据库已创建
- ✅ 已执行 `scripts/migrate-database.sql`
- ✅ Supabase项目已创建
- ✅ 已有Hasura服务器（自建）

---

## 🔧 Step 1: 连接数据库

### 1.1 在Hasura Console中添加数据库

1. 打开Hasura Console: `https://your-hasura-server.com/console`
2. 进入 **Data** 标签页
3. 点击 **Connect Database**
4. 填写PostgreSQL连接信息：
   ```
   Database Display Name: fish_art_db
   Database URL: postgresql://user:password@host:5432/database
   ```
5. 点击 **Connect Database**

### 1.2 Track所有表

在Data标签页中，依次Track以下表：
- ✅ fish
- ✅ votes
- ✅ reports
- ✅ battle_config
- ✅ user_economy
- ✅ battle_log
- ✅ economy_log

也Track所有视图：
- ✅ fish_rank
- ✅ fish_battle
- ✅ user_fish_summary

---

## 🔐 Step 2: 配置JWT认证

### 2.1 获取Supabase JWT Secret

1. 登录Supabase Dashboard
2. 进入 **Settings** → **API**
3. 复制 **JWT Secret**（在Config部分）

### 2.2 配置Hasura环境变量

在Hasura服务器的环境变量中添加：

```bash
HASURA_GRAPHQL_JWT_SECRET='{"type":"HS256","key":"YOUR_SUPABASE_JWT_SECRET"}'
```

示例（假设JWT Secret是 `your-secret-key`）：
```bash
HASURA_GRAPHQL_JWT_SECRET='{"type":"HS256","key":"your-secret-key","claims_map":{"x-hasura-allowed-roles":["user","anonymous"],"x-hasura-default-role":"user","x-hasura-user-id":{"path":"$.sub"}}}'
```

### 2.3 重启Hasura服务

```bash
# Docker部署
docker-compose restart hasura

# 其他部署方式请参考文档
```

---

## 🛡️ Step 3: 配置权限规则

### 3.1 fish 表权限

#### Select权限（公开可读）
```yaml
Role: anonymous
Filter:
  _and:
    - is_approved: {_eq: true}
    - reported: {_eq: false}
Columns: 
  - id, user_id, image_url, artist, created_at
  - talent, level, experience, health, max_health
  - upvotes, downvotes, battle_power
  - is_alive, is_in_battle_mode, position_row
  - total_wins, total_losses
```

#### Insert权限（认证用户可创建）
```yaml
Role: user
Check:
  user_id: {_eq: X-Hasura-User-Id}
Columns:
  - user_id, image_url, artist
  - talent (自动生成)
Set defaults:
  - level: 1
  - experience: 0
  - health: 10
  - max_health: 10
  - upvotes: 0
  - downvotes: 0
  - is_alive: true
  - is_approved: true
```

#### Update权限（仅owner可更新）
```yaml
Role: user
Filter:
  user_id: {_eq: X-Hasura-User-Id}
Columns:
  - artist (可修改名字)
  - is_in_battle_mode (可切换战斗模式)
```

#### Delete权限（仅owner可删除）
```yaml
Role: user
Filter:
  user_id: {_eq: X-Hasura-User-Id}
```

### 3.2 votes 表权限

#### Insert权限（认证用户可投票）
```yaml
Role: user
Check:
  user_id: {_eq: X-Hasura-User-Id}
Columns:
  - fish_id, user_id, vote_type
```

#### Select权限（仅查看自己的投票）
```yaml
Role: user
Filter:
  user_id: {_eq: X-Hasura-User-Id}
Columns: all
```

### 3.3 reports 表权限

#### Insert权限（任何人可举报）
```yaml
Role: anonymous
Check: {}
Columns:
  - fish_id, reason, reporter_ip, user_agent, url
Set defaults:
  - status: 'pending'
  - created_at: now()
```

#### Select权限（仅管理员可查看）
```yaml
Role: admin
Filter: {}
Columns: all
```

### 3.4 battle_config 表权限

#### Select权限（公开可读）
```yaml
Role: anonymous
Filter: {}
Columns: all
```

#### Update权限（仅管理员可修改）
```yaml
Role: admin
Filter: {id: {_eq: 1}}
Columns: all
```

### 3.5 user_economy 表权限

#### Select权限（仅查看自己的）
```yaml
Role: user
Filter:
  user_id: {_eq: X-Hasura-User-Id}
Columns: all
```

#### Insert/Update权限（通过API端点，不直接开放）
禁用直接权限，所有操作通过Serverless Functions。

### 3.6 battle_log 表权限

#### Select权限（可查看相关战斗）
```yaml
Role: user
Filter:
  _or:
    - attacker_id: {_in: user_fish_ids}
    - defender_id: {_in: user_fish_ids}
Columns: all
```

### 3.7 economy_log 表权限

#### Select权限（仅查看自己的）
```yaml
Role: user
Filter:
  user_id: {_eq: X-Hasura-User-Id}
Columns: all
```

---

## 🧪 Step 4: 测试权限

### 4.1 在Hasura Console测试

进入 **API Explorer**：

#### 测试公开查询（无需登录）
```graphql
query {
  fish(limit: 10, where: {is_approved: {_eq: true}}) {
    id
    artist
    image_url
    upvotes
  }
}
```

#### 测试认证查询（需要JWT Token）
1. 从Supabase获取JWT Token
2. 在Headers中添加：
   ```json
   {
     "Authorization": "Bearer YOUR_JWT_TOKEN"
   }
   ```
3. 执行查询：
   ```graphql
   query {
     user_economy {
       user_id
       fish_food
     }
   }
   ```

---

## 🔄 Step 5: 配置关系（Relations）

### fish → user_economy
```yaml
Name: user_economy
Type: object relationship
From: user_id
To: user_economy.user_id
```

### fish → votes
```yaml
Name: votes
Type: array relationship
From: id
To: votes.fish_id
```

### fish → reports
```yaml
Name: reports
Type: array relationship
From: id
To: reports.fish_id
```

这样可以在查询fish时关联查询相关数据：
```graphql
query {
  fish(limit: 5) {
    id
    artist
    upvotes
    votes_aggregate {
      aggregate {
        count
      }
    }
    reports_aggregate {
      aggregate {
        count
      }
    }
  }
}
```

---

## ✅ 验证清单

完成配置后，检查以下项：

- [ ] 所有表已Track
- [ ] JWT Secret已配置
- [ ] 权限规则已设置（fish, votes, reports等）
- [ ] 关系已创建
- [ ] 公开查询可执行
- [ ] 认证查询需要Token
- [ ] Admin操作被保护

---

## 🐛 故障排查

### 问题1: JWT验证失败
```
Error: JWTExpired or Invalid JWT
```
**解决**：
- 检查 `HASURA_GRAPHQL_JWT_SECRET` 是否正确
- 确认Token未过期
- 验证Supabase JWT Secret是否匹配

### 问题2: 权限被拒绝
```
Error: access denied for table fish
```
**解决**：
- 检查用户角色是否正确（user/admin/anonymous）
- 验证权限规则的Filter条件
- 确认Token中包含正确的 `x-hasura-user-id`

### 问题3: 无法插入数据
```
Error: Check constraint violation
```
**解决**：
- 检查Insert权限的Check条件
- 验证必填字段是否都有值
- 查看Set defaults是否正确

---

## 📚 参考资料

- [Hasura文档](https://hasura.io/docs/)
- [Supabase JWT集成](https://supabase.com/docs/guides/auth/jwt)
- [权限规则示例](https://hasura.io/docs/latest/auth/authorization/permissions/)

配置完成！🎉



