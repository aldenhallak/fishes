# 🎮 浏览器控制台测试脚本

## 打开鱼缸页面后，按 F12 打开控制台，执行以下命令：

---

## ✅ 1. 检查系统初始化

```javascript
// 检查所有管理器是否已加载
console.log('Tank Layout Manager:', typeof window.tankLayoutManager !== 'undefined' ? '✅' : '❌');
console.log('Community Chat Manager:', typeof window.communityChatManager !== 'undefined' ? '✅' : '❌');
console.log('Fishes:', window.fishes ? `✅ (${window.fishes.length} fish)` : '❌');
```

**预期输出：**
```
Tank Layout Manager: ✅
Community Chat Manager: ✅
Fishes: ✅ (XX fish)
```

---

## 🐟 2. 查看鱼缸中的鱼

```javascript
// 显示所有鱼的信息
window.fishes.forEach((fish, index) => {
  console.log(`Fish ${index + 1}:`, {
    id: fish.fishId,
    name: fish.fishName || 'Unnamed',
    personality: fish.personality || 'None',
    x: Math.round(fish.x),
    y: Math.round(fish.y)
  });
});
```

---

## 💬 3. 手动触发社区聊天（核心测试）

```javascript
// 方法 1: 使用默认参数
window.communityChatManager.triggerCommunityChat();

// 方法 2: 自定义参数
window.communityChatManager.triggerCommunityChat({
  participantCount: 3,
  topic: 'Morning Greetings',
  timeOfDay: 'morning'
});

// 方法 3: 测试不同话题
window.communityChatManager.triggerCommunityChat({
  participantCount: 4,
  topic: 'Swimming Fun',
  timeOfDay: 'afternoon'
});
```

**预期效果：**
- 控制台显示 API 调用日志
- 10-15秒后，对话气泡出现在鱼缸中
- 对话按顺序显示，每条间隔约6秒

---

## 🎯 4. 查看当前显示的对话

```javascript
// 查看活动对话
if (window.tankLayoutManager) {
  const dialogues = window.tankLayoutManager.activeDialogues || [];
  console.log('Active Dialogues:', dialogues.length);
  dialogues.forEach((d, i) => {
    console.log(`${i + 1}. ${d.fishName}: ${d.message.substring(0, 50)}...`);
  });
}
```

---

## ⏰ 5. 查看自动聊天状态

```javascript
// 检查自动聊天是否启用
if (window.communityChatManager) {
  console.log('Auto-chat interval ID:', window.communityChatManager.autoChatIntervalId);
  console.log('Is running:', window.communityChatManager.autoChatIntervalId !== null);
}
```

---

## 🛠️ 6. 控制自动聊天

```javascript
// 停止自动聊天
if (window.communityChatManager && window.communityChatManager.autoChatIntervalId) {
  clearInterval(window.communityChatManager.autoChatIntervalId);
  window.communityChatManager.autoChatIntervalId = null;
  console.log('⏸️ Auto-chat stopped');
}

// 重新启动自动聊天（每3分钟一次）
if (window.communityChatManager) {
  window.communityChatManager.scheduleAutoChats(3);
  console.log('▶️ Auto-chat restarted (every 3 minutes)');
}
```

---

## 📊 7. 完整系统诊断

```javascript
// 运行完整诊断
(function diagnostics() {
  console.log('═══════════════════════════════════');
  console.log('🔍 Fish Art System Diagnostics');
  console.log('═══════════════════════════════════');
  
  // 检查管理器
  console.log('\n📦 Managers:');
  console.log('  Tank Layout:', typeof window.tankLayoutManager !== 'undefined' ? '✅' : '❌');
  console.log('  Community Chat:', typeof window.communityChatManager !== 'undefined' ? '✅' : '❌');
  
  // 检查鱼
  console.log('\n🐟 Fishes:');
  console.log('  Total count:', window.fishes?.length || 0);
  const withPersonality = window.fishes?.filter(f => f.personality).length || 0;
  const withNames = window.fishes?.filter(f => f.fishName).length || 0;
  console.log('  With personality:', withPersonality);
  console.log('  With names:', withNames);
  
  // 检查对话
  if (window.tankLayoutManager) {
    const activeDialogues = window.tankLayoutManager.activeDialogues?.length || 0;
    console.log('\n💬 Dialogues:');
    console.log('  Active:', activeDialogues);
  }
  
  // 检查自动聊天
  if (window.communityChatManager) {
    const isAutoRunning = window.communityChatManager.autoChatIntervalId !== null;
    console.log('\n⏰ Auto-chat:');
    console.log('  Status:', isAutoRunning ? '▶️ Running' : '⏸️ Stopped');
  }
  
  // 建议
  console.log('\n💡 Suggestions:');
  if (withPersonality === 0) {
    console.log('  ⚠️ No fish have personalities! Add some using Hasura GraphQL.');
  }
  if (withNames === 0) {
    console.log('  ⚠️ No fish have names! Add some using Hasura GraphQL.');
  }
  if (window.fishes?.length < 3) {
    console.log('  ⚠️ Not enough fish for community chat (minimum 3).');
  }
  
  console.log('\n═══════════════════════════════════');
})();
```

