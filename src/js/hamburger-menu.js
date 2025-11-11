// 汉堡菜单功能
(function() {
  'use strict';

  // 等待DOM加载完成
  document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburger-menu-btn');
    const sidebarMenu = document.getElementById('sidebar-menu');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarShareBtn = document.getElementById('sidebar-share-btn');

    // 如果没有找到必要的元素，直接返回
    if (!hamburgerBtn || !sidebarMenu || !closeSidebarBtn || !sidebarOverlay) {
      return;
    }

    // 打开侧边栏
    function openSidebar() {
      sidebarMenu.classList.add('open');
      sidebarOverlay.classList.add('active');
      hamburgerBtn.classList.add('active');
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    }

    // 关闭侧边栏
    function closeSidebar() {
      sidebarMenu.classList.remove('open');
      sidebarOverlay.classList.remove('active');
      hamburgerBtn.classList.remove('active');
      document.body.style.overflow = ''; // 恢复滚动
    }

    // 点击汉堡菜单按钮
    hamburgerBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (sidebarMenu.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    // 点击关闭按钮
    closeSidebarBtn.addEventListener('click', closeSidebar);

    // 点击遮罩层关闭
    sidebarOverlay.addEventListener('click', closeSidebar);

    // 点击侧边栏内的链接后关闭（除了分享按钮）
    const sidebarLinks = sidebarMenu.querySelectorAll('.sidebar-link:not(#sidebar-share-btn)');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', function() {
        // 延迟关闭，让链接跳转有时间执行
        setTimeout(closeSidebar, 100);
      });
    });

    // 处理分享按钮 - 调用和鱼缸页一样的分享弹窗
    if (sidebarShareBtn) {
      sidebarShareBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // 关闭侧边栏
        closeSidebar();
        // 调用分享弹窗（和鱼缸页一样）
        if (window.socialShare && typeof window.socialShare.showShareModal === 'function') {
          window.socialShare.showShareModal();
        } else {
          // 如果socialShare未加载，尝试使用原生分享API
          if (navigator.share) {
            navigator.share({
              title: document.title,
              text: 'Check out FishTalk.app!',
              url: window.location.href
            }).catch(err => console.log('Error sharing', err));
          } else {
            console.warn('Share functionality not available');
          }
        }
      });
    }

    // ESC键关闭侧边栏
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && sidebarMenu.classList.contains('open')) {
        closeSidebar();
      }
    });

    // 窗口大小改变时，如果窗口变宽，自动关闭侧边栏
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        if (window.innerWidth > 768 && sidebarMenu.classList.contains('open')) {
          closeSidebar();
        }
      }, 250);
    });
  });
})();

