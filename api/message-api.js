/**
 * Message API Router - 合并所有消息相关端点
 * 
 * 支持的 actions:
 * - send: 发送消息
 * - delete: 删除消息
 * - mark-read: 标记已读
 * - unread-count: 未读数量
 * - user-messages: 用户消息列表
 * - fish-messages: 鱼的消息列表
 */

const path = require('path');

// 动态加载 handler，避免启动时出错
let sendHandler, deleteHandler, markReadHandler, unreadCountHandler, userMessagesHandler, fishMessagesHandler;

function loadHandler(relativePath) {
  try {
    const handlerPath = path.resolve(__dirname, relativePath);
    console.log(`[Message API] Loading handler from: ${handlerPath}`);
    const handler = require(handlerPath);
    console.log(`[Message API] ✅ Handler loaded successfully: ${relativePath}`);
    return handler;
  } catch (error) {
    console.error(`[Message API] ❌ Failed to load handler: ${relativePath}`);
    console.error(`[Message API] Error message: ${error.message}`);
    console.error(`[Message API] Error stack: ${error.stack}`);
    return null;
  }
}

module.exports = async function handler(req, res) {
  const { action } = req.query;
  
  console.log(`[Message API] Request received: action=${action}`);
  console.log(`[Message API] Query params:`, req.query);
  
  // 动态加载 handlers（延迟加载，避免启动错误）
  if (!sendHandler) {
    console.log('[Message API] Initializing handlers...');
    sendHandler = loadHandler('../lib/api_handlers/message/send');
    deleteHandler = loadHandler('../lib/api_handlers/message/delete');
    markReadHandler = loadHandler('../lib/api_handlers/message/mark-read');
    unreadCountHandler = loadHandler('../lib/api_handlers/message/unread-count');
    userMessagesHandler = loadHandler('../lib/api_handlers/message/user-messages');
    fishMessagesHandler = loadHandler('../lib/api_handlers/message/fish-messages');
    console.log('[Message API] Handler initialization complete');
  }
  
  try {
    switch (action) {
      case 'send':
        if (!sendHandler) {
          return res.status(500).json({ error: 'Send handler not available' });
        }
        return await sendHandler(req, res);
      case 'delete':
        if (!deleteHandler) {
          return res.status(500).json({ error: 'Delete handler not available' });
        }
        return await deleteHandler(req, res);
      case 'mark-read':
        if (!markReadHandler) {
          return res.status(500).json({ error: 'Mark read handler not available' });
        }
        return await markReadHandler(req, res);
      case 'unread-count':
        if (!unreadCountHandler) {
          return res.status(500).json({ error: 'Unread count handler not available' });
        }
        return await unreadCountHandler(req, res);
      case 'user-messages':
        if (!userMessagesHandler) {
          return res.status(500).json({ error: 'User messages handler not available' });
        }
        return await userMessagesHandler(req, res);
      case 'fish-messages':
        if (!fishMessagesHandler) {
          return res.status(500).json({ error: 'Fish messages handler not available' });
        }
        return await fishMessagesHandler(req, res);
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          available: ['send', 'delete', 'mark-read', 'unread-count', 'user-messages', 'fish-messages']
        });
    }
  } catch (error) {
    console.error('[Message API] Error:', error);
    console.error('[Message API] Stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

