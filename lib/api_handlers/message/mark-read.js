/**
 * 标记消息为已读API
 * POST /api/message/mark-read
 * 
 * 功能：
 * - 标记单条消息或批量消息为已读
 * - 更新 is_read = true 和 read_at = now()
 * 
 * 请求体：
 * {
 *   "userId": "xxx",  // 接收者用户ID（用于验证权限）
 *   "messageIds": ["uuid1", "uuid2"]  // 要标记的消息ID数组，如果为空则标记所有未读消息
 * }
 */

require('dotenv').config({ path: '.env.local' });
const hasura = require('../../hasura');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, messageIds } = req.body;

    // 1. 参数验证
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '缺少 userId 参数'
      });
    }

    // 2. 构建更新条件
    let whereCondition = {
      receiver_id: { _eq: userId },
      is_read: { _eq: false }
    };

    // 如果指定了消息ID，则只更新这些消息
    if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
      whereCondition.id = { _in: messageIds };
    }

    // 3. 更新消息为已读
    const markReadMutation = `
      mutation MarkMessagesAsRead($where: messages_bool_exp!) {
        update_messages(
          where: $where,
          _set: {
            is_read: true,
            read_at: "now()"
          }
        ) {
          affected_rows
          returning {
            id
            is_read
            read_at
          }
        }
      }
    `;

    const result = await hasura.query(markReadMutation, { where: whereCondition });

    const affectedRows = result.update_messages?.affected_rows || 0;

    // 4. 返回结果
    return res.status(200).json({
      success: true,
      userId: userId,
      affectedRows: affectedRows,
      message: `成功标记 ${affectedRows} 条消息为已读`
    });

  } catch (error) {
    console.error('Mark messages as read error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '标记消息为已读失败'
    });
  }
};

