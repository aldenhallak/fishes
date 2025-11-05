# Battle功能Redis依赖说明

## 问题描述

**时间**: 2025-11-04

**症状**:
- 点击Battle按钮后返回500错误
- 控制台显示: `POST http://localhost:3000/api/battle/enter-mode 500 (Internal Server Error)`
- Redis连接失败: `Error: getaddrinfo ENOTFOUND xxx.upstash.io`

## 根本原因

### Battle系统架构

Battle系统使用 **Redis** 来管理实时战斗状态：

1. **在线用户管理**: 跟踪当前在战斗模式的用户
2. **战斗队列**: 当战斗模式满时的等待队列
3. **实时匹配**: 快速查找可匹配的对手
4. **会话管理**: 战斗心跳和超时处理

### 为什么需要Redis

**PostgreSQL (Hasura) 不适合**:
- ❌ 太慢：每次匹配需要查询数据库
- ❌ 并发问题：多个用户同时进入可能冲突
- ❌ 无过期机制：需要手动清理超时用户

**Redis 的优势**:
- ✅ 超快：内存操作，毫秒级响应
- ✅ 原子操作：INCR/DECR 无并发问题
- ✅ 自动过期：TTL自动清理断线用户
- ✅ 发布订阅：支持实时通知

### 当前状态

**`.env.local` 中的配置**:
```env
REDIS_URL=redis://default:xxx@xxx.upstash.io:6379
```

**问题**: Upstash Redis无法连接（可能是网络问题、账号过期或凭据无效）

## 解决方案

### 方案1: 配置本地Redis（推荐用于开发）

#### Windows安装

1. **下载Redis for Windows**
   - https://github.com/microsoftarchive/redis/releases
   - 下载 `Redis-x64-3.2.100.msi`

2. **安装并启动**
   ```powershell
   # 安装后自动启动服务
   # 或手动启动
   redis-server
   ```

3. **更新 `.env.local`**
   ```env
   REDIS_URL=redis://localhost:6379
   ```

#### Mac/Linux安装

```bash
# Mac (使用Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# 更新 .env.local
REDIS_URL=redis://localhost:6379
```

### 方案2: 使用免费的Cloud Redis

#### Upstash Redis (免费套餐)

1. 访问 https://upstash.com/
2. 创建免费账户
3. 创建Redis数据库
4. 复制连接URL
5. 更新 `.env.local`

#### Redis Labs (免费30MB)

1. 访问 https://redis.com/try-free/
2. 创建账户并设置数据库
3. 获取连接信息
4. 更新配置

### 方案3: 禁用Battle功能（临时）

如果不需要Battle功能，可以隐藏Battle按钮：

**tank.html** (第633行附近):
```javascript
// 临时隐藏Battle按钮
const tankBattleBtn = document.getElementById('tank-battle-btn');
if (tankBattleBtn) {
  tankBattleBtn.style.display = 'none';  // 隐藏
}
```

或完全删除Battle按钮的HTML代码。

## 修复后的API响应

### 友好的错误消息

**修改**: `api/battle/enter-mode.js`

```javascript
// 之前：简单返回503
if (!redisClient) {
  return res.status(503).json({
    success: false,
    error: 'Redis服务暂时不可用'
  });
}

// 现在：提供详细信息
if (!redisClient) {
  console.log('⚠️  Redis未配置，跳过战斗模式检查');
  return res.status(503).json({
    success: false,
    error: 'Battle功能暂时不可用',
    message: 'Redis服务未配置或无法连接。请联系管理员配置REDIS_URL环境变量。',
    needsSetup: true
  });
}
```

### 更好的错误处理

```javascript
} catch (error) {
  console.error('进入战斗模式失败:', error);
  console.error('错误堆栈:', error.stack);
  
  // 特殊处理Redis错误
  if (error.message && error.message.includes('Redis')) {
    return res.status(503).json({
      success: false,
      error: 'Battle功能暂时不可用',
      message: 'Redis连接失败',
      needsSetup: true
    });
  }
  
  return res.status(500).json({
    success: false,
    error: '服务器错误',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

## 测试Redis连接

### 创建测试脚本

```javascript
// test-redis-connection.js
require('dotenv').config({ path: '.env.local' });
const redis = require('./lib/redis');

async function test() {
  console.log('Testing Redis...');
  console.log('REDIS_URL:', process.env.REDIS_URL);
  
  const client = redis.getRedisClient();
  if (!client) {
    console.error('❌ Redis client not initialized');
    return;
  }
  
  try {
    await redis.addBattleUser('test', 'test-fish');
    console.log('✅ Redis connection working!');
    await redis.removeBattleUser('test');
  } catch (error) {
    console.error('❌ Redis error:', error.message);
  }
}

