/**
 * 从原作者后端下载鱼数据用于测试
 * 使用方法: node scripts/download-fish-data.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 配置
const CONFIG = {
  BACKEND_URL: 'https://fishes-be-571679687712.northamerica-northeast1.run.app',
  OUTPUT_DIR: './test-data',
  FISH_COUNT: 50,  // 下载50条鱼数据
  IMAGE_DIR: './test-data/images'
};

// 创建输出目录
if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
  fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(CONFIG.IMAGE_DIR)) {
  fs.mkdirSync(CONFIG.IMAGE_DIR, { recursive: true });
}

// 下载图片
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // 删除失败的文件
      reject(err);
    });
  });
}

// 主函数
async function downloadFishData() {
  console.log('🐟 开始下载鱼数据...\n');
  
  try {
    // 1. 获取鱼列表
    console.log('📡 正在获取鱼列表...');
    const response = await fetch(`${CONFIG.BACKEND_URL}/api/fish?limit=${CONFIG.FISH_COUNT}&orderBy=CreatedAt&order=desc&isVisible=true&deleted=false`);
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ 获取到 ${data.data.length} 条鱼数据\n`);
    
    // 2. 处理每条鱼
    const fishData = [];
    
    for (let i = 0; i < data.data.length; i++) {
      const fish = data.data[i];
      const fishItem = fish.data || fish; // 兼容不同格式
      
      console.log(`[${i + 1}/${data.data.length}] 处理鱼: ${fishItem.Artist || 'Anonymous'}`);
      
      // 提取有用的数据
      const processedFish = {
        id: fish.id,
        artist: fishItem.Artist || fishItem.artist || 'Anonymous',
        image_url: fishItem.Image || fishItem.image,
        created_at: fishItem.CreatedAt || fishItem.created_at,
        upvotes: fishItem.upvotes || 0,
        downvotes: fishItem.downvotes || 0,
        score: (fishItem.upvotes || 0) - (fishItem.downvotes || 0),
        user_id: fishItem.UserId || fishItem.userId || null,
        
        // 随机生成战斗属性（用于测试）
        talent: Math.floor(Math.random() * 50) + 25, // 25-75
        level: 1,
        experience: 0,
        health: 10,
        max_health: 10,
        is_alive: true,
        total_wins: 0,
        total_losses: 0
      };
      
      // 3. 下载图片（可选，仅当指定--images参数时）
      if (downloadImages && processedFish.image_url && processedFish.image_url.startsWith('http')) {
        try {
          const imageExt = '.png'; // 假设都是PNG
          const imagePath = path.join(CONFIG.IMAGE_DIR, `${fish.id}${imageExt}`);
          
          // 检查是否已存在
          if (!fs.existsSync(imagePath)) {
            await downloadImage(processedFish.image_url, imagePath);
            console.log(`  ✓ 图片已下载: ${fish.id}${imageExt}`);
          } else {
            console.log(`  ⊙ 图片已存在: ${fish.id}${imageExt}`);
          }
          
          // 更新为本地路径（如果你要用本地测试）
          processedFish.local_image_path = imagePath;
        } catch (err) {
          console.log(`  ✗ 图片下载失败: ${err.message}`);
        }
      }
      
      fishData.push(processedFish);
      
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 4. 保存为JSON文件
    const outputPath = path.join(CONFIG.OUTPUT_DIR, 'fish-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(fishData, null, 2));
    console.log(`\n✅ 数据已保存到: ${outputPath}`);
    
    // 5. 生成SQL插入脚本
    generateSQLScript(fishData);
    
    // 6. 生成统计信息
    console.log('\n📊 统计信息:');
    console.log(`  总计: ${fishData.length} 条鱼`);
    console.log(`  有用户ID: ${fishData.filter(f => f.user_id).length} 条`);
    console.log(`  平均分数: ${(fishData.reduce((sum, f) => sum + f.score, 0) / fishData.length).toFixed(2)}`);
    console.log(`  平均天赋: ${(fishData.reduce((sum, f) => sum + f.talent, 0) / fishData.length).toFixed(2)}`);
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    process.exit(1);
  }
}

// 生成SQL插入脚本
function generateSQLScript(fishData) {
  const sqlPath = path.join(CONFIG.OUTPUT_DIR, 'insert-fish.sql');
  
  let sql = `-- 测试鱼数据插入脚本
-- 生成时间: ${new Date().toISOString()}
-- 总计: ${fishData.length} 条鱼

BEGIN;

`;

  fishData.forEach((fish, index) => {
    sql += `-- Fish ${index + 1}: ${fish.artist}
INSERT INTO fish (
  id, user_id, artist, image_url, created_at,
  talent, level, experience, health, max_health,
  upvotes, downvotes, is_alive, total_wins, total_losses
) VALUES (
  '${fish.id}',
  ${fish.user_id ? `'${fish.user_id}'` : 'NULL'},
  '${fish.artist.replace(/'/g, "''")}',
  '${fish.image_url}',
  ${fish.created_at ? `'${fish.created_at}'` : 'NOW()'},
  ${fish.talent},
  ${fish.level},
  ${fish.experience},
  ${fish.health},
  ${fish.max_health},
  ${fish.upvotes},
  ${fish.downvotes},
  ${fish.is_alive},
  ${fish.total_wins},
  ${fish.total_losses}
)
ON CONFLICT (id) DO NOTHING;

`;
  });
  
  sql += `COMMIT;

-- 验证插入
SELECT COUNT(*) as total_fish FROM fish;
`;
  
  fs.writeFileSync(sqlPath, sql);
  console.log(`✅ SQL脚本已保存到: ${sqlPath}`);
}

// 添加命令行参数支持
const args = process.argv.slice(2);
const downloadImages = args.includes('--images') || args.includes('-i');
const count = parseInt(args.find(arg => arg.startsWith('--count='))?.split('=')[1]) || CONFIG.FISH_COUNT;

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🐟 鱼数据下载工具

用法:
  node scripts/download-fish-data.js [选项]

选项:
  --count=N, -n N    下载N条鱼数据（默认50）
  --images, -i       同时下载图片（较慢）
  --help, -h         显示帮助信息

示例:
  node scripts/download-fish-data.js --count=100 --images
  node scripts/download-fish-data.js -n 20
  `);
  process.exit(0);
}

CONFIG.FISH_COUNT = count;

// 执行
downloadFishData().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

