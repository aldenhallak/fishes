/**
 * 进入战斗模式API
 * POST /api/battle/enter-mode
 */

const redis = require('../../lib/redis');
const hasura = require('../../lib/hasura');

module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { userId, fishId } = req.body;
    
    if (!userId || !fishId) {
      return res.status(400).json({ 
        error: '缺少必需参数：userId 和 fishId' 
      });
    }
    
    // 1. 验证鱼是否存在且存活
    const fish = await hasura.getFishById(fishId);
    
    if (!fish) {
      return res.status(404).json({ error: '鱼不存在' });
    }
    
    if (!fish.is_alive) {
      return res.status(400).json({ error: '鱼已死亡，请先复活' });
    }
    
    if (fish.user_id !== userId) {
      return res.status(403).json({ error: '这不是你的鱼' });
    }
    
    // 2. 获取战斗配置
    const config = await hasura.getBattleConfig();
    const maxUsers = config?.max_battle_users || 100;
    
    // 3. 尝试进入战斗模式（Redis控制并发）
    const result = await redis.enterBattleMode(userId, fishId, maxUsers);
    
    // 4. 如果成功，更新数据库
    if (result.success) {
      await hasura.updateFish(fishId, {
        is_in_battle_mode: true
      });
    }
    
    // 5. 返回结果
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('进入战斗模式失败:', error);
    return res.status(500).json({ 
      error: '服务器错误',
      message: error.message 
    });
  }
};

