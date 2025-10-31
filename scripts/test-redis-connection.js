/**
 * 测试Redis连接
 * 使用方法: node scripts/test-redis-connection.js
 */

require('dotenv').config();
const redis = require('../lib/redis');

async function testConnection() {
  console.log('🔍 测试Redis连接...\n');
  
  console.log('配置信息:');
  console.log(`  URL: ${process.env.UPSTASH_REDIS_URL ? '已设置' : '未设置'}\n`);
  
  // 1. 基础连接测试
  console.log('1️⃣ 基础连接测试...');
  const connected = await redis.testConnection();
  
  if (!connected) {
    console.error('\n❌ 连接失败，请检查配置');
    console.log('\n提示：');
    console.log('  1. 注册 Upstash账号: https://upstash.com/');
    console.log('  2. 创建Redis数据库');
    console.log('  3. 复制Redis URL到 .env 文件');
    process.exit(1);
  }
  
  // 2. 写入测试
  try {
    console.log('\n2️⃣ 写入测试...');
    const client = redis.getRedisClient();
    await client.set('test:key', 'test:value', 'EX', 60);
    console.log('✅ 写入成功');
    
    // 3. 读取测试
    console.log('\n3️⃣ 读取测试...');
    const value = await client.get('test:key');
    if (value === 'test:value') {
      console.log('✅ 读取成功');
    } else {
      console.log('⚠️ 读取值不匹配');
    }
    
    // 4. 删除测试
    console.log('\n4️⃣ 删除测试...');
    await client.del('test:key');
    console.log('✅ 删除成功');
    
    // 5. 并发控制测试
    console.log('\n5️⃣ 并发控制测试...');
    const result = await redis.enterBattleMode('test_user_1', 'test_fish_1', 100);
    console.log('✅ 进入战斗模式:', result);
    
    await redis.leaveBattleMode('test_user_1');
    console.log('✅ 离开战斗模式');
    
    // 6. 统计信息
    console.log('\n6️⃣ 统计信息...');
    const stats = await redis.getStats();
    console.log('  在线用户:', stats.activeUsers);
    console.log('  排队人数:', stats.queueLength);
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
  
  console.log('\n✅ 所有测试通过！');
  process.exit(0);
}

testConnection().catch(err => {
  console.error('\n❌ 测试失败:', err.message);
  process.exit(1);
});

