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

const backendHandler = require('../lib/api-handlers/config/backend');
const supabaseHandler = require('../lib/api-handlers/config/supabase');
const loginModeHandler = require('../lib/api-handlers/config/login-mode');
const groupChatHandler = require('../lib/api-handlers/config/group-chat');
const monoChatHandler = require('../lib/api-handlers/config/mono-chat');
const chatCostSavingHandler = require('../lib/api-handlers/config/chat-cost-saving');
const testCredentialsHandler = require('../lib/api-handlers/config/test-credentials');

module.exports = async function handler(req, res) {
  const { action } = req.query;
  
  try {
    switch (action) {
      case 'backend':
        return await backendHandler(req, res);
      case 'supabase':
        return await supabaseHandler(req, res);
      case 'login-mode':
        return await loginModeHandler(req, res);
      case 'group-chat':
        return await groupChatHandler(req, res);
      case 'mono-chat':
        return await monoChatHandler(req, res);
      case 'chat-cost-saving':
        return await chatCostSavingHandler(req, res);
      case 'test-credentials':
        return await testCredentialsHandler(req, res);
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          available: ['backend', 'supabase', 'login-mode', 'group-chat', 'mono-chat', 'chat-cost-saving', 'test-credentials']
        });
    }
  } catch (error) {
    console.error('[Config API] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

