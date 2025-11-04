/**
 * 本地开发服务器
 * 用于测试API端点
 */

require('dotenv').config({ path: '.env.local' });
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  console.log(`${req.method} ${pathname}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API routes
  if (pathname.startsWith('/api/')) {
    try {
      const apiPath = pathname.replace('/api/', '');
      const apiFile = path.join(__dirname, 'api', apiPath + '.js');
      
      if (fs.existsSync(apiFile)) {
        // 清除缓存，确保每次都加载最新版本
        delete require.cache[require.resolve(apiFile)];
        const handler = require(apiFile);
        
        // 解析JSON请求体
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          
          await new Promise((resolve) => {
            req.on('end', () => {
              try {
                if (body && req.headers['content-type']?.includes('application/json')) {
                  req.body = JSON.parse(body);
                } else {
                  req.body = {};
                }
              } catch (e) {
                console.error('JSON解析错误:', e);
                req.body = {};
              }
              resolve();
            });
          });
        }
        
        // 包装 res 对象以支持 Vercel 风格的 API
        res.status = function(code) {
          res.statusCode = code;
          return res;
        };
        
        res.json = function(data) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };
        
        // 记录请求信息用于调试
        console.log(`API调用: ${req.method} ${pathname}`);
        console.log(`Content-Type: ${req.headers['content-type']}`);
        console.log(`Request Body:`, req.body);
        
        await handler(req, res);
        return;
      } else {
        console.error(`API file not found: ${apiFile}`);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API endpoint not found' }));
        return;
      }
    } catch (error) {
      console.error('API Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
      return;
    }
  }

  // Static files
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  // 如果没有扩展名，尝试添加 .html
  if (!path.extname(filePath)) {
    filePath += '.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// 查找占用指定端口的进程PID
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
    // netstat命令失败或没有找到进程
    return null;
  }
  return null;
}

// 尝试结束指定PID的进程
function killProcess(pid) {
  const { execSync } = require('child_process');
  try {
    execSync(`taskkill /PID ${pid} /F`, { encoding: 'utf-8' });
    return true;
  } catch (err) {
    return false;
  }
}

// 尝试启动服务器
function startServer(port, retryCount = 0) {
  server.listen(port, () => {
    console.log(`\n✅ 开发服务器启动成功！`);
    console.log(`🌐 访问地址: http://localhost:${port}/`);
    console.log(`📋 测试页面: http://localhost:${port}/test-qiniu-upload.html`);
    console.log(`\n按 Ctrl+C 停止服务器\n`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`\n⚠️  端口 ${port} 被占用`);
      
      // 查找占用端口的进程
      const pid = findProcessByPort(port);
      
      if (pid && retryCount === 0) {
        console.log(`📍 找到占用进程 PID: ${pid}`);
        console.log(`🔄 尝试关闭该进程...`);
        
        if (killProcess(pid)) {
          console.log(`✅ 进程已关闭，重新启动服务器...`);
          // 等待一小段时间确保端口释放
          setTimeout(() => {
            startServer(port, retryCount + 1);
          }, 500);
        } else {
          console.log(`❌ 无法关闭进程，尝试使用端口 ${port + 1}...`);
          startServer(port + 1, 0);
        }
      } else {
        // 已经尝试过关闭进程，或找不到进程，使用下一个端口
        console.log(`🔄 尝试使用端口 ${port + 1}...`);
        startServer(port + 1, 0);
      }
    } else {
      console.error('服务器启动失败:', err);
      process.exit(1);
    }
  });
}

startServer(PORT);

