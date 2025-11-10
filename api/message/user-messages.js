/**
 * 获取用户收到的留言API
 * GET /api/message/user-messages?userId=xxx&currentUserId=xxx
 * 
 * 功能：
 * - 返回发给指定用户的公开留言
 * - 如果是用户本人，还返回私密留言
 * - 按时间倒序排列
 */

require('dotenv').config({ path: '.env.local' });
const hasura = require('../../lib/hasura');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, currentUserId } = req.query;

    // 1. 参数验证
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '缺少 userId 参数'
      });
    }

    // 2. 验证用户是否存在
    const userQuery = `
      query GetUser($userId: String!) {
        users_by_pk(id: $userId) {
          id
          display_name
          avatar_url
        }
      }
    `;

    const userData = await hasura.query(userQuery, { userId });

    if (!userData.users_by_pk) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    const isOwner = currentUserId && currentUserId === userId;

    // 3. 查询留言（使用管理员权限，在API层过滤）
    // 先查询所有发给该用户的留言，然后在代码中过滤
    const allMessagesQuery = `
      query GetUserMessages($receiverId: String!) {
        messages(
          where: {
            receiver_id: { _eq: $receiverId }
          },
          order_by: { created_at: desc },
          limit: 200
        ) {
          id
          sender_id
          fish_id
          message_type
          content
          visibility
          created_at
          sender {
            id
            display_name
            avatar_url
          }
          fish {
            id
            fish_name
            image_url
          }
        }
      }
    `;

    const allMessagesData = await hasura.query(allMessagesQuery, { receiverId: userId });
    
    // 在API层过滤：如果是本人，显示所有；否则只显示公开留言
    const messages = allMessagesData.messages.filter(msg => {
      if (isOwner) {
        return true; // 本人可以看到所有留言
      }
      return msg.visibility === 'public'; // 其他人只能看公开留言
    });
    
    const messagesData = {
      messages: messages,
      messages_aggregate: {
        aggregate: {
          count: messages.length
        }
      }
    };

    // 5. 返回结果
    return res.status(200).json({
      success: true,
      userInfo: {
        userId: userData.users_by_pk.id,
        displayName: userData.users_by_pk.display_name,
        avatarUrl: userData.users_by_pk.avatar_url
      },
      isOwner,
      messages: messagesData.messages,
      total: messagesData.messages_aggregate.aggregate.count
    });

  } catch (error) {
    console.error('Get user messages error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '获取留言失败'
    });
  }
};

