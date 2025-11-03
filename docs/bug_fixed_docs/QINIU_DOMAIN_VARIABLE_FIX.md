# 七牛云域名变量名修复

## 问题描述
- ✅ 图片上传成功到七牛云
- ❌ 返回URL使用错误域名：`http://fishart.qiniucdn.com/...`
- ❌ 访问URL报错：`{"error":"no such domain"}`

## 问题原因

用户的 `.env.local` 配置：
```env
QINIU_DOMAIN=https://cdn.fishart.online
```

但代码读取的变量名：
```javascript
baseUrl: process.env.QINIU_BASE_URL || ''
```

**变量名不匹配**，导致域名配置未生效，使用了默认的错误域名。

## 解决方案

修改 `lib/qiniu/config.js`，同时支持两个变量名：

```javascript
const qiniuConfig = {
  accessKey: process.env.QINIU_ACCESS_KEY || '',
  secretKey: process.env.QINIU_SECRET_KEY || '',
  bucket: process.env.QINIU_BUCKET || '',
  baseUrl: process.env.QINIU_BASE_URL || process.env.QINIU_DOMAIN || '', // 兼容QINIU_DOMAIN
  dirPath: process.env.QINIU_DIR_PATH || 'fish/', 
  zone: process.env.QINIU_ZONE || 'Zone_z2'
};
```

### 优先级
1. 优先读取 `QINIU_BASE_URL`（标准变量名）
2. 其次读取 `QINIU_DOMAIN`（兼容用户配置）
3. 都没有则为空

## 测试结果

修复后上传测试：
```
返回URL: https://cdn.fishart.online/fishart_web/1762136168665-f4xvb8.png

✅ 域名修复成功！
✅ 使用了正确的域名: https://cdn.fishart.online
✅ 图片URL可以正常访问
```

## 支持的环境变量配置

现在支持两种方式配置域名：

### 方式1：使用 QINIU_BASE_URL（推荐）
```env
QINIU_BASE_URL=https://cdn.fishart.online
```

### 方式2：使用 QINIU_DOMAIN（兼容）
```env
QINIU_DOMAIN=https://cdn.fishart.online
```

## 完整的七牛云环境变量

```env
# 七牛云配置
QINIU_ACCESS_KEY=your-access-key
QINIU_SECRET_KEY=your-secret-key
QINIU_BUCKET=fishart
QINIU_DOMAIN=https://cdn.fishart.online  # 或使用 QINIU_BASE_URL
QINIU_DIR_PATH=fishart_web/
QINIU_ZONE=Zone_na0
```

## 验证方法

1. **启动服务器**
   ```bash
   npm run dev
   ```

2. **查看启动日志**
   应该看到：
   ```
   七牛云配置加载状态:
     BaseURL: https://cdn.fishart.online  # 或其他配置的域名
   ```

3. **测试上传**
   访问：http://localhost:3000/test-qiniu-upload.html
   
4. **验证URL**
   - 上传成功后点击返回的URL
   - 应该能正常显示图片
   - URL格式：`https://cdn.fishart.online/...`

## 相关修改

### 修改的文件
- `lib/qiniu/config.js` - 添加 QINIU_DOMAIN 兼容支持

### 向后兼容性
- ✅ 完全兼容旧配置（使用 QINIU_BASE_URL）
- ✅ 支持新配置（使用 QINIU_DOMAIN）
- ✅ 不影响其他功能

## 注意事项

1. **域名格式**：不要在末尾加 `/`
   - ✅ 正确：`https://cdn.fishart.online`
   - ❌ 错误：`https://cdn.fishart.online/`

2. **协议**：使用 `https://` 或 `http://`，根据实际配置

3. **域名验证**：确保域名已在七牛云控制台绑定

---

**修复日期**: 2025-11-03  
**状态**: ✅ 已完成并测试  
**影响范围**: 七牛云图片URL生成  
**向后兼容**: ✅ 是

