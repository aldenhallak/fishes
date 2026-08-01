// Moderation Panel JavaScript
let currentFilter = 'all';
let isLoading = false;
let fishCache = [];
let stats = { total: 0, flagged: 0, approved: 0, deleted: 0, pending: 0, valid: 0, invalid: 0 };
let selectedFish = new Set();
let lastClickedCheckbox = null;

// Use the same backend URL from fish-utils.js
const API_BASE_URL = `${BACKEND_URL}/api`;

// Check authentication on page load
window.onload = async function () {
    if (!requireAuthentication()) {
        return; // User will be redirected to login
    }

    // Check if user has admin privileges
    const userData = localStorage.getItem('userData');
    if (!userData) {
        alert('User data not found');
        window.location.href = '/login.html';
        return;
    }
    
    const user = JSON.parse(userData);
    if (!user.isAdmin) {
        alert('Admin privileges required');
        window.location.href = '/login.html';
        return;
    }

    // Load stats and fish in parallel for faster loading
    await Promise.all([
        loadStats(),
        loadFish()
    ]);

    // Add keyboard shortcuts
    setupKeyboardShortcuts();
};

// Load statistics from backend
async function loadStats() {
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/moderate/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load stats');
        }

        stats = await response.json();
        updateStatsDisplay();
    } catch (error) {
        console.error('Error loading stats:', error);
        // Show error state
        document.getElementById('totalFish').textContent = 'Error';
        document.getElementById('flaggedFish').textContent = 'Error';
        document.getElementById('approvedFish').textContent = 'Error';
        document.getElementById('deletedFish').textContent = 'Error';
        document.getElementById('pendingFish').textContent = 'Error';
        document.getElementById('validFish').textContent = 'Error';
        document.getElementById('invalidFish').textContent = 'Error';
    }
}

function updateStatsDisplay() {
    document.getElementById('totalFish').textContent = stats.total;
    document.getElementById('flaggedFish').textContent = stats.flagged;
    document.getElementById('approvedFish').textContent = stats.approved;
    document.getElementById('deletedFish').textContent = stats.deleted;
    document.getElementById('pendingFish').textContent = stats.pending;
    document.getElementById('validFish').textContent = stats.valid;
    document.getElementById('invalidFish').textContent = stats.invalid;
}

