# Hasura SQL语法错误修复

## 问题描述

提交鱼时遇到错误：
```json
{
  "error": {
    "message": "syntax error at or near \"query\"",
    "status_code": "42601"
  },
  "statement": "query GetOrCreateEconomy($userId: String!) {\n     user_economy_by_pk(user_id: $userId) {\n       user_id\n       fish_food\n     }\n   };"
}
```

## 原因分析

错误代码`42601`是PostgreSQL的语法错误代码，说明**GraphQL查询被发送到了PostgreSQL数据库而不是Hasura GraphQL端点**。

可能的原因：
1. `HASURA_GRAPHQL_ENDPOINT`环境变量配置错误
2. 指向了PostgreSQL连接字符串而不是Hasura GraphQL端点
3. 环境变量未正确加载

## 正确的配置格式

### ❌ 错误配置（PostgreSQL连接）
```env
# 这是错误的！不要使用PostgreSQL连接字符串
HASURA_GRAPHQL_ENDPOINT=postgresql://user:pass@host:5432/database
HASURA_GRAPHQL_ENDPOINT=postgres://...
```

### ✅ 正确配置（Hasura GraphQL端点）
```env
# Hasura Cloud
HASURA_GRAPHQL_ENDPOINT=https://your-project.hasura.app/v1/graphql

# 自建Hasura
HASURA_GRAPHQL_ENDPOINT=https://hasura.yourdomain.com/v1/graphql

# 本地Hasura（如使用Docker）
HASURA_GRAPHQL_ENDPOINT=http://localhost:8080/v1/graphql
```

## 解决方案

### 1. 检查环境变量

打开`.env.local`文件，确认配置正确：

```env
# 必须以 https:// 或 http:// 开头
# 必须以 /v1/graphql 结尾
HASURA_GRAPHQL_ENDPOINT=https://YOUR-PROJECT.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-admin-secret-here
```

### 2. 获取正确的Hasura GraphQL端点

#### 方法A：从Hasura Cloud获取
1. 登录 https://cloud.hasura.io/
2. 选择您的项目
3. 在项目详情页找到 **GraphQL Endpoint**
4. 复制完整的URL（应该类似 `https://xxx.hasura.app/v1/graphql`）

#### 方法B：从浏览器地址栏获取
1. 打开Hasura Console
2. 浏览器地址栏会显示类似：`https://my-project.hasura.app/console/...`
3. 提取域名部分：`my-project.hasura.app`
4. 构建GraphQL端点：`https://my-project.hasura.app/v1/graphql`

### 3. 验证配置

在终端中测试GraphQL端点是否正常：

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: YOUR-ADMIN-SECRET" \
  -d '{"query":"query { __typename }"}' \
  https://YOUR-PROJECT.hasura.app/v1/graphql
```

期望响应：
```json
{
  "data": {
    "__typename": "query_root"
  }
}
```

### 4. 重启开发服务器

修改`.env.local`后，必须重启服务器：

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

## 代码改进

已在`api/fish/submit.js`中添加了详细的环境变量检查和日志：

```javascript
// 检查环境变量配置
console.log('\n=== Hasura配置检查 ===');
console.log('HASURA_GRAPHQL_ENDPOINT:', HASURA_GRAPHQL_ENDPOINT || '未设置');
console.log('HASURA_ADMIN_SECRET:', HASURA_ADMIN_SECRET ? '已设置' : '未设置');
console.log('========================\n');

// 验证Hasura配置
if (!HASURA_GRAPHQL_ENDPOINT) {
  console.error('❌ 错误：HASURA_GRAPHQL_ENDPOINT 未设置');
}
```

现在服务器启动时会显示配置状态，方便调试。

## 相关文档

- [如何获取Hasura GraphQL端点](../setup/GET_HASURA_ENDPOINT.md)
- [环境变量配置帮助](../setup/CONFIG_HELP.md)
- [快速部署指南](../../QUICK_DEPLOY.md)

## 更新日期
2025-11-03















