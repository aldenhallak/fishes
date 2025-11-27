# 七牛云域名配置说明

## 问题现象
- ✅ 图片成功上传到七牛云
- ❌ 返回的URL无法访问
- ❌ 访问URL报错：`{"error":"no such domain"}`

## 问题原因
返回的URL使用了默认格式：
```
http://fishart.qiniucdn.com/fishart_web/xxx.png
```

这个域名 `fishart.qiniucdn.com` 未绑定到您的bucket，因此无法访问。

## 解决方案

### 方案1：使用七牛云提供的测试域名（推荐）

1. **登录七牛云控制台**
   - https://portal.qiniu.com/

2. **进入对象存储**
   - 左侧菜单：对象存储 → 空间管理
   - 找到您的bucket：`fishart`

3. **查看域名**
   - 点击bucket名称进入详情
   - 找到"域名管理"或"外链默认域名"
   - 七牛云会提供测试域名，格式类似：
     - `http://xxx.bkt.clouddn.com`
     - `http://xxx.qiniucdn.com`
     - 或其他格式

4. **复制完整域名**
   - 复制显示的完整域名（包括http://或https://）

5. **更新 `.env.local`**
   ```env
   QINIU_BASE_URL=http://你复制的测试域名
   # 例如：
   # QINIU_BASE_URL=http://xxxxxx.bkt.clouddn.com
   ```

6. **重启服务器**
   ```bash
   # 停止服务器（Ctrl+C）
   npm run dev
   ```

### 方案2：绑定自定义域名（生产环境）

如果您有自己的域名：

1. **在七牛云控制台绑定域名**
   - 进入bucket → 域名管理
   - 添加自定义域名
   - 完成域名验证和CNAME配置

2. **更新配置**
   ```env
   QINIU_BASE_URL=https://cdn.yourdomain.com
   ```

## 临时调试方案

如果暂时无法获取正确域名，可以使用七牛云提供的临时解决方案：

### 修改代码使用七牛云API返回的域名

编辑 `lib/qiniu/uploader.js`：

```javascript
if (info.statusCode === 200) {
  // 使用七牛云返回的key，让前端通过七牛云API获取外链
  const url = this.config.baseUrl 
    ? `${this.config.baseUrl}/${uploadKey}`
    : null; // 暂不生成URL，由前端处理
  
  resolve({
    path: '/' + uploadKey,
    url: url || uploadKey, // 如果没有配置域名，返回key
    key: uploadKey,
    hash: body.hash,
    needDomain: !this.config.baseUrl // 标记是否需要配置域名
  });
}
```

## 验证配置

配置域名后，测试上传：

```bash
# 访问测试页面
http://localhost:3000/test-qiniu-upload.html
```

成功后应该看到：
- ✅ 上传成功
- ✅ URL可以点击访问
- ✅ 图片正常显示

## 常见错误

### 错误1：`{"error":"no such domain"}`
- **原因**：域名未绑定或配置错误
- **解决**：检查并更新 `QINIU_BASE_URL`

### 错误2：`{"error":"expired"}`
- **原因**：临时域名已过期
- **解决**：使用自定义域名或重新申请测试域名

### 错误3：403 Forbidden
- **原因**：bucket权限设置为私有
- **解决**：在七牛云控制台将bucket设置为公开

## 快速检查清单

- [ ] 已登录七牛云控制台
- [ ] 找到bucket的域名管理
- [ ] 复制了正确的域名
- [ ] 更新了 `.env.local` 中的 `QINIU_BASE_URL`
- [ ] 重启了开发服务器
- [ ] 测试上传成功
- [ ] URL可以访问

---

**相关文档**：
- 七牛云文档：https://developer.qiniu.com/kodo/manual/console/bucket-management
- Bug修复文档：`docs/bug_fixed_docs/QINIU_UPLOAD_500_FIX.md`

