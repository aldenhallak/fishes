/**
 * 自动化创建和配置鱼个性系统
 * 包含20种符合美国文化的有趣个性
 */

const { query, mutation } = require('../lib/hasura.js');
const fs = require('fs');
const path = require('path');

// 20种纯粹的个性特征（按美国文化受欢迎程度排序）
const personalities = [
  {
    name: 'funny',
    description: 'Hilarious and always cracking jokes. Makes everyone laugh, finds humor in everything, and believes laughter is the best medicine. Life\'s a comedy show and they\'re the star comedian.'
  },
  {
    name: 'cheerful',
    description: 'Eternally optimistic and upbeat. Sees the bright side of everything, spreads positive vibes, and maintains enthusiasm even in difficult situations. Infectious happiness that lifts others\' spirits.'
  },
  {
    name: 'brave',
    description: 'Fearless and bold in the face of danger. Takes risks without hesitation, stands up for what\'s right, and never backs down from a challenge. Courage runs deep.'
  },
  {
    name: 'playful',
    description: 'Fun-loving and always ready for games. Finds joy in simple pleasures, loves to joke around, and approaches life with childlike wonder. Takes nothing too seriously.'
  },
  {
    name: 'curious',
    description: 'Endlessly inquisitive and eager to learn. Questions everything, explores constantly, and fascinated by how things work. Nose in everyone\'s business out of genuine interest.'
  },
  {
    name: 'energetic',
    description: 'Hyperactive and always buzzing with energy. Constantly moving, can\'t sit still, and brings high-octane enthusiasm to everything. Like they\'re permanently caffeinated.'
  },
  {
    name: 'calm',
    description: 'Serene and unshakeable no matter what happens. Nothing ruffles their composure, maintains inner peace, and brings tranquility to chaotic situations. The eye of any storm.'
  },
  {
    name: 'gentle',
    description: 'Kind-hearted and tender in all interactions. Speaks softly, acts with compassion, and wouldn\'t hurt a fly. The embodiment of sweetness and care.'
  },
  {
    name: 'sarcastic',
    description: 'Sharp-tongued with cutting wit. Communicates primarily through irony and mockery, rarely says what they mean directly, and humor is their defense mechanism. Masters of the eye-roll.'
  },
  {
    name: 'dramatic',
    description: 'Theatrical and exaggerates everything for effect. Turns minor events into epic sagas, expresses emotions intensely, and life is their stage. Everything is either amazing or catastrophic.'
  },
  {
    name: 'naive',
    description: 'Innocent and believes the best in everyone. Takes things at face value, trusts easily, and oblivious to deception. Sees the world through rose-colored glasses.'
  },
  {
    name: 'shy',
    description: 'Timid, reserved, and easily embarrassed. Avoids attention, speaks softly, and takes time to warm up to others. Prefers observing from the sidelines rather than being in the spotlight.'
  },
  {
    name: 'anxious',
    description: 'Constantly worried and overthinking everything. Sees potential problems everywhere, nervous about outcomes, and stress is their default state. "What if" is their favorite phrase.'
  },
  {
    name: 'stubborn',
    description: 'Inflexible and refuses to change their mind. Digs heels in on every opinion, won\'t compromise, and "my way or the highway" is their motto. Immovable as a rock.'
  },
  {
    name: 'serious',
    description: 'Solemn and focused on important matters. No time for frivolity, approaches everything with gravitas, and believes fun is a distraction. Life is business, not pleasure.'
  },
  {
    name: 'lazy',
    description: 'Unmotivated and energy-conserving to an art form. Avoids effort whenever possible, masters the art of doing nothing, and believes rest is a lifestyle. "Why do today what can be postponed forever?"'
  },
  {
    name: 'grumpy',
    description: 'Perpetually irritable and quick to complain. Everything annoys them, always finds something wrong, and expresses displeasure freely. The embodiment of "get off my lawn" energy.'
  },
  {
    name: 'aggressive',
    description: 'Confrontational and quick to fight. Challenges others readily, dominates situations, and sees everything as competition. Always ready to throw down.'
  },
  {
    name: 'cynical',
    description: 'Disillusioned and expects the worst from everyone. Believes nothing matters, mocks optimism, and finds futility in everything. Hope is for suckers.'
  },
  {
    name: 'crude',
    description: 'Crude, vulgar, and unapologetically rude - like a foul-mouthed teddy bear. Swears casually, speaks bluntly without filter, and finds humor in inappropriate things. Zero patience for politeness.'
  }
];

/**
 * 检查表是否存在
 */
