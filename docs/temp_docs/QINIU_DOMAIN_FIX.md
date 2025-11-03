# 七牛云域名问题修复指南

## 问题
- ✅ 图片上传成功
- ❌ 返回URL: `http://fishart.qiniucdn.com/...`
- ❌ 访问报错: `{"error":"no such domain"}`

## 原因
`.env.local` 中的 `QINIU_BASE_URL` 未配置或配置错误。

## 解决步骤

### 第1步：获取七牛云域名

1. **登录七牛云控制台**
   - 访问：https://portal.qiniu.com/

2. **进入对象存储**
   - 左侧菜单：对象存储 → 空间管理
   - 点击您的bucket：`fishart`

3. **找到域名**
   - 点击"域名管理"标签
   - 查看"外链默认域名"或"CDN域名"
   - 复制完整域名（例如：`http://xxxxx.bkt.clouddn.com`）

### 第2步：更新配置

编辑 `.env.local` 文件，找到并修改：

```env
# 将这个
QINIU_BASE_URL=https://your-cdn-domain.com

# 改为您复制的域名（去掉末尾斜杠）
QINIU_BASE_URL=http://xxxxx.bkt.clouddn.com
```

### 第3步：重启服务器

```bash
# 按 Ctrl+C 停止服务器
# 然后重新启动
npm run dev
```

### 第4步：测试

访问：http://localhost:3000/test-qiniu-upload.html

上传图片后，点击返回的URL，应该能正常显示。

## 注意事项

1. **域名格式**：不要在末尾加 `/`
   - ✅ 正确：`http://xxx.bkt.clouddn.com`
   - ❌ 错误：`http://xxx.bkt.clouddn.com/`

2. **协议**：使用控制台显示的协议
   - 如果七牛云显示 `http://`，就用 `http://`
   - 如果配置了HTTPS，就用 `https://`

3. **测试域名**：七牛云的测试域名有效期30天
   - 生产环境建议绑定自己的域名

4. **Bucket权限**：确保bucket设置为公开读取
   - 控制台 → 空间设置 → 访问控制 → 公开

## 如果找不到域名？

联系我，我会帮您临时修改代码使用其他方式获取域名。

