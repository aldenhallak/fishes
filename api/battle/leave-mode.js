/**
 * 离开战斗模式API
 * POST /api/battle/leave-mode
 */

require('dotenv').config({ path: '.env.local' });
const redis = require('../../lib/redis');
const hasura = require('../../lib/hasura');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing userId' 
      });
    }
    
    // 1. 获取用户的鱼ID
    const fishId = await redis.getUserFishId(userId);
    
    // 2. 从Redis移除
    await redis.removeBattleUser(userId);
    
    // 3. 更新数据库
    if (fishId) {
      await hasura.updateFish(fishId, {
        is_in_battle_mode: false
      });
    }
    
    // 4. 检查队列，让下一个用户进入
    const currentUsers = await redis.getBattleUserCount();
    const MAX_BATTLE_USERS = parseInt(process.env.MAX_BATTLE_USERS) || 100;
    
    if (currentUsers < MAX_BATTLE_USERS) {
      const nextUsers = await redis.getQueueUsers(1);
      if (nextUsers.length > 0) {
        // 这里可以通过WebSocket或其他方式通知用户
        console.log(`通知用户 ${nextUsers[0]} 可以进入战斗模式`);
      }
    }
    
    return res.json({
      success: true,
      currentUsers,
      maxUsers: MAX_BATTLE_USERS,
      message: '已离开战斗模式'
    });
    
  } catch (error) {
    console.error('离开战斗模式失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
};
