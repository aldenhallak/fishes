/**
 * Config API Router - 合并所有配置相关端点
 * 
 * 支持的 actions:
 * - backend: 后端类型配置
 * - supabase: Supabase配置
 * - login-mode: 登录模式
 * - group-chat: 群聊配置
 * - mono-chat: 独白配置
 * - chat-cost-saving: 聊天成本节约
 * - test-credentials: 测试凭证
 */

const path = require('path');

// 动态加载 handler，避免启动时出错
let backendHandler, supabaseHandler, loginModeHandler, groupChatHandler, monoChatHandler, chatCostSavingHandler, testCredentialsHandler, hasuraHandler;

function loadHandler(relativePath) {
  try {
    // 使用绝对路径，确保在不同环境下都能正确加载
    const handlerPath = path.resolve(__dirname, relativePath);
    console.log(`[Config API] Loading handler from: ${handlerPath}`);
    const handler = require(handlerPath);
    console.log(`[Config API] ✅ Handler loaded successfully: ${relativePath}`);
    return handler;
  } catch (error) {
    console.error(`[Config API] ❌ Failed to load handler: ${relativePath}`);
    console.error(`[Config API] Error message: ${error.message}`);
    console.error(`[Config API] Error stack: ${error.stack}`);
    return null;
  }
}

module.exports = async function handler(req, res) {
  const { action } = req.query;
  
  console.log(`[Config API] Request received: action=${action}`);
  console.log(`[Config API] Query params:`, req.query);
  console.log(`[Config API] __dirname:`, __dirname);
  console.log(`[Config API] NODE_ENV:`, process.env.NODE_ENV);
  
  // 动态加载 handlers（延迟加载，避免启动错误）
  // 在 Serverless 环境中，每次都重新加载以确保最新状态
  console.log('[Config API] Initializing handlers...');
  backendHandler = loadHandler('../lib/api_handlers/config/backend.js');
  supabaseHandler = loadHandler('../lib/api_handlers/config/supabase.js');
  loginModeHandler = loadHandler('../lib/api_handlers/config/login-mode.js');
  groupChatHandler = loadHandler('../lib/api_handlers/config/group-chat.js');
  monoChatHandler = loadHandler('../lib/api_handlers/config/mono-chat.js');
  chatCostSavingHandler = loadHandler('../lib/api_handlers/config/chat-cost-saving.js');
  testCredentialsHandler = loadHandler('../lib/api_handlers/config/test-credentials.js');
  hasuraHandler = loadHandler('../lib/api_handlers/config/hasura.js');
  console.log('[Config API] Handler initialization complete');
  console.log('[Config API] Handler status:', {
    backend: !!backendHandler,
    supabase: !!supabaseHandler,
    loginMode: !!loginModeHandler,
    groupChat: !!groupChatHandler,
    monoChat: !!monoChatHandler,
    chatCostSaving: !!chatCostSavingHandler,
    testCredentials: !!testCredentialsHandler
  });
  
  try {
    switch (action) {
      case 'backend':
        if (!backendHandler) {
          console.error('[Config API] Backend handler not loaded');
          return res.status(500).json({ error: 'Backend handler not available' });
        }
        return await backendHandler(req, res);
      case 'supabase':
        if (!supabaseHandler) {
          console.error('[Config API] Supabase handler not loaded');
          return res.status(500).json({ 
            error: 'Supabase handler not available',
            details: 'Handler failed to load. Check server logs for details.'
          });
        }
        console.log('[Config API] Calling supabase handler...');
        try {
          return await supabaseHandler(req, res);
        } catch (handlerError) {
          console.error('[Config API] Supabase handler execution error:', handlerError);
          console.error('[Config API] Error stack:', handlerError.stack);
          return res.status(500).json({
            error: 'Supabase handler execution failed',
            details: process.env.NODE_ENV === 'development' ? handlerError.message : undefined
          });
        }
      case 'login-mode':
        if (!loginModeHandler) {
          return res.status(500).json({ error: 'Login mode handler not available' });
        }
        return await loginModeHandler(req, res);
      case 'group-chat':
        if (!groupChatHandler) {
          return res.status(500).json({ error: 'Group chat handler not available' });
        }
        return await groupChatHandler(req, res);
      case 'mono-chat':
        if (!monoChatHandler) {
          return res.status(500).json({ error: 'Mono chat handler not available' });
        }
        return await monoChatHandler(req, res);
      case 'chat-cost-saving':
        if (!chatCostSavingHandler) {
          return res.status(500).json({ error: 'Chat cost saving handler not available' });
        }
        return await chatCostSavingHandler(req, res);
      case 'test-credentials':
        if (!testCredentialsHandler) {
          return res.status(500).json({ error: 'Test credentials handler not available' });
        }
        return await testCredentialsHandler(req, res);
      case 'hasura':
        if (!hasuraHandler) {
          return res.status(500).json({ error: 'Hasura handler not available' });
        }
        return await hasuraHandler(req, res);
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          available: ['backend', 'supabase', 'login-mode', 'group-chat', 'mono-chat', 'chat-cost-saving', 'test-credentials', 'hasura']
        });
    }
  } catch (error) {
    console.error('[Config API] Error:', error);
    console.error('[Config API] Stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

