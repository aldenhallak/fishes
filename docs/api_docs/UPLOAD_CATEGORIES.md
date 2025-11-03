# 图片上传分类系统

## 概述

Fish Art 项目实现了智能的图片分类存储系统，将不同类型的图片自动存储在对应的子目录中，便于管理和维护。

## 目录结构

```
fishart_web/
  ├── fish/          # 鱼作品图片
  ├── avatars/       # 用户头像
  ├── battle/        # 战斗相关图片
  └── temp/          # 临时文件
```

## 可用分类

### 1. fish（鱼作品）
- **用途**: 用户绘制的鱼作品图片
- **默认分类**: 是
- **路径**: `fishart_web/fish/`

### 2. avatars（用户头像）
- **用途**: 用户头像图片
- **路径**: `fishart_web/avatars/`

### 3. battle（战斗相关）
- **用途**: 战斗系统相关的图片
- **路径**: `fishart_web/battle/`

### 4. temp（临时文件）
- **用途**: 临时图片文件
- **路径**: `fishart_web/temp/`

## 使用方法

### 方法1: 不指定分类（自动检测）

直接上传图片，系统会根据API路径自动判断分类：

```javascript
// 使用 /api/fish/upload 端点
// 自动分类为 fish

const formData = new FormData();
formData.append('image', fileBlob);

const response = await fetch('/api/fish/upload', {
  method: 'POST',
  body: formData
});
```

### 方法2: 指定分类参数

在上传时通过表单字段指定分类：

```javascript
const formData = new FormData();
formData.append('image', fileBlob);
formData.append('category', 'avatars'); // 指定分类

const response = await fetch('/api/fish/upload', {
  method: 'POST',
  body: formData
});
```

或使用 `type` 字段：

```javascript
formData.append('type', 'avatar'); // 使用type字段
```

### 方法3: 使用专用端点（未来扩展）

为不同分类创建专用的上传端点：

```javascript
// 上传头像
await fetch('/api/avatar/upload', { ... });

// 上传战斗图片
await fetch('/api/battle/upload', { ... });
```

## API响应

上传成功后，响应会包含分类信息：

```json
{
  "success": true,
  "imageUrl": "https://cdn.fishart.online/fishart_web/fish/1762137000000-abc123.png",
  "data": {
    "path": "/fishart_web/fish/1762137000000-abc123.png",
    "key": "fishart_web/fish/1762137000000-abc123.png",
    "hash": "FkpetxcbWOCKaIFyHjtD1aREGaK-",
    "url": "https://cdn.fishart.online/fishart_web/fish/1762137000000-abc123.png",
    "category": "fish"
  }
}
```

## 分类判断优先级

系统按以下优先级自动判断图片分类：

1. **表单字段**（最高优先级）
   - `category` 字段
   - `type` 字段

2. **API路径**
   - `/api/fish/upload` → fish
   - `/api/avatar/upload` → avatars
   - `/api/battle/upload` → battle

3. **来源页面**（Referer）
   - `/profile` 或 `/settings` → avatars
   - `/battle` → battle

4. **默认分类**
   - 未匹配任何规则时默认使用 `fish`

## 扩展新分类

### 步骤1: 修改配置

编辑 `lib/qiniu/categories.js`：

```javascript
const CATEGORIES = {
  FISH: 'fish',
  AVATAR: 'avatars',
  BATTLE: 'battle',
  TEMP: 'temp',
  NEW_TYPE: 'new_type'  // 添加新分类
};
```

### 步骤2: 更新判断逻辑

在 `detectCategory` 函数中添加判断逻辑：

```javascript
function detectCategory(context) {
  const { url, type } = context;
  
  // 添加新分类的判断
  if (type === 'new_type') return CATEGORIES.NEW_TYPE;
  if (url?.includes('/api/newtype/upload')) return CATEGORIES.NEW_TYPE;
  
  // ... 其他逻辑
}
```

### 步骤3: 更新文档

在本文档中添加新分类的说明。

## 代码示例

### 前端上传示例

```javascript
// 示例1: 上传鱼作品（默认）
async function uploadFishDrawing(file) {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/fish/upload', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  console.log('图片分类:', result.data.category); // "fish"
  console.log('图片URL:', result.imageUrl);
}

// 示例2: 上传头像
async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('category', 'avatars'); // 指定分类
  
  const response = await fetch('/api/fish/upload', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  console.log('图片分类:', result.data.category); // "avatars"
}
```

### 后端调用示例

```javascript
const { QiniuUploader } = require('./lib/qiniu/uploader');

// 直接指定分类上传
const uploader = new QiniuUploader();
const result = await uploader.uploadFile(
  fileBuffer,
  'avatar.png',
  { category: 'avatars' }
);

console.log('上传到分类:', result.category);
console.log('文件URL:', result.url);
```

## 向后兼容

### 现有图片

- 现有存储在 `fishart_web/` 根目录的图片不受影响
- 可以继续正常访问
- 不需要迁移

### 旧代码

支持旧的API调用方式：

```javascript
// 旧方式（仍然有效）
await uploader.uploadFile(fileBuffer, 'fish.png');

// 新方式
await uploader.uploadFile(fileBuffer, 'fish.png', { category: 'fish' });
```

## 最佳实践

1. **明确指定分类**
   - 上传时明确指定 `category` 参数
   - 避免依赖自动检测

2. **统一命名规范**
   - 使用配置中定义的分类名称
   - 不要使用自定义分类名

3. **及时清理**
   - 定期清理 `temp/` 目录中的临时文件
   - 删除用户时清理对应的头像

4. **监控存储**
   - 定期检查各分类的存储占用
   - 优化存储策略

## 故障排查

### 问题1: 图片存储在错误的分类

**原因**: 分类参数传递错误或判断逻辑问题

**解决**:
1. 检查上传时是否正确传递 `category` 参数
2. 查看服务器日志中的 "检测到的图片分类" 信息
3. 验证 `detectCategory` 函数的判断逻辑

### 问题2: 无法找到图片

**原因**: URL路径错误

**解决**:
1. 确认图片确实存储在七牛云
2. 检查返回的URL是否包含正确的分类路径
3. 验证七牛云域名配置

### 问题3: 分类参数不生效

**原因**: formidable解析问题

**解决**:
1. 确保表单字段名称正确（`category` 或 `type`）
2. 检查 formidable 是否正确解析表单数据
3. 查看服务器日志中的 fields 输出

## 技术细节

### 文件命名规则

```
{QINIU_DIR_PATH}{category}/{timestamp}-{random}.{ext}
```

示例:
```
fishart_web/fish/1762137000000-abc123.png
fishart_web/avatars/1762137000000-xyz789.jpg
```

### 分类验证

系统会自动验证分类是否有效：

```javascript
const { isValidCategory } = require('./lib/qiniu/categories');

if (!isValidCategory(category)) {
  // 使用默认分类
  category = 'fish';
}
```

### 获取所有分类

```javascript
const { getAllCategories } = require('./lib/qiniu/categories');

const categories = getAllCategories();
// ['fish', 'avatars', 'battle', 'temp']
```

## 相关文件

- `lib/qiniu/categories.js` - 分类配置和判断逻辑
- `lib/qiniu/uploader.js` - 七牛云上传实现
- `api/fish/upload.js` - 上传API端点
- `.env.local` - 环境变量配置

## 更新日志

### 2025-11-03
- 实现图片分类存储系统
- 支持 fish、avatars、battle、temp 四种分类
- 自动检测分类逻辑
- 向后兼容现有代码

---

**维护者**: Fish Art Team  
**最后更新**: 2025-11-03