// Load fish based on current filter
async function loadFish(loadMore = false) {
    if (isLoading) return;
    isLoading = true;

    if (!loadMore) {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('fishGrid').style.display = 'none';
        fishCache = [];
        selectedFish.clear();
        updateBulkActions();
    }

    try {
        let fishData;
        const token = localStorage.getItem('userToken');

        // Use backend API for reported filter (which has a specific endpoint)
        if (currentFilter === 'reported') {
            const params = new URLSearchParams({
                limit: '50',
                sortBy: 'reportCount',
                sortOrder: 'desc'
            });
            
            // Add pagination using offset for reported endpoint (it uses offset, not startAfter)
            if (loadMore && fishCache.length > 0) {
                params.append('offset', fishCache.length.toString());
            } else {
                params.append('offset', '0');
            }
            
            const response = await fetch(`${API_BASE_URL}/moderate/reported?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                fishData = data.items
                    .filter(item => !item.deleted) // Filter out deleted fish
                    .map(item => ({
                        id: item.id,
                        data: () => item
                    }));
            } else {
                throw new Error('Failed to load reported fish');
            }
        } else {
            // Use backend API for other filters
            fishData = await loadFishFromBackend(loadMore);
        }

        if (fishData && fishData.length > 0) {
            if (loadMore) {
                fishCache.push(...fishData);
            } else {
                fishCache = fishData;
            }
            renderFish();
        }

        document.getElementById('loadMore').style.display =
            fishData && fishData.length === 50 ? 'block' : 'none';

    } catch (error) {
        console.error('Error loading fish:', error);
        alert('Error loading fish. Please try again.');
    } finally {
        isLoading = false;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('fishGrid').style.display = 'grid';
    }
}

// Load fish from backend API using fish-utils.js
async function loadFishFromBackend(loadMore) {
    // Use the existing getFishBySort function from fish-utils.js for basic filters
    let fishDocs;
    
    if (currentFilter === 'all') {
        // Use the standard fish loading function with proper pagination
        const startAfterDoc = loadMore && fishCache.length > 0 ? fishCache[fishCache.length - 1] : null;
        fishDocs = await getFishBySort('recent', 50, startAfterDoc, 'desc');
    } else {
        // For moderation-specific filters, make direct API calls with correct parameters
        const token = localStorage.getItem('userToken');
        
        const params = new URLSearchParams({
            limit: '50',
            orderBy: 'CreatedAt',
            order: 'desc'
        });

        // Add pagination using startAfter if loading more
        if (loadMore && fishCache.length > 0) {
            const lastFish = fishCache[fishCache.length - 1];
            params.append('startAfter', lastFish.id);
        }

        // Handle moderation filters according to the backend endpoint
        switch (currentFilter) {
            case 'deleted':
                // For deleted fish, set isVisible to 'all' to get everything, then we'll need to filter client-side
                // or the backend needs to support deleted parameter specifically
                params.set('deleted', 'true');
                break;
            case 'approved':
                params.set('isVisible', 'true');
                params.append('approved', 'true');
                break;
            case 'unapproved':
                params.set('isVisible', 'true');
                params.append('approved', 'false');
                break;
            case 'valid':
                params.set('isVisible', 'true');
                params.append('isFish', 'true');
                break;
            case 'invalid':
                params.set('isVisible', 'true');
                params.append('isFish', 'false');
                break;
            case 'unmoderated':
                params.set('isVisible', 'true');
                // For unmoderated, we want fish where isFish is null/undefined
                // This might need special backend handling since Firestore queries with null are tricky
                break;
            case 'flagged':
                params.set('isVisible', 'true');
                params.append('flaggedForReview', 'true');
                break;
            case 'high score':
            case 'high-score':
            case 'highscore':
                params.set('isVisible', 'true');
                params.set('orderBy', 'score');
                params.set('order', 'desc');
                break;
            case 'low score':
            case 'low-score':
            case 'lowscore':
                params.set('isVisible', 'true');
                params.set('orderBy', 'score');
                params.set('order', 'asc');
                break;
        }

        const response = await fetch(`${BACKEND_URL}/api/fish?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to load fish: ${response.status}`);
        }

        const data = await response.json();
        
        // Convert backend response to the expected format
        fishDocs = data.data.map(item => ({
            id: item.id,
            data: () => item
        }));

        // For 'unmoderated' filter, we need to filter client-side since Firestore doesn't handle null queries well
        if (currentFilter === 'unmoderated') {
            fishDocs = fishDocs.filter(doc => {
                const fish = doc.data();
                return fish.isFish === null || fish.isFish === undefined;
            });
        }
    }
    
    return fishDocs;
}

// Render fish in the grid
function renderFish() {
    const fishGrid = document.getElementById('fishGrid');
    fishGrid.innerHTML = '';

    fishCache.forEach(doc => {
        const fish = doc.data();
        const fishCard = createFishCard(doc.id, fish);
        fishGrid.appendChild(fishCard);
    });
}

// Create a fish card element
function createFishCard(fishId, fish) {
    const card = document.createElement('div');
    card.className = 'fish-card';
    card.setAttribute('data-fish-id', fishId); // Add data attribute for easy lookup
    const reportCount = fish.reportCount || 0;
    const flaggedForReview = fish.flaggedForReview || false;
    const approved = fish.approved || false;
    const deleted = fish.deleted || false;

    if (reportCount > 0) {
        card.classList.add('reported');
    }
    if (flaggedForReview) {
        card.classList.add('flagged');
    }
    if (deleted) {
        card.classList.add('deleted');
    }
    if (fish.isFish === true) {
        card.classList.add('valid');
    }
    if (fish.isFish === false) {
        card.classList.add('invalid');
    }

    const createdAt = fish.CreatedAt ? formatDate(fish.CreatedAt) : 'Unknown';
    const score = calculateScore(fish);
    const upvotes = fish.upvotes || 0;
    const downvotes = fish.downvotes || 0;
    const lastReportedAt = fish.lastReportedAt ? formatDate(fish.lastReportedAt) : null;
    
    // Check if we have user info for ban functionality - include IP for anonymous users
    const hasUserInfo = fish.userId || fish.ipAddress || fish.lastKnownIP;
    const isAnonymous = !fish.userId || fish.Artist === 'Anonymous';
    const banIdentifier = fish.userId || fish.ipAddress || fish.lastKnownIP;
    const displayName = fish.Artist || 'Anonymous';

    card.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <input type="checkbox" id="select-${fishId}" onchange="toggleFishSelection('${fishId}', event)" style="margin-right: 10px;">
            <label for="select-${fishId}" style="font-weight: bold; color: #0288d1;">Select</label>
        </div>
        
        <img src="${escapeHtml(fish.image || fish.Image || '')}" alt="Fish drawing" class="fish-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg=='" />
        
        <div class="fish-info">
            <strong>ID:</strong> ${fishId}<br>
            <strong>Created:</strong> ${createdAt}<br>
            <strong>Score:</strong> ${score} (👍${upvotes} 👎${downvotes})<br>
            <strong>Artist:</strong> ${hasUserInfo ? 
                `<a href="profile.html?userId=${encodeURIComponent(fish.userId)}" target="_blank" style="color: #0288d1; text-decoration: underline;">${escapeHtml(displayName)}</a>` : 
                escapeHtml(displayName)}<br>
            <strong>Status:</strong> ${getStatusText(fish)}<br>
            <strong>Validity:</strong> ${fish.isFish === true ? '🐟 Valid Fish' : fish.isFish === false ? '🚫 Not Fish' : '❓ Unknown'}<br>
            ${reportCount > 0 ? `<strong>Reports:</strong> ${reportCount}` : ''}
            ${lastReportedAt ? `<br><strong>Last Reported:</strong> ${lastReportedAt}` : ''}
        </div>
        
        ${reportCount > 0 ? `
            <div class="reports-section">
                <strong>⚠️ Reported Content</strong>
                <div class="report-item">
                    This fish has been reported ${reportCount} time${reportCount > 1 ? 's' : ''}
                    <button onclick="loadReportsForFish('${fishId}')" style="margin-left: 10px; padding: 5px 10px; font-size: 12px;">
                        View Reports
                    </button>
                    <button onclick="clearReports('${fishId}', this)" style="margin-left: 5px; padding: 5px 10px; font-size: 12px; background: #ff9800; color: white; border: none; border-radius: 3px;">
                        🧹 Clear Reports
                    </button>
                </div>
            </div>
        ` : ''}
        
        <div class="moderation-actions">
            <button class="action-btn delete-btn" onclick="deleteFish('${fishId}', this)">
                🗑️ Delete
            </button>
            <button class="action-btn approve-btn" onclick="approveFish('${fishId}', this)">
                ✅ Approve
            </button>
            <button class="action-btn flip-btn" onclick="flipFish('${fishId}', this)" style="background: #9C27B0; color: white;">
                🔄 Flip
            </button>
        </div>
        
        <div class="validity-actions" style="margin-top: 10px;">
            <button class="action-btn" onclick="markAsFish('${fishId}', this)" style="background: #2196F3; color: white;">
                🐟 Mark as Fish
            </button>
            <button class="action-btn" onclick="markAsNotFish('${fishId}', this)" style="background: #FF9800; color: white;">
                🚫 Mark as Not Fish
            </button>
        </div>
        
        ${hasUserInfo ? `
            <div class="user-actions" style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
                <strong style="color: #dc3545;">User Management:</strong><br>
                <button class="action-btn ban-btn" onclick="banUser('${encodeURIComponent(banIdentifier)}', '${encodeURIComponent(displayName)}', this)" style="background: #dc3545; color: white; margin-top: 5px;">
                    🚫 Ban ${isAnonymous ? 'IP' : 'User'}
                </button>
                <button class="action-btn unban-btn" onclick="unbanUser('${encodeURIComponent(banIdentifier)}', '${encodeURIComponent(displayName)}', this)" style="background: #28a745; color: white; margin-top: 5px; margin-left: 5px;">
                    ✅ Unban ${isAnonymous ? 'IP' : 'User'}
                </button>
            </div>
        ` : ''}
    `;

    return card;
}

// Get status text for fish
function getStatusText(fish) {
    if (fish.deleted) return '🗑️ Deleted';
    if (fish.approved) return '✅ Approved';
    if (fish.flaggedForReview) return '🚩 Flagged';
    if (fish.reportCount > 0) return '⚠️ Reported';
    if (fish.isFish === true) return '🐟 Valid Fish';
    if (fish.isFish === false) return '🚫 Not Fish';
    return '⏳ Pending';
}

// Toggle fish selection for bulk actions
function toggleFishSelection(fishId, event) {
    const checkbox = document.getElementById(`select-${fishId}`);

    // Handle shift-click for range selection
    if (event && event.shiftKey && lastClickedCheckbox) {
        handleRangeSelection(fishId, checkbox.checked);
    } else {
        // Normal single selection
        if (checkbox.checked) {
            selectedFish.add(fishId);
        } else {
            selectedFish.delete(fishId);
        }
    }

    lastClickedCheckbox = fishId;
    updateBulkActions();
}

// Handle range selection with shift-click
function handleRangeSelection(currentFishId, isChecked) {
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="select-"]');
    const checkboxIds = Array.from(allCheckboxes).map(cb => cb.id.replace('select-', ''));

    const lastIndex = checkboxIds.indexOf(lastClickedCheckbox);
    const currentIndex = checkboxIds.indexOf(currentFishId);

    if (lastIndex !== -1 && currentIndex !== -1) {
        const startIndex = Math.min(lastIndex, currentIndex);
        const endIndex = Math.max(lastIndex, currentIndex);

        // Select/deselect all checkboxes in the range
        for (let i = startIndex; i <= endIndex; i++) {
            const fishId = checkboxIds[i];
            const checkbox = document.getElementById(`select-${fishId}`);

            checkbox.checked = isChecked;

            if (isChecked) {
                selectedFish.add(fishId);
            } else {
                selectedFish.delete(fishId);
            }
        }
    }
}

// Update bulk actions visibility and count
function updateBulkActions() {
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.getElementById('selectedCount');

    if (selectedFish.size > 0) {
        bulkActions.style.display = 'block';
        selectedCount.textContent = `${selectedFish.size} selected`;
    } else {
        bulkActions.style.display = 'none';
    }
}

// Clear selection
function clearSelection() {
    selectedFish.clear();
    lastClickedCheckbox = null;
    document.querySelectorAll('input[type="checkbox"][id^="select-"]').forEach(cb => {
        cb.checked = false;
    });
    updateBulkActions();
}

// Bulk approve selected fish
async function bulkApprove() {
    if (selectedFish.size === 0) return;

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/moderate/bulk-review`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fishIds: Array.from(selectedFish),
                action: 'approve',
                reason: 'Bulk approval'
            })
        });

        if (response.ok) {
            const result = await response.json();
            
            // Update local state for successful approvals
            if (result.results) {
                result.results.forEach(item => {
                    if (item.success) {
                        updateFishCardState(item.fishId, { approved: true });
                    }
                });
            }
            
            clearSelection();
            updateStatsAfterBulkAction('approve', result.summary.successful);
        }
    } catch (error) {
        console.error('Error in bulk approve:', error);
    }
}

// Bulk delete selected fish
async function bulkDelete() {
    if (selectedFish.size === 0) return;

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/moderate/bulk-review`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fishIds: Array.from(selectedFish),
                action: 'delete',
                reason: 'Bulk deletion'
            })
        });

        if (response.ok) {
            const result = await response.json();
            
            // Update local state for successful deletions
            if (result.results) {
                result.results.forEach(item => {
                    if (item.success) {
                        updateFishCardState(item.fishId, { deleted: true });
                    }
                });
            }
            
            clearSelection();
            updateStatsAfterBulkAction('delete', result.summary.successful);
        }
    } catch (error) {
        console.error('Error in bulk delete:', error);
    }
}

