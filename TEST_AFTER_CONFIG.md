# ✅ 配置完成后测试

## 当您填写好 .env.local 后

### 运行测试命令

```bash
npm run test:hasura
```

**或者**（如果没有安装依赖）：

```bash
npm install
npm run test:hasura
```

---

## 预期结果

### ✅ 成功

如果配置正确，会显示：

```
🔍 测试Hasura连接...

配置信息:
  端点: https://your-project.hasura.app/v1/graphql
  密钥: ********

1️⃣ 基础连接测试...
✅ Hasura连接成功！

2️⃣ GraphQL查询测试...
✅ GraphQL API正常工作

3️⃣ 数据库表检查...
✅ 找到 X 个表

====================================
✅ 所有测试通过！
Hasura配置正确，可以正常使用！
====================================
```

### ❌ 失败情况

#### 错误1：401 Unauthorized
```
❌ Hasura连接失败: 401 Unauthorized
```
**原因**：Admin Secret 不正确  
**解决**：检查Hasura项目设置中的Admin Secret

#### 错误2：Network error / timeout
```
❌ Hasura连接失败: Network error
```
**原因**：Endpoint URL 不正确  
**解决**：检查URL拼写，确保包含 `/v1/graphql`

#### 错误3：仍显示"未设置"
```
配置信息:
  端点: 未设置
  密钥: 未设置
```
**原因**：.env.local 未保存或格式错误  
**解决**：
1. 确保保存了文件
2. 确保没有多余的空格
3. 确保使用 `npm run test:hasura` 而不是直接运行脚本

---

## 🎯 下一步

测试通过后：

1. ✅ 在Hasura Console点击 "Track All" 跟踪所有表
2. ✅ 配置Hasura权限（参考 `docs/HASURA_SETUP.md`）
3. ✅ 配置Supabase（参考 `DEPLOYMENT_FINAL.md`）
4. ✅ 开始使用API

---

## 📞 需要帮助？

如果测试失败，请提供：
- 错误信息截图
- .env.local 的配置（隐藏敏感信息）
- Hasura Console是否能正常打开

我们会帮您解决！

