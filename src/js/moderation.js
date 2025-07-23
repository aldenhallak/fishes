// Moderation Panel JavaScript
let currentFilter = 'all';
let currentPage = 0;
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

    await loadStats();
    await loadFish();

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
        // Fallback to Firebase if backend is not available
        await loadStatsFromFirebase();
    }
}

// Fallback Firebase stats loading
async function loadStatsFromFirebase() {
    try {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const allFishSnapshot = await window.db.collection('fishes_test').get();
        stats.total = allFishSnapshot.size;

        const flaggedFishSnapshot = await window.db.collection('fishes_test')
            .where('flaggedForReview', '==', true)
            .get();
        stats.flagged = flaggedFishSnapshot.size;

        const approvedFishSnapshot = await window.db.collection('fishes_test')
            .where('approved', '==', true)
            .get();
        stats.approved = approvedFishSnapshot.size;

        const deletedFishSnapshot = await window.db.collection('fishes_test')
            .where('deleted', '==', true)
            .get();
        stats.deleted = deletedFishSnapshot.size;

        const validFishSnapshot = await window.db.collection('fishes_test')
            .where('isFish', '==', true)
            .get();
        stats.valid = validFishSnapshot.size;

        const invalidFishSnapshot = await window.db.collection('fishes_test')
            .where('isFish', '==', false)
            .get();
        stats.invalid = invalidFishSnapshot.size;

        stats.pending = stats.total - stats.approved - stats.deleted;

        updateStatsDisplay();
    } catch (error) {
        console.error('Error loading stats from Firebase:', error);
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
        currentPage = 0;
        selectedFish.clear();
        updateBulkActions();
    }

    try {
        let fishData;
        const token = localStorage.getItem('userToken');

        // Use backend API for flagged filter
        if (currentFilter === 'flagged') {
            const response = await fetch(`${API_BASE_URL}/moderate/flagged?limit=20&offset=${currentPage * 20}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                fishData = data.items.map(item => ({
                    id: item.id,
                    data: () => item
                }));
            } else {
                throw new Error('Failed to load flagged fish');
            }
        } else {
            // Use Firebase for other filters
            fishData = await loadFishFromFirebase(loadMore);
        }

        if (fishData && fishData.length > 0) {
            if (loadMore) {
                fishCache.push(...fishData);
            } else {
                fishCache = fishData;
            }
            renderFish();
            currentPage++;
        }

        document.getElementById('loadMore').style.display =
            fishData && fishData.length === 20 ? 'block' : 'none';

    } catch (error) {
        console.error('Error loading fish:', error);
        alert('Error loading fish. Please try again.');
    } finally {
        isLoading = false;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('fishGrid').style.display = 'grid';
    }
}

// Load fish from Firebase (fallback and other filters)
async function loadFishFromFirebase(loadMore) {
    let query = window.db.collection('fishes_test');

    switch (currentFilter) {
        case 'reported':
            query = query.where('reportCount', '>', 0).where('isVisible', '==', true)
                .orderBy('reportCount', 'desc');
            break;
        case 'recent':
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            query = query.where('isVisible', '==', true).where('CreatedAt', '>=', yesterday)
                .orderBy('CreatedAt', 'desc');
            break;
        case 'high-score':
            query = query.where('isVisible', '==', true).orderBy('score', 'desc');
            break;
        case 'low-score':
            query = query.where('isVisible', '==', true).orderBy('score', 'asc');
            break;
        case 'deleted':
            query = query.where('deleted', '==', true).orderBy('CreatedAt', 'desc');
            break;
        case 'needs-validity':
            query = query.where('isFish', '==', null).orderBy('CreatedAt', 'desc');
            break;
        case 'valid':
            query = query.where('isFish', '==', true).orderBy('CreatedAt', 'desc');
            break;
        case 'invalid':
            query = query.where('isFish', '==', false).orderBy('CreatedAt', 'desc');
            break;
        default:
            query = query.where('isVisible', '==', true).orderBy('CreatedAt', 'desc');
    }

    if (loadMore && fishCache.length > 0) {
        const lastDoc = fishCache[fishCache.length - 1];
        query = query.startAfter(lastDoc);
    }

    const snapshot = await query.limit(20).get();
    return snapshot.docs;
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
    
    // Check if we have user info for ban functionality
    const hasUserInfo = fish.userId && fish.Artist && fish.Artist !== 'Anonymous';

    card.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <input type="checkbox" id="select-${fishId}" onchange="toggleFishSelection('${fishId}', event)" style="margin-right: 10px;">
            <label for="select-${fishId}" style="font-weight: bold; color: #0288d1;">Select</label>
        </div>
        
        <img src="${fish.image || fish.Image}" alt="Fish drawing" class="fish-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg=='" />
        
        <div class="fish-info">
            <strong>ID:</strong> ${fishId}<br>
            <strong>Created:</strong> ${createdAt}<br>
            <strong>Score:</strong> ${score} (👍${upvotes} 👎${downvotes})<br>
            <strong>Artist:</strong> ${hasUserInfo ? 
                `<a href="profile.html?userId=${encodeURIComponent(fish.userId)}" target="_blank" style="color: #0288d1; text-decoration: underline;">${fish.Artist}</a>` : 
                (fish.Artist || 'Anonymous')}<br>
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
                <button class="action-btn ban-btn" onclick="banUser('${fish.userId}', '${fish.Artist}', this)" style="background: #dc3545; color: white; margin-top: 5px;">
                    🚫 Ban User
                </button>
                <button class="action-btn unban-btn" onclick="unbanUser('${fish.userId}', '${fish.Artist}', this)" style="background: #28a745; color: white; margin-top: 5px; margin-left: 5px;">
                    ✅ Unban User
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

    const reason = prompt('Enter reason for bulk approval (optional):');
    if (reason === null) return; // User cancelled

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
                reason: reason
            })
        });

        if (response.ok) {
            const result = await response.json();
            alert(`Bulk approval completed: ${result.summary.successful} successful, ${result.summary.failed} failed`);
            
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
        } else {
            throw new Error('Failed to bulk approve');
        }
    } catch (error) {
        console.error('Error in bulk approve:', error);
        alert('Error performing bulk approval');
    }
}

// Bulk delete selected fish
async function bulkDelete() {
    if (selectedFish.size === 0) return;

    const reason = prompt('Enter reason for bulk deletion (required):');
    if (!reason) {
        alert('Reason is required for deletion');
        return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedFish.size} fish?`)) {
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
                action: 'delete',
                reason: reason
            })
        });

        if (response.ok) {
            const result = await response.json();
            alert(`Bulk deletion completed: ${result.summary.successful} successful, ${result.summary.failed} failed`);
            
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
        } else {
            throw new Error('Failed to bulk delete');
        }
    } catch (error) {
        console.error('Error in bulk delete:', error);
        alert('Error performing bulk deletion');
    }
}

