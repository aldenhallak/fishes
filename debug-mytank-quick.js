// 快速诊断脚本 - 复制到浏览器控制台运行
(async function debugMyTank() {
  console.log('========================================');
  console.log('🐠 My Tank 快速诊断');
  console.log('========================================\n');
  
  // 1. 检查 token
  console.log('1️⃣ 检查登录状态...');
  const token = localStorage.getItem('userToken');
  if (!token) {
    console.error('❌ 未找到 token');
    console.log('解决方法：访问 /login.html 登录');
    return;
  }
  console.log('✅ Token 存在:', token.substring(0, 30) + '...');
  
  // 2. 测试 API
  console.log('\n2️⃣ 测试 API 连接...');
  try {
    const response = await fetch('http://localhost:3000/api/fishtank/my-fish', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API 状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 错误响应:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('API 返回数据:', data);
    
    if (!data.success) {
      console.error('❌ API 失败:', data.error);
      return;
    }
    
    console.log('✅ API 成功');
    console.log('   - 鱼的数量:', data.fish.length);
    console.log('   - 统计:', data.stats);
    
    if (data.fish.length > 0) {
      console.log('   - 鱼列表:');
      data.fish.forEach((fish, i) => {
        console.log(`     ${i + 1}. ${fish.artist || 'Anonymous'} (ID: ${fish.id})`);
        console.log(`        图片: ${fish.image_url}`);
        console.log(`        isOwn: ${fish.isOwn}, isFavorited: ${fish.isFavorited}`);
      });
    } else {
      console.warn('⚠️  API 返回 0 条鱼');
      console.log('可能原因：');
      console.log('   1. 您还没有画过鱼 → 访问 /index.html 画鱼');
      console.log('   2. 用户ID不匹配');
      console.log('   3. 数据库权限问题');
    }
    
  } catch (error) {
    console.error('❌ API 请求失败:', error);
    console.log('可能原因：');
    console.log('   1. 开发服务器未运行');
    console.log('   2. API 端点不存在');
    console.log('   3. 网络问题');
    return;
  }
  
  // 3. 检查页面元素
  console.log('\n3️⃣ 检查页面元素...');
  const canvas = document.getElementById('swim-canvas');
  const fishCountDisplay = document.getElementById('fish-count-display');
  const loadingEl = document.getElementById('loading-indicator');
  
  console.log('Canvas:', canvas ? '✅ 找到' : '❌ 未找到');
  console.log('鱼数量显示:', fishCountDisplay ? `✅ "${fishCountDisplay.textContent}"` : '❌ 未找到');
  console.log('加载指示器:', loadingEl ? (loadingEl.style.display === 'none' ? '✅ 已隐藏' : '⚠️ 仍在显示') : '❌ 未找到');
  
  // 4. 检查动画中的鱼
  console.log('\n4️⃣ 检查动画状态...');
  if (typeof fishes !== 'undefined') {
    console.log('✅ fishes 数组存在');
    console.log('   - 数组长度:', fishes.length);
    if (fishes.length > 0) {
      console.log('   - 第一条鱼:');
      const f = fishes[0];
      console.log('     ID:', f.id);
      console.log('     位置:', `(${f.x.toFixed(0)}, ${f.y.toFixed(0)})`);
      console.log('     速度:', `(${f.vx.toFixed(2)}, ${f.vy.toFixed(2)})`);
      console.log('     Canvas:', f.canvas ? '✅ 存在' : '❌ 不存在');
      console.log('     isOwn:', f.isOwn);
      console.log('     is_alive:', f.is_alive);
    }
  } else {
    console.error('❌ fishes 数组未定义');
    console.log('可能原因：脚本未正确加载');
  }
  
  // 5. 检查脚本加载
  console.log('\n5️⃣ 检查脚本加载...');
  const scripts = Array.from(document.scripts).map(s => s.src);
  const privateScript = scripts.find(s => s.includes('private-fishtank-swim.js'));
  console.log('private-fishtank-swim.js:', privateScript ? '✅ 已加载' : '❌ 未找到');
  
  console.log('\n========================================');
  console.log('诊断完成！');
  console.log('========================================');
})();

