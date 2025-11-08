/**
 * Fish Utilities - New Backend Version
 * 使用新的Vercel Functions API + Supabase Auth
 * 
 * 使用说明：
 * 1. 备份原有的 fish-utils.js
 * 2. 将此文件重命名为 fish-utils.js
 * 3. 更新所有HTML文件中的引用
 */

// ====================================
// 配置
// ====================================

// HTML escaping function to prevent XSS attacks
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        return String(unsafe || '');
    }
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// API基础路径（Vercel Serverless Functions）
const API_BASE = '/api';

// ====================================
// 核心数据获取函数（替换Firestore）
// ====================================

/**
 * 获取鱼列表（按不同方式排序）
 * @param {string} sortType - 排序类型: 'hot', 'recent', 'top', 'controversial', 'random'
 * @param {number} limit - 数量限制
 * @param {number} offset - 偏移量（用于分页）
 * @param {string} userId - 可选的用户ID筛选
 * @returns {Promise<Array>} 鱼数据数组（Firestore兼容格式）
 */
async function getFishBySort(sortType = 'recent', limit = 25, offset = 0, userId = null) {
    try {
        const params = new URLSearchParams({
            sort: sortType,
            limit: limit.toString(),
            offset: offset.toString()
        });
        
        if (userId) {
            params.append('userId', userId);
        }
        
        const response = await fetch(`${API_BASE}/fish/list?${params}`);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch fish');
        }
        
        // 转换为Firestore兼容格式（保持向后兼容）
        return data.fish.map(fishItem => ({
            id: fishItem.id,
            data: () => ({
                // 原有字段
                userId: fishItem.user_id,
                UserId: fishItem.user_id, // 兼容性
                Image: fishItem.image_url,
                image: fishItem.image_url, // 兼容性
                Artist: fishItem.artist,
                artist: fishItem.artist, // 兼容性
                CreatedAt: fishItem.created_at,
                createdAt: fishItem.created_at, // 兼容性
                upvotes: fishItem.upvotes,
                downvotes: fishItem.downvotes,
                
                // 新增战斗系统字段
                talent: fishItem.talent,
                level: fishItem.level,
                experience: fishItem.experience,
                health: fishItem.health,
                maxHealth: fishItem.max_health,
                battlePower: fishItem.battle_power,
                isAlive: fishItem.is_alive,
                isInBattleMode: fishItem.is_in_battle_mode,
                totalWins: fishItem.total_wins,
                totalLosses: fishItem.total_losses
            })
        }));
    } catch (error) {
        console.error('Error fetching fish:', error);
        throw error;
    }
}

/**
 * 获取随机鱼
 */
async function getRandomFish(limit = 25, userId = null) {
    return getFishBySort('random', limit, 0, userId);
}

// ====================================
// 投票和举报（使用新API）
// ====================================

/**
 * 发送投票
 * @param {string} fishId - 鱼ID
 * @param {string} voteType - 'up' 或 'down'
 * @returns {Promise<Object>} 投票结果
 */
async function sendVote(fishId, voteType) {
    try {
        // 检查用户是否登录
        if (!window.supabaseAuth || !window.supabaseAuth.isLoggedIn) {
            throw new Error('Please login to vote');
        }
        
        const isLoggedIn = await window.supabaseAuth.isLoggedIn();
        if (!isLoggedIn) {
            throw new Error('Please login to vote');
        }
        
        // 获取当前用户
        const user = await window.supabaseAuth.getCurrentUser();
        if (!user) {
            throw new Error('Please login to vote');
        }
        
        const response = await fetch(`${API_BASE}/vote/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fishId,
                userId: user.id,
                voteType
            })
        });
        
        if (!response.ok) {
            throw new Error(`Vote request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Vote failed');
        }
        
        return {
            success: true,
            action: data.action,
            upvotes: data.upvotes,
            downvotes: data.downvotes,
            score: data.score
        };
    } catch (error) {
        console.error('Error sending vote:', error);
        throw error;
    }
}

/**
 * 发送举报
 * @param {string} fishId - 鱼ID
 * @param {string} reason - 举报原因
 * @returns {Promise<Object>} 举报结果
 */
