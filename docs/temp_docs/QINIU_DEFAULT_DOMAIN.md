# 七牛云默认域名设置说明

## 问题说明

您发现在七牛云后台复制外链时，URL显示为：
```
http://t53keed0z.bkt.gdipper.com/fishart_web/xxx.png
```

而不是您配置的：
```
https://cdn.fishart.online/fishart_web/xxx.png
```

## 原因分析

### 两种域名的区别

1. **系统默认域名**（七牛云分配）
   - 格式：`*.bkt.gdipper.com` 或 `*.qiniucdn.com`
   - 例如：`t53keed0z.bkt.gdipper.com`
   - 这是七牛云自动分配的域名
   - 七牛云后台默认显示这个

2. **自定义域名**（您绑定的）
   - 格式：您自己的域名
   - 例如：`cdn.fishart.online`
   - 需要在七牛云控制台手动绑定
   - 需要配置DNS CNAME

### 当前状态

✅ **您的代码配置正确！**

测试结果：
```
我们API返回的URL:
  https://cdn.fishart.online/fishart_web/1762136963781-ioa97u.png

七牛云后台显示的URL:
  http://t53keed0z.bkt.gdipper.com/...
```

**结论**：您的代码已经正确使用了自定义域名 `cdn.fishart.online`，这才是用户实际访问的URL。

## 为什么会这样？

1. **代码层面**
   - 我们的代码读取 `.env.local` 中的 `QINIU_DOMAIN`
   - 生成的URL使用配置的自定义域名
   - ✅ 这是正确的

2. **七牛云后台**
   - 后台显示的是"系统默认域名"
   - 除非您在控制台设置了"默认域名"
   - 这不影响代码生成的URL

## 如何设置七牛云控制台的默认域名

如果您希望在七牛云后台复制外链时也显示自定义域名：

### 步骤1：登录七牛云控制台

访问：https://portal.qiniu.com/

### 步骤2：进入空间管理

1. 左侧菜单：**对象存储 → 空间管理**
2. 点击您的bucket：`fishart`

### 步骤3：域名管理

1. 点击顶部的 **域名管理** 标签
2. 查看您绑定的域名列表

### 步骤4：设置默认域名

1. 找到您的自定义域名：`cdn.fishart.online`
2. 点击该域名右侧的 **设置为默认域名** 按钮
3. 确认设置

### 步骤5：验证

设置完成后，再次在七牛云后台复制外链，应该会显示：
```
https://cdn.fishart.online/fishart_web/xxx.png
```

## 重要说明

### 对代码无影响

即使不在七牛云控制台设置默认域名，您的代码也能正常工作，因为：

1. **代码配置优先**
   - 代码使用 `.env.local` 中的配置
   - 不依赖七牛云后台的默认域名设置

2. **URL生成正确**
   ```javascript
   // lib/qiniu/uploader.js
   const url = this.config.baseUrl 
     ? `${this.config.baseUrl}/${uploadKey}`  // ✅ 使用配置的域名
     : `http://${this.config.bucket}.qiniucdn.com/${uploadKey}`;
   ```

3. **用户访问正常**
   - 用户通过上传功能获取的URL
   - 使用的是 `https://cdn.fishart.online`
   - 可以正常访问

### 设置的好处

在七牛云控制台设置默认域名的好处：

1. **后台操作方便**
   - 直接复制外链时使用自定义域名
   - 统一URL格式

2. **团队协作**
   - 其他团队成员在后台操作时
   - 也能看到正确的域名

3. **文档和测试**
   - 从后台复制的URL可直接使用
   - 不需要手动替换域名

## 验证当前配置

### 方法1：访问测试页面

访问：http://localhost:3000/test-qiniu-upload.html

上传图片后，查看返回的URL，应该是：
```
https://cdn.fishart.online/...
```

### 方法2：检查环境变量

您的 `.env.local` 配置：
```env
QINIU_DOMAIN=https://cdn.fishart.online  ✅
```

### 方法3：查看服务器日志

启动服务器时会显示：
```
七牛云配置加载状态:
  BaseURL: https://cdn.fishart.online  ✅
```

## 总结

| 项目 | 状态 | 说明 |
|------|------|------|
| 代码配置 | ✅ 正确 | 使用 `cdn.fishart.online` |
| 上传功能 | ✅ 正常 | URL生成正确 |
| 用户访问 | ✅ 正常 | 可以访问图片 |
| 七牛云后台显示 | ⚠️ 系统域名 | 不影响功能，可选择性设置 |

**建议**：如果您经常在七牛云后台操作，建议设置默认域名。如果只通过代码上传，则无需设置。

## 相关链接

- 七牛云控制台：https://portal.qiniu.com/
- 七牛云域名绑定文档：https://developer.qiniu.com/kodo/manual/domain-management

---

**文档日期**: 2025-11-03  
**状态**: ✅ 代码配置正确，后台设置为可选

