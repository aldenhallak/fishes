/**
 * 从原作者后端下载测试鱼数据并上传到七牛云
 * 
 * 功能：
 * 1. 从原作者API获取鱼数据
 * 2. 下载PNG图片
 * 3. 上传图片到七牛云
 * 4. 生成测试数据JSON文件
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const { QiniuUploader } = require('../lib/qiniu/uploader');

// 代理配置（Clash默认端口）
const PROXY_HOST = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || 'http://127.0.0.1:7890';
const useProxy = true; // 设置为false禁用代理

// 配置
const CONFIG = {
  // 原作者API
  originalApiUrl: 'https://fishes-be-571679687712.northamerica-northeast1.run.app/api/fish',
  // 下载数量（可通过命令行参数覆盖：node download-test-fish.js 20）
  downloadLimit: process.argv[2] ? parseInt(process.argv[2]) : 2000,
  // 临时目录
  tempDir: path.join(__dirname, '../temp'),
  // 输出文件
  outputFile: path.join(__dirname, '../temp/test-fish-data.json'),
  // 随机作者名列表（真实英文账号风格）
  artistNames: [
    'alex_chen', 'sarah_wilson', 'mike_johnson', 'emma_davis', 'david_kim',
    'lisa_martinez', 'james_brown', 'sophia_lee', 'ryan_miller', 'olivia_garcia',
    'kevin_wang', 'maria_rodriguez', 'chris_taylor', 'anna_zhang', 'tom_anderson',
    'julia_white', 'daniel_liu', 'emily_harris', 'jason_park', 'amy_thomas',
    'brian_clark', 'jessica_lewis', 'steven_yang', 'rachel_scott', 'mark_nguyen',
    'jennifer_walker', 'andrew_hall', 'michelle_green', 'john_baker', 'laura_adams',
    'peter_wright', 'diana_carter', 'robert_torres', 'nicole_flores', 'tim_rivera',
    'karen_murphy', 'eric_cooper', 'amanda_reed', 'jeff_bell', 'christine_collins',
    'matt_richardson', 'samantha_cox', 'aaron_ward', 'jessica_howard', 'brandon_russell',
    'stephanie_henderson', 'joe_morgan', 'tiffany_butler', 'tyler_simmons', 'ashley_foster'
  ]
};

// 创建临时目录
if (!fs.existsSync(CONFIG.tempDir)) {
  fs.mkdirSync(CONFIG.tempDir, { recursive: true });
}

/**
 * 从URL下载数据（Promise封装）
 */
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

/**
 * 下载图片到Buffer（带重试）
 */