async function checkTableExists() {
  try {
    const queryStr = `
      query CheckTable {
        fish_personalities(limit: 1) {
          id
        }
      }
    `;
    await query(queryStr);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 插入个性数据
 */
async function insertPersonalities() {
  console.log('📝 开始插入个性数据...');
  
  const mutationStr = `
    mutation InsertPersonalities($personalities: [fish_personalities_insert_input!]!) {
      insert_fish_personalities(
        objects: $personalities,
        on_conflict: {
          constraint: fish_personalities_name_key,
          update_columns: [description]
        }
      ) {
        affected_rows
        returning {
          id
          name
          description
        }
      }
    }
  `;

  try {
    const result = await mutation(mutationStr, { personalities });
    console.log(`✅ 成功插入/更新 ${result.insert_fish_personalities.affected_rows} 条个性数据`);
    return result.insert_fish_personalities.returning;
  } catch (error) {
    console.error('❌ 插入个性数据失败:', error.message);
    throw error;
  }
}

/**
 * 验证数据
 */
async function verifyData() {
  console.log('\n🔍 验证数据...');
  
  const queryStr = `
    query GetAllPersonalities {
      fish_personalities(order_by: { name: asc }) {
        id
        name
        description
        created_at
      }
    }
  `;

  try {
    const result = await query(queryStr);
    console.log(`✅ 共有 ${result.fish_personalities.length} 种个性`);
    
    // 显示个性列表
    console.log('\n个性列表：');
    result.fish_personalities.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name}`);
    });
    
    return result.fish_personalities;
  } catch (error) {
    console.error('❌ 验证数据失败:', error.message);
    throw error;
  }
}

/**
 * 统计使用情况
 */
async function getUsageStats() {
  console.log('\n📊 统计个性使用情况...');
  
  const queryStr = `
    query GetPersonalityStats {
      fish_personalities {
        name
        fishes_aggregate {
          aggregate {
            count
          }
        }
        monologues_aggregate {
          aggregate {
            count
          }
        }
      }
    }
  `;

  try {
    const result = await query(queryStr);
    console.log('\n使用统计：');
    result.fish_personalities.forEach(p => {
      const fishCount = p.fishes_aggregate.aggregate.count;
      const monologueCount = p.monologues_aggregate.aggregate.count;
      if (fishCount > 0 || monologueCount > 0) {
        console.log(`  ${p.name}: ${fishCount} 条鱼, ${monologueCount} 条自语`);
      }
    });
    return result.fish_personalities;
  } catch (error) {
    console.error('⚠️ 统计失败（可能还未建立关系）:', error.message);
    return null;
  }
}

/**
 * 生成前端选择器数据
 */
async function generateFrontendData(personalities) {
  console.log('\n📦 生成前端选择器数据...');
  
  const frontendData = personalities.map(p => ({
    value: p.name,
    label: p.name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' '),
    description: p.description.split('.')[0] // 只取第一句作为简短描述
  }));
  
  const outputPath = path.join(__dirname, '../src/config/personalities.json');
  fs.writeFileSync(outputPath, JSON.stringify(frontendData, null, 2));
  console.log(`✅ 前端数据已保存到: ${outputPath}`);
  
  return frontendData;
}

/**
 * 主函数
 */
async function main() {
  console.log('🐟 开始设置鱼个性系统...\n');
  
  try {
    // 1. 检查表是否存在
    const tableExists = await checkTableExists();
    
    if (!tableExists) {
      console.log('⚠️ fish_personalities 表不存在');
      console.log('请先执行 SQL 文件创建表:');
      console.log('  psql -U your_username -d your_database -f sql/create_personalities_table.sql');
      console.log('\n或者在 Hasura Console 中执行 sql/create_personalities_table.sql 的内容');
      return;
    }
    
    console.log('✅ fish_personalities 表已存在\n');
    
    // 2. 插入个性数据
    const inserted = await insertPersonalities();
    
    // 3. 验证数据
    const allPersonalities = await verifyData();
    
    // 4. 统计使用情况
    await getUsageStats();
    
    // 5. 生成前端数据
    await generateFrontendData(allPersonalities);
    
    console.log('\n✅ 个性系统设置完成！');
    console.log('\n📚 后续步骤：');
    console.log('1. 在 Hasura Console 中建立表关系（参考 docs/temp_docs/fish_personalities_setup.md）');
    console.log('2. 更新前端代码，使用 src/config/personalities.json 作为选择器数据源');
    console.log('3. 为现有的 fish_monologues 添加个性分类');
    
  } catch (error) {
    console.error('\n❌ 设置失败:', error);
    process.exit(1);
  }
}

// 执行
if (require.main === module) {
  main();
}

module.exports = {
  personalities,
  insertPersonalities,
  verifyData,
  getUsageStats
};

