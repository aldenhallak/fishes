/**
 * GraphQL 查询生成器
 * 根据表结构自动生成 GraphQL 查询和变更
 */

const { getTableInfo, isNumericType, isBooleanType } = require('./schema-parser');

/**
 * 获取表的默认排序字段
 */
function getDefaultSortField(tableName) {
  const tableInfo = getTableInfo(tableName);
  if (!tableInfo) {
    return 'id'; // 回退到默认值
  }
  
  // 优先使用 id 字段
  if (tableInfo.fields.some(f => f.name === 'id')) {
    return 'id';
  }
  
  // 对于 global_params 表，使用 key 字段
  if (tableName === 'global_params') {
    return 'key';
  }
  
  // 尝试使用 key 字段（如果存在）
  if (tableInfo.fields.some(f => f.name === 'key')) {
    return 'key';
  }
  
  // 使用第一个字段作为默认排序字段
  if (tableInfo.fields.length > 0) {
    return tableInfo.fields[0].name;
  }
  
  // 最后的回退
  return 'id';
}

/**
 * 生成 GET 查询
 */
function generateGetQuery(tableName, fields, orderBy, orderDirection) {
  const fieldList = fields.join('\n            ');
  
  // 如果没有指定排序字段，使用表的默认排序字段
  const sortField = orderBy || getDefaultSortField(tableName);
  const sortDir = orderDirection || 'desc';
  
  return `
    query Get${capitalizeFirst(tableName)}($limit: Int, $offset: Int) {
      ${tableName}(limit: $limit, offset: $offset, order_by: {${sortField}: ${sortDir}}) {
        ${fieldList}
      }
    }
  `;
}

/**
 * 生成 POST 插入 mutation
 */
function generateInsertMutation(tableName, data) {
  const tableInfo = getTableInfo(tableName);
  if (!tableInfo) {
    throw new Error(`Table ${tableName} not found in schema`);
  }

  const variableDefinitions = [];
  const objectFields = [];
  const variables = {};

  for (const field of tableInfo.fields) {
    if (['id', 'created_at', 'updated_at'].includes(field.name)) {
      continue;
    }

    if (data.hasOwnProperty(field.name)) {
      const value = data[field.name];
      const graphQLType = getGraphQLType(field);
      
      variableDefinitions.push(`$${field.name}: ${graphQLType}`);
      objectFields.push(`${field.name}: $${field.name}`);
      variables[field.name] = convertValue(value, field.type);
    }
  }

  const mutation = `
    mutation Insert${capitalizeFirst(tableName)}(
      ${variableDefinitions.join(',\n      ')}
    ) {
      insert_${tableName}_one(
        object: {
          ${objectFields.join(',\n          ')}
        }
      ) {
        ${tableInfo.fields.map(f => f.name).join('\n        ')}
      }
    }
  `;

  return { mutation, variables };
}

/**
 * 获取表的主键字段
 */
function getPrimaryKeyFieldName(tableName) {
  const tableInfo = getTableInfo(tableName);
  if (!tableInfo) {
    return 'id'; // 回退到默认值
  }
  
  // 优先使用 id 字段
  if (tableInfo.fields.some(f => f.name === 'id')) {
    return 'id';
  }
  
  // 对于 global_params 表，使用 key 字段
  if (tableName === 'global_params') {
    return 'key';
  }
  
  // 尝试使用 key 字段（如果存在）
  if (tableInfo.fields.some(f => f.name === 'key')) {
    return 'key';
  }
  
  // 使用第一个字段作为主键
  if (tableInfo.fields.length > 0) {
    return tableInfo.fields[0].name;
  }
  
  // 最后的回退
  return 'id';
}

/**
 * 生成 PUT 更新 mutation
 */
