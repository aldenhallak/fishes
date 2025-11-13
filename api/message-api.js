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

const sendHandler = require('./message/send');
const deleteHandler = require('./message/delete');
const markReadHandler = require('./message/mark-read');
const unreadCountHandler = require('./message/unread-count');
const userMessagesHandler = require('./message/user-messages');
const fishMessagesHandler = require('./message/fish-messages');

module.exports = async function handler(req, res) {
  const { action } = req.query;
  
  try {
    switch (action) {
      case 'send':
        return await sendHandler(req, res);
      case 'delete':
        return await deleteHandler(req, res);
      case 'mark-read':
        return await markReadHandler(req, res);
      case 'unread-count':
        return await unreadCountHandler(req, res);
      case 'user-messages':
        return await userMessagesHandler(req, res);
      case 'fish-messages':
        return await fishMessagesHandler(req, res);
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          available: ['send', 'delete', 'mark-read', 'unread-count', 'user-messages', 'fish-messages']
        });
    }
  } catch (error) {
    console.error('[Message API] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

