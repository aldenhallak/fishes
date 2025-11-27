/**
 * 诊断端点 - 检查环境变量和模块加载
 * GET /api/debug-env
 */

module.exports = async function handler(req, res) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const diagnostics = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    env: process.env.NODE_ENV || 'not set',
    dirname: __dirname,
    cwd: process.cwd(),
    
    // 检查环境变量（不显示完整值，只显示是否设置）
    envVars: {
      SUPABASE_URL: process.env.SUPABASE_URL ? `Set (${process.env.SUPABASE_URL.substring(0, 30)}...)` : '❌ Not set',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? `Set (${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...)` : '❌ Not set',
      HASURA_GRAPHQL_ENDPOINT: process.env.HASURA_GRAPHQL_ENDPOINT ? '✅ Set' : '❌ Not set',
      HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET ? '✅ Set' : '❌ Not set',
    },
    
    // 尝试加载 handler
    handlerTests: {}
  };

  // 测试加载 supabase handler
  try {
    const path = require('path');
    const handlerPath = path.resolve(__dirname, '../lib/api_handlers/config/supabase.js');
    diagnostics.handlerTests.supabaseHandlerPath = handlerPath;
    
    const handler = require(handlerPath);
    diagnostics.handlerTests.supabaseHandlerLoaded = '✅ Success';
    diagnostics.handlerTests.supabaseHandlerType = typeof handler;
  } catch (error) {
    diagnostics.handlerTests.supabaseHandlerLoaded = '❌ Failed';
    diagnostics.handlerTests.supabaseHandlerError = error.message;
    diagnostics.handlerTests.supabaseHandlerStack = error.stack;
  }

  // 检查文件系统
  try {
    const fs = require('fs');
    const path = require('path');
    
    // 列出 lib 目录
    const libPath = path.resolve(__dirname, '../lib');
    diagnostics.filesystem = {
      libExists: fs.existsSync(libPath),
      libContents: fs.existsSync(libPath) ? fs.readdirSync(libPath) : []
    };
    
    // 列出 lib/api_handlers 目录
    const handlersPath = path.resolve(__dirname, '../lib/api_handlers');
    diagnostics.filesystem.handlersExists = fs.existsSync(handlersPath);
    if (fs.existsSync(handlersPath)) {
      diagnostics.filesystem.handlersContents = fs.readdirSync(handlersPath);
      
      // 列出 lib/api_handlers/config 目录
      const configPath = path.resolve(handlersPath, 'config');
      diagnostics.filesystem.configExists = fs.existsSync(configPath);
      if (fs.existsSync(configPath)) {
        diagnostics.filesystem.configContents = fs.readdirSync(configPath);
      }
    }
  } catch (error) {
    diagnostics.filesystem = {
      error: error.message
    };
  }

  return res.status(200).json(diagnostics);
};

