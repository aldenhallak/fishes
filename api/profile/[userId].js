/**
 * Profile API Wrapper - 包装 lib/api_handlers/profile/[userId].js
 * 用于 Vercel Serverless Functions（需要文件在 api/ 目录下）
 * 
 * 路由: PUT /api/profile/{userId}
 */

// 重新导出 lib/api_handlers/profile/[userId].js 的处理函数
module.exports = require('../../lib/api_handlers/profile/[userId].js');

