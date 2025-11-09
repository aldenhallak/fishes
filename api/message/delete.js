/**
 * 删除留言API
 * DELETE /api/message/delete
 * 
 * 功能：
 * - 删除指定留言
 * - 权限：仅发送者或接收者可删除
 */

require('dotenv').config({ path: '.env.local' });
const hasura = require('../../lib/hasura');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messageId, userId } = req.body;

    // 1. 参数验证
    if (!messageId) {
      return res.status(400).json({
        success: false,
        error: '缺少 messageId 参数'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '未登录，无法删除留言'
      });
    }

    // 2. 首先查询留言，验证权限
    const messageQuery = `
      query GetMessage($messageId: uuid!) {
        messages_by_pk(id: $messageId) {
          id
          sender_id
          receiver_id
          content
        }
      }
    `;

    const messageData = await hasura.query(messageQuery, { messageId });

    if (!messageData.messages_by_pk) {
      return res.status(404).json({
        success: false,
        error: '留言不存在'
      });
    }

    const message = messageData.messages_by_pk;

    // 3. 验证权限：只有发送者或接收者可以删除
    const canDelete = message.sender_id === userId || message.receiver_id === userId;

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        error: '无权删除此留言'
      });
    }

    // 4. 删除留言
    const deleteMutation = `
      mutation DeleteMessage($messageId: uuid!) {
        delete_messages_by_pk(id: $messageId) {
          id
        }
      }
    `;

    const result = await hasura.mutation(deleteMutation, { messageId });

    if (!result.delete_messages_by_pk) {
      throw new Error('删除留言失败');
    }

    // 5. 返回成功响应
    return res.status(200).json({
      success: true,
      message: '留言已删除'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '删除留言失败'
    });
  }
};

