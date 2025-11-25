/**
 * 数据表管理API
 * 支持 GET（查询）、POST（创建）、PUT（更新）、DELETE（删除）操作
 */

require('dotenv').config({ path: '.env.local' });

const { getTableInfo, getQueryFields, clearCache } = require('../../../../src/lib/schema-parser');
const { getTablePermissions, getBatchDeleteLimit, isDangerousTable } = require('../../../../src/config/table-config');
const { 
  generateGetQuery, 
  generateInsertMutation, 
  generateUpdateMutation,
  generateDeleteMutation,
  generateBatchDeleteMutation,
  getPrimaryKeyFieldName
} = require('../../../../src/lib/query-generator');

// 创建 Hasura 客户端（使用现有的 hasura.js）
const fetch = require('node-fetch');

async function executeGraphQL(query, variables = {}) {
  const HASURA_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
  const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;
  
  if (!HASURA_ENDPOINT) {
    throw new Error('HASURA_GRAPHQL_ENDPOINT not configured');
  }

  const response = await fetch(HASURA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(HASURA_ADMIN_SECRET ? { 'x-hasura-admin-secret': HASURA_ADMIN_SECRET } : {})
    },
    body: JSON.stringify({ query, variables })
  });

  const result = await response.json();
  
  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error(result.errors[0]?.message || 'GraphQL query failed');
  }

  return result.data;
}

module.exports = async (req, res) => {
  const { tableName } = req.query;
  
  if (!tableName) {
    return res.status(400).json({
      success: false,
      error: '缺少表名参数'
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, tableName);
      case 'POST':
        return await handlePost(req, res, tableName);
      case 'PUT':
        return await handlePut(req, res, tableName);
      case 'DELETE':
        return await handleDelete(req, res, tableName);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '操作失败',
      details: error.stack
    });
  }
};

/**
 * 获取指定表的数据和结构信息
 */
async function handleGet(req, res, tableName) {
  const { limit = 50, offset = 0, order_by, order_direction, clearCache: shouldClearCache } = req.query;

  // 如果需要清除缓存，先清除
  if (shouldClearCache === 'true') {
    clearCache();
  }

  // 获取表信息
  const tableInfo = getTableInfo(tableName);
  if (!tableInfo) {
    return res.status(404).json({
      success: false,
      error: `表 ${tableName} 不存在或未在 Schema 中定义`
    });
  }

  // 检查读取权限
  const permissions = getTablePermissions(tableName);
  if (!permissions.read) {
    return res.status(403).json({
      success: false,
      error: `没有权限读取表 ${tableName}`
    });
  }

  // 生成查询字段列表
  const fields = getQueryFields(tableName);
  if (fields.length === 0) {
    return res.status(400).json({
      success: false,
      error: `表 ${tableName} 没有可查询的字段`
    });
  }

  // 生成并执行查询（带排序参数）
  const query = generateGetQuery(tableName, fields, order_by, order_direction);
  
  const result = await executeGraphQL(query, { 
    limit: parseInt(limit), 
    offset: parseInt(offset) 
  });

  const tableData = result[tableName] || [];
  
  // 返回完整的列信息（包含类型），而不仅仅是字段名
  const columnInfo = tableInfo.fields
    .filter(f => !f.isRelation)
    .map(f => ({
      name: f.name,
      type: f.type,
      isNullable: f.isNullable
    }));

  return res.status(200).json({
    success: true,
    data: {
      tableName,
      columns: columnInfo,
      rows: tableData,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: tableData.length === parseInt(limit)
      }
    }
  });
}

/**
 * 创建新记录
 */
async function handlePost(req, res, tableName) {
  const { data } = req.body;

  if (!data || typeof data !== 'object') {
    return res.status(400).json({
      success: false,
      error: '请求格式错误，需要 data 对象'
    });
  }

  // 检查创建权限
  const permissions = getTablePermissions(tableName);
  if (!permissions.create) {
    return res.status(403).json({
      success: false,
      error: `没有权限在表 ${tableName} 中创建记录`
    });
  }

  // 生成并执行插入 mutation
  const { mutation, variables } = generateInsertMutation(tableName, data);
  
  const result = await executeGraphQL(mutation, variables);

  const resultKey = `insert_${tableName}_one`;
  if (!result[resultKey]) {
    return res.status(500).json({
      success: false,
      error: '创建记录失败'
    });
  }

  return res.status(200).json({
    success: true,
    data: result[resultKey]
  });
}

/**
 * 批量更新表数据
 */
