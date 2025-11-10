# My Tank 自动调试指南

## 🔍 如何使用自动调试

### 步骤 1: 打开 My Tank 页面
访问 `http://localhost:3000/mytank.html`

### 步骤 2: 打开浏览器控制台
按 `F12` 或右键点击页面选择"检查" → "控制台"标签

### 步骤 3: 运行自动调试脚本
复制 `debug-mytank-auto.js` 文件的全部内容，粘贴到控制台，然后按 Enter

或者，直接在控制台运行：
```javascript
// 加载调试脚本
fetch('/debug-mytank-auto.js')
  .then(r => r.text())
  .then(code => eval(code))
  .catch(e => console.error('加载失败，请手动复制脚本内容'));
```

### 步骤 4: 查看诊断结果
调试脚本会自动检查：
- ✅ Token 是否存在
- ✅ API 是否正常响应
- ✅ 鱼数据是否正确返回
- ✅ Canvas 是否正确初始化
- ✅ 鱼对象是否成功创建
- ✅ 图片是否能正常加载

## 📊 修复内容总结

### 1. 后端 API 修复 (`api/fish/my-tank.js`)
- ✅ 修复了 GraphQL 查询语法：`order_by: {created_at: desc}` → `order_by: [{created_at: desc}]`
- ✅ 添加了详细的错误日志
- ✅ 改进了错误处理，返回更详细的错误信息

### 2. 前端修复 (`src/js/private-fishtank-swim.js`)
- ✅ 修复了 `drawFish` 函数中的 `save/restore` 不匹配问题
- ✅ 添加了 canvas 有效性检查
- ✅ 改进了图片加载逻辑，添加了超时处理
- ✅ 添加了详细的调试日志
- ✅ 导出了 `fishes` 数组到 `window.privateTankFishes` 用于调试

### 3. 调试工具
- ✅ 创建了自动调试脚本 `debug-mytank-auto.js`
- ✅ 添加了动画循环的调试日志

## 🐛 常见问题排查

### 问题 1: API 返回 500 错误
**检查：**
1. 查看服务器控制台的错误日志
2. 确认 `.env.local` 文件中的 `HASURA_GRAPHQL_ENDPOINT` 和 `HASURA_ADMIN_SECRET` 已正确配置
3. 确认 Hasura 服务可访问

**解决：**
- 检查环境变量配置
- 查看服务器日志中的详细错误信息

### 问题 2: 鱼对象创建失败
**检查：**
- 查看控制台中的 `createFishObject` 日志
- 确认图片 URL 是否有效
- 检查是否有 CORS 问题

**解决：**
- 如果图片加载失败，检查图片 URL 是否可访问
- 如果 CORS 问题，确保图片服务器允许跨域访问

### 问题 3: Canvas 尺寸为 0
**检查：**
- 查看控制台中的 canvas 初始化日志
- 确认页面是否完全加载

**解决：**
- 等待页面完全加载后再检查
- 检查 CSS 是否影响 canvas 尺寸

## 📝 下一步

如果调试脚本显示所有检查都通过，但鱼仍不显示，请：
1. 查看控制台中的详细日志
2. 检查是否有 JavaScript 错误
3. 确认动画循环是否在运行（应该看到每秒一次的警告日志，如果没有鱼的话）

如果仍有问题，请提供：
- 调试脚本的完整输出
- 浏览器控制台的所有错误信息
- 服务器控制台的错误日志

