// Shared utilities for fish functionality across tank.js and rank.js
// This file contains common functions to avoid code duplication

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

// Configuration for backend URL - dynamically loaded from API
// 后端配置（会从API异步加载）
let backendConfig = {
    backend: 'hasura', // 默认使用hasura
    useHasura: true,
    useOriginal: false,
    originalBackendUrl: null,
    hasuraEndpoint: '/api/graphql',
    loaded: false
};

// 缓存用户ID，避免每帧动画都检查认证状态
let cachedUserId = null;
let userIdChecked = false;

// Check for URL parameter override (useful for testing)
const urlParams = new URLSearchParams(window.location.search);
const forceLocal = urlParams.get('local') === 'true';
const forceProd = urlParams.get('prod') === 'true';

// 临时的BACKEND_URL（用于兼容旧代码，在配置加载后会更新）
// 默认为空字符串，表示使用本地API
window.BACKEND_URL = '';

// URL参数强制覆盖
if (forceLocal) {
    window.BACKEND_URL = 'http://localhost:8080';
} else if (forceProd) {
    window.BACKEND_URL = 'https://fishes-be-571679687712.northamerica-northeast1.run.app';
}

const BACKEND_URL = window.BACKEND_URL;

/**
 * 加载后端配置
 */
async function loadBackendConfig() {
    if (backendConfig.loaded) return backendConfig;
    
    try {
        const response = await fetch('/api/config/backend');
        if (response.ok) {
            const config = await response.json();
            backendConfig = { ...config, loaded: true };
            
            // 更新BACKEND_URL
            if (config.useOriginal && config.originalBackendUrl) {
                window.BACKEND_URL = config.originalBackendUrl;
            } else {
                // 使用Hasura时，BACKEND_URL为空字符串，表示使用本地API
                window.BACKEND_URL = '';
            }
            
            console.log(`🔧 后端配置: ${config.backend === 'hasura' ? 'Hasura数据库' : '原作者后端'}`);
            console.log(`🌐 BACKEND_URL: ${window.BACKEND_URL || '(本地API)'}`);
        } else {
            console.warn('⚠️ 无法加载后端配置，使用默认值');
            backendConfig.loaded = true;
        }
    } catch (error) {
        console.warn('⚠️ 加载后端配置失败，使用默认值:', error);
        backendConfig.loaded = true;
    }
    
    return backendConfig;
}

// 导出配置加载函数
window.loadBackendConfig = loadBackendConfig;

// Note: Score calculation removed - now only using upvotes

