/**
 * 战斗系统前端客户端
 * 用于与战斗API交互
 */

const BattleClient = {
  // API基础路径
  API_BASE: '/api',
  
  // 当前用户状态
  currentUser: null,
  currentFish: null,
  inBattleMode: false,
  heartbeatInterval: null,
  
  /**
   * 初始化战斗客户端
   */
  init(userId, fishId) {
    this.currentUser = userId;
    this.currentFish = fishId;
  },
  
  /**
   * 进入战斗模式
   */
  async enterBattleMode(userId, fishId) {
    try {
      const response = await fetch(`${this.API_BASE}/battle/enter-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, fishId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.inBattleMode = true;
        this.startHeartbeat(userId, fishId);
      }
      
      return data;
    } catch (error) {
      console.error('进入战斗模式失败:', error);
      throw error;
    }
  },
  
  /**
   * 离开战斗模式
   */
  async leaveBattleMode(userId) {
    try {
      const response = await fetch(`${this.API_BASE}/battle/leave-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.inBattleMode = false;
        this.stopHeartbeat();
      }
      
      return data;
    } catch (error) {
      console.error('离开战斗模式失败:', error);
      throw error;
    }
  },
  
  /**
   * 启动心跳
   */
  startHeartbeat(userId, fishId) {
    // 每60秒发送一次心跳
    this.heartbeatInterval = setInterval(async () => {
      try {
        const response = await fetch(`${this.API_BASE}/battle/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, fishId })
        });
        
        const data = await response.json();
        
        if (!data.success || !data.inBattleMode) {
          console.warn('心跳失败，可能已被踢出战斗模式');
          this.inBattleMode = false;
          this.stopHeartbeat();
        }
      } catch (error) {
        console.error('心跳失败:', error);
      }
    }, 60000); // 60秒
  },
  
  /**
   * 停止心跳
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  },
  
  /**
   * 触发战斗
   */
  async triggerBattle(attackerId, defenderId) {
    try {
      const response = await fetch(`${this.API_BASE}/battle/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attackerId, defenderId })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('战斗触发失败:', error);
      throw error;
    }
  },
  
  /**
   * 查询队列状态
   */
  async checkQueueStatus(userId) {
    try {
      const response = await fetch(`${this.API_BASE}/battle/queue-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      return await response.json();
    } catch (error) {
      console.error('查询队列状态失败:', error);
      throw error;
    }
  },
  
  /**
   * 查询鱼食余额
   */
  async getBalance(userId) {
    try {
      const response = await fetch(`${this.API_BASE}/economy/balance?userId=${userId}`);
      return await response.json();
    } catch (error) {
      console.error('查询余额失败:', error);
      throw error;
    }
  },
  
  /**
   * 每日签到
   */
  async claimDailyBonus(userId) {
    try {
      const response = await fetch(`${this.API_BASE}/economy/daily-bonus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      return await response.json();
    } catch (error) {
      console.error('签到失败:', error);
      throw error;
    }
  },
  
  /**
   * 喂食
   */
  async feedFish(userId, fishId) {
    try {
      const response = await fetch(`${this.API_BASE}/economy/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, fishId })
      });
      
      return await response.json();
    } catch (error) {
      console.error('喂食失败:', error);
      throw error;
    }
  },
  
  /**
   * 复活鱼
   */
  async reviveFish(userId, fishId) {
    try {
      const response = await fetch(`${this.API_BASE}/economy/revive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, fishId })
      });
      
      return await response.json();
    } catch (error) {
      console.error('复活失败:', error);
      throw error;
    }
  },
  
  /**
   * 创建新鱼
   */
  async createFish(userId, imageUrl, artist) {
    try {
      const response = await fetch(`${this.API_BASE}/fish/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, imageUrl, artist })
      });
      
      return await response.json();
    } catch (error) {
      console.error('创建鱼失败:', error);
      throw error;
    }
  }
};

// 页面卸载时离开战斗模式
window.addEventListener('beforeunload', () => {
  if (BattleClient.inBattleMode && BattleClient.currentUser) {
    // 使用sendBeacon确保请求发送
    navigator.sendBeacon(
      `${BattleClient.API_BASE}/battle/leave-mode`,
      JSON.stringify({ userId: BattleClient.currentUser })
    );
  }
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BattleClient;
}



