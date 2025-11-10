// 自动调试 My Tank 页面问题
// 在浏览器控制台运行此脚本

(async function autoDebugMyTank() {
  console.log('========================================');
  console.log('🔍 My Tank 自动调试');
  console.log('========================================\n');
  
  const results = {
    token: false,
    api: false,
    fishData: false,
    canvas: false,
    animation: false
  };
  
  // 1. 检查 token
  console.log('1️⃣ 检查登录状态...');
  const token = localStorage.getItem('userToken');
  if (!token) {
    console.error('❌ 未找到 token');
    console.log('💡 解决方法：访问 /login.html 登录');
    return results;
  }
  console.log('✅ Token 存在');
  results.token = true;
  
  // 2. 测试 API
  console.log('\n2️⃣ 测试 API 连接...');
  try {
    const BACKEND_URL = window.location.origin;
    console.log('🔗 API URL:', `${BACKEND_URL}/api/fish/my-tank`);
    
    const response = await fetch(`${BACKEND_URL}/api/fish/my-tank`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 API 状态:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        const errorText = await response.text();
        console.error('❌ API 错误响应 (非JSON):', errorText);
        console.error('💡 这可能是服务器配置问题');
        return results;
      }
      
      console.error('❌ API 错误:', errorData);
      if (errorData.details) {
        console.error('📋 错误详情:', JSON.stringify(errorData.details, null, 2));
      }
      return results;
    }
    
    const data = await response.json();
    console.log('✅ API 请求成功');
    results.api = true;
    
    if (!data.success) {
      console.error('❌ API 返回 success=false:', data.error);
      return results;
    }
    
    console.log('📦 返回数据:', {
      fishCount: data.fish?.length || 0,
      stats: data.stats
    });
    
    if (!data.fish || data.fish.length === 0) {
      console.warn('⚠️ 没有找到鱼数据');
      console.log('💡 可能原因：');
      console.log('   1. 您还没有创作任何鱼');
      console.log('   2. 您还没有收藏任何鱼');
      console.log('   3. 数据库中没有您的数据');
      return results;
    }
    
    console.log(`✅ 找到 ${data.fish.length} 条鱼`);
    results.fishData = true;
    
    // 检查鱼数据格式
    const firstFish = data.fish[0];
    console.log('\n3️⃣ 检查鱼数据格式...');
    console.log('第一条鱼:', firstFish);
    
    const requiredFields = ['id', 'image_url'];
    const missingFields = requiredFields.filter(field => !(field in firstFish));
    
    if (missingFields.length > 0) {
      console.error('❌ 缺少必需字段:', missingFields);
      return results;
    }
    
    if (!firstFish.image_url || !firstFish.image_url.startsWith('http')) {
      console.error('❌ 图片URL无效:', firstFish.image_url);
      return results;
    }
    
    console.log('✅ 鱼数据格式正确');
    
    // 4. 检查 Canvas
    console.log('\n4️⃣ 检查 Canvas...');
    const canvas = document.getElementById('swim-canvas');
    if (!canvas) {
      console.error('❌ 未找到 swim-canvas 元素');
      return results;
    }
    
    console.log('✅ Canvas 元素存在');
    console.log('📐 Canvas 尺寸:', canvas.width, 'x', canvas.height);
    
    if (canvas.width === 0 || canvas.height === 0) {
      console.error('❌ Canvas 尺寸为 0');
      console.log('💡 可能原因：页面未完全加载或CSS问题');
      return results;
    }
    
    results.canvas = true;
    
    // 5. 检查动画循环
    console.log('\n5️⃣ 检查动画系统...');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ 无法获取 Canvas 上下文');
      return results;
    }
    
    // 检查是否有鱼对象
    const fishesArray = window.privateTankFishes || window.fishes;
    if (typeof fishesArray !== 'undefined') {
      console.log('✅ fishes 数组存在');
      console.log('🐟 当前鱼数量:', fishesArray?.length || 0);
      
      if (fishesArray && fishesArray.length > 0) {
        console.log('✅ 有鱼对象');
        results.animation = true;
        
        // 检查第一条鱼
        const firstFishObj = fishesArray[0];
        console.log('第一条鱼对象:', {
          hasCanvas: !!firstFishObj.canvas,
          canvasSize: firstFishObj.canvas ? `${firstFishObj.canvas.width}x${firstFishObj.canvas.height}` : 'N/A',
          x: firstFishObj.x,
          y: firstFishObj.y,
          size: firstFishObj.size,
          id: firstFishObj.id
        });
        
        if (!firstFishObj.canvas) {
          console.error('❌ 鱼对象缺少 canvas');
          return results;
        }
        
        if (firstFishObj.canvas.width === 0 || firstFishObj.canvas.height === 0) {
          console.error('❌ 鱼的 canvas 尺寸为 0');
          return results;
        }
      } else {
        console.warn('⚠️ fishes 数组为空');
        console.log('💡 可能原因：');
        console.log('   1. 图片加载失败');
        console.log('   2. createFishObject 返回 null');
        console.log('   3. 图片URL无效或CORS问题');
        console.log('   4. Canvas初始化问题');
      }
    } else {
      console.warn('⚠️ window.privateTankFishes 和 window.fishes 都未定义');
      console.log('💡 可能原因：private-fishtank-swim.js 未正确加载');
    }
    
    // 6. 测试图片加载
    console.log('\n6️⃣ 测试图片加载...');
    if (data.fish && data.fish.length > 0) {
      const testFish = data.fish[0];
      if (testFish.image_url) {
        console.log('🖼️ 测试加载图片:', testFish.image_url);
        
        try {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              console.log('✅ 图片加载成功:', img.width, 'x', img.height);
              resolve();
            };
            img.onerror = (error) => {
              console.error('❌ 图片加载失败:', error);
              console.error('💡 可能原因：');
              console.error('   1. CORS 问题');
              console.error('   2. 图片URL无效');
              console.error('   3. 网络问题');
              reject(error);
            };
            img.src = testFish.image_url;
          });
        } catch (error) {
          console.error('❌ 图片加载测试失败');
          return results;
        }
      }
    }
    
    // 总结
    console.log('\n========================================');
    console.log('📊 诊断总结');
    console.log('========================================');
    console.log('Token:', results.token ? '✅' : '❌');
    console.log('API:', results.api ? '✅' : '❌');
    console.log('Fish Data:', results.fishData ? '✅' : '❌');
    console.log('Canvas:', results.canvas ? '✅' : '❌');
    console.log('Animation:', results.animation ? '✅' : '❌');
    
    if (Object.values(results).every(v => v)) {
      console.log('\n✅ 所有检查通过！如果鱼仍不显示，可能是渲染问题。');
    } else {
      console.log('\n❌ 发现问题，请查看上面的错误信息。');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ 调试过程出错:', error);
    console.error('错误堆栈:', error.stack);
    return results;
  }
})();

