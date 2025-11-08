# 战斗系统自动测试指南

**日期**: 2025-11-05  
**版本**: 1.0

## 概述

本指南介绍如何使用自动化脚本快速测试战斗系统，包括自动登录和环境配置。

## 快速开始

### 方法一：使用批处理脚本（推荐）

1. **双击运行脚本**
   ```
   test-battle-auto-login.bat
   ```

2. **脚本会自动**：
   - 设置测试环境变量 `DEF_USE` 和 `DEF_PASS`
   - 启动开发服务器（端口 3000）
   - 打开浏览器到战斗演示页面
   - 显示测试账号信息

3. **使用测试账号登录**：
   - Email: `test@example.com`
   - Password: `test123456`

### 方法二：使用自动测试页面

1. **启动服务器**
   ```bash
   node dev-server.js
   ```

2. **打开自动测试页面**
   ```
   http://localhost:3000/test-battle-auto-login.html
   ```

3. **点击"自动登录"按钮**
   - 页面会自动获取环境变量中的测试凭据
   - 自动完成登录流程
   - 提示进入战斗测试

4. **点击"进入战斗测试"**
   - 跳转到 `battle-demo.html` 进行测试

### 方法三：手动设置环境变量

1. **创建 `.env.local` 文件**（如果还没有）
   ```bash
   cp env.local.example .env.local
   ```

2. **编辑 `.env.local`，设置测试凭据**
   ```env
   # 测试账号
   DEF_USE=test@example.com
   DEF_PASS=test123456
   ```

3. **启动服务器**
   ```bash
   node dev-server.js
   ```

4. **访问登录页面（测试模式）**
   ```
   http://localhost:3000/login.html?test=true
   ```
   - 凭据会自动填充
   - 点击登录即可

## 环境变量说明

### DEF_USE
- **类型**: String
- **用途**: 默认测试账号的邮箱
- **示例**: `test@example.com`
- **位置**: `.env.local` 或系统环境变量

### DEF_PASS
- **类型**: String
- **用途**: 默认测试账号的密码
- **示例**: `test123456`
- **位置**: `.env.local` 或系统环境变量

## 文件说明

### 1. test-battle-auto-login.bat
**Windows 批处理脚本**

**功能**:
- ✅ 自动设置环境变量
- ✅ 检查并停止现有服务器
- ✅ 启动开发服务器
- ✅ 打开浏览器到战斗测试页面
- ✅ 显示测试账号信息
- ✅ 显示服务器日志
- ✅ 提供测试检查清单

**使用方法**:
```cmd
# 双击运行或在命令行中执行
test-battle-auto-login.bat
```

**输出**:
```
========================================
🎮 Fish Art 战斗系统自动测试
========================================

[1/4] 设置测试账号...
✓ 测试账号: test@example.com

[2/4] 检查服务器状态...

[3/4] 启动开发服务器...
⏳ 等待服务器启动 (5秒)...
✓ 服务器已启动

[4/4] 打开浏览器进行测试...
...
```

### 2. test-battle-auto-login.html
**自动化测试页面**

**功能**:
- ✅ 自动获取测试凭据（从 API）
- ✅ 检查服务器状态
- ✅ 检查登录状态
- ✅ 一键自动登录
- ✅ 跳转到战斗测试
- ✅ 显示详细日志
- ✅ 显示测试检查清单

**访问地址**:
```
http://localhost:3000/test-battle-auto-login.html
```

**界面元素**:
- 🔑 **测试账号**: 显示当前使用的测试邮箱
- 🔒 **密码**: 显示为星号（安全）
- 📡 **服务器状态**: 实时检查服务器是否在线
- 👤 **登录状态**: 显示当前登录状态
- 🚀 **自动登录**: 一键完成登录
- ⚔️ **进入战斗测试**: 跳转到战斗演示页面
- 🔓 **手动登录**: 跳转到标准登录页面

## API 端点

### GET /api/config/test-credentials
**获取测试凭据**

**请求**: 无需参数

**响应**:
```json
{
  "email": "test@example.com",
  "password": "test123456"
}
```

**实现文件**: `api/config/test-credentials.js`

**代码**:
```javascript
const email = process.env.DEF_USE || 'test@example.com';
const password = process.env.DEF_PASS || 'test123456';

return res.status(200).json({ email, password });
```

## 测试流程

### 完整测试流程

1. **启动自动测试**
   ```bash
   # 运行批处理脚本
   test-battle-auto-login.bat
   
   # 或访问自动测试页面
   # http://localhost:3000/test-battle-auto-login.html
   ```

2. **完成登录**
   - 批处理脚本：手动输入测试凭据
   - 自动测试页面：点击"自动登录"按钮

3. **进入战斗测试页面**
   ```
   http://localhost:3000/battle-demo.html
   ```

