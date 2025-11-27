/**
 * Admin Table Dynamic Route - 处理单个表的数据操作
 * 路由: /api/admin/tables/{tableName}
 * 支持: GET (查询), PUT (更新), DELETE (删除)
 */

const tableHandler = require('../../../lib/api_handlers/admin/tables/[tableName].js');

module.exports = async function handler(req, res) {
  try {
    // 从 URL 路径提取 tableName
    // URL 格式: /api/admin/tables/{tableName}
    const pathParts = req.url.split('?')[0].split('/');
    const tableName = pathParts[pathParts.length - 1];
    
    if (!tableName || tableName === 'tables') {
      return res.status(400).json({ 
        success: false,
        error: '缺少表名参数' 
      });
    }
    
    // 将 tableName 添加到 req.query 中，以便后端处理器使用
    req.query = req.query || {};
    req.query.tableName = tableName;
    
    return await tableHandler(req, res);
  } catch (error) {
    console.error('[Admin Table API] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

