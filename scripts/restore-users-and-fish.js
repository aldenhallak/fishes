/**
 * 恢复用户和鱼数据
 * 
 * 功能：
 * 1. 从鱼数据中提取用户信息
 * 2. 先创建用户
 * 3. 再创建鱼
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// 配置
const CONFIG = {
  inputFile: path.join(__dirname, '../temp/test-fish-data.json'),
  hasuraEndpoint: process.env.HASURA_GRAPHQL_ENDPOINT,
  hasuraAdminSecret: process.env.HASURA_ADMIN_SECRET,
  batchSize: 10
};

// 验证配置
if (!CONFIG.hasuraEndpoint || !CONFIG.hasuraAdminSecret) {
  console.error('❌ 错误: 请在 .env.local 文件中配置 Hasura 信息');
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
 * 从鱼数据中提取唯一用户
 */
function extractUniqueUsers(fishData) {
  const userMap = new Map();
  
  fishData.forEach(fish => {
    if (fish.user_id && !userMap.has(fish.user_id)) {
      userMap.set(fish.user_id, {
        id: fish.user_id,
        email: `${fish.user_id}@test.com`,
        nick_name: fish.artist || 'Anonymous',
        created_at: fish.created_at || new Date().toISOString()
      });
    }
  });
  
  return Array.from(userMap.values());
}

/**
 * 批量插入用户
 */
async function insertUsersBatch(usersArray) {
  const mutation = `
    mutation InsertUsers($objects: [users_insert_input!]!) {
      insert_users(objects: $objects, on_conflict: {constraint: users_pkey, update_columns: []}) {
        affected_rows
        returning {
          id
          email
          nick_name
        }
      }
    }
  `;

  const result = await executeMutation(mutation, { objects: usersArray });
  return result.insert_users;
}

/**
 * 批量插入鱼数据
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
      artist: fish.artist || 'Anonymous',
      image_url: fish.image_url,
      user_id: fish.user_id,
      upvotes: fish.upvotes || 0,
      is_approved: fish.is_approved !== undefined ? fish.is_approved : true,
      personality: fish.personality || 'cheerful',
      fish_name: fish.fish_name || `Fish by ${fish.artist || 'Anonymous'}`,
      report_count: fish.report_count || 0,
      reported: fish.reported || false,
      chat_frequency: fish.chat_frequency || 1,
      ...(fish.created_at && { created_at: fish.created_at })
    };
  });

  const result = await executeMutation(mutation, { objects });
  return result.insert_fish;
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(60));
  console.log('恢复用户和鱼数据');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. 读取数据
    console.log('步骤 1/4: 读取鱼数据...');
    if (!fs.existsSync(CONFIG.inputFile)) {
      throw new Error(`文件不存在: ${CONFIG.inputFile}`);
    }
    
    const jsonData = fs.readFileSync(CONFIG.inputFile, 'utf-8');
    const fishData = JSON.parse(jsonData);
    console.log(`✓ 读取到 ${fishData.length} 条鱼数据`);
    console.log('');

    // 2. 提取用户数据
    console.log('步骤 2/4: 提取用户数据...');
    const users = extractUniqueUsers(fishData);
    console.log(`✓ 提取到 ${users.length} 个唯一用户`);
    console.log('');

    // 3. 批量插入用户
    console.log('步骤 3/4: 批量插入用户...');
    let totalUsersInserted = 0;
    const userBatches = Math.ceil(users.length / CONFIG.batchSize);

    for (let i = 0; i < users.length; i += CONFIG.batchSize) {
      const batch = users.slice(i, i + CONFIG.batchSize);
      const batchNum = Math.floor(i / CONFIG.batchSize) + 1;
      
      try {
        console.log(`[用户批次 ${batchNum}/${userBatches}] 插入 ${batch.length} 个用户...`);
        const result = await insertUsersBatch(batch);
        totalUsersInserted += result.affected_rows;
        console.log(`  ✓ 成功插入 ${result.affected_rows} 个用户`);
      } catch (error) {
        console.error(`  ✗ 用户批次失败: ${error.message}`);
      }
    }
    console.log(`✓ 用户插入完成: ${totalUsersInserted} 个`);
    console.log('');

    // 4. 批量插入鱼数据
    console.log('步骤 4/4: 批量插入鱼数据...');
    let totalFishInserted = 0;
    let totalFishFailed = 0;
    const fishBatches = Math.ceil(fishData.length / CONFIG.batchSize);

    for (let i = 0; i < fishData.length; i += CONFIG.batchSize) {
      const batch = fishData.slice(i, i + CONFIG.batchSize);
      const batchNum = Math.floor(i / CONFIG.batchSize) + 1;
      
      try {
        console.log(`[鱼批次 ${batchNum}/${fishBatches}] 插入 ${batch.length} 条鱼...`);
        const result = await insertFishBatch(batch);
        totalFishInserted += result.affected_rows;
        console.log(`  ✓ 成功插入 ${result.affected_rows} 条鱼`);
        
        if (result.returning.length > 0) {
          console.log(`  示例: ${result.returning[0].artist} - ${result.returning[0].id}`);
        }
      } catch (error) {
        totalFishFailed += batch.length;
        console.error(`  ✗ 鱼批次失败: ${error.message}`);
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('恢复完成统计');
    console.log('='.repeat(60));
    console.log(`用户数据: ${users.length} 个，成功插入: ${totalUsersInserted} 个`);
    console.log(`鱼数据: ${fishData.length} 条，成功插入: ${totalFishInserted} 条，失败: ${totalFishFailed} 条`);
    console.log('');
    console.log('✓ 数据恢复完成！');

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
