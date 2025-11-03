# 开发服务器自动处理端口占用

## 功能说明

修改了 `dev-server.js`，使其在端口被占用时能够智能处理：

### 处理流程

1. **检测端口占用**
   - 尝试监听指定端口（默认3000）
   - 如果失败，检测错误码是否为 `EADDRINUSE`

2. **查找占用进程**
   - 使用 `netstat -ano | findstr :端口` 查找占用该端口的进程
   - 提取 LISTENING 状态的进程 PID

3. **尝试关闭进程**
   - 使用 `taskkill /PID xxx /F` 强制关闭进程
   - 等待 500ms 确保端口释放
   - 重新尝试在原端口启动

4. **备用方案**
   - 如果无法关闭进程，自动尝试下一个端口（3001, 3002...）
   - 如果找不到占用进程，直接尝试下一个端口

## 代码实现

### 1. 查找占用端口的进程

```javascript
function findProcessByPort(port) {
  const { execSync } = require('child_process');
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
    const lines = result.split('\n');
    for (const line of lines) {
      if (line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        return pid;
      }
    }
  } catch (err) {
    return null;
  }
  return null;
}
```

### 2. 关闭进程

```javascript
function killProcess(pid) {
  const { execSync } = require('child_process');
  try {
    execSync(`taskkill /PID ${pid} /F`, { encoding: 'utf-8' });
    return true;
  } catch (err) {
    return false;
  }
}
```

### 3. 智能启动服务器

```javascript
function startServer(port, retryCount = 0) {
  server.listen(port, () => {
    console.log(`\n✅ 开发服务器启动成功！`);
    console.log(`🌐 访问地址: http://localhost:${port}/`);
    console.log(`📋 测试页面: http://localhost:${port}/test-qiniu-upload.html`);
    console.log(`\n按 Ctrl+C 停止服务器\n`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`\n⚠️  端口 ${port} 被占用`);
      
      const pid = findProcessByPort(port);
      
      if (pid && retryCount === 0) {
        console.log(`📍 找到占用进程 PID: ${pid}`);
        console.log(`🔄 尝试关闭该进程...`);
        
        if (killProcess(pid)) {
          console.log(`✅ 进程已关闭，重新启动服务器...`);
          setTimeout(() => {
            startServer(port, retryCount + 1);
          }, 500);
        } else {
          console.log(`❌ 无法关闭进程，尝试使用端口 ${port + 1}...`);
          startServer(port + 1, 0);
        }
      } else {
        console.log(`🔄 尝试使用端口 ${port + 1}...`);
        startServer(port + 1, 0);
      }
    } else {
      console.error('服务器启动失败:', err);
      process.exit(1);
    }
  });
}
```

## 使用示例

### 场景1：端口未被占用

```bash
npm run dev
```

输出：
```
✅ 开发服务器启动成功！
🌐 访问地址: http://localhost:3000/
📋 测试页面: http://localhost:3000/test-qiniu-upload.html

按 Ctrl+C 停止服务器
```

### 场景2：端口被占用，成功关闭旧进程

```bash
npm run dev
```

输出：
```
⚠️  端口 3000 被占用
📍 找到占用进程 PID: 12345
🔄 尝试关闭该进程...
✅ 进程已关闭，重新启动服务器...

✅ 开发服务器启动成功！
🌐 访问地址: http://localhost:3000/
📋 测试页面: http://localhost:3000/test-qiniu-upload.html

按 Ctrl+C 停止服务器
```

### 场景3：端口被占用，无法关闭，使用其他端口

```bash
npm run dev
```

输出：
```
⚠️  端口 3000 被占用
📍 找到占用进程 PID: 12345
🔄 尝试关闭该进程...
❌ 无法关闭进程，尝试使用端口 3001...

✅ 开发服务器启动成功！
🌐 访问地址: http://localhost:3001/
📋 测试页面: http://localhost:3001/test-qiniu-upload.html

按 Ctrl+C 停止服务器
```

## 特性

1. **智能处理**
   - ✅ 自动检测端口占用
   - ✅ 自动关闭旧进程（如果可以）
   - ✅ 自动选择可用端口

2. **友好提示**
   - ✅ 清晰的启动信息
   - ✅ 显示访问地址和测试页面
   - ✅ 显示处理过程

3. **安全性**
   - ✅ 只尝试关闭一次进程（避免循环）
   - ✅ 关闭失败时有备用方案
   - ✅ 适当的延迟确保端口释放

## 注意事项

1. **权限**：关闭进程需要适当权限，如果权限不足会自动切换到下一个端口

2. **端口范围**：会尝试 3000, 3001, 3002... 直到找到可用端口

3. **延迟**：关闭进程后等待 500ms 确保端口完全释放

## 修改的文件

- `dev-server.js` - 添加智能端口处理逻辑

---

**修改日期**: 2025-11-03  
**状态**: ✅ 已完成并测试