// Send vote to endpoint
async function sendVote(fishId, voteType) {
    try {
        // 获取Supabase认证token和用户ID
        let authToken = null;
        let userId = null;
        
        if (window.supabaseAuth) {
            authToken = await window.supabaseAuth.getAccessToken();
            const user = await window.supabaseAuth.getUser();
            userId = user?.id;
        }
        
        // 如果没有用户ID，检查localStorage
        if (!userId) {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            userId = userInfo.userId;
        }
        
        if (!userId) {
            throw new Error('请先登录才能投票');
        }
        
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await fetch(`${BACKEND_URL}/api/vote/vote`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                fishId: fishId,
                userId: userId,
                voteType: voteType // 'up' or 'down'
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`Vote failed with status: ${response.status}`, errorData);
            throw new Error(errorData.error || `Vote failed with status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error sending vote:', error);
        throw error;
    }
}

// Send report to endpoint
async function sendReport(fishId, reason) {
    try {
        // 获取Supabase认证token
        let authToken = null;
        if (window.supabaseAuth) {
            authToken = await window.supabaseAuth.getAccessToken();
        }
        
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await fetch(`${BACKEND_URL}/api/report/submit`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                fishId: fishId,
                reason: reason.trim()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error submitting report:', error);
        throw error;
    }
}

// Generic vote handler that can be used by both tank and rank
async function handleVoteGeneric(fishId, voteType, button, updateCallback) {
    // Disable button temporarily
    button.disabled = true;
    button.style.opacity = '0.6';

    try {
        const result = await sendVote(fishId, voteType);

        // Call the provided update callback with the result
        if (updateCallback) {
            updateCallback(result, voteType);
        }

        // Show success feedback
        button.style.backgroundColor = voteType === 'up' ? '#4CAF50' : '#f44336';
        setTimeout(() => {
            button.style.backgroundColor = '';
        }, 1000);

    } catch (error) {
        console.error('Vote failed:', error);
        alert('Voting failed. Please try again.');
    }

    // Re-enable button
    setTimeout(() => {
        button.disabled = false;
        button.style.opacity = '1';
    }, 1000);
}

// Generic report handler that can be used by both tank and rank
async function handleReportGeneric(fishId, button) {
    try {
        const reason = prompt('Please provide a reason for reporting this fish:');

        if (!reason || reason.trim() === '') {
            return; // User cancelled or entered empty reason
        }

        // Disable button immediately
        button.disabled = true;
        button.style.opacity = '0.6';

        const result = await sendReport(fishId, reason);

        if (result.success) {
            alert('Report submitted successfully. Thank you for helping keep our community safe!');

            // Update button to show success
            button.textContent = '✅';
            button.title = 'Report submitted';
            button.style.opacity = '1';
            button.style.backgroundColor = '#4CAF50';

            // Keep button disabled to prevent duplicate reports
            setTimeout(() => {
                button.textContent = '🚩';
                button.title = 'Report inappropriate content';
                button.style.backgroundColor = '';
                button.disabled = false;
                button.style.opacity = '1';
            }, 10000); // 10 second cooldown

        } else {
            throw new Error(result.message || 'Report submission failed');
        }

    } catch (error) {
        console.error('Error submitting report:', error);

        // Re-enable button on error
        button.disabled = false;
        button.style.opacity = '1';

        alert('Error submitting report. Please try again later.');
    }
}

// Format date for display (shared utility)
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

// Create voting controls HTML (shared utility) - only upvote and report
function createVotingControlsHTML(fishId, upvotes = 0, cssClass = '') {
    let html = `<div class="voting-controls ${cssClass}">`;

    html += `<button class="vote-btn upvote-btn" onclick="handleVote('${fishId}', 'up', this)">`;
    html += `👍 <span class="vote-count upvote-count">${upvotes}</span>`;
    html += `</button>`;
    html += `<button class="report-btn" onclick="handleReport('${fishId}', this)" title="Report inappropriate content">`;
    html += `🚩`;
    html += `</button>`;
    html += `</div>`;

    return html;
}

// Generate random document ID for querying
function generateRandomDocId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 20; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Get random documents using backend API
async function getRandomFish(limit = 25, userId = null) {
    // 使用getFishBySort的random模式，确保使用正确的后端
    return await getFishBySort('random', limit, null, 'desc', userId);
}



/**
 * 从Hasura获取鱼数据
 */
async function getFishFromHasura(sortType, limit = 25, offset = 0, userId = null, battleModeOnly = false) {
    // 确定排序字段
    let orderByClause = '{ created_at: desc }';
    
    // 对于random，使用随机offset
    if (sortType === 'random') {
        // 先获取总数，然后随机选择offset
        const countQuery = `
            query GetFishCount {
                fish_aggregate(where: {is_approved: {_eq: true}}) {
                    aggregate {
                        count
                    }
                }
            }
        `;
        
        try {
            const countResponse = await fetch('/api/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: countQuery })
            });
            
            if (countResponse.ok) {
                const countResult = await countResponse.json();
                const totalCount = countResult.data?.fish_aggregate?.aggregate?.count || 0;
                
                if (totalCount > limit) {
                    // 随机选择一个offset
                    offset = Math.floor(Math.random() * (totalCount - limit));
                }
            }
        } catch (error) {
            console.warn('无法获取鱼总数，使用默认offset:', error);
        }
        
        orderByClause = '{ created_at: desc }';
    } else {
        switch (sortType) {
            case 'hot':
            case 'popular':
                orderByClause = '{ upvotes: desc }';
                break;
            case 'score':
                orderByClause = '{ upvotes: desc }';
                break;
            case 'recent':
            case 'date':
                orderByClause = '{ created_at: desc }';
                break;
            default:
                orderByClause = '{ created_at: desc }';
        }
    }

    // 构建GraphQL查询 - 直接在查询字符串中插入 order_by
    // 添加 upvotes 不为 null 的条件，避免 GraphQL 非空类型错误
    // 同时获取总数用于分页
    const query = `
        query GetFish($limit: Int!, $offset: Int!, $userId: String) {
            fish(
                where: {
                    is_approved: { _eq: true }
                    upvotes: { _is_null: false }
                    ${userId ? ', user_id: { _eq: $userId }' : ''}
                }
                limit: $limit
                offset: $offset
                order_by: [${orderByClause}]
            ) {
                id
                user_id
                artist
                image_url
                created_at
                upvotes
                fish_name
                personality
            }
            fish_aggregate(
                where: {
                    is_approved: { _eq: true }
                    upvotes: { _is_null: false }
                    ${userId ? ', user_id: { _eq: $userId }' : ''}
                }
            ) {
                aggregate {
                    count
                }
            }
        }
    `;

    // 确保 limit 和 offset 是有效的数字
    const limitNum = parseInt(limit) || 25;
    const offsetNum = parseInt(offset) || 0;
    
    // 确保值不为 NaN 或负数
    const safeLimit = isNaN(limitNum) || limitNum <= 0 ? 25 : limitNum;
    const safeOffset = isNaN(offsetNum) || offsetNum < 0 ? 0 : offsetNum;

    const variables = {
        limit: safeLimit,
        offset: safeOffset
    };

    if (userId) {
        variables.userId = userId;
    }

    try {
        const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables })
        });

        if (!response.ok) {
            throw new Error(`GraphQL request failed: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
            throw new Error(result.errors[0].message);
        }

        // 获取总数
        const totalCount = result.data.fish_aggregate?.aggregate?.count || 0;
        
        // 转换为Firestore-like格式，并附加总数信息
        const fishDocs = result.data.fish.map(fish => ({
            id: fish.id,
            data: () => ({
                ...fish,
                Artist: fish.artist,
                Image: fish.image_url,
                upvotes: fish.upvotes ?? 0, // 处理 null 值
                CreatedAt: { _seconds: new Date(fish.created_at).getTime() / 1000 }
            })
        }));
        
        // 将总数附加到第一个文档上（用于传递总数信息）
        if (fishDocs.length > 0 && totalCount > 0) {
            fishDocs._totalCount = totalCount;
        }
        
        return fishDocs;
    } catch (error) {
        console.error('Error fetching fish from Hasura:', error);
        throw error;
    }
}