// Bulk mark selected fish as valid fish
async function bulkMarkAsFish() {
    if (selectedFish.size === 0) return;

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/moderate/bulk-review`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fishIds: Array.from(selectedFish),
                action: 'mark_validity',
                isFish: true,
                reason: 'Bulk marked as valid fish'
            })
        });

        if (response.ok) {
            const result = await response.json();
            
            // Update local state for successful markings
            if (result.results) {
                result.results.forEach(item => {
                    if (item.success) {
                        updateFishCardState(item.fishId, { isFish: true });
                    }
                });
            }
            
            clearSelection();
            updateStatsAfterBulkAction('mark_fish', result.summary.successful);
        }
    } catch (error) {
        console.error('Error in bulk mark as fish:', error);
    }
}

// Bulk mark selected fish as not fish
async function bulkMarkAsNotFish() {
    if (selectedFish.size === 0) return;

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/moderate/bulk-review`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fishIds: Array.from(selectedFish),
                action: 'mark_validity',
                isFish: false,
                reason: 'Bulk marked as not fish'
            })
        });

        if (response.ok) {
            const result = await response.json();
            
            // Update local state for successful markings
            if (result.results) {
                result.results.forEach(item => {
                    if (item.success) {
                        updateFishCardState(item.fishId, { isFish: false });
                    }
                });
            }
            
            clearSelection();
            updateStatsAfterBulkAction('mark_not_fish', result.summary.successful);
        }
    } catch (error) {
        console.error('Error in bulk mark as not fish:', error);
    }
}



// Delete a fish
async function deleteFish(fishId, button) {
    button.disabled = true;
    button.textContent = 'Deleting...';

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/moderate/delete/${fishId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: 'Deleted via moderation panel' })
        });

        if (response.ok) {
            // Update local state instead of full reload
            updateFishCardState(fishId, { deleted: true });
            updateStatsAfterAction('delete');
        } else {
            button.disabled = false;
            button.textContent = '🗑️ Delete';
        }
    } catch (error) {
        console.error('Error deleting fish:', error);
        button.disabled = false;
        button.textContent = '🗑️ Delete';
    }
}

