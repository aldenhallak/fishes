# 战斗系统测试快速开始 ⚔️

## 🚀 最快开始方式

### Windows 用户（推荐）

**一键启动测试**：
```bash
双击运行: test-battle-auto-login.bat
```

脚本会自动：
- ✅ 设置测试账号环境变量（DEF_USE, DEF_PASS）
- ✅ 启动开发服务器
- ✅ 打开浏览器到战斗测试页面
- ✅ 显示测试凭据和检查清单

### 使用网页自动登录

1. **启动服务器**
   ```bash
   node dev-server.js
   ```

2. **打开自动测试页面**
   ```
   http://localhost:3000/test-battle-auto-login.html
   ```

3. **点击"🚀 自动登录"** → **点击"⚔️ 进入战斗测试"**

## 🔑 测试账号

**默认测试凭据**：
- Email: `test@example.com`
- Password: `test123456`

**自定义凭据**：
在 `.env.local` 文件中设置：
```env
DEF_USE=your-email@example.com
DEF_PASS=your-password
```

## 🎯 测试检查清单

### ✅ 战斗模式控制（新增 2025-11-05）
- [ ] 页面刚加载时没有战斗碰撞检测日志
- [ ] 和平模式下鱼相撞不会触发战斗
- [ ] 点击战斗按钮后看到"🎮 战斗模式已启用"日志
- [ ] 战斗模式下鱼相撞时触发战斗动画
- [ ] 按钮状态显示"✓ 战斗中"

### ✅ 碰撞检测
- [ ] 同一行的鱼能正常碰撞
- [ ] 不同行的鱼不会碰撞
- [ ] 水平距离检测准确

### ✅ 动画效果
- [ ] 碰撞效果立即显示
- [ ] 碰撞位置在两鱼中间
- [ ] 爆炸和粒子特效清晰流畅

### ✅ UI 显示
- [ ] 所有鱼都显示状态 UI
- [ ] 等级、血条、经验正确显示
- [ ] 用户的鱼有金色高亮
- [ ] 战斗后数值立即更新

### ✅ 战斗结果显示
- [ ] Winner显示"WIN!"（金色）在一侧
- [ ] Loser显示"LOSE!"（红色）在另一侧
- [ ] 经验增加显示在Winner下方
- [ ] 血量减少显示在Loser下方
- [ ] 升级时显示"LEVEL UP!"
- [ ] 死亡时显示"DEAD!"

## 📝 最近修复

### 第四轮修复 (2025-11-05 晚上)
✅ **和平模式** - 刚进入鱼缸页时不触发战斗  
✅ **战斗触发** - 只有点击战斗按钮后才开始碰撞检测  
✅ **性能优化** - 和平模式下不执行碰撞检测逻辑  
✅ **状态控制** - 添加 `isBattleMode` 标志控制战斗功能  

详细文档：[docs/bug_fixed_docs/BATTLE_MODE_TRIGGER_FIX.md](docs/bug_fixed_docs/BATTLE_MODE_TRIGGER_FIX.md)

### 第三轮修复 (2025-11-05 晚上)
✅ **用户鱼检测** - 修复战斗按钮错误提示"用户没有鱼"的问题  
✅ **字段名兼容** - 支持多种用户ID字段名（user_id, UserId, userId等）  
✅ **调试日志** - 添加详细的控制台日志帮助排查问题  
✅ **错误提示** - 更清晰的错误信息和调试指导  

详细文档：[docs/bug_fixed_docs/BATTLE_BUTTON_USER_FISH_FIX.md](docs/bug_fixed_docs/BATTLE_BUTTON_USER_FISH_FIX.md)

### 第二轮修复 (2025-11-05 下午)
✅ **实时更新** - 战斗后血量和经验值立即更新  
✅ **清晰显示** - 胜负双方的提示信息分开显示（左右分离）  
✅ **明显标识** - 添加大字体"WIN!"和"LOSE!"标识  
✅ **特殊事件** - 升级显示"LEVEL UP!"，死亡显示"DEAD!"  

详细文档：[docs/bug_fixed_docs/BATTLE_UI_UPDATE_FIX.md](docs/bug_fixed_docs/BATTLE_UI_UPDATE_FIX.md)

### 第一轮修复 (2025-11-05 上午)
✅ **碰撞检测** - 添加了行位置检查，只有同一行的鱼才能碰撞  
✅ **动画时序** - 碰撞效果立即显示，位置准确  
✅ **UI 显示** - 修复了状态 UI 不显示的问题  

详细文档：[docs/bug_fixed_docs/BATTLE_COLLISION_AND_UI_FIX.md](docs/bug_fixed_docs/BATTLE_COLLISION_AND_UI_FIX.md)

## 📚 完整文档

- **自动测试指南**: [docs/BATTLE_AUTO_TEST_GUIDE.md](docs/BATTLE_AUTO_TEST_GUIDE.md)
- **战斗系统**: [BATTLE_SYSTEM_README.md](BATTLE_SYSTEM_README.md)
- **修复文档**: [docs/bug_fixed_docs/BATTLE_COLLISION_AND_UI_FIX.md](docs/bug_fixed_docs/BATTLE_COLLISION_AND_UI_FIX.md)

## ⚙️ 故障排除

**服务器无法启动？**
```bash
# 停止占用端口的进程
netstat -ano | findstr :3000
taskkill /F /PID <进程ID>
```

**无法获取测试凭据？**
```bash
# 创建 .env.local 文件
cp env.local.example .env.local
# 编辑并设置 DEF_USE 和 DEF_PASS
```

**自动登录失败？**
1. 检查测试账号是否存在
2. 验证 Supabase 配置
3. 查看浏览器控制台错误

**战斗按钮提示"没有你的鱼"？**
1. 打开浏览器控制台（F12）
2. 点击战斗按钮查看日志
3. 查找"🔍"开头的调试信息
4. 确认你的鱼的用户ID与当前用户ID匹配
5. 如仍有问题，截图控制台发送给开发者

---

**开始测试吧！** 🎮 有问题查看完整文档或检查浏览器控制台。

