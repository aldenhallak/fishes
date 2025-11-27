/**
 * Admin Tables API - 获取数据库表列表
 * 路由: /api/admin/tables
 */

const tablesHandler = require('../../lib/api_handlers/admin/tables.js');

module.exports = async function handler(req, res) {
  try {
    return await tablesHandler(req, res);
  } catch (error) {
    console.error('[Admin Tables API] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

