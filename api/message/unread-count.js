/**
 * 获取用户未读消息数量API
 * GET /api/message/unread-count?userId=xxx
 * 
 * 功能：
 * - 返回指定用户的未读消息总数
 * - 只统计 receiver_id = userId 且 is_read = false 的消息
 */

require('dotenv').config({ path: '.env.local' });
const hasura = require('../../lib/hasura');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    // 1. 参数验证
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '缺少 userId 参数'
      });
    }

    // 2. 查询未读消息数量
    const unreadCountQuery = `
      query GetUnreadCount($receiverId: String!) {
        messages_aggregate(
          where: {
            receiver_id: { _eq: $receiverId }
            is_read: { _eq: false }
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `;

    const result = await hasura.query(unreadCountQuery, { receiverId: userId });

    const unreadCount = result.messages_aggregate?.aggregate?.count || 0;

    // 3. 返回结果
    return res.status(200).json({
      success: true,
      userId: userId,
      unreadCount: unreadCount
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '获取未读消息数量失败'
    });
  }
};

