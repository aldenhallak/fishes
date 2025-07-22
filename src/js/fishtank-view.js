// Fish Tank View JavaScript - Using tank.js system
let currentTank = null;
let currentUser = null;
let tankFish = [];

// We'll use the tank.js variables and functions directly
// Just need to set up the canvas for tank.js to use

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // tank.js will handle the canvas setup
    
    checkAuthStatus();
    loadTank();
    
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
    }
}

// Get tank ID from URL parameters
function getTankId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}


// Load tank data
async function loadTank() {
    const tankId = getTankId();
    if (!tankId) {
        showError('Invalid tank ID');
        return;
    }
    
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const content = document.getElementById('tank-content');
    
    loading.style.display = 'block';
    error.style.display = 'none';
    content.style.display = 'none';
    
    try {
        const headers = {};
        if (currentUser) {
            headers['Authorization'] = `Bearer ${localStorage.getItem('userToken')}`;
        }
        
        const response = await fetch(`${BACKEND_URL}/api/fishtanks/${tankId}`, {
            headers
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Tank not found');
            } else if (response.status === 403) {
                throw new Error('You do not have permission to view this tank');
            } else {
                throw new Error('Failed to load tank');
            }
        }
        
        const data = await response.json();
        currentTank = data.fishtank;
        tankFish = data.fish || [];
        
        renderTank();
        initializeTankAnimation();
        
    } catch (err) {
        console.error('Error loading tank:', err);
        showError(err.message);
    } finally {
        loading.style.display = 'none';
    }
}

// Render tank information
function renderTank() {
    const content = document.getElementById('tank-content');
    content.style.display = 'block';
    
    // Update tank info
    document.getElementById('tank-title').textContent = currentTank.name;
    document.getElementById('tank-description').textContent = currentTank.description || 'No description';
    
    // Format dates
    const createdDate = new Date(currentTank.createdAt._seconds * 1000);
    const updatedDate = new Date(currentTank.updatedAt._seconds * 1000);
    
    document.getElementById('tank-details').textContent = 
        `Created by ${currentTank.ownerName || 'Unknown'} • Updated ${updatedDate.toLocaleDateString()}`;
    
    // Update stats
    document.getElementById('fish-count').textContent = currentTank.fishCount || 0;
    document.getElementById('view-count').textContent = currentTank.viewCount || 0;
    document.getElementById('created-date').textContent = createdDate.toLocaleDateString();
    document.getElementById('privacy-status').textContent = currentTank.isPublic ? 'Public' : 'Private';
    
    // Setup actions
    setupTankActions();
    
    // Load fish
    renderFish();
}

// Setup tank actions based on permissions
function setupTankActions() {
    const actionsContainer = document.getElementById('tank-actions');
    actionsContainer.innerHTML = '';
    
    if (currentTank.canAddFish) {
        const addFishBtn = document.createElement('button');
        addFishBtn.className = 'btn btn-secondary';
        addFishBtn.textContent = 'Add Fish';
        addFishBtn.onclick = showAddFishModal;
        actionsContainer.appendChild(addFishBtn);
    }
    
    if (currentTank.canEdit) {
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-primary';
        editBtn.textContent = 'Edit Tank';
        editBtn.onclick = () => {
            window.location.href = `fishtanks.html`;
        };
        actionsContainer.appendChild(editBtn);
    }
    
    // Share button for all users
    const shareBtn = document.createElement('button');
    shareBtn.className = 'btn btn-primary';
    shareBtn.textContent = 'Share';
    shareBtn.onclick = shareTank;
    actionsContainer.appendChild(shareBtn);
}

// Initialize tank animation using tank.js system
function initializeTankAnimation() {
    // Clear existing fish in tank.js
    if (window.fishes) {
        window.fishes.length = 0;
    }
    
    // Load fish using tank.js loadFishImageToTank function
    tankFish.forEach((fish, index) => {
        const imageUrl = fish.image || fish.Image;
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
            if (typeof window.loadFishImageToTank === 'function') {
                window.loadFishImageToTank(imageUrl, {
                    ...fish,
                    docId: fish.id || fish.docId,
                    Artist: fish.Artist || 'Anonymous'
                });
            }
        }
    });
    
    // Animation should already be running from tank.js
}

