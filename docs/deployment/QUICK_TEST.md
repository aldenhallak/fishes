# 🚀 快速测试指南

## ✅ 刚才做了什么

根据您的错误日志，我进行了以下修复：

### 1. ✅ 代码修复已成功
从日志可以看到，`BACKEND_URL` 变量已经能正常工作了。

### 2. 🔧 新增修复
- **切换到生产环境后端**：现在默认使用云端后端，无需本地启动服务器
- **Canvas 性能优化**：添加 `willReadFrequently: true` 参数，消除性能警告

---

## 🧪 现在请测试

### 步骤 1: 刷新页面
**重要！** 必须强制刷新清除缓存：
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 步骤 2: 检查后端 URL
打开控制台（F12），输入：
```javascript
console.log('Current BACKEND_URL:', window.BACKEND_URL);
```

**应该看到：**
```
Current BACKEND_URL: https://fishes-be-571679687712.northamerica-northeast1.run.app
```

### 步骤 3: 测试提交
1. 在画布上画一条鱼 🐟
2. 点击 "make it swim!" 按钮
3. 输入艺术家名称
4. 点击 "Submit"

**预期结果：**
- ✅ 显示加载动画
- ✅ 成功跳转到 `tank.html`
- ✅ 看到你的鱼在游泳！

---

## 🔄 如何切换后端环境

### 使用生产环境（当前默认）
```
http://localhost:端口/index.html
```
或
```
http://localhost:端口/index.html?prod=true
```

### 使用本地后端（需要先启动本地服务器）
```
http://localhost:端口/index.html?local=true
```

---

## ❓ 如果还有问题

### 情况 1: 仍然显示 "ERR_CONNECTION_REFUSED"

**请先刷新页面** (Ctrl+Shift+R)，清除浏览器缓存。

如果刷新后还有问题：
```javascript
// 在控制台检查
console.log(window.BACKEND_URL);
```

### 情况 2: 提交后显示 "CORS error" 或 "403 Forbidden"

这是正常的！生产环境后端可能有以下限制：
- CORS 策略限制
- API 访问限制
- 需要认证

**解决方案：**
1. 启动本地后端服务器
2. 使用 `?local=true` 参数
3. 或者联系后端开发者配置 CORS

### 情况 3: 提交成功但鱼没出现

**检查项：**
- 打开 `tank.html` 看看是否有任何鱼
- F12 控制台是否有错误
- Network 标签页查看图片是否加载成功

---

## 📊 修复前后对比

| 问题 | 修复前 | 修复后 |
|------|--------|--------|
| 变量作用域 | ❌ `BACKEND_URL is not defined` | ✅ 正常工作 |
| 后端连接 | ❌ 需要本地后端 | ✅ 使用生产环境 |
| Canvas 警告 | ⚠️ 性能警告 | ✅ 已优化 |

---

## 🎯 测试清单

在确认问题解决前，请验证：

- [ ] 强制刷新页面（Ctrl+Shift+R）
- [ ] 控制台显示正确的 BACKEND_URL
- [ ] 没有 "BACKEND_URL is not defined" 错误
- [ ] 没有 Canvas 性能警告
- [ ] 能够成功提交鱼
- [ ] 提交后能在 tank.html 看到鱼

---

## 💡 提示

如果您想回到使用本地后端的配置：

1. 打开 `src/js/fish-utils.js`
2. 找到第 33 行
3. 改回原来的逻辑：

```javascript
// 修改为：
: isLocalhost
? 'http://localhost:8080'
: 'https://fishes-be-571679687712.northamerica-northeast1.run.app';
```

但记得要先启动本地后端服务器！

---

**测试时间：** 现在！  
**预计用时：** 2 分钟  
**难度：** ⭐ 简单

祝测试顺利！🐟✨


