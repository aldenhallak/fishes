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
      let apiFile = path.join(__dirname, 'api', apiPath + '.js');
      
      // 调试日志：显示请求详情
      console.log(`[API] ${req.method} ${pathname}`);
      console.log(`[API] Query params:`, parsedUrl.query);
      
      // 检查是否为动态路由（如 /api/admin/tables/fish 或 /api/profile/userId）
      let dynamicMatch = null;
      if (!fs.existsSync(apiFile)) {
        const parts = apiPath.split('/');
        
        // 尝试匹配动态路由 /api/admin/tables/[tableName]
        if (parts.length >= 3 && parts[0] === 'admin' && parts[1] === 'tables' && parts[2]) {
          // /api/admin/tables/{tableName} -> api/admin/tables/[tableName].js
          apiFile = path.join(__dirname, 'api', 'admin', 'tables', '[tableName].js');
          if (fs.existsSync(apiFile)) {
            // 将动态参数添加到 req.query
            req.query = req.query || parsedUrl.query || {};
            req.query.tableName = parts[2];
            dynamicMatch = { tableName: parts[2] };
          }
        }
        
        // 尝试匹配动态路由 /api/profile/[userId]
        if (parts.length === 2 && parts[0] === 'profile' && parts[1]) {
          // /api/profile/{userId} -> api/profile/[userId].js
          apiFile = path.join(__dirname, 'api', 'profile', '[userId].js');
          if (fs.existsSync(apiFile)) {
            // 将动态参数添加到 req.query
            req.query = req.query || parsedUrl.query || {};
            req.query.userId = parts[1];
            dynamicMatch = { userId: parts[1] };
          }
        }
      }
      
      if (fs.existsSync(apiFile)) {
        // 清除缓存，确保每次都加载最新版本
        delete require.cache[require.resolve(apiFile)];
        const handler = require(apiFile);
        
        // 确保 req.query 已初始化
        req.query = req.query || parsedUrl.query || {};
        
        // 解析JSON请求体（但不解析multipart/form-data，让formidable处理）
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
          const contentType = req.headers['content-type'] || '';
          
          // 对于multipart/form-data，不读取请求体，让API处理器（如formidable）来处理
          if (contentType.includes('multipart/form-data')) {
            console.log('⚠️  Multipart请求，跳过body解析，交给API处理');
            req.body = {}; // 设置空对象避免后续代码出错
          } else {
            // 对于JSON和其他类型的请求，正常读取和解析
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            
            await new Promise((resolve) => {
              req.on('end', () => {
                try {
                  if (body && contentType.includes('application/json')) {
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
        console.log(`[API Handler] 调用处理器: ${apiFile}`);
        if (dynamicMatch) {
          console.log(`[API Handler] 动态路由匹配:`, dynamicMatch);
        }
        console.log(`[API Handler] Query参数:`, req.query);
        console.log(`[API Handler] Content-Type: ${req.headers['content-type'] || 'N/A'}`);
        if (req.body && Object.keys(req.body).length > 0) {
          console.log(`[API Handler] Request Body:`, req.body);
        }
        
        await handler(req, res);
        return;
      } else {
        console.error(`API file not found: ${apiFile}`);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API endpoint not found', path: apiFile }));
        return;
      }
    } catch (error) {
      console.error('API Error:', error);
      console.error(error.stack);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message, stack: error.stack }));
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
    console.log(`📋 测试中心: http://localhost:${port}/test-center.html`);
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