// All tank animation and interaction functions are now provided by tank.js
// We just need to set up the canvas and use the existing functions

// Render fish list
function renderFish() {
    const fishGrid = document.getElementById('fish-grid');
    const fishEmpty = document.getElementById('fish-empty');
    
    if (tankFish.length === 0) {
        fishEmpty.style.display = 'block';
        fishGrid.innerHTML = '';
        return;
    }
    
    fishEmpty.style.display = 'none';
    fishGrid.innerHTML = '';
    
    tankFish.forEach(fish => {
        const fishCard = createFishCard(fish);
        fishGrid.appendChild(fishCard);
    });
}

// Create fish card element
function createFishCard(fish) {
    const card = document.createElement('div');
    card.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: white;
        min-width: 120px;
    `;
    
    const addedDate = new Date(fish.addedAt._seconds * 1000).toLocaleDateString();
    
    // Create canvas for fish preview
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 48;
    canvas.style.cssText = `
        border: 1px solid #ccc;
        border-radius: 4px;
        margin-bottom: 8px;
    `;
    
    // Artist name
    const artistDiv = document.createElement('div');
    artistDiv.style.cssText = `
        font-size: 12px;
        font-weight: bold;
        color: #333;
        margin-bottom: 4px;
        text-align: center;
    `;
    artistDiv.textContent = fish.Artist || 'Anonymous';
    
    // Added date
    const dateDiv = document.createElement('div');
    dateDiv.style.cssText = `
        font-size: 10px;
        color: #666;
        margin-bottom: 8px;
        text-align: center;
    `;
    dateDiv.textContent = addedDate;
    
    // Actions
    const actionsDiv = document.createElement('div');
    if (currentTank.canEdit) {
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.cssText = `
            font-size: 10px;
            padding: 2px 6px;
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        `;
        removeBtn.onclick = () => removeFish(fish.id);
        actionsDiv.appendChild(removeBtn);
    }
    
    // Assemble card
    card.appendChild(canvas);
    card.appendChild(artistDiv);
    card.appendChild(dateDiv);
    card.appendChild(actionsDiv);
    
    // Draw fish preview
    const ctx = canvas.getContext('2d');
    const imageUrl = fish.image || fish.Image;
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
        createFishImageDataUrl(imageUrl, (dataUrl) => {
            if (dataUrl) {
                const img = new Image();
                img.onload = () => {
                    // Clear canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw fish image scaled to fit
                    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                    const drawWidth = img.width * scale;
                    const drawHeight = img.height * scale;
                    const x = (canvas.width - drawWidth) / 2;
                    const y = (canvas.height - drawHeight) / 2;
                    
                    ctx.drawImage(img, x, y, drawWidth, drawHeight);
                };
                img.src = dataUrl;
            }
        });
    } else {
        // Draw placeholder
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0288d1';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🐠', canvas.width / 2, canvas.height / 2 + 7);
    }
    
    return card;
}

// Update tank view - tank.js animation is always running
function updateTankView() {
    const viewSelect = document.getElementById('tank-view');
    const isSwimming = viewSelect.value === 'swim';
    
    if (isSwimming) {
        // tank.js animation is already running
    } else {
        // For static view, draw fish in grid
        drawStaticFish();
    }
}

// Update swim speed
function updateSwimSpeed() {
    const speedSlider = document.getElementById('swim-speed');
    const newSpeed = parseFloat(speedSlider.value);
    
    // Apply speed to all fish in tank.js
    const fishArray = window.fishes || [];
    fishArray.forEach(fish => {
        fish.speed = newSpeed;
    });
}

// Draw static fish (simple grid layout)
function drawStaticFish() {
    const canvas = document.getElementById('swim-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const fishArray = window.fishes || [];
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw fish in a grid pattern
    const cols = Math.ceil(Math.sqrt(fishArray.length));
    const rows = Math.ceil(fishArray.length / cols);
    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;
    
    fishArray.forEach((fish, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = col * cellWidth + cellWidth / 2 - fish.width / 2;
        const y = row * cellHeight + cellHeight / 2 - fish.height / 2;
        
        ctx.drawImage(fish.fishCanvas, x, y);
    });
}

// Refresh tank
function refreshTank() {
    loadTank();
}

// Show add fish modal
async function showAddFishModal() {
    if (!currentUser) {
        alert('Please log in to add fish');
        return;
    }
    
    document.getElementById('add-fish-modal').style.display = 'block';
    await loadAvailableFish();
}

// Load all available fish for adding
async function loadAvailableFish() {
    const loading = document.getElementById('user-fish-loading');
    const selection = document.getElementById('user-fish-selection');
    const empty = document.getElementById('user-fish-empty');
    
    loading.style.display = 'block';
    empty.style.display = 'none';
    selection.innerHTML = '';
    
    try {
        // Use the same fish loading logic as the ranking system
        const fishDocs = await getFishBySort('recent', 50);
        
        // Convert Firestore documents to fish objects
        const availableFish = fishDocs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                docId: doc.id,
                score: calculateScore(data)
            };
        });
        
        if (availableFish.length === 0) {
            empty.style.display = 'block';
        } else {
            renderUserFishSelection(availableFish);
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

// Render user fish selection
function renderUserFishSelection(fish) {
    const selection = document.getElementById('user-fish-selection');
    selection.innerHTML = '';
    
    fish.forEach(fishItem => {
        const fishEl = document.createElement('div');
        fishEl.className = 'fish-selection-item';
        fishEl.title = fishItem.Artist || 'Fish';
        
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        
        // Handle fish images like in rank.js
        const imageUrl = fishItem.image || fishItem.Image;
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
            createFishImageDataUrl(imageUrl, (dataUrl) => {
                if (dataUrl) {
                    const img = new Image();
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0, 50, 50);
                    };
                    img.src = dataUrl;
                }
            });
        } else {
            // Default placeholder
            ctx.fillStyle = '#e0f7fa';
            ctx.fillRect(0, 0, 50, 50);
            ctx.fillStyle = '#0288d1';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🐠', 25, 32);
        }
        
        fishEl.appendChild(canvas);
        
        fishEl.onclick = () => {
            // Remove selection from all items
            selection.querySelectorAll('.fish-selection-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Select this item
            fishEl.classList.add('selected');
            
            // Add fish to tank - use docId for compatibility with rank.js fish data
            addFishToTank(fishItem.docId || fishItem.id);
        };
        
        selection.appendChild(fishEl);
    });
}

// Add fish to tank
async function addFishToTank(fishId) {
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${BACKEND_URL}/api/fishtanks/${currentTank.id}/add-fish`, {
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
        
        showSuccess('add-fish-success', 'Fish added successfully!');
        
        // Refresh tank after delay
        setTimeout(() => {
            closeModal('add-fish-modal');
            loadTank();
        }, 1500);
        
    } catch (err) {
        console.error('Error adding fish:', err);
        showError('add-fish-error', err.message);
    }
}

// Remove fish from tank
async function removeFish(fishId) {
    if (!confirm('Are you sure you want to remove this fish from the tank?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${BACKEND_URL}/api/fishtanks/${currentTank.id}/fish/${fishId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to remove fish');
        }
        
        // Refresh tank
        loadTank();
        
    } catch (err) {
        console.error('Error removing fish:', err);
        alert('Failed to remove fish: ' + err.message);
    }
}

// Share tank
function shareTank() {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: currentTank.name,
            text: `Check out this fish tank: ${currentTank.name}`,
            url: shareUrl
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Tank URL copied to clipboard!');
        }).catch(() => {
            prompt('Copy this URL to share:', shareUrl);
        });
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Show error message
function showError(message, elementId = 'error') {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
    
    if (elementId === 'error') {
        document.getElementById('loading').style.display = 'none';
    }
}

// Show success message
function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

// Vote and report handlers are provided by tank.js

// Global functions for inline event handlers
window.updateTankView = updateTankView;
window.updateSwimSpeed = updateSwimSpeed;
window.refreshTank = refreshTank;
window.showAddFishModal = showAddFishModal;
window.removeFish = removeFish;
window.closeModal = closeModal;
window.shareTank = shareTank;
// handleVote and handleReport are provided by tank.js