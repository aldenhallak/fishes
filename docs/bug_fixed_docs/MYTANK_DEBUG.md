# My Tank 调试指南
## Debugging Guide for My Tank Page

---

## 🔍 快速诊断

访问 `http://localhost:3000/mytank.html`，打开浏览器控制台 (F12)

### ✅ 正常情况应该看到：

```
🐠 Loading fish with token...
✅ Loaded 3 fish from API
Fish data: [...]
🐟 Created 3 fish objects for animation
```

### ❌ 如果看到错误：

#### 错误 1: "Not logged in - no token found"
**原因**：未登录或登录已过期

**解决：**
1. 访问 `/login.html` 登录
2. 刷新 `/mytank.html`

**验证登录和token：**
```javascript
// 在控制台运行
const token = localStorage.getItem('userToken');
console.log('Token:', token ? '✅ Found' : '❌ Not found');

if (token) {
  console.log('Token preview:', token.substring(0, 20) + '...');
}
```

---

#### 错误 2: "Loaded 0 fish from API" 或 API 返回错误
**原因**：数据库中没有你的鱼

**检查步骤：**

1. **确认用户ID：**
```javascript
window.supabaseAuth.getCurrentUser().then(u => {
  console.log('Your User ID:', u.id);
});
```

2. **手动测试 API：**
```javascript
const token = localStorage.getItem('userToken');

fetch('http://localhost:3000/api/fishtank/my-fish', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('API Response:', data);
  if (data.success) {
    console.log('Fish count:', data.fish.length);
    console.log('Stats:', data.stats);
  } else {
    console.error('API Error:', data.error);
  }
})
.catch(err => console.error('Fetch Error:', err));
```

3. **如果数据库中也没有：**
   - 访问 `/index.html` 画一条鱼
   - 确认提交成功（应该显示成功消息）
   - 重新查询数据库

---

#### 错误 3: CORS 错误
**原因**：前端不能直接访问 Hasura（这是正常的！）

**说明**：
- ✅ 现在使用后端 API `/api/fishtank/my-fish`
- ✅ 后端 API 会使用 `.env.local` 中的 `HASURA_GRAPHQL_ENDPOINT`
- ❌ 前端不应该直接访问 Hasura

**检查后端配置：**
确保 `.env.local` 包含：
```
HASURA_GRAPHQL_ENDPOINT=你的Hasura端点
HASURA_ADMIN_SECRET=你的admin密钥
SUPABASE_URL=你的Supabase URL
SUPABASE_SERVICE_ROLE_KEY=你的服务密钥
```

---

#### 错误 4: 鱼加载了但不显示
**原因**：图片加载失败或Canvas渲染问题

**检查图片URL：**
```javascript
// 等待鱼加载完成后运行
setTimeout(() => {
  console.log('Loaded fish:', window.fishes || fishes);
  
  if (fishes && fishes[0]) {
    console.log('First fish canvas:', fishes[0].canvas);
    console.log('First fish image URL:', fishes[0].image_url);
  }
}, 3000);
```

**检查Canvas：**
```javascript
const canvas = document.getElementById('swim-canvas');
console.log('Canvas size:', canvas.width, 'x', canvas.height);
console.log('Canvas context:', canvas.getContext('2d'));
```

---

## 🧪 完整诊断脚本

复制以下脚本到控制台运行完整诊断：

```javascript
(async function diagnose() {
  console.log('=== My Tank 诊断开始 ===\n');
  
  // 1. 检查 token
  console.log('1. 检查登录 token...');
  const token = localStorage.getItem('userToken');
  if (!token) {
    console.log('❌ 未找到 token，请先登录');
    return;
  }
  console.log('✅ Token 已找到');
  
  try {
    // 2. 测试 API 连接
    console.log('\n2. 测试 API 连接...');
    const BACKEND_URL = window.location.origin;
    
    const response = await fetch(`${BACKEND_URL}/api/fishtank/my-fish`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API 响应状态:', response.status, response.statusText);
    
    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ API 错误:', result.error);
      return;
    }
    
    const fishCount = result.fish.length;
    console.log(`✅ API 返回 ${fishCount} 条鱼`);
    console.log('统计:', result.stats);
    
    if (fishCount > 0) {
      console.log('鱼列表:', result.fish.map(f => ({
        id: f.id,
        artist: f.artist,
        level: f.level,
        isOwn: f.isOwn,
        isFavorited: f.isFavorited
      })));
    } else {
      console.log('💡 提示：访问 /index.html 画一条鱼');
    }
    
    // 3. 检查页面状态
    console.log('\n3. 检查页面状态...');
    const canvas = document.getElementById('swim-canvas');
    const fishCount Display = document.getElementById('fish-count-display');
    
    if (canvas) {
      console.log('✅ Canvas 已找到，尺寸:', canvas.width, 'x', canvas.height);
    } else {
      console.log('❌ Canvas 未找到');
    }
    
    if (fishCountDisplay) {
      console.log('✅ 鱼数量显示:', fishCountDisplay.textContent);
    }
    
    // 4. 检查动画中的鱼
    console.log('\n4. 检查动画中的鱼...');
    if (typeof fishes !== 'undefined') {
      console.log(`✅ 动画中有 ${fishes.length} 条鱼`);
      if (fishes.length > 0) {
        console.log('第一条鱼信息:', {
          id: fishes[0].id,
          position: { x: fishes[0].x, y: fishes[0].y },
          isOwn: fishes[0].isOwn,
          isAlive: fishes[0].is_alive
        });
      }
    } else {
      console.log('❌ fishes 变量未定义');
    }
    
    console.log('\n=== 诊断完成 ===');
    
  } catch (error) {
    console.error('❌ 诊断过程中出错:', error);
  }
})();
```

---

## 📊 性能检查

### 检查帧率：
```javascript
let frameCount = 0;
let lastTime = performance.now();

const checkFPS = setInterval(() => {
  const now = performance.now();
  const fps = frameCount / ((now - lastTime) / 1000);
  console.log(`FPS: ${fps.toFixed(1)}`);
  frameCount = 0;
  lastTime = now;
}, 1000);

// 3秒后停止检查
setTimeout(() => clearInterval(checkFPS), 3000);
```

**期望结果：**
- FPS > 60: 优秀
- FPS 30-60: 良好
- FPS < 30: 需要优化

---

## 🔧 常用命令

### 重新加载鱼：
```javascript
// 刷新页面是最简单的方法
location.reload();

// 或者如果有重载函数
if (typeof loadPrivateFish === 'function') {
  loadPrivateFish();
}
```

### 清除缓存：
```javascript
// 清除localStorage
localStorage.clear();

// 清除sessionStorage
sessionStorage.clear();

// 强制刷新
location.reload(true);
```

### 查看所有鱼：
```javascript
if (typeof fishes !== 'undefined') {
  fishes.forEach((fish, i) => {
    console.log(`Fish ${i}:`, {
      id: fish.id,
      artist: fish.artist,
      level: fish.level,
      isOwn: fish.isOwn,
      isAlive: fish.is_alive,
      position: `(${fish.x.toFixed(0)}, ${fish.y.toFixed(0)})`
    });
  });
}
```

---

## 📞 需要帮助？

如果以上步骤都无法解决问题，请提供：

1. **浏览器信息**：
   ```javascript
   console.log(navigator.userAgent);
   ```

2. **控制台完整日志**：包括所有错误和警告

3. **诊断脚本输出**：运行上面的完整诊断脚本

4. **操作步骤**：详细描述你做了什么

---

**祝调试顺利！🐠**

