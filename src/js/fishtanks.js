// Fish Tanks Management JavaScript
let currentUser = null;
let currentEditingTank = null;
let currentAddingFishTank = null;
let userFish = [];
let publicTanksPage = 0;
const publicTanksLimit = 12;
let viewingUserId = null; // Track if we're viewing another user's tanks
let allTanks = []; // Store all tanks for filtering
let filteredTanks = []; // Store filtered tanks

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Check for userId parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    viewingUserId = urlParams.get('userId');
    
    // Show search controls for the default my-tanks tab
    const searchControls = document.getElementById('search-controls');
    if (searchControls) {
        searchControls.style.display = 'block';
    }
    
    if (viewingUserId) {
        // Viewing another user's tanks - don't require authentication
        await updateUIForViewingOtherUser(viewingUserId);
        loadUserTanks(viewingUserId);
        loadPublicTanks();
    } else {
        // Check authentication and redirect to login if needed for own tanks
        if (!requireAuthentication()) {
            return; // User will be redirected to login
        }
        
        checkAuthStatus();
        loadMyTanks();
        loadPublicTanks();
    }
    
    // Setup form event listeners
    document.getElementById('create-tank-form').addEventListener('submit', handleCreateTank);
    document.getElementById('edit-tank-form').addEventListener('submit', handleEditTank);
    
    // Setup modal close events
    document.addEventListener('click', function(event) {
        // Close modal when clicking on the backdrop
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            
            // Reset current editing state
            if (event.target.id === 'edit-tank-modal') {
                currentEditingTank = null;
            }
            if (event.target.id === 'add-fish-modal') {
                currentAddingFishTank = null;
            }
        }
    });
    
    // Setup escape key to close modals
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="block"]');
            if (openModal) {
                closeModal(openModal.id);
            }
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
    
    // Show/hide search controls based on tab
    const searchControls = document.getElementById('search-controls');
    if (tabName === 'my-tanks' || tabName === 'public-tanks') {
        searchControls.style.display = 'block';
    } else {
        searchControls.style.display = 'none';
    }
    
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

// Update UI when viewing another user's tanks
async function updateUIForViewingOtherUser(userId) {
    try {
        // Fetch user profile to get display name
        const profile = await getUserProfile(userId);
        const displayName = getDisplayName(profile);
        
        // Update page title
        const headerElement = document.querySelector('.page-header h1');
        if (headerElement) {
            headerElement.textContent = `${displayName}'s Fish Tanks`;
        }
        
        // Update page title in browser
        document.title = `${displayName}'s Fish Tanks`;
        
        // Hide creation controls since this is view-only
        const createControls = document.querySelectorAll('.create-tank-btn, .tank-actions .btn-edit, .tank-actions .btn-delete');
        createControls.forEach(control => {
            control.style.display = 'none';
        });
        
        // Update tab label
        const myTanksTab = document.querySelector('[onclick="showTab(\'my-tanks\')"]');
        if (myTanksTab) {
            myTanksTab.textContent = `${displayName}'s Tanks`;
        }
        
        // Add note about viewing another user's tanks
        const existingNote = document.querySelector('.user-tanks-note');
        if (!existingNote) {
            const note = document.createElement('p');
            note.className = 'user-tanks-note';
            note.style.textAlign = 'center';
            note.style.color = '#666';
            note.style.marginBottom = '20px';
            note.textContent = `Viewing public tanks created by ${displayName}`;
        
            const headerContainer = document.querySelector('.page-header');
            if (headerContainer) {
                headerContainer.appendChild(note);
                
                // Add back to profile link
                const backLink = document.createElement('p');
                backLink.style.textAlign = 'center';
                backLink.style.marginTop = '10px';
                backLink.innerHTML = `<a href="profile.html?userId=${encodeURIComponent(userId)}" style="color: #007bff; text-decoration: none;">&larr; Back to ${escapeHtml(displayName)}'s Profile</a>`;
                headerContainer.appendChild(backLink);
            }
        }
    } catch (error) {
        console.error('Error updating UI for viewing other user:', error);
        // Fallback to using userId if profile fetch fails
        const headerElement = document.querySelector('.page-header h1');
        if (headerElement) {
            headerElement.textContent = `${userId}'s Fish Tanks`;
        }
        document.title = `${userId}'s Fish Tanks`;
        
        // Hide creation controls since this is view-only
        const createControls = document.querySelectorAll('.create-tank-btn, .tank-actions .btn-edit, .tank-actions .btn-delete');
        createControls.forEach(control => {
            control.style.display = 'none';
        });
        
        // Update tab label
        const myTanksTab = document.querySelector('[onclick="showTab(\'my-tanks\')"]');
        if (myTanksTab) {
            myTanksTab.textContent = `${userId}'s Tanks`;
        }
    }
}

