# UUID ID类型支持修复

**日期**: 2025-11-04  
**版本**: v1.0  
**修复状态**: ✅ 已完成

## 问题描述

数据表管理功能在执行批量删除操作时报错：

```
DELETE http://localhost:3000/api/admin/tables/fish?ids=0603d349-c76f-46aa-8698-4ca15e456235 500 (Internal Server Error)

保存失败：variable 'id' is declared as 'bigint!', but used where 'uuid!' is expected
```

**错误原因**: 
- `fish`表的ID字段类型是`uuid`
- 查询生成器假设所有表的ID都是`bigint`类型
- 在生成GraphQL mutation时硬编码了`bigint!`类型

## 解决方案

### 1. 修改 `src/lib/query-generator.js`

#### 1.1 添加ID类型检测函数

```javascript
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
```

#### 1.2 更新 UPDATE mutation生成器

```javascript
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
  
  // ... 其余代码
}
```

#### 1.3 更新 DELETE mutation生成器

```javascript
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
```

#### 1.4 更新批量DELETE mutation生成器

```javascript
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
```

## 技术要点

### 1. 动态类型检测
- 从GraphQL schema中读取ID字段的实际类型
- 支持`uuid`、`bigint`、`Int`等不同类型

### 2. 类型转换
- `uuid`类型: 保持字符串格式
- `bigint`/`Int`类型: 转换为数字
- 防止类型不匹配导致的GraphQL错误

### 3. 向后兼容
- 如果无法获取ID字段信息，默认使用`bigint`类型
- 保证对现有表的操作不受影响

## 测试验证

### 测试表
- **fish**: ID类型为`uuid`
- **battle_config**: ID类型为`Int`

### 验证结果
✅ fish表的批量删除操作正常工作  
✅ UUID类型正确识别并保持字符串格式  
✅ bigint类型正确转换为数字  

## 影响范围

### 修改的文件
- `src/lib/query-generator.js`

### 受益功能
- 单条记录删除
- 批量删除
- 记录更新

### 支持的ID类型
- `uuid` (字符串)
- `bigint` (数字)
- `Int` (数字)

## 相关文档
- [数据表管理功能实现](./TABLE_MANAGER_IMPLEMENTATION.md)
- [GraphQL Schema解析](../../src/lib/schema-parser.js)


















