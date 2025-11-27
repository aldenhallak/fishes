# 鱼游动行为统一修复

## 问题描述
私人鱼缸和全局鱼缸的鱼游动行为不同，虽然它们共用同一个页面和动画循环。

## 问题分析

### 根本原因
虽然两个鱼缸共用 `animateFishes()` 动画循环，但创建鱼对象时的参数不一致：

1. **全局鱼缸** (`loadFishImageToTank`):
   ```javascript
   speed: fishData.speed || 2
   phase: fishData.phase || 0
   amplitude: fishData.amplitude || 32  // 使用32
   vx: speed * direction * 0.1
   vy: (Math.random() - 0.5) * 0.5
   ```

2. **私人鱼缸** (`createPrivateFishObject`):
   - 之前没有明确传递游动参数
   - 可能使用 `createFishObject` 的默认值：
     ```javascript
     amplitude = 24  // 默认值24，与全局鱼缸的32不同！
     speed = 2
     phase = 0
     ```

### 参数差异影响

| 参数 | 全局鱼缸 | 私人鱼缸（修复前） | 影响 |
|-----|---------|------------------|-----|
| `amplitude` | 32 | 24（默认） | 游动幅度不同 |
| `speed` | 2 | 2 | 相同 ✅ |
| `phase` | 0 | 0 | 相同 ✅ |
| `vx` | `speed * direction * 0.1` | 0（默认） | 初始水平速度不同 |
| `vy` | `(Math.random() - 0.5) * 0.5` | 0（默认） | 初始垂直速度不同 |

## 修复方案

### 修改 `createPrivateFishObject` 函数

**位置**: `src/js/tank.js` 第1773行

**修改前**:
```javascript
loadFishImageToTank(imageUrl, {
    ...fishData,
    docId: fishData.id || fishData.docId,
    // 没有明确传递游动参数
}, (fishObj) => {
```

**修改后**:
```javascript
loadFishImageToTank(imageUrl, {
    ...fishData,
    docId: fishData.id || fishData.docId,
    // 确保游动参数与全局鱼缸完全一致
    speed: fishData.speed || 2,      // 与全局鱼缸相同
    phase: fishData.phase || 0,      // 与全局鱼缸相同
    amplitude: fishData.amplitude || 32,  // 与全局鱼缸相同（不是默认的24）
    peduncle: fishData.peduncle || 0.4,   // 与全局鱼缸相同
    // ... 其他字段
}, (fishObj) => {
```

## 关键改进

### 1. 统一游动参数 ✅
- `amplitude`: 32（与全局鱼缸一致）
- `speed`: 2（与全局鱼缸一致）
- `phase`: 0（与全局鱼缸一致）
- `vx` 和 `vy`: 由 `loadFishImageToTank` 统一计算

### 2. 使用相同的创建函数 ✅
- 私人鱼缸现在完全使用 `loadFishImageToTank`
- 确保所有参数处理逻辑一致

### 3. 保持死鱼特殊处理 ✅
- 死鱼仍然游得慢（`vx *= 0.3`, `vy *= 0.2`）
- 但只影响明确标记为死鱼的鱼

## 游动参数说明

### amplitude（游动幅度）
- **全局鱼缸**: 32像素
- **私人鱼缸（修复后）**: 32像素 ✅
- **影响**: 鱼上下摆动的幅度

### speed（游动速度）
- **全局鱼缸**: 2
- **私人鱼缸（修复后）**: 2 ✅
- **影响**: 鱼的水平移动速度

### phase（相位）
- **全局鱼缸**: 0（随机）
- **私人鱼缸（修复后）**: 0（随机）✅
- **影响**: 鱼的游动节奏偏移

### vx, vy（初始速度）
- **全局鱼缸**: 
  - `vx = speed * direction * 0.1`
  - `vy = (Math.random() - 0.5) * 0.5`
- **私人鱼缸（修复后）**: 相同 ✅
- **影响**: 鱼的初始移动方向和速度

## 测试验证

### 测试步骤

1. **打开全局鱼缸**
   ```
   http://localhost:3000/tank.html
   ```
   - 观察鱼的游动行为
   - 注意游动幅度、速度、节奏

2. **打开私人鱼缸**
   ```
   http://localhost:3000/tank.html?view=my
   ```
   - 观察鱼的游动行为
   - 对比与全局鱼缸是否一致

3. **对比检查**
   - ✅ 游动幅度应该相同（32像素）
   - ✅ 游动速度应该相同
   - ✅ 游动节奏应该相似
   - ✅ 初始移动方向应该随机

### 预期结果

**修复前**:
- ❌ 私人鱼缸的鱼游动幅度较小（24 vs 32）
- ❌ 可能游动速度不同
- ❌ 游动节奏不一致

**修复后**:
- ✅ 两个鱼缸的鱼游动行为完全一致
- ✅ 游动幅度相同（32像素）
- ✅ 游动速度相同
- ✅ 游动节奏相似

## 代码一致性

### 共用代码
- ✅ `animateFishes()` - 动画循环
- ✅ `drawWigglingFish()` - 绘制函数
- ✅ `loadFishImageToTank()` - 图片加载和鱼对象创建
- ✅ `createFishObject()` - 鱼对象创建
- ✅ `makeDisplayFishCanvas()` - Canvas渲染

### 统一参数
- ✅ `amplitude`: 32
- ✅ `speed`: 2
- ✅ `phase`: 0（随机）
- ✅ `vx`, `vy`: 统一计算

## 总结

通过明确传递游动参数，确保私人鱼缸和全局鱼缸使用完全相同的游动设置：

1. **统一 amplitude**: 24 → 32
2. **明确传递所有游动参数**
3. **使用相同的创建函数**

现在两个鱼缸的鱼游动行为应该完全一致了！🎉

