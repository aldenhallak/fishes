// Fish Tanks Management JavaScript
let currentUser = null;
let currentEditingTank = null;
let currentAddingFishTank = null;
let userFish = [];
let publicTanksPage = 0;
const publicTanksLimit = 12;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadMyTanks();
    loadPublicTanks();
    
    // Setup form event listeners
    document.getElementById('create-tank-form').addEventListener('submit', handleCreateTank);
    document.getElementById('edit-tank-form').addEventListener('submit', handleEditTank);
    
    // Setup modal close events
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
});

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        currentUser = JSON.parse(userData);
        updateAuthUI(true);
    } else {
        updateAuthUI(false);
    }
}

// Update authentication UI
function updateAuthUI(isLoggedIn) {
    const authInfo = document.getElementById('auth-info');
    const authStatus = document.getElementById('auth-status');
    const authLink = document.getElementById('auth-link');
    
    if (isLoggedIn) {
        authInfo.classList.remove('logged-out');
        authStatus.textContent = `Welcome, ${currentUser.displayName || currentUser.email}!`;
        authLink.textContent = 'Logout';
        authLink.href = '#';
        authLink.onclick = logout;
    } else {
        authInfo.classList.add('logged-out');
        authStatus.textContent = 'Please log in to manage your fish tanks';
        authLink.textContent = 'Login';
        authLink.href = 'login.html';
        authLink.onclick = null;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data based on tab
    switch(tabName) {
        case 'my-tanks':
            loadMyTanks();
            break;
        case 'public-tanks':
            loadPublicTanks();
            break;
    }
}

// Load user's tanks
async function loadMyTanks() {
    if (!currentUser) return;
    
    const loading = document.getElementById('my-tanks-loading');
    const error = document.getElementById('my-tanks-error');
    const grid = document.getElementById('my-tanks-grid');
    const empty = document.getElementById('my-tanks-empty');
    
    loading.style.display = 'block';
    error.style.display = 'none';
    empty.style.display = 'none';
    grid.innerHTML = '';
    
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${BACKEND_URL}/api/fishtanks/my-tanks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load tanks');
        }
        
        const data = await response.json();
        
        if (data.fishtanks.length === 0) {
            empty.style.display = 'block';
        } else {
            renderTanks(data.fishtanks, grid, true);
        }
    } catch (err) {
        console.error('Error loading tanks:', err);
        error.textContent = 'Failed to load your tanks. Please try again.';
        error.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}