// Approve a fish
async function approveFish(fishId, button) {
    button.disabled = true;
    button.textContent = 'Approving...';

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/moderate/approve/${fishId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: 'Approved via moderation panel' })
        });

        if (response.ok) {
            // Update local state instead of full reload
            updateFishCardState(fishId, { approved: true });
            updateStatsAfterAction('approve');
        } else {
            button.disabled = false;
            button.textContent = '✅ Approve';
        }
    } catch (error) {
        console.error('Error approving fish:', error);
        button.disabled = false;
        button.textContent = '✅ Approve';
    }
}

// Mark a fish as valid fish
async function markAsFish(fishId, button) {
    button.disabled = true;
    button.textContent = 'Marking...';

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/moderate/mark-validity/${fishId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isFish: true,
                reason: 'Marked as valid fish'
            })
        });

        if (response.ok) {
            // Update local state instead of full reload
            updateFishCardState(fishId, { isFish: true });
            updateStatsAfterAction('mark_fish');
        } else {
            button.disabled = false;
            button.textContent = '🐟 Mark as Fish';
        }
    } catch (error) {
        console.error('Error marking fish as valid:', error);
        button.disabled = false;
        button.textContent = '🐟 Mark as Fish';
    }
}

// Mark a fish as not fish
async function markAsNotFish(fishId, button) {
    button.disabled = true;
    button.textContent = 'Marking...';

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/moderate/mark-validity/${fishId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isFish: false,
                reason: 'Marked as not fish'
            })
        });

        if (response.ok) {
            // Update local state instead of full reload
            updateFishCardState(fishId, { isFish: false });
            updateStatsAfterAction('mark_not_fish');
        } else {
            button.disabled = false;
            button.textContent = '🚫 Mark as Not Fish';
        }
    } catch (error) {
        console.error('Error marking fish as not fish:', error);
        button.disabled = false;
        button.textContent = '🚫 Mark as Not Fish';
    }
}

// Flip a fish horizontally
async function flipFish(fishId, button) {
    button.disabled = true;
    button.textContent = 'Flipping...';

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/moderate/flip/${fishId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // For flip, we need to reload the fish to get the new image URL
            await refreshSingleFish(fishId);
        } else {
            button.disabled = false;
            button.textContent = '🔄 Flip';
        }
    } catch (error) {
        console.error('Error flipping fish:', error);
        button.disabled = false;
        button.textContent = '🔄 Flip';
    }
}

// Set filter and reload fish
function setFilter(filter) {
    currentFilter = filter;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Clear selection when changing filters
    clearSelection();

    // Load fish with new filter
    loadFish();
}

// Load more fish
function loadMoreFish() {
    loadFish(true);
}

// Load and display reports for a specific fish
async function loadReportsForFish(fishId) {
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/moderate/reports/${fishId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load reports');
        }

        const data = await response.json();
        
        // Extract the reports array from the response
        const reports = data.reports || [];

        console.log('Reports data received:', data); // Debug logging
        console.log('Reports array:', reports); // Debug logging

        if (!Array.isArray(reports)) {
            console.error('Reports is not an array:', reports);
            throw new Error('Invalid response format: reports is not an array');
        }

        if (reports.length === 0) {
            showReportsModal(fishId, [], data.fishData);
            return;
        }

        showReportsModal(fishId, reports, data.fishData);
    } catch (error) {
        console.error('Error loading reports:', error);
        alert('Error loading reports. Please try again.');
    }
}

