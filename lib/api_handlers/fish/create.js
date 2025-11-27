/**
 * 创建新鱼API（画鱼后消耗鱼食）
 * POST /api/fish/create
 */

require('dotenv').config({ path: '.env.local' });
const hasura = require('../../hasura');

// 创建新鱼消耗的鱼食数量
const CREATE_COST = 2;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { userId, imageUrl, artist } = req.body;
    
    if (!userId || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // 1. 获取用户经济数据
    const economy = await hasura.getUserEconomy(userId);
    
    if (economy.fish_food < CREATE_COST) {
      return res.json({
        success: false,
        insufficientFunds: true,
        message: '鱼食不足，无法创建新鱼',
        current: economy.fish_food,
        required: CREATE_COST
      });
    }
    
    // 2. 生成随机天赋值（25-75）
    const talent = Math.floor(Math.random() * 50) + 25;
    
    // 手动设置北京时间 - 数据库字段是timestamp类型，需要提供不带时区的格式
    const now = new Date();
    // 创建北京时间，但格式化为timestamp格式（不带时区）
    const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const createdAt = beijingTime.toISOString().replace('T', ' ').replace('Z', '').substring(0, 19); // 格式：YYYY-MM-DD HH:mm:ss
    
    console.log('  当前UTC时间:', now.toISOString());
    console.log('  北京时间:', beijingTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
    console.log('  数据库timestamp格式:', createdAt);
    
    // 3. 执行事务：扣除鱼食 + 创建鱼 + 记录日志
    const transactionMutation = `
      mutation CreateFish(
        $userId: String!,
        $imageUrl: String!,
        $artist: String!,
        $talent: Int!,
        $createCost: Int!,
        $createdAt: timestamp!
      ) {
        update_user_economy_by_pk(
          pk_columns: { user_id: $userId },
          _inc: { fish_food: -$createCost, total_spent: $createCost }
        ) {
          fish_food
        }
        
        insert_fish_one(
          object: {
            user_id: $userId,
            image_url: $imageUrl,
            artist: $artist,
            talent: $talent,
            level: 1,
            experience: 0,
            health: 10,
            max_health: 10,
            upvotes: 0,
            battle_power: 0,
            is_alive: true,
            is_in_battle_mode: false,
            position_row: 0,
            total_wins: 0,
            total_losses: 0,
            created_at: $createdAt
          }
        ) {
          id
          user_id
          image_url
          artist
          talent
          level
          health
          max_health
          created_at
        }
        
        insert_economy_log_one(
          object: {
            user_id: $userId,
            action: "create",
            amount: -$createCost,
            balance_after: 0
          }
        ) {
          id
        }
      }
    `;
    
    const result = await hasura.mutation(transactionMutation, {
      userId,
      imageUrl,
      artist: artist || 'Anonymous',
      talent,
      createCost: CREATE_COST,
      createdAt
    });
    
    const newFish = result.insert_fish_one;
    
    return res.json({
      success: true,
      message: '创建成功！',
      fish: {
        id: newFish.id,
        imageUrl: newFish.image_url,
        artist: newFish.artist,
        talent: newFish.talent,
        level: newFish.level,
        health: newFish.health,
        maxHealth: newFish.max_health,
        createdAt: newFish.created_at
      },
      economy: {
        fishFood: result.update_user_economy_by_pk.fish_food,
        spent: CREATE_COST
      },
      talentRating: getTalentRating(talent)
    });
    
  } catch (error) {
    console.error('创建鱼失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误'
    });
  }
};

/**
 * 获取天赋评级
 */
function getTalentRating(talent) {
  if (talent >= 70) return { grade: 'S', color: '#FFD700', text: '传说' };
  if (talent >= 60) return { grade: 'A', color: '#9370DB', text: '卓越' };
  if (talent >= 50) return { grade: 'B', color: '#4169E1', text: '优秀' };
  if (talent >= 40) return { grade: 'C', color: '#32CD32', text: '良好' };
  return { grade: 'D', color: '#808080', text: '普通' };
}



