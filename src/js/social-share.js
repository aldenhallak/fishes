// Social Share Functionality
// Lightweight module for social media sharing without external dependencies

class SocialShare {
  constructor(config) {
    this.config = config || window.SOCIAL_CONFIG;
    this.siteUrl = this.config.site.url;
  }

  /**
   * Check if native Web Share API is supported (mobile devices)
   */
  isNativeShareSupported() {
    return navigator.share !== undefined;
  }

  /**
   * Native share using Web Share API (best for mobile)
   */
  async shareNative(customText, customUrl) {
    if (!this.isNativeShareSupported()) {
      return false;
    }

    try {
      await navigator.share({
        title: this.config.site.name,
        text: customText || this.config.share.defaultText,
        url: customUrl || this.siteUrl
      });
      return true;
    } catch (err) {
      // User cancelled or share failed - show custom modal as fallback
      console.log('Native share cancelled or failed, showing custom modal:', err);
      this.showShareModal(customText, customUrl);
      return true;
    }
  }

  /**
   * Share to X (formerly Twitter)
   */
  shareToX(customText, customUrl) {
    const text = customText || this.config.share.messages.x;
    const url = customUrl || this.siteUrl;
    const hashtags = this.config.share.hashtags.join(',');
    
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
    
    this.openPopup(shareUrl, 'X Share', 550, 420);
  }
  
  // Legacy method for backward compatibility
  shareToTwitter(customText, customUrl) {
    return this.shareToX(customText, customUrl);
  }

  /**
   * Share to Facebook
   */
  shareToFacebook(customUrl) {
    const url = customUrl || this.siteUrl;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    
    this.openPopup(shareUrl, 'Facebook Share', 550, 420);
  }

