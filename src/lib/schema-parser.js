/**
 * GraphQL Schema 解析器
 * 从 schema.graphql 文件中提取表和字段信息
 */

const fs = require('fs');
const path = require('path');

// Schema 缓存
let schemaCache = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 读取 GraphQL Schema 文件
 */
function readSchemaFile() {
  const schemaPath = path.join(process.cwd(), 'graphql', 'schema.graphql');
  return fs.readFileSync(schemaPath, 'utf-8');
}

/**
 * 从 type 定义中提取字段信息
 */
function parseTypeFields(typeDefinition) {
  const fields = [];
  const lines = typeDefinition.split('\n');
  
  let currentDescription = '';
  let skipUntilCloseParen = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (skipUntilCloseParen) {
      if (trimmed.includes('): ')) {
        skipUntilCloseParen = false;
      }
      continue;
    }
    
    if (trimmed.startsWith('"""')) {
      const desc = trimmed.replace(/"""/g, '').trim();
      if (desc) currentDescription = desc;
      continue;
    }
    
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    if (trimmed.match(/^\w+\(/)) {
      skipUntilCloseParen = true;
      currentDescription = '';
      continue;
    }
    
    const fieldMatch = trimmed.match(/^(\w+):\s*(\[?)([\w!]+)(\]?)(!?)/);
    if (fieldMatch) {
      const [, name, arrayStart, rawType, arrayEnd, notNull] = fieldMatch;
      
      const type = rawType.replace('!', '');
      const isArray = arrayStart === '[' && arrayEnd === ']';
      const isNullable = notNull !== '!';
      
      const scalarTypes = [
        'String', 'Int', 'Float', 'Boolean', 'ID',
        'bigint', 'float8', 'numeric', 'smallint',
        'timestamptz', 'timestamp', 'date', 'time', 'timetz',
        'uuid', 'jsonb', 'json', 'bytea', 'inet', 'cidr'
      ];
      
      const isRelation = 
        !scalarTypes.includes(type) ||
        name.includes('_aggregate') ||
        name.includes('_connection');
      
      fields.push({
        name,
        type,
        isNullable,
        isArray,
        isRelation,
        description: currentDescription || undefined,
      });
      
      currentDescription = '';
    }
  }
  
  return fields;
}

/**
 * 从 query_root 中提取所有表名
 */
function extractTableNames(schema) {
  const queryRootMatch = schema.match(/type query_root \{([\s\S]*?)\n\}/);
  if (!queryRootMatch) return [];
  
  const queryRoot = queryRootMatch[1];
  const tableNames = new Set();
  
  const lines = queryRoot.split('\n');
  let currentField = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('"""') || line.startsWith('#') || !line) {
      continue;
    }
    
    const fieldStart = line.match(/^(\w+)\(/);
    if (fieldStart) {
      currentField = fieldStart[1];
      continue;
    }
    
    if (currentField) {
      const returnTypeMatch = line.match(/^\):\s*\[(\w+)!\]!/);
      if (returnTypeMatch) {
        const returnType = returnTypeMatch[1];
        if (currentField === returnType && 
            !currentField.endsWith('_aggregate') && 
            !currentField.endsWith('_by_pk')) {
          tableNames.add(currentField);
        }
        currentField = '';
      }
    }
  }
  
  return Array.from(tableNames).sort();
}

/**
 * 解析单个表的结构
 */
function parseTableStructure(schema, tableName) {
  const commentPattern = new RegExp(`"""([^"]+)"""\\s*type ${tableName} \\{`);
  const commentMatch = schema.match(commentPattern);
  const description = commentMatch ? commentMatch[1] : undefined;
  
  const typePattern = new RegExp(`type ${tableName} \\{([\\s\\S]*?)\\n\\}`, 'i');
  const typeMatch = schema.match(typePattern);
  
  if (!typeMatch) {
    return null;
  }
  
  const fields = parseTypeFields(typeMatch[1]);
  
  return {
    name: tableName,
    fields: fields.filter(f => !f.isRelation),
    description,
  };
}

/**
 * 解析整个 Schema
 */
function parseSchema() {
  const schema = readSchemaFile();
  const tableNames = extractTableNames(schema);
  const tables = new Map();
  
  for (const tableName of tableNames) {
    const tableInfo = parseTableStructure(schema, tableName);
    if (tableInfo) {
      tables.set(tableName, tableInfo);
    }
  }
  
  return tables;
}

/**
 * 获取所有表信息（带缓存）
 */
function getAllTables() {
  const now = Date.now();
  
  if (schemaCache && (now - schemaCache.lastParsed) < CACHE_DURATION) {
    return schemaCache.tables;
  }
  
  const tables = parseSchema();
  
  schemaCache = {
    tables,
    lastParsed: now,
  };
  
  return tables;
}

/**
 * 获取单个表信息
 */
function getTableInfo(tableName) {
  const tables = getAllTables();
  return tables.get(tableName) || null;
}

/**
 * 获取所有表名列表
 */
function getTableNames() {
  const tables = getAllTables();
  return Array.from(tables.keys()).sort();
}

/**
 * 清除缓存
 */
function clearCache() {
  schemaCache = null;
}

/**
 * 生成 GraphQL 查询字段列表
 */
function getQueryFields(tableName) {
  const tableInfo = getTableInfo(tableName);
  if (!tableInfo) return [];
  
  return tableInfo.fields.map(f => f.name);
}

/**
 * 判断字段类型是否为数字类型
 */
function isNumericType(type) {
  return ['Int', 'Float', 'bigint', 'float8', 'numeric'].includes(type);
}

/**
 * 判断字段类型是否为布尔类型
 */
function isBooleanType(type) {
  return type === 'Boolean';
}

/**
 * 判断字段类型是否为日期时间类型
 */
function isDateTimeType(type) {
  return ['timestamptz', 'timestamp', 'date', 'time'].includes(type);
}

module.exports = {
  parseSchema,
  getAllTables,
  getTableInfo,
  getTableNames,
  clearCache,
  getQueryFields,
  isNumericType,
  isBooleanType,
  isDateTimeType
};