async function downloadImageWithRetry(imageUrl, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await downloadImage(imageUrl);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      const retryDelay = 3000 + attempt * 2000; // 3秒、5秒、7秒递增
      console.log(`  - 重试 ${attempt}/${maxRetries - 1} (${retryDelay/1000}秒后)...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

/**
 * 下载图片到Buffer
 */
function downloadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('下载超时(60秒)'));
    }, 60000);
    
    if (useProxy) {
      // 使用代理下载
      const proxyUrl = new URL(PROXY_HOST);
      const targetUrl = new URL(imageUrl);
      
      const options = {
        host: proxyUrl.hostname,
        port: proxyUrl.port || 7890,
        method: 'CONNECT',
        path: `${targetUrl.hostname}:443`,
        timeout: 30000
      };
      
      const req = http.request(options);
      
      req.on('connect', (res, socket) => {
        if (res.statusCode !== 200) {
          clearTimeout(timeout);
          return reject(new Error(`代理连接失败: ${res.statusCode}`));
        }
        
        const httpsOptions = {
          socket: socket,
          servername: targetUrl.hostname,
          path: targetUrl.pathname + targetUrl.search,
          method: 'GET',
          headers: {
            'Host': targetUrl.hostname,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        };
        
        const httpsReq = https.request(httpsOptions, (httpsRes) => {
          if (httpsRes.statusCode !== 200) {
            clearTimeout(timeout);
            return reject(new Error(`HTTP ${httpsRes.statusCode}: ${httpsRes.statusMessage}`));
          }
          
          const chunks = [];
          httpsRes.on('data', (chunk) => chunks.push(chunk));
          httpsRes.on('end', () => {
            clearTimeout(timeout);
            if (chunks.length === 0) {
              return reject(new Error('下载的图片为空'));
            }
            resolve(Buffer.concat(chunks));
          });
          httpsRes.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        });
        
        httpsReq.on('error', (err) => {
          clearTimeout(timeout);
          reject(new Error(`HTTPS请求错误: ${err.code || err.message}`));
        });
        
        httpsReq.end();
      });
      
      req.on('error', (err) => {
        clearTimeout(timeout);
        reject(new Error(`代理错误: ${err.code || err.message || '未知'}`));
      });
      
      req.on('timeout', () => {
        clearTimeout(timeout);
        reject(new Error('代理连接超时'));
      });
      
      req.end();
    } else {
      // 不使用代理，直接下载
      const options = {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      };
      
      https.get(imageUrl, options, (res) => {
        if (res.statusCode !== 200) {
          clearTimeout(timeout);
          return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
        
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          clearTimeout(timeout);
          if (chunks.length === 0) {
            return reject(new Error('下载的图片为空'));
          }
          resolve(Buffer.concat(chunks));
        });
        res.on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      }).on('error', (err) => {
        clearTimeout(timeout);
        reject(new Error(`网络错误: ${err.code || err.message || '未知'}`));
      }).on('timeout', () => {
        clearTimeout(timeout);
        reject(new Error('连接超时'));
      });
    }
  });
}

/**
 * 随机选择作者名
 */
function randomArtist() {
  return CONFIG.artistNames[Math.floor(Math.random() * CONFIG.artistNames.length)];
}

/**
 * 随机生成天赋值 (25-75)
 */
function randomTalent() {
  return Math.floor(Math.random() * 51) + 25;
}

/**
 * 计算战斗力
 */
function calculateBattlePower(talent, level = 1) {
  return (talent * 0.5 + level * 10).toFixed(2);
}

/**
 * 生成测试用user_id
 */
function generateTestUserId(index) {
  return `test_user_${index % 10}_${Date.now()}`;
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(60));
  console.log('从原作者后端下载测试鱼数据');
  console.log('='.repeat(60));
  console.log('');
  
  // 显示代理配置
  if (useProxy) {
    console.log(`🔄 使用代理: ${PROXY_HOST}`);
    console.log('');
  } else {
    console.log('⚠️  未使用代理（直连）');
    console.log('');
  }

  try {
    // 1. 从原作者API获取鱼数据
    console.log(`步骤 1/4: 从原作者API获取鱼数据 (${CONFIG.downloadLimit}条)...`);
    const apiUrl = `${CONFIG.originalApiUrl}?limit=${CONFIG.downloadLimit}&order=desc&isVisible=true&deleted=false&orderBy=CreatedAt`;
    console.log(`API: ${apiUrl}`);
    
    const response = await httpsGet(apiUrl);
    const apiData = JSON.parse(response);
    
    if (!apiData.data || apiData.data.length === 0) {
      throw new Error('API返回数据为空');
    }
    
    console.log(`✓ 成功获取 ${apiData.data.length} 条鱼数据`);
    console.log('');

    // 2. 初始化七牛云上传器
    console.log('步骤 2/4: 初始化七牛云上传器...');
    const uploader = new QiniuUploader();
    console.log('✓ 七牛云上传器初始化成功');
    console.log('');

    // 3. 下载图片并上传到七牛云
    console.log(`步骤 3/4: 下载并上传图片到七牛云...`);
    console.log(`总数: ${apiData.data.length} 条`);
    console.log(`预计时间: ${Math.round(apiData.data.length * 1.5 / 60)} 分钟`);
    console.log('');
    
    processedData = []; // 使用全局变量以便中断时保存
    let successCount = 0;
    let failCount = 0;
    const startTime = Date.now();

    for (let i = 0; i < apiData.data.length; i++) {
      const fish = apiData.data[i];
      const progress = `[${i + 1}/${apiData.data.length}]`;
      
      try {
        console.log(`${progress} 处理: ${fish.id} (Artist: ${fish.Artist || 'Anonymous'})`);
        
        // 验证图片URL
        if (!fish.Image) {
          throw new Error('图片URL为空');
        }
        
        // 下载图片（带重试）
        console.log(`  - 下载图片: ${fish.Image.substring(0, 80)}...`);
        const imageBuffer = await downloadImageWithRetry(fish.Image);
        console.log(`  - 图片大小: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
        
        // 上传到七牛云
        console.log(`  - 上传到七牛云...`);
        const uploadResult = await uploader.uploadFile(imageBuffer, `fish-${fish.id}.png`, { 
          category: 'fish' 
        });
        console.log(`  - 七牛云URL: ${uploadResult.url}`);
        
        // 生成测试数据
        const talent = randomTalent();
        const testFish = {
          original_id: fish.id,
          image_url: uploadResult.url,
          artist: randomArtist(),
          user_id: generateTestUserId(i),
          
          // 战斗系统字段
          talent: talent,
          level: 1,
          experience: 0,
          health: 100,
          max_health: 100,
          battle_power: parseFloat(calculateBattlePower(talent, 1)),
          is_alive: true,
          is_in_battle_mode: false,
          position_row: 0,
          total_wins: 0,
          total_losses: 0,
          
          // 投票字段
          upvotes: fish.upvotes || 0,
          downvotes: fish.downvotes || 0,
          
          // 审核字段
          reported: false,
          report_count: 0,
          is_approved: true,
          
          // 时间字段
          created_at: fish.CreatedAt || new Date().toISOString(),
          
          // 元数据（用于追溯）
          metadata: {
            original_image: fish.Image,
            original_artist: fish.Artist,
            download_time: new Date().toISOString()
          }
        };
        
        processedData.push(testFish);
        successCount++;
        
        // 计算进度和预计剩余时间
        const elapsed = Date.now() - startTime;
        const avgTime = elapsed / (i + 1);
        const remaining = (apiData.data.length - i - 1) * avgTime;
        const remainingMin = Math.round(remaining / 60000);
        
        console.log(`  ✓ 成功 (${successCount}成功 / ${failCount}失败 / ${i + 1}总共) - 预计剩余: ${remainingMin}分钟`);
        
      } catch (error) {
        failCount++;
        console.error(`  ✗ 失败: ${error.message || error.toString() || '未知错误'}`);
        if (error.stack) {
          console.error(`  错误详情: ${error.stack.split('\n')[0]}`);
        }
        console.error(`  跳过该鱼，继续处理下一条...`);
      }
      
      console.log('');
      
      // 每条下载后都暂停，避免请求过快
      if (i < apiData.data.length - 1) {
        // 随机延迟0.5-1.5秒（更快但仍安全）
        const delay = 500 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // 每100条额外暂停5秒，防止服务器拒绝
      if ((i + 1) % 100 === 0) {
        console.log(`已处理${i + 1}条，暂停5秒... (${successCount}成功 / ${failCount}失败)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      // 每500条保存一次进度
      if ((i + 1) % 500 === 0 && processedData.length > 0) {
        const tempFile = CONFIG.outputFile.replace('.json', `-progress-${i + 1}.json`);
        fs.writeFileSync(tempFile, JSON.stringify(processedData, null, 2), 'utf-8');
        console.log(`进度已保存: ${tempFile}`);
      }
    }

    console.log(`步骤 3/4 完成: 成功 ${successCount} 条，失败 ${failCount} 条`);
    console.log('');

    // 4. 保存到JSON文件
    console.log('步骤 4/4: 保存数据到JSON文件...');
    
    // 保存最终结果
    fs.writeFileSync(
      CONFIG.outputFile,
      JSON.stringify(processedData, null, 2),
      'utf-8'
    );
    console.log(`✓ 数据已保存到: ${CONFIG.outputFile}`);
    console.log(`✓ 总共处理: ${processedData.length} 条鱼数据`);
    
    // 计算总耗时
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    console.log(`✓ 总耗时: ${minutes}分${seconds}秒`);
    console.log('');

    // 统计信息
    console.log('='.repeat(60));
    console.log('下载完成统计');
    console.log('='.repeat(60));
    console.log(`原始数据: ${apiData.data.length} 条`);
    console.log(`成功处理: ${successCount} 条`);
    console.log(`失败跳过: ${failCount} 条`);
    console.log(`最终保存: ${processedData.length} 条`);
    console.log('');
    console.log('下一步: 运行 node scripts/import-test-fish.js 导入数据到Hasura');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
    
    // 保存已处理的数据（如果有的话）
    if (processedData && processedData.length > 0) {
      const errorFile = CONFIG.outputFile.replace('.json', `-error-${Date.now()}.json`);
      fs.writeFileSync(errorFile, JSON.stringify(processedData, null, 2), 'utf-8');
      console.error(`\n⚠️  已保存 ${processedData.length} 条成功的数据到: ${errorFile}`);
    }
    
    process.exit(1);
  }
}

// 处理进程退出信号，保存数据
let processedData = [];
process.on('SIGINT', () => {
  console.log('\n\n⚠️  收到中断信号，正在保存数据...');
  if (processedData.length > 0) {
    const interruptFile = CONFIG.outputFile.replace('.json', `-interrupt-${Date.now()}.json`);
    fs.writeFileSync(interruptFile, JSON.stringify(processedData, null, 2), 'utf-8');
    console.log(`✓ 已保存 ${processedData.length} 条数据到: ${interruptFile}`);
  }
  process.exit(0);
});

// 运行
if (require.main === module) {
  main();
}

module.exports = { main };