  /**
   * Share to Instagram (opens Instagram app or web)
   */
  shareToInstagram(customUrl) {
    const url = customUrl || this.siteUrl;
    // Instagram doesn't have a direct URL share, so we'll copy the link and open Instagram
    this.copyLink(url).then(() => {
      // Try to open Instagram app on mobile, or web on desktop
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = 'instagram://';
        // Fallback to web if app is not installed
        setTimeout(() => {
          window.open('https://www.instagram.com/', '_blank');
        }, 500);
      } else {
        window.open('https://www.instagram.com/', '_blank');
      }
      
      // 使用统一的弹窗风格
      if (typeof showUserAlert === 'function') {
        showUserAlert({
          type: 'success',
          title: '链接已复制',
          message: '链接已复制到剪贴板！您现在可以在Instagram帖子或动态中粘贴它。',
          buttons: [{ text: '确定', action: 'close' }]
        });
      } else {
        alert('Link copied! You can now paste it in your Instagram post or story.');
      }
    });
  }

  /**
   * Share to Reddit
   */
  shareToReddit(customTitle, customUrl) {
    const title = customTitle || this.config.share.messages.reddit;
    const url = customUrl || this.siteUrl;
    const shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    
    this.openPopup(shareUrl, 'Reddit Share', 550, 500);
  }

  /**
   * Copy link to clipboard
   */
  async copyLink(customUrl) {
    const url = customUrl || this.siteUrl;
    
    try {
      // Modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        return true;
      }
      
      // Fallback method for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    } catch (err) {
      console.error('Failed to copy link:', err);
      return false;
    }
  }

  /**
   * Universal share method - tries native first, falls back to specific platform
   */
  async share(platform, customText, customUrl) {
    // If native share requested but not supported, show custom share modal
    if (platform === 'native' && !this.isNativeShareSupported()) {
      this.showShareModal(customText, customUrl);
      return true;
    }
    
    // Try native share on mobile
    if (this.isNativeShareSupported() && platform === 'native') {
      return await this.shareNative(customText, customUrl);
    }

    // Platform-specific sharing
    switch (platform.toLowerCase()) {
      case 'x':
      case 'twitter':
        this.shareToX(customText, customUrl);
        break;
      case 'facebook':
        this.shareToFacebook(customUrl);
        break;
      case 'instagram':
        this.shareToInstagram(customUrl);
        break;
      case 'reddit':
        this.shareToReddit(customText, customUrl);
        break;
      case 'copy':
        return await this.copyLink(customUrl);
      default:
        console.error('Unknown platform:', platform);
        return false;
    }
    
    return true;
  }

  /**
   * Show share modal with platform options (3D game style)
   */
  showShareModal(customText, customUrl) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.share-modal-overlay');
    if (existingModal) {
      existingModal.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'share-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    `;
    
    // 3D游戏风格的弹窗容器
    // 在移动端使用响应式宽度，避免占满屏幕
    const isMobile = window.innerWidth <= 768;
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%);
      padding: 32px;
      border-radius: 24px;
      min-width: ${isMobile ? '0' : '400px'};
      max-width: ${isMobile ? 'calc(100vw - 40px)' : '500px'};
      width: ${isMobile ? 'calc(100vw - 40px)' : '90%'};
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 
        0 8px 0 rgba(0, 0, 0, 0.2),
        0 16px 40px rgba(0, 0, 0, 0.4);
      border: 3px solid rgba(255, 255, 255, 0.9);
      position: relative;
      animation: modalBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      font-family: 'Arial', 'Microsoft YaHei', '微软雅黑', sans-serif;
      text-align: center;
      box-sizing: border-box;
    `;
    
    // 顶部彩色条
    const colorBar = document.createElement('div');
    colorBar.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, 
        #FF9500 0%, 
        #FFD700 25%, 
        #4CD964 50%, 
        #4A90E2 75%, 
        #9B59B6 100%);
      border-radius: 24px 24px 0 0;
    `;
    modal.appendChild(colorBar);
    
    // 顶部光泽效果
    const shine = document.createElement('div');
    shine.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0));
      border-radius: 24px 24px 0 0;
      pointer-events: none;
    `;
    modal.appendChild(shine);
    
    // 内容区域
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = 'position: relative; z-index: 1;';
    contentDiv.innerHTML = `
      <h2 style="color: #4A90E2; font-weight: 900; font-size: 28px; margin: 0 0 24px 0; text-shadow: 0 2px 4px rgba(74, 144, 226, 0.3);">
        📤 Share FishTalk AI
      </h2>
      <div id="share-buttons-container" style="display: flex; flex-direction: column; gap: 12px;"></div>
    `;
    modal.appendChild(contentDiv);
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add share buttons with 3D style and SVG icons
    const container = contentDiv.querySelector('#share-buttons-container');
    
    // SVG图标定义（3D风格）
    const iconSVGs = {
      x: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>`,
      facebook: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>`,
      instagram: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>`,
      reddit: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
      </svg>`,
      copy: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>`
    };
    
    const platforms = [
      { platform: 'x', label: 'Share on X', icon: iconSVGs.x, color: '#000000', borderColor: '#000000' },
      { platform: 'facebook', label: 'Share on Facebook', icon: iconSVGs.facebook, color: '#1877F2', borderColor: '#1877F2' },
      { platform: 'instagram', label: 'Share on Instagram', icon: iconSVGs.instagram, color: '#E4405F', borderColor: '#E4405F' },
      { platform: 'reddit', label: 'Share on Reddit', icon: iconSVGs.reddit, color: '#FF4500', borderColor: '#FF4500' },
      { platform: 'copy', label: 'Copy Link', icon: iconSVGs.copy, color: '#4A90E2', borderColor: '#4A90E2' }
    ];
    
    platforms.forEach(({ platform, label, icon, color, borderColor }) => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        padding: 14px 24px;
        background: linear-gradient(180deg, ${color} 0%, ${color}dd 50%, ${color}bb 100%);
        color: white;
        border: none;
        border-bottom: 3px solid ${borderColor}80;
        border-radius: 16px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 0 ${borderColor}80, 0 6px 20px ${color}40;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        transition: all 0.15s;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
      `;
      
      // 创建图标容器（带3D效果）
      const iconContainer = document.createElement('span');
      iconContainer.className = 'share-icon-3d';
      iconContainer.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.4)) 
                drop-shadow(0 0 6px rgba(255, 255, 255, 0.3));
        transform: perspective(200px) rotateX(-5deg) translateZ(0);
        transition: all 0.25s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      `;
      iconContainer.innerHTML = icon;
      
      // 创建文本容器
      const textContainer = document.createElement('span');
      textContainer.textContent = label;
      
      btn.appendChild(iconContainer);
      btn.appendChild(textContainer);
      
      // 添加光泽效果
      const btnShine = document.createElement('div');
      btnShine.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 50%;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0));
        border-radius: 16px 16px 0 0;
        pointer-events: none;
      `;
      btn.appendChild(btnShine);
      
      // 图标悬停效果
      btn.addEventListener('mouseenter', function() {
        iconContainer.style.transform = 'perspective(200px) rotateX(0deg) translateY(-2px) scale(1.15) translateZ(5px)';
        iconContainer.style.filter = 'drop-shadow(0 3px 5px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))';
      });
      
      btn.addEventListener('mouseleave', function() {
        iconContainer.style.transform = 'perspective(200px) rotateX(-5deg) translateZ(0)';
        iconContainer.style.filter = 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))';
      });
      
      // 悬停效果
      btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = `0 6px 0 ${borderColor}80, 0 8px 25px ${color}50`;
      });
      btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = `0 4px 0 ${borderColor}80, 0 6px 20px ${color}40`;
      });
      btn.addEventListener('mousedown', function() {
        this.style.transform = 'translateY(2px)';
        this.style.boxShadow = `0 2px 0 ${borderColor}80, 0 4px 15px ${color}40`;
      });
      btn.addEventListener('mouseup', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = `0 6px 0 ${borderColor}80, 0 8px 25px ${color}50`;
      });
      
      if (platform === 'copy') {
        btn.onclick = async () => {
          const success = await this.copyLink(customUrl);
          if (success) {
            const originalIcon = iconContainer.innerHTML;
            const originalText = textContainer.textContent;
            const originalBg = btn.style.background;
            const originalBorder = btn.style.borderBottom;
            
            // 更新为成功状态
            iconContainer.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>`;
            textContainer.textContent = 'Link Copied!';
            btn.style.background = 'linear-gradient(180deg, #4CD964 0%, #4CD964dd 50%, #3CB54A 100%)';
            btn.style.borderBottom = '3px solid #2E8B3A80';
            
            setTimeout(() => {
              iconContainer.innerHTML = originalIcon;
              textContainer.textContent = originalText;
              btn.style.background = originalBg;
              btn.style.borderBottom = originalBorder;
            }, 2000);
          }
        };
      } else {
        btn.onclick = () => {
          this.share(platform, customText, customUrl);
          close();
        };
      }
      
      container.appendChild(btn);
    });
    
    function close() {
      overlay.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        if (overlay.parentNode) {
          document.body.removeChild(overlay);
        }
      }, 300);
    }
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        close();
      }
    });
  }

  /**
   * Open popup window for social sharing
   */
  openPopup(url, title, width, height) {
    const left = (window.innerWidth - width) / 2 + window.screenX;
    const top = (window.innerHeight - height) / 2 + window.screenY;
    const features = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`;
    
    window.open(url, title, features);
  }

  /**
   * Create share button HTML
   */
  createShareButton(platform, text, className) {
    const icons = {
      x: '✖️',
      twitter: '✖️', // Legacy support
      facebook: '📘',
      instagram: '📷',
      reddit: '🔶',
      discord: '💬',
      copy: '📋',
      native: '📤'
    };

    const button = document.createElement('button');
    button.className = `share-btn share-${platform} ${className || ''}`;
    button.innerHTML = `${icons[platform] || '📤'} ${text}`;
    button.onclick = () => this.share(platform);
    
    return button;
  }

  /**
   * Create complete share menu
   */
  createShareMenu(containerClass) {
    const container = document.createElement('div');
    container.className = `share-menu ${containerClass || ''}`;

    // Show individual platform buttons (removed native share)
    container.appendChild(this.createShareButton('x', 'X', 'btn-x'));
    container.appendChild(this.createShareButton('facebook', 'Facebook', 'btn-facebook'));
    container.appendChild(this.createShareButton('instagram', 'Instagram', 'btn-instagram'));
    container.appendChild(this.createShareButton('reddit', 'Reddit', 'btn-reddit'));

    // Copy link button (always show)
    const copyBtn = this.createShareButton('copy', 'Copy Link', 'btn-copy');
    copyBtn.onclick = async () => {
      const success = await this.copyLink();
      if (success) {
        copyBtn.innerHTML = '✅ Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = '📋 Copy Link';
        }, 2000);
      }
    };
    container.appendChild(copyBtn);

    return container;
  }
}

// Initialize global instance
window.socialShare = new SocialShare(window.SOCIAL_CONFIG);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SocialShare;
}

