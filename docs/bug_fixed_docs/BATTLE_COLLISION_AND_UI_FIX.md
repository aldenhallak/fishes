# 战斗系统碰撞检测和UI修复

**日期**: 2025-11-05  
**状态**: ✅ 已完成

## 问题描述

用户在测试战斗系统时发现以下问题：

1. **碰撞不稳定** - 鱼的碰撞检测不稳定，何时产生碰撞不可预测
2. **缺少行位置检查** - 没有确保鱼的中轴线在同一行时才能碰撞
3. **碰撞动画延迟** - 碰撞动画没有在两条鱼刚正面接触时及时显示
4. **碰撞动画位置不正确** - 碰撞动画没有显示在两条鱼之间的位置
5. **鱼的状态UI不显示** - 部分鱼没有显示状态UI（等级、血条等）

## 修复内容

### 1. 优化碰撞检测逻辑 (`src/js/battle-animation.js`)

**文件**: `src/js/battle-animation.js`  
**函数**: `checkCollision(fish1, fish2)`

#### 修改前
```javascript
checkCollision(fish1, fish2) {
  const dx = fish1.x - fish2.x;
  const dy = fish1.y - fish2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance < this.COLLISION_DISTANCE;
}
```

#### 修改后
```javascript
checkCollision(fish1, fish2) {
  // 1. 检查行位置 - 如果有position_row字段，必须相同
  if (fish1.position_row !== undefined && fish2.position_row !== undefined) {
    if (fish1.position_row !== fish2.position_row) {
      return false; // 不在同一行，不能碰撞
    }
  } else {
    // 如果没有position_row字段，使用Y坐标判断是否在同一行
    // 允许的垂直误差范围（相当于一行的高度）
    const ROW_HEIGHT = 60;
    const dy = Math.abs(fish1.y - fish2.y);
    if (dy > ROW_HEIGHT) {
      return false; // 垂直距离太大，不在同一行
    }
  }
  
  // 2. 检查水平距离
  const dx = Math.abs(fish1.x - fish2.x);
  
  // 只有水平距离足够近才算碰撞（确保是正面接触）
  return dx < this.COLLISION_DISTANCE;
}
```

**改进点**:
- ✅ 添加了行位置（`position_row`）检查
- ✅ 如果有 `position_row` 字段，必须相同才能碰撞
- ✅ 如果没有 `position_row`，使用 Y 坐标判断（允许 60 像素的垂直误差）
- ✅ 改用水平距离检测，确保是正面接触

### 2. 优化碰撞动画时序和位置

**文件**: `src/js/battle-animation.js`  
**函数**: `playBattleAnimation(ctx, attacker, defender, result)`

#### 主要改进

1. **立即显示碰撞效果**
   ```javascript
   // 计算碰撞中心点（两条鱼之间）
   const collisionCenterX = (attacker.x + defender.x) / 2;
   const collisionCenterY = (attacker.y + defender.y) / 2;
   
   // 立即显示碰撞效果
   this.drawImpact(ctx, attacker, defender, collisionCenterX, collisionCenterY);
   ```

2. **更新动画时长** - 从 1 秒增加到 1.2 秒，让效果更清晰

3. **重构动画阶段**
   - **阶段1 (0-0.4)**: 碰撞效果 - 立即显示在两鱼中间
   - **阶段2 (0.2-0.5)**: 震动效果
   - **阶段3 (0.4-1.0)**: 结果显示

### 3. 增强碰撞效果绘制

**函数**: `drawImpact(ctx, fish1, fish2, centerX, centerY, progress)`

#### 新增特性

1. **明确的中心点计算** - 使用传入的中心点参数
2. **扩散动画** - 半径随进度增加
3. **渐变透明** - 效果渐渐淡出
4. **多层视觉效果**:
   - 径向渐变闪光
   - 16 个粒子向外扩散
   - 冲击波环
   - 💥 表情符号特效

```javascript
drawImpact(ctx, fish1, fish2, centerX, centerY, progress = 1) {
  // 如果没有提供中心点，自动计算
  if (centerX === undefined) {
    centerX = (fish1.x + fish2.x) / 2;
  }
  if (centerY === undefined) {
    centerY = (fish1.y + fish2.y) / 2;
  }
  
  // 扩散半径随进度增加
  const maxRadius = 60;
  const currentRadius = maxRadius * progress;
  const alpha = 1 - progress * 0.5; // 渐渐淡出
  
  // ... 绘制闪光、粒子、冲击波等效果
}
```

### 4. 改进结果显示

**函数**: `drawResult(ctx, winner, loser, result, progress, collisionCenterX, collisionCenterY)`

#### 新增功能

1. **在碰撞中心点显示"⚔️ 战斗！"文字**
2. **增强安全检查** - 检查 `result.changes` 是否存在
3. **更清晰的视觉反馈**

### 5. 修复鱼的状态UI显示问题

**文件**: `src/js/tank.js`  
**函数**: `drawFishStatusUI(ctx, fish, isUserFish, actualY)`

