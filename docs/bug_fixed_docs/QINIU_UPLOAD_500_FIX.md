# 七牛云上传500错误修复

## 问题描述
浏览器控制台报错：
```
POST http://localhost:3000/api/fish/upload 500 (Internal Server Error)
错误: 上传失败: 400 - incorrect region, please use up-na0.qiniup.com, bucket is: fishart
```

## 问题原因
七牛云bucket存储区域配置错误。根据错误信息，您的bucket `fishart` 位于**北美区(na0)**，但`.env.local`中配置的是其他区域。

## 解决方案

### 1. 修改 `.env.local` 配置

将`.env.local`中的`QINIU_ZONE`修改为：
```env
QINIU_ZONE=Zone_na0
```

完整的七牛云配置应该是：
```env
# 七牛云配置
QINIU_ACCESS_KEY=your-access-key
QINIU_SECRET_KEY=your-secret-key
QINIU_BUCKET=fishart
QINIU_BASE_URL=https://your-cdn-domain.com
QINIU_DIR_PATH=fish/
QINIU_ZONE=Zone_na0  # ⭐ 重要：必须设置为 Zone_na0
```

### 2. 重启开发服务器

修改配置后，停止并重新启动服务器：
```bash
# 停止服务器（Ctrl+C）

# 重新启动
npm run dev
```

### 3. 测试上传

访问测试页面：
```
http://localhost:3000/test-qiniu-upload.html
```

或使用简化测试页面（自动测试）：
```
http://localhost:3000/test-simple-upload.html
```

## 可用的七牛云区域

| Zone值 | 区域 | 说明 |
|--------|------|------|
| `Zone_z0` | 华东 | 适用于华东地区 |
| `Zone_z1` | 华北 | 适用于华北地区 |
| `Zone_z2` | 华南 | 适用于华南地区 |
| `Zone_na0` | 北美 | ⭐ 您的bucket在此区域 |
| `Zone_as0` | 东南亚 | 适用于东南亚地区 |

## 已修复的代码

### 1. `lib/qiniu/config.js`
- ✅ 添加环境变量加载
- ✅ 添加配置状态调试输出

### 2. `lib/qiniu/uploader.js`
- ✅ 支持所有七牛云区域
- ✅ 添加详细的错误信息输出
- ✅ 显示使用的Zone配置

### 3. `api/fish/upload.js`
- ✅ 添加详细的调试日志
- ✅ 改进错误处理

### 4. `test-upload-with-file.js`
- ✅ 修复使用http模块发送multipart请求
- ✅ 支持formidable正确解析

## 验证步骤

1. **检查环境变量加载**
   启动服务器时会看到：
   ```
   七牛云配置加载状态:
     AccessKey: 已设置
     SecretKey: 已设置
     Bucket: fishart
     BaseURL: https://...
     DirPath: fish/
     Zone: Zone_na0
   ```

2. **测试上传**
   ```bash
   node test-upload-with-file.js
   ```

   预期成功输出：
   ```
   ✅ 上传成功！
   文件URL: https://...
   ```

## 常见问题

### Q: 如何确认我的bucket在哪个区域？
A: 
1. 登录七牛云控制台
2. 进入对象存储 > 空间管理
3. 查看bucket详情，会显示存储区域
4. 或者从错误信息中获取（如 `up-na0.qiniup.com` 表示北美区）

### Q: 修改配置后仍然报错？
A: 
1. 确保重启了服务器
2. 检查服务器启动日志中的配置状态
3. 确认bucket名称正确

### Q: 浏览器上传仍报500错误？
A: 
1. 打开浏览器开发者工具(F12)
2. 查看Console标签的详细错误
3. 查看Network标签的响应内容

## 技术细节

### formidable multipart解析
- formidable需要完整的Node.js http请求流
- fetch API与http.createServer在处理multipart时有差异
- 使用`form.pipe(req)`正确发送multipart数据

### 七牛云Zone配置
- 必须与bucket实际所在区域匹配
- 错误的zone会返回400错误
- qiniu SDK的zone映射已在uploader.js中实现

---

**修复日期**: 2025-11-03  
**状态**: ✅ 已完成  
**关键修改**: 支持北美区(Zone_na0)配置