// Show reports in a modal dialog
function showReportsModal(fishId, reports, fishData = null) {
    // Ensure reports is an array
    if (!Array.isArray(reports)) {
        console.error('showReportsModal: reports is not an array:', reports);
        reports = [];
    }

    let modalHtml;
    
    if (reports.length === 0) {
        modalHtml = `
            <div style="text-align: center; padding: 20px;">
                <h2 style="margin: 0 0 20px 0; color: #333; font-size: 1.5em;">📋 Reports for Fish ${fishId}</h2>
                <div style="color: #666; font-size: 16px; margin: 20px 0;">
                    <p>No reports found for this fish.</p>
                    <p>🎉 This fish is clean!</p>
                </div>
                ${fishData ? `
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left;">
                        <h4 style="margin: 0 0 10px 0; color: #333;">Fish Summary:</h4>
                        <div style="font-size: 14px; color: #666;">
                            <div><strong>Report Count:</strong> ${fishData.reportCount || 0}</div>
                            <div><strong>Unique Reporters:</strong> ${fishData.uniqueReporterCount || 0}</div>
                            <div><strong>Flagged for Review:</strong> ${fishData.flaggedForReview ? 'Yes' : 'No'}</div>
                            ${fishData.lastReportedAt ? `<div><strong>Last Reported:</strong> ${formatDate(fishData.lastReportedAt)}</div>` : ''}
                        </div>
                    </div>
                ` : ''}
                <button onclick="closeModal()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                    Close
                </button>
            </div>
        `;
    } else {
        let reportsHtml = '';
        reports.forEach((report, index) => {
            const reportedAt = report.reportedAt ? formatDate(report.reportedAt) : 'Unknown date';
            const status = report.status || 'pending';
            const statusColor = status === 'resolved' ? '#28a745' : status === 'dismissed' ? '#6c757d' : '#ffc107';
            const statusIcon = status === 'resolved' ? '✅' : status === 'dismissed' ? '❌' : '⏳';
            
            reportsHtml += `
                <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; background: #f8f9fa;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #333; font-size: 1.1em;">Report #${index + 1}</h4>
                        <span style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                            ${statusIcon} ${status.toUpperCase()}
                        </span>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <strong style="color: #555;">Reason:</strong>
                        <div style="background: white; padding: 8px; border-radius: 4px; margin-top: 4px; border-left: 3px solid #dc3545;">
                            ${escapeHtml(report.reason || 'No reason provided')}
                        </div>
                    </div>
                    <div style="font-size: 14px; color: #666;">
                        <strong>Reported:</strong> ${reportedAt}
                    </div>
                    ${report.reporterId ? `
                        <div style="font-size: 14px; color: #666; margin-top: 4px;">
                            <strong>Reporter:</strong> ${escapeHtml(report.reporterName || 'Anonymous')}
                        </div>
                    ` : ''}
                    ${report.reporterIP ? `
                        <div style="font-size: 14px; color: #666; margin-top: 4px;">
                            <strong>Reporter IP:</strong> ${escapeHtml(report.reporterIP)}
                        </div>
                    ` : ''}
                    ${report.resolvedAt ? `
                        <div style="font-size: 14px; color: #666; margin-top: 4px;">
                            <strong>Resolved:</strong> ${formatDate(report.resolvedAt)}
                        </div>
                    ` : ''}
                </div>
            `;
        });

        modalHtml = `
            <div style="padding: 20px; max-width: 600px;">
                <h2 style="margin: 0 0 20px 0; color: #333; font-size: 1.5em; text-align: center;">
                    📋 Reports for Fish ${fishId}
                </h2>
                <div style="margin-bottom: 20px; text-align: center; color: #666;">
                    <strong>${reports.length}</strong> report${reports.length > 1 ? 's' : ''} found
                </div>
                ${fishData ? `
                    <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0288d1;">
                        <h4 style="margin: 0 0 10px 0; color: #0288d1;">Fish Summary:</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; color: #666;">
                            <div><strong>Total Reports:</strong> ${fishData.reportCount || 0}</div>
                            <div><strong>Unique Reporters:</strong> ${fishData.uniqueReporterCount || 0}</div>
                            <div><strong>Flagged for Review:</strong> ${fishData.flaggedForReview ? 'Yes' : 'No'}</div>
                            ${fishData.lastReportedAt ? `<div><strong>Last Reported:</strong> ${formatDate(fishData.lastReportedAt)}</div>` : ''}
                        </div>
                    </div>
                ` : ''}
                <div style="max-height: 400px; overflow-y: auto; margin-bottom: 20px;">
                    ${reportsHtml}
                </div>
                <div style="text-align: center;">
                    <button onclick="closeModal()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; margin-right: 10px;">
                        Close
                    </button>
                    <button onclick="clearReports('${fishId}', this)" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                        🧹 Clear All Reports
                    </button>
                </div>
            </div>
        `;
    }

    // Use the existing modal system from tank.js if available
    if (typeof showModal === 'function') {
        showModal(modalHtml, () => {});
    } else {
        // Fallback modal creation
        const modal = document.createElement('div');
        modal.className = 'modal'; // Add the modal class
        modal.style.cssText = 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = 'background: white; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); overflow: auto; max-width: 90vw; max-height: 90vh;';
        modalContent.innerHTML = modalHtml;
        
        modal.appendChild(modalContent);
        
        // Store close function globally
        window.closeModal = () => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
            // Clean up the global function
            delete window.closeModal;
        };
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                window.closeModal();
            }
        });
        
        document.body.appendChild(modal);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('userToken');
    window.location.href = '/login.html';
}

