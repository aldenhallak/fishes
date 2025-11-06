/**
 * 诊断脚本 - 用于调试 rank.html 页面
 * 在浏览器控制台中运行此脚本
 * 
 * 使用方法：
 * 1. 访问 http://localhost:3000/rank.html?userId=YOUR_USER_ID
 * 2. 打开开发者工具控制台 (F12)
 * 3. 复制粘贴此脚本并运行
 */

(async function debugRankPage() {
  console.log('🔍 开始诊断 rank.html 页面...');
  console.log('='.repeat(50));
  
  // 1. 检查URL参数
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');
  
  console.log('\n📋 URL参数:');
  console.log('  userId:', userId || '❌ 未找到');
  
  // 2. 检查页面标题
  const headerElement = document.querySelector('.ranking-header h1');
  console.log('\n📝 页面标题:');
  console.log('  ', headerElement ? headerElement.textContent : '❌ 未找到标题元素');
  
  // 3. 检查是否有鱼显示
  const fishCards = document.querySelectorAll('.fish-card');
  console.log('\n🐟 鱼卡片数量:', fishCards.length);
  
  // 4. 检查loading状态
  const loadingEl = document.getElementById('loading');
  const gridEl = document.getElementById('fish-grid');
  console.log('\n⏳ 加载状态:');
  console.log('  loading display:', loadingEl ? loadingEl.style.display : '❌ 未找到');
  console.log('  grid display:', gridEl ? gridEl.style.display : '❌ 未找到');
  
  // 5. 测试GraphQL API
  if (userId) {
    console.log('\n🌐 测试 GraphQL API...');
    
    const query = `
      query GetUserFish($userId: String!) {
        fish(
          where: {
            user_id: { _eq: $userId }
            is_approved: { _eq: true }
          }
          limit: 5
        ) {
          id
          artist
          image_url
          created_at
          is_alive
        }
      }
    `;
    
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          variables: { userId }
        })
      });
      
      console.log('  响应状态:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('  响应数据:', result);
      
      if (result.errors) {
        console.error('  ❌ GraphQL 错误:', result.errors);
      } else if (result.data && result.data.fish) {
        console.log('  ✅ 找到', result.data.fish.length, '条鱼');
        console.log('  鱼数据:', result.data.fish);
      } else {
        console.log('  ⚠️ 没有找到鱼数据');
      }
    } catch (error) {
      console.error('  ❌ API 请求失败:', error);
    }
  }
  
  // 6. 检查后端配置
  console.log('\n⚙️ 检查后端配置...');
  try {
    const configResponse = await fetch('/api/config/backend');
    const config = await configResponse.json();
    console.log('  后端配置:', config);
  } catch (error) {
    console.error('  ❌ 无法获取后端配置:', error);
  }
  
  // 7. 检查控制台错误
  console.log('\n📊 诊断完成！');
  console.log('='.repeat(50));
  console.log('\n如果没有看到鱼，请检查：');
  console.log('  1. userId 是否正确');
  console.log('  2. GraphQL API 是否返回数据');
  console.log('  3. 是否有 JavaScript 错误');
  console.log('  4. 后端配置是否正确');
  console.log('\n请截图上述所有输出并提供给开发者。');
})();








