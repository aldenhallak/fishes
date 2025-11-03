/**
 * 图片上传API
 * POST /api/fish/upload
 * 接受 multipart/form-data 图片上传
 * 返回图片URL
 * 
 * 使用七牛云对象存储
 */

require('dotenv').config({ path: '.env.local' });
const { QiniuUploader } = require('../../lib/qiniu/uploader');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 使用 formidable 解析multipart数据
    const { formidable } = require('formidable');
    const fs = require('fs');

    console.log('开始解析上传请求...');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);

    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      keepExtensions: true
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Formidable解析错误:', err);
          reject(err);
        } else {
          console.log('解析成功，files:', Object.keys(files));
          resolve([fields, files]);
        }
      });
    });

    const imageFile = files.image ? files.image[0] : null;

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        error: '未找到图片文件'
      });
    }

    // 读取文件内容
    const fileBuffer = fs.readFileSync(imageFile.filepath);
    const originalName = imageFile.originalFilename || 'fish.png';
    
    // 获取分类参数（从表单字段或URL判断）
    const { detectCategory } = require('../../lib/qiniu/categories');
    const category = detectCategory({
      url: req.url,
      type: fields.type?.[0] || fields.category?.[0],
      referer: req.headers.referer || req.headers.referrer
    });
    
    console.log('检测到的图片分类:', category);
    
    // 创建七牛云上传器
    const uploader = new QiniuUploader();
    
    // 上传到七牛云，传入分类
    const result = await uploader.uploadFile(fileBuffer, originalName, {
      category
    });
    
    // 清理临时文件
    fs.unlinkSync(imageFile.filepath);

    return res.status(200).json({
      success: true,
      imageUrl: result.url,
      data: {
        path: result.path,
        key: result.key,
        hash: result.hash,
        url: result.url,
        category: result.category
      }
    });

  } catch (error) {
    console.error('上传图片错误:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '上传失败'
    });
  }
};