// Download only explicitly valid/invalid fish for training
async function downloadAllImages() {
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadStatus = document.getElementById('downloadStatus');

    // Disable button and show loading state
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Preparing Download...';
    downloadStatus.textContent = 'Fetching valid and invalid fish data...';

    try {
        // Fetch only fish that have been explicitly marked as fish or not fish
        // Use getFishBySort with additional filtering for explicit labeling
        const token = localStorage.getItem('userToken');
        
        // For now, we'll still use direct API calls for the download function
        // since we need specific moderation filters that getFishBySort doesn't support yet
        const validParams = new URLSearchParams({
            isFish: 'true',
            limit: '10000',
            isVisible: 'true',
            deleted: 'false'
        });
        const validResponse = await fetch(`${BACKEND_URL}/api/fish?${validParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const invalidParams = new URLSearchParams({
            isFish: 'false',
            limit: '10000',
            isVisible: 'true',
            deleted: 'false'
        });
        const invalidResponse = await fetch(`${BACKEND_URL}/api/fish?${invalidParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!validResponse.ok || !invalidResponse.ok) {
            throw new Error('Failed to fetch fish data');
        }

        const validData = await validResponse.json();
        const invalidData = await invalidResponse.json();
        
        // The backend returns data in data.data format
        const validFish = validData.data || [];
        const invalidFish = invalidData.data || [];
        const allLabeledFish = [...validFish, ...invalidFish];

        if (allLabeledFish.length === 0) {
            alert('No explicitly labeled fish found to download.');
            return;
        }

        const totalFish = allLabeledFish.length;
        downloadStatus.textContent = `Found ${totalFish} labeled fish (${validFish.length} valid, ${invalidFish.length} invalid). Creating ZIP file...`;

        // Create a new ZIP file
        const zip = new JSZip();

        // Create metadata file
        const metadata = {
            exportDate: new Date().toISOString(),
            totalFish: totalFish,
            validFish: validFish.length,
            invalidFish: invalidFish.length,
            exportedBy: 'Fish Moderation Panel',
            description: 'Only explicitly labeled fish (valid/invalid) for training purposes'
        };

        const fishData = [];
        let processedCount = 0;
        let successCount = 0;
        let failedCount = 0;

        // Process downloads in parallel batches for speed
        const batchSize = 100; // Process 100 images at a time
        const batches = [];
        
        for (let i = 0; i < allLabeledFish.length; i += batchSize) {
            batches.push(allLabeledFish.slice(i, i + batchSize));
        }

        for (const batch of batches) {
            // Process batch in parallel
            const batchPromises = batch.map(async (fish) => {
                const fishId = fish.id;

                try {
                    // Only process if explicitly labeled
                    if (fish.isFish !== true && fish.isFish !== false) {
                        return { success: false, reason: 'Not explicitly labeled' };
                    }

                    // Get the image URL
                    const imageUrl = fish.image || fish.Image;

                    if (!imageUrl) {
                        console.warn(`No image URL found for fish ${fishId}`);
                        return { success: false, reason: 'No image URL' };
                    }

                    // Fetch the image
                    const response = await fetch(imageUrl);
                    if (!response.ok) {
                        console.warn(`Failed to fetch image for fish ${fishId}: ${response.status}`);
                        return { success: false, reason: `HTTP ${response.status}` };
                    }

                    const imageBlob = await response.blob();

                    // Create filename with fish info - organize by validity
                    const validity = fish.isFish === true ? 'fish' : 'not_fish';
                    
                    const createdAt = fish.CreatedAt ?
                        (fish.CreatedAt.toDate ? fish.CreatedAt.toDate() : new Date(fish.CreatedAt)) :
                        new Date();

                    const dateStr = createdAt.toISOString().split('T')[0];

                    // Determine file extension from blob type or URL
                    let extension = 'png';
                    if (imageBlob.type === 'image/jpeg') {
                        extension = 'jpg';
                    } else if (imageBlob.type === 'image/gif') {
                        extension = 'gif';
                    }

                    const filename = `${validity}/${fishId}_${dateStr}.${extension}`;

                    // Add image to ZIP
                    zip.file(filename, imageBlob);

                    // Add fish metadata
                    const fishMetadata = {
                        id: fishId,
                        filename: filename,
                        validity: validity,
                        createdAt: createdAt.toISOString(),
                        artist: fish.Artist || 'Anonymous',
                        upvotes: fish.upvotes || 0,
                        downvotes: fish.downvotes || 0,
                        score: calculateScore(fish),
                        reportCount: fish.reportCount || 0,
                        flaggedForReview: fish.flaggedForReview || false,
                        approved: fish.approved || false,
                        deleted: fish.deleted || false,
                        isFish: fish.isFish
                    };

                    return { success: true, metadata: fishMetadata };

                } catch (error) {
                    console.error(`Error processing fish ${fishId}:`, error);
                    return { success: false, reason: error.message };
                }
            });

            // Wait for batch to complete
            const batchResults = await Promise.all(batchPromises);
            
            // Process results
            batchResults.forEach(result => {
                processedCount++;
                if (result.success) {
                    successCount++;
                    fishData.push(result.metadata);
                } else {
                    failedCount++;
                }
            });

            // Update progress
            downloadStatus.textContent = `Processing: ${processedCount}/${totalFish} (${successCount} successful, ${failedCount} failed)`;
        }

        // Add metadata files to ZIP
        metadata.fishData = fishData;
        metadata.summary = {
            totalFish: totalFish,
            successfullyDownloaded: successCount,
            failed: failedCount
        };

        zip.file('metadata.json', JSON.stringify(metadata, null, 2));

        // Create a CSV file for easy analysis
        const csvHeaders = 'ID,Filename,Validity,Created,Artist,Upvotes,Downvotes,Score,ReportCount,Flagged,Approved,Deleted,IsFish\n';
        const csvData = fishData.map(fish =>
            `${fish.id},${fish.filename},${fish.validity},${fish.createdAt},${fish.artist},${fish.upvotes},${fish.downvotes},${fish.score},${fish.reportCount},${fish.flaggedForReview},${fish.approved},${fish.deleted},${fish.isFish}`
        ).join('\n');

        zip.file('fish_data.csv', csvHeaders + csvData);

        // Generate and download ZIP file
        downloadStatus.textContent = 'Generating ZIP file...';

        const content = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 6
            }
        });

        // Create download link
        const url = window.URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fish_training_data_labeled_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        downloadStatus.textContent = `Download complete! ${successCount} images downloaded, ${failedCount} failed.`;

        // Show summary
        alert(`Download complete!\n\nSuccessfully downloaded: ${successCount} images\nFailed: ${failedCount} images\nTotal labeled fish: ${totalFish} (${validFish.length} valid, ${invalidFish.length} invalid)\n\nThe ZIP file includes:\n- Fish images organized by validity (fish, not_fish)\n- metadata.json with detailed information\n- fish_data.csv for easy analysis`);

    } catch (error) {
        console.error('Error downloading images:', error);
        alert('Error downloading images. Please try again.');
        downloadStatus.textContent = 'Download failed. Please try again.';
    } finally {
        // Re-enable button
        downloadBtn.disabled = false;
        downloadBtn.textContent = '📥 Download Labeled Fish Only';
    }
}

// Select all visible fish
function selectAll() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="select-"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        const fishId = checkbox.id.replace('select-', '');
        selectedFish.add(fishId);
    });
    updateBulkActions();
}

// Select none (clear selection)
function selectNone() {
    clearSelection();
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function (event) {
        // Ctrl+A or Cmd+A to select all
        if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
            // Only if not focused on an input field
            if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                event.preventDefault();
                selectAll();
            }
        }

        // Escape to clear selection
        if (event.key === 'Escape') {
            clearSelection();
        }
    });
}

// Helper function to update a fish card's state locally
function updateFishCardState(fishId, updates) {
    // Update the fish in the cache
    const fishIndex = fishCache.findIndex(doc => doc.id === fishId);
    if (fishIndex !== -1) {
        const fishData = fishCache[fishIndex].data();
        Object.assign(fishData, updates);
        
        // Update the visual card
        const fishCard = document.querySelector(`[data-fish-id="${fishId}"]`);
        if (fishCard) {
            // Update the card's visual state
            updateFishCardVisual(fishCard, fishId, fishData);
        }
    }
}