async function sendReport(fishId, reason) {
    try {
        const response = await fetch(`${API_BASE}/report/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fishId,
                reason: reason.trim(),
                userAgent: navigator.userAgent,
                url: window.location.href
            })
        });
        
        if (!response.ok) {
            throw new Error(`Report request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            success: data.success,
            message: data.message,
            reportCount: data.reportCount,
            isHidden: data.isHidden
        };
    } catch (error) {
        console.error('Error submitting report:', error);
        throw error;
    }
}

// ====================================
// 辅助函数（保持向后兼容）
// ====================================

/**
 * 计算分数
 */
function calculateScore(fish) {
    const upvotes = fish.upvotes || 0;
    const downvotes = fish.downvotes || 0;
    return upvotes - downvotes;
}

/**
 * 通用投票处理器
 */
async function handleVoteGeneric(fishId, voteType, button, updateCallback) {
    button.disabled = true;
    button.style.opacity = '0.6';

    try {
        const result = await sendVote(fishId, voteType);

        if (updateCallback) {
            updateCallback(result, voteType);
        }

        button.style.backgroundColor = voteType === 'up' ? '#4CAF50' : '#f44336';
        setTimeout(() => {
            button.style.backgroundColor = '';
        }, 1000);

    } catch (error) {
        console.error('Vote failed:', error);
        
        // 检查是否是登录问题
        if (error.message.includes('login')) {
            if (confirm('Please login to vote. Go to login page?')) {
                redirectToLogin();
            }
        } else {
            alert('Voting failed. Please try again.');
        }
    }

    setTimeout(() => {
        button.disabled = false;
        button.style.opacity = '1';
    }, 1000);
}

/**
 * 通用举报处理器
 */
async function handleReportGeneric(fishId, button) {
    try {
        const reason = prompt('Please provide a reason for reporting this fish:');

        if (!reason || reason.trim() === '') {
            return;
        }

        button.disabled = true;
        button.style.opacity = '0.6';

        const result = await sendReport(fishId, reason);

        if (result.success) {
            alert('Report submitted successfully. Thank you for helping keep our community safe!');

            button.textContent = '✅';
            button.title = 'Report submitted';
            button.style.opacity = '1';
            button.style.backgroundColor = '#4CAF50';

            setTimeout(() => {
                button.textContent = '🚩';
                button.title = 'Report inappropriate content';
                button.style.backgroundColor = '';
                button.disabled = false;
                button.style.opacity = '1';
            }, 10000);

        } else {
            throw new Error(result.message || 'Report submission failed');
        }

    } catch (error) {
        console.error('Error submitting report:', error);
        button.disabled = false;
        button.style.opacity = '1';
        alert('Error submitting report. Please try again later.');
    }
}

/**
 * 格式化日期
 */
function formatDate(dateValue) {
    if (!dateValue) return 'Unknown date';

    let dateObj;
    if (typeof dateValue === 'string') {
        dateObj = new Date(dateValue);
    } else if (typeof dateValue.toDate === 'function') {
        dateObj = dateValue.toDate();
    } else {
        dateObj = dateValue;
    }

    if (isNaN(dateObj)) return 'Unknown date';

    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * 创建投票控制HTML
 */
function createVotingControlsHTML(fishId, upvotes = 0, downvotes = 0, includeScore = false, cssClass = '') {
    const score = upvotes - downvotes;
    let html = `<div class="voting-controls ${cssClass}">`;

    if (includeScore) {
        html += `<span class="fish-score">Score: ${score}</span><br>`;
    }

    html += `<button class="vote-btn upvote-btn" onclick="handleVote('${fishId}', 'up', this)">`;
    html += `👍 <span class="vote-count upvote-count">${upvotes}</span>`;
    html += `</button>`;
    html += `<button class="vote-btn downvote-btn" onclick="handleVote('${fishId}', 'down', this)">`;
    html += `👎 <span class="vote-count downvote-count">${downvotes}</span>`;
    html += `</button>`;
    html += `<button class="report-btn" onclick="handleReport('${fishId}', this)" title="Report inappropriate content">`;
    html += `🚩`;
    html += `</button>`;
    html += `</div>`;

    return html;
}

/**
 * 转换鱼图片为Data URL
 */
function createFishImageDataUrl(imgUrl, callback) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 120;
        canvas.height = 80;

        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        callback(canvas.toDataURL());
    };
    img.onerror = function () {
        callback(null);
    };
    img.src = imgUrl;
}

