# Profile页面UI优化和Footer管理

## 修改日期
2025-11-04

## 修改内容

### 1. Profile页面布局优化

#### 移除的元素
- ✅ 移除用户名后的"(You)"标记
- ✅ 隐藏"View My Fish"按钮
- ✅ 隐藏"Share Profile"按钮

#### 新增功能
- ✅ 给"Fish Created"统计卡片添加点击跳转功能，点击后跳转到 `rank.html?userId=xxx` 查看该用户的所有鱼

### 2. Footer显示优化

**修改目标**：只在主页（index.html）底部显示对原作者的引用声明，其他页面不显示footer

**修改文件**：`src/js/footer-utils.js`

#### 修改前
```javascript
// Auto-initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const isSpecialFooter = document.querySelector('#tank-content') !== null || 
                           window.location.pathname.includes('fishtank-view.html');
    
    insertFooter(isSpecialFooter);
});
```

#### 修改后
```javascript
// Auto-initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // 只在主页（index.html）显示footer
    const currentPath = window.location.pathname;
    const isHomePage = currentPath === '/' || 
                       currentPath === '/index.html' || 
                       currentPath.endsWith('/index.html') ||
                       currentPath === '';
    
    // 只在主页显示footer
    if (!isHomePage) {
        return;
    }
    
    const isSpecialFooter = document.querySelector('#tank-content') !== null || 
                           window.location.pathname.includes('fishtank-view.html');
    
    insertFooter(isSpecialFooter);
});
```

## 修改的文件

1. **src/js/profile.js**
   - 移除用户名的"(You)"后缀显示
   - 隐藏"View My Fish"和"Share Profile"按钮
   - 给Fish Created卡片添加点击跳转功能

2. **src/js/footer-utils.js**
   - 添加页面检测逻辑
   - 只在主页显示footer

## 效果验证

### Profile页面
- ✅ 用户名直接显示，无"(You)"后缀
- ✅ 只显示"Edit Profile"和"My Tanks"两个按钮
- ✅ 点击"Fish Created"卡片跳转到rank页面
- ✅ 页面底部无footer

### 主页（index.html）
- ✅ 页面底部保留原作者引用声明
- ✅ Footer内容："🎨 Based on DrawAFish by aldenhallak"
- ✅ 包含社交媒体链接

### 其他页面
- ✅ 所有非主页（profile.html, rank.html, tank.html等）不显示footer

## 注意事项

- 虽然其他页面的HTML文件中仍然引用了`footer-utils.js`，但由于脚本内部的页面检测逻辑，footer不会在这些页面显示
- 如果需要在特定页面手动显示footer，可以调用 `window.footerUtils.insertFooter()`

## 兼容性

- 完全向后兼容
- 不影响现有功能
- 所有页面正常工作

