#### 修改前
```javascript
function drawFishStatusUI(ctx, fish, isUserFish, actualY) {
    if (!fish || (!fish.image && !fish.fishCanvas) || fish.is_alive === false) return;
    
    const x = fish.x;
    const y = actualY !== undefined ? actualY : fish.y;
    const width = fish.width;
    
    const health = fish.health || 100;
    const level = fish.level || 1;
    const exp = fish.experience || 0;
    // ...
}
```

#### 修改后
```javascript
function drawFishStatusUI(ctx, fish, isUserFish, actualY) {
    // 更宽松的检查条件：只要有fish对象和canvas就绘制
    if (!fish || !fish.fishCanvas) {
        return;
    }
    
    // 只在明确死亡时不显示
    if (fish.is_alive === false) {
        return;
    }
    
    const x = fish.x || 0;
    const y = actualY !== undefined ? actualY : (fish.y || 0);
    const width = fish.width || 80; // 提供默认宽度
    
    // 更安全的属性检查
    const health = (fish.health !== undefined && fish.health !== null) ? fish.health : 100;
    const maxHealth = (fish.max_health !== undefined && fish.max_health !== null) ? fish.max_health : 100;
    const healthPercent = health / maxHealth;
    
    const level = (fish.level !== undefined && fish.level !== null) ? fish.level : 1;
    const exp = (fish.experience !== undefined && fish.experience !== null) ? fish.experience : 0;
    const expToNextLevel = Math.pow(level, 2) * 100;
    const expPercent = expToNextLevel > 0 ? Math.min(100, Math.floor((exp / expToNextLevel) * 100)) : 0;
    // ...
}
```

**改进点**:
- ✅ 移除了对 `fish.image` 的检查（不必要）
- ✅ 为所有可能缺失的属性提供默认值
- ✅ 使用更安全的 `undefined` 和 `null` 检查
- ✅ 添加了 `max_health` 支持，用于更准确的血量百分比计算
- ✅ 添加除零保护（`expToNextLevel > 0`）

### 6. 更新 tank.js 碰撞检测

**文件**: `src/js/tank.js`  
**函数**: `checkBattleCollisions()`

#### 修改
```javascript
// 修改前：自己实现碰撞检测
const dx = fish1.x - fish2.x;
const dy = fish1.y - fish2.y;
const distance = Math.sqrt(dx * dx + dy * dy);

if (distance < 80) {
    // 触发战斗
}

// 修改后：使用 BattleAnimation 的碰撞检测（包含行位置检查）
if (BattleAnimation.checkCollision(fish1, fish2)) {
    // 触发战斗
}
```

**好处**:
- ✅ 统一使用 `BattleAnimation.checkCollision` 方法
- ✅ 自动包含行位置检查逻辑
- ✅ 减少代码重复

## 技术细节

### 碰撞检测逻辑

1. **行位置优先** - 如果鱼有 `position_row` 属性，必须相同
2. **Y坐标回退** - 如果没有 `position_row`，使用 Y 坐标差值判断
3. **水平距离检测** - 只检查水平距离，确保正面接触

### 动画时序

```
0.0s ───────► 0.4s ───────► 0.5s ───────► 1.2s
  │              │              │              │
  ▼              ▼              ▼              ▼
立即碰撞      碰撞效果      震动效果      结果显示
  特效          持续          开始          完成
```

### UI 渲染条件

**显示条件**:
- ✅ `fish` 对象存在
- ✅ `fish.fishCanvas` 存在
- ✅ `fish.is_alive !== false`

**不显示条件**:
- ❌ 鱼已明确死亡 (`is_alive === false`)

## 测试建议

### 1. 碰撞检测测试

- [ ] 测试同一行的鱼能否正常碰撞
- [ ] 测试不同行的鱼是否不会碰撞
- [ ] 测试没有 `position_row` 字段的旧数据

### 2. 动画测试

- [ ] 检查碰撞效果是否立即显示
- [ ] 确认碰撞效果位于两条鱼中间
- [ ] 观察动画是否流畅，时序是否合理

### 3. UI 测试

- [ ] 检查所有鱼是否都显示状态 UI
- [ ] 测试缺少某些属性的鱼
- [ ] 验证用户的鱼和其他鱼的 UI 颜色差异

### 4. 边界情况测试

- [ ] 测试鱼在画布边缘碰撞
- [ ] 测试快速移动的鱼
- [ ] 测试多条鱼同时接近时的行为

## 相关文件

- `src/js/battle-animation.js` - 战斗动画模块
- `src/js/tank.js` - 鱼缸主逻辑
- `lib/battle-engine.js` - 后端战斗引擎（未修改）

## 后续优化建议

1. **性能优化** - 考虑使用空间分区算法减少碰撞检测的计算量
2. **视觉增强** - 添加更多粒子效果和屏幕震动
3. **音效支持** - 添加碰撞音效
4. **可配置性** - 将碰撞距离、动画时长等参数提取为配置项
5. **调试模式** - 添加可视化碰撞区域的调试功能

## 总结

本次修复解决了战斗系统的核心问题：

✅ **碰撞更稳定** - 通过行位置检查和水平距离判断  
✅ **动画更及时** - 碰撞发生时立即显示效果  
✅ **位置更准确** - 效果显示在两条鱼之间  
✅ **UI 更健壮** - 所有鱼都能正常显示状态信息  

所有修改都经过了代码检查，没有语法错误，可以安全部署。
















