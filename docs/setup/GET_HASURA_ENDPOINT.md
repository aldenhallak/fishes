# 🔍 如何获取 Hasura GraphQL Endpoint

## 方法1：从浏览器地址栏获取（最简单）⭐

### 步骤详解

1. **打开您的 Hasura Console**
   - 就是您刚才截图的那个页面

2. **查看浏览器地址栏**
   
   地址栏会显示类似这样的URL：
   ```
   https://my-project-name.hasura.app/console/data/default/schema/public
   ```
   
   或者：
   ```
   https://hasura.mycompany.com/console/data/default/schema/public
   ```
   
   或者（Hasura Cloud新版）：
   ```
   https://cloud.hasura.io/project/abc123/console/data/default/schema/public
   ```

3. **提取域名部分**

   从地址栏URL中，只需要**域名到第一个斜杠之前**的部分：
   
   **示例1（Hasura Cloud标准域名）**：
   ```
   浏览器显示：https://my-project.hasura.app/console/data/...
   取出域名：  my-project.hasura.app
   ```
   
   **示例2（自定义域名）**：
   ```
   浏览器显示：https://hasura.example.com/console/data/...
   取出域名：  hasura.example.com
   ```
   
   **示例3（Hasura Cloud新版通过cloud.hasura.io访问）**：
   ```
   浏览器显示：https://cloud.hasura.io/project/abc-123-xyz/console/...
   需要找到实际的GraphQL端点，见下方"方法2"
   ```

4. **构建完整的 GraphQL Endpoint**

   **格式**：`https://[域名]/v1/graphql`
   
   **示例**：
   ```env
   # 如果域名是 my-project.hasura.app
   HASURA_GRAPHQL_ENDPOINT=https://my-project.hasura.app/v1/graphql
   
   # 如果域名是 hasura.example.com
   HASURA_GRAPHQL_ENDPOINT=https://hasura.example.com/v1/graphql
   ```

---

## 方法2：从 Hasura Cloud Dashboard 获取（最准确）⭐⭐⭐

### 适用场景
- 使用 Hasura Cloud 托管
- 浏览器地址显示 `cloud.hasura.io`

### 步骤详解

1. **登录 Hasura Cloud**
   - 访问：https://cloud.hasura.io/
   - 登录您的账号

2. **选择您的项目**
   - 在项目列表中点击您的项目
   - 进入项目详情页

3. **查看 GraphQL API 端点**
   
   在项目详情页面，您会看到：
   
   ```
   ┌─────────────────────────────────────┐
   │  Project: My Fish App               │
   ├─────────────────────────────────────┤
   │  GraphQL API:                       │
   │  https://abc-xyz-123.hasura.app     │  ← 这就是您需要的！
   │                                     │
   │  [Copy] [Launch Console]            │
   └─────────────────────────────────────┘
   ```

4. **复制端点并添加路径**
   
   假设显示的是：`https://abc-xyz-123.hasura.app`
   
   完整配置为：
   ```env
   HASURA_GRAPHQL_ENDPOINT=https://abc-xyz-123.hasura.app/v1/graphql
   ```
   
   **注意**：需要在末尾加上 `/v1/graphql`

---

## 方法3：从 Hasura Console 内查看（终极方法）

### 步骤详解

1. **打开 Hasura Console**

2. **点击顶部的 "API" 标签**
   
   这会打开 GraphiQL 界面（GraphQL 查询编辑器）

3. **查看页面顶部或左上角**
   
   通常会显示当前的 API 端点：
   ```
   Endpoint: https://your-project.hasura.app/v1/graphql
   ```
   
   **直接复制这个地址即可！**

---

## 方法4：测试验证（验证配置是否正确）

### 在浏览器中测试

1. **构建完整URL**
   ```
   https://your-project.hasura.app/v1/graphql
   ```

2. **在浏览器中访问**
   
   打开新标签页，粘贴URL并访问

3. **预期结果**
   
   **正确的**：显示类似这样的错误（这是正常的！）
   ```json
   {
     "errors": [
       {
         "message": "Missing Authorization header"
       }
     ]
   }
   ```
   或直接显示 GraphiQL 界面
   
   **错误的**：404 Not Found 或连接超时

