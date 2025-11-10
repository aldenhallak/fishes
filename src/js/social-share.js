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
      alert('Link copied! You can now paste it in your Instagram post or story.');
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
   * Show share modal with platform options
   */
  showShareModal(customText, customUrl) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.share-modal-overlay');
    if (existingModal) {
      existingModal.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'share-modal-overlay';
    overlay.style.cssText = 'position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(4px);';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'background: white; padding: 30px; border-radius: 16px; max-width: 400px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3); text-align: center;';
    
    modal.innerHTML = `
      <h3 style="margin: 0 0 20px 0; color: #6366F1; font-size: 20px;">📤 Share FishTalk AI</h3>
      <div id="share-buttons-container" style="display: flex; flex-direction: column; gap: 10px;"></div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add share buttons
    const container = modal.querySelector('#share-buttons-container');
    const platforms = [
      { platform: 'x', label: 'Share on X', icon: '✖️', color: '#000' },
      { platform: 'facebook', label: 'Share on Facebook', icon: '📘', color: '#1877F2' },
      { platform: 'instagram', label: 'Share on Instagram', icon: '📷', color: '#E4405F' },
      { platform: 'reddit', label: 'Share on Reddit', icon: '🔶', color: '#FF4500' },
      { platform: 'copy', label: 'Copy Link', icon: '📋', color: '#6366F1' }
    ];
    
    platforms.forEach(({ platform, label, icon, color }) => {
      const btn = document.createElement('button');
      btn.style.cssText = `padding: 12px 20px; background: ${color}; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 10px; transition: transform 0.2s;`;
      btn.innerHTML = `${icon} ${label}`;
      btn.onmouseover = () => btn.style.transform = 'scale(1.02)';
      btn.onmouseout = () => btn.style.transform = 'scale(1)';
      
      if (platform === 'copy') {
        btn.onclick = async () => {
          const success = await this.copyLink(customUrl);
          if (success) {
            btn.innerHTML = '✅ Link Copied!';
            setTimeout(() => {
              btn.innerHTML = `${icon} ${label}`;
            }, 2000);
          }
        };
      } else {
        btn.onclick = () => {
          this.share(platform, customText, customUrl);
          overlay.remove();
        };
      }
      
      container.appendChild(btn);
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
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

