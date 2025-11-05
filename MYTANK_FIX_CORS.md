# My Tank CORS 问题修复
## Fixed CORS Issue

---

## ✅ 已修复

**问题**：前端直接访问 Hasura 导致 CORS 错误
```
Access to fetch at 'https://tops-robin-36.hasura.app/v1/graphql' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**解决方案**：使用后端 API 代理请求

---

## 🔄 改动说明

### 之前（错误方式）
```javascript
// ❌ 前端直接访问 Hasura - 会被 CORS 阻止
const response = await fetch('https://tops-robin-36.hasura.app/v1/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables })
});
```

### 现在（正确方式）
```javascript
// ✅ 通过后端 API - 使用 .env.local 中的配置
const token = localStorage.getItem('userToken');
const response = await fetch(`${BACKEND_URL}/api/fishtank/my-fish`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 🧪 测试步骤

### 1. 确保后端配置正确

检查 `.env.local` 文件包含：
```env
HASURA_GRAPHQL_ENDPOINT=你的Hasura端点（例如：https://tops-robin-36.hasura.app/v1/graphql）
HASURA_ADMIN_SECRET=你的admin密钥
SUPABASE_URL=你的Supabase URL
SUPABASE_SERVICE_ROLE_KEY=你的服务密钥
```

### 2. 重启开发服务器
```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

### 3. 登录并访问
```bash
# 1. 访问登录页面
http://localhost:3000/login.html

# 2. 登录后访问 My Tank
http://localhost:3000/mytank.html
```

### 4. 检查控制台
按 F12 打开开发者工具，应该看到：
```
🐠 Loading fish with token...
✅ Loaded X fish from API
Fish data: [...]
🐟 Created X fish objects for animation
```

---

## 🔍 如何验证修复

### 在控制台运行：
```javascript
// 测试 API 连接
const token = localStorage.getItem('userToken');

if (!token) {
  console.log('❌ No token - 请先登录');
} else {
  fetch('http://localhost:3000/api/fishtank/my-fish', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(r => {
    console.log('✅ API Status:', r.status);
    return r.json();
  })
  .then(data => {
    console.log('✅ API Response:', data);
    if (data.success) {
      console.log(`✅ 找到 ${data.fish.length} 条鱼`);
      console.log('统计:', data.stats);
    } else {
      console.log('❌ API Error:', data.error);
    }
  })
  .catch(err => {
    console.error('❌ Fetch Error:', err);
  });
}
```

---

## 📊 API 流程

```
前端 (mytank.html)
    ↓ 带 token 请求
    ↓
后端 API (/api/fishtank/my-fish)
    ↓ 使用 .env.local 中的 HASURA_GRAPHQL_ENDPOINT
    ↓ 使用 HASURA_ADMIN_SECRET
    ↓
Hasura GraphQL
    ↓ 查询数据库
    ↓
PostgreSQL
    ↓ 返回数据
    ↓
后端 API
    ↓ 返回 JSON
    ↓
前端 (渲染鱼儿)
```

---

## 🐛 常见问题

### Q: 仍然看到 CORS 错误
**A:** 确保代码已更新并重启服务器：
```bash
# 1. 检查文件
cat src/js/private-fishtank-swim.js | grep "api/fishtank/my-fish"

# 2. 应该看到类似：
# fetch(`${BACKEND_URL}/api/fishtank/my-fish`, {

# 3. 如果没有，刷新代码并重启
npm run dev
```

### Q: API 返回 401 错误
**A:** Token 无效或过期：
1. 重新登录
2. 检查 localStorage 中的 token：
```javascript
console.log('Token:', localStorage.getItem('userToken'));
```

### Q: API 返回 500 错误
**A:** 后端配置问题：
1. 检查 `.env.local` 文件
2. 查看服务器日志（命令行输出）
3. 确认 Hasura 端点可访问

### Q: "Loaded 0 fish" 但我确定画过鱼
**A:** 可能的原因：
1. **不同的用户ID**：登录的用户和画鱼时的用户不同
2. **数据未保存**：画鱼时保存失败
3. **权限问题**：Hasura 权限配置不正确

**检查：**
```javascript
// 1. 查看当前用户ID
localStorage.getItem('userToken')

// 2. 查看 API 返回的数据
// （运行上面的验证脚本）
```

---

## ✅ 验收标准

确认以下都正常：
- [ ] 没有 CORS 错误
- [ ] 控制台显示 "Loading fish with token..."
- [ ] API 返回成功（状态 200）
- [ ] 能看到自己的鱼在游动
- [ ] 鱼上方显示 "ME" 标识
- [ ] 统计信息正确显示

---

## 📝 技术细节

### 为什么会有 CORS 问题？

**浏览器安全策略**：
- 前端运行在 `http://localhost:3000`
- Hasura 运行在 `https://tops-robin-36.hasura.app`
- 浏览器阻止跨域请求（除非服务器允许）

**解决方案**：
- 使用同源的后端 API 作为代理
- 后端在服务器端访问 Hasura（没有 CORS 限制）
- 前端只访问同源的后端 API

### API 端点详情

**文件**：`api/fishtank/my-fish.js`

**功能**：
1. 验证用户 token
2. 查询用户的鱼（own fish）
3. 查询收藏的鱼（favorited fish）
4. 计算统计信息
5. 返回格式化的数据

**使用的环境变量**：
- `HASURA_GRAPHQL_ENDPOINT` - Hasura GraphQL 端点
- `HASURA_ADMIN_SECRET` - Admin 密钥（可选）
- `SUPABASE_URL` - Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` - 用于验证 token

---

**修复完成！现在应该可以正常加载鱼了。🐠**

如果还有问题，请：
1. 运行完整诊断脚本（见 `MYTANK_DEBUG.md`）
2. 检查服务器日志
3. 提供控制台的完整错误信息

