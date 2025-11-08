/**
 * 将下载的测试鱼数据导入到Hasura的fish_test表
 * 
 * 功能：
 * 1. 读取test-fish-data.json文件
 * 2. 批量插入数据到Hasura fish_test表
 * 3. 显示进度和错误处理
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// 配置
const CONFIG = {
  // 输入文件
  inputFile: path.join(__dirname, '../temp/test-fish-data.json'),
  // Hasura配置
  hasuraEndpoint: process.env.HASURA_GRAPHQL_ENDPOINT,
  hasuraAdminSecret: process.env.HASURA_ADMIN_SECRET,
  // 批量插入大小（每次插入多少条）
  batchSize: 10
};

// 验证配置
if (!CONFIG.hasuraEndpoint) {
  console.error('❌ 错误: HASURA_GRAPHQL_ENDPOINT 未设置');
  console.error('请在 .env.local 文件中配置');
  process.exit(1);
}

if (!CONFIG.hasuraAdminSecret) {
  console.error('❌ 错误: HASURA_ADMIN_SECRET 未设置');
  console.error('请在 .env.local 文件中配置');
  process.exit(1);
}

/**
 * 执行GraphQL Mutation
 */
async function executeMutation(mutation, variables = {}) {
  const response = await fetch(CONFIG.hasuraEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': CONFIG.hasuraAdminSecret
    },
    body: JSON.stringify({
      query: mutation,
      variables
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    console.error('GraphQL错误:', JSON.stringify(result.errors, null, 2));
    throw new Error(result.errors[0].message);
  }
  
  return result.data;
}

/**
 * 批量插入鱼数据
 */
async function insertFishBatch(fishArray) {
  const mutation = `
    mutation InsertFishTest($objects: [fish_test_insert_input!]!) {
      insert_fish_test(objects: $objects) {
        affected_rows
        returning {
          id
          artist
          image_url
        }
      }
    }
  `;

  // 转换数据格式，移除metadata字段和original_id
  const objects = fishArray.map(fish => {
    const { metadata, original_id, ...fishData } = fish;
    return fishData;
  });

  const result = await executeMutation(mutation, { objects });
  return result.insert_fish_test;
}

/**
 * 检查fish_test表是否存在
 */
async function checkTableExists() {
  const query = `
    query CheckFishTest {
      fish_test(limit: 1) {
        id
      }
    }
  `;

  try {
    await executeMutation(query);
    return true;
  } catch (error) {
    if (error.message.includes('field "fish_test"') || 
        error.message.includes('table') || 
        error.message.includes('relation')) {
      return false;
    }
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(60));
  console.log('导入测试鱼数据到Hasura fish_test表');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. 检查输入文件
    console.log('步骤 1/5: 检查输入文件...');
    if (!fs.existsSync(CONFIG.inputFile)) {
      throw new Error(`文件不存在: ${CONFIG.inputFile}\n请先运行: node scripts/download-test-fish.js`);
    }
    console.log(`✓ 输入文件: ${CONFIG.inputFile}`);
    console.log('');

    // 2. 读取数据
    console.log('步骤 2/5: 读取JSON数据...');
    const jsonData = fs.readFileSync(CONFIG.inputFile, 'utf-8');
    const fishData = JSON.parse(jsonData);
    console.log(`✓ 读取到 ${fishData.length} 条鱼数据`);
    console.log('');

    // 3. 检查fish_test表是否存在
    console.log('步骤 3/5: 检查fish_test表...');
    console.log(`Hasura端点: ${CONFIG.hasuraEndpoint}`);
    const tableExists = await checkTableExists();
    
    if (!tableExists) {
      console.error('❌ fish_test表不存在！');
      console.error('');
      console.error('请在Hasura Console执行以下SQL创建表：');
      console.error('  文件: scripts/sql/create-fish-test-table.sql');
      console.error('');
      console.error('或在Hasura Console → Data → SQL 粘贴以下命令：');
      console.error('  \\i scripts/sql/create-fish-test-table.sql');
      process.exit(1);
    }
    console.log('✓ fish_test表存在');
    console.log('');

    // 4. 批量插入数据
    console.log(`步骤 4/5: 批量插入数据 (每批${CONFIG.batchSize}条)...`);
    let totalInserted = 0;
    let totalFailed = 0;
    const totalBatches = Math.ceil(fishData.length / CONFIG.batchSize);

    for (let i = 0; i < fishData.length; i += CONFIG.batchSize) {
      const batch = fishData.slice(i, i + CONFIG.batchSize);
      const batchNum = Math.floor(i / CONFIG.batchSize) + 1;
      
      try {
        console.log(`[批次 ${batchNum}/${totalBatches}] 插入 ${batch.length} 条...`);
        const result = await insertFishBatch(batch);
        totalInserted += result.affected_rows;
        console.log(`  ✓ 成功插入 ${result.affected_rows} 条`);
        
        // 显示插入的前3条数据
        if (result.returning.length > 0) {
          console.log(`  示例: ${result.returning[0].artist} - ${result.returning[0].id}`);
        }
        
      } catch (error) {
        totalFailed += batch.length;
        console.error(`  ✗ 批次失败: ${error.message}`);
        console.error(`  跳过该批次，继续处理...`);
      }
      
      console.log('');
    }

    console.log(`步骤 4/5 完成: 成功 ${totalInserted} 条，失败 ${totalFailed} 条`);
    console.log('');

    // 5. 验证导入
    console.log('步骤 5/5: 验证导入结果...');
    const verifyQuery = `
      query VerifyFishTest {
        fish_test_aggregate {
          aggregate {
            count
          }
        }
      }
    `;
    
    const verifyResult = await executeMutation(verifyQuery);
    const totalCount = verifyResult.fish_test_aggregate.aggregate.count;
    console.log(`✓ fish_test表中共有 ${totalCount} 条数据`);
    console.log('');

    // 统计信息
    console.log('='.repeat(60));
    console.log('导入完成统计');
    console.log('='.repeat(60));
    console.log(`输入数据: ${fishData.length} 条`);
    console.log(`成功导入: ${totalInserted} 条`);
    console.log(`失败跳过: ${totalFailed} 条`);
    console.log(`数据库总数: ${totalCount} 条`);
    console.log('');
    console.log('✓ 导入完成！可以在Hasura Console查询fish_test表验证数据');
    console.log('');

    // 示例查询
    console.log('示例GraphQL查询:');
    console.log('');
    console.log('query {');
    console.log('  fish_test(limit: 10, order_by: {created_at: desc}) {');
    console.log('    id');
    console.log('    artist');
    console.log('    image_url');
    console.log('    talent');
    console.log('    level');
    console.log('    upvotes');
    console.log('  }');
    console.log('}');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { main };


