// Bulk mark selected fish as valid fish
async function bulkMarkAsFish() {
    if (selectedFish.size === 0) return;

    const reason = prompt('Enter reason for bulk marking as fish (optional):');
    if (reason === null) return; // User cancelled

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
                reason: reason || 'Bulk marked as valid fish'
            })
        });

        if (response.ok) {
            const result = await response.json();
            alert(`Bulk marking as fish completed: ${result.summary.successful} successful, ${result.summary.failed} failed`);
            
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
        } else {
            throw new Error('Failed to bulk mark as fish');
        }
    } catch (error) {
        console.error('Error in bulk mark as fish:', error);
        alert('Error performing bulk marking as fish');
    }
}

// Bulk mark selected fish as not fish
async function bulkMarkAsNotFish() {
    if (selectedFish.size === 0) return;

    const reason = prompt('Enter reason for bulk marking as not fish (required):');
    if (!reason) {
        alert('Reason is required for marking as not fish');
        return;
    }

    if (!confirm(`Are you sure you want to mark ${selectedFish.size} fish as not fish?`)) {
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
                action: 'mark_validity',
                isFish: false,
                reason: reason
            })
        });

        if (response.ok) {
            const result = await response.json();
            alert(`Bulk marking as not fish completed: ${result.summary.successful} successful, ${result.summary.failed} failed`);
            
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
        } else {
            throw new Error('Failed to bulk mark as not fish');
        }
    } catch (error) {
        console.error('Error in bulk mark as not fish:', error);
        alert('Error performing bulk marking as not fish');
    }
}



// Delete a fish
async function deleteFish(fishId, button) {
    if (!confirm('Are you sure you want to delete this fish?')) {
        return;
    }

    const reason = prompt('Enter reason for deletion (optional):');
    if (reason === null) return; // User cancelled

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
            body: JSON.stringify({ reason })
        });

        if (response.ok) {
            alert('Fish deleted successfully');
            // Update local state instead of full reload
            updateFishCardState(fishId, { deleted: true });
            updateStatsAfterAction('delete');
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Delete failed: ${response.status}`);
        }
    } catch (error) {
        console.error('Error deleting fish:', error);
        alert('Error deleting fish. Please try again.');
        button.disabled = false;
        button.textContent = '🗑️ Delete';
    }
}

// Approve a fish
async function approveFish(fishId, button) {
    const reason = prompt('Enter reason for approval (optional):');
    if (reason === null) return; // User cancelled

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
            body: JSON.stringify({ reason })
        });

        if (response.ok) {
            alert('Fish approved successfully');
            // Update local state instead of full reload
            updateFishCardState(fishId, { approved: true });
            updateStatsAfterAction('approve');
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Approval failed: ${response.status}`);
        }
    } catch (error) {
        console.error('Error approving fish:', error);
        alert('Error approving fish. Please try again.');
        button.disabled = false;
        button.textContent = '✅ Approve';
    }
}