// Load tanks for a specific user (public view)
async function loadUserTanks(userId) {
    const loading = document.getElementById('my-tanks-loading');
    const error = document.getElementById('my-tanks-error');
    const grid = document.getElementById('my-tanks-grid');
    const empty = document.getElementById('my-tanks-empty');
    
    loading.style.display = 'block';
    error.style.display = 'none';
    empty.style.display = 'none';
    grid.innerHTML = '';
    
    try {
        // Use public tanks endpoint with user filter
        const response = await fetch(`${BACKEND_URL}/api/fishtanks/public?userId=${encodeURIComponent(userId)}`);
        
        if (!response.ok) {
            throw new Error('Failed to load user tanks');
        }
        
        const data = await response.json();
        
        if (data.fishtanks.length === 0) {
            empty.querySelector('p').textContent = `${userId} hasn't created any public tanks yet.`;
            empty.style.display = 'block';
        } else {
            renderTanks(data.fishtanks, grid, false); // false = not editable
        }
    } catch (err) {
        console.error('Error loading user tanks:', err);
        error.textContent = `Failed to load ${userId}'s tanks. Please try again.`;
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
    // Store tanks data for filtering
    allTanks = tanks;
    filteredTanks = [...tanks];
    
    container.innerHTML = '';
    tanks.forEach(tank => {
        const tankCard = createTankCard(tank, isOwner);
        container.appendChild(tankCard);
    });
    
    // Update tank count
    updateTankCount(tanks.length);
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
    card.setAttribute('data-tank-name', tank.name.toLowerCase());
    card.setAttribute('data-tank-description', (tank.description || '').toLowerCase());
    card.setAttribute('data-tank-privacy', tank.isPublic ? 'public' : 'private');
    card.setAttribute('data-tank-fish-count', tank.fishCount || 0);
    card.setAttribute('data-tank-view-count', tank.viewCount || 0);
    card.setAttribute('data-tank-created', tank.createdAt._seconds);
    card.setAttribute('data-tank-updated', tank.updatedAt._seconds);
    
    const createdDate = new Date(tank.createdAt._seconds * 1000).toLocaleDateString();
    const updatedDate = new Date(tank.updatedAt._seconds * 1000).toLocaleDateString();
    
    card.innerHTML = `
        <div class="tank-privacy-badge ${tank.isPublic ? 'public' : 'private'}">
            ${tank.isPublic ? 'Public' : 'Private'}
        </div>
        <h3>${tank.name}</h3>
        <div class="tank-info">
            <p>${tank.description || 'No description provided'}</p>
            <p><strong>Created:</strong> ${createdDate}</p>
            <p><strong>Updated:</strong> ${updatedDate}</p>
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
        const modal = document.getElementById('edit-tank-modal');
        modal.style.display = 'block';
        
        // Focus on the first input field
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
        
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
        const modal = document.getElementById('edit-tank-modal');
        modal.style.display = 'none';
        currentEditingTank = null;
        
        // Clear any error messages
        const errorElement = document.getElementById('edit-tank-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
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
    const shareUrlElement = document.getElementById('share-url');
    if (shareUrlElement) {
        shareUrlElement.textContent = shareUrl;
    }
    
    const modal = document.getElementById('share-tank-modal');
    modal.style.display = 'block';
}

// Copy share URL
function copyShareUrl() {
    const shareUrlElement = document.getElementById('share-url');
    if (!shareUrlElement) return;
    
    const shareUrl = shareUrlElement.textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            // Provide visual feedback
            showTemporaryFeedback('Share URL copied to clipboard!');
        }).catch(() => {
            fallbackCopyToClipboard(shareUrl);
        });
    } else {
        fallbackCopyToClipboard(shareUrl);
    }
}

// Fallback copy method for older browsers
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showTemporaryFeedback('Share URL copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy:', err);
        showTemporaryFeedback('Failed to copy URL. Please copy manually.');
    }
    
    document.body.removeChild(textArea);
}

// Show temporary feedback message
function showTemporaryFeedback(message) {
    // Create or update feedback element
    let feedback = document.getElementById('copy-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'copy-feedback';
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 2000;
            animation: slideInRight 0.3s ease-out;
        `;
        document.body.appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        if (feedback) {
            feedback.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (feedback && feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }
    }, 3000);
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
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        
        // Reset current editing state
        if (modalId === 'edit-tank-modal') {
            currentEditingTank = null;
            // Clear form
            const form = document.getElementById('edit-tank-form');
            if (form) form.reset();
            // Clear error messages
            const errorElement = document.getElementById('edit-tank-error');
            if (errorElement) errorElement.style.display = 'none';
        }
        if (modalId === 'add-fish-modal') {
            currentAddingFishTank = null;
            // Clear fish grid and states
            const fishGrid = document.getElementById('user-fish-grid');
            if (fishGrid) fishGrid.innerHTML = '';
            userFish = [];
            // Clear error/success messages
            const errorElement = document.getElementById('add-fish-error');
            const successElement = document.getElementById('add-fish-success');
            if (errorElement) errorElement.style.display = 'none';
            if (successElement) successElement.style.display = 'none';
        }
        if (modalId === 'share-tank-modal') {
            // Clear share URL
            const shareUrlElement = document.getElementById('share-url');
            if (shareUrlElement) shareUrlElement.textContent = '';
        }
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
    const modal = document.getElementById('add-fish-modal');
    modal.style.display = 'block';
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

// Search and filter functions
function filterTanks() {
    const searchQuery = document.getElementById('tank-search').value.toLowerCase();
    const privacyFilter = document.getElementById('tank-filter').value;
    
    // Filter tanks based on search query and privacy filter
    filteredTanks = allTanks.filter(tank => {
        const matchesSearch = tank.name.toLowerCase().includes(searchQuery) || 
                             (tank.description || '').toLowerCase().includes(searchQuery);
        
        const matchesPrivacy = privacyFilter === 'all' || 
                              (privacyFilter === 'public' && tank.isPublic) ||
                              (privacyFilter === 'private' && !tank.isPublic);
        
        return matchesSearch && matchesPrivacy;
    });
    
    // Apply current sort to filtered tanks
    sortTanks(true);
}

function sortTanks(skipRefilter = false) {
    if (!skipRefilter) {
        filterTanks();
        return;
    }
    
    const sortBy = document.getElementById('tank-sort').value;
    
    filteredTanks.sort((a, b) => {
        switch(sortBy) {
            case 'updated':
                return (b.updatedAt._seconds || 0) - (a.updatedAt._seconds || 0);
            case 'created':
                return (b.createdAt._seconds || 0) - (a.createdAt._seconds || 0);
            case 'name':
                return a.name.localeCompare(b.name);
            case 'fish':
                return (b.fishCount || 0) - (a.fishCount || 0);
            case 'views':
                return (b.viewCount || 0) - (a.viewCount || 0);
            default:
                return 0;
        }
    });
    
    // Re-render the filtered and sorted tanks
    const activeTab = document.querySelector('.tab-content.active').id;
    const container = document.getElementById(activeTab + '-grid');
    const isOwner = activeTab === 'my-tanks';
    
    container.innerHTML = '';
    filteredTanks.forEach(tank => {
        const tankCard = createTankCard(tank, isOwner);
        container.appendChild(tankCard);
    });
    
    updateTankCount(filteredTanks.length);
}

function clearSearch() {
    document.getElementById('tank-search').value = '';
    document.getElementById('tank-filter').value = 'all';
    filterTanks();
}

function updateTankCount(count) {
    // Add or update tank count display
    let countElement = document.querySelector('.tank-count');
    if (!countElement) {
        countElement = document.createElement('div');
        countElement.className = 'tank-count';
        const filterControls = document.querySelector('.filter-controls');
        if (filterControls) {
            filterControls.appendChild(countElement);
        }
    }
    
    const total = allTanks.length;
    if (count === total) {
        countElement.textContent = `${total} tank${total !== 1 ? 's' : ''}`;
    } else {
        countElement.textContent = `${count} of ${total} tank${total !== 1 ? 's' : ''}`;
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
window.filterTanks = filterTanks;
window.sortTanks = sortTanks;
window.clearSearch = clearSearch;