require('dotenv').config({ path: '.env.local' });
const redis = require('./lib/redis');

async function testRedis() {
  console.log('Testing Redis connection...');
  
  const client = redis.getRedisClient();
  if (!client) {
    console.log('❌ Redis client not available');
    console.log('REDIS_URL:', process.env.REDIS_URL || 'not set');
    return;
  }
  
  console.log('✅ Redis client exists');
  
  try {
    // Test a simple operation
    await redis.addBattleUser('test-user', 'test-fish');
    console.log('✅ addBattleUser works');
    
    const count = await redis.getBattleUserCount();
    console.log(`✅ getBattleUserCount: ${count}`);
    
    await redis.removeBattleUser('test-user');
    console.log('✅ removeBattleUser works');
    
    console.log('\n✅ All Redis operations working!');
  } catch (error) {
    console.error('❌ Redis error:', error.message);
  }
}

testRedis().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

