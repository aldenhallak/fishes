# Supabase getUser 方法名修复

## 问题描述

**时间**: 2025-11-04

**症状**:
- 点击Battle按钮时出现错误
- 错误信息: `TypeError: window.supabaseAuth.getUser is not a function`
- 位置: `tank.html:633`

**错误日志**:
```
✅ Supabase auth module loaded
✅ Supabase client initialized
tank.html:701 进入战斗模式错误: TypeError: window.supabaseAuth.getUser is not a function
    at HTMLButtonElement.<anonymous> (tank.html:633:50)
```

## 根本原因

### 方法名不一致

在 `src/js/supabase-init.js` 中，导出的方法名是 `getCurrentUser`（第318行）：

```javascript
window.supabaseAuth = {
  // 认证函数
  signUp,
  signIn,
  signInWithOAuth,
  signOut,
  getCurrentUser,  // ✅ 正确的方法名
  getSession,
  // ...
};
```

但在使用时，多个文件调用的是 `getUser()`（不存在的方法）：

**文件**: `tank.html` (第633行)
```javascript
const user = await window.supabaseAuth.getUser();  // ❌ 方法不存在
```

**文件**: `src/js/fishtank-view-battle.js`
```javascript
const user = await window.supabaseAuth.getUser();  // ❌ 方法不存在
```

### 影响范围

搜索结果显示4个文件使用了错误的方法名：
1. `tank.html` - Battle按钮点击处理
2. `src/js/fishtank-view-battle.js` - 个人鱼缸Battle功能
3. `docs/bug_fixed_docs/TANK_BATTLE_BUTTON_COMPLETE.md` - 文档
4. `docs/bug_fixed_docs/BATTLE_BUTTON_IMPLEMENTATION.md` - 文档

## 解决方案

### 选项1: 修改所有调用处 ❌

需要修改多个文件：
```javascript
// 修改前
const user = await window.supabaseAuth.getUser();

// 修改后
const user = await window.supabaseAuth.getCurrentUser();
```

**缺点**: 需要修改多个文件，容易遗漏

### 选项2: 添加别名 ✅ (采用)

在 `src/js/supabase-init.js` 中添加 `getUser` 作为 `getCurrentUser` 的别名：

```javascript
window.supabaseAuth = {
  // 客户端（getter，确保获取最新的客户端实例）
  get client() {
    return supabase;
  },
  
  // 认证函数
  signUp,
  signIn,
  signInWithOAuth,
  signOut,
  getCurrentUser,
  getUser: getCurrentUser, // ✅ 别名，兼容性
  getSession,
  onAuthStateChange,
  resetPasswordForEmail,
  updatePassword,
  getAccessToken,
  
  // 辅助函数
  isLoggedIn,
  requireAuth,
  getUserDisplayName
};
```

**优点**:
- 只需修改一个文件
- 提供向后兼容性
- 不会破坏现有代码
- 两种方法名都可以使用

## 测试验证

### 测试步骤

1. **访问公共鱼缸页面**
   ```
   http://localhost:3000/tank.html?capacity=50
   ```

2. **点击Battle按钮**
   - 应该能正常获取用户信息
   - 不再出现 `getUser is not a function` 错误

3. **检查控制台**
   - ✅ Supabase auth module loaded
   - ✅ Supabase client initialized
   - ✅ 没有错误

### 预期结果

**登录用户**:
- 点击Battle按钮 → 进入战斗模式
- 显示成功消息
- 跳转到战斗页面

**未登录用户**:
- 点击Battle按钮 → 提示"请先登录"
- 跳转到登录页面

## 技术要点

### JavaScript 对象别名

```javascript
const obj = {
  originalMethod() { return 'result'; },
  aliasMethod: originalMethod  // 别名
};

obj.originalMethod();  // ✅ 'result'
obj.aliasMethod();     // ✅ 'result'
```

### 函数引用 vs 函数调用

```javascript
// ✅ 正确 - 函数引用（不带括号）
getUser: getCurrentUser

// ❌ 错误 - 函数调用（会立即执行）
getUser: getCurrentUser()
```

### Window对象导出模式

```javascript
// 模式1: 导出对象（推荐）
window.supabaseAuth = {
  method1,
  method2,
  alias: method1  // 别名
};

// 模式2: 直接导出（兼容性）
window.getCurrentUser = getCurrentUser;
window.getUser = getCurrentUser;  // 可以添加多个别名
```

## 相关修复

这是一系列修复的第3个：

1. **FISH_UPLOAD_FORMIDABLE_FIX.md**
   - 修复图片上传卡住问题
   - multipart请求体被dev-server预读取

2. **FISH_SUBMIT_DOWNVOTES_FIX.md**
   - 修复数据库提交失败
   - 移除已废弃的downvotes字段

3. **SUPABASE_GETUSER_FIX.md** ← 本次
   - 修复Battle按钮错误
   - 添加getUser方法别名

## 完整流程测试

现在所有已知问题都已修复：

```
✅ 用户登录
    ↓
✅ 画鱼 (Canvas)
    ↓
✅ AI检测 (ONNX Runtime)
    ↓
✅ 上传图片 (七牛云) - FORMIDABLE修复
    ↓
✅ 提交数据 (Hasura) - DOWNVOTES修复
    ↓
✅ 进入战斗模式 - GETUSER修复
    ↓
✅ 鱼显示在鱼缸
```

## API 一致性检查清单

为避免类似问题，检查以下内容：

- [ ] 所有导出的方法名与调用处一致
- [ ] 提供常见别名（如 `getUser` / `getCurrentUser`）
- [ ] 在文档中明确说明可用方法
- [ ] 使用 TypeScript 类型检查（推荐）

## 修改文件列表

- `src/js/supabase-init.js` (第319行) - 添加 getUser 别名

## 修复日期

2025-11-04

## 修复者

AI Assistant (Claude Sonnet 4.5)

## 相关文档

- `FISH_UPLOAD_FORMIDABLE_FIX.md` - 上传修复
- `FISH_SUBMIT_DOWNVOTES_FIX.md` - 提交修复
- `TANK_BATTLE_BUTTON_COMPLETE.md` - Battle功能文档

