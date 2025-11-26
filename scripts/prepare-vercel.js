#!/usr/bin/env node
/**
 * Vercel 部署准备脚本
 * 将 api/node_modules 中的关键包链接到根 node_modules
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Preparing for Vercel deployment...');

// 关键依赖包列表
const criticalPackages = [
  'qiniu',
  'formidable',
  'dotenv',
  'form-data',
  'node-fetch',
  '@supabase/supabase-js',
  'ioredis',
  'stripe'
];

const apiNodeModules = path.join(__dirname, '..', 'api', 'node_modules');
const rootNodeModules = path.join(__dirname, '..', 'node_modules');

console.log(`📦 Source: ${apiNodeModules}`);
console.log(`📦 Target: ${rootNodeModules}`);

// 确保根 node_modules 存在
if (!fs.existsSync(rootNodeModules)) {
  fs.mkdirSync(rootNodeModules, { recursive: true });
}

let successCount = 0;
let failCount = 0;

for (const pkg of criticalPackages) {
  const source = path.join(apiNodeModules, pkg);
  const target = path.join(rootNodeModules, pkg);
  
  if (fs.existsSync(source)) {
    try {
      // 如果目标已存在，先删除
      if (fs.existsSync(target)) {
        fs.rmSync(target, { recursive: true, force: true });
      }
      
      // 复制目录
      copyDir(source, target);
      console.log(`  ✅ ${pkg}`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ ${pkg}: ${error.message}`);
      failCount++;
    }
  } else {
    console.log(`  ⚠️  ${pkg} not found in api/node_modules`);
  }
}

console.log('\n📊 Summary:');
console.log(`  ✅ Success: ${successCount}`);
console.log(`  ❌ Failed: ${failCount}`);
console.log('\n🎉 Preparation complete!');

// 递归复制目录
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