---

## 🧪 8. 压力测试（连续触发多次聊天）

```javascript
// 连续触发5次聊天（测试性能）
async function stressTest() {
  console.log('🧪 Starting stress test...');
  
  for (let i = 1; i <= 5; i++) {
    console.log(`\n--- Test ${i}/5 ---`);
    await window.communityChatManager.triggerCommunityChat({
      participantCount: 3,
      topic: `Stress Test ${i}`,
      timeOfDay: 'afternoon'
    });
    
    // 等待5秒再触发下一次
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log('\n✅ Stress test completed!');
}

// 运行测试
stressTest();
```

---

## 🎨 9. 测试不同个性的对话

```javascript
// 如果您已经给鱼添加了个性，测试不同个性的对话效果
const personalities = ['cheerful', 'shy', 'brave', 'lazy'];

async function testPersonalities() {
  for (const personality of personalities) {
    console.log(`\n🎭 Testing ${personality} personality...`);
    
    await window.communityChatManager.triggerCommunityChat({
      participantCount: 3,
      topic: `${personality} Chat`,
      timeOfDay: 'afternoon'
    });
    
    // 等待10秒观察效果
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}

// 运行测试
testPersonalities();
```

---

## 🔧 10. 清理和重置

```javascript
// 清理所有活动对话
if (window.tankLayoutManager) {
  window.tankLayoutManager.activeDialogues = [];
  console.log('🗑️ All dialogues cleared');
}

// 停止自动聊天
if (window.communityChatManager && window.communityChatManager.autoChatIntervalId) {
  clearInterval(window.communityChatManager.autoChatIntervalId);
  window.communityChatManager.autoChatIntervalId = null;
  console.log('⏸️ Auto-chat stopped');
}

// 刷新页面完全重置
// location.reload();
```

---

## 🐛 故障排查命令

### 问题 1: "communityChatManager is not defined"

```javascript
// 检查脚本是否加载
console.log('TankLayoutManager exists:', typeof TankLayoutManager);
console.log('CommunityChatManager exists:', typeof CommunityChatManager);

// 如果返回 undefined，检查 tank.html 中的脚本加载顺序
```

### 问题 2: "No fish found with personality"

```javascript
// 检查有多少鱼有个性
const fishWithPersonality = window.fishes.filter(f => f.personality);
console.log('Fish with personality:', fishWithPersonality.length);

// 如果是 0，需要在 Hasura 中给鱼添加个性
console.log('Run this in Hasura Console:');
console.log(`
mutation AddPersonality {
  update_fish(
    where: {personality_type: {_is_null: true}},
    _set: {personality_type: "cheerful"}
  ) {
    affected_rows
  }
}
`);
```

### 问题 3: COZE API 错误

```javascript
// 测试后端 API 连接
fetch('/api/fish/community-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    participantCount: 3,
    topic: 'Test',
    timeOfDay: 'afternoon'
  })
})
.then(res => res.json())
.then(data => {
  console.log('API Response:', data);
  if (data.error) {
    console.error('❌ Error:', data.error);
  }
})
.catch(err => console.error('❌ Network error:', err));
```

---

## 📸 监控网络请求

```javascript
// 在 DevTools Network 标签中过滤：
// - XHR 请求
// - 搜索 "community-chat"

// 或使用代码拦截：
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 Fetch:', args[0]);
  return originalFetch.apply(this, args);
};
```

---

## 🎯 快速成功测试（推荐）

执行这个一键测试，看看系统是否正常工作：

```javascript
(async function quickTest() {
  console.log('🚀 Running quick test...\n');
  
  // Step 1: 诊断
  console.log('Step 1: System check');
  if (!window.communityChatManager) {
    console.error('❌ Community Chat Manager not found!');
    return;
  }
  console.log('✅ Managers loaded\n');
  
  // Step 2: 检查鱼
  console.log('Step 2: Fish check');
  const fishCount = window.fishes?.length || 0;
  console.log(`Found ${fishCount} fish`);
  if (fishCount < 3) {
    console.error('❌ Need at least 3 fish!');
    return;
  }
  console.log('✅ Enough fish\n');
  
  // Step 3: 触发聊天
  console.log('Step 3: Trigger chat');
  await window.communityChatManager.triggerCommunityChat();
  console.log('✅ Chat triggered\n');
  
  // Step 4: 等待结果
  console.log('Step 4: Waiting for dialogues...');
  console.log('⏳ Check the tank in 10-15 seconds!');
  
  setTimeout(() => {
    const dialogues = window.tankLayoutManager?.activeDialogues?.length || 0;
    if (dialogues > 0) {
      console.log(`\n✅ SUCCESS! ${dialogues} dialogues are showing!`);
    } else {
      console.log('\n⚠️ No dialogues yet. Check console for errors.');
    }
  }, 15000);
})();
```

---

**💡 提示：**
- 所有命令都可以直接复制粘贴到控制台执行
- 如果遇到错误，先运行"完整系统诊断"（命令 7）
- 建议先执行"快速成功测试"（最后一个命令）

**📚 相关文档：**
- `POST_MIGRATION_TEST.md` - 完整测试指南
- `QUICK_START.md` - 快速开始

