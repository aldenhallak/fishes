/**
 * 留言客户端模块
 * 封装留言相关的 API 调用
 */

const MessageClient = {
  /**
   * 发送留言
   * @param {string} messageType - 'to_fish' 或 'to_owner'
   * @param {string} targetId - 鱼ID或用户ID
   * @param {string} content - 留言内容（1-50字符）
   * @param {string} visibility - 'public' 或 'private'
   * @returns {Promise<object>} 响应数据
   */
  async sendMessage(messageType, targetId, content, visibility = 'public') {
    const userId = this.getCurrentUserId();
    
    if (!userId) {
      throw new Error('请先登录');
    }

    // 前端验证内容长度
    const trimmedContent = content.trim();
    if (trimmedContent.length < 1 || trimmedContent.length > 50) {
      throw new Error('留言内容必须在1-50字符之间');
    }

    try {
      const response = await fetch('/api/message/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          messageType,
          targetId,
          content: trimmedContent,
          visibility
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '发送留言失败');
      }

      return data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  /**
   * 获取鱼的留言
   * @param {string} fishId - 鱼ID
   * @returns {Promise<object>} 留言列表
   */
  async getFishMessages(fishId) {
    const userId = this.getCurrentUserId();

    try {
      const params = new URLSearchParams({ fishId });
      if (userId) {
        params.append('userId', userId);
      }

      const response = await fetch(`/api/message/fish-messages?${params.toString()}`, {
        method: 'GET'
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '获取留言失败');
      }

      return data;
    } catch (error) {
      console.error('Get fish messages error:', error);
      throw error;
    }
  },

  /**
   * 获取用户收到的留言
   * @param {string} userId - 用户ID
   * @returns {Promise<object>} 留言列表
   */
  async getUserMessages(userId) {
    const currentUserId = this.getCurrentUserId();

    try {
      const params = new URLSearchParams({ userId });
      if (currentUserId) {
        params.append('currentUserId', currentUserId);
      }

      const response = await fetch(`/api/message/user-messages?${params.toString()}`, {
        method: 'GET'
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '获取留言失败');
      }

      return data;
    } catch (error) {
      console.error('Get user messages error:', error);
      throw error;
    }
  },

  /**
   * 删除留言
   * @param {string} messageId - 留言ID
   * @returns {Promise<object>} 响应数据
   */
  async deleteMessage(messageId) {
    const userId = this.getCurrentUserId();

    if (!userId) {
      throw new Error('请先登录');
    }

    try {
      const response = await fetch('/api/message/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageId,
          userId
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '删除留言失败');
      }

      return data;
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  },

  /**
   * 获取当前登录用户ID
   * @returns {string|null} 用户ID
   */
  getCurrentUserId() {
    try {
      // 从 localStorage 获取用户ID
      const userId = localStorage.getItem('userId');
      if (userId) return userId;

      // 从 userData 获取
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.uid || parsed.userId || parsed.id || parsed.email || null;
      }

      return null;
    } catch (error) {
      console.error('Get current user ID error:', error);
      return null;
    }
  },

  /**
   * 转义 HTML，防止 XSS 攻击
   * @param {string} text - 文本内容
   * @returns {string} 转义后的文本
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text ? String(text).replace(/[&<>"']/g, m => map[m]) : '';
  },

  /**
   * 格式化时间显示
   * @param {string} dateString - 时间字符串
   * @returns {string} 格式化后的时间
   */
  formatTime(dateString) {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 60) {
        return '刚刚';
      } else if (minutes < 60) {
        return `${minutes}分钟前`;
      } else if (hours < 24) {
        return `${hours}小时前`;
      } else if (days < 7) {
        return `${days}天前`;
      } else {
        return date.toLocaleDateString('zh-CN');
      }
    } catch (error) {
      console.error('Format time error:', error);
      return dateString;
    }
  }
};

// 如果在浏览器环境中，将 MessageClient 暴露为全局变量
if (typeof window !== 'undefined') {
  window.MessageClient = MessageClient;
}

// 如果是 Node.js 环境，导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MessageClient;
}

