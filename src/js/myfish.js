/**
 * My Fish Page - 我的鱼收藏页面
 * 显示用户自己创作的鱼和收藏的鱼
 */

let allFish = []; // 存储所有鱼数据
let currentSort = 'date'; // 当前排序方式

/**
 * 格式化日期
 */
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    
    let date;
    if (timestamp._seconds) {
        date = new Date(timestamp._seconds * 1000);
    } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
    } else {
        date = new Date(timestamp);
    }
    
    if (isNaN(date.getTime())) return 'Unknown';
    
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? String(text).replace(/[&<>"']/g, m => map[m]) : '';
}

/**
 * 创建简化的鱼卡片（不含投票/举报按钮）
 */
function createSimplifiedFishCard(fish) {
    const isOwn = fish.isOwn || false;
    const isFavorited = fish.isFavorited || false;
    const isAlive = fish.is_alive !== false; // 默认为 true
    
    // 确定鱼的类型标识
    let typeBadge = '';
    if (!isAlive) {
        typeBadge = '<span class="fish-type-badge dead">💀 已逝</span>';
    } else if (isOwn) {
        typeBadge = '<span class="fish-type-badge own">ME</span>';
    } else if (isFavorited) {
        typeBadge = '<span class="fish-type-badge favorited">❤️ 收藏</span>';
    }
    
    const fishId = fish.id || fish.docId;
    const artist = fish.artist || fish.Artist || 'Anonymous';
    const imageUrl = fish.image_url || fish.Image || '';
    const createdAt = fish.created_at || fish.CreatedAt;
    const level = fish.level || 1;
    const health = fish.health || 0;
    const maxHealth = fish.max_health || 100;
    
    return `
        <div class="fish-card" data-fish-id="${fishId}" onclick="showAddToTankModal('${fishId}')" title="点击添加到鱼缸">
            ${typeBadge}
            <div class="fish-image-container">
                <img class="fish-image" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="Fish" data-fish-id="${fishId}">
            </div>
            <div class="fish-info">
                <div class="fish-artist">${escapeHtml(artist)}</div>
                <div class="fish-date">${formatDate(createdAt)}</div>
                <div class="fish-level">⭐ 等级 ${level}</div>
                <div class="fish-health">❤️ ${health}/${maxHealth}</div>
            </div>
            <div class="add-to-tank-hint">点击添加到鱼缸</div>
        </div>
    `;
}

/**
 * 加载鱼图片
 */
async function loadFishImages() {
    const fishImages = document.querySelectorAll('.fish-image[data-fish-id]');
    
    for (const img of fishImages) {
        const fishId = img.getAttribute('data-fish-id');
        const fish = allFish.find(f => (f.id || f.docId) === fishId);
        
        if (fish) {
            const imageUrl = fish.image_url || fish.Image;
            if (imageUrl) {
                try {
                    // 使用 fish-utils.js 中的函数加载图片
                    if (typeof createFishImageDataUrl === 'function') {
                        createFishImageDataUrl(imageUrl, (dataUrl) => {
                            img.src = dataUrl;
                        });
                    } else {
                        // Fallback: 直接使用图片 URL
                        img.src = imageUrl;
                    }
                } catch (error) {
                    console.error('Error loading fish image:', error);
                }
            }
        }
    }
}

/**
 * 更新统计信息
 */
function updateStats(stats) {
    if (!stats) return;
    
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) {
        statsContainer.style.display = 'flex';
    }
    
    document.getElementById('stat-total').textContent = stats.totalFish || 0;
    document.getElementById('stat-own').textContent = stats.ownFish || 0;
    document.getElementById('stat-favorited').textContent = stats.favoritedFish || 0;
    document.getElementById('stat-alive').textContent = stats.aliveFish || 0;
    document.getElementById('stat-avg-level').textContent = stats.avgLevel || '0';
}

/**
 * 排序鱼数据
 */