// Get fish from backend API with caching
async function getFishBySort(sortType, limit = 25, startAfter = null, direction = 'desc', userId = null, battleModeOnly = false) {
    // 先加载配置
    await loadBackendConfig();

    // 如果使用Hasura
    if (backendConfig.useHasura) {
        const offset = startAfter || 0;
        return await getFishFromHasura(sortType, limit, offset, userId, battleModeOnly);
    }

    // 使用原作者后端API
    const queryPromise = async () => {
        // Build query parameters to match your backend API
        const params = new URLSearchParams({
            limit: limit.toString(),
            order: direction,
            isVisible: 'true',
            deleted: 'false'
        });

        // Map sortType to orderBy field
        switch (sortType) {
            case 'hot':
                params.append('orderBy', 'hotScore');
                break;
            case 'score':
            case 'popular':
                params.append('orderBy', 'score');
                break;
            case 'date':
            case 'recent':
                params.append('orderBy', 'CreatedAt');
                break;
            case 'random':
                // For random, we'll need to handle this differently
                // Your backend might need a special random endpoint or parameter
                params.append('orderBy', 'CreatedAt');
                params.append('random', 'true');
                break;
            default:
                params.append('orderBy', 'CreatedAt');
        }

        if (userId) {
            params.append('userId', userId);
        }

        if (startAfter) {
            // For pagination, pass the last document ID
            params.append('startAfter', startAfter.id || startAfter);
        }

        const response = await fetch(`${BACKEND_URL}/api/fish?${params}`);

        if (!response.ok) {
            throw new Error(`Backend API failed: ${response.status}`);
        }

        const data = await response.json();

        // Convert backend response to Firestore-like documents
        const docs = data.data.map(fishItem => ({
            id: fishItem.id,
            data: () => fishItem.data || fishItem  // Handle both {id, data} and direct fish object formats
        }));

        return docs;
    };

    return await queryPromise();

}

// Convert fish image to data URL for display
function createFishImageDataUrl(imgUrl, callback) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = 120;
        canvas.height = 80;

        // Calculate scaling to fit within canvas while maintaining aspect ratio
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Center the image
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;

        // Clear canvas and draw image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        callback(canvas.toDataURL());
    };
    img.onerror = function () {
        callback(null);
    };
    img.src = imgUrl;
}

// Authentication utilities - Supabase版本
async function isUserLoggedIn() {
    if (!window.supabaseAuth) return false;
    return await window.supabaseAuth.isLoggedIn();
}

async function getCurrentUser() {
    if (!window.supabaseAuth) return null;
    return await window.supabaseAuth.getCurrentUser();
}

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