---

## 🎯 快速参考

### Endpoint格式规则

| 类型 | 格式 | 示例 |
|------|------|------|
| Hasura Cloud | `https://[项目名].hasura.app/v1/graphql` | `https://my-fish.hasura.app/v1/graphql` |
| 自定义域名 | `https://[域名]/v1/graphql` | `https://api.example.com/v1/graphql` |
| 本地开发 | `http://localhost:8080/v1/graphql` | `http://localhost:8080/v1/graphql` |

### 常见错误

❌ **错误示例**：
```env
# 缺少 /v1/graphql
HASURA_GRAPHQL_ENDPOINT=https://my-project.hasura.app

# 包含了 /console 路径
HASURA_GRAPHQL_ENDPOINT=https://my-project.hasura.app/console/v1/graphql

# 使用了 console 的URL
HASURA_GRAPHQL_ENDPOINT=https://cloud.hasura.io/project/abc/console
```

✅ **正确示例**：
```env
HASURA_GRAPHQL_ENDPOINT=https://my-project.hasura.app/v1/graphql
HASURA_GRAPHQL_ENDPOINT=https://api.mysite.com/v1/graphql
HASURA_GRAPHQL_ENDPOINT=http://localhost:8080/v1/graphql
```

---

## 🔍 实战示例

### 示例1：从浏览器地址栏提取

```
浏览器显示：
https://my-fish-battle.hasura.app/console/data/default/schema/public

提取步骤：
1. 找到域名：my-fish-battle.hasura.app
2. 添加协议：https://my-fish-battle.hasura.app
3. 添加路径：https://my-fish-battle.hasura.app/v1/graphql

配置：
HASURA_GRAPHQL_ENDPOINT=https://my-fish-battle.hasura.app/v1/graphql
```

### 示例2：从 Hasura Cloud 获取

```
1. 登录 cloud.hasura.io
2. 看到项目信息：
   Project Name: fish-art-battle
   GraphQL API: https://fish-art-battle-xyz123.hasura.app

3. 配置：
HASURA_GRAPHQL_ENDPOINT=https://fish-art-battle-xyz123.hasura.app/v1/graphql
```

---

## 💡 提示

### 如何知道配置对不对？

**方法1：浏览器测试**
访问您的endpoint URL，如果看到JSON错误（提示缺少Authorization），说明地址正确。

**方法2：使用curl测试**
```bash
curl https://your-project.hasura.app/v1/graphql
```
应该返回类似：`{"errors":[{"message":"Missing Authorization header"}]}`

**方法3：运行测试脚本**
```bash
npm run test:hasura
```
如果配置正确，会显示连接成功。

---

## 🆘 仍然找不到？

### 检查清单

- [ ] 我已经登录 Hasura Cloud
- [ ] 我能看到项目列表
- [ ] 我能打开 Hasura Console（数据库管理界面）
- [ ] 我查看了浏览器地址栏
- [ ] 我尝试了在项目详情页查找

### 需要帮助？

请提供以下信息（隐藏敏感部分）：

1. **浏览器地址栏显示的URL**（隐藏项目名称）
   ```
   示例：https://XXXX.hasura.app/console/data/...
   ```

2. **您使用的是**：
   - [ ] Hasura Cloud（cloud.hasura.io）
   - [ ] 自建Hasura
   - [ ] 其他

3. **能否打开Hasura Console？**
   - [ ] 能，正常显示数据库表
   - [ ] 不能，有错误

---

## ✅ 配置完成后

填写好配置后：

1. **保存 `.env.local` 文件**
2. **运行测试**：
   ```bash
   npm run test:hasura
   ```
3. **如果成功**，继续下一步（Track表、配置权限）

---

**记住关键点**：
- ✅ 必须包含 `/v1/graphql`
- ✅ 不要包含 `/console`
- ✅ 从浏览器地址栏取域名部分
- ✅ 可以在浏览器中测试验证

祝配置顺利！🚀



