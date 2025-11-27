/**
 * 数据表管理相关的类型定义
 */

/**
 * 字段信息
 */
export interface FieldInfo {
  name: string;
  type: string;
  isNullable: boolean;
  isArray: boolean;
  isRelation: boolean;
  description?: string;
}

/**
 * 表信息
 */
export interface TableInfo {
  name: string;
  fields: FieldInfo[];
  description?: string;
}

/**
 * Schema缓存
 */
export interface SchemaCache {
  tables: Map<string, TableInfo>;
  lastParsed: number;
}

/**
 * 表权限
 */
export interface TablePermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

/**
 * 表配置
 */
export interface TableConfig {
  permissions: TablePermissions;
  isDangerous: boolean;
  displayName: string;
}

























