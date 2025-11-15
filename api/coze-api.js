/**
 * Coze API Router - 合并所有 AI 相关端点
 * 
 * 支持的 actions:
 * - config: Coze 配置
 * - messages: Coze 消息
 */

const configHandler = require('../lib/api_handlers/coze/config.js');
const messagesHandler = require('../lib/api_handlers/coze/messages.js');

module.exports = async function handler(req, res) {
  const { action } = req.query;
  
  try {
    switch (action) {
      case 'config':
        return await configHandler(req, res);
      case 'messages':
        return await messagesHandler(req, res);
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          available: ['config', 'messages']
        });
    }
  } catch (error) {
    console.error('[Coze API] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

