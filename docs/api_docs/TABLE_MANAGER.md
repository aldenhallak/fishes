# 数据表管理系统

## 概述

数据表管理系统是一个强大的可视化工具，允许管理员直接在浏览器中管理数据库表，支持在线编辑、批量操作等功能，类似于Excel的操作体验。

## 访问入口

- **测试中心**: http://localhost:3000/test-center.html → 点击"数据表管理"
- **直接访问**: http://localhost:3000/admin-table-manager.html

## 核心功能

### 1. 表列表页面

**功能特性：**
- 📊 自动发现所有数据库表
- 🔍 表名和中文名称映射
- ⚠️ 危险表标记（如用户表、订单表等）
- 🎯 点击卡片快速进入编辑页面

### 2. 表编辑页面

**功能特性：**

#### 📝 在线编辑
- 点击单元格进入编辑模式
- 支持文本、数字、布尔值等多种类型
- Enter保存，Esc取消
- 实时显示待保存更改

#### 🔍 数据查看
- 自动识别字段类型
- 只读字段标记（ID、创建时间、更新时间）
- 布尔值徽章显示
- 时间字段本地化显示
- 长文本自动截断

#### 📊 排序功能
- 点击列头进行排序
- 支持升序/降序切换
- 默认按ID降序排列

#### ✅ 批量操作
- 多选行功能
- 批量删除（带二次确认）
- 危险表批量删除需要额外验证
- 批量删除数量限制

#### 💾 保存管理
- 实时显示待保存更改数量
- 一键保存所有更改
- 保存失败自动回滚
- 丢弃更改功能

## 技术架构

### 后端部分

#### 1. Schema解析器 (`src/lib/schema-parser.ts`)
```typescript
// 从GraphQL schema自动解析表结构
- parseSchema(): 解析整个Schema
- getTableInfo(): 获取单个表信息
- getTableNames(): 获取所有表名
```

#### 2. 查询生成器 (`src/lib/query-generator.ts`)
```typescript
// 动态生成GraphQL查询
- generateGetQuery(): 生成查询语句
- generateInsertMutation(): 生成插入语句
- generateUpdateMutation(): 生成更新语句
- generateDeleteMutation(): 生成删除语句
- generateBatchDeleteMutation(): 生成批量删除语句
```

#### 3. 表配置 (`src/config/table-config.ts`)
```typescript
// 表权限和配置管理
- getTableConfig(): 获取表配置
- getTablePermissions(): 获取表权限
- isDangerousTable(): 判断是否为危险表
- getBatchDeleteLimit(): 获取批量删除限制
```

#### 4. API路由

**表列表API** (`api/admin/tables.js`)
```
GET /api/admin/tables
响应: { success: true, data: { tables: [...], configs: {...} } }
```

**表数据API** (`api/admin/tables/[tableName].js`)
```
GET    /api/admin/tables/{tableName}?limit=50&offset=0&order_by=id&order_direction=desc
POST   /api/admin/tables/{tableName}
PUT    /api/admin/tables/{tableName}
DELETE /api/admin/tables/{tableName}?id=1
DELETE /api/admin/tables/{tableName}?ids=1,2,3
```

### 前端部分

#### 1. 表列表页面 (`admin-table-manager.html`)
- 表格卡片展示
- 表选择器
- 统计信息展示

#### 2. 表编辑页面 (`admin-table-edit.html`)
- 可编辑表格
- 批量操作栏
- 统计信息面板

#### 3. 表格编辑器 (`src/js/admin-table-editor.js`)
- 单元格编辑逻辑
- 状态管理
- API调用封装

## 权限配置

### 默认权限
```javascript
{
  create: false,  // 不允许创建
  read: true,     // 允许读取
  update: true,   // 允许更新
  delete: false,  // 不允许删除
}
```

### 特定表权限

| 表名 | 创建 | 读取 | 更新 | 删除 | 说明 |
|------|------|------|------|------|------|
| fish | ✗ | ✓ | ✓ | ✓ | 鱼表 |
| votes | ✗ | ✓ | ✓ | ✓ | 投票表 |
| reports | ✗ | ✓ | ✓ | ✓ | 举报表 |
| user_economy | ✗ | ✓ | ✓ | ✗ | 用户经济表（危险） |
| economy_log | ✗ | ✓ | ✗ | ✗ | 经济日志（只读） |
| battle_log | ✗ | ✓ | ✗ | ✗ | 战斗日志（只读） |

## 批量删除限制

| 表名 | 最大删除数 |
|------|------------|
| user_economy | 10 |
| battle_config | 5 |
| 其他表 | 100 |

## 只读字段

以下字段自动标记为只读，不可编辑：
- `id` - 主键
- `created_at` - 创建时间
- `updated_at` - 更新时间

## 使用流程

### 查看和编辑数据

1. 访问数据表管理页面
2. 选择要管理的表
3. 点击要编辑的单元格
4. 修改数据（Enter保存，Esc取消）
5. 点击"保存更改"按钮提交所有修改

### 批量删除

1. 勾选要删除的行
2. 点击"批量删除"按钮
3. 确认删除操作
4. 系统执行删除并刷新数据

### 排序数据

1. 点击列头
2. 首次点击：降序排列
3. 再次点击：升序排列
4. 点击其他列：切换排序列

## 安全机制

### 1. 权限控制
- 基于表配置的CRUD权限
- 只读字段保护
- 危险表标记

### 2. 删除保护
- 批量删除数量限制
- 危险表需要额外确认
- 删除操作二次确认

### 3. 数据验证
- 类型自动转换
- 空值处理
- 布尔值验证

## 自定义配置

### 添加新表的中文名

编辑 `src/config/table-config.ts`:

```typescript
export const tableDisplayNames: Record<string, string> = {
  'your_table_name': '你的表名',
  // ...
};
```

### 修改表权限

编辑 `src/config/table-config.ts`:

```typescript
const tablePermissionsConfig: Record<string, Partial<TablePermissions>> = {
  'your_table_name': { 
    create: true, 
    update: true, 
    delete: true 
  },
};
```

### 设置危险表

编辑 `src/config/table-config.ts`:

```typescript
export const dangerousTables = new Set<string>([
  'your_dangerous_table',
]);
```

## 常见问题

### Q: 为什么有些表看不到？
A: 只有在GraphQL schema中定义的表才会显示。确保表已经被Hasura跟踪。

### Q: 编辑后为什么没有保存？
A: 需要点击"保存更改"按钮才会提交到数据库。

### Q: 为什么某些字段不能编辑？
A: ID、创建时间、更新时间等字段默认为只读，无法编辑。

### Q: 批量删除失败怎么办？
A: 检查是否超过批量删除限制，危险表是否需要额外确认。

## 最佳实践

1. **谨慎操作危险表** - 特别是用户表、订单表等核心数据表
2. **定期备份数据** - 在进行大量修改前备份数据库
3. **小批量操作** - 避免一次性修改或删除大量数据
4. **验证修改** - 保存前仔细检查待保存的更改
5. **使用排序和筛选** - 便于快速定位需要操作的数据

## 未来计划

- [ ] 添加数据筛选功能
- [ ] 支持高级搜索
- [ ] 导出数据为CSV
- [ ] 数据导入功能
- [ ] 历史记录和回滚
- [ ] 表结构查看
- [ ] 关联数据显示

---

**更新时间**: 2025-01-04
**版本**: 1.0.0


