// Load public tanks
async function loadPublicTanks(page = 0) {
    const loading = document.getElementById('public-tanks-loading');
    const error = document.getElementById('public-tanks-error');
    const grid = document.getElementById('public-tanks-grid');
    
    loading.style.display = 'block';
    error.style.display = 'none';
    if (page === 0) grid.innerHTML = '';
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/fishtanks/public/list?limit=${publicTanksLimit}&offset=${page * publicTanksLimit}`);
        
        if (!response.ok) {
            throw new Error('Failed to load public tanks');
        }
        
        const data = await response.json();
        
        if (page === 0) {
            renderTanks(data.fishtanks, grid, false);
        } else {
            appendTanks(data.fishtanks, grid, false);
        }
        
        updatePagination(data.fishtanks.length);
    } catch (err) {
        console.error('Error loading public tanks:', err);
        error.textContent = 'Failed to load public tanks. Please try again.';
        error.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}

// Render tanks
function renderTanks(tanks, container, isOwner) {
    container.innerHTML = '';
    tanks.forEach(tank => {
        const tankCard = createTankCard(tank, isOwner);
        container.appendChild(tankCard);
    });
}

// Append tanks (for pagination)
function appendTanks(tanks, container, isOwner) {
    tanks.forEach(tank => {
        const tankCard = createTankCard(tank, isOwner);
        container.appendChild(tankCard);
    });
}

// Create tank card element
function createTankCard(tank, isOwner) {
    const card = document.createElement('div');
    card.className = 'tank-card';
    const createdDate = new Date(tank.createdAt._seconds * 1000).toLocaleDateString();
    const updatedDate = new Date(tank.updatedAt._seconds * 1000).toLocaleDateString();
    
    card.innerHTML = `
        <h3>${tank.name}</h3>
        <div class="tank-info">
            <p>${tank.description || 'No description'}</p>
            <p><strong>Created:</strong> ${createdDate}</p>
            <p><strong>Updated:</strong> ${updatedDate}</p>
            <p><strong>Privacy:</strong> ${tank.isPublic ? 'Public' : 'Private'}</p>
        </div>
        <div class="tank-stats">
            <div class="stat">
                <div class="stat-number">${tank.fishCount || 0}</div>
                <div class="stat-label">Fish</div>
            </div>
            <div class="stat">
                <div class="stat-number">${tank.viewCount || 0}</div>
                <div class="stat-label">Views</div>
            </div>
        </div>
        <div class="tank-actions">
            <button class="btn-small btn-view" onclick="viewTank('${tank.id}')">View</button>
            ${isOwner ? `
                <button class="btn-small btn-edit" onclick="editTank('${tank.id}')">Edit</button>
                <button class="btn-small btn-share" onclick="shareTank('${tank.id}', '${tank.shareId}')">Share</button>
                <button class="btn-small btn-delete" onclick="deleteTank('${tank.id}')">Delete</button>
            ` : ''}
        </div>
    `;
    
    return card;
}

// Handle create tank form submission
async function handleCreateTank(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showError('create-tank-error', 'Please log in to create a tank');
        return;
    }
    
    const form = e.target;
    const formData = new FormData(form);
    const tankData = {
        name: formData.get('name').trim(),
        description: formData.get('description').trim(),
        isPublic: formData.get('isPublic') === 'on'
    };
    
    if (!tankData.name) {
        showError('create-tank-error', 'Tank name is required');
        return;
    }
    
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${BACKEND_URL}/api/fishtanks/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(tankData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create tank');
        }
        
        const result = await response.json();
        
        showSuccess('create-tank-success', 'Tank created successfully!');
        form.reset();
        
        // Refresh my tanks if on that tab
        if (document.getElementById('my-tanks').classList.contains('active')) {
            loadMyTanks();
        }
        
        // Switch to my tanks tab
        setTimeout(() => {
            showTab('my-tanks');
        }, 1500);
        
    } catch (err) {
        console.error('Error creating tank:', err);
        showError('create-tank-error', err.message);
    }
}

// View tank
function viewTank(tankId) {
    window.location.href = `fishtank-view.html?id=${tankId}`;
}

// Edit tank
async function editTank(tankId) {
    currentEditingTank = tankId;
    
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${BACKEND_URL}/api/fishtanks/${tankId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load tank details');
        }
        
        const data = await response.json();
        const tank = data.fishtank;
        
        // Populate edit form
        document.getElementById('edit-tank-name').value = tank.name;
        document.getElementById('edit-tank-description').value = tank.description || '';
        document.getElementById('edit-tank-public').checked = tank.isPublic;
        
        // Show modal
        document.getElementById('edit-tank-modal').style.display = 'block';
        
    } catch (err) {
        console.error('Error loading tank for edit:', err);
        alert('Failed to load tank details');
    }
}

// Handle edit tank form submission
async function handleEditTank(e) {
    e.preventDefault();
    
    if (!currentEditingTank) return;
    
    const tankData = {
        name: document.getElementById('edit-tank-name').value.trim(),
        description: document.getElementById('edit-tank-description').value.trim(),
        isPublic: document.getElementById('edit-tank-public').checked
    };
    
    if (!tankData.name) {
        showError('edit-tank-error', 'Tank name is required');
        return;
    }
    
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${BACKEND_URL}/api/fishtanks/${currentEditingTank}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(tankData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update tank');
        }
        
        // Close modal
        document.getElementById('edit-tank-modal').style.display = 'none';
        currentEditingTank = null;
        
        // Refresh tanks
        loadMyTanks();
        
    } catch (err) {
        console.error('Error updating tank:', err);
        showError('edit-tank-error', err.message);
    }
}

// Share tank
function shareTank(tankId, shareId) {
    const shareUrl = `${window.location.origin}/fishtank-view.html?id=${shareId}`;
    document.getElementById('share-url').textContent = shareUrl;
    document.getElementById('share-tank-modal').style.display = 'block';
}

// Copy share URL
function copyShareUrl() {
    const shareUrl = document.getElementById('share-url').textContent;
    navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Share URL copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Share URL copied to clipboard!');
    });
}

// Delete tank
async function deleteTank(tankId) {
    if (!confirm('Are you sure you want to delete this tank? This action cannot be undone.')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${BACKEND_URL}/api/fishtanks/${tankId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete tank');
        }
        
        // Refresh tanks
        loadMyTanks();
        
    } catch (err) {
        console.error('Error deleting tank:', err);
        alert('Failed to delete tank: ' + err.message);
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    
    // Reset current editing state
    if (modalId === 'edit-tank-modal') {
        currentEditingTank = null;
    }
    if (modalId === 'add-fish-modal') {
        currentAddingFishTank = null;
    }
}

// Show error message
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
}

// Show success message
function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

// Update pagination
function updatePagination(loadedCount) {
    const pagination = document.getElementById('public-tanks-pagination');
    pagination.innerHTML = '';
    
    if (loadedCount === publicTanksLimit) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'page-btn';
        loadMoreBtn.textContent = 'Load More';
        loadMoreBtn.onclick = () => {
            publicTanksPage++;
            loadPublicTanks(publicTanksPage);
        };
        pagination.appendChild(loadMoreBtn);
    }
}

// Load all available fish for adding to tank
async function loadAvailableFish() {
    if (!currentUser) return;
    
    const loading = document.getElementById('user-fish-loading');
    const grid = document.getElementById('user-fish-grid');
    const empty = document.getElementById('user-fish-empty');
    
    loading.style.display = 'block';
    empty.style.display = 'none';
    grid.innerHTML = '';
    
    try {
        // Use the same fish loading logic as the ranking system
        const fishDocs = await getFishBySort('recent', 50);
        
        // Convert Firestore documents to fish objects
        userFish = fishDocs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                docId: doc.id,
                score: calculateScore(data)
            };
        });
        
        if (userFish.length === 0) {
            empty.style.display = 'block';
        } else {
            renderUserFish(userFish, grid);
        }
    } catch (err) {
        console.error('Error loading available fish:', err);
        const errorElement = document.getElementById('add-fish-error');
        if (errorElement) {
            errorElement.textContent = 'Failed to load available fish';
            errorElement.style.display = 'block';
        } else {
            console.error('Error element not found');
            alert('Failed to load available fish. Please try again.');
        }
    } finally {
        loading.style.display = 'none';
    }
}

// Show add fish modal
async function showAddFishModal(tankId) {
    if (!currentUser) {
        alert('Please log in to add fish');
        return;
    }
    
    currentAddingFishTank = tankId;
    document.getElementById('add-fish-modal').style.display = 'block';
    await loadAvailableFish();
}

// Render user fish for selection
function renderUserFish(fish, container) {
    container.innerHTML = '';
    
    fish.forEach(fishItem => {
        const fishElement = document.createElement('div');
        fishElement.className = 'fish-item';
        fishElement.title = fishItem.Artist || 'Fish';
        
        // Create canvas to show fish drawing
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');
        
        // Handle fish images like in rank.js
        const imageUrl = fishItem.image || fishItem.Image;
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
            createFishImageDataUrl(imageUrl, (dataUrl) => {
                if (dataUrl) {
                    const img = new Image();
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0, 40, 40);
                    };
                    img.src = dataUrl;
                }
            });
        } else {
            // Draw placeholder
            ctx.fillStyle = '#e0f7fa';
            ctx.fillRect(0, 0, 40, 40);
            ctx.fillStyle = '#0288d1';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🐠', 20, 25);
        }
        
        fishElement.appendChild(canvas);
        
        fishElement.onclick = () => {
            // Toggle selection
            const isSelected = fishElement.classList.contains('selected');
            
            // Remove selection from all fish
            container.querySelectorAll('.fish-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            if (!isSelected) {
                fishElement.classList.add('selected');
                addFishToTank(fishItem.docId || fishItem.id);
            }
        };
        
        container.appendChild(fishElement);
    });
}

// Add fish to tank
async function addFishToTank(fishId) {
    if (!currentAddingFishTank) return;
    
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${BACKEND_URL}/api/fishtanks/${currentAddingFishTank}/add-fish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ fishId })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add fish to tank');
        }
        
        showSuccess('add-fish-success', 'Fish added to tank successfully!');
        
        // Refresh tanks and close modal after delay
        setTimeout(() => {
            closeModal('add-fish-modal');
            loadMyTanks();
        }, 1500);
        
    } catch (err) {
        console.error('Error adding fish to tank:', err);
        showError('add-fish-error', err.message);
    }
}

// Global functions for inline event handlers
window.showTab = showTab;
window.viewTank = viewTank;
window.editTank = editTank;
window.shareTank = shareTank;
window.deleteTank = deleteTank;
window.closeModal = closeModal;
window.copyShareUrl = copyShareUrl;
window.showAddFishModal = showAddFishModal;