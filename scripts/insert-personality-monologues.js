/**
 * 插入个性自语数据到数据库
 * 总共 420 条自语：
 * - 20 种个性 × 20 条 = 400 条
 * - 通用自语 × 20 条 = 20 条
 */

// 加载环境变量
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const { mutation, query } = require('../lib/hasura.js');
const path = require('path');

// 导入所有自语数据
const monologuesPart1 = require('./data/monologues-part1.js');
const monologuesPart2 = require('./data/monologues-part2.js');
const monologuesPart3 = require('./data/monologues-part3.js');
const monologuesPart4 = require('./data/monologues-part4.js');
const monologuesGeneric = require('./data/monologues-generic.js');

// 合并所有自语
const allMonologues = [
  ...monologuesPart1,
  ...monologuesPart2,
  ...monologuesPart3,
  ...monologuesPart4,
  ...monologuesGeneric
];

console.log(`📊 总共 ${allMonologues.length} 条自语待插入`);

/**
 * 检查表是否存在
 */
async function checkTableExists() {
  try {
    const queryStr = `
      query CheckTable {
        fish_monologues(limit: 1) {
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
 * 获取当前自语统计
 */
async function getMonologueStats() {
  console.log('\n📊 统计当前自语数据...');
  
  try {
    const queryStr = `
      query GetMonologueStats {
        total: fish_monologues_aggregate {
          aggregate {
            count
          }
        }
        by_personality: fish_monologues_aggregate(order_by: {personality: asc}) {
          nodes {
            personality
          }
          aggregate {
            count
          }
        }
      }
    `;

    const result = await query(queryStr);
    const total = result.total.aggregate.count;
    
    console.log(`✅ 当前共有 ${total} 条自语`);
    
    // 按个性统计
    const personalityCounts = {};
    result.by_personality.nodes.forEach(node => {
      const p = node.personality || 'generic';
      personalityCounts[p] = (personalityCounts[p] || 0) + 1;
    });
    
    console.log('\n按个性分布：');
    Object.entries(personalityCounts).sort().forEach(([personality, count]) => {
      console.log(`  ${personality}: ${count} 条`);
    });
    
    return total;
  } catch (error) {
    console.error('⚠️  统计失败:', error.message);
    return 0;
  }
}

/**
 * 批量插入自语（每次100条）
 */
async function insertMonologuesBatch(monologues, batchSize = 100) {
  const total = monologues.length;
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  console.log(`\n📝 开始插入 ${total} 条自语（每批 ${batchSize} 条）...`);

  for (let i = 0; i < total; i += batchSize) {
    const batch = monologues.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(total / batchSize);

    try {
      console.log(`\n处理第 ${batchNum}/${totalBatches} 批 (${batch.length} 条)...`);

      const mutationStr = `
        mutation InsertMonologues($monologues: [fish_monologues_insert_input!]!) {
          insert_fish_monologues(objects: $monologues) {
            affected_rows
            returning {
              id
              content
              personality
            }
          }
        }
      `;

      const result = await mutation(mutationStr, { monologues: batch });
      const affected = result.insert_fish_monologues.affected_rows;
      
      inserted += affected;
      console.log(`✅ 成功插入 ${affected} 条`);

    } catch (error) {
      errors += batch.length;
      console.error(`❌ 第 ${batchNum} 批插入失败:`, error.message);
      
      // 如果是重复数据错误，尝试跳过
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        console.log('⚠️  可能是数据已存在，继续下一批...');
      } else {
        throw error;
      }
    }
  }

  return { inserted, updated, errors, total };
}

/**
 * 主函数
 */
async function main() {
  console.log('🐟 开始插入个性自语数据...\n');

  try {
    // 1. 检查表是否存在
    const tableExists = await checkTableExists();
    
    if (!tableExists) {
      console.log('❌ fish_monologues 表不存在');
      console.log('请先执行 SQL 文件创建表:');
      console.log('  psql -U your_username -d your_database -f sql/create_personalities_table.sql');
      return;
    }

    console.log('✅ fish_monologues 表已存在\n');

    // 2. 查看当前统计
    await getMonologueStats();

    // 3. 确认是否继续
    console.log(`\n即将插入 ${allMonologues.length} 条新自语`);
    console.log('包括：');
    console.log('  - 20种个性 × 20条 = 400条个性化自语');
    console.log('  - 通用自语 × 20条 = 20条\n');

    // 4. 插入数据
    const result = await insertMonologuesBatch(allMonologues);

    // 5. 显示结果
    console.log('\n' + '='.repeat(50));
    console.log('📊 插入结果统计：');
    console.log('='.repeat(50));
    console.log(`总计尝试: ${result.total} 条`);
    console.log(`成功插入: ${result.inserted} 条`);
    console.log(`更新数据: ${result.updated} 条`);
    console.log(`失败/跳过: ${result.errors} 条`);
    console.log('='.repeat(50));

    // 6. 最终统计
    await getMonologueStats();

    console.log('\n✅ 自语数据插入完成！');
    console.log('\n📚 后续步骤：');
    console.log('1. 在 Hasura Console 中验证数据');
    console.log('2. 测试 GraphQL 查询按个性获取自语');
    console.log('3. 前端可以随机选择自语展示');

  } catch (error) {
    console.error('\n❌ 插入失败:', error);
    console.error('错误详情:', error.message);
    process.exit(1);
  }
}

// 执行
if (require.main === module) {
  main();
}

module.exports = {
  allMonologues,
  insertMonologuesBatch,
  getMonologueStats
};

