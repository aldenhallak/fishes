#!/usr/bin/env node
/**
 * 环境变量检查脚本
 * 验证所有必需的环境变量是否正确配置
 */

require('dotenv').config({ path: '.env.local' });

const requiredEnvVars = {
  // Hasura配置
  'HASURA_GRAPHQL_ENDPOINT': {
    required: true,
    description: 'Hasura GraphQL端点URL',
    example: 'https://your-hasura.hasura.app/v1/graphql'
  },
  'HASURA_ADMIN_SECRET': {
    required: true,
    description: 'Hasura管理员密钥',
    example: 'your-admin-secret'
  },
  
  // 七牛云配置
  'QINIU_ACCESS_KEY': {
    required: true,
    description: '七牛云AccessKey',
    example: 'your-access-key'
  },
  'QINIU_SECRET_KEY': {
    required: true,
    description: '七牛云SecretKey',
    example: 'your-secret-key'
  },
  'QINIU_BUCKET': {
    required: true,
    description: '七牛云存储桶名称',
    example: 'your-bucket-name'
  },
  'QINIU_BASE_URL': {
    required: true,
    description: '七牛云CDN域名',
    example: 'https://cdn.example.com'
  },
  'QINIU_DIR_PATH': {
    required: false,
    description: '七牛云存储目录前缀',
    example: 'fish/',
    default: 'fish/'
  },
  'QINIU_ZONE': {
    required: false,
    description: '七牛云存储区域',
    example: 'Zone_z2',
    default: 'Zone_z2'
  },
  
  // Supabase配置
  'SUPABASE_URL': {
    required: true,
    description: 'Supabase项目URL',
    example: 'https://xxxxx.supabase.co'
  },
  'SUPABASE_ANON_KEY': {
    required: true,
    description: 'Supabase匿名密钥',
    example: 'your-anon-key'
  }
};

console.log('='.repeat(70));
console.log('环境变量检查报告');
console.log('='.repeat(70));
console.log();

let hasErrors = false;
let hasWarnings = false;

for (const [varName, config] of Object.entries(requiredEnvVars)) {
  const value = process.env[varName];
  const isSet = !!value;
  
  let status = '✅';
  let message = 'OK';
  
  if (config.required && !isSet) {
    status = '❌';
    message = `缺失（必需）`;
    hasErrors = true;
  } else if (!config.required && !isSet) {
    status = '⚠️';
    message = `未设置（可选，默认: ${config.default || 'N/A'}）`;
    hasWarnings = true;
  } else if (isSet) {
    // 显示部分值（隐藏敏感信息）
    const displayValue = value.length > 20 
      ? value.substring(0, 10) + '...' + value.substring(value.length - 5)
      : value;
    message = `已设置: ${displayValue}`;
  }
  
  console.log(`${status} ${varName}`);
  console.log(`   描述: ${config.description}`);
  console.log(`   状态: ${message}`);
  
  if (!isSet && config.example) {
    console.log(`   示例: ${config.example}`);
  }
  
  console.log();
}

console.log('='.repeat(70));
console.log('检查结果总结');
console.log('='.repeat(70));

if (!hasErrors && !hasWarnings) {
  console.log('✅ 所有环境变量配置正确！');
  process.exit(0);
} else {
  if (hasErrors) {
    console.log('❌ 发现缺失的必需环境变量，请在以下位置配置：');
    console.log('   - 本地开发: 在 .env.local 文件中添加');
    console.log('   - Vercel部署: 在 Vercel Dashboard > Settings > Environment Variables 中添加');
    console.log();
  }
  
  if (hasWarnings) {
    console.log('⚠️ 部分可选环境变量未设置，将使用默认值');
  }
  
  process.exit(hasErrors ? 1 : 0);
}

