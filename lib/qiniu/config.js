/**
 * 七牛云配置
 * 从环境变量读取配置信息
 * 
 * 注意：在 Vercel 中，环境变量通过 Dashboard 配置，不需要 dotenv
 */

const qiniuConfig = {
  accessKey: process.env.QINIU_ACCESS_KEY || '',
  secretKey: process.env.QINIU_SECRET_KEY || '',
  bucket: process.env.QINIU_BUCKET || '',
  baseUrl: process.env.QINIU_BASE_URL || process.env.QINIU_DOMAIN || '', // CDN域名，兼容QINIU_DOMAIN
  dirPath: process.env.QINIU_DIR_PATH || 'fish/', // 存储目录，默认fish/
  zone: process.env.QINIU_ZONE || 'Zone_z2' // 华南区域，根据实际情况配置
};

// 调试：显示配置状态（不显示密钥）
console.log('七牛云配置加载状态:');
console.log('  AccessKey:', qiniuConfig.accessKey ? '已设置' : '未设置');
console.log('  SecretKey:', qiniuConfig.secretKey ? '已设置' : '未设置');
console.log('  Bucket:', qiniuConfig.bucket || '未设置');
console.log('  BaseURL:', qiniuConfig.baseUrl || '未设置');
console.log('  DirPath:', qiniuConfig.dirPath);
console.log('  Zone:', qiniuConfig.zone);

module.exports = { qiniuConfig };

