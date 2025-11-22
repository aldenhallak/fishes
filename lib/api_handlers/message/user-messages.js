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
const hasura = require('../../hasura');

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
          nick_name
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
    // 先查询所有发给该用户的直接消息（receiver_id = userId）
    const directMessagesQuery = `
      query GetDirectMessages($receiverId: String!) {
        messages(
          where: {
            receiver_id: { _eq: $receiverId }
          },
          order_by: { created_at: desc },
          limit: 200
        ) {
          id
          sender_id
          receiver_id
          fish_id
          message_type
          content
          visibility
          created_at
          is_read
          read_at
        }
      }
    `;

    // 查询给该用户的鱼的消息（通过fish关联）
    const fishMessagesQuery = `
      query GetFishMessages($userId: String!) {
        fish(where: { user_id: { _eq: $userId } }) {
          id
          messages(
            where: { message_type: { _eq: "to_fish" } },
            order_by: { created_at: desc },
            limit: 200
          ) {
            id
            sender_id
            receiver_id
            fish_id
            message_type
            content
            visibility
            created_at
            is_read
            read_at
          }
        }
      }
    `;

    // 并行查询两种类型的消息
    const [directMessagesData, fishMessagesData] = await Promise.all([
      hasura.query(directMessagesQuery, { receiverId: userId }),
      hasura.query(fishMessagesQuery, { userId })
    ]);

    // 合并消息
    let allMessages = directMessagesData.messages || [];
    
    // 从fish关联中提取消息
    if (fishMessagesData.fish && fishMessagesData.fish.length > 0) {
      fishMessagesData.fish.forEach(fish => {
        if (fish.messages && fish.messages.length > 0) {
          allMessages = allMessages.concat(fish.messages);
        }
      });
    }

    // 去重（按id）
    const uniqueMessages = [];
    const seenIds = new Set();
    for (const msg of allMessages) {
      if (!seenIds.has(msg.id)) {
        seenIds.add(msg.id);
        uniqueMessages.push(msg);
      }
    }

    // 按时间排序
    uniqueMessages.sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeB - timeA;
    });

    const allMessagesData = { messages: uniqueMessages };
    
    // 调试：检查查询结果
    console.log('Query result for receiverId:', userId);
    console.log('Direct messages count:', directMessagesData.messages?.length || 0);
    console.log('Fish messages count:', fishMessagesData.fish?.reduce((sum, f) => sum + (f.messages?.length || 0), 0) || 0);
    console.log('Total unique messages count:', allMessagesData.messages?.length || 0);
    if (allMessagesData.messages && allMessagesData.messages.length > 0) {
      console.log('Sample messages:', JSON.stringify(allMessagesData.messages.slice(0, 3), null, 2));
    } else {
      console.log('No messages found in database for receiverId:', userId);
    }
    
    // 在API层过滤：如果是本人，显示所有；否则只显示公开留言
    let messages = allMessagesData.messages.filter(msg => {
      if (isOwner) {
        return true; // 本人可以看到所有留言
      }
      return msg.visibility === 'public'; // 其他人只能看公开留言
    });
    
    console.log('Filtered messages count:', messages.length);
    
    // 获取发送者和鱼的信息
    if (messages.length > 0) {
      const senderIds = [...new Set(messages.map(m => m.sender_id))];
      const fishIds = [...new Set(messages.filter(m => m.fish_id).map(m => m.fish_id))];
      
      // 获取用户信息
      const usersQuery = `
        query GetUsers($userIds: [String!]!) {
          users(where: { id: { _in: $userIds } }) {
            id
            nick_name
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
      
      // 获取鱼信息
      let fishMap = {};
      if (fishIds.length > 0) {
        const fishQuery = `
          query GetFishes($fishIds: [uuid!]!) {
            fish(where: { id: { _in: $fishIds } }) {
              id
              fish_name
              image_url
            }
          }
        `;
        
        const fishData = await hasura.query(fishQuery, { fishIds });
        if (fishData.fish) {
          fishData.fish.forEach(f => {
            fishMap[f.id] = f;
          });
        }
      }
      
      // 为每条留言添加发送者和鱼信息
      messages = messages.map(msg => ({
        ...msg,
        sender: usersMap[msg.sender_id] || { id: msg.sender_id, nick_name: 'Anonymous', avatar_url: null },
        fish: msg.fish_id ? (fishMap[msg.fish_id] || null) : null
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
      userInfo: {
        userId: userData.users_by_pk.id,
        displayName: userData.users_by_pk.nick_name,
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

