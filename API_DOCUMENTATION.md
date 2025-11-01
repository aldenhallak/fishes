# 🎮 Fish Art Battle API 文档

## 📋 目录

- [战斗系统 API](#战斗系统-api)
- [经济系统 API](#经济系统-api)
- [鱼管理 API](#鱼管理-api)
- [错误码](#错误码)

---

## 🎯 战斗系统 API

### 1. 进入战斗模式

**POST** `/api/battle/enter-mode`

进入战斗模式，开始与其他玩家的鱼战斗。

**请求体：**
```json
{
  "userId": "user123",
  "fishId": "uuid-fish-id"
}
```

**成功响应（200）：**
```json
{
  "success": true,
  "currentUsers": 45,
  "maxUsers": 100,
  "message": "成功进入战斗模式"
}
```

**队列响应（200）：**
```json
{
  "success": false,
  "inQueue": true,
  "position": 5,
  "queueLength": 10,
  "estimatedWait": 60,
  "currentUsers": 100,
  "maxUsers": 100,
  "message": "战斗模式已满，已加入等待队列"
}
```

**错误响应：**
- `400` - 缺少参数或鱼已死亡
- `403` - 鱼不属于该用户
- `404` - 鱼不存在

---

### 2. 离开战斗模式

**POST** `/api/battle/leave-mode`

离开战斗模式。

**请求体：**
```json
{
  "userId": "user123"
}
```

**响应（200）：**
```json
{
  "success": true,
  "currentUsers": 44,
  "maxUsers": 100,
  "message": "已离开战斗模式"
}
```

---

### 3. 心跳保活

**POST** `/api/battle/heartbeat`

保持战斗模式在线状态，每60秒调用一次。

**请求体：**
```json
{
  "userId": "user123",
  "fishId": "uuid-fish-id"
}
```

**响应（200）：**
```json
{
  "success": true,
  "inBattleMode": true,
  "currentUsers": 45,
  "maxUsers": 100,
  "timestamp": "2025-10-31T12:00:00.000Z"
}
```

---

### 4. 触发战斗

**POST** `/api/battle/trigger`

当两条鱼碰撞时触发战斗。

**请求体：**
```json
{
  "attackerId": "uuid-attacker-fish-id",
  "defenderId": "uuid-defender-fish-id"
}
```

**响应（200）：**
```json
{
  "success": true,
  "winnerId": "uuid-winner-fish-id",
  "loserId": "uuid-loser-fish-id",
  "attackerWins": true,
  "battle": {
    "attackerPower": 42.5,
    "defenderPower": 38.0,
    "attackerFinalPower": 45.2,
    "defenderFinalPower": 36.8,
    "powerDiff": 8.4
  },
  "changes": {
    "winner": {
      "id": "uuid-winner-fish-id",
      "expGained": 50,
      "levelUp": false,
      "newLevel": 5,
      "newPosition": 3
    },
    "loser": {
      "id": "uuid-loser-fish-id",
      "healthLost": 1,
      "newHealth": 7,
      "isDead": false,
      "newPosition": 4
    }
  }
}
```

---

### 5. 查询队列状态

**POST** `/api/battle/queue-status`

查询当前排队状态（用于轮询）。

**请求体：**
```json
{
  "userId": "user123"
}
```

**可进入响应（200）：**
```json
{
  "success": true,
  "canEnter": true,
  "currentUsers": 90,
  "maxUsers": 100,
  "message": "现在可以进入战斗模式"
}
```

**仍在队列响应（200）：**
```json
{
  "success": true,
  "canEnter": false,
  "inQueue": true,
  "position": 5,
  "queueLength": 10,
  "estimatedWait": 60,
  "currentUsers": 100,
  "maxUsers": 100
}
```

---

## 💰 经济系统 API

### 1. 查询鱼食余额

**GET** `/api/economy/balance?userId=user123`

查询用户的鱼食数量。

**响应（200）：**
```json
{
  "success": true,
  "userId": "user123",
  "fishFood": 25,
  "lastDailyBonus": "2025-10-31T00:00:00.000Z",
  "createdAt": "2025-10-01T12:00:00.000Z"
}
```

---

### 2. 每日签到

**POST** `/api/economy/daily-bonus`

每日签到领取鱼食奖励（10个）。

**请求体：**
```json
{
  "userId": "user123"
}
```

**成功响应（200）：**
```json
{
  "success": true,
  "amount": 10,
  "newBalance": 35,
  "message": "签到成功！获得 10 个鱼食"
}
```

**已签到响应（200）：**
```json
{
  "success": false,
  "alreadyClaimed": true,
  "message": "今天已签到过了",
  "nextBonusIn": {
    "hours": 8,
    "minutes": 30,
    "timestamp": "2025-11-01T00:00:00.000Z"
  }
}
```

---

### 3. 喂食（回血）

**POST** `/api/economy/feed`

喂食鱼，恢复血量。消耗1个鱼食，恢复2点血量。

**请求体：**
```json
{
  "userId": "user123",
  "fishId": "uuid-fish-id"
}
```

**成功响应（200）：**
```json
{
  "success": true,
  "message": "喂食成功！恢复了 2 点血量",
  "fish": {
    "health": 10,
    "maxHealth": 10,
    "healthRestored": 2
  },
  "economy": {
    "fishFood": 24,
    "spent": 1
  }
}
```

**错误响应：**
```json
{
  "success": false,
  "insufficientFunds": true,
  "message": "鱼食不足",
  "current": 0,
  "required": 1
}
```

---

### 4. 复活鱼

**POST** `/api/economy/revive`

复活死亡的鱼。消耗5个鱼食。

**请求体：**
```json
{
  "userId": "user123",
  "fishId": "uuid-fish-id"
}
```

**成功响应（200）：**
```json
{
  "success": true,
  "message": "复活成功！你的鱼 重获新生",
  "fish": {
    "id": "uuid-fish-id",
    "health": 10,
    "isAlive": true
  },
  "economy": {
    "fishFood": 19,
    "spent": 5
  }
}
```

---

## 🐟 鱼管理 API

### 1. 创建新鱼

**POST** `/api/fish/create`

画完鱼后创建新鱼。消耗2个鱼食。

**请求体：**
```json
{
  "userId": "user123",
  "imageUrl": "https://example.com/fish.png",
  "artist": "Alice"
}
```

**成功响应（200）：**
```json
{
  "success": true,
  "message": "创建成功！",
  "fish": {
    "id": "uuid-new-fish-id",
    "imageUrl": "https://example.com/fish.png",
    "artist": "Alice",
    "talent": 65,
    "level": 1,
    "health": 10,
    "maxHealth": 10,
    "createdAt": "2025-10-31T12:00:00.000Z"
  },
  "economy": {
    "fishFood": 23,
    "spent": 2
  },
  "talentRating": {
    "grade": "A",
    "color": "#9370DB",
    "text": "卓越"
  }
}
```

**天赋评级：**
- S级（70-100）：传说 🌟
- A级（60-69）：卓越 💎
- B级（50-59）：优秀 ⭐
- C级（40-49）：良好 ✨
- D级（25-39）：普通 ⚪

---

## ❌ 错误码

### HTTP状态码

- `200` - 成功
- `400` - 请求参数错误
- `403` - 权限不足
- `404` - 资源不存在
- `405` - 方法不允许
- `500` - 服务器错误
- `503` - 服务暂时不可用

### 业务错误

所有业务错误都返回200状态码，但`success: false`：

```json
{
  "success": false,
  "error": "错误消息",
  "insufficientFunds": true,  // 鱼食不足
  "alreadyClaimed": true,      // 已签到
  "inQueue": true,             // 在队列中
  "fullHealth": true,          // 血量已满
  "alreadyAlive": true         // 已存活
}
```

---

## 🔧 速率限制

为防止滥用，所有API都有速率限制：

- 默认：**10次/分钟/用户**
- 心跳API：**2次/分钟/用户**
- 战斗触发：**20次/分钟/用户**

超过限制返回：
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 30
}
```

---

## 📦 数据模型

### Fish（鱼）

```typescript
interface Fish {
  id: string;              // UUID
  user_id: string;         // 用户ID
  image_url: string;       // 图片URL
  artist: string;          // 作者名
  created_at: string;      // 创建时间
  
  talent: number;          // 天赋值 (25-75)
  level: number;           // 等级
  experience: number;      // 经验值
  health: number;          // 当前血量
  max_health: number;      // 最大血量
  upvotes: number;         // 点赞数
  battle_power: number;    // 战斗力
  
  is_alive: boolean;       // 是否存活
  is_in_battle_mode: boolean; // 是否在战斗模式
  position_row: number;    // Y轴位置
  
  total_wins: number;      // 总胜场
  total_losses: number;    // 总败场
}
```

### UserEconomy（用户经济）

```typescript
interface UserEconomy {
  user_id: string;         // 用户ID
  fish_food: number;       // 鱼食数量
  total_earned: number;    // 累计获得
  total_spent: number;     // 累计消耗
  last_daily_bonus: string; // 最后签到时间
  created_at: string;      // 创建时间
}
```

---

## 🧪 测试示例

### JavaScript

```javascript
// 进入战斗模式
const enterBattle = async (userId, fishId) => {
  const response = await fetch('/api/battle/enter-mode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, fishId })
  });
  
  return await response.json();
};

// 使用
const result = await enterBattle('user123', 'fish-uuid');
console.log(result);
```

### curl

```bash
# 查询余额
curl "http://localhost:3000/api/economy/balance?userId=user123"

# 每日签到
curl -X POST http://localhost:3000/api/economy/daily-bonus \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123"}'

# 触发战斗
curl -X POST http://localhost:3000/api/battle/trigger \
  -H "Content-Type: application/json" \
  -d '{"attackerId":"fish1-uuid","defenderId":"fish2-uuid"}'
```

---

## 📞 技术支持

遇到问题？请查看：
- [部署指南](SETUP.md)
- [GitHub Issues](https://github.com/yourusername/fish-art-battle/issues)
- 邮箱：support@fishart.com



