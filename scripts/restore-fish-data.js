/**
 * 恢复鱼数据到正式的fish表
 * 
 * 功能：
 * 1. 读取test-fish-data.json文件
 * 2. 批量插入数据到Hasura fish表
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
 * 批量插入鱼数据到正式的fish表
 */
async function insertFishBatch(fishArray) {
  const mutation = `
    mutation InsertFish($objects: [fish_insert_input!]!) {
      insert_fish(objects: $objects) {
        affected_rows
        returning {
          id
          artist
          image_url
          user_id
        }
      }
    }
  `;

  // 转换数据格式，只保留fish表支持的字段
  const objects = fishArray.map(fish => {
    return {
      // 基本信息字段
      artist: fish.artist || 'Anonymous',
      image_url: fish.image_url,
      user_id: fish.user_id,
      
      // 可选字段（如果fish表支持）
      upvotes: fish.upvotes || 0,
      is_approved: fish.is_approved !== undefined ? fish.is_approved : true,
      personality: fish.personality || 'cheerful',
      fish_name: fish.fish_name || `Fish by ${fish.artist || 'Anonymous'}`,
      report_count: fish.report_count || 0,
      reported: fish.reported || false,
      chat_frequency: fish.chat_frequency || 1,
      
      // 如果有created_at，保留它
      ...(fish.created_at && { created_at: fish.created_at })
    };
  });

  const result = await executeMutation(mutation, { objects });
  return result.insert_fish;
}

/**
 * 检查fish表是否存在
 */
async function checkTableExists() {
  const query = `
    query CheckFish {
      fish(limit: 1) {
        id
      }
    }
  `;

  try {
    await executeMutation(query);
    return true;
  } catch (error) {
    if (error.message.includes('field "fish"') || 
        error.message.includes('table') || 
        error.message.includes('relation')) {
      return false;
    }
    throw error;
  }
}

/**
 * 获取当前fish表中的数据数量
 */
async function getCurrentFishCount() {
  const query = `
    query GetFishCount {
      fish_aggregate {
        aggregate {
          count
        }
      }
    }
  `;
  
  const result = await executeMutation(query);
  return result.fish_aggregate.aggregate.count;
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(60));
  console.log('恢复鱼数据到正式的fish表');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. 检查输入文件
    console.log('步骤 1/6: 检查输入文件...');
    if (!fs.existsSync(CONFIG.inputFile)) {
      throw new Error(`文件不存在: ${CONFIG.inputFile}\n请确保数据文件存在`);
    }
    console.log(`✓ 输入文件: ${CONFIG.inputFile}`);
    console.log('');

    // 2. 读取数据
    console.log('步骤 2/6: 读取JSON数据...');
    const jsonData = fs.readFileSync(CONFIG.inputFile, 'utf-8');
    const fishData = JSON.parse(jsonData);
    console.log(`✓ 读取到 ${fishData.length} 条鱼数据`);
    console.log('');

    // 3. 检查fish表是否存在
    console.log('步骤 3/6: 检查fish表...');
    console.log(`Hasura端点: ${CONFIG.hasuraEndpoint}`);
    const tableExists = await checkTableExists();
    
    if (!tableExists) {
      console.error('❌ fish表不存在！');
      console.error('请确保Hasura中有fish表');
      process.exit(1);
    }
    console.log('✓ fish表存在');
    console.log('');

    // 4. 获取当前数据数量
    console.log('步骤 4/6: 检查当前数据...');
    const currentCount = await getCurrentFishCount();
    console.log(`✓ 当前fish表中有 ${currentCount} 条数据`);
    console.log('');

    // 5. 批量插入数据
    console.log(`步骤 5/6: 批量插入数据 (每批${CONFIG.batchSize}条)...`);
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

    console.log(`步骤 5/6 完成: 成功 ${totalInserted} 条，失败 ${totalFailed} 条`);
    console.log('');

    // 6. 验证导入
    console.log('步骤 6/6: 验证导入结果...');
    const finalCount = await getCurrentFishCount();
    console.log(`✓ fish表中现在共有 ${finalCount} 条数据`);
    console.log(`✓ 本次新增 ${finalCount - currentCount} 条数据`);
    console.log('');

    // 统计信息
    console.log('='.repeat(60));
    console.log('恢复完成统计');
    console.log('='.repeat(60));
    console.log(`输入数据: ${fishData.length} 条`);
    console.log(`成功导入: ${totalInserted} 条`);
    console.log(`失败跳过: ${totalFailed} 条`);
    console.log(`导入前数量: ${currentCount} 条`);
    console.log(`导入后数量: ${finalCount} 条`);
    console.log(`实际新增: ${finalCount - currentCount} 条`);
    console.log('');
    console.log('✓ 鱼数据恢复完成！');
    console.log('');

    // 示例查询
    console.log('验证查询:');
    console.log('');
    console.log('query {');
    console.log('  fish(limit: 10, order_by: {created_at: desc}) {');
    console.log('    id');
    console.log('    artist');
    console.log('    image_url');
    console.log('    talent');
    console.log('    level');
    console.log('    upvotes');
    console.log('    user_id');
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

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main };
