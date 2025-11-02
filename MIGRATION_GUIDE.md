# 🔄 前端迁移指南

## 已完成的工作

✅ 数据库结构（7个表）
✅ Supabase认证模块
✅ Hasura配置文档
✅ 14个API端点
✅ 新的login.js
✅ 新的fish-utils.js

---

## 📋 迁移步骤

### Step 1: 备份原文件
```bash
# 备份原有文件
cp src/js/fish-utils.js src/js/fish-utils.old.js
cp src/js/login.js src/js/login.old.js
```

### Step 2: 替换JavaScript文件
```bash
# 使用新文件
mv src/js/fish-utils-new.js src/js/fish-utils.js
# login.js已经更新，无需操作
```

### Step 3: 更新所有HTML文件

在**每个HTML文件**中（index.html, tank.html, rank.html等），**移除Firebase SDK**，添加Supabase SDK：

#### 移除这些行：
```html
<!-- 删除这些 -->
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-auth-compat.js"></script>
<script src="src/js/firebase-init.js"></script>
```

#### 添加这些行（在所有其他script之前）：
```html
<!-- Supabase配置 -->
<script src="/supabase-config.js"></script>
<!-- Supabase SDK (CDN) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<!-- Supabase认证模块 -->
<script src="/src/js/supabase-init.js"></script>
```

#### 示例：index.html的更新
```html
<!DOCTYPE html>
<html>
<head>
    <!-- ... meta tags ... -->
    
    <!-- ===== 新的Supabase配置 ===== -->
    <script src="/supabase-config.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="/src/js/supabase-init.js"></script>
    
    <!-- 其他脚本 -->
    <script src="/src/js/fish-utils.js"></script>
    <script src="/src/js/app.js"></script>
</head>
<body>
    <!-- ... -->
</body>
</html>
```

### Step 4: 更新app.js（提交鱼逻辑）

找到`app.js`中的提交函数，更新为调用新API：

```javascript
// 旧代码（Firestore）
await db.collection('fishes').add(fishData);

// 新代码（使用API）
const user = await window.supabaseAuth.getCurrentUser();
const response = await fetch('/api/fish/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    imageUrl: imageUrl,
    artist: artistName || 'Anonymous'
  })
});
const result = await response.json();
```

### Step 5: 更新tank.js和rank.js

这两个文件**不需要修改**！因为它们使用`getFishBySort()`函数，而这个函数已经在新的fish-utils.js中更新了。

### Step 6: 更新public/supabase-config.js

编辑`public/supabase-config.js`，填入真实的Supabase配置：

```javascript
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-key-here';
```

---

## 🔍 需要手动修改的文件清单

| 文件 | 需要修改 | 原因 |
|------|---------|------|
| `src/js/fish-utils.js` | ✅ 替换 | 已提供新版本 |
| `src/js/login.js` | ✅ 已更新 | 已完成 |
| `src/js/app.js` | ✅ 修改提交逻辑 | 调用新API |
| `src/js/tank.js` | ❌ 无需修改 | 使用fish-utils函数 |
| `src/js/rank.js` | ❌ 无需修改 | 使用fish-utils函数 |
| `index.html` | ✅ 更新SDK | 替换Firebase→Supabase |
| `tank.html` | ✅ 更新SDK | 替换Firebase→Supabase |
| `rank.html` | ✅ 更新SDK | 替换Firebase→Supabase |
| `login.html` | ✅ 更新SDK | 替换Firebase→Supabase |
| 其他HTML | ✅ 更新SDK | 替换Firebase→Supabase |

---

## 🧪 测试清单

完成迁移后，请测试：

- [ ] 用户注册
- [ ] 用户登录
- [ ] 用户登出
- [ ] 画鱼并提交
- [ ] 查看鱼缸（tank.html）
- [ ] 查看排行榜（rank.html）
- [ ] 点赞/点踩
- [ ] 举报功能
- [ ] 每日签到
- [ ] 进入战斗模式

---

## 🔧 故障排查

### 问题1: "Supabase未初始化"
**解决**: 确保HTML中按顺序加载：
1. supabase-config.js
2. @supabase/supabase-js CDN
3. supabase-init.js

### 问题2: API返回404
**解决**: 确保api/文件夹已部署到Vercel

### 问题3: 登录后无法提交鱼
**解决**: 检查app.js是否正确调用新的submit API

### 问题4: Hasura权限错误
**解决**: 参考`docs/HASURA_SETUP.md`配置权限

---

## 📞 获取帮助

- 查看 `docs/HASURA_SETUP.md`
- 查看 `API_DOCUMENTATION.md`
- 查看 `BACKEND_REBUILD_PROGRESS.md`

完成！🎉