function generateUpdateMutation(tableName, pkValue, data) {
  const tableInfo = getTableInfo(tableName);
  if (!tableInfo) {
    throw new Error(`Table ${tableName} not found in schema`);
  }

  // 获取主键字段名
  const pkFieldName = getPrimaryKeyFieldName(tableName);
  
  // 检测主键字段类型
  const pkField = tableInfo.fields.find(f => f.name === pkFieldName);
  const pkType = pkField ? pkField.type : 'bigint';
  
  const variableDefinitions = [`$pkValue: ${pkType}!`];
  const setFields = [];
  const variables = { pkValue: convertId(pkValue, pkType) };

  for (const field of tableInfo.fields) {
    if ([pkFieldName, 'created_at', 'updated_at'].includes(field.name)) {
      continue;
    }

    if (data.hasOwnProperty(field.name)) {
      const value = data[field.name];
      const graphQLType = getGraphQLType(field);
      
      variableDefinitions.push(`$${field.name}: ${graphQLType}`);
      setFields.push(`${field.name}: $${field.name}`);
      variables[field.name] = convertValue(value, field.type);
    }
  }

  if (setFields.length === 0) {
    throw new Error('No fields to update');
  }

  const mutation = `
    mutation Update${capitalizeFirst(tableName)}(
      ${variableDefinitions.join(',\n      ')}
    ) {
      update_${tableName}_by_pk(
        pk_columns: { ${pkFieldName}: $pkValue }
        _set: {
          ${setFields.join(',\n          ')}
        }
      ) {
        ${tableInfo.fields.map(f => f.name).join('\n        ')}
      }
    }
  `;

  return { mutation, variables };
}

/**
 * 生成 DELETE 删除 mutation（单个）
 */
function generateDeleteMutation(tableName, pkValue) {
  const tableInfo = getTableInfo(tableName);
  if (!tableInfo) {
    throw new Error(`Table ${tableName} not found in schema`);
  }

  // 获取主键字段名
  const pkFieldName = getPrimaryKeyFieldName(tableName);
  
  // 检测主键字段类型
  const pkField = tableInfo.fields.find(f => f.name === pkFieldName);
  const pkType = pkField ? pkField.type : 'bigint';

  const mutation = `
    mutation Delete${capitalizeFirst(tableName)}($pkValue: ${pkType}!) {
      delete_${tableName}_by_pk(${pkFieldName}: $pkValue) {
        ${pkFieldName}
      }
    }
  `;

  return {
    mutation,
    variables: { pkValue: convertId(pkValue, pkType) }
  };
}

/**
 * 生成批量删除 mutation
 */
function generateBatchDeleteMutation(tableName, pkValues) {
  const tableInfo = getTableInfo(tableName);
  if (!tableInfo) {
    throw new Error(`Table ${tableName} not found in schema`);
  }

  // 获取主键字段名
  const pkFieldName = getPrimaryKeyFieldName(tableName);
  
  // 检测主键字段类型
  const pkField = tableInfo.fields.find(f => f.name === pkFieldName);
  const pkType = pkField ? pkField.type : 'bigint';

  const mutation = `
    mutation BatchDelete${capitalizeFirst(tableName)}($pkValues: [${pkType}!]!) {
      delete_${tableName}(where: {${pkFieldName}: {_in: $pkValues}}) {
        affected_rows
        returning {
          ${pkFieldName}
        }
      }
    }
  `;

  return {
    mutation,
    variables: { pkValues: pkValues.map(pk => convertId(pk, pkType)) }
  };
}

/**
 * 获取字段的 GraphQL 类型
 */
function getGraphQLType(field) {
  let type = field.type;
  
  if (field.isArray) {
    type = `[${type}!]`;
  }
  
  if (!field.isNullable) {
    type = `${type}!`;
  }
  
  return type;
}

/**
 * 转换值为合适的类型
 */
function convertValue(value, fieldType) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (isNumericType(fieldType)) {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  if (isBooleanType(fieldType)) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  }

  return String(value);
}

/**
 * 转换为数字（用于 ID）
 */
function convertToNumber(value) {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Invalid ID: ${value}`);
  }
  return num;
}

/**
 * 转换ID为合适的类型
 */
function convertId(value, idType) {
  // UUID类型保持字符串
  if (idType === 'uuid') {
    return String(value);
  }
  
  // String类型保持字符串
  if (idType === 'String') {
    return String(value);
  }
  
  // bigint和其他数字类型转换为数字
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Invalid ID: ${value}`);
  }
  return num;
}

/**
 * 首字母大写
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  generateGetQuery,
  generateInsertMutation,
  generateUpdateMutation,
  generateDeleteMutation,
  generateBatchDeleteMutation,
  getPrimaryKeyFieldName
};