// Helper function to update the visual appearance of a fish card
function updateFishCardVisual(card, fishId, fish) {
    // Update CSS classes
    card.classList.remove('reported', 'flagged', 'deleted', 'valid', 'invalid');
    
    const reportCount = fish.reportCount || 0;
    const flaggedForReview = fish.flaggedForReview || false;
    const approved = fish.approved || false;
    const deleted = fish.deleted || false;

    if (reportCount > 0) card.classList.add('reported');
    if (flaggedForReview) card.classList.add('flagged');
    if (deleted) card.classList.add('deleted');
    if (fish.isFish === true) card.classList.add('valid');
    if (fish.isFish === false) card.classList.add('invalid');

    // Update the status text in the card
    const statusElement = card.querySelector('.fish-info');
    if (statusElement) {
        const statusText = getStatusText(fish);
        const validityText = fish.isFish === true ? '🐟 Valid Fish' : 
                           fish.isFish === false ? '🚫 Not Fish' : '❓ Unknown';
        
        // Update the status and validity lines
        statusElement.innerHTML = statusElement.innerHTML
            .replace(/(<strong>Status:<\/strong>)[^<]*/, `$1 ${statusText}`)
            .replace(/(<strong>Validity:<\/strong>)[^<]*/, `$1 ${validityText}`);
    }

    // Update or remove reports section
    const reportsSection = card.querySelector('.reports-section');
    if (reportCount > 0) {
        // Update reports section if it exists, or recreate it
        if (!reportsSection) {
            // Find where to insert the reports section (after fish-info)
            const fishInfo = card.querySelector('.fish-info');
            if (fishInfo) {
                const reportsDiv = document.createElement('div');
                reportsDiv.className = 'reports-section';
                reportsDiv.innerHTML = `
                    <strong>⚠️ Reported Content</strong>
                    <div class="report-item">
                        This fish has been reported ${reportCount} time${reportCount > 1 ? 's' : ''}
                        <button onclick="loadReportsForFish('${fishId}')" style="margin-left: 10px; padding: 5px 10px; font-size: 12px;">
                            View Reports
                        </button>
                        <button onclick="clearReports('${fishId}', this)" style="margin-left: 5px; padding: 5px 10px; font-size: 12px; background: #ff9800; color: white; border: none; border-radius: 3px;">
                            🧹 Clear Reports
                        </button>
                    </div>
                `;
                fishInfo.insertAdjacentElement('afterend', reportsDiv);
            }
        } else {
            // Update existing reports section
            const reportItem = reportsSection.querySelector('.report-item');
            if (reportItem) {
                reportItem.innerHTML = `
                    This fish has been reported ${reportCount} time${reportCount > 1 ? 's' : ''}
                    <button onclick="loadReportsForFish('${fishId}')" style="margin-left: 10px; padding: 5px 10px; font-size: 12px;">
                        View Reports
                    </button>
                    <button onclick="clearReports('${fishId}', this)" style="margin-left: 5px; padding: 5px 10px; font-size: 12px; background: #ff9800; color: white; border: none; border-radius: 3px;">
                        🧹 Clear Reports
                    </button>
                `;
            }
        }
    } else {
        // Remove reports section if no reports
        if (reportsSection) {
            reportsSection.remove();
        }
    }

    // Re-enable buttons
    const buttons = card.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.disabled = false;
        // Reset button text
        if (btn.textContent.includes('Deleting')) btn.textContent = '🗑️ Delete';
        if (btn.textContent.includes('Approving')) btn.textContent = '✅ Approve';
        if (btn.textContent.includes('Marking')) {
            if (btn.textContent.includes('Fish')) btn.textContent = '🐟 Mark as Fish';
            else btn.textContent = '🚫 Mark as Not Fish';
        }
        if (btn.textContent.includes('Flipping')) btn.textContent = '🔄 Flip';
        if (btn.textContent.includes('Clearing')) btn.textContent = '🧹 Clear Reports';
    });
}

// Helper function to update stats after an action
function updateStatsAfterAction(action) {
    switch (action) {
        case 'delete':
            stats.deleted++;
            stats.pending = Math.max(0, stats.pending - 1);
            break;
        case 'approve':
            stats.approved++;
            stats.pending = Math.max(0, stats.pending - 1);
            break;
        case 'mark_fish':
            stats.valid++;
            break;
        case 'mark_not_fish':
            stats.invalid++;
            break;
        case 'clear_reports':
            // Flagged count might decrease if the fish was flagged
            stats.flagged = Math.max(0, stats.flagged - 1);
            break;
    }
    updateStatsDisplay();
}

// Helper function to update stats after bulk actions
function updateStatsAfterBulkAction(action, count) {
    switch (action) {
        case 'delete':
            stats.deleted += count;
            stats.pending = Math.max(0, stats.pending - count);
            break;
        case 'approve':
            stats.approved += count;
            stats.pending = Math.max(0, stats.pending - count);
            break;
        case 'mark_fish':
            stats.valid += count;
            break;
        case 'mark_not_fish':
            stats.invalid += count;
            break;
        case 'clear_reports':
            stats.flagged -= count;
            break;
    }
    updateStatsDisplay();
}

// Helper function to refresh a single fish (useful for flip action)
async function refreshSingleFish(fishId) {
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${BACKEND_URL}/api/fish/${fishId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch fish data');
        }

        const fish = await response.json();
        const fishCard = document.querySelector(`[data-fish-id="${fishId}"]`);
        if (fishCard) {
            // Update the image source
            const img = fishCard.querySelector('.fish-image');
            if (img) {
                img.src = fish.image || fish.Image;
            }
            
            // Update the fish data in cache
            const fishIndex = fishCache.findIndex(d => d.id === fishId);
            if (fishIndex !== -1) {
                fishCache[fishIndex] = { id: fishId, data: () => fish };
            }
            
            // Re-enable the flip button
            const flipBtn = fishCard.querySelector('button[onclick*="flipFish"]');
            if (flipBtn) {
                flipBtn.disabled = false;
                flipBtn.textContent = '🔄 Flip';
            }
        }
    } catch (error) {
        console.error('Error refreshing single fish:', error);
    }
}

// Ban a user
async function banUser(userId, userName, button) {
    if (!userId) {
        return;
    }

    button.disabled = true;
    button.textContent = 'Banning...';

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/moderate/ban/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: 'Banned via moderation panel' })
        });

        if (response.ok) {
            // Update all fish cards from this user locally
            updateFishCardsForUser(userId, { banned: true });
            button.textContent = '✅ User Banned';
        } else {
            button.disabled = false;
            button.textContent = '🚫 Ban User';
        }
    } catch (error) {
        console.error('Error banning user:', error);
        button.disabled = false;
        button.textContent = '🚫 Ban User';
    }
}

