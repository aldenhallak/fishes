/**
 * 七牛云配置
 * 从环境变量读取配置信息
 */

require('dotenv').config({ path: '.env.local' });

const qiniuConfig = {
  accessKey: process.env.QINIU_ACCESS_KEY || '',
  secretKey: process.env.QINIU_SECRET_KEY || '',
  bucket: process.env.QINIU_BUCKET || '',
  baseUrl: process.env.QINIU_BASE_URL || '', // CDN域名，如: https://cdn.fishart.online
  dirPath: process.env.QINIU_DIR_PATH || 'fish/', // 存储目录，默认fish/
  zone: process.env.QINIU_ZONE || 'Zone_z2' // 华南区域，根据实际情况配置
};

module.exports = { qiniuConfig };

