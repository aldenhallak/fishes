# 后端切换完整指南

## 问题解答

### Q1: 本地服务器是否需要`npm run build`编译？

**答：不需要**。我们使用的是前端直接加载的JavaScript文件，无需编译。但需要：

1. **重启开发服务器**（让环境变量生效）
2. **清除浏览器缓存**（避免加载旧的JS文件）

### Q2: 设置了`BACKEND_TYPE=hasura`但仍连接原作者后端？

**原因**：
1. 环境变量文件可能命名错误（应为`.env.local`而不是`env.local`）
2. 开发服务器未重启
3. 浏览器缓存了旧的配置

**解决方案**：见下方完整配置步骤

---

## 完整配置步骤

### 步骤1：创建环境变量文件

```bash
# 在项目根目录创建 .env.local 文件（注意前面有个点）
# Windows PowerShell:
New-Item -Path ".env.local" -ItemType File

# 或者直接复制示例文件
copy env.local.example .env.local
```

### 步骤2：编辑`.env.local`文件

**使用Hasura（推荐）：**
```bash
# 全局后端选择
BACKEND_TYPE=hasura

# Hasura配置
HASURA_GRAPHQL_ENDPOINT=https://your-hasura-project.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-admin-secret

# Supabase配置（如果还没有）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

**或使用原作者后端（临时测试）：**
```bash
# 全局后端选择
BACKEND_TYPE=original

# 原作者后端URL
ORIGINAL_BACKEND_URL=https://fishes-be-571679687712.northamerica-northeast1.run.app
```

### 步骤3：重启开发服务器

```bash
# 如果服务器正在运行，先停止（Ctrl+C）
# 然后重新启动
npm run dev
# 或
node dev-server.js
```

### 步骤4：清除浏览器缓存

**Chrome/Edge：**
1. 打开DevTools（F12）
2. 右键刷新按钮
3. 选择"清空缓存并硬性重新加载"

**或者使用隐私模式/无痕模式：**
- Chrome: `Ctrl+Shift+N`
- Edge: `Ctrl+Shift+P`

### 步骤5：验证配置

1. 打开浏览器控制台（F12 → Console）
2. 访问 `http://localhost:3000/tank.html`
3. 查看控制台输出，应该看到：

```
🔧 后端配置: Hasura数据库
```

或

```
🔧 后端配置: 原作者后端
```

---

## 影响的页面

现在以下页面都会根据`BACKEND_TYPE`选择后端：

- ✅ `tank.html` - 公共鱼缸（显示所有鱼）
- ✅ `rank.html` - 排行榜
- ✅ `profile.html` - 用户资料
- ✅ `fishtanks.html` - 用户鱼缸集合
- ✅ `fishtank-view.html` - 查看鱼缸

---

## 测试清单

### 使用Hasura测试

- [ ] 配置`.env.local`，设置`BACKEND_TYPE=hasura`
- [ ] 创建Hasura表（如果还没有）
- [ ] 重启开发服务器
- [ ] 清除浏览器缓存
- [ ] 访问`tank.html`，检查控制台显示"Hasura数据库"
- [ ] 检查鱼是否正常显示
- [ ] 访问`fishtanks.html`，测试鱼缸功能

### 使用原作者后端测试

- [ ] 配置`.env.local`，设置`BACKEND_TYPE=original`
- [ ] 重启开发服务器
- [ ] 清除浏览器缓存
- [ ] 访问`tank.html`，检查控制台显示"原作者后端"
- [ ] 检查鱼是否正常显示

---

## 常见问题

### 1. 控制台报错：`Failed to load backend config`

**原因**：API端点不可用

**解决**：
1. 检查`api/config/backend.js`文件是否存在
2. 确认开发服务器正在运行
3. 检查端口是否正确（默认3000）

### 2. 显示"⚠️ 无法加载后端配置，使用默认值"

**原因**：环境变量未正确配置或API调用失败

**解决**：
1. 检查`.env.local`文件是否存在
2. 确认文件名正确（前面有点`.env.local`）
3. 重启服务器
4. 查看服务器终端的错误信息

### 3. 使用Hasura时显示空白

**原因**：数据库表未创建或数据为空

**解决**：
1. 执行`scripts/create-fishtank-tables.sql`（鱼缸表）
2. 确认`fish`表有数据且`is_approved=true`
3. 检查Hasura权限配置

### 4. 切换后端后看不到数据

**原因**：两个后端的数据是独立的

**说明**：
- Hasura数据库和原作者后端的数据不互通
- 切换后端会看到不同的数据
- 这是正常现象

---

## 调试方法

### 1. 检查环境变量是否生效

在浏览器控制台执行：

```javascript
// 检查后端配置
fetch('/api/config/backend')
  .then(r => r.json())
  .then(console.log);

// 应该显示：
// { backend: "hasura", useHasura: true, ... }
// 或
// { backend: "original", useOriginal: true, ... }
```

### 2. 检查配置加载

```javascript
// 在控制台执行
await window.loadBackendConfig();

// 查看当前配置（tank.html, rank.html等页面）
console.log(window.backendConfig || 'Not loaded');
```

### 3. 手动测试GraphQL

```javascript
// 测试Hasura连接
fetch('/api/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: '{ fish(limit: 1) { id artist } }'
  })
}).then(r => r.json()).then(console.log);
```

---

## URL参数强制覆盖（调试用）

可以通过URL参数临时覆盖配置：

```bash
# 强制使用本地后端
http://localhost:3000/tank.html?local=true

# 强制使用生产后端
http://localhost:3000/tank.html?prod=true
```

---

## 文件清单

### 新增文件

- `api/config/backend.js` - 后端配置API
- `api/graphql.js` - GraphQL代理
- `api/config/fishtank.js` - 鱼缸配置
- `api/config/fishtank-backend.js` - 鱼缸配置API
- `src/js/fishtank-hasura.js` - 鱼缸Hasura API
- `src/js/fishtank-adapter.js` - 鱼缸适配器

### 修改文件

- `env.local.example` - 添加`BACKEND_TYPE`配置
- `src/js/fish-utils.js` - 支持动态后端选择
- `fishtanks.html` - 引入新JS文件
- `fishtank-view.html` - 引入新JS文件

---

## 推荐配置

### 开发环境

```bash
BACKEND_TYPE=hasura
HASURA_GRAPHQL_ENDPOINT=http://localhost:8080/v1/graphql
```

### 生产环境

```bash
BACKEND_TYPE=hasura
HASURA_GRAPHQL_ENDPOINT=https://your-project.hasura.app/v1/graphql
```

---

## 迁移路径

### 阶段1：快速开始（使用原作者后端）

```bash
BACKEND_TYPE=original
```

### 阶段2：准备Hasura

1. 配置Hasura
2. 创建表
3. 配置权限
4. 测试API

### 阶段3：切换到Hasura

```bash
BACKEND_TYPE=hasura
```

### 阶段4：数据迁移（可选）

如果需要迁移原有数据，参考文档：
- [数据迁移指南](./FISHTANK_HASURA_MIGRATION.md)

---

## 支持和帮助

如果遇到问题：

1. 检查本文档的"常见问题"部分
2. 查看浏览器控制台错误
3. 查看服务器终端输出
4. 参考其他文档：
   - [鱼缸快速开始](./FISHTANK_QUICKSTART.md)
   - [鱼缸功能总览](./FISHTANK_README.md)

---

## 更新日期

2024-11-03

