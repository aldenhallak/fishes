/**
 * 从fish_test表复制20条鱼到fish表
 */

require('dotenv').config({ path: '.env.local' });
const path = require('path');

const HASURA_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

async function executeMutation(query, variables = {}) {
  const response = await fetch(HASURA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET
    },
    body: JSON.stringify({ query, variables })
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

async function main() {
  console.log('='.repeat(60));
  console.log('从fish_test表复制鱼到fish表');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. 从fish_test表获取20条鱼
    console.log('步骤 1: 从fish_test表获取鱼...');
    const getTestFishQuery = `
      query GetTestFish {
        fish_test(limit: 20, order_by: {created_at: desc}) {
          user_id
          artist
          image_url
          talent
          level
          experience
          health
          max_health
          upvotes
          battle_power
          is_alive
          is_approved
          position_row
          total_wins
          total_losses
        }
      }
    `;

    const testFishResult = await executeMutation(getTestFishQuery);
    const testFish = testFishResult.fish_test || [];
    
    console.log(`✓ 获取到 ${testFish.length} 条测试鱼`);
    console.log('');

    if (testFish.length === 0) {
      console.log('❌ fish_test表中没有鱼数据');
      console.log('请先运行: node scripts/download-test-fish.js');
      console.log('然后运行: node scripts/import-test-fish.js');
      return;
    }

    // 2. 确保所有user_id对应的用户存在
    console.log('步骤 2: 确保用户存在...');
    const uniqueUserIds = [...new Set(testFish.map(f => f.user_id))];
    console.log(`  需要创建 ${uniqueUserIds.length} 个用户`);
    
    for (const userId of uniqueUserIds) {
      const createUserMutation = `
        mutation CreateUser($userId: String!) {
          insert_users_one(
            object: {
              id: $userId,
              email: "${userId}@test.local",
              display_name: "测试用户",
              is_banned: false
            },
            on_conflict: {
              constraint: users_pkey,
              update_columns: []
            }
          ) {
            id
          }
        }
      `;
      
      try {
        await executeMutation(createUserMutation, { userId });
      } catch (error) {
        // 用户可能已存在，忽略错误
      }
    }
    console.log('✓ 用户检查完成');
    console.log('');
    
    // 3. 插入到fish表
    console.log('步骤 3: 插入鱼到fish表...');
    
    const insertFishMutation = `
      mutation InsertFish($objects: [fish_insert_input!]!) {
        insert_fish(objects: $objects) {
          affected_rows
          returning {
            id
            artist
            user_id
          }
        }
      }
    `;

    const result = await executeMutation(insertFishMutation, {
      objects: testFish
    });

    console.log(`✓ 成功插入 ${result.insert_fish.affected_rows} 条鱼`);
    console.log('');

    // 4. 显示部分插入的鱼
    console.log('插入的鱼示例:');
    result.insert_fish.returning.slice(0, 5).forEach((fish, i) => {
      console.log(`  ${i + 1}. ${fish.artist} (${fish.id})`);
    });
    console.log('');

    console.log('='.repeat(60));
    console.log('✅ 完成！现在fish表中有更多鱼可以战斗了');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('');
    console.error('❌ 错误:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(() => process.exit(0));
}

module.exports = { main };

