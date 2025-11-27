/**
 * 诊断API - 检查服务器环境和配置
 * GET /api/diagnostics
 */

const path = require('path');

module.exports = async function handler(req, res) {
  // 仅允许在开发环境访问
  const isDev = process.env.NODE_ENV === 'development' || 
                process.env.VERCEL_ENV === 'preview';
  
  if (!isDev) {
    return res.status(403).json({ 
      error: 'Diagnostics only available in development/preview environments' 
    });
  }

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      cwd: process.cwd(),
      __dirname: __dirname
    },
    envVars: {
      HASURA_GRAPHQL_ENDPOINT: !!process.env.HASURA_GRAPHQL_ENDPOINT,
      HASURA_ADMIN_SECRET: !!process.env.HASURA_ADMIN_SECRET,
      QINIU_ACCESS_KEY: !!process.env.QINIU_ACCESS_KEY,
      QINIU_SECRET_KEY: !!process.env.QINIU_SECRET_KEY,
      QINIU_BUCKET: !!process.env.QINIU_BUCKET,
      QINIU_BASE_URL: !!process.env.QINIU_BASE_URL,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY
    },
    modules: {},
    handlers: {}
  };

  // 测试模块加载
  const modulesToTest = [
    { name: 'dotenv', path: 'dotenv', isNpmPackage: true },
    { name: 'qiniu', path: 'qiniu', isNpmPackage: true },
    { name: 'formidable', path: 'formidable', isNpmPackage: true },
    { name: 'hasura', path: '../lib/hasura', isNpmPackage: false },
    { name: 'qiniu-config', path: '../lib/qiniu/config', isNpmPackage: false },
    { name: 'qiniu-uploader', path: '../lib/qiniu/uploader', isNpmPackage: false },
    { name: 'qiniu-categories', path: '../lib/qiniu/categories', isNpmPackage: false }
  ];

  for (const mod of modulesToTest) {
    try {
      let resolved;
      if (mod.isNpmPackage) {
        // npm 包直接 require
        require(mod.path);
        resolved = mod.path + ' (npm package)';
      } else {
        // 本地模块使用相对路径
        resolved = path.resolve(__dirname, mod.path);
        require(resolved);
      }
      
      diagnostics.modules[mod.name] = {
        status: 'ok',
        path: resolved
      };
    } catch (error) {
      diagnostics.modules[mod.name] = {
        status: 'error',
        error: error.message,
        code: error.code,
        stack: error.stack
      };
    }
  }

  // 测试 handler 加载
  const handlersToTest = [
    { name: 'message-unread-count', path: '../lib/api_handlers/message/unread-count.js' },
    { name: 'fish-upload', path: '../lib/api_handlers/fish/upload.js' }
  ];

  for (const handler of handlersToTest) {
    try {
      const resolved = path.resolve(__dirname, handler.path);
      const loaded = require(resolved);
      diagnostics.handlers[handler.name] = {
        status: 'ok',
        path: resolved,
        type: typeof loaded
      };
    } catch (error) {
      diagnostics.handlers[handler.name] = {
        status: 'error',
        error: error.message,
        code: error.code,
        stack: error.stack
      };
    }
  }

  return res.status(200).json(diagnostics);
};

