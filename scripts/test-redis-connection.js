/**
 * 测试Redis连接
 * 使用方法: node scripts/test-redis-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const redis = require('../lib/redis');

async function testRedis() {
  console.log('🔍 测试Redis连接...\n');
  
  console.log('配置信息:');
  console.log(`  URL: ${process.env.UPSTASH_REDIS_URL ? '已设置' : '未设置'}\n`);
  
  // 1. 基础连接测试
  console.log('1️⃣ 基础连接测试...');
  const connected = await redis.testConnection();
  
  if (!connected) {
    console.error('\n❌ 连接失败，请检查UPSTASH_REDIS_URL配置');
    process.exit(1);
  }
  
  // 2. 写入测试
  try {
    console.log('\n2️⃣ 写入测试...');
    await redis.cacheFish('test-fish-id', {
      id: 'test-fish-id',
      level: 5,
      talent: 75,
      health: 10
    });
    console.log('✅ 写入成功');
    
    // 3. 读取测试
    console.log('\n3️⃣ 读取测试...');
    const fishData = await redis.getCachedFish('test-fish-id');
    if (fishData) {
      console.log('✅ 读取成功:', fishData);
    } else {
      console.log('⚠️ 读取失败');
    }
    
    // 4. 删除测试
    console.log('\n4️⃣ 删除测试...');
    await redis.invalidateFishCache('test-fish-id');
    const deleted = await redis.getCachedFish('test-fish-id');
    if (!deleted) {
      console.log('✅ 删除成功');
    } else {
      console.log('⚠️ 删除失败');
    }
    
    // 5. 队列测试
    console.log('\n5️⃣ 队列测试...');
    await redis.addToQueue('test-user-1');
    await redis.addToQueue('test-user-2');
    const queueLength = await redis.getQueueLength();
    console.log(`✅ 队列测试成功，当前队列长度: ${queueLength}`);
    
    // 清理测试数据
    await redis.removeFromQueue('test-user-1');
    await redis.removeFromQueue('test-user-2');
    
    // 6. 速率限制测试
    console.log('\n6️⃣ 速率限制测试...');
    const allowed1 = await redis.checkRateLimit('test-user', 5, 60);
    console.log(`  第1次请求: ${allowed1 ? '✅ 允许' : '❌ 限制'}`);
    
    // 快速发送5次请求
    for (let i = 2; i <= 6; i++) {
      const allowed = await redis.checkRateLimit('test-user', 5, 60);
      console.log(`  第${i}次请求: ${allowed ? '✅ 允许' : '❌ 限制'}`);
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  }
  
  // 7. 性能测试
  console.log('\n7️⃣ 性能测试（100次写入）...');
  const startTime = Date.now();
  
  for (let i = 0; i < 100; i++) {
    await redis.cacheFish(`perf-test-${i}`, { id: `perf-test-${i}`, data: 'test' }, 60);
  }
  
  const endTime = Date.now();
  const avgTime = (endTime - startTime) / 100;
  console.log(`✅ 平均响应时间: ${avgTime.toFixed(2)}ms`);
  
  if (avgTime < 50) {
    console.log('   性能: 优秀 ⭐⭐⭐⭐⭐');
  } else if (avgTime < 100) {
    console.log('   性能: 良好 ⭐⭐⭐⭐');
  } else if (avgTime < 200) {
    console.log('   性能: 一般 ⭐⭐⭐');
  } else {
    console.log('   性能: 较慢 ⭐⭐');
  }
  
  // 关闭连接
  await redis.closeConnection();
  
  console.log('\n✅ 所有测试完成！');
}

testRedis().catch(err => {
  console.error('\n❌ 测试失败:', err.message);
  process.exit(1);
});