async function handlePut(req, res, tableName) {
  const { updates } = req.body;

  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({
      success: false,
      error: '请求格式错误，需要 updates 数组'
    });
  }

  // 检查更新权限
  const permissions = getTablePermissions(tableName);
  if (!permissions.update) {
    return res.status(403).json({
      success: false,
      error: `没有权限更新表 ${tableName}`
    });
  }

  const results = [];
  
  // 获取主键字段名
  const pkFieldName = getPrimaryKeyFieldName(tableName);

  // 逐个更新记录
  for (const update of updates) {
    // 从更新对象中提取主键值（可能是 id 或其他字段名）
    const pkValue = update[pkFieldName] || update.id;
    
    if (!pkValue) {
      results.push({
        [pkFieldName]: null,
        success: false,
        error: `缺少主键字段 ${pkFieldName}`
      });
      continue;
    }

    // 提取需要更新的字段（排除主键字段）
    const fields = { ...update };
    delete fields[pkFieldName];
    delete fields.id; // 也删除可能的 id 字段

    try {
      // 如果没有字段需要更新，跳过
      if (Object.keys(fields).length === 0) {
        results.push({
          [pkFieldName]: pkValue,
          success: true,
          result: { message: '没有需要更新的字段' }
        });
        continue;
      }

      const { mutation, variables } = generateUpdateMutation(tableName, pkValue, fields);
      
      const result = await executeGraphQL(mutation, variables);

      const resultKey = `update_${tableName}_by_pk`;
      results.push({
        [pkFieldName]: pkValue,
        success: true,
        result: result[resultKey]
      });
    } catch (updateError) {
      console.error(`更新记录 ${pkValue} 失败:`, updateError);
      results.push({
        [pkFieldName]: pkValue,
        success: false,
        error: updateError.message || '更新失败'
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  // 收集失败的错误信息
  const errors = results.filter(r => !r.success).map(r => r.error);
  const errorMessage = errors.length > 0 ? errors.join('; ') : null;

  return res.status(200).json({
    success: failureCount === 0,
    error: failureCount > 0 ? errorMessage || '部分记录更新失败' : undefined,
    data: {
      successCount,
      failureCount,
      results
    }
  });
}

/**
 * 删除记录（支持单个和批量）
 */
async function handleDelete(req, res, tableName) {
  const { id, ids } = req.query;

  // 检查删除权限
  const permissions = getTablePermissions(tableName);
  if (!permissions.delete) {
    return res.status(403).json({
      success: false,
      error: `没有权限删除表 ${tableName} 中的记录`
    });
  }

  // 批量删除
  if (ids) {
    const idArray = ids.split(',').map(i => i.trim()).filter(Boolean);
    
    if (idArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: '没有提供要删除的 ID'
      });
    }

    // 检查批量删除数量限制
    const limit = getBatchDeleteLimit(tableName);
    if (idArray.length > limit) {
      return res.status(400).json({
        success: false,
        error: `批量删除数量超过限制`,
        details: `一次最多删除 ${limit} 条记录，当前尝试删除 ${idArray.length} 条`
      });
    }

    // 危险表需要额外确认（前端应该已经确认，这里再次检查）
    if (isDangerousTable(tableName)) {
      const confirmHeader = req.headers['x-confirm-dangerous-delete'];
      if (confirmHeader !== 'confirmed') {
        return res.status(400).json({
          success: false,
          error: '删除危险表数据需要确认',
          isDangerous: true,
          tableName,
          count: idArray.length
        });
      }
    }

    try {
      // 注意：如果遇到外键约束错误，请先在数据库中解除相关外键约束

      const { mutation, variables } = generateBatchDeleteMutation(tableName, idArray);
      
      const result = await executeGraphQL(mutation, variables);

      const resultKey = `delete_${tableName}`;
      const deleteResult = result[resultKey];
      
      // 获取主键字段名
      const pkFieldName = getPrimaryKeyFieldName(tableName);

      return res.status(200).json({
        success: true,
        data: {
          affectedRows: deleteResult.affected_rows,
          deletedIds: deleteResult.returning.map((r) => r[pkFieldName])
        }
      });
    } catch (deleteError) {
      console.error('批量删除失败:', deleteError);
      return res.status(500).json({
        success: false,
        error: '批量删除失败',
        details: deleteError.message || '未知错误'
      });
    }
  }
  
  // 单个删除
  if (id) {
    try {
      const { mutation, variables } = generateDeleteMutation(tableName, id);
      
      const result = await executeGraphQL(mutation, variables);

      const resultKey = `delete_${tableName}_by_pk`;
      
      if (!result[resultKey]) {
        return res.status(404).json({
          success: false,
          error: '记录不存在或已被删除'
        });
      }

      return res.status(200).json({
        success: true,
        data: result[resultKey]
      });
    } catch (deleteError) {
      console.error('删除记录失败:', deleteError);
      return res.status(500).json({
        success: false,
        error: '删除记录失败',
        details: deleteError.message || '未知错误'
      });
    }
  }

  // 没有提供 id 或 ids
  return res.status(400).json({
    success: false,
    error: '缺少参数：需要提供 id 或 ids'
  });
}

