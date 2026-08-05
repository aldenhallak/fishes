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

let BACKEND_URL;
if (forceLocal) {
    BACKEND_URL = 'http://localhost:8080';
} else if (forceProd) {
    BACKEND_URL = 'https://fishes-be-571679687712.northamerica-northeast1.run.app';
} else {
    BACKEND_URL = isLocalhost
        ? 'http://localhost:8080'
        : 'https://fishes-be-571679687712.northamerica-northeast1.run.app';
}

// Calculate fish score (upvotes - downvotes)
function calculateScore(fish) {
    const upvotes = fish.upvotes || 0;
    const downvotes = fish.downvotes || 0;
    return upvotes - downvotes;
}

// ── Vote sessions ─────────────────────────────────────────────────────────────
// The backend requires a short-lived vote token (minted at POST /vote-session)
// to accept votes once VOTE_TOKEN_MODE is set to enforce. Tokens are bound to
// the caller's IP and expire after ~30 minutes; we cache one in sessionStorage
// and mint a fresh one when it expires or the server rejects it.
const VOTE_SESSION_STORAGE_KEY = 'voteSession';
let voteSessionMintPromise = null;

// Cloudflare Turnstile site key (public). The matching secret lives on the
// backend; minting a vote session requires passing the challenge.
window.TURNSTILE_SITE_KEY = window.TURNSTILE_SITE_KEY || '0x4AAAAAAEHcDrz7FjAGQQJY';

let turnstileScriptPromise = null;
function loadTurnstileScript() {
    if (window.turnstile) return Promise.resolve();
    if (!turnstileScriptPromise) {
        turnstileScriptPromise = new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => resolve(); // fail soft; solveTurnstile handles absence
            document.head.appendChild(script);
        });
    }
    return turnstileScriptPromise;
}

function loadStoredVoteSession() {
    try {
        const raw = sessionStorage.getItem(VOTE_SESSION_STORAGE_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        // Treat sessions within a minute of expiry as dead
        if (!session.token || Date.now() > session.expiresAt - 60000) return null;
        return session;
    } catch (e) {
        return null;
    }
}

async function solveTurnstile() {
    const siteKey = window.TURNSTILE_SITE_KEY;
    if (!siteKey) return null;
    await loadTurnstileScript();
    if (!window.turnstile) return null;
    // Not display:none — Turnstile may need to paint (and, for managed mode,
    // interact). Sits unobtrusively in the corner and is removed afterwards.
    let container = document.getElementById('turnstile-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'turnstile-container';
        container.style.cssText = 'position:fixed;bottom:8px;right:8px;z-index:99999;';
        document.body.appendChild(container);
    }
    return new Promise((resolve) => {
        let widgetId = null;
        const finish = (token) => {
            clearTimeout(timer);
            try {
                if (widgetId !== null) window.turnstile.remove(widgetId);
                container.remove();
            } catch (e) { /* noop */ }
            resolve(token || null);
        };
        // Never hang a vote on a stuck challenge — fail soft after 10s
        const timer = setTimeout(() => finish(null), 10000);
        try {
            widgetId = window.turnstile.render(container, {
                sitekey: siteKey,
                callback: finish,
                'error-callback': () => finish(null),
            });
        } catch (e) {
            finish(null);
        }
    });
}

async function mintVoteSession() {
    const body = {};
    const turnstileToken = await solveTurnstile();
    if (turnstileToken) body.turnstileToken = turnstileToken;

    const response = await fetch(`${BACKEND_URL}/api/vote-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        throw new Error(`Vote session request failed with status: ${response.status}`);
    }
    const data = await response.json();
    const session = {
        token: data.voteToken,
        expiresAt: Date.now() + (data.expiresInSeconds || 1800) * 1000
    };
    try {
        sessionStorage.setItem(VOTE_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (e) { /* private browsing — in-memory promise cache still helps */ }
    return session;
}

async function getVoteToken(forceRefresh = false) {
    if (forceRefresh) {
        try { sessionStorage.removeItem(VOTE_SESSION_STORAGE_KEY); } catch (e) { /* noop */ }
    } else {
        const stored = loadStoredVoteSession();
        if (stored) return stored.token;
    }
    // Dedupe concurrent mints (e.g. rapid-fire voting on the rank page)
    if (!voteSessionMintPromise) {
        voteSessionMintPromise = mintVoteSession().finally(() => {
            voteSessionMintPromise = null;
        });
    }
    try {
        const session = await voteSessionMintPromise;
        return session.token;
    } catch (error) {
        // Don't block the vote on a failed mint — the server decides whether a
        // tokenless vote is acceptable (it is, until enforcement is turned on).
        console.error('Could not create vote session:', error);
        return null;
    }
}

// Send vote to endpoint
async function sendVote(fishId, voteType, isRetry = false) {
    try {
        const voteToken = await getVoteToken(isRetry);
        const headers = { 'Content-Type': 'application/json' };
        if (voteToken) headers['X-Vote-Token'] = voteToken;

        const response = await fetch(`${BACKEND_URL}/api/vote`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                fishId: fishId,
                vote: voteType // 'up' or 'down'
            })
        });

        // 401 = vote token missing/expired/invalid; mint a fresh one and retry once
        if (response.status === 401 && !isRetry) {
            return sendVote(fishId, voteType, true);
        }

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
        const response = await fetch(`${BACKEND_URL}/api/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fishId: fishId,
                reason: reason.trim(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString()
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

// Authentication utilities
function isUserLoggedIn() {
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    return !!(token && userData);
}

function getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
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

function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('loginRedirect');
    window.location.href = '/login.html';
}

// Check if authentication is required and redirect if needed
function requireAuthentication(redirectToCurrentPage = true) {
    if (!isUserLoggedIn()) {
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
function updateAuthenticationUI() {
    const isLoggedIn = isUserLoggedIn();
    const currentUser = getCurrentUser();

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
        if (isLoggedIn) {
            authStatus.textContent = `Welcome, ${currentUser.displayName || currentUser.email}!`;
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
    document.addEventListener('DOMContentLoaded', updateAuthenticationUI);

    // Also check when localStorage changes (for cross-tab login/logout)
    window.addEventListener('storage', function (e) {
        if (e.key === 'userToken' || e.key === 'userData') {
            updateAuthenticationUI();
        }
    });
}

// Get the current user's ID for highlighting their fish
function getCurrentUserId() {
    const userData = localStorage.getItem('userData');
    const userIdFromStorage = localStorage.getItem('userId');

    if (userData) {
        try {
            const parsed = JSON.parse(userData);
            return userIdFromStorage || parsed.uid || parsed.userId || parsed.id || parsed.email;
        } catch (e) {
            return userIdFromStorage;
        }
    }

    return userIdFromStorage;
}

// Check if a fish belongs to the current user
function isUserFish(fish) {
    const currentUserId = getCurrentUserId();
    if (!currentUserId || !fish.userId) {
        return false;
    }
    return currentUserId === fish.userId;
}