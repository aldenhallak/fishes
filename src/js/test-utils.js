/**
 * 测试工具模块
 * 提供测试页面所需的公共函数
 */

// ==================== API 调用 ====================

/**
 * 调用API并处理响应
 * @param {string} url - API端点
 * @param {object} options - fetch选项
 * @returns {Promise<object>}
 */
async function apiCall(url, options = {}) {
  try {
    // 获取认证token
    const token = await getAuthToken();
    
    // 设置默认headers
    const headers = {
      ...options.headers
    };
    
    // 如果有token，添加到headers
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 如果是JSON数据，添加Content-Type
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // 检查响应类型
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // 如果不是JSON，尝试读取文本
      const text = await response.text();
      try {
        // 尝试解析为JSON
        data = JSON.parse(text);
      } catch (e) {
        // 如果解析失败，返回错误信息
        return {
          success: false,
          status: response.status,
          error: `服务器返回非JSON响应: ${text.substring(0, 100)}`
        };
      }
    }
    
    return {
      success: response.ok,
      status: response.status,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取当前用户的认证token
 * @returns {Promise<string|null>}
 */
async function getAuthToken() {
  try {
    if (window.supabaseAuth && typeof window.supabaseAuth.getAccessToken === 'function') {
      return await window.supabaseAuth.getAccessToken();
    }
    return null;
  } catch (error) {
    console.warn('获取token失败:', error);
    return null;
  }
}

/**
 * 检查用户是否已登录
 * @returns {Promise<boolean>}
 */
async function isUserLoggedIn() {
  try {
    if (window.supabaseAuth && typeof window.supabaseAuth.isLoggedIn === 'function') {
      return await window.supabaseAuth.isLoggedIn();
    }
    return false;
  } catch (error) {
    return false;
  }
}

// ==================== 文件上传 ====================

/**
 * 上传文件到七牛云（表单方式）
 * @param {File} file - 文件对象
 * @returns {Promise<object>}
 */
async function uploadFileToQiniu(file) {
  const formData = new FormData();
  formData.append('image', file);
  
  return await apiCall('/api/fish/upload', {
    method: 'POST',
    body: formData
  });
}

// ==================== 结果展示 ====================

/**
 * 渲染上传结果
 * @param {object} result - 上传结果
 * @param {HTMLElement} container - 容器元素
 */
function renderUploadResult(result, container) {
  const resultDiv = document.createElement('div');
  resultDiv.className = `result-item ${result.success ? 'success' : 'error'}`;
  
  const statusBadge = document.createElement('span');
  statusBadge.className = 'status-badge';
  statusBadge.textContent = result.success ? '✓ 成功' : '✗ 失败';
  
  const content = document.createElement('div');
  content.className = 'result-content';
  
  if (result.success && result.data) {
    const data = result.data.data || result.data;
    content.innerHTML = `
      <div class="result-field">
        <strong>文件URL:</strong>
        <a href="${data.url}" target="_blank" class="result-link">${data.url}</a>
      </div>
      <div class="result-field">
        <strong>文件路径:</strong>
        <code>${data.path}</code>
      </div>
      ${data.key ? `<div class="result-field"><strong>文件Key:</strong> <code>${data.key}</code></div>` : ''}
      ${data.hash ? `<div class="result-field"><strong>Hash:</strong> <code>${data.hash}</code></div>` : ''}
      <div class="result-actions">
        <button onclick="window.open('${data.url}', '_blank')" class="btn-preview">预览</button>
        <button onclick="copyToClipboard('${data.url}')" class="btn-copy">复制URL</button>
      </div>
    `;
  } else {
    content.innerHTML = `
      <div class="result-field error-message">
        <strong>错误:</strong> ${result.error || result.data?.error || '上传失败'}
      </div>
    `;
  }
  
  resultDiv.appendChild(statusBadge);
  resultDiv.appendChild(content);
  container.appendChild(resultDiv);
}

/**
 * 渲染API调用结果
 * @param {object} result - API结果
 * @param {HTMLElement} container - 容器元素
 */
function renderApiResult(result, container) {
  const resultDiv = document.createElement('div');
  resultDiv.className = `result-item ${result.success ? 'success' : 'error'}`;
  
  const statusBadge = document.createElement('span');
  statusBadge.className = 'status-badge';
  statusBadge.textContent = result.success ? '✓ 成功' : '✗ 失败';
  
  const content = document.createElement('div');
  content.className = 'result-content';
  
  const pre = document.createElement('pre');
  pre.className = 'json-result';
  pre.textContent = JSON.stringify(result.data, null, 2);
  
  content.appendChild(pre);
  resultDiv.appendChild(statusBadge);
  resultDiv.appendChild(content);
  container.appendChild(resultDiv);
}

/**
 * 清空结果容器
 * @param {HTMLElement} container - 容器元素
 */
function clearResults(container) {
  container.innerHTML = '';
}

// ==================== 拖拽上传 ====================

/**
 * 设置拖拽上传功能
 * @param {HTMLElement} dropZone - 拖拽区域
 * @param {Function} onFilesDropped - 文件放置回调
 */
function setupDragAndDrop(dropZone, onFilesDropped) {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.add('drag-active');
    }, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.remove('drag-active');
    }, false);
  });
  
  dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFilesDropped(files);
    }
  }, false);
}

// ==================== 工具函数 ====================

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('已复制到剪贴板');
  }).catch(err => {
    console.error('复制失败:', err);
    showToast('复制失败', 'error');
  });
}

/**
 * 显示提示消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 (success/error/info)
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 2000);
}

/**
 * 格式化日期时间
 * @param {Date|string} date - 日期对象或字符串
 * @returns {string}
 */
function formatDateTime(date) {
  const d = new Date(date);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 显示加载状态
 * @param {HTMLElement} button - 按钮元素
 * @param {boolean} loading - 是否加载中
 */
function setButtonLoading(button, loading) {
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = '加载中...';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
  }
}


