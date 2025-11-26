/**
 * 图片上传API
 * POST /api/fish-api?action=upload
 * 接受 multipart/form-data 图片上传
 * 返回图片URL
 * 
 * 使用七牛云对象存储
 */

require('dotenv').config({ path: '.env.local' });
const { QiniuUploader } = require('../../qiniu/uploader');

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

    console.log('[上传API] 开始解析上传请求...');
    console.log('[上传API] Content-Type:', req.headers['content-type']);
    console.log('[上传API] Content-Length:', req.headers['content-length']);

    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      keepExtensions: true
    });

    console.log('[上传API] 开始formidable解析...');
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('[上传API] Formidable解析错误:', err);
          reject(err);
        } else {
          console.log('[上传API] 解析成功，files:', Object.keys(files));
          resolve([fields, files]);
        }
      });
    });
    console.log('[上传API] formidable解析完成');

    const imageFile = files.image ? files.image[0] : null;

    if (!imageFile) {
      console.log('[上传API] 未找到图片文件');
      return res.status(400).json({
        success: false,
        error: '未找到图片文件'
      });
    }

    // 读取文件内容
    console.log('[上传API] 读取文件:', imageFile.filepath);
    const fileBuffer = fs.readFileSync(imageFile.filepath);
    console.log('[上传API] 文件大小:', fileBuffer.length, '字节');
    const originalName = imageFile.originalFilename || 'fish.png';
    
    // 获取分类参数（从表单字段或URL判断）
    const { detectCategory } = require('../../qiniu/categories');
    const category = detectCategory({
      url: req.url,
      type: fields.type?.[0] || fields.category?.[0],
      referer: req.headers.referer || req.headers.referrer
    });
    
    console.log('[上传API] 检测到的图片分类:', category);
    
    // 创建七牛云上传器
    console.log('[上传API] 创建七牛云上传器...');
    const uploader = new QiniuUploader();
    console.log('[上传API] 七牛云上传器创建成功');
    
    // 上传到七牛云，传入分类
    console.log('[上传API] 开始上传到七牛云...');
    const result = await uploader.uploadFile(fileBuffer, originalName, {
      category
    });
    console.log('[上传API] 七牛云上传成功:', result.url);
    
    // 清理临时文件
    fs.unlinkSync(imageFile.filepath);
    console.log('[上传API] 临时文件已清理');

    console.log('[上传API] 返回成功响应');
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
    console.error('[上传API] ❌ 上传图片错误:', error);
    console.error('[上传API] 错误堆栈:', error.stack);
    return res.status(500).json({
      success: false,
      error: error.message || '上传失败'
    });
  }
};

