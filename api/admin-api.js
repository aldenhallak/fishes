/**
 * Admin API Router - 合并所有管理员相关端点
 * 
 * 支持的 actions:
 * - tables: 表管理
 * - table-detail: 表详情（动态路由）
 */

const tablesHandler = require('../lib/api_handlers/admin/tables');

module.exports = async function handler(req, res) {
  const { action, tableName } = req.query;
  
  try {
    if (action === 'tables') {
      return await tablesHandler(req, res);
    } else if (action === 'table-detail' && tableName) {
      // 动态加载表详情处理器
      const tableDetailHandler = require(`../lib/api_handlers/admin/tables/${tableName}`);
      return await tableDetailHandler(req, res);
    } else {
      return res.status(400).json({ 
        error: 'Invalid action',
        available: ['tables', 'table-detail (requires tableName parameter)']
      });
    }
  } catch (error) {
    console.error('[Admin API] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

