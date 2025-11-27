# 全局鱼缸过滤修复说明

## 问题描述
- 用户 `11312701-f1d2-43f8-a13d-260eac812b7a` 的全局鱼缸正常
- 用户 `f4933d0f-35a0-4aa1-8de5-ba407714b65c` 的全局鱼缸只显示他自己的3条鱼
- 问题：一开始会加载比较多的鱼，但过几秒后又被过滤到只剩3条

## 根本原因
1. `loadInitialFish()` 加载固定数量的鱼（如50条）
2. 如果这50条中用户自己的鱼很多（如40条），过滤后只剩11条
3. `filterUserFishToNewestOnly()` 函数会在加载后多次运行（立即、2秒后、4秒后），将用户的鱼进一步过滤到只剩1条
4. 最终导致鱼缸中只有很少的鱼

## 修复方案

### 修改 1: `loadInitialFish()` 函数
**位置**: `src/js/tank.js` 第808行开始

**新逻辑**:
1. 加载 **1.5倍** 的目标数量（要显示50条就加载75条）
2. 动态决定保留多少用户自己的鱼：
   - 如果其他用户的鱼 >= 目标数量：严格限制用户自己的鱼（最多20%或3条）
   - 如果其他用户的鱼 < 目标数量：允许更多用户自己的鱼填充到目标数量
3. 确保最终显示的鱼数量达到目标

**关键代码**:
```javascript
const maxUserFishAllowed = Math.max(3, Math.floor(maxTankCapacity * 0.2));

if (availableOtherFish >= maxTankCapacity) {
    // 其他用户的鱼已经足够，严格限制
    userFishToKeep = userFishDocs.slice(0, Math.min(maxUserFishAllowed, userFishDocs.length));
} else {
    // 其他用户的鱼不够，需要用户自己的鱼填充
    const neededUserFish = Math.min(
        maxTankCapacity - availableOtherFish,
        userFishDocs.length
    );
    userFishToKeep = userFishDocs.slice(0, neededUserFish);
}
```

### 修改 2: `filterUserFishToNewestOnly()` 函数
**位置**: `src/js/tank.js` 第1160行开始

**新逻辑**:
使用与 `loadInitialFish()` 相同的过滤逻辑，确保后续的过滤调用不会破坏初始加载的鱼数量。

**关键改动**:
```javascript
// 动态决定保留多少用户的鱼
const maxUserFishAllowed = Math.max(3, Math.floor(maxTankCapacity * 0.2));

if (availableOtherFish >= maxTankCapacity) {
    targetUserFishCount = Math.min(maxUserFishAllowed, aliveUserFish.length);
} else {
    targetUserFishCount = Math.min(
        maxTankCapacity - availableOtherFish,
        aliveUserFish.length
    );
}
```

## 测试步骤

### 1. 清除缓存
清除浏览器缓存或使用无痕模式访问

### 2. 测试用户 f4933d0f-35a0-4aa1-8de5-ba407714b65c
```
1. 访问: http://localhost:3000/tank.html?capacity=50
2. 打开浏览器控制台（F12）
3. 观察日志输出
```

**预期日志**:
```
🐠 Loading 75 fish (target: 50) with sort type: recent
🐠 Received 75 fish documents
🐠 [Global Tank] Loaded fish from X different users
🐠 [Global Tank] Fish filtering stats: { totalFish: 75, userFishCount: 40, otherFishCount: 35 }
🐠 Need more fish to reach 50, keeping 15 user fish (have 35 other fish)
🐠 Final filtered: 50 fish (15 from user, 35 from others)

[2秒后]
🐠 Need more fish to reach 50, keeping 15 user fish (have 35 other fish)
🐠 User has 15 fish, no filtering needed (within limit)

[4秒后]
🐠 Need more fish to reach 50, keeping 15 user fish (have 35 other fish)
🐠 User has 15 fish, no filtering needed (within limit)
```

**预期结果**:
- 鱼缸持续显示接近50条鱼
- 不会在几秒后突然减少到3条

### 3. 测试正常用户
```
1. 访问: http://localhost:3000/tank.html?capacity=50
2. 应该能正常显示50条鱼
3. 用户自己的鱼被限制在合理数量
```

## 优势

1. ✅ **优先保证鱼的总数量** - 用户体验更好
2. ✅ **动态平衡** - 根据实际情况决定用户鱼的数量
3. ✅ **防止空鱼缸** - 即使用户的鱼很多，也能保证鱼缸有足够的鱼
4. ✅ **公平性** - 当有足够多样性时，限制单个用户的鱼

## 配置参数

- `maxTankCapacity`: 鱼缸容量（默认20，可通过URL参数 `capacity` 设置）
- `maxUserFishAllowed`: 用户鱼的最大数量 = `Math.max(3, Math.floor(maxTankCapacity * 0.2))`
  - 容量20: 最多4条用户鱼
  - 容量50: 最多10条用户鱼
  - 容量100: 最多20条用户鱼

## 注意事项

- 修改后需要清除浏览器缓存
- 如果数据库中其他用户的鱼数量不足，会允许显示更多当前用户的鱼
- 过滤逻辑在初始加载和后续检查中保持一致

