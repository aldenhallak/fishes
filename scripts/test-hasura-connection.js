/**
 * 测试Hasura连接
 * 使用方法: node scripts/test-hasura-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const hasura = require('../lib/hasura');

async function testConnection() {
  console.log('🔍 测试Hasura连接...\n');
  
  console.log('配置信息:');
  console.log(`  端点: ${process.env.HASURA_GRAPHQL_ENDPOINT || '未设置'}`);
  console.log(`  密钥: ${process.env.HASURA_ADMIN_SECRET ? '已设置' : '未设置'}\n`);
  
  // 1. 基础连接测试
  console.log('1️⃣ 基础连接测试...');
  const connected = await hasura.testConnection();
  
  if (!connected) {
    console.error('\n❌ 连接失败，请检查配置');
    process.exit(1);
  }
  
  // 2. 查询测试（fish表）
  try {
    console.log('\n2️⃣ 查询fish表...');
    const fish = await hasura.getFish({}, 1);
    console.log(`✅ 成功，找到 ${fish.length} 条鱼`);
    if (fish.length > 0) {
      console.log('   示例数据:', {
        id: fish[0].id,
        artist: fish[0].artist,
        level: fish[0].level || '无'
      });
    }
  } catch (error) {
    console.log(`⚠️ fish表查询失败: ${error.message}`);
    console.log('   提示: 可能需要先执行数据库迁移');
  }
  
  // 3. 查询battle_config表
  try {
    console.log('\n3️⃣ 查询battle_config表...');
    const config = await hasura.getBattleConfig();
    if (config) {
      console.log('✅ 成功，配置数据:', {
        level_weight: config.level_weight,
        talent_weight: config.talent_weight,
        max_battle_users: config.max_battle_users
      });
    } else {
      console.log('⚠️ 配置表为空，需要初始化');
    }
  } catch (error) {
    console.log(`⚠️ battle_config表查询失败: ${error.message}`);
    console.log('   提示: 需要先执行数据库迁移');
  }
  
  console.log('\n✅ 测试完成！');
}

testConnection().catch(err => {
  console.error('\n❌ 测试失败:', err.message);
  process.exit(1);
});