// Mark a fish as valid fish
async function markAsFish(fishId, button) {
    const reason = prompt('Enter reason for marking as fish (optional):');

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
                reason: reason || 'Marked as valid fish'
            })
        });

        if (response.ok) {
            alert('Fish marked as valid successfully');
            // Update local state instead of full reload
            updateFishCardState(fishId, { isFish: true });
            updateStatsAfterAction('mark_fish');
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Marking failed: ${response.status}`);
        }
    } catch (error) {
        console.error('Error marking fish as valid:', error);
        alert('Error marking fish as valid. Please try again.');
        button.disabled = false;
        button.textContent = '🐟 Mark as Fish';
    }
}

// Mark a fish as not fish
async function markAsNotFish(fishId, button) {
    const reason = prompt('Enter reason for marking as not fish (optional):');

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
                reason: reason
            })
        });

        if (response.ok) {
            alert('Fish marked as not fish successfully');
            // Update local state instead of full reload
            updateFishCardState(fishId, { isFish: false });
            updateStatsAfterAction('mark_not_fish');
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Marking failed: ${response.status}`);
        }
    } catch (error) {
        console.error('Error marking fish as not fish:', error);
        alert('Error marking fish as not fish. Please try again.');
        button.disabled = false;
        button.textContent = '🚫 Mark as Not Fish';
    }
}

// Flip a fish horizontally
async function flipFish(fishId, button) {
    if (!confirm('Are you sure you want to flip this fish horizontally?')) {
        return;
    }

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
            alert('Fish flipped successfully');
            // For flip, we need to reload the fish to get the new image URL
            await refreshSingleFish(fishId);
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Flip failed: ${response.status}`);
        }
    } catch (error) {
        console.error('Error flipping fish:', error);
        alert('Error flipping fish. Please try again.');
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
        const reportsSnapshot = await window.db.collection('reports')
            .where('fishId', '==', fishId)
            .orderBy('reportedAt', 'desc')
            .get();

        if (reportsSnapshot.empty) {
            alert('No reports found for this fish.');
            return;
        }

        let reportText = `Reports for Fish ${fishId}:\n\n`;
        reportsSnapshot.docs.forEach((doc, index) => {
            const report = doc.data();
            const reportedAt = report.reportedAt ? formatDate(report.reportedAt) : 'Unknown date';
            reportText += `Report ${index + 1}:\n`;
            reportText += `Reason: ${report.reason}\n`;
            reportText += `Reported: ${reportedAt}\n`;
            reportText += `Status: ${report.status || 'pending'}\n\n`;
        });

        alert(reportText);
    } catch (error) {
        console.error('Error loading reports:', error);
        alert('Error loading reports. Please try again.');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('userToken');
    window.location.href = '/login.html';
}

// Format date utility (fallback if not in fish-utils.js)
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Download all images including deleted ones for training
async function downloadAllImages() {
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadStatus = document.getElementById('downloadStatus');

    // Disable button and show loading state
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Preparing Download...';
    downloadStatus.textContent = 'Fetching all fish data...';

    try {
        // Fetch all fish from Firebase (including deleted ones)
        const allFishSnapshot = await window.db.collection('fishes_test').get();

        if (allFishSnapshot.empty) {
            alert('No fish found to download.');
            return;
        }

        const totalFish = allFishSnapshot.size;
        downloadStatus.textContent = `Found ${totalFish} fish. Creating ZIP file...`;

        // Create a new ZIP file
        const zip = new JSZip();

        // Create metadata file
        const metadata = {
            exportDate: new Date().toISOString(),
            totalFish: totalFish,
            exportedBy: 'Fish Moderation Panel',
            description: 'All fish images including deleted ones for training purposes'
        };

        const fishData = [];
        let processedCount = 0;
        let successCount = 0;
        let failedCount = 0;

        // Process each fish
        for (const doc of allFishSnapshot.docs) {
            const fish = doc.data();
            const fishId = doc.id;

            try {
                // Update progress
                processedCount++;
                downloadStatus.textContent = `Processing fish ${processedCount}/${totalFish}...`;

                // Get the image URL
                const imageUrl = fish.image || fish.Image;

                if (!imageUrl) {
                    console.warn(`No image URL found for fish ${fishId}`);
                    failedCount++;
                    continue;
                }

                // Fetch the image
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    console.warn(`Failed to fetch image for fish ${fishId}: ${response.status}`);
                    failedCount++;
                    continue;
                }

                const imageBlob = await response.blob();

                // Create filename with fish info - organize by validity first
                const validity = fish.isFish === true ? 'fish' : 
                               fish.isFish === false ? 'not_fish' : 'unknown';
                
                const status = fish.deleted ? 'deleted' :
                    fish.approved ? 'approved' :
                        fish.flaggedForReview ? 'flagged' : 'pending';

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

                const filename = `${validity}/${fishId}_${dateStr}_${status}.${extension}`;

                // Add image to ZIP
                zip.file(filename, imageBlob);

                // Add fish metadata
                fishData.push({
                    id: fishId,
                    filename: filename,
                    status: status,
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
                });

                successCount++;

            } catch (error) {
                console.error(`Error processing fish ${fishId}:`, error);
                failedCount++;
            }
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
        const csvHeaders = 'ID,Filename,Validity,Status,Created,Artist,Upvotes,Downvotes,Score,ReportCount,Flagged,Approved,Deleted,IsFish\n';
        const csvData = fishData.map(fish =>
            `${fish.id},${fish.filename},${fish.validity},${fish.status},${fish.createdAt},${fish.artist},${fish.upvotes},${fish.downvotes},${fish.score},${fish.reportCount},${fish.flaggedForReview},${fish.approved},${fish.deleted},${fish.isFish}`
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
        a.download = `fish_training_data_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        downloadStatus.textContent = `Download complete! ${successCount} images downloaded, ${failedCount} failed.`;

        // Show summary
        alert(`Download complete!\n\nSuccessfully downloaded: ${successCount} images\nFailed: ${failedCount} images\nTotal processed: ${totalFish} fish\n\nThe ZIP file includes:\n- All fish images organized by validity (fish, not_fish, unknown)\n- metadata.json with detailed information\n- fish_data.csv for easy analysis`);

    } catch (error) {
        console.error('Error downloading images:', error);
        alert('Error downloading images. Please try again.');
        downloadStatus.textContent = 'Download failed. Please try again.';
    } finally {
        // Re-enable button
        downloadBtn.disabled = false;
        downloadBtn.textContent = '📥 Download All Images (Including Deleted)';
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
    }
    updateStatsDisplay();
}

