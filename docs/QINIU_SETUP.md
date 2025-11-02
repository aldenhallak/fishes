# 🌐 七牛云存储配置指南

Fish Art 项目使用七牛云对象存储和CDN服务来存储和分发鱼图片，本文档介绍如何配置和使用。

## 📋 目录

- [为什么选择七牛云](#为什么选择七牛云)
- [前置准备](#前置准备)
- [配置步骤](#配置步骤)
- [环境变量设置](#环境变量设置)
- [测试验证](#测试验证)
- [常见问题](#常见问题)

---

## 🎯 为什么选择七牛云

相比Supabase Storage，七牛云有以下优势：

### 成本对比

| 服务 | 存储(5GB) | 流量(500GB) | 月成本 |
|------|----------|------------|--------|
| Supabase | $25套餐 | $25套餐 + $40.50 | **$65.50 (¥470)** |
| 七牛云 | ¥0.74 | ¥102/年套餐 ≈ ¥8.5/月 | **¥9.24** |

**节省98%成本！** 🎉

### 技术优势

- ✅ **3000+国内CDN节点** - 访问速度快
- ✅ **低延迟** - 平均50ms响应
- ✅ **高可用** - 99.95%SLA保证
- ✅ **图片处理** - 内置图片裁剪、水印等功能
- ✅ **流量包** - 更经济实惠

---

## 📦 前置准备

### 1. 注册七牛云账号

访问 [七牛云官网](https://www.qiniu.com/) 注册账号

### 2. 完成实名认证

- 个人认证或企业认证
- 认证后可获得免费额度

### 3. 创建存储空间（Bucket）

1. 登录 [七牛云控制台](https://portal.qiniu.com/)
2. 进入「对象存储」→「空间管理」
3. 点击「新建空间」

**配置建议：**
- **空间名称：** `fish-art`（或自定义）
- **存储区域：** 华南（Zone_z2）或就近选择
- **访问控制：** 公开空间（图片需要公开访问）
- **CDN加速：** 启用

### 4. 获取密钥

1. 进入「个人中心」→「密钥管理」
2. 创建或查看 AccessKey 和 SecretKey
3. **⚠️ 注意保密！不要提交到代码仓库**

### 5. 配置CDN域名

1. 在空间管理中找到你的Bucket
2. 点击「域名管理」
3. 选择以下方式之一：

**方式A：使用七牛测试域名（推荐开发环境）**
- 免费提供
- 有效期30天
- 格式：`xxx.bkt.clouddn.com`

**方式B：绑定自定义域名（推荐生产环境）**
- 需要备案的域名
- 在DNS中添加CNAME记录
- 更专业，无限期使用

---

## ⚙️ 配置步骤

### 1. 安装依赖

项目已配置好依赖，运行：

```bash
npm install
# 或
yarn install
```

会自动安装 `qiniu@^7.12.0`

### 2. 环境变量设置

在项目根目录创建 `.env.local` 文件：

```env
# 七牛云配置
QINIU_ACCESS_KEY=your_access_key_here
QINIU_SECRET_KEY=your_secret_key_here
QINIU_BUCKET=fish-art
QINIU_BASE_URL=https://your-cdn-domain.com
QINIU_DIR_PATH=fish/
QINIU_ZONE=Zone_z2
```

**参数说明：**

| 参数 | 说明 | 示例 |
|------|------|------|
| `QINIU_ACCESS_KEY` | 七牛云AccessKey | `abcd1234...` |
| `QINIU_SECRET_KEY` | 七牛云SecretKey | `efgh5678...` |
| `QINIU_BUCKET` | 存储空间名称 | `fish-art` |
| `QINIU_BASE_URL` | CDN加速域名 | `https://cdn.fishart.online` |
| `QINIU_DIR_PATH` | 存储目录前缀 | `fish/` |
| `QINIU_ZONE` | 存储区域 | `Zone_z2`（华南） |

**存储区域对照表：**

| Zone | 区域 |
|------|------|
| `Zone_z0` | 华东 |
| `Zone_z1` | 华北 |
| `Zone_z2` | 华南 |
| `Zone_na0` | 北美 |
| `Zone_as0` | 东南亚 |

### 3. Vercel部署配置

在Vercel项目设置中添加环境变量：

1. 打开Vercel项目
2. 进入 `Settings` → `Environment Variables`
3. 添加以上所有环境变量
4. 确保在 `Production`、`Preview`、`Development` 都选中

---

## 🧪 测试验证

### 本地测试

1. 启动开发服务器：

```bash
npm run dev
```

2. 访问 `http://localhost:3000`

3. 测试上传：
   - 绘制一条鱼
   - 点击"Submit"
   - 查看控制台日志

### 验证上传成功

**方法1：检查返回URL**

```javascript
// 上传成功后会返回
{
  success: true,
  imageUrl: "https://your-cdn-domain.com/fish/1699123456-abc123.png",
  data: {
    path: "/fish/1699123456-abc123.png",
    key: "fish/1699123456-abc123.png",
    hash: "FmDZwqadA4-uh-MYV4RakGrQdUWI",
    url: "https://your-cdn-domain.com/fish/1699123456-abc123.png"
  }
}
```

**方法2：七牛云控制台查看**

1. 登录七牛云控制台
2. 进入「对象存储」→ 你的空间
3. 查看「文件管理」
4. 应该能看到 `fish/` 目录下的图片

**方法3：直接访问URL**

复制返回的 `imageUrl`，在浏览器中打开，应该能看到上传的图片。

---

## 📁 项目结构

```
fish_art/
├── lib/
│   └── qiniu/
│       ├── config.js          # 七牛云配置
│       └── uploader.js        # 上传类（参考AIGF_web）
├── api/
│   └── fish/
│       └── upload.js          # 上传API（已改用七牛云）
└── docs/
    └── QINIU_SETUP.md         # 本文档
```

---

## 🔧 高级功能

### 1. 图片处理

七牛云支持实时图片处理，在URL后添加参数：

```javascript
// 原图
https://cdn.fishart.online/fish/123456.png

// 缩略图（200x200）
https://cdn.fishart.online/fish/123456.png?imageView2/1/w/200/h/200

// 添加水印
https://cdn.fishart.online/fish/123456.png?watermark/2/text/RmlzaEFydA==

// 质量压缩（70%）
https://cdn.fishart.online/fish/123456.png?imageMogr2/quality/70
```

### 2. 私有空间（可选）

如果需要限制访问，可以改为私有空间：

```javascript
// lib/qiniu/uploader.js 中添加
generatePrivateUrl(key, deadline = 3600) {
  const config = new qiniu.conf.Config();
  const bucketManager = new qiniu.rs.BucketManager(this.mac, config);
  const privateUrl = bucketManager.privateDownloadUrl(
    this.config.baseUrl,
    key,
    deadline
  );
  return privateUrl;
}
```

### 3. 批量上传

```javascript
const uploader = new QiniuUploader();
const files = [
  { data: buffer1, filename: 'fish1.png' },
  { data: buffer2, filename: 'fish2.png' }
];
const results = await uploader.uploadFiles(files);
```

---

## ❓ 常见问题

### Q1: 上传失败，提示"七牛云配置不完整"

**A:** 检查 `.env.local` 文件是否存在，环境变量是否正确设置。

### Q2: 图片上传成功但无法访问

**A:** 
1. 检查Bucket是否设置为「公开空间」
2. 检查CDN域名是否配置正确
3. 检查域名是否已备案（国内域名需要备案）

### Q3: 测试域名过期了怎么办？

**A:** 
1. 绑定自己的域名
2. 或在七牛云控制台重新申请测试域名

### Q4: 如何查看存储用量和费用？

**A:** 
1. 登录七牛云控制台
2. 进入「财务中心」→「消费记录」
3. 可以看到详细的用量和费用

### Q5: 文件名重复怎么办？

**A:** 上传类会自动生成唯一文件名：

```javascript
// 格式: fish/{timestamp}-{random}.{ext}
// 示例: fish/1699123456-abc123.png
```

### Q6: 想要删除旧图片怎么办？

**A:** 使用删除方法：

```javascript
const uploader = new QiniuUploader();
await uploader.deleteFile('fish/1699123456-abc123.png');
```

---

## 📊 费用预估

### 免费额度（新用户）

- **存储：** 10GB（6个月）
- **CDN流量：** 10GB/月
- **HTTP请求：** 100万次/月

### 付费价格

**存储：**
- 标准存储：¥0.148/GB/月

**CDN流量：**
- 国内：¥0.24~0.29/GB（按时段）
- 海外：¥0.45~0.65/GB

**流量包（更优惠）：**
- 500GB：¥102/年
- 1TB：¥204/年
- 10TB：¥1980/年

### 示例场景

**月10万访问量：**
- 存储：5GB = ¥0.74
- 流量：500GB = ¥8.5（年包）
- **总计：¥9.24/月** 💰

---

## 🔗 相关链接

- [七牛云官网](https://www.qiniu.com/)
- [七牛云控制台](https://portal.qiniu.com/)
- [七牛云文档](https://developer.qiniu.com/)
- [Node.js SDK文档](https://developer.qiniu.com/kodo/1289/nodejs)
- [图片处理文档](https://developer.qiniu.com/dora/manual/1279/basic-processing-images-imageview2)

---

## ✅ 配置检查清单

完成以下步骤确保配置正确：

- [ ] 注册并认证七牛云账号
- [ ] 创建存储空间（Bucket）
- [ ] 获取AccessKey和SecretKey
- [ ] 配置CDN域名
- [ ] 设置环境变量（本地）
- [ ] 设置环境变量（Vercel）
- [ ] 运行 `npm install`
- [ ] 测试上传功能
- [ ] 验证图片可访问
- [ ] 检查费用和用量

---

**🎉 配置完成！现在你的Fish Art项目已经使用高性能、低成本的七牛云存储了！**

