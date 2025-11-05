/**
 * GraphQL 查询生成器
 * 根据表结构自动生成 GraphQL 查询和变更
 */

const { getTableInfo, isNumericType, isBooleanType } = require('./schema-parser');

/**
 * 生成 GET 查询
 */
function generateGetQuery(tableName, fields, orderBy, orderDirection) {
  const fieldList = fields.join('\n            ');
  
  const sortField = orderBy || 'id';
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
 * 生成 PUT 更新 mutation
 */
function generateUpdateMutation(tableName, id, data) {
  const tableInfo = getTableInfo(tableName);
  if (!tableInfo) {
    throw new Error(`Table ${tableName} not found in schema`);
  }

  // 检测ID字段类型
  const idField = tableInfo.fields.find(f => f.name === 'id');
  const idType = idField ? idField.type : 'bigint';
  
  const variableDefinitions = [`$id: ${idType}!`];
  const setFields = [];
  const variables = { id: convertId(id, idType) };

  for (const field of tableInfo.fields) {
    if (['id', 'created_at', 'updated_at'].includes(field.name)) {
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
        pk_columns: { id: $id }
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
function generateDeleteMutation(tableName, id) {
  const tableInfo = getTableInfo(tableName);
  if (!tableInfo) {
    throw new Error(`Table ${tableName} not found in schema`);
  }

  // 检测ID字段类型
  const idField = tableInfo.fields.find(f => f.name === 'id');
  const idType = idField ? idField.type : 'bigint';

  const mutation = `
    mutation Delete${capitalizeFirst(tableName)}($id: ${idType}!) {
      delete_${tableName}_by_pk(id: $id) {
        id
      }
    }
  `;

  return {
    mutation,
    variables: { id: convertId(id, idType) }
  };
}

/**
 * 生成批量删除 mutation
 */
function generateBatchDeleteMutation(tableName, ids) {
  const tableInfo = getTableInfo(tableName);
  if (!tableInfo) {
    throw new Error(`Table ${tableName} not found in schema`);
  }

  // 检测ID字段类型
  const idField = tableInfo.fields.find(f => f.name === 'id');
  const idType = idField ? idField.type : 'bigint';

  const mutation = `
    mutation BatchDelete${capitalizeFirst(tableName)}($ids: [${idType}!]!) {
      delete_${tableName}(where: {id: {_in: $ids}}) {
        affected_rows
        returning {
          id
        }
      }
    }
  `;

  return {
    mutation,
    variables: { ids: ids.map(id => convertId(id, idType)) }
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
  generateBatchDeleteMutation
};