function sortFish(fishArray, sortType) {
    const sorted = [...fishArray];
    
    switch (sortType) {
        case 'date':
            // 按日期降序（最新的在前）
            sorted.sort((a, b) => {
                const dateA = a.created_at || a.CreatedAt || 0;
                const dateB = b.created_at || b.CreatedAt || 0;
                
                const timeA = dateA._seconds ? dateA._seconds : new Date(dateA).getTime() / 1000;
                const timeB = dateB._seconds ? dateB._seconds : new Date(dateB).getTime() / 1000;
                
                return timeB - timeA;
            });
            break;
            
        case 'level':
            // 按等级降序
            sorted.sort((a, b) => (b.level || 0) - (a.level || 0));
            break;
            
        case 'name':
            // 按艺术家名称字母顺序
            sorted.sort((a, b) => {
                const nameA = (a.artist || a.Artist || 'Anonymous').toLowerCase();
                const nameB = (b.artist || b.Artist || 'Anonymous').toLowerCase();
                return nameA.localeCompare(nameB);
            });
            break;
            
        case 'type':
            // 按类型排序：自己的 > 收藏的 > 死亡的
            sorted.sort((a, b) => {
                const getTypeOrder = (fish) => {
                    if (!fish.is_alive) return 3;
                    if (fish.isOwn) return 1;
                    if (fish.isFavorited) return 2;
                    return 4;
                };
                return getTypeOrder(a) - getTypeOrder(b);
            });
            break;
    }
    
    return sorted;
}

/**
 * 渲染鱼卡片
 */
function renderFish(fishArray) {
    const gridElement = document.getElementById('fish-grid');
    const loadingElement = document.getElementById('loading');
    const emptyState = document.getElementById('empty-state');
    
    if (!fishArray || fishArray.length === 0) {
        // 显示空状态
        loadingElement.style.display = 'none';
        gridElement.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    // 隐藏加载和空状态
    loadingElement.style.display = 'none';
    emptyState.style.display = 'none';
    gridElement.style.display = 'grid';
    
    // 排序
    const sortedFish = sortFish(fishArray, currentSort);
    
    // 渲染卡片
    gridElement.innerHTML = sortedFish.map(fish => createSimplifiedFishCard(fish)).join('');
    
    // 加载图片
    setTimeout(() => loadFishImages(), 100);
}

/**
 * 加载我的鱼数据
 */
async function loadMyFish() {
    const loadingElement = document.getElementById('loading');
    const gridElement = document.getElementById('fish-grid');
    const emptyState = document.getElementById('empty-state');
    
    try {
        loadingElement.textContent = '加载中...';
        loadingElement.style.display = 'block';
        gridElement.style.display = 'none';
        emptyState.style.display = 'none';
        
        // 获取认证 token
        const token = localStorage.getItem('userToken');
        if (!token) {
            throw new Error('请先登录');
        }
        
        // 调用 API
        const BACKEND_URL = window.location.origin;
        const response = await fetch(`${BACKEND_URL}/api/fishtank/my-fish`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || '加载失败');
        }
        
        allFish = result.fish || [];
        console.log(`✅ 加载了 ${allFish.length} 条鱼`);
        
        // 更新统计信息
        updateStats(result.stats);
        
        // 渲染鱼卡片
        renderFish(allFish);
        
    } catch (error) {
        console.error('❌ 加载鱼数据失败:', error);
        loadingElement.textContent = `加载失败: ${error.message}`;
        loadingElement.style.display = 'block';
        gridElement.style.display = 'none';
        
        // 如果是未登录错误，显示提示
        if (error.message.includes('登录')) {
            setTimeout(() => {
                window.location.href = 'login.html?redirect=myfish.html';
            }, 1500);
        }
    }
}

/**
 * 处理排序切换
 */
function handleSortChange(sortType) {
    currentSort = sortType;
    
    // 更新按钮状态
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-sort="${sortType}"]`).classList.add('active');
    
    // 重新渲染
    renderFish(allFish);
}

/**
 * 页面初始化
 */
window.addEventListener('DOMContentLoaded', () => {
    console.log('🐟 我的鱼页面初始化...');
    
    // 设置排序按钮事件
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handleSortChange(btn.getAttribute('data-sort'));
        });
    });
    
    // 加载数据
    loadMyFish();
});











