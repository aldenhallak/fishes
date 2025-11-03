/**
 * 七牛云文件上传类
 * 参考AIGF_web项目实现
 */

const qiniu = require('qiniu');
const { qiniuConfig } = require('./config');

/**
 * 生成七牛云存储key（文件路径）
 * @param {string} filename - 原始文件名
 * @param {string} dirPath - 目录路径
 * @returns {string} 生成的key
 */
function generateKey(filename, dirPath = '') {
  const ext = filename.split('.').pop() || 'png';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${dirPath}${timestamp}-${random}.${ext}`;
}

/**
 * 七牛云上传类
 */
class QiniuUploader {
  constructor(config = qiniuConfig) {
    this.config = config;
    
    // 验证配置
    if (!config.accessKey || !config.secretKey || !config.bucket) {
      throw new Error('七牛云配置不完整，请检查环境变量');
    }
    
    // 创建MAC凭证
    this.mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey);
    
    // 创建上传策略
    this.putPolicy = {
      scope: config.bucket,
    };
    
    // 生成上传token
    this.uploadToken = new qiniu.rs.PutPolicy(this.putPolicy).uploadToken(this.mac);
    
    // 配置zone
    const qnConfig = new qiniu.conf.Config();
    if (config.zone) {
      // 支持zone_z0(华东), zone_z1(华北), zone_z2(华南), zone_na0(北美), zone_as0(东南亚)
      const zoneMap = {
        'Zone_z0': qiniu.zone.Zone_z0,
        'Zone_z1': qiniu.zone.Zone_z1,
        'Zone_z2': qiniu.zone.Zone_z2,
        'Zone_na0': qiniu.zone.Zone_na0,
        'Zone_as0': qiniu.zone.Zone_as0
      };
      qnConfig.zone = zoneMap[config.zone] || qiniu.zone.Zone_na0;
      console.log('使用七牛云Zone:', config.zone);
    }
    
    // 创建上传器
    this.formUploader = new qiniu.form_up.FormUploader(qnConfig);
    this.bucketManager = new qiniu.rs.BucketManager(this.mac, qnConfig);
  }

  /**
   * 上传文件
   * @param {Buffer} fileData - 文件数据Buffer
   * @param {string} filename - 文件名
   * @param {Object} options - 上传选项
   * @param {string} options.category - 图片分类（fish/avatars/battle/temp）
   * @param {string} options.customKey - 自定义key（可选）
   * @returns {Promise<{path: string, url: string, key: string, category: string}>}
   */
  async uploadFile(fileData, filename = 'fish.png', options = {}) {
    // 支持旧的API: uploadFile(fileData, filename, key)
    const isLegacyCall = typeof options === 'string';
    const { category = 'fish', customKey = null } = isLegacyCall ? { customKey: options } : options;
    
    // 构建完整的目录路径（包含分类子目录）
    const fullDirPath = `${this.config.dirPath}${category}/`;
    
    const uploadKey = customKey || generateKey(filename, fullDirPath);
    
    console.log(`上传文件到分类: ${category}`);
    console.log(`完整路径: ${uploadKey}`);
    
    return new Promise((resolve, reject) => {
      this.formUploader.put(
        this.uploadToken,
        uploadKey,
        fileData,
        new qiniu.form_up.PutExtra(),
        (err, body, info) => {
          if (err) {
            console.error('七牛云上传错误:', err);
            return reject(err);
          }
          
          if (info.statusCode === 200) {
            const url = this.config.baseUrl 
              ? `${this.config.baseUrl}/${uploadKey}`
              : `http://${this.config.bucket}.qiniucdn.com/${uploadKey}`;
            
            resolve({
              path: '/' + uploadKey,
              url: url,
              key: uploadKey,
              hash: body.hash,
              category: category
            });
          } else {
            console.error('七牛云上传失败:');
            console.error('  状态码:', info.statusCode);
            console.error('  响应体:', JSON.stringify(body, null, 2));
            console.error('  响应信息:', JSON.stringify(info, null, 2));
            reject(new Error(`上传失败: ${info.statusCode} - ${body?.error || JSON.stringify(body)}`));
          }
        }
      );
    });
  }

  /**
   * 批量上传文件
   * @param {Array<{data: Buffer, filename: string}>} files - 文件数组
   * @returns {Promise<Array>}
   */
  async uploadFiles(files) {
    const results = [];
    for (const file of files) {
      const result = await this.uploadFile(file.data, file.filename);
      results.push(result);
    }
    return results;
  }

  /**
   * 删除文件
   * @param {string} key - 文件key
   * @returns {Promise<boolean>}
   */
  async deleteFile(key) {
    return new Promise((resolve, reject) => {
      this.bucketManager.delete(this.config.bucket, key, (err, respBody, respInfo) => {
        if (err) {
          console.error('删除文件失败:', err);
          return reject(err);
        }
        
        if (respInfo.statusCode === 200) {
          resolve(true);
        } else {
          reject(new Error(`删除失败: ${respInfo.statusCode}`));
        }
      });
    });
  }
}

module.exports = { QiniuUploader, generateKey };

