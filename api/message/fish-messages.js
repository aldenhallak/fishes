/**
 * 获取鱼的留言API
 * GET /api/message/fish-messages?fishId=xxx
 * 
 * 功能：
 * - 返回指定鱼的所有公开留言
 * - 如果是鱼的主人，还返回私密留言
 * - 按时间倒序排列
 */

require('dotenv').config({ path: '.env.local' });
const hasura = require('../../lib/hasura');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fishId, userId } = req.query;

    // 1. 参数验证
    if (!fishId) {
      return res.status(400).json({
        success: false,
        error: '缺少 fishId 参数'
      });
    }

    // 2. 首先获取鱼的信息，判断当前用户是否为鱼的主人
    const fishQuery = `
      query GetFish($fishId: uuid!) {
        fish_by_pk(id: $fishId) {
          id
          user_id
          fish_name
          artist
        }
      }
    `;

    const fishData = await hasura.query(fishQuery, { fishId });

    if (!fishData.fish_by_pk) {
      return res.status(404).json({
        success: false,
        error: '鱼不存在'
      });
    }

    const isOwner = userId && fishData.fish_by_pk.user_id === userId;

    // 3. 查询留言（使用管理员权限，在API层过滤）
    // 先查询所有相关留言，然后在代码中过滤
    const allMessagesQuery = `
      query GetFishMessages($fishId: uuid!) {
        messages(
          where: {
            fish_id: { _eq: $fishId },
            message_type: { _eq: "to_fish" }
          },
          order_by: { created_at: desc },
          limit: 200
        ) {
          id
          sender_id
          content
          visibility
          created_at
        }
      }
    `;

    const allMessagesData = await hasura.query(allMessagesQuery, { fishId });
    
    // 在API层过滤：如果是主人，显示所有；否则只显示公开留言
    let messages = allMessagesData.messages.filter(msg => {
      if (isOwner) {
        return true; // 主人可以看到所有留言
      }
      return msg.visibility === 'public'; // 其他人只能看公开留言
    });
    
    // 获取发送者信息
    if (messages.length > 0) {
      const senderIds = [...new Set(messages.map(m => m.sender_id))];
      const usersQuery = `
        query GetUsers($userIds: [String!]!) {
          users(where: { id: { _in: $userIds } }) {
            id
            display_name
            avatar_url
          }
        }
      `;
      
      const usersData = await hasura.query(usersQuery, { userIds: senderIds });
      const usersMap = {};
      if (usersData.users) {
        usersData.users.forEach(user => {
          usersMap[user.id] = user;
        });
      }
      
      // 为每条留言添加发送者信息
      messages = messages.map(msg => ({
        ...msg,
        sender: usersMap[msg.sender_id] || { id: msg.sender_id, display_name: 'Anonymous', avatar_url: null }
      }));
    }
    
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
      fishInfo: {
        id: fishData.fish_by_pk.id,
        name: fishData.fish_by_pk.fish_name,
        artist: fishData.fish_by_pk.artist
      },
      isOwner,
      messages: messagesData.messages,
      total: messagesData.messages_aggregate.aggregate.count
    });

  } catch (error) {
    console.error('Get fish messages error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '获取留言失败'
    });
  }
};

