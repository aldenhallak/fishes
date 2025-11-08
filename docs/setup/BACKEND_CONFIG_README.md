# 后端配置快速指南

## 🚀 快速开始（3步）

### 1. 创建配置文件

```bash
# 复制示例文件
copy env.local.example .env.local
```

### 2. 选择后端类型

编辑`.env.local`文件：

**选项A - 使用Hasura（推荐）：**
```bash
BACKEND_TYPE=hasura
HASURA_GRAPHQL_ENDPOINT=https://your-hasura-project.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-admin-secret
```

**选项B - 使用原作者后端（快速测试）：**
```bash
BACKEND_TYPE=original
```

### 3. 重启服务器

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

## ✅ 验证配置

1. 清除浏览器缓存（F12 → 右键刷新 → "清空缓存并硬性重新加载"）
2. 访问 http://localhost:3000/tank.html
3. 打开控制台（F12），应该看到：
   - ✅ `🔧 后端配置: Hasura数据库` 或
   - ✅ `🔧 后端配置: 原作者后端`

## 📚 详细文档

- [完整配置和故障排除指南](docs/BACKEND_SWITCH_GUIDE.md)
- [Hasura快速开始](docs/FISHTANK_QUICKSTART.md)
- [鱼缸功能总览](docs/FISHTANK_README.md)

## ⚠️ 重要提示

1. **不需要**运行`npm run build`
2. **必须**重启服务器让环境变量生效
3. **必须**清除浏览器缓存
4. 文件名是`.env.local`（前面有点）

## 🐛 遇到问题？

查看：[docs/BACKEND_SWITCH_GUIDE.md](docs/BACKEND_SWITCH_GUIDE.md) 的"常见问题"部分

