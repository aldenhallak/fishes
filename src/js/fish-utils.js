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

// Configuration for backend URL - automatically detects environment with URL override support
const isLocalhost = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('localhost');

// Check for URL parameter override (useful for testing)
const urlParams = new URLSearchParams(window.location.search);
const forceLocal = urlParams.get('local') === 'true';
const forceProd = urlParams.get('prod') === 'true';

// 声明为全局变量，确保所有文件都能访问
// 临时使用生产环境后端进行测试
window.BACKEND_URL = forceLocal 
    ? 'http://localhost:8080'
    : forceProd 
    ? 'https://fishes-be-571679687712.northamerica-northeast1.run.app'
    : 'https://fishes-be-571679687712.northamerica-northeast1.run.app'; // 暂时强制使用生产环境

// 创建一个别名以保持向后兼容
const BACKEND_URL = window.BACKEND_URL;

// Calculate fish score (upvotes - downvotes)
function calculateScore(fish) {
    const upvotes = fish.upvotes || 0;
    const downvotes = fish.downvotes || 0;
    return upvotes - downvotes;
}

// Send vote to endpoint
async function sendVote(fishId, voteType) {
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
        
        const response = await fetch(`${BACKEND_URL}/api/vote/vote`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                fishId: fishId,
                voteType: voteType // 'up' or 'down'
            })
        });

        if (!response.ok) {
            console.error(`Vote failed with status: ${response.status}`);
            throw new Error(`Vote failed with status: ${response.status}`);
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

// Create voting controls HTML (shared utility)
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
    try {
        // Use the backend API with random parameter
        const params = new URLSearchParams({
            limit: limit.toString(),
            orderBy: 'CreatedAt',
            random: 'true',
            isVisible: 'true',
            deleted: 'false'
        });

        if (userId) {
            params.append('userId', userId);
        }

        const response = await fetch(`${BACKEND_URL}/api/fish?${params}`);

        if (!response.ok) {
            throw new Error(`Backend API failed: ${response.status}`);
        }

        const data = await response.json();

        // Convert backend response to Firestore-like documents
        return data.data.map(fishItem => ({
            id: fishItem.id,
            data: () => fishItem.data
        }));
    } catch (error) {
        console.error('Error fetching random fish from backend:', error);
        throw error;
    }
}



// Get fish from backend API with caching
async function getFishBySort(sortType, limit = 25, startAfter = null, direction = 'desc', userId = null) {
    // Create the backend API request
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
    // Store current page for redirect after login
    const redirectUrl = currentPage || window.location.href;

    // Use URL parameter for immediate redirect, and localStorage as backup
    const loginUrl = new URL('/login.html', window.location.origin);
    loginUrl.searchParams.set('redirect', encodeURIComponent(redirectUrl));

    // Also store in localStorage as backup
    localStorage.setItem('loginRedirect', redirectUrl);

    // Redirect to login page
    window.location.href = loginUrl.toString();
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
    const isLoggedIn = await isUserLoggedIn();
    const currentUser = await getCurrentUser();

    // Update "my tanks" link visibility
    const myTanksLink = document.getElementById('my-tanks-link');
    if (myTanksLink) {
        myTanksLink.style.display = isLoggedIn ? 'inline' : 'none';
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
        if (isLoggedIn) {
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
async function getUserProfile(userId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/profile/${encodeURIComponent(userId)}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('User not found');
            }
            throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        const data = await response.json();
        return data.profile;
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
async function getCurrentUserId() {
    const user = await getCurrentUser();
    if (!user) return null;
    
    // Supabase用户ID是 user.id
    return user.id;
}

// Check if a fish belongs to the current user
async function isUserFish(fish) {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId || !fish.userId) {
        return false;
    }
    return currentUserId === fish.userId;
}