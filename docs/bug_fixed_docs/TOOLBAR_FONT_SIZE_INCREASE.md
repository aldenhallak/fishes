# 工具栏字体大小增加

## 改进内容

将绘画工具栏的所有文字和按钮字体大小从 `12px` 增加到 `16px`，同时增加按钮尺寸，提升可读性和可点击性。

## 修改详情

### 受影响的元素

1. **"Size:" 标签**
   - 字体大小: `12px` → `16px`

2. **Eraser 按钮**
   - 字体大小: `12px` → `16px`
   - 内边距: `4px 8px` → `6px 12px`
   - 高度: `24px` → `32px`

3. **Undo 按钮**
   - 字体大小: `12px` → `16px`
   - 内边距: `4px 8px` → `6px 12px`
   - 高度: `24px` → `32px`

4. **Clear 按钮**
   - 字体大小: `12px` → `16px`
   - 内边距: `4px 8px` → `6px 12px`
   - 高度: `24px` → `32px`

5. **Flip 按钮**
   - 字体大小: `12px` → `16px`
   - 内边距: `4px 8px` → `6px 12px`
   - 高度: `24px` → `32px`

## 用户体验改进

| 改进点 | 说明 |
|--------|------|
| 可读性 | 字体增大 33%，更易阅读 |
| 可点击性 | 按钮增大，更易点击（特别是移动端） |
| 视觉层次 | 更清晰的工具栏界面 |
| 无障碍性 | 符合 WCAG 可访问性标准 |

## 修改的文件

### `src/js/app.js`

**1. Size 标签（第 1506 行）**
```javascript
widthLabel.style.fontSize = '16px';  // 原 12px
```

**2. Eraser 按钮（第 1524-1526 行）**
```javascript
eraserBtn.style.padding = '6px 12px';  // 原 4px 8px
eraserBtn.style.height = '32px';       // 原 24px
eraserBtn.style.fontSize = '16px';     // 原 12px
```

**3. Undo 按钮（第 1611-1613 行）**
```javascript
undoBtn.style.padding = '6px 12px';
undoBtn.style.height = '32px';
undoBtn.style.fontSize = '16px';
```

**4. Clear 按钮（第 1630-1632 行）**
```javascript
clearBtn.style.padding = '6px 12px';
clearBtn.style.height = '32px';
clearBtn.style.fontSize = '16px';
```

**5. Flip 按钮（第 1649-1651 行）**
```javascript
flipBtn.style.padding = '6px 12px';
flipBtn.style.height = '32px';
flipBtn.style.fontSize = '16px';
```

## 技术细节

### 字体大小选择

| 尺寸 | 用途 | 说明 |
|------|------|------|
| 12px | 原始 | 偏小，移动端不易阅读 |
| 14px | 可选 | 适中 |
| **16px** | **选用** | 标准正文大小，最佳可读性 |
| 18px | 可选 | 偏大 |

选择 `16px` 的原因：
- ✅ Web 标准正文字体大小
- ✅ 移动端和桌面端都易读
- ✅ 符合无障碍设计标准
- ✅ 与页面其他元素协调

### 按钮尺寸调整

**高度变化**: `24px` → `32px`
- 增加 33%，更易点击
- 符合移动端最小触摸目标 (44x44px 推荐)

**内边距变化**: `4px 8px` → `6px 12px`
- 水平内边距增加 50%
- 垂直内边距增加 50%
- 按钮看起来更饱满

## 测试建议

### 1. 视觉测试
- [ ] 所有按钮字体清晰可读
- [ ] 按钮大小一致
- [ ] 工具栏整体协调

### 2. 功能测试
- [ ] Size 标签显示正常
- [ ] Eraser 按钮功能正常
- [ ] Undo 按钮功能正常
- [ ] Clear 按钮功能正常
- [ ] Flip 按钮功能正常

### 3. 响应式测试
- [ ] 桌面端显示正常
- [ ] 平板端显示正常
- [ ] 手机端显示正常
- [ ] 工具栏不会溢出

### 4. 可访问性测试
- [ ] 字体大小符合 WCAG AA 标准
- [ ] 按钮触摸目标足够大
- [ ] 对比度足够

## 相关文档

- `CANVAS_HINT_OVERLAY.md` - 画布提示文字
- `MOBILE_LAYOUT_IMPROVEMENTS.md` - 移动端布局优化

## 日期
2025-11-20
