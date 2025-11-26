const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');

async function testUpload() {
  console.log('='.repeat(60));
  console.log('直接测试上传API');
  console.log('='.repeat(60));
  console.log('');
  
  // 创建一个简单的1x1 PNG
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(base64, 'base64');
  
  console.log('📦 文件信息:');
  console.log('  大小:', buffer.length, '字节');
  console.log('');
  
  // 创建FormData
  const formData = new FormData();
  formData.append('image', buffer, {
    filename: 'test.png',
    contentType: 'image/png'
  });
  
  try {
    console.log('📤 发送请求到 http://localhost:3000/api/fish-api?action=upload');
    console.log('');
    
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/fish-api?action=upload', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const elapsed = Date.now() - startTime;
    
    console.log(`✅ 响应收到 (耗时: ${elapsed}ms)`);
    console.log('  状态码:', response.status);
    console.log('  状态文本:', response.statusText);
    console.log('');
    
    const contentType = response.headers.get('content-type');
    console.log('  Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log('📦 响应数据:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      const text = await response.text();
      console.log('📦 响应文本:');
      console.log(text.substring(0, 500));
    }
    
  } catch (error) {
    console.error('');
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
  }
  
  console.log('');
  console.log('='.repeat(60));
}

// 添加超时
const timeout = setTimeout(() => {
  console.error('');
  console.error('⏰ 请求超时 (30秒)');
  process.exit(1);
}, 30000);

testUpload().then(() => {
  clearTimeout(timeout);
  process.exit(0);
}).catch((error) => {
  clearTimeout(timeout);
  console.error('未捕获的错误:', error);
  process.exit(1);
});


