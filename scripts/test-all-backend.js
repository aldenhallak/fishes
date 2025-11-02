/**
 * 完整后端测试脚本
 * 测试所有后端功能：Hasura, Redis, 所有API端点
 * 
 * 使用方法:
 * node scripts/test-all-backend.js
 */

require('dotenv').config({ path: '.env.local' });

const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    error: '\x1b[31m',   // red
    warning: '\x1b[33m', // yellow
    reset: '\x1b[0m'
  };
  
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function testPass(name) {
  testResults.passed++;
  testResults.tests.push({ name, status: 'PASS' });
  log(`✅ ${name}`, 'success');
}

function testFail(name, error) {
  testResults.failed++;
  testResults.tests.push({ name, status: 'FAIL', error: error.message });
  log(`❌ ${name}: ${error.message}`, 'error');
}

// ===== Test Hasura =====
async function testHasura() {
  log('\n📊 Testing Hasura Connection...', 'info');
  
  try {
    const endpoint = process.env.HASURA_GRAPHQL_ENDPOINT;
    const secret = process.env.HASURA_ADMIN_SECRET;
    
    if (!endpoint || !secret) {
      throw new Error('HASURA环境变量未设置');
    }
    
    const query = `
      query {
        __typename
      }
    `;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': secret
      },
      body: JSON.stringify({ query })
    });
    
    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }
    
    testPass('Hasura连接');
    
    // Test fish table
    const fishQuery = `
      query {
        fish_aggregate {
          aggregate {
            count
          }
        }
      }
    `;
    
    const fishResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': secret
      },
      body: JSON.stringify({ query: fishQuery })
    });
    
    const fishData = await fishResponse.json();
    
    if (fishData.errors) {
      throw new Error(fishData.errors[0].message);
    }
    
    log(`   Fish表记录数: ${fishData.data.fish_aggregate.aggregate.count}`, 'info');
    testPass('Hasura fish表查询');
    
  } catch (error) {
    testFail('Hasura连接', error);
  }
}

// ===== Test Redis =====
async function testRedis() {
  log('\n🔴 Testing Redis Connection...', 'info');
  
  try {
    const Redis = require('ioredis');
    const redisUrl = process.env.UPSTASH_REDIS_URL;
    
    if (!redisUrl) {
      throw new Error('UPSTASH_REDIS_URL未设置');
    }
    
    const redis = new Redis(redisUrl, {
      tls: {},
      maxRetriesPerRequest: 3
    });
    
    await redis.ping();
    testPass('Redis连接');
    
    // Test set/get
    await redis.set('test_key', 'test_value', 'EX', 10);
    const value = await redis.get('test_key');
    
    if (value === 'test_value') {
      testPass('Redis读写');
    } else {
      throw new Error('Redis读写失败');
    }
    
    await redis.del('test_key');
    await redis.quit();
    
  } catch (error) {
    testFail('Redis连接', error);
  }
}

// ===== Test APIs =====
async function testAPIs() {
  log('\n🌐 Testing API Endpoints...', 'info');
  
  const baseUrl = 'http://localhost:3000'; // 或你的Vercel URL
  
  // Test 1: Fish List API
  try {
    const response = await fetch(`${baseUrl}/api/fish/list?sort=recent&limit=5`);
    const data = await response.json();
    
    if (data.success && Array.isArray(data.fish)) {
      testPass('GET /api/fish/list');
      log(`   返回了 ${data.fish.length} 条鱼`, 'info');
    } else {
      throw new Error('返回格式不正确');
    }
  } catch (error) {
    testFail('GET /api/fish/list', error);
  }
  
  // Test 2: Battle Config (通过Hasura)
  try {
    const query = `
      query {
        battle_config_by_pk(id: 1) {
          level_weight
          talent_weight
          upvote_weight
        }
      }
    `;
    
    const response = await fetch(process.env.HASURA_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET
      },
      body: JSON.stringify({ query })
    });
    
    const data = await response.json();
    
    if (data.data && data.data.battle_config_by_pk) {
      testPass('Battle Config查询');
      const config = data.data.battle_config_by_pk;
      log(`   等级权重: ${config.level_weight}, 天赋权重: ${config.talent_weight}, 点赞权重: ${config.upvote_weight}`, 'info');
    } else {
      throw new Error('配置不存在');
    }
  } catch (error) {
    testFail('Battle Config查询', error);
  }
  
  // Note: 其他API需要认证，暂时跳过
  log('   (其他API需要认证或实际数据，暂时跳过)', 'warning');
}

// ===== Main Test Runner =====
async function runAllTests() {
  log('╔════════════════════════════════════════╗', 'info');
  log('║   Fish Art Battle - 后端测试套件      ║', 'info');
  log('╚════════════════════════════════════════╝', 'info');
  
  await testHasura();
  await testRedis();
  await testAPIs();
  
  // Summary
  log('\n' + '='.repeat(50), 'info');
  log('测试总结', 'info');
  log('='.repeat(50), 'info');
  
  log(`总测试数: ${testResults.passed + testResults.failed}`, 'info');
  log(`通过: ${testResults.passed}`, 'success');
  log(`失败: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
  
  if (testResults.failed > 0) {
    log('\n失败的测试:', 'error');
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => {
        log(`  - ${t.name}: ${t.error}`, 'error');
      });
  }
  
  log('\n' + '='.repeat(50) + '\n', 'info');
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 测试运行失败: ${error.message}`, 'error');
  process.exit(1);
});

