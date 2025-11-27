/**
 * API端点测试脚本
 * 测试所有后端API是否正常工作
 * 
 * 使用方法:
 * node scripts/test-api-endpoints.js
 */

require('dotenv').config({ path: '.env.local' });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// 测试结果统计
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, message = '') {
  results.total++;
  if (status === 'passed') {
    results.passed++;
    log(`✅ ${name}`, 'green');
  } else if (status === 'failed') {
    results.failed++;
    log(`❌ ${name}: ${message}`, 'red');
  } else if (status === 'skipped') {
    results.skipped++;
    log(`⏭️  ${name}: ${message}`, 'yellow');
  }
}

// 测试函数
async function testEndpoint(name, url, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body
    });
    
    const data = await response.json();
    
    if (response.ok || options.expectStatus === response.status) {
      logTest(name, 'passed');
      return { success: true, data };
    } else {
      logTest(name, 'failed', `Status ${response.status}: ${data.error || data.message}`);
      return { success: false, data };
    }
  } catch (error) {
    logTest(name, 'failed', error.message);
    return { success: false, error: error.message };
  }
}

// 主测试函数
async function runTests() {
  log('\n🧪 开始测试Fish Art API端点\n', 'cyan');
  log('='.repeat(60), 'cyan');
  
  // ==================== 基础功能测试 ====================
  log('\n📋 基础功能 API', 'blue');
  log('-'.repeat(60));
  
  // 测试鱼列表API
  await testEndpoint(
    '获取鱼列表 (recent)',
    '/api/fish/list?orderBy=recent&limit=5'
  );
  
  await testEndpoint(
    '获取鱼列表 (hot)',
    '/api/fish/list?orderBy=hot&limit=5'
  );
  
  await testEndpoint(
    '获取鱼列表 (top)',
    '/api/fish/list?orderBy=top&limit=5'
  );
  
  // 测试图片上传API (需要认证，这里测试404即可)
  await testEndpoint(
    '图片上传端点存在',
    '/api/fish-api?action=upload',
    { 
      method: 'POST',
      expectStatus: 400 // 没有文件会返回400
    }
  );
  
  // 测试提交鱼API (需要认证和数据)
  await testEndpoint(
    '提交鱼端点存在',
    '/api/fish/submit',
    { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      expectStatus: 400 // 缺少数据会返回400
    }
  );
  
  // 测试投票API
  await testEndpoint(
    '投票端点存在',
    '/api/vote/vote',
    { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      expectStatus: 400 // 缺少数据会返回400
    }
  );
  
  // 测试举报API
  await testEndpoint(
    '举报端点存在',
    '/api/report/submit',
    { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      expectStatus: 400 // 缺少数据会返回400
    }
  );
  
  // ==================== 战斗系统测试 ====================
  log('\n⚔️  战斗系统 API', 'blue');
  log('-'.repeat(60));
  
  await testEndpoint(
    '进入战斗模式端点存在',
    '/api/battle/enter-mode',
    { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      expectStatus: 400
    }
  );
  
  await testEndpoint(
    '离开战斗模式端点存在',
    '/api/battle/leave-mode',
    { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      expectStatus: 400
    }
  );
  
  await testEndpoint(
    '心跳端点存在',
    '/api/battle/heartbeat',
    { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      expectStatus: 400
    }
  );
  
  await testEndpoint(
    '触发战斗端点存在',
    '/api/battle/trigger',
    { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      expectStatus: 400
    }
  );
  
  await testEndpoint(
    '队列状态端点存在',
    '/api/battle/queue-status',
    { 
      method: 'GET'
    }
  );
  
  // ==================== 经济系统测试 ====================
  log('\n💰 经济系统 API', 'blue');
  log('-'.repeat(60));
  
  await testEndpoint(
    '余额查询端点存在',
    '/api/economy/balance',
    { 
      method: 'GET'
    }
  );
  
  await testEndpoint(
    '每日奖励端点存在',
    '/api/economy/daily-bonus',
    { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      expectStatus: 400
    }
  );
  
  await testEndpoint(
    '喂食端点存在',
    '/api/economy/feed',
    { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      expectStatus: 400
    }
  );
  
  await testEndpoint(
    '复活端点存在',
    '/api/economy/revive',
    { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      expectStatus: 400
    }
  );
  
  // ==================== 测试结果 ====================
  log('\n' + '='.repeat(60), 'cyan');
  log('\n📊 测试结果统计\n', 'cyan');
  log(`总计: ${results.total} 个测试`);
  log(`✅ 通过: ${results.passed}`, 'green');
  log(`❌ 失败: ${results.failed}`, 'red');
  log(`⏭️  跳过: ${results.skipped}`, 'yellow');
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  log(`\n成功率: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
  
  if (results.failed === 0) {
    log('\n🎉 所有测试通过！', 'green');
  } else {
    log(`\n⚠️  有 ${results.failed} 个测试失败，请检查配置`, 'yellow');
  }
  
  log('\n' + '='.repeat(60), 'cyan');
  
  // 返回退出码
  process.exit(results.failed > 0 ? 1 : 0);
}

// 环境检查
function checkEnvironment() {
  log('\n🔍 检查环境配置\n', 'cyan');
  
  const required = [
    'HASURA_GRAPHQL_ENDPOINT',
    'HASURA_ADMIN_SECRET',
    'QINIU_ACCESS_KEY',
    'QINIU_SECRET_KEY',
    'QINIU_BUCKET'
  ];
  
  const missing = [];
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
      log(`❌ 缺少环境变量: ${key}`, 'red');
    } else {
      log(`✅ ${key}`, 'green');
    }
  }
  
  if (missing.length > 0) {
    log('\n⚠️  请配置缺失的环境变量后再运行测试', 'yellow');
    log('参考 env.local.example 文件\n', 'yellow');
    process.exit(1);
  }
  
  log('\n✅ 环境配置检查通过\n', 'green');
}

// 主程序
async function main() {
  console.clear();
  log('╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║        Fish Art API 端点测试                           ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  // 检查环境
  checkEnvironment();
  
  // 运行测试
  await runTests();
}

// 运行
main().catch(error => {
  log(`\n❌ 测试过程出错: ${error.message}`, 'red');
  process.exit(1);
});

