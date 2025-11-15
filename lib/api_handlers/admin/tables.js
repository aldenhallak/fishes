/**
 * 获取所有数据表信息
 * GET /api/admin/tables
 */

require('dotenv').config({ path: '.env.local' });

const { getTableNames } = require('../../../src/lib/schema-parser');
const { getTableConfig } = require('../../../src/config/table-config');

module.exports = async (req, res) => {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // 从 Schema 自动发现所有表
    const tableNames = getTableNames();
    
    // 获取每个表的配置信息
    const tables = tableNames.map(tableName => ({
      name: tableName,
      config: getTableConfig(tableName)
    }));

    return res.status(200).json({
      success: true,
      data: {
        tables: tables.map(t => t.name),
        configs: Object.fromEntries(
          tables.map(t => [t.name, t.config])
        )
      }
    });

  } catch (error) {
    console.error('Failed to get table info:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get table info',
      details: error.message || 'Unknown error'
    });
  }
};