async function logout() {
    if (window.supabaseAuth) {
        await window.supabaseAuth.signOut();
    }
    localStorage.removeItem('loginRedirect');
    window.location.href = '/login.html';
}

// Check if authentication is required and redirect if needed
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

// Update authentication-related UI elements
async function updateAuthenticationUI() {
    // 如果用户缓存未初始化，先初始化
    if (!userIdChecked) {
        await initializeUserCache();
    }
    
    // 使用缓存的用户信息
    const isLoggedIn = cachedUserId !== null;
    let currentUser = null;
    
    // 只有在需要用户详细信息时才调用getCurrentUser
    if (isLoggedIn) {
        try {
            currentUser = await getCurrentUser();
        } catch (error) {
            // 如果获取失败，清除缓存
            cachedUserId = null;
            userIdChecked = true;
        }
    }

    // Update "my tanks" link visibility and URL
    const myTanksLink = document.getElementById('my-tanks-link');
    if (myTanksLink) {
        myTanksLink.style.display = isLoggedIn ? 'inline' : 'none';
        
        // If logged in, get default tank and update link to go directly to it
        if (isLoggedIn && window.FishTankFavorites) {
            // Always link to mytank.html (simplified tank architecture)
            myTanksLink.href = 'mytank.html';
        }
    }
    // Update auth link (login/logout)
    const authLink = document.getElementById('auth-link');
    if (authLink) {
        if (isLoggedIn) {
            authLink.textContent = 'Logout';
            authLink.href = '#';
            authLink.onclick = async (e) => {
                e.preventDefault();
                await logout();
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
        if (isLoggedIn && currentUser) {
            const displayName = currentUser?.user_metadata?.name || 
                               currentUser?.email?.split('@')[0] || 
                               'User';
            authStatus.textContent = `Welcome, ${displayName}!`;
        } else {
            authStatus.textContent = 'Please log in to access this feature';
        }
    }
}

// Helper function to get display name from profile
function getDisplayName(profile) {
    if (profile && profile.displayName && profile.displayName !== 'Anonymous User') {
        return profile.displayName;
    }
    return 'User';
}

// Get user profile data from API
// Get user profile data from Hasura
async function getUserProfile(userId) {
    try {
        const query = `
            query GetUserProfile($userId: String!) {
                users_by_pk(id: $userId) {
                    id
                    display_name
                    email
                    avatar_url
                    created_at
                }
            }
        `;

        const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: { userId }
            })
        });

        if (!response.ok) {
            throw new Error(`GraphQL request failed: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
            console.error('GraphQL errors:', result.errors);
            throw new Error(result.errors[0].message);
        }

        if (!result.data || !result.data.users_by_pk) {
            throw new Error('User not found');
        }

        return result.data.users_by_pk;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}

// Navigation authentication utility
function initializeAuthNavigation() {
    // Update UI on page load
    document.addEventListener('DOMContentLoaded', async () => {
        await updateAuthenticationUI();
    });

    // Listen for Supabase auth state changes
    if (window.supabaseAuth) {
        window.supabaseAuth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event);
            await updateAuthenticationUI();
        });
    }
}

// Get the current user's ID for highlighting their fish
/**
 * 初始化用户ID缓存（页面加载时调用一次）
 */
async function initializeUserCache() {
    if (userIdChecked) return cachedUserId;
    
    userIdChecked = true;
    try {
        const user = await getCurrentUser();
        cachedUserId = user ? user.id : null;
        if (cachedUserId) {
            console.log('✅ 用户已登录，ID已缓存');
        }
    } catch (error) {
        console.log('ℹ️ 用户未登录');
        cachedUserId = null;
    }
    return cachedUserId;
}

async function getCurrentUserId() {
    // 如果已检查过，直接返回缓存值
    if (userIdChecked) {
        return cachedUserId;
    }
    
    // 否则初始化缓存
    return await initializeUserCache();
}

// Check if a fish belongs to the current user
// 使用同步检查，避免每帧动画都调用async函数
function isUserFish(fish) {
    // 如果尚未检查用户ID，返回false（页面加载时会初始化）
    if (!userIdChecked) {
        return false;
    }
    
    if (!cachedUserId || !fish.userId) {
        return false;
    }
    return cachedUserId === fish.userId;
}

// Export functions to window for use in other scripts
window.requireAuthentication = requireAuthentication;
window.redirectToLogin = redirectToLogin;
window.isUserLoggedIn = isUserLoggedIn;
window.getCurrentUser = getCurrentUser;
window.getCurrentUserId = getCurrentUserId;
window.isUserFish = isUserFish;