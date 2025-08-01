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
        // Show a loading message while Firebase stats are loading
        document.getElementById('totalFish').textContent = 'Loading...';
        document.getElementById('flaggedFish').textContent = 'Loading...';
        document.getElementById('approvedFish').textContent = 'Loading...';
        document.getElementById('deletedFish').textContent = 'Loading...';
        document.getElementById('pendingFish').textContent = 'Loading...';
        document.getElementById('validFish').textContent = 'Loading...';
        document.getElementById('invalidFish').textContent = 'Loading...';
        
        await loadStatsFromFirebase();
    }
}

// Fallback Firebase stats loading
async function loadStatsFromFirebase() {
    try {
        // Run all count queries in parallel for better performance
        // Use select() to only fetch document IDs, not data
        const [
            allFishSnapshot,
            flaggedFishSnapshot,
            approvedFishSnapshot,
            deletedFishSnapshot,
            validFishSnapshot,
            invalidFishSnapshot
        ] = await Promise.all([
            window.db.collection('fishes_test').select().get(),
            window.db.collection('fishes_test').where('flaggedForReview', '==', true).select().get(),
            window.db.collection('fishes_test').where('approved', '==', true).select().get(),
            window.db.collection('fishes_test').where('deleted', '==', true).select().get(),
            window.db.collection('fishes_test').where('isFish', '==', true).select().get(),
            window.db.collection('fishes_test').where('isFish', '==', false).select().get()
        ]);

        stats.total = allFishSnapshot.size;
        stats.flagged = flaggedFishSnapshot.size;
        stats.approved = approvedFishSnapshot.size;
        stats.deleted = deletedFishSnapshot.size;
        stats.valid = validFishSnapshot.size;
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
            const response = await fetch(`${API_BASE_URL}/moderate/flagged?limit=50&offset=${currentPage * 50}`, {
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

    const snapshot = await query.limit(50).get();
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
                `<a href="profile.html?userId=${encodeURIComponent(fish.userId)}" target="_blank" style="color: #0288d1; text-decoration: underline;">${escapeHtml(fish.Artist)}</a>` : 
                escapeHtml(fish.Artist || 'Anonymous')}<br>
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
                <button class="action-btn ban-btn" onclick="banUser('${encodeURIComponent(fish.userId)}', '${encodeURIComponent(fish.Artist)}', this)" style="background: #dc3545; color: white; margin-top: 5px;">
                    🚫 Ban User
                </button>
                <button class="action-btn unban-btn" onclick="unbanUser('${encodeURIComponent(fish.userId)}', '${encodeURIComponent(fish.Artist)}', this)" style="background: #28a745; color: white; margin-top: 5px; margin-left: 5px;">
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
        const reportsSnapshot = await window.db.collection('reports')
            .where('fishId', '==', fishId)
            .orderBy('reportedAt', 'desc')
            .get();

        if (reportsSnapshot.empty) {
            console.log('No reports found for this fish.');
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

        console.log(reportText);
    } catch (error) {
        console.error('Error loading reports:', error);
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
        const validFishSnapshot = await window.db.collection('fishes_test')
            .where('isFish', '==', true)
            .get();
        
        const invalidFishSnapshot = await window.db.collection('fishes_test')
            .where('isFish', '==', false)
            .get();

        const validFish = validFishSnapshot.docs;
        const invalidFish = invalidFishSnapshot.docs;
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
            const batchPromises = batch.map(async (doc) => {
                const fish = doc.data();
                const fishId = doc.id;

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
            // Refresh the page to update all fish from this user
            loadFish();
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
            // Refresh the page to update all fish from this user
            loadFish();
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
            alert(`Successfully banned ${successCount} user(s).${failureCount > 0 ? ` ${failureCount} failed.` : ''}`);
            loadFish(); // Refresh to show updated content
        } else {
            alert('Failed to ban any users. Please try again.');
        }

        clearSelection();
    } catch (error) {
        console.error('Error in bulk ban users:', error);
        alert('Error banning users. Please try again.');
    }
}