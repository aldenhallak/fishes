/**
 * 测试脚本 - myfish.html 页面
 * 在浏览器控制台中运行此脚本来测试页面功能
 * 
 * 使用方法：
 * 1. 访问 http://localhost:3000/myfish.html
 * 2. 打开开发者工具 (F12)
 * 3. 复制粘贴此脚本到控制台并运行
 */

(async function testMyFishPage() {
  console.log('🧪 开始测试 myfish.html 页面...');
  console.log('='.repeat(60));
  
  // 测试结果汇总
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  // 辅助函数
  const pass = (test) => {
    console.log(`✅ ${test}`);
    results.passed.push(test);
  };
  
  const fail = (test, reason) => {
    console.error(`❌ ${test}: ${reason}`);
    results.failed.push({ test, reason });
  };
  
  const warn = (test, reason) => {
    console.warn(`⚠️ ${test}: ${reason}`);
    results.warnings.push({ test, reason });
  };
  
  // 1. 检查页面基础元素
  console.log('\n📋 测试 1: 检查页面基础元素');
  console.log('-'.repeat(60));
  
  const title = document.title;
  if (title.includes('我的鱼') || title.includes('My Fish')) {
    pass('页面标题正确');
  } else {
    fail('页面标题', `期望包含"我的鱼"，实际: ${title}`);
  }
  
  const statsContainer = document.getElementById('stats-container');
  if (statsContainer) {
    pass('统计信息容器存在');
  } else {
    fail('统计信息容器', '未找到 #stats-container');
  }
  
  const fishGrid = document.getElementById('fish-grid');
  if (fishGrid) {
    pass('鱼网格容器存在');
  } else {
    fail('鱼网格容器', '未找到 #fish-grid');
  }
  
  const sortButtons = document.querySelectorAll('.sort-btn');
  if (sortButtons.length === 4) {
    pass(`排序按钮数量正确 (${sortButtons.length})`);
  } else {
    fail('排序按钮数量', `期望 4 个，实际: ${sortButtons.length}`);
  }
  
  // 2. 检查用户登录状态
  console.log('\n👤 测试 2: 检查用户登录状态');
  console.log('-'.repeat(60));
  
  const userToken = localStorage.getItem('userToken');
  if (userToken) {
    pass('用户已登录 (Token 存在)');
  } else {
    fail('用户登录状态', '未找到 Token，页面可能会重定向到登录页');
  }
  
  const userId = localStorage.getItem('userId');
  if (userId) {
    pass(`用户 ID: ${userId}`);
  } else {
    warn('用户 ID', '未找到 userId');
  }
  
  // 3. 检查导航链接
  console.log('\n🔗 测试 3: 检查导航链接');
  console.log('-'.repeat(60));
  
  const myFishLink = document.getElementById('my-fish-link');
  if (myFishLink) {
    pass('导航链接存在');
    if (userToken) {
      const display = window.getComputedStyle(myFishLink).display;
      if (display !== 'none') {
        pass('导航链接可见');
      } else {
        warn('导航链接可见性', '链接存在但被隐藏');
      }
    }
  } else {
    fail('导航链接', '未找到 #my-fish-link');
  }
  
  // 4. 测试 API
  if (userToken) {
    console.log('\n🌐 测试 4: 测试 API 调用');
    console.log('-'.repeat(60));
    
    try {
      const response = await fetch('/api/fishtank/my-fish', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`API 响应状态: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        pass('API 请求成功');
        
        const data = await response.json();
        console.log('API 返回数据:', data);
        
        if (data.success) {
          pass('API 返回成功标志');
          
          if (Array.isArray(data.fish)) {
            pass(`鱼数据是数组 (${data.fish.length} 条鱼)`);
            
            if (data.fish.length > 0) {
              pass('找到鱼数据');
              
              // 检查第一条鱼的结构
              const firstFish = data.fish[0];
              const requiredFields = ['id', 'artist', 'image_url', 'created_at', 'level', 'health'];
              const missingFields = requiredFields.filter(field => !(field in firstFish));
              
              if (missingFields.length === 0) {
                pass('鱼数据结构完整');
              } else {
                warn('鱼数据结构', `缺少字段: ${missingFields.join(', ')}`);
              }
            } else {
              warn('鱼数据', '没有找到鱼（您可能还没有创作或收藏鱼）');
            }
            
            if (data.stats) {
              pass('统计信息存在');
              console.log('  统计数据:', data.stats);
            } else {
              warn('统计信息', '未返回 stats');
            }
          } else {
            fail('鱼数据格式', 'fish 字段不是数组');
          }
        } else {
          fail('API 响应', data.error || '成功标志为 false');
        }
      } else {
        fail('API 请求', `状态码 ${response.status}`);
        const errorData = await response.json().catch(() => ({}));
        console.error('错误详情:', errorData);
      }
    } catch (error) {
      fail('API 调用', error.message);
      console.error('错误详情:', error);
    }
  } else {
    console.log('\n⏭️ 测试 4: 跳过 API 测试（未登录）');
  }
  
  // 5. 检查页面渲染
  console.log('\n🎨 测试 5: 检查页面渲染');
  console.log('-'.repeat(60));
  
  const fishCards = document.querySelectorAll('.fish-card');
  console.log(`当前页面显示 ${fishCards.length} 张鱼卡片`);
  
  if (fishCards.length > 0) {
    pass(`页面渲染了 ${fishCards.length} 张鱼卡片`);
    
    // 检查第一张卡片
    const firstCard = fishCards[0];
    const badge = firstCard.querySelector('.fish-type-badge');
    const image = firstCard.querySelector('.fish-image');
    const artist = firstCard.querySelector('.fish-artist');
    const level = firstCard.querySelector('.fish-level');
    
    if (badge) pass('鱼卡片包含类型徽章');
    else warn('鱼卡片', '未找到类型徽章');
    
    if (image) pass('鱼卡片包含图片');
    else fail('鱼卡片', '未找到图片元素');
    
    if (artist) pass('鱼卡片包含艺术家信息');
    else fail('鱼卡片', '未找到艺术家信息');
    
    if (level) pass('鱼卡片包含等级信息');
    else warn('鱼卡片', '未找到等级信息');
  } else {
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('empty-state');
    
    if (loading && loading.style.display !== 'none') {
      warn('页面状态', '正在加载中...');
    } else if (emptyState && emptyState.style.display !== 'none') {
      warn('页面状态', '显示空状态（您可能还没有鱼）');
    } else {
      fail('页面渲染', '没有鱼卡片显示，也没有加载或空状态提示');
    }
  }
  
  // 6. 测试排序功能
  console.log('\n🔀 测试 6: 测试排序功能');
  console.log('-'.repeat(60));
  
  const sortBtns = document.querySelectorAll('.sort-btn');
  if (sortBtns.length > 0) {
    const activeBtn = document.querySelector('.sort-btn.active');
    if (activeBtn) {
      const sortType = activeBtn.getAttribute('data-sort');
      pass(`当前激活排序: ${sortType}`);
    } else {
      warn('排序功能', '没有激活的排序按钮');
    }
    
    // 检查排序按钮是否可点击
    let clickable = true;
    sortBtns.forEach(btn => {
      if (btn.onclick || btn.getAttribute('onclick')) {
        clickable = true;
      }
    });
    
    if (clickable) {
      pass('排序按钮可交互');
    } else {
      warn('排序功能', '排序按钮可能没有绑定事件');
    }
  }
  
  // 7. 统计结果
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(60));
  console.log(`✅ 通过: ${results.passed.length}`);
  console.log(`❌ 失败: ${results.failed.length}`);
  console.log(`⚠️ 警告: ${results.warnings.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n失败的测试:');
    results.failed.forEach(({ test, reason }) => {
      console.log(`  ❌ ${test}: ${reason}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log('\n警告信息:');
    results.warnings.forEach(({ test, reason }) => {
      console.log(`  ⚠️ ${test}: ${reason}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (results.failed.length === 0) {
    console.log('🎉 所有关键测试通过！页面运行正常。');
    if (results.warnings.length > 0) {
      console.log('💡 有一些警告，但不影响核心功能。');
    }
  } else {
    console.log('⚠️ 有一些测试失败，请检查上述问题。');
  }
  
  console.log('='.repeat(60));
  
  return {
    passed: results.passed.length,
    failed: results.failed.length,
    warnings: results.warnings.length,
    details: results
  };
})();















