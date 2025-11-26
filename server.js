/**
 * Railway 部署的主服务器文件
 * 提供静态文件和 API 路由
 */

require('dotenv').config({ path: '.env.local' });

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

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
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// 解析请求体
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // API 路由
  if (pathname.startsWith('/api/')) {
    try {
      // 添加 query 到 req 对象
      req.query = parsedUrl.query;
      
      // 解析请求体（跳过 multipart/form-data，让 formidable 处理）
      const contentType = req.headers['content-type'] || '';
      const isMultipart = contentType.includes('multipart/form-data');
      
      if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') && !isMultipart) {
        req.body = await parseBody(req);
      } else if (isMultipart) {
        // multipart请求不解析body，保留原始流给formidable处理
        console.log('[Server] 跳过multipart请求的body解析，保留给formidable处理');
        req.body = {}; // 设置空对象避免undefined
      }
      
      // 动态加载 API handler
      const apiPath = pathname.slice(5); // 移除 '/api/'
      let handlerFile = `./api/${apiPath}.js`;
      
      // 检查直接路径
      if (fs.existsSync(handlerFile)) {
        const handler = require(handlerFile);
        
        // 包装响应对象以支持 Express 风格的方法
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data) => {
          res.writeHead(res.statusCode || 200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
          return res;
        };
        
        return await handler(req, res);
      }
      
      // 检查动态路由 (例如 /api/profile/[userId])
      const pathParts = apiPath.split('/');
      if (pathParts.length >= 2) {
        const basePath = pathParts.slice(0, -1).join('/');
        const dynamicParam = pathParts[pathParts.length - 1];
        const dynamicHandlerFile = `./api/${basePath}/[${pathParts[0] === 'profile' ? 'userId' : 'id'}].js`;
        
        if (fs.existsSync(dynamicHandlerFile)) {
          const handler = require(dynamicHandlerFile);
          
          // 添加动态参数到 req.query
          req.query = req.query || {};
          if (pathParts[0] === 'profile') {
            req.query.userId = dynamicParam;
          } else {
            req.query.id = dynamicParam;
          }
          
          // 包装响应对象
          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data) => {
            res.writeHead(res.statusCode || 200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
            return res;
          };
          
          return await handler(req, res);
        }
      }
      
      // 未找到处理器
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
    } catch (error) {
      console.error('API Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }));
    }
    return;
  }
  
  // 静态文件服务
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);
  
  // 如果文件不存在，尝试添加 .html
  if (!fs.existsSync(filePath)) {
    filePath = filePath + '.html';
  }
  
  // 读取文件
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      const extname = String(path.extname(filePath)).toLowerCase();
      const contentType = mimeTypes[extname] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});

