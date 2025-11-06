/**
 * 下载监控脚本 - 运行并监控下载进程
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, '../temp/test-fish-data.json');
const logFile = path.join(__dirname, '../temp/download-log.txt');

console.log('='.repeat(60));
console.log('开始下载测试鱼数据（带监控）');
console.log('='.repeat(60));
console.log('');
console.log('监控功能:');
console.log('  - 自动重启（如果进程崩溃）');
console.log('  - 实时日志记录');
console.log('  - 进度监控');
console.log('');
console.log('按 Ctrl+C 停止下载');
console.log('');
console.log('='.repeat(60));
console.log('');

let restartCount = 0;
const maxRestarts = 3;

function startDownload() {
  console.log(`[${new Date().toLocaleTimeString()}] 启动下载进程...`);
  
  const child = spawn('node', ['scripts/download-test-fish.js'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  });
  
  // 记录输出
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });
  
  child.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);
    logStream.write(output);
  });
  
  child.stderr.on('data', (data) => {
    const output = data.toString();
    process.stderr.write(output);
    logStream.write(output);
  });
  
  child.on('close', (code) => {
    logStream.end();
    
    if (code === 0) {
      console.log('');
      console.log('✓ 下载完成！');
      process.exit(0);
    } else {
      console.error('');
      console.error(`✗ 进程异常退出 (代码: ${code})`);
      
      if (restartCount < maxRestarts) {
        restartCount++;
        console.log(`等待5秒后重启... (${restartCount}/${maxRestarts})`);
        setTimeout(() => startDownload(), 5000);
      } else {
        console.error('达到最大重启次数，停止。');
        process.exit(1);
      }
    }
  });
  
  // 定期检查进度
  const progressInterval = setInterval(() => {
    if (fs.existsSync(outputFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
        console.log(`\n[监控] 当前进度: ${data.length} 条数据已保存\n`);
      } catch (e) {
        // 文件可能正在写入
      }
    }
  }, 60000); // 每分钟检查一次
  
  child.on('exit', () => {
    clearInterval(progressInterval);
  });
  
  // 处理 Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n收到中断信号，停止下载...');
    child.kill('SIGINT');
    clearInterval(progressInterval);
    process.exit(0);
  });
}

// 开始
startDownload();



















