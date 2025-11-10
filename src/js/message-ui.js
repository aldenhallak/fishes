/**
 * 留言 UI 组件
 * 提供留言列表和发送表单的 UI 生成和交互
 */

const MessageUI = {
  /**
   * 渲染留言列表
   * @param {Array} messages - 留言数组
   * @param {object} options - 选项 { showFishInfo, showDeleteBtn }
   * @returns {string} HTML 字符串
   */
  renderMessageList(messages, options = {}) {
    const { showFishInfo = false, showDeleteBtn = false } = options;

    if (!messages || messages.length === 0) {
      return `
        <div class="messages-empty">
          暂无留言
        </div>
      `;
    }

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
    
    const senderName = message.sender?.display_name || '匿名用户';
    const senderInitial = senderName.charAt(0).toUpperCase();
    const content = MessageClient.escapeHtml(message.content);
    const time = MessageClient.formatTime(message.created_at);
    const visibility = message.visibility || 'public';
    const visibilityText = visibility === 'public' ? '公开' : '私密';
    const currentUserId = MessageClient.getCurrentUserId();
    const canDelete = showDeleteBtn && currentUserId && 
                      (message.sender_id === currentUserId || message.receiver_id === currentUserId);

    let fishInfoHtml = '';
    if (showFishInfo && message.fish) {
      fishInfoHtml = `
        <div class="profile-message-fish-info">
          ${message.fish.image_url ? `
            <img src="${message.fish.image_url}" 
                 alt="${MessageClient.escapeHtml(message.fish.fish_name || '鱼')}" 
                 class="profile-message-fish-thumb">
          ` : ''}
          <span class="profile-message-fish-name">
            给 ${MessageClient.escapeHtml(message.fish.fish_name || '鱼')} 的留言
          </span>
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
        <div class="message-footer">
          <span class="message-visibility ${visibility}">${visibilityText}</span>
          ${canDelete ? `
            <div class="message-actions">
              <button class="message-delete-btn" onclick="MessageUI.handleDelete('${message.id}')">
                删除
              </button>
            </div>
          ` : ''}
        </div>
        ${fishInfoHtml}
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
          <label class="message-form-label">留言内容</label>
          <textarea 
            class="message-form-textarea" 
            id="${formId}-content"
            placeholder="说点什么吧...（最多50字）"
            maxlength="50"
            rows="3"
          ></textarea>
          <div class="message-char-count">
            <span id="${formId}-count">0</span>/50
          </div>
        </div>

        <div class="message-form-group">
          <label class="message-form-label">可见性</label>
          <div class="message-visibility-options">
            <div class="message-visibility-option">
              <input 
                type="radio" 
                id="${formId}-public" 
                name="${formId}-visibility" 
                value="public" 
                checked
              >
              <label for="${formId}-public">🌍 公开</label>
            </div>
            <div class="message-visibility-option">
              <input 
                type="radio" 
                id="${formId}-private" 
                name="${formId}-visibility" 
                value="private"
              >
              <label for="${formId}-private">🔒 私密</label>
            </div>
          </div>
        </div>

        <div id="${formId}-error" class="message-error" style="display: none;"></div>
        <div id="${formId}-success" class="message-success" style="display: none;"></div>

        <div class="message-form-actions">
          <button 
            type="button" 
            class="message-submit-btn" 
            id="${formId}-submit"
          >
            发送留言
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
          const visibilityRadio = document.querySelector(`input[name="${formId}-visibility"]:checked`);
          const visibility = visibilityRadio ? visibilityRadio.value : 'public';

          // 验证
          if (!content) {
            this.showError(errorDiv, '请输入留言内容');
            return;
          }

          if (content.length > 50) {
            this.showError(errorDiv, '留言内容不能超过50字');
            return;
          }

          // 禁用按钮
          submitBtn.disabled = true;
          submitBtn.textContent = '发送中...';

          // 发送留言
          await MessageClient.sendMessage(messageType, targetId, content, visibility);

          // 成功
          this.showSuccess(successDiv, '留言发送成功！');
          
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
          this.showError(errorDiv, error.message || '发送失败，请稍后重试');
        } finally {
          // 恢复按钮
          submitBtn.disabled = false;
          submitBtn.textContent = '发送留言';
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
    if (!confirm('确定要删除这条留言吗？')) {
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
      
      alert('留言已删除');
    } catch (error) {
      console.error('Delete message error:', error);
      alert(error.message || '删除失败，请稍后重试');
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
      title = '💬 留言'
    } = options;

    try {
      // 显示加载状态
      container.innerHTML = `
        <div class="messages-section">
          <div class="messages-section-title">${title}</div>
          <div class="messages-loading">加载中...</div>
        </div>
      `;

      // 加载留言
      let messagesData;
      if (messageType === 'to_fish') {
        messagesData = await MessageClient.getFishMessages(targetId);
      } else {
        messagesData = await MessageClient.getUserMessages(targetId);
      }

      const messages = messagesData.messages || [];
      const currentUserId = MessageClient.getCurrentUserId();
      const canShowDelete = showDeleteBtn && currentUserId;

      // 渲染留言列表
      const messageListHtml = this.renderMessageList(messages, { 
        showFishInfo, 
        showDeleteBtn: canShowDelete 
      });

      // 渲染表单
      const formId = `message-form-${Date.now()}`;
      const messageFormHtml = showForm ? this.renderMessageForm(messageType, targetId, containerId) : '';

      // 更新容器
      container.innerHTML = `
        <div class="messages-section">
          <div class="messages-section-title">${title} (${messages.length})</div>
          ${messageListHtml}
          ${currentUserId && showForm ? messageFormHtml : ''}
          ${!currentUserId && showForm ? '<div class="messages-empty">请登录后发送留言</div>' : ''}
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
          <div class="messages-section-title">${title}</div>
          <div class="message-error">
            ${error.message || '加载失败，请刷新页面重试'}
          </div>
        </div>
      `;
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

