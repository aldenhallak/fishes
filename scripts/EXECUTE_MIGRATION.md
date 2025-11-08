# 执行数据库迁移说明

## 迁移文件
`scripts/remove-downvotes.sql`

## 执行步骤

### 方法1: 使用Hasura Console（推荐）

1. 打开Hasura Console: http://localhost:8080/console
2. 进入 "Data" 标签页
3. 点击左侧的 "SQL" 
4. 将 `remove-downvotes.sql` 的内容复制粘贴到SQL编辑器
5. 勾选 "This is a migration" (如果你想跟踪迁移历史)
6. 点击 "Run!" 执行

### 方法2: 使用curl命令

```bash
cd fish_art
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: myadminsecretkey" \
  -d @scripts/remove-downvotes.sql
```

### 验证迁移成功

执行以下查询验证：

```sql
-- 1. 检查fish表结构（应该没有downvotes字段）
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fish' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. 检查votes表的约束
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.votes'::regclass
AND conname = 'votes_type_check';

-- 3. 确认没有down类型的投票
SELECT COUNT(*) as down_votes_count 
FROM public.votes 
WHERE vote_type = 'down';
```

预期结果：
- fish表中不应该有downvotes列
- votes表应该有votes_type_check约束
- down类型的投票数应该为0

## 注意事项

- 此迁移会永久删除所有downvote数据
- 建议先在测试环境执行
- 执行前建议备份数据库
- 执行后需要刷新Hasura的metadata以识别schema变更


