// Helper function to refresh a single fish (useful for flip action)
async function refreshSingleFish(fishId) {
    try {
        const doc = await window.db.collection('fishes_test').doc(fishId).get();
        if (doc.exists) {
            const fish = doc.data();
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
        }
    } catch (error) {
        console.error('Error refreshing single fish:', error);
    }
}

// Ban a user
async function banUser(userId, userName, button) {
    if (!userId) {
        alert('Cannot ban user: No user ID available');
        return;
    }

    const reason = prompt(`Enter reason for banning user "${userName}" (required):`);
    if (!reason || reason.trim() === '') {
        alert('Reason is required for banning a user');
        return;
    }

    if (!confirm(`Are you sure you want to ban user "${userName}"?\n\nThis will:\n- Ban their account\n- Add their IP to the banned list\n- Hide all their fish\n- Log the moderation action\n\nReason: ${reason}`)) {
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
            body: JSON.stringify({ reason })
        });

        if (response.ok) {
            alert(`User "${userName}" banned successfully`);
            // Refresh the page to update all fish from this user
            loadFish();
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Ban failed: ${response.status}`);
        }
    } catch (error) {
        console.error('Error banning user:', error);
        alert('Error banning user. Please try again.');
        button.disabled = false;
        button.textContent = '🚫 Ban User';
    }
}

// Unban a user
async function unbanUser(userId, userName, button) {
    if (!userId) {
        alert('Cannot unban user: No user ID available');
        return;
    }

    const reason = prompt(`Enter reason for unbanning user "${userName}" (optional):`);
    if (reason === null) return; // User cancelled

    if (!confirm(`Are you sure you want to unban user "${userName}"?\n\nThis will:\n- Unban their account\n- Remove their IP from the banned list\n- Restore fish visibility (if hidden due to ban)\n- Log the moderation action`)) {
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
            body: JSON.stringify({ reason: reason || 'User unbanned' })
        });

        if (response.ok) {
            alert(`User "${userName}" unbanned successfully`);
            // Refresh the page to update all fish from this user
            loadFish();
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Unban failed: ${response.status}`);
        }
    } catch (error) {
        console.error('Error unbanning user:', error);
        alert('Error unbanning user. Please try again.');
        button.disabled = false;
        button.textContent = '✅ Unban User';
    }
}