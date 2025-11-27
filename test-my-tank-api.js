/**
 * 测试 /api/fish/my-tank API
 */

require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

async function testMyTankAPI() {
  console.log('🧪 开始测试 /api/fish/my-tank API\n');
  
  // 检查环境变量
  console.log('📋 环境变量检查:');
  console.log('  SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ 已配置' : '❌ 未配置');
  console.log('  SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已配置' : '❌ 未配置');
  console.log('  HASURA_GRAPHQL_ENDPOINT:', process.env.HASURA_GRAPHQL_ENDPOINT ? '✅ 已配置' : '❌ 未配置');
  console.log('  HASURA_ADMIN_SECRET:', process.env.HASURA_ADMIN_SECRET ? '✅ 已配置' : '❌ 未配置');
  console.log('');
  
  // 尝试从 localStorage 获取 token（如果可能）
  // 或者需要用户提供 token
  const token = process.argv[2];
  
  if (!token) {
    console.log('⚠️  请提供用户 token 作为参数:');
    console.log('   node test-my-tank-api.js YOUR_TOKEN_HERE');
    console.log('');
    console.log('💡 或者从浏览器控制台获取:');
    console.log('   localStorage.getItem("userToken")');
    return;
  }
  
  console.log('🔑 Token:', token.substring(0, 20) + '...');
  console.log('');
  
  // 验证 token
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase 配置缺失');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    console.log('🔍 验证 token...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Token 验证失败:', authError?.message || '用户不存在');
      return;
    }
    
    console.log('✅ Token 验证成功');
    console.log('   User ID:', user.id);
    console.log('   Email:', user.email);
    console.log('');
    
    // 测试 API
    console.log('🌐 调用 API: http://localhost:3000/api/fish/my-tank');
    const response = await fetch('http://localhost:3000/api/fish/my-tank', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 响应状态:', response.status, response.statusText);
    console.log('');
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API 调用成功!');
      console.log('   鱼总数:', data.fish?.length || 0);
      console.log('   统计:', data.stats);
    } else {
      console.error('❌ API 调用失败:');
      console.error(JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ 测试失败:');
    console.error('   错误:', error.message);
    console.error('   堆栈:', error.stack);
  }
}

testMyTankAPI();