4. **测试以下内容**：

#### ✅ 碰撞检测测试
- [ ] 同一行的鱼能否正常碰撞
- [ ] 不同行的鱼是否不会碰撞
- [ ] 水平距离检测是否准确
- [ ] 冷却时间是否正常工作

#### ✅ 动画效果测试
- [ ] 碰撞效果是否立即显示
- [ ] 碰撞位置是否在两鱼中间
- [ ] 爆炸特效是否清晰
- [ ] 粒子扩散是否流畅
- [ ] 冲击波动画是否显示

#### ✅ UI 显示测试
- [ ] 所有鱼是否都显示状态 UI
- [ ] 等级显示是否正确
- [ ] 血条显示是否准确
- [ ] 经验百分比是否正确计算
- [ ] 用户的鱼是否有特殊颜色（金色）

#### ✅ 战斗逻辑测试
- [ ] 战斗结果是否合理
- [ ] 经验增加是否显示
- [ ] 血量减少是否显示
- [ ] 升级特效是否触发
- [ ] 死亡特效是否显示

## 安全说明

### ⚠️ 仅用于开发环境

- **测试凭据仅在 localhost 环境可用**
- **生产环境会自动禁用测试凭据 API**
- **不要将测试凭据提交到版本控制**
- **使用 `.gitignore` 忽略 `.env.local` 文件**

### 环境检测

**test-credentials.js** 包含环境检测：
```javascript
// 仅在开发环境可用
if (process.env.NODE_ENV === 'production') {
  return res.status(404).json({ error: 'Not available in production' });
}
```

## 故障排除

### 问题 1：服务器无法启动
**症状**: 脚本运行但浏览器无法连接

**解决方案**:
```bash
# 检查端口是否被占用
netstat -ano | findstr :3000

# 如果被占用，杀死进程
taskkill /F /PID <进程ID>

# 重新运行脚本
test-battle-auto-login.bat
```

### 问题 2：测试凭据无法获取
**症状**: 自动测试页面显示"测试凭据不可用"

**解决方案**:
```bash
# 1. 检查 .env.local 文件
cat .env.local

# 2. 确保包含 DEF_USE 和 DEF_PASS
# 3. 重启服务器
node dev-server.js
```

### 问题 3：自动登录失败
**症状**: 点击"自动登录"后显示错误

**解决方案**:
1. 检查测试账号是否存在于数据库
2. 检查 Supabase 配置是否正确
3. 查看浏览器控制台的错误信息
4. 尝试手动登录验证凭据

### 问题 4：战斗系统无响应
**症状**: 进入战斗测试页面后无法触发战斗

**解决方案**:
1. 检查浏览器控制台是否有 JavaScript 错误
2. 确认 `BattleAnimation` 模块已正确加载
3. 检查是否正确进入战斗模式
4. 验证服务器日志中是否有错误

## 开发建议

### 添加新的测试凭据

在 `.env.local` 中添加：
```env
# 额外的测试账号
TEST_USER_2=user2@example.com
TEST_PASS_2=password2

TEST_USER_3=user3@example.com
TEST_PASS_3=password3
```

### 自定义测试脚本

复制并修改现有脚本：
```bash
# 复制脚本
cp test-battle-auto-login.bat my-custom-test.bat

# 编辑自定义脚本
# - 修改测试凭据
# - 修改目标页面
# - 添加额外的测试步骤
```

## 相关文件

- `test-battle-auto-login.bat` - Windows 自动测试脚本
- `test-battle-auto-login.html` - 自动测试页面
- `api/config/test-credentials.js` - 测试凭据 API
- `env.local.example` - 环境变量示例
- `.env.local` - 实际环境变量（不提交到 Git）
- `src/js/login.js` - 登录页面逻辑（包含测试模式）

## 参考文档

- [战斗系统修复文档](bug_fixed_docs/BATTLE_COLLISION_AND_UI_FIX.md)
- [战斗系统 README](../BATTLE_SYSTEM_README.md)
- [登录文本可见性修复](../LOGIN_TEXT_VISIBILITY_FIX.md)
- [后端配置说明](../BACKEND_CONFIG_README.md)

## 更新日志

### v1.0 (2025-11-05)
- ✅ 创建 Windows 批处理自动测试脚本
- ✅ 创建自动测试 HTML 页面
- ✅ 集成环境变量支持
- ✅ 添加完整的测试检查清单
- ✅ 添加详细的文档说明

## 总结

通过本指南，你可以：

✅ **快速启动测试环境** - 一键启动服务器并打开浏览器  
✅ **自动登录** - 无需手动输入测试凭据  
✅ **完整测试流程** - 按照检查清单系统化测试  
✅ **实时日志** - 查看详细的操作日志  
✅ **高效调试** - 快速定位和解决问题  

开始测试战斗系统吧！🚀











