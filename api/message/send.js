/**
 * 发送留言API
 * POST /api/message/send
 * 
 * 功能：
 * - 支持给鱼留言（to_fish）
 * - 支持给鱼主人留言（to_owner）
 * - 可选公开/私密
 * - 频率限制：1分钟内最多1条
 * - 内容限制：1-50字符
 */

require('dotenv').config({ path: '.env.local' });
const hasura = require('../../lib/hasura');
const redis = require('../../lib/redis');

// 频率限制：1分钟
const RATE_LIMIT_SECONDS = 60;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, messageType, targetId, visibility = 'public', content } = req.body;

    // 1. 参数验证
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '未登录，无法发送留言'
      });
    }

    if (!messageType || !targetId || !content) {
      return res.status(400).json({
        success: false,
        error: '缺少必填参数'
      });
    }

    // 验证 messageType
    if (!['to_fish', 'to_owner'].includes(messageType)) {
      return res.status(400).json({
        success: false,
        error: '无效的留言类型'
      });
    }

    // 验证 visibility
    if (!['public', 'private'].includes(visibility)) {
      return res.status(400).json({
        success: false,
        error: '无效的可见性设置'
      });
    }

    // 验证内容长度
    const trimmedContent = content.trim();
    if (trimmedContent.length < 1 || trimmedContent.length > 50) {
      return res.status(400).json({
        success: false,
        error: '留言内容必须在1-50字符之间'
      });
    }

    // 2. 频率限制检查（Redis）
    try {
      const redisClient = await redis.getClient();
      const rateLimitKey = `message:rate_limit:${userId}`;
      const lastMessageTime = await redisClient.get(rateLimitKey);

      if (lastMessageTime) {
        return res.status(429).json({
          success: false,
          error: '发送过于频繁，请稍后再试',
          retryAfter: RATE_LIMIT_SECONDS
        });
      }

      // 设置频率限制
      await redisClient.setex(rateLimitKey, RATE_LIMIT_SECONDS, Date.now().toString());
    } catch (redisError) {
      console.error('Redis rate limit error:', redisError);
      // Redis 失败不影响主功能，继续执行
    }

    // 3. 根据留言类型构建不同的对象
    let messageObject = {
      sender_id: userId,
      message_type: messageType,
      visibility: visibility,
      content: trimmedContent
    };

    if (messageType === 'to_fish') {
      // 给鱼留言：需要 fish_id
      messageObject.fish_id = targetId;
      
      // 验证鱼是否存在
      const fishCheckQuery = `
        query CheckFish($fishId: uuid!) {
          fish_by_pk(id: $fishId) {
            id
            user_id
          }
        }
      `;
      
      const fishData = await hasura.query(fishCheckQuery, { fishId: targetId });
      
      if (!fishData.fish_by_pk) {
        return res.status(404).json({
          success: false,
          error: '鱼不存在'
        });
      }
      
      // 设置接收者为鱼的主人
      messageObject.receiver_id = fishData.fish_by_pk.user_id;
      
    } else if (messageType === 'to_owner') {
      // 给主人留言：需要 receiver_id
      messageObject.receiver_id = targetId;
      
      // 验证用户是否存在
      const userCheckQuery = `
        query CheckUser($userId: String!) {
          users_by_pk(id: $userId) {
            id
          }
        }
      `;
      
      const userData = await hasura.query(userCheckQuery, { userId: targetId });
      
      if (!userData.users_by_pk) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }
    }

    // 4. 插入留言到数据库
    const insertMutation = `
      mutation InsertMessage($message: messages_insert_input!) {
        insert_messages_one(object: $message) {
          id
          sender_id
          receiver_id
          fish_id
          message_type
          visibility
          content
          created_at
        }
      }
    `;

    const result = await hasura.mutation(insertMutation, { message: messageObject });

    if (!result.insert_messages_one) {
      throw new Error('插入留言失败');
    }

    // 5. 返回成功响应
    return res.status(200).json({
      success: true,
      message: '留言发送成功',
      data: result.insert_messages_one
    });

  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '发送留言失败'
    });
  }
};

