// Moderation Panel JavaScript
let currentFilter = 'all';
let currentPage = 0;
let isLoading = false;
let fishCache = [];
let stats = { total: 0, flagged: 0, approved: 0, deleted: 0, pending: 0 };
let selectedFish = new Set();

// Use the same backend URL from fish-utils.js
const API_BASE_URL = `${BACKEND_URL}/api`;

// Check authentication on page load
window.onload = async function () {
    const userToken = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    
    if (!userToken || !userData) {
        window.location.href = '/login.html';
        return;
    }
    
    // Check if user has admin privileges
    const user = JSON.parse(userData);
    if (!user.isAdmin) {
        alert('Admin privileges required');
        window.location.href = '/login.html';
        return;
    }

    await loadStats();
    await loadFish();
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

    const createdAt = fish.CreatedAt ? formatDate(fish.CreatedAt) : 'Unknown';
    const score = calculateScore(fish);
    const upvotes = fish.upvotes || 0;
    const downvotes = fish.downvotes || 0;
    const lastReportedAt = fish.lastReportedAt ? formatDate(fish.lastReportedAt) : null;

    card.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <input type="checkbox" id="select-${fishId}" onchange="toggleFishSelection('${fishId}')" style="margin-right: 10px;">
            <label for="select-${fishId}" style="font-weight: bold; color: #0288d1;">Select</label>
        </div>
        
        <img src="${fish.image || fish.Image}" alt="Fish drawing" class="fish-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg=='" />
        
        <div class="fish-info">
            <strong>ID:</strong> ${fishId}<br>
            <strong>Created:</strong> ${createdAt}<br>
            <strong>Score:</strong> ${score} (👍${upvotes} 👎${downvotes})<br>
            <strong>Artist:</strong> ${fish.Artist || 'Anonymous'}<br>
            <strong>Status:</strong> ${getStatusText(fish)}<br>
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
        </div>
    `;

    return card;
}

// Get status text for fish
function getStatusText(fish) {
    if (fish.deleted) return '🗑️ Deleted';
    if (fish.approved) return '✅ Approved';
    if (fish.flaggedForReview) return '🚩 Flagged';
    if (fish.reportCount > 0) return '⚠️ Reported';
    return '⏳ Pending';
}

// Toggle fish selection for bulk actions
function toggleFishSelection(fishId) {
    const checkbox = document.getElementById(`select-${fishId}`);
    if (checkbox.checked) {
        selectedFish.add(fishId);
    } else {
        selectedFish.delete(fishId);
    }
    updateBulkActions();
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
            clearSelection();
            await loadStats();
            await loadFish();
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
            clearSelection();
            await loadStats();
            await loadFish();
        } else {
            throw new Error('Failed to bulk delete');
        }
    } catch (error) {
        console.error('Error in bulk delete:', error);
        alert('Error performing bulk deletion');
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
            await loadStats();
            await loadFish();
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
            await loadStats();
            await loadFish();
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
                
                // Create filename with fish info
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
                
                const filename = `${status}/${fishId}_${dateStr}_${status}.${extension}`;
                
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
                    deleted: fish.deleted || false
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
        const csvHeaders = 'ID,Filename,Status,Created,Artist,Upvotes,Downvotes,Score,ReportCount,Flagged,Approved,Deleted\n';
        const csvData = fishData.map(fish => 
            `${fish.id},${fish.filename},${fish.status},${fish.createdAt},${fish.artist},${fish.upvotes},${fish.downvotes},${fish.score},${fish.reportCount},${fish.flaggedForReview},${fish.approved},${fish.deleted}`
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
        alert(`Download complete!\n\nSuccessfully downloaded: ${successCount} images\nFailed: ${failedCount} images\nTotal processed: ${totalFish} fish\n\nThe ZIP file includes:\n- All fish images organized by status (approved, deleted, flagged, pending)\n- metadata.json with detailed information\n- fish_data.csv for easy analysis`);
        
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