// Leaderboard page functionality

// Get leaderboard data from API
async function getLeaderboard(limit = 10) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/leaderboard?limit=${limit}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch leaderboard: ${response.status}`);
        }
        
        const data = await response.json();
        return data.leaderboard;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
    }
}

// Display leaderboard
function displayLeaderboard(users) {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';
    
    if (!users || users.length === 0) {
        document.getElementById('empty-leaderboard').style.display = 'block';
        document.getElementById('leaderboard-content').style.display = 'none';
        return;
    }
    
    users.forEach((user, index) => {
        const row = createLeaderboardRow(user, index + 1);
        tbody.appendChild(row);
    });
    
    document.getElementById('leaderboard-content').style.display = 'block';
    document.getElementById('empty-leaderboard').style.display = 'none';
}

// Create a leaderboard row
function createLeaderboardRow(user, rank) {
    const row = document.createElement('tr');
    
    // Rank cell
    const rankCell = document.createElement('td');
    rankCell.className = 'rank-cell';
    if (rank === 1) {
        rankCell.className += ' rank-1';
        rankCell.innerHTML = '🥇';
    } else if (rank === 2) {
        rankCell.className += ' rank-2';
        rankCell.innerHTML = '🥈';
    } else if (rank === 3) {
        rankCell.className += ' rank-3';
        rankCell.innerHTML = '🥉';
    } else {
        rankCell.textContent = rank;
    }
    row.appendChild(rankCell);
    
    // User cell
    const userCell = document.createElement('td');
    userCell.className = 'user-cell';
    
    const avatar = document.createElement('div');
    avatar.className = 'user-avatar';
    avatar.textContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U';
    
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    
    const userName = document.createElement('a');
    userName.className = 'user-name';
    userName.textContent = user.displayName || 'Anonymous User';
    userName.href = `profile.html?userId=${encodeURIComponent(user.userId)}`;
    userName.title = `View ${user.displayName || 'Anonymous User'}'s profile`;
    
    const userEmail = document.createElement('div');
    userEmail.className = 'user-email';
    userEmail.textContent = user.userEmail || 'No email';
    
    userInfo.appendChild(userName);
    userInfo.appendChild(userEmail);
    userCell.appendChild(avatar);
    userCell.appendChild(userInfo);
    row.appendChild(userCell);
    
    // Score cell
    const scoreCell = document.createElement('td');
    scoreCell.className = 'stat-cell';
    const score = user.totalScore || 0;
    scoreCell.textContent = score;
    
    if (score > 0) {
        scoreCell.classList.add('score-positive');
    } else if (score < 0) {
        scoreCell.classList.add('score-negative');
    } else {
        scoreCell.classList.add('score-zero');
    }
    row.appendChild(scoreCell);
    
    // Fish count cell
    const fishCell = document.createElement('td');
    fishCell.className = 'stat-cell';
    fishCell.textContent = user.fishCount || 0;
    row.appendChild(fishCell);
    
    // Upvotes cell
    const upvotesCell = document.createElement('td');
    upvotesCell.className = 'stat-cell';
    upvotesCell.textContent = user.totalUpvotes || 0;
    row.appendChild(upvotesCell);
    
    // Downvotes cell
    const downvotesCell = document.createElement('td');
    downvotesCell.className = 'stat-cell';
    downvotesCell.textContent = user.totalDownvotes || 0;
    row.appendChild(downvotesCell);
    
    return row;
}

// Load leaderboard
async function loadLeaderboard() {
    const limitSelect = document.getElementById('limit-select');
    const refreshBtn = document.querySelector('.refresh-btn');
    const limit = parseInt(limitSelect.value);
    
    // Update button state
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Loading...';
    
    showLoading();
    
    try {
        const leaderboard = await getLeaderboard(limit);
        displayLeaderboard(leaderboard);
        hideLoading();
    } catch (error) {
        hideLoading();
        showError(`Failed to load leaderboard: ${error.message}`);
    } finally {
        // Reset button state
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refresh';
    }
}

// Show loading state
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error').style.display = 'none';
    document.getElementById('leaderboard-content').style.display = 'none';
    document.getElementById('empty-leaderboard').style.display = 'none';
}

// Hide loading state
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    document.getElementById('leaderboard-content').style.display = 'none';
    document.getElementById('empty-leaderboard').style.display = 'none';
}