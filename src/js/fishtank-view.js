// Fish Tank View JavaScript
let currentTank = null;
let currentUser = null;
let tankFish = [];
let animationId = null;
let swimSpeed = 1;
let isSwimming = true;

// Fish animation variables
let fishPositions = [];
let fishDirections = [];
let fishSpeeds = [];
let fishImages = []; // Store preloaded fish images

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
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

// Debug function to log fish data
function debugFishData() {
    console.log('Tank Fish Data:', tankFish);
    tankFish.forEach((fish, index) => {
        console.log(`Fish ${index}:`, {
            id: fish.id || fish.docId,
            Artist: fish.Artist,
            image: fish.image || fish.Image,
            hasPreloadedImage: !!fishImages[index]
        });
    });
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
        
        // Debug: log fish data
        debugFishData();
        
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

// Initialize tank animation
function initializeTankAnimation() {
    const canvas = document.getElementById('tank-canvas');
    const ctx = canvas.getContext('2d');
    
    // Initialize fish positions and movements
    fishPositions = [];
    fishDirections = [];
    fishSpeeds = [];
    fishImages = [];
    
    tankFish.forEach((fish, index) => {
        fishPositions.push({
            x: Math.random() * (canvas.width - 60) + 30,
            y: Math.random() * (canvas.height - 60) + 30
        });
        fishDirections.push({
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2
        });
        fishSpeeds.push(Math.random() * 0.5 + 0.5);
        
        // Preload fish image
        preloadFishImage(fish, index);
    });
    
    // Start animation
    if (isSwimming) {
        startAnimation();
    } else {
        drawStaticFish();
    }
}

// Preload fish image
function preloadFishImage(fish, index) {
    const imageUrl = fish.image || fish.Image;
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
        createFishImageDataUrl(imageUrl, (dataUrl) => {
            if (dataUrl) {
                const img = new Image();
                img.onload = () => {
                    fishImages[index] = img;
                    // Redraw the canvas if animation is active
                    if (isSwimming) {
                        // Let the animation loop handle redrawing
                    } else {
                        // Redraw static display
                        drawStaticFish();
                    }
                };
                img.onerror = () => {
                    console.warn('Failed to load fish image:', imageUrl);
                    fishImages[index] = null;
                };
                img.src = dataUrl;
            }
        });
    }
}

// Start fish animation
function startAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    function animate() {
        if (isSwimming) {
            updateFishPositions();
            drawFish();
            animationId = requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Update fish positions
function updateFishPositions() {
    const canvas = document.getElementById('tank-canvas');
    
    fishPositions.forEach((pos, index) => {
        const direction = fishDirections[index];
        const speed = fishSpeeds[index] * swimSpeed;
        
        // Update position
        pos.x += direction.x * speed;
        pos.y += direction.y * speed;
        
        // Bounce off walls
        if (pos.x <= 30 || pos.x >= canvas.width - 30) {
            direction.x *= -1;
            pos.x = Math.max(30, Math.min(canvas.width - 30, pos.x));
        }
        if (pos.y <= 30 || pos.y >= canvas.height - 30) {
            direction.y *= -1;
            pos.y = Math.max(30, Math.min(canvas.height - 30, pos.y));
        }
        
        // Occasional random direction change
        if (Math.random() < 0.002) {
            direction.x += (Math.random() - 0.5) * 0.1;
            direction.y += (Math.random() - 0.5) * 0.1;
            
            // Normalize direction
            const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
            if (magnitude > 0) {
                direction.x /= magnitude;
                direction.y /= magnitude;
            }
        }
    });
}

// Draw fish on canvas
function drawFish() {
    const canvas = document.getElementById('tank-canvas');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw fish
    tankFish.forEach((fish, index) => {
        const pos = fishPositions[index];
        const direction = fishDirections[index];
        
        if (pos) {
            ctx.save();
            ctx.translate(pos.x, pos.y);
            
            // Flip fish based on direction
            if (direction.x < 0) {
                ctx.scale(-1, 1);
            }
            
            // Draw fish image if available
            if (fishImages[index]) {
                // Use preloaded image
                ctx.drawImage(fishImages[index], -15, -15, 30, 30);
            } else {
                // Draw simple fish shape as fallback
                ctx.fillStyle = '#ff6b6b';
                ctx.beginPath();
                ctx.ellipse(0, 0, 15, 8, 0, 0, 2 * Math.PI);
                ctx.fill();
                
                // Draw tail
                ctx.fillStyle = '#ff8e8e';
                ctx.beginPath();
                ctx.moveTo(-12, 0);
                ctx.lineTo(-20, -5);
                ctx.lineTo(-20, 5);
                ctx.closePath();
                ctx.fill();
                
                // Draw eye
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(5, -2, 3, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(5, -2, 1, 0, 2 * Math.PI);
                ctx.fill();
            }
            
            ctx.restore();
        }
    });
}

// Draw static fish
function drawStaticFish() {
    const canvas = document.getElementById('tank-canvas');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw fish in a grid pattern
    const cols = Math.ceil(Math.sqrt(tankFish.length));
    const rows = Math.ceil(tankFish.length / cols);
    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;
    
    tankFish.forEach((fish, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = col * cellWidth + cellWidth / 2;
        const y = row * cellHeight + cellHeight / 2;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Draw fish image if available
        if (fishImages[index]) {
            // Use preloaded image
            ctx.drawImage(fishImages[index], -20, -20, 40, 40);
        } else {
            // Draw simple fish shape as fallback
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.ellipse(0, 0, 20, 12, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw tail
            ctx.fillStyle = '#ff8e8e';
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(-25, -8);
            ctx.lineTo(-25, 8);
            ctx.closePath();
            ctx.fill();
            
            // Draw eye
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(8, -3, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(8, -3, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        ctx.restore();
    });
}

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
    card.className = 'fish-card';
    
    const addedDate = new Date(fish.addedAt._seconds * 1000).toLocaleDateString();
    
    card.innerHTML = `
        <div class="fish-preview">
            <canvas width="200" height="100"></canvas>
        </div>
        <div class="fish-info">
            <div class="fish-signature">${fish.Artist || 'Anonymous Fish'}</div>
            <div class="fish-meta">Added: ${addedDate}</div>
            <div class="fish-actions">
                ${currentTank.canEdit ? `
                    <button class="btn-small btn-danger" onclick="removeFish('${fish.id}')">Remove</button>
                ` : ''}
            </div>
        </div>
    `;
    
    // Draw fish preview
    const canvas = card.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    // Handle fish image like in the tank display
    const imageUrl = fish.image || fish.Image;
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
        createFishImageDataUrl(imageUrl, (dataUrl) => {
            if (dataUrl) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, 200, 100);
                };
                img.src = dataUrl;
            }
        });
    } else {
        // Draw placeholder
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 200, 100);
        ctx.fillStyle = '#0288d1';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🐠', 100, 60);
    }
    
    return card;
}

// Update tank view
function updateTankView() {
    const viewSelect = document.getElementById('tank-view');
    isSwimming = viewSelect.value === 'swim';
    
    if (isSwimming) {
        startAnimation();
    } else {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        drawStaticFish();
    }
}

// Update swim speed
function updateSwimSpeed() {
    const speedSlider = document.getElementById('swim-speed');
    swimSpeed = parseFloat(speedSlider.value);
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

// Global functions for inline event handlers
window.updateTankView = updateTankView;
window.updateSwimSpeed = updateSwimSpeed;
window.refreshTank = refreshTank;
window.showAddFishModal = showAddFishModal;
window.removeFish = removeFish;
window.closeModal = closeModal;
window.debugFishData = debugFishData;