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

// Send vote to endpoint
async function sendVote(fishId, voteType) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fishId: fishId,
                vote: voteType // 'up' or 'down'
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

// Get random documents using efficient Firestore random selection
async function getRandomFish(limit = 50, userId = null) {
    const randomDocs = [];

    while (randomDocs.length < limit) {
        const randomId = generateRandomDocId();

        // Try forward direction first
        let query = window.db.collection('fishes_test')
            .where(window.firebase.firestore.FieldPath.documentId(), '>=', randomId)
            .where('isVisible', '==', true);
            
        // Add user filter if specified
        if (userId) {
            query = query.where('userId', '==', userId);
        }
        
        query = query.orderBy(window.firebase.firestore.FieldPath.documentId())
            .limit(limit - randomDocs.length);

        let snapshot = await query.get();

        // If no results, try backward direction (wrap-around)
        if (snapshot.empty) {
            query = window.db.collection('fishes_test')
                .where(window.firebase.firestore.FieldPath.documentId(), '<', randomId)
                .where('isVisible', '==', true);
                
            // Add user filter if specified
            if (userId) {
                query = query.where('userId', '==', userId);
            }
            
            query = query.orderBy(window.firebase.firestore.FieldPath.documentId())
                .limit(limit - randomDocs.length);

            snapshot = await query.get();
        }

        // Add new documents (avoid duplicates)
        const existingIds = new Set(randomDocs.map(doc => doc.id));
        snapshot.docs.forEach(doc => {
            if (!existingIds.has(doc.id) && randomDocs.length < limit) {
                randomDocs.push(doc);
            }
        });

        // Safety break to avoid infinite loop
        if (snapshot.empty || snapshot.docs.length === 0) {
            console.warn('No more documents available for random selection');
            break;
        }
    }

    return randomDocs;
}

// Get fish from Firestore with different sorting options (unified function for both tank and rank)
async function getFishBySort(sortType, limit = 50, startAfter = null, direction = 'desc', userId = null) {
    let query = window.db.collection('fishes_test');

    // Filter out flagged and deleted fish
    query = query.where('isVisible', '==', true);
    
    // Filter by user if specified
    if (userId) {
        query = query.where('userId', '==', userId);
    }

    switch (sortType) {
        case 'hot':
            query = query.orderBy("hotScore", direction);
            if (startAfter) {
                query = query.startAfter(startAfter);
            }
            query = query.limit(limit);
            break;
        case 'score':
        case 'popular':
            query = query.orderBy("score", direction);
            if (startAfter) {
                query = query.startAfter(startAfter);
            }
            query = query.limit(limit);
            break;

        case 'date':
        case 'recent':
            query = query.orderBy("CreatedAt", direction);
            if (startAfter) {
                query = query.startAfter(startAfter);
            }
            query = query.limit(limit);
            break;

        case 'random':
            // For random, we can't use pagination in the traditional sense
            return await getRandomFish(limit, userId);

        default:
            // Default to most recent
            query = query.orderBy("CreatedAt", direction);
            if (startAfter) {
                query = query.startAfter(startAfter);
            }
            query = query.limit(limit);
    }

    const snapshot = await query.get();
    return snapshot.docs;
}

// Convert fish image to data URL for display
function createFishImageDataUrl(imgUrl, callback) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
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
    img.onerror = function() {
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
    window.addEventListener('storage', function(e) {
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