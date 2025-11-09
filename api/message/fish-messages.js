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

    // 3. 构建查询条件
    // 如果是主人，可以看到公开+私密留言
    // 如果不是主人，只能看到公开留言
    let whereCondition = {
      fish_id: { _eq: fishId },
      message_type: { _eq: 'to_fish' }
    };

    if (!isOwner) {
      whereCondition.visibility = { _eq: 'public' };
    }

    // 4. 查询留言
    const messagesQuery = `
      query GetFishMessages($where: messages_bool_exp!) {
        messages(
          where: $where,
          order_by: { created_at: desc },
          limit: 100
        ) {
          id
          sender_id
          content
          visibility
          created_at
          sender {
            user_id
            display_name
            avatar_url
          }
        }
        messages_aggregate(where: $where) {
          aggregate {
            count
          }
        }
      }
    `;

    const messagesData = await hasura.query(messagesQuery, { where: whereCondition });

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

