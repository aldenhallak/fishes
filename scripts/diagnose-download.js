/**
 * 诊断下载问题 - 查看API返回的数据结构
 */

const https = require('https');

const API_URL = 'https://fishes-be-571679687712.northamerica-northeast1.run.app/api/fish?limit=5&order=desc&isVisible=true&deleted=false&orderBy=CreatedAt';

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('诊断原作者API返回的数据...\n');
  
  try {
    const response = await httpsGet(API_URL);
    const data = JSON.parse(response);
    
    console.log(`获取到 ${data.data.length} 条数据\n`);
    console.log('=' .repeat(80));
    
    data.data.forEach((fish, index) => {
      console.log(`\n鱼 #${index + 1}:`);
      console.log(`  ID: ${fish.id}`);
      console.log(`  Artist: ${fish.Artist}`);
      console.log(`  Image URL: ${fish.Image}`);
      console.log(`  URL长度: ${fish.Image ? fish.Image.length : 0} 字符`);
      console.log(`  Created: ${fish.CreatedAt}`);
      console.log(`  Upvotes: ${fish.upvotes}, Downvotes: ${fish.downvotes}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('诊断完成！');
    
  } catch (error) {
    console.error('错误:', error.message);
    console.error(error.stack);
  }
}

main();