test().then(() => process.exit(0));
```

### 运行测试

```bash
node test-redis-connection.js
```

## Battle功能依赖清单

### 必需服务

1. **PostgreSQL (Hasura)** ✅ 已配置
   - 存储鱼数据、用户数据、战斗日志

2. **Redis** ❌ 需要配置
   - 管理在线状态、匹配队列

### 可选服务

3. **WebSocket** (未实现)
   - 实时战斗通知
   - 当前使用轮询替代

## Redis配置参数

### 环境变量

```env
# 基础连接
REDIS_URL=redis://localhost:6379

# 或带认证
REDIS_URL=redis://username:password@host:port

# 或Upstash (TLS)
REDIS_URL=rediss://default:password@xxx.upstash.io:6379

# Battle配置
MAX_BATTLE_USERS=100  # 最大在线用户数
BATTLE_HEARTBEAT_INTERVAL=30000  # 心跳间隔(ms)
BATTLE_TIMEOUT=60000  # 超时时间(ms)
```

### Redis数据结构

```redis
# 在线用户集合
battle:users -> Set { userId1, userId2, ... }

# 用户-鱼映射
battle:user:{userId} -> fishId

# 等待队列
battle:queue -> List [ userId1, userId2, ... ]

# 鱼状态（带TTL）
battle:fish:{fishId} -> { userId, enteredAt, ... }  EX 60
```

## 前端处理

### Battle按钮点击处理

```javascript
// tank.html
try {
  const result = await BattleClient.enterBattleMode(user.id, fishId);
  
  if (result.needsSetup) {
    alert('⚠️ Battle功能暂时不可用\n\n' + result.message);
    return;
  }
  
  if (result.success) {
    alert('✅ 成功进入战斗模式！');
  }
} catch (error) {
  if (error.message.includes('503')) {
    alert('⚠️ Battle功能需要Redis服务\n\n请联系管理员配置。');
  } else {
    alert('❌ 错误: ' + error.message);
  }
}
```

## 生产环境建议

### 1. 使用可靠的Redis服务

**推荐服务**:
- Upstash (Serverless Redis)
- Redis Labs (Redis Enterprise)
- AWS ElastiCache
- Google Cloud Memorystore

### 2. 配置高可用

```javascript
// lib/redis.js
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  },
  reconnectOnError: (err) => {
    return err.message.includes('READONLY');
  }
});
```

### 3. 监控Redis健康

```javascript
// 添加健康检查端点
// api/health/redis.js
module.exports = async (req, res) => {
  const client = redis.getRedisClient();
  if (!client) {
    return res.status(503).json({ status: 'unavailable' });
  }
  
  try {
    await client.ping();
    return res.json({ status: 'ok' });
  } catch (error) {
    return res.status(503).json({ 
      status: 'error',
      message: error.message
    });
  }
};
```

### 4. 优雅降级

```javascript
// 如果Redis不可用，提供降级功能
if (!redisAvailable) {
  // 选项1: 使用数据库模拟（性能较差）
  // 选项2: 禁用实时匹配，改为异步匹配
  // 选项3: 显示维护提示
}
```

## 修改文件列表

1. **api/battle/enter-mode.js**
   - 改进Redis不可用时的错误消息
   - 添加详细的错误日志

## 修复日期

2025-11-04

## 修复者

AI Assistant (Claude Sonnet 4.5)

## 下一步行动

**开发环境（本地）**:
1. 安装本地Redis
2. 更新 `REDIS_URL=redis://localhost:6379`
3. 重启dev-server
4. 测试Battle按钮

**生产环境**:
1. 配置Upstash或其他云Redis
2. 更新生产环境变量
3. 部署并测试

**临时方案**:
- 隐藏或禁用Battle按钮
- 添加"即将推出"提示

## 相关文档

- `UPLOAD_SUBMIT_COMPLETE_FIX_SUMMARY.md` - 之前的修复总结
- `TANK_USER_ID_FIELD_FIX.md` - userId字段修复
- Battle系统设计文档（待创建）

## 注意事项

⚠️ **重要**: Battle功能是一个复杂的实时系统，需要：
- Redis（必需）
- WebSocket（可选，提升体验）
- 定期清理过期会话
- 负载均衡（多服务器部署时）

如果不需要Battle功能，建议暂时禁用以简化系统架构。