// ====================================
// 认证工具函数（使用Supabase）
// ====================================

/**
 * 检查用户是否登录
 */
async function isUserLoggedIn() {
    if (!window.supabaseAuth || !window.supabaseAuth.isLoggedIn) {
        return false;
    }
    return await window.supabaseAuth.isLoggedIn();
}

/**
 * 获取当前用户
 */
async function getCurrentUser() {
    if (!window.supabaseAuth || !window.supabaseAuth.getCurrentUser) {
        return null;
    }
    return await window.supabaseAuth.getCurrentUser();
}

/**
 * 重定向到登录页
 */
function redirectToLogin(currentPage = null) {
    // Only store redirect if it's from a page that requires auth (not from index.html)
    const redirectUrl = currentPage || window.location.href;
    const currentPath = window.location.pathname;
    
    // Don't redirect back to index.html after login - stay on index
    if (!currentPath.includes('index.html') && currentPath !== '/') {
        localStorage.setItem('loginRedirect', redirectUrl);
    } else {
        // Clear any existing redirect if logging in from index
        localStorage.removeItem('loginRedirect');
    }
    
    // Show auth modal instead of redirecting to login.html
    if (window.authUI && window.authUI.showLoginModal) {
        window.authUI.showLoginModal();
    } else {
        // Fallback: if auth UI is not available, redirect to home page
        window.location.href = '/index.html';
    }
}

/**
 * 登出
 */
async function logout() {
    if (window.supabaseAuth && window.supabaseAuth.signOut) {
        await window.supabaseAuth.signOut();
    }
    localStorage.removeItem('loginRedirect');
    window.location.href = '/login.html';
}

/**
 * 要求认证
 */
async function requireAuthentication(redirectToCurrentPage = true) {
    const loggedIn = await isUserLoggedIn();
    if (!loggedIn) {
        if (redirectToCurrentPage) {
            redirectToLogin(window.location.href);
        } else {
            redirectToLogin();
        }
        return false;
    }
    return true;
}

/**
 * 更新认证UI
 */
async function updateAuthenticationUI() {
    const loggedIn = await isUserLoggedIn();
    const currentUser = loggedIn ? await getCurrentUser() : null;

    // Update "my tanks" link visibility and URL
    const myTanksLink = document.getElementById('my-tanks-link');
    if (myTanksLink) {
        myTanksLink.style.display = loggedIn ? 'inline' : 'none';
        
        // If logged in, get default tank and update link to go directly to it
        // Always link to mytank.html (simplified tank architecture)
        if (loggedIn) {
            myTanksLink.href = 'mytank.html';
        }
    }
    
    // Update auth link (login/logout)
    const authLink = document.getElementById('auth-link');
    if (authLink) {
        if (loggedIn) {
            authLink.textContent = 'Logout';
            authLink.href = '#';
            authLink.onclick = (e) => {
                e.preventDefault();
                logout();
            };
        } else {
            authLink.textContent = 'Login';
            authLink.href = '/login.html';
            authLink.onclick = null;
        }
    }

    // Update auth status if present
    const authStatus = document.getElementById('auth-status');
    if (authStatus) {
        if (loggedIn && currentUser) {
            const displayName = currentUser.user_metadata?.name || 
                              currentUser.email?.split('@')[0] || 
                              'User';
            authStatus.textContent = `Logged in as ${displayName}`;
            authStatus.style.display = 'block';
        } else {
            authStatus.style.display = 'none';
        }
    }
}

// ====================================
// 页面加载时初始化
// ====================================

// 页面加载后自动更新认证UI
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAuthenticationUI);
} else {
    updateAuthenticationUI();
}

// 监听Supabase认证状态变化
if (window.supabaseAuth && window.supabaseAuth.onAuthStateChange) {
    window.supabaseAuth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        updateAuthenticationUI();
    });
}

console.log('✅ Fish Utils (New Backend) loaded');