// Unban a user
async function unbanUser(userId, userName, button) {
    if (!userId) {
        return;
    }

    button.disabled = true;
    button.textContent = 'Unbanning...';

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/moderate/unban/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: 'User unbanned' })
        });

        if (response.ok) {
            // Update all fish cards from this user locally
            updateFishCardsForUser(userId, { banned: false });
            button.textContent = '🚫 User Unbanned';
        } else {
            button.disabled = false;
            button.textContent = '✅ Unban User';
        }
    } catch (error) {
        console.error('Error unbanning user:', error);
        button.disabled = false;
        button.textContent = '✅ Unban User';
    }
}

// Clear reports for a fish
async function clearReports(fishId, button) {
    if (!confirm('Are you sure you want to clear all reports for this fish? This action cannot be undone.')) {
        return;
    }

    button.disabled = true;
    button.textContent = 'Clearing...';

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/moderate/clear-reports/${fishId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: 'Reports cleared via moderation panel' })
        });

        if (response.ok) {
            // Update local state to remove report indicators
            updateFishCardState(fishId, { 
                reportCount: 0, 
                uniqueReporterCount: 0,
                flaggedForReview: false,
                lastReportedAt: null,
                flaggedAt: null
            });
            updateStatsAfterAction('clear_reports');
        } else {
            button.disabled = false;
            button.textContent = '🧹 Clear Reports';
        }
    } catch (error) {
        console.error('Error clearing reports:', error);
        button.disabled = false;
        button.textContent = '🧹 Clear Reports';
    }
}

// Bulk clear reports for selected fish
async function bulkClearReports() {
    if (selectedFish.size === 0) return;

    if (!confirm(`Are you sure you want to clear all reports for ${selectedFish.size} selected fish? This action cannot be undone.`)) {
        return;
    }

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/moderate/bulk-review`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fishIds: Array.from(selectedFish),
                action: 'clear_reports',
                reason: 'Bulk reports clearing'
            })
        });

        if (response.ok) {
            const result = await response.json();
            
            // Update local state for successful report clearings
            if (result.results) {
                result.results.forEach(item => {
                    if (item.success) {
                        updateFishCardState(item.fishId, { 
                            reportCount: 0, 
                            uniqueReporterCount: 0,
                            flaggedForReview: false,
                            lastReportedAt: null,
                            flaggedAt: null
                        });
                    }
                });
            }
            
            clearSelection();
            updateStatsAfterBulkAction('clear_reports', result.summary.successful);
        }
    } catch (error) {
        console.error('Error in bulk clear reports:', error);
        alert('Error clearing reports. Please try again.');
    }
}

// Bulk ban users for selected fish
async function bulkBanUsers() {
    if (selectedFish.size === 0) return;

    // Get unique user IDs from selected fish
    const userIds = new Set();
    const userNames = new Map();
    
    selectedFish.forEach(fishId => {
        const fishIndex = fishCache.findIndex(doc => doc.id === fishId);
        if (fishIndex !== -1) {
            const fish = fishCache[fishIndex].data();
            if (fish.userId && fish.Artist && fish.Artist !== 'Anonymous') {
                userIds.add(fish.userId);
                userNames.set(fish.userId, fish.Artist);
            }
        }
    });

    if (userIds.size === 0) {
        alert('No users found to ban from the selected fish.');
        return;
    }

    const userList = Array.from(userIds).map(userId => userNames.get(userId)).join(', ');
    if (!confirm(`Are you sure you want to ban ${userIds.size} user(s): ${userList}? This action will affect all their content.`)) {
        return;
    }

    try {
        const token = localStorage.getItem('userToken');
        let successCount = 0;
        let failureCount = 0;

        // Ban users one by one (could be optimized with a bulk endpoint if needed)
        for (const userId of userIds) {
            try {
                const response = await fetch(`${API_BASE_URL}/moderate/ban/${userId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ reason: 'Bulk ban via moderation panel' })
                });

                if (response.ok) {
                    successCount++;
                } else {
                    failureCount++;
                }
            } catch (error) {
                console.error(`Error banning user ${userId}:`, error);
                failureCount++;
            }
        }

        if (successCount > 0) {
            // Update all affected users' fish cards locally
            userIds.forEach(userId => {
                updateFishCardsForUser(userId, { banned: true });
            });
            
            alert(`Successfully banned ${successCount} user(s).${failureCount > 0 ? ` ${failureCount} failed.` : ''}`);
        } else {
            alert('Failed to ban any users. Please try again.');
        }

        clearSelection();
    } catch (error) {
        console.error('Error in bulk ban users:', error);
        alert('Error banning users. Please try again.');
    }
}

// Helper function to update all fish cards for a specific user
function updateFishCardsForUser(userId, updates) {
    // Find all fish cards from this user and update them
    fishCache.forEach((doc, index) => {
        const fish = doc.data();
        if (fish.userId === userId || fish.ipAddress === userId || fish.lastKnownIP === userId) {
            // Update the fish data in cache
            Object.assign(fish, updates);
            
            // Update the visual card
            const fishCard = document.querySelector(`[data-fish-id="${doc.id}"]`);
            if (fishCard) {
                updateFishCardVisual(fishCard, doc.id, fish);
                
                // Update ban/unban button states
                const banBtn = fishCard.querySelector('button[onclick*="banUser"]');
                const unbanBtn = fishCard.querySelector('button[onclick*="unbanUser"]');
                
                if (updates.banned === true) {
                    if (banBtn) banBtn.textContent = '✅ User Banned';
                    if (unbanBtn) {
                        unbanBtn.disabled = false;
                        unbanBtn.textContent = '✅ Unban User';
                    }
                } else if (updates.banned === false) {
                    if (unbanBtn) unbanBtn.textContent = '🚫 User Unbanned';
                    if (banBtn) {
                        banBtn.disabled = false;
                        banBtn.textContent = '🚫 Ban User';
                    }
                }
            }
        }
    });
}

// Utility function to escape HTML for safe display
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}