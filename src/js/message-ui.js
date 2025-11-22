/**
 * 留言 UI 组件
 * 提供留言列表和发送表单的 UI 生成和交互
 */

const MessageUI = {
  /**
   * 渲染留言列表
   * @param {Array} messages - 留言数组
   * @param {object} options - 选项 { showFishInfo, showDeleteBtn, groupByType }
   * @returns {string} HTML 字符串
   */
  renderMessageList(messages, options = {}) {
    const { showFishInfo = false, showDeleteBtn = false, groupByType = false } = options;

    if (!messages || messages.length === 0) {
      return `
        <div class="messages-empty">
          No messages yet
        </div>
      `;
    }

    // 如果需要分组显示（用于profile页面）
    if (groupByType) {
      // 分类：Public Messages（visibility=public或null/undefined）和 Private Messages（visibility=private）
      // 如果visibility为null或undefined，默认当作public处理
      const publicMessages = messages.filter(msg => !msg.visibility || msg.visibility === 'public');
      const privateMessages = messages.filter(msg => msg.visibility === 'private');

      // 计算未读消息数量和总数
      const publicUnreadCount = publicMessages.filter(msg => !msg.is_read).length;
      const publicTotalCount = publicMessages.length;
      const privateUnreadCount = privateMessages.filter(msg => !msg.is_read).length;
      const privateTotalCount = privateMessages.length;

      let html = '';

      // 显示Public Messages
      if (publicMessages.length > 0) {
        const publicCards = publicMessages.map(msg => {
          return this.renderMessageCard(msg, { showFishInfo, showDeleteBtn });
        }).join('');

        // 根据未读数决定显示格式
        const publicCountDisplay = publicUnreadCount > 0 
          ? `${publicUnreadCount}/${publicTotalCount}` 
          : `${publicTotalCount}`;

        html += `
          <div class="messages-group">
            <div class="messages-group-title public collapsed" onclick="MessageUI.toggleGroup(this)">
              <span class="group-icon">▶</span>
              <span>Public Messages (${publicCountDisplay})</span>
            </div>
            <div class="messages-group-list" style="display: none;">
              ${publicCards}
            </div>
          </div>
        `;
      }

      // 显示Private Messages
      if (privateMessages.length > 0) {
        const privateCards = privateMessages.map(msg => {
          return this.renderMessageCard(msg, { showFishInfo, showDeleteBtn });
        }).join('');

        // 根据未读数决定显示格式
        const privateCountDisplay = privateUnreadCount > 0 
          ? `${privateUnreadCount}/${privateTotalCount}` 
          : `${privateTotalCount}`;

        html += `
          <div class="messages-group">
            <div class="messages-group-title private collapsed" onclick="MessageUI.toggleGroup(this)">
              <span class="group-icon">▶</span>
              <span>Private Messages (${privateCountDisplay})</span>
            </div>
            <div class="messages-group-list" style="display: none;">
              ${privateCards}
            </div>
          </div>
        `;
      }

      // 如果过滤后两个数组都为空，显示空状态
      if (!html || html.trim() === '') {
        return `
          <div class="messages-empty">
            No messages yet
          </div>
        `;
      }

      return `
        <div class="messages-list">
          ${html}
        </div>
      `;
    }

    // 默认不分组的显示方式
    const messageCards = messages.map(msg => {
      return this.renderMessageCard(msg, { showFishInfo, showDeleteBtn });
    }).join('');

    return `
      <div class="messages-list">
        ${messageCards}
      </div>
    `;
  },

  /**
   * 渲染单个留言卡片
   * @param {object} message - 留言对象
   * @param {object} options - 选项
   * @returns {string} HTML 字符串
   */
  renderMessageCard(message, options = {}) {
    const { showFishInfo = false, showDeleteBtn = false } = options;
    
    const senderName = message.sender?.nick_name || 'Anonymous';
    const senderInitial = senderName.charAt(0).toUpperCase();
    const content = MessageClient.escapeHtml(message.content);
    const time = MessageClient.formatTime(message.created_at);
    const visibility = message.visibility || 'public';
    const visibilityText = visibility === 'public' ? 'Public' : 'Private';
    const currentUserId = MessageClient.getCurrentUserId();
    const canDelete = showDeleteBtn && currentUserId && 
                      (message.sender_id === currentUserId || message.receiver_id === currentUserId);

    // 检查是否可以回复（当前用户是接收者，且消息有发送者）
    // 在profile页面，所有消息的receiver_id都是当前用户，所以可以回复所有有发送者的消息
    const canReply = currentUserId && message.sender_id && 
                     (message.receiver_id === currentUserId || !message.receiver_id);
    
    let actionButtonsHtml = '';
    if (canReply || canDelete) {
      actionButtonsHtml = `
        <div class="profile-message-actions">
          ${canReply ? `
            <button class="message-reply-btn" onclick="MessageUI.showReplyForm('${message.id}', '${message.sender_id}', '${MessageClient.escapeHtml(senderName)}')">
              Reply
            </button>
          ` : ''}
          ${canDelete ? `
            <button class="message-delete-btn" onclick="MessageUI.handleDelete('${message.id}')">
              Delete
            </button>
          ` : ''}
        </div>
      `;
    }

    return `
      <div class="message-card" data-message-id="${message.id}">
        <div class="message-header">
          <div class="message-sender">
            <div class="message-sender-avatar">${senderInitial}</div>
            <span>${MessageClient.escapeHtml(senderName)}</span>
          </div>
          <div class="message-time">${time}</div>
        </div>
        <div class="message-content">${content}</div>
        ${actionButtonsHtml}
      </div>
    `;
  },

  /**
   * 渲染留言发送表单
   * @param {string} messageType - 'to_fish' 或 'to_owner'
   * @param {string} targetId - 目标ID
   * @param {string} containerId - 容器元素ID
   * @returns {string} HTML 字符串
   */
  renderMessageForm(messageType, targetId, containerId) {
    const formId = `message-form-${Date.now()}`;
    
    return `
      <div class="message-form" id="${formId}">
        <div class="message-form-group">
          <div class="message-form-header">
            <label class="message-form-label">Message</label>
            <div class="message-char-count">
              <span id="${formId}-count">0</span>/50
            </div>
          </div>
          <textarea 
            class="message-form-textarea" 
            id="${formId}-content"
            placeholder="Say something..."
            maxlength="50"
            rows="3"
          ></textarea>
        </div>

        <div id="${formId}-error" class="message-error" style="display: none;"></div>
        <div id="${formId}-success" class="message-success" style="display: none;"></div>

        <div class="message-form-footer">
          <div class="message-visibility-option">
            <input 
              type="checkbox" 
              id="${formId}-private" 
              name="${formId}-visibility"
            >
            <label for="${formId}-private">🔒 Private (only for owner)</label>
          </div>
          <button 
            type="button" 
            class="message-submit-btn" 
            id="${formId}-submit"
          >
            Send Message
          </button>
        </div>
      </div>
    `;
  },

  /**
   * 初始化留言表单交互
   * @param {string} formId - 表单ID
   * @param {string} messageType - 留言类型
   * @param {string} targetId - 目标ID
   * @param {Function} onSuccess - 成功回调
   */
  initMessageForm(formId, messageType, targetId, onSuccess) {
    const contentTextarea = document.getElementById(`${formId}-content`);
    const charCount = document.getElementById(`${formId}-count`);
    const submitBtn = document.getElementById(`${formId}-submit`);
    const errorDiv = document.getElementById(`${formId}-error`);
    const successDiv = document.getElementById(`${formId}-success`);

    // 字符计数
    if (contentTextarea && charCount) {
      contentTextarea.addEventListener('input', () => {
        const length = contentTextarea.value.length;
        charCount.textContent = length;
        
        // 更新字符计数样式
        charCount.parentElement.classList.remove('warning', 'error');
        if (length > 40) {
          charCount.parentElement.classList.add('warning');
        }
        if (length >= 50) {
          charCount.parentElement.classList.add('error');
        }
      });
    }

    // 提交处理
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        try {
          // 隐藏之前的消息
          if (errorDiv) errorDiv.style.display = 'none';
          if (successDiv) successDiv.style.display = 'none';

          // 获取表单数据
          const content = contentTextarea.value.trim();
          const privateCheckbox = document.getElementById(`${formId}-private`);
          const visibility = privateCheckbox && privateCheckbox.checked ? 'private' : 'public';

          // 验证
          if (!content) {
            this.showError(errorDiv, 'Please enter a message');
            return;
          }

          if (content.length > 50) {
            this.showError(errorDiv, 'Message cannot exceed 50 characters');
            return;
          }

          // 禁用按钮
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending...';

          // 发送留言
          await MessageClient.sendMessage(messageType, targetId, content, visibility);

          // 成功
          this.showSuccess(successDiv, 'Message sent successfully!');
          
          // 清空表单
          contentTextarea.value = '';
          if (charCount) charCount.textContent = '0';

          // 调用成功回调
          if (onSuccess) {
            setTimeout(() => {
              onSuccess();
            }, 1000);
          }

        } catch (error) {
          console.error('Send message error:', error);
          this.showError(errorDiv, error.message || 'Failed to send message, please try again');
        } finally {
          // 恢复按钮
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }
      });
    }
  },

  /**
   * 显示错误消息
   */
  showError(errorDiv, message) {
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'flex';
    } else {
      alert(message);
    }
  },

  /**
   * 显示成功消息
   */
  showSuccess(successDiv, message) {
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.style.display = 'flex';
      
      // 3秒后自动隐藏
      setTimeout(() => {
        successDiv.style.display = 'none';
      }, 3000);
    }
  },

  /**
   * 处理删除留言
   * @param {string} messageId - 留言ID
   */
  async handleDelete(messageId) {
      if (!confirm('Are you sure you want to delete this message?')) {
        return;
      }

    try {
      await MessageClient.deleteMessage(messageId);
      
      // 从 DOM 中移除
      const messageCard = document.querySelector(`[data-message-id="${messageId}"]`);
      if (messageCard) {
        messageCard.style.opacity = '0';
        messageCard.style.transform = 'scale(0.9)';
        setTimeout(() => {
          messageCard.remove();
          
          // 检查是否没有留言了
          const messagesList = messageCard.closest('.messages-list');
          if (messagesList && messagesList.children.length === 0) {
            messagesList.innerHTML = `
              <div class="messages-empty">
                暂无留言
              </div>
            `;
          }
        }, 300);
      }
      
      alert('Message deleted');
    } catch (error) {
      console.error('Delete message error:', error);
      alert(error.message || 'Failed to delete message, please try again');
    }
  },

  /**
   * 渲染完整的留言区域（列表+表单）
   * @param {string} containerId - 容器ID
   * @param {string} messageType - 留言类型
   * @param {string} targetId - 目标ID
   * @param {object} options - 选项
   */
  async renderMessagesSection(containerId, messageType, targetId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

      const { 
      showForm = true, 
      showFishInfo = false,
      showDeleteBtn = false,
      title = '💬 Messages'
    } = options;

    try {
      // 显示加载状态
      container.innerHTML = `
        <div class="messages-section">
          <div class="messages-section-title">${title.replace('💬 ', '')}</div>
          <div class="messages-loading">Loading...</div>
        </div>
      `;

      // 加载留言
      let messagesData;
      if (messageType === 'to_fish') {
        messagesData = await MessageClient.getFishMessages(targetId);
      } else {
        messagesData = await MessageClient.getUserMessages(targetId);
      }

      // 检查返回的数据结构
      const messages = messagesData.messages || [];
      const currentUserId = MessageClient.getCurrentUserId();
      const canShowDelete = showDeleteBtn && currentUserId;

      // 如果是用户查看自己的消息，自动标记未读消息为已读
      if (messageType === 'to_owner' && currentUserId === targetId) {
        const unreadMessages = messages.filter(msg => !msg.is_read);
        if (unreadMessages.length > 0) {
          const unreadIds = unreadMessages.map(msg => msg.id);
          // 异步标记为已读，不阻塞UI渲染
          this.markMessagesAsRead(currentUserId, unreadIds).catch(error => {
            console.error('Failed to mark messages as read:', error);
          });
        }
      }

      // 渲染留言列表（profile页面使用分组显示）
      const messageListHtml = this.renderMessageList(messages, { 
        showFishInfo, 
        showDeleteBtn: canShowDelete,
        groupByType: messageType === 'to_owner' // 只在profile页面分组
      });

      // 渲染表单
      const formId = `message-form-${Date.now()}`;
      const messageFormHtml = showForm ? this.renderMessageForm(messageType, targetId, containerId) : '';

      // 更新容器（profile页面不显示标题）
      const showTitle = !(messageType === 'to_owner' && !showForm);
      container.innerHTML = `
        <div class="messages-section">
          ${showTitle ? `<div class="messages-section-title">${title.replace('💬 ', '')} (${messages.length})</div>` : ''}
          ${messageListHtml}
          ${currentUserId && showForm ? messageFormHtml : ''}
          ${!currentUserId && showForm ? '<div class="messages-empty">Please log in to send messages</div>' : ''}
        </div>
      `;

      // 初始化表单交互
      if (showForm && currentUserId) {
        const formElement = container.querySelector('.message-form');
        if (formElement) {
          const actualFormId = formElement.id;
          this.initMessageForm(actualFormId, messageType, targetId, () => {
            // 重新加载留言列表
            this.renderMessagesSection(containerId, messageType, targetId, options);
          });
        }
      }

    } catch (error) {
      console.error('Render messages section error:', error);
      container.innerHTML = `
        <div class="messages-section">
          <div class="message-error">
            ${error.message || 'Failed to load, please refresh the page'}
          </div>
        </div>
      `;
    }
  },

  /**
   * 切换消息分组展开/收起
   * @param {HTMLElement} titleElement - 标题元素
   */
  toggleGroup(titleElement) {
    const group = titleElement.closest('.messages-group');
    const list = group.querySelector('.messages-group-list');
    const icon = titleElement.querySelector('.group-icon');
    
    if (list.style.display === 'none') {
      list.style.display = 'flex';
      titleElement.classList.remove('collapsed');
      if (icon) icon.textContent = '▼';
    } else {
      list.style.display = 'none';
      titleElement.classList.add('collapsed');
      if (icon) icon.textContent = '▶';
    }
  },

  /**
   * 显示回复表单
   * @param {string} messageId - 原消息ID
   * @param {string} receiverId - 接收者ID（原消息的发送者）
   * @param {string} receiverName - 接收者名称
   */
  showReplyForm(messageId, receiverId, receiverName) {
    const messageCard = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageCard) return;

    // 检查是否已经有回复表单
    let replyForm = messageCard.querySelector('.message-reply-form');
    if (replyForm) {
      // 如果已存在，切换显示/隐藏
      replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
      return;
    }

    // 创建回复表单
    const formId = `reply-form-${messageId}-${Date.now()}`;
    replyForm = document.createElement('div');
    replyForm.className = 'message-reply-form';
    replyForm.innerHTML = `
      <div class="message-reply-form-content">
        <div class="message-reply-header">
          <span>Reply to ${MessageClient.escapeHtml(receiverName)}</span>
          <button class="message-reply-close" onclick="this.closest('.message-reply-form').style.display='none'">×</button>
        </div>
        <textarea 
          class="message-reply-textarea" 
          id="${formId}-content"
          placeholder="Type your reply..."
          maxlength="50"
          rows="2"
        ></textarea>
        <div class="message-reply-footer">
          <div class="message-char-count">
            <span id="${formId}-count">0</span>/50
          </div>
          <div class="message-reply-actions">
            <div class="message-visibility-option">
              <input type="checkbox" id="${formId}-private" name="${formId}-visibility">
              <label for="${formId}-private">🔒 Private</label>
            </div>
            <button class="message-reply-submit-btn" id="${formId}-submit">Send</button>
          </div>
        </div>
        <div id="${formId}-error" class="message-error" style="display: none;"></div>
        <div id="${formId}-success" class="message-success" style="display: none;"></div>
      </div>
    `;

    // 插入到消息卡片中
    messageCard.appendChild(replyForm);

    // 初始化表单交互
    this.initReplyForm(formId, receiverId);
  },

  /**
   * 初始化回复表单交互
   * @param {string} formId - 表单ID
   * @param {string} receiverId - 接收者ID
   */
  initReplyForm(formId, receiverId) {
    const contentTextarea = document.getElementById(`${formId}-content`);
    const charCount = document.getElementById(`${formId}-count`);
    const submitBtn = document.getElementById(`${formId}-submit`);
    const errorDiv = document.getElementById(`${formId}-error`);
    const successDiv = document.getElementById(`${formId}-success`);

    // 字符计数
    if (contentTextarea && charCount) {
      contentTextarea.addEventListener('input', () => {
        const length = contentTextarea.value.length;
        charCount.textContent = length;
        
        charCount.parentElement.classList.remove('warning', 'error');
        if (length > 40) {
          charCount.parentElement.classList.add('warning');
        }
        if (length >= 50) {
          charCount.parentElement.classList.add('error');
        }
      });
    }

    // 提交处理
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        try {
          if (errorDiv) errorDiv.style.display = 'none';
          if (successDiv) successDiv.style.display = 'none';

          const content = contentTextarea.value.trim();
          const privateCheckbox = document.getElementById(`${formId}-private`);
          const visibility = privateCheckbox && privateCheckbox.checked ? 'private' : 'public';

          if (!content) {
            this.showError(errorDiv, 'Please enter a message');
            return;
          }

          if (content.length > 50) {
            this.showError(errorDiv, 'Message cannot exceed 50 characters');
            return;
          }

          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending...';

          // 发送回复（类型为 to_owner，发送给原消息的发送者）
          await MessageClient.sendMessage('to_owner', receiverId, content, visibility);

          this.showSuccess(successDiv, 'Reply sent successfully!');
          
          contentTextarea.value = '';
          if (charCount) charCount.textContent = '0';

          // 3秒后隐藏表单
          setTimeout(() => {
            const replyForm = submitBtn.closest('.message-reply-form');
            if (replyForm) {
              replyForm.style.display = 'none';
            }
          }, 2000);

        } catch (error) {
          console.error('Send reply error:', error);
          this.showError(errorDiv, error.message || 'Failed to send reply, please try again');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send';
        }
      });
    }

    // 自动聚焦
    if (contentTextarea) {
      setTimeout(() => contentTextarea.focus(), 100);
    }
  },

  /**
   * 标记消息为已读
   * @param {string} userId - 用户ID
   * @param {Array<string>} messageIds - 消息ID数组
   * @returns {Promise} 
   */
  async markMessagesAsRead(userId, messageIds) {
    if (!userId || !messageIds || messageIds.length === 0) {
      return;
    }

    try {
      const response = await fetch('/api/message-api?action=mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          messageIds: messageIds
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }

      const result = await response.json();
      
      // 更新未读消息数量
      if (window.authUI && typeof window.authUI.updateUnreadCount === 'function') {
        await window.authUI.updateUnreadCount(userId);
      }

      return result;
    } catch (error) {
      console.error('Mark messages as read error:', error);
      throw error;
    }
  }
};

// 暴露为全局变量
if (typeof window !== 'undefined') {
  window.MessageUI = MessageUI;
}

// Node.js 环境导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MessageUI;
}

