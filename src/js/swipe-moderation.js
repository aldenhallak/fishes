// Swipe Moderation JavaScript
let flaggedFish = [];
let currentIndex = 0;
let stats = { remaining: 0, approved: 0, rejected: 0, skipped: 0 };
let isDragging = false;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;

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

    await loadFlaggedFish();
    setupEventListeners();
    showCurrentFish();
};

// Load flagged fish from backend
async function loadFlaggedFish() {
    document.getElementById('loading').style.display = 'block';
    
    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/moderate/flagged?limit=100&sort=oldest`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            flaggedFish = data.items;
            stats.remaining = flaggedFish.length;
            updateStats();
            
            if (flaggedFish.length === 0) {
                showNoMoreFish();
            } else {
                // Initialize progress text
                document.getElementById('progressText').textContent = 
                    `0 of ${flaggedFish.length} moderated (0%)`;
            }
        } else {
            // Fallback to Firebase
            await loadFlaggedFishFromFirebase();
        }
    } catch (error) {
        console.error('Error loading flagged fish:', error);
        // Fallback to Firebase
        await loadFlaggedFishFromFirebase();
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// Fallback Firebase loading
async function loadFlaggedFishFromFirebase() {
    try {
        const query = window.db.collection('fishes_test')
            .where('flaggedForReview', '==', true)
            .where('deleted', '==', false)
            .orderBy('CreatedAt', 'asc') // Oldest first
            .limit(100);

        const snapshot = await query.get();
        flaggedFish = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        stats.remaining = flaggedFish.length;
        updateStats();
        
        if (flaggedFish.length === 0) {
            showNoMoreFish();
        } else {
            // Initialize progress text
            document.getElementById('progressText').textContent = 
                `0 of ${flaggedFish.length} moderated (0%)`;
        }
    } catch (error) {
        console.error('Error loading flagged fish from Firebase:', error);
        alert('Error loading fish. Please try again.');
    }
}

// Show current fish card
function showCurrentFish() {
    const deck = document.getElementById('swipeDeck');
    
    if (currentIndex >= flaggedFish.length) {
        showNoMoreFish();
        return;
    }

    // Clear the deck completely to avoid showing old cards
    deck.innerHTML = '';
    
    // Force a reflow to ensure the clear happens immediately
    deck.offsetHeight;

    // Show current fish and next 2 fish for stacking effect
    for (let i = 0; i < Math.min(3, flaggedFish.length - currentIndex); i++) {
        const fishIndex = currentIndex + i;
        const fish = flaggedFish[fishIndex];
        const card = createFishCard(fish, i);
        deck.appendChild(card);
        
        // Set initial state for animation
        card.style.opacity = '0';
        card.style.transform = i === 0 ? 
            'translateX(-50%) translateY(20px)' : 
            `translateX(-50%) translateY(${i * 8 + 20}px) scale(${1 - i * 0.05})`;
        
        // Animate card entrance with faster timing
        setTimeout(() => {
            card.style.opacity = i === 0 ? '1' : (1 - i * 0.2);
            card.style.transform = i === 0 ? 
                'translateX(-50%)' : 
                `translateX(-50%) translateY(${i * 8}px) scale(${1 - i * 0.05})`;
        }, i * 10 + 10); // Much faster stagger
    }
}

// Create a fish card element
function createFishCard(fish, stackIndex) {
    const card = document.createElement('div');
    card.className = 'fish-card';
    card.setAttribute('data-fish-id', fish.id);
    card.style.zIndex = 10 - stackIndex;
    
    // Track flip state for this card
    card.setAttribute('data-flipped', fish.flipped || 'false');
    
    // Set initial positioning and styling for fast transitions
    card.style.transition = 'all 0.1s ease';
    
    // Add slight offset for stacking effect
    if (stackIndex > 0) {
        card.style.transform = `translateX(-50%) translateY(${stackIndex * 5}px) scale(${1 - stackIndex * 0.02})`;
        card.style.opacity = 1 - stackIndex * 0.1;
    }

    // Add appropriate class based on status
    if (fish.reportCount > 0) {
        card.classList.add('reported');
    } else if (fish.flaggedForReview) {
        card.classList.add('flagged');
    }

    const createdAt = formatDate(fish.CreatedAt || fish.createdAt);
    const score = calculateScore(fish);
    const upvotes = fish.upvotes || 0;
    const downvotes = fish.downvotes || 0;
    const reportCount = fish.reportCount || 0;
    const isFlipped = fish.flipped === true || fish.flipped === 'true';

    card.innerHTML = `
        <img src="${fish.image || fish.Image}" alt="Fish drawing" class="fish-image" 
             style="transform: scaleX(${isFlipped ? -1 : 1}); transition: transform 0.05s ease;"
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg=='" />
        
        <div class="fish-content">
            <div class="fish-info">
                <h3>Fish #${fish.id}</h3>
                <div class="fish-details">
                    <div><strong>Artist:</strong> ${escapeHtml(fish.Artist || fish.artist || 'Anonymous')}</div>
                    <div><strong>Score:</strong> ${score}</div>
                    <div><strong>Created:</strong> ${createdAt}</div>
                    <div><strong>Votes:</strong> 👍${upvotes} 👎${downvotes}</div>
                </div>
            </div>
            
            <div class="fish-status ${reportCount > 0 ? 'status-reported' : 'status-flagged'}">
                ${reportCount > 0 ? 
                    `⚠️ Reported ${reportCount} time${reportCount > 1 ? 's' : ''}` : 
                    '🚩 Flagged for Review'
                }
            </div>
        </div>
        
        <div class="swipe-indicator reject">🗑️</div>
        <div class="swipe-indicator approve">✅</div>
        <div class="swipe-indicator skip">⏭️</div>
        <div class="swipe-indicator rotate">🔄</div>
    `;

    // Add touch/mouse event listeners only to the top card
    if (stackIndex === 0) {
        setupCardEventListeners(card);
    }

    return card;
}

// Setup event listeners for swipe gestures
function setupCardEventListeners(card) {
    // Mouse events
    card.addEventListener('mousedown', handleStart);
    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseup', handleEnd);
    card.addEventListener('mouseleave', handleEnd);

    // Touch events
    card.addEventListener('touchstart', handleStart, { passive: true });
    card.addEventListener('touchmove', handleMove, { passive: false });
    card.addEventListener('touchend', handleEnd);
}

// Handle start of drag/touch
function handleStart(e) {
    isDragging = true;
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
    currentX = startX;
    currentY = startY;
    
    e.currentTarget.classList.add('dragging');
    e.preventDefault();
}

// Handle drag/touch move
function handleMove(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    currentX = touch.clientX;
    currentY = touch.clientY;
    
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    const rotation = deltaX * 0.08; // Slightly reduced rotation for smoother feel
    const scale = Math.max(0.95, 1 - Math.abs(deltaX) * 0.0002); // Scale down slightly when dragging
    
    const card = e.currentTarget;
    card.style.transform = `translateX(calc(-50% + ${deltaX}px)) translateY(${deltaY}px) rotate(${rotation}deg) scale(${scale})`;
    
    // Add tilt effect to card based on swipe intensity
    const tiltIntensity = Math.min(Math.abs(deltaX) / 200, 1);
    card.style.filter = `hue-rotate(${deltaX * 0.1}deg) brightness(${1 + tiltIntensity * 0.1})`;
    
    // Show appropriate indicator based on swipe direction
    const indicators = card.querySelectorAll('.swipe-indicator');
    indicators.forEach(indicator => indicator.classList.remove('show'));
    
    const threshold = 60; // Reduced threshold for more responsive feedback
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > threshold) {
                card.querySelector('.swipe-indicator.approve').classList.add('show');
                // Visual feedback for approve direction
                card.style.borderColor = '#28a745';
                card.style.boxShadow = '0 15px 40px rgba(40, 167, 69, 0.3)';
            } else if (deltaX < -threshold) {
                card.querySelector('.swipe-indicator.reject').classList.add('show');
                // Visual feedback for reject direction
                card.style.borderColor = '#dc3545';
                card.style.boxShadow = '0 15px 40px rgba(220, 53, 69, 0.3)';
            }
        } else {
            // Vertical swipe
            if (deltaY < -threshold) {
                card.querySelector('.swipe-indicator.skip').classList.add('show');
                // Visual feedback for skip direction
                card.style.borderColor = '#6c757d';
                card.style.boxShadow = '0 15px 40px rgba(108, 117, 125, 0.3)';
            } else if (deltaY > threshold) {
                card.querySelector('.swipe-indicator.rotate').classList.add('show');
                // Visual feedback for rotate direction
                card.style.borderColor = '#9c27b0';
                card.style.boxShadow = '0 15px 40px rgba(156, 39, 176, 0.3)';
            }
        }
        
        // Simulate haptic feedback on mobile devices
        if (navigator.vibrate && Math.abs(deltaX) > threshold * 1.5) {
            navigator.vibrate(10); // Very short vibration
        }
    } else {
        // Reset visual feedback when not crossing threshold
        card.style.borderColor = card.classList.contains('reported') ? '#f44336' : 
                                 card.classList.contains('flagged') ? '#ff9800' : '#e0e0e0';
        card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
    }
}

// Handle end of drag/touch
function handleEnd(e) {
    if (!isDragging) return;
    
    isDragging = false;
    const card = e.currentTarget;
    card.classList.remove('dragging');
    
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    const threshold = 80;
    
    // Determine swipe action
    let action = null;
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > threshold) {
                action = 'approve';
            } else if (deltaX < -threshold) {
                action = 'reject';
            }
        } else {
            // Vertical swipe
            if (deltaY < -threshold) {
                action = 'skip';
            } else if (deltaY > threshold) {
                action = 'rotate';
            }
        }
    }
    
    if (action) {
        // For swipe gestures, map to combined actions
        if (action === 'approve') {
            // Swipe right: approve AND validate
            performSwipeAction('approve', card);
        } else if (action === 'reject') {
            // Swipe left: delete AND invalidate  
            performSwipeAction('reject', card);
        } else {
            // Other actions remain the same
            performSwipeAction(action, card);
        }
    } else {
        // Snap back to center and reset visual feedback
        card.style.transform = 'translateX(-50%)';
        card.style.filter = 'none';
        card.style.borderColor = card.classList.contains('reported') ? '#f44336' : 
                                 card.classList.contains('flagged') ? '#ff9800' : '#e0e0e0';
        card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
        card.querySelectorAll('.swipe-indicator').forEach(indicator => {
            indicator.classList.remove('show');
        });
    }
}

// Perform the swipe action
async function performSwipeAction(action, card) {
    const fishId = card.getAttribute('data-fish-id');
    
    // Handle rotate action differently (doesn't remove card)
    if (action === 'rotate') {
        card.classList.add('rotating');
        
        // Get current flip state and toggle it
        const currentFlipped = card.getAttribute('data-flipped') === 'true';
        const newFlipped = !currentFlipped;
        
        // Immediately flip the image visually
        const img = card.querySelector('.fish-image');
        if (img) {
            img.style.transform = `scaleX(${newFlipped ? -1 : 1})`;
        }
        
        // Update the data attribute
        card.setAttribute('data-flipped', newFlipped.toString());
        
        try {
            await processSwipeAction(action, fishId);
            showActionFeedback('rotate');
            
            // After backend processing, refresh the image and remove rotating class
            setTimeout(async () => {
                card.classList.remove('rotating');
                // Reload the fish data to get updated image if backend processed it
                await refreshFishImage(fishId, card, newFlipped);
            }, 100);
        } catch (error) {
            console.error('Error flipping fish:', error);
            card.classList.remove('rotating');
            // Revert flip on error
            if (img) {
                img.style.transform = `scaleX(${currentFlipped ? -1 : 1})`;
            }
            card.setAttribute('data-flipped', currentFlipped.toString());
            showActionFeedback('error', 'Failed to flip fish');
        }
        return;
    }
    
    // Add action-specific styling before animation
    switch (action) {
        case 'approve':
        case 'approve-only':
            card.style.borderColor = '#28a745';
            card.style.boxShadow = '0 20px 50px rgba(40, 167, 69, 0.4)';
            card.classList.add('swiping-right');
            break;
        case 'reject':
        case 'reject-only':
            card.style.borderColor = '#dc3545';
            card.style.boxShadow = '0 20px 50px rgba(220, 53, 69, 0.4)';
            card.classList.add('swiping-left');
            break;
        case 'skip':
            card.style.borderColor = '#6c757d';
            card.style.boxShadow = '0 20px 50px rgba(108, 117, 125, 0.4)';
            card.classList.add('swiping-up');
            break;
        case 'mark-valid':
            card.style.borderColor = '#2196F3';
            card.style.boxShadow = '0 20px 50px rgba(33, 150, 243, 0.4)';
            card.classList.add('swiping-right');
            break;
        case 'mark-invalid':
            card.style.borderColor = '#FF9800';
            card.style.boxShadow = '0 20px 50px rgba(255, 152, 0, 0.4)';
            card.classList.add('swiping-left');
            break;
    }
    
    // Show the next card preview by animating remaining cards moving up smoothly
    const remainingCards = document.querySelectorAll('.fish-card:not(.swiping-left):not(.swiping-right):not(.swiping-up)');
    remainingCards.forEach((remainingCard, index) => {
        if (index > 0) {
            // Instead of hiding, animate the next card to preview position
            remainingCard.style.transition = 'all 0.05s ease-out';
            remainingCard.style.transform = `translateX(-50%) translateY(${(index - 1) * 8}px) scale(${1 - (index - 1) * 0.05})`;
            remainingCard.style.opacity = index === 1 ? '1' : (1 - (index - 1) * 0.2);
        }
    });
    
    // Update stats immediately for responsiveness (only for actions that remove the card)
    if (['approve', 'approve-only', 'reject', 'reject-only', 'skip', 'mark-valid', 'mark-invalid'].includes(action)) {
        stats.remaining--;
        if (action === 'approve' || action === 'approve-only') stats.approved++;
        else if (action === 'reject' || action === 'reject-only') stats.rejected++;
        else if (action === 'skip') stats.skipped++;
        else if (action === 'mark-valid') stats.approved++;
        else if (action === 'mark-invalid') stats.rejected++;
        updateStats();
    }
    // Show success message
    showActionFeedback(action);
    
    // Perform backend action
    try {
        await processSwipeAction(action, fishId);
    } catch (error) {
        console.error(`Error processing ${action} action:`, error);
        // Revert stats on error (only for actions that remove the card)
        if (['approve', 'approve-only', 'reject', 'reject-only', 'skip', 'mark-valid', 'mark-invalid'].includes(action)) {
            stats.remaining++;
            if (action === 'approve' || action === 'approve-only') stats.approved--;
            else if (action === 'reject' || action === 'reject-only') stats.rejected--;
            else if (action === 'skip') stats.skipped--;
            else if (action === 'mark-valid') stats.approved--;
            else if (action === 'mark-invalid') stats.rejected--;
            updateStats();
        }
        showActionFeedback('error', `Failed to ${action.replace('-', ' ')} fish`);
        return;
    }
    
    // Move to next fish immediately but with proper animation (only for actions that remove the card)
    if (['approve', 'approve-only', 'reject', 'reject-only', 'skip', 'mark-valid', 'mark-invalid'].includes(action)) {
        // Immediately update the index and start showing the new stack
        currentIndex++;
        
        // Show the new fish stack with a minimal delay
        setTimeout(() => {
            showCurrentFish();
        }, 50); // Reduced from 200ms to 50ms for much faster response
    }
}

// Show action feedback
function showActionFeedback(action, customMessage = null) {
    const messages = {
        approve: '✅ Fish approved & validated!',
        'approve-only': '✅ Fish approved!',
        reject: '🗑️ Fish deleted & invalidated!',
        'reject-only': '🗑️ Fish deleted!',
        skip: '⏭️ Fish skipped!',
        'mark-valid': '🐟 Marked as valid fish!',
        'mark-invalid': '🚫 Marked as invalid fish!',
        rotate: '🔄 Fish flipped!',
        error: customMessage || '❌ Action failed!'
    };
    
    const colors = {
        approve: '#28a745',
        'approve-only': '#28a745',
        reject: '#dc3545',
        'reject-only': '#dc3545',
        skip: '#6c757d',
        'mark-valid': '#2196F3',
        'mark-invalid': '#FF9800',
        rotate: '#9C27B0',
        error: '#dc3545'
    };
    
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.className = 'action-feedback';
    feedback.textContent = messages[action] || messages.error;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[action] || colors.error};
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: bold;
        z-index: 1000;
        opacity: 0;
        transition: all 0.1s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(feedback);
    
    // Animate in
    setTimeout(() => {
        feedback.style.opacity = '1';
        feedback.style.transform = 'translateX(-50%) translateY(10px)';
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
        feedback.style.opacity = '0';
        feedback.style.transform = 'translateX(-50%) translateY(-10px)';
        setTimeout(() => document.body.removeChild(feedback), 100);
    }, 800);
}

// Refresh fish image after flip
async function refreshFishImage(fishId, card, expectedFlipped = null) {
    try {
        // Add a minimal delay to allow backend processing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Fetch updated fish data
        const fishDoc = await window.db.collection('fishes_test').doc(fishId).get();
        if (fishDoc.exists) {
            const updatedFish = fishDoc.data();
            const img = card.querySelector('.fish-image');
            if (img && updatedFish.image) {
                // Add timestamp to force reload and clear cache
                const timestamp = Date.now();
                const newSrc = updatedFish.image.includes('?') ? 
                    updatedFish.image.split('?')[0] + '?v=' + timestamp :
                    updatedFish.image + '?v=' + timestamp;
                
                // Preserve the flip state
                const finalFlipped = expectedFlipped !== null ? expectedFlipped : 
                    (updatedFish.flipped === true || updatedFish.flipped === 'true' || 
                     card.getAttribute('data-flipped') === 'true');
                
                // Create a new image to preload and avoid flicker
                const newImg = new Image();
                newImg.onload = () => {
                    img.src = newSrc;
                    img.style.transform = `scaleX(${finalFlipped ? -1 : 1})`;
                    card.setAttribute('data-flipped', finalFlipped.toString());
                };
                newImg.onerror = () => {
                    console.warn('Failed to load flipped image, keeping original');
                };
                newImg.src = newSrc;
            }
        }
    } catch (error) {
        console.error('Error refreshing fish image:', error);
    }
}

// Process the swipe action with backend
async function processSwipeAction(action, fishId) {
    const token = localStorage.getItem('userToken');
    
    if (action === 'approve') {
        // Approve AND mark as valid fish (for swipe action)
        const approveResponse = await fetch(`${API_BASE_URL}/moderate/approve/${fishId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: 'Approved via swipe moderation' })
        });
        
        if (!approveResponse.ok) throw new Error('Failed to approve fish');
        
        // Also mark as valid fish
        const validityResponse = await fetch(`${API_BASE_URL}/moderate/mark-validity/${fishId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isFish: true,
                reason: 'Approved and validated via swipe moderation'
            })
        });
        
        if (!validityResponse.ok) console.warn('Failed to mark as valid fish, but approval succeeded');
        
    } else if (action === 'approve-only') {
        // Button approve: only approve, don't mark validity
        const approveResponse = await fetch(`${API_BASE_URL}/moderate/approve/${fishId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: 'Approved via button' })
        });
        
        if (!approveResponse.ok) throw new Error('Failed to approve fish');
        
    } else if (action === 'reject') {
        // Delete AND mark as invalid fish (for swipe action)
        const deleteResponse = await fetch(`${API_BASE_URL}/moderate/delete/${fishId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: 'Deleted via swipe moderation' })
        });
        
        if (!deleteResponse.ok) throw new Error('Failed to delete fish');
        
        // Also mark as invalid fish
        const validityResponse = await fetch(`${API_BASE_URL}/moderate/mark-validity/${fishId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isFish: false,
                reason: 'Deleted and invalidated via swipe moderation'
            })
        });
        
        if (!validityResponse.ok) console.warn('Failed to mark as invalid fish, but deletion succeeded');
        
    } else if (action === 'reject-only') {
        // Button delete: only delete, don't mark validity
        const deleteResponse = await fetch(`${API_BASE_URL}/moderate/delete/${fishId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: 'Deleted via button' })
        });
        
        if (!deleteResponse.ok) throw new Error('Failed to delete fish');
        
    } else if (action === 'mark-valid') {
        // Just mark as valid fish
        const validityResponse = await fetch(`${API_BASE_URL}/moderate/mark-validity/${fishId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isFish: true,
                reason: 'Marked as valid via swipe moderation'
            })
        });
        
        if (!validityResponse.ok) throw new Error('Failed to mark as valid fish');
        
    } else if (action === 'mark-invalid') {
        // Just mark as invalid fish
        const validityResponse = await fetch(`${API_BASE_URL}/moderate/mark-validity/${fishId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isFish: false,
                reason: 'Marked as invalid via swipe moderation'
            })
        });
        
        if (!validityResponse.ok) throw new Error('Failed to mark as invalid fish');
        
    } else if (action === 'rotate') {
        // Use the flip endpoint for rotation functionality
        try {
            // Use the flip endpoint
            const flipResponse = await fetch(`${API_BASE_URL}/moderate/flip/${fishId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: 'Flipped via swipe moderation' })
            });
            
            if (flipResponse.ok) {
                return; // Success
            }
            
            console.warn('Flip endpoint failed, trying Firebase direct update');
            
            // Final fallback: Direct Firebase update
            const fishDoc = await window.db.collection('fishes_test').doc(fishId).get();
            if (fishDoc.exists) {
                const fishData = fishDoc.data();
                if (fishData.image) {
                    // For now, we'll just refresh the image with a timestamp
                    // In a real implementation, you'd want image processing
                    const updatedImage = fishData.image.includes('?') ? 
                        fishData.image.split('?')[0] + '?rotated=' + Date.now() :
                        fishData.image + '?rotated=' + Date.now();
                    
                    await window.db.collection('fishes_test').doc(fishId).update({
                        image: updatedImage,
                        lastRotated: new Date()
                    });
                    return; // Success
                }
            }
            
            throw new Error('All rotation methods failed');
            
        } catch (error) {
            console.error('Rotation error:', error);
            throw new Error('Failed to rotate fish: ' + error.message);
        }
        
    } else if (action === 'skip') {
        // IDK yet
    }
}

// Button-triggered actions (separate from swipe actions)
function swipeAction(action) {
    const topCard = document.querySelector('.fish-card[data-fish-id]');
    if (topCard) {
        // For button actions, use the specific action directly without combining
        if (action === 'approve') {
            // Button approve: only approve, don't mark validity
            performSwipeAction('approve-only', topCard);
        } else if (action === 'reject') {
            // Button delete: only delete, don't mark validity
            performSwipeAction('reject-only', topCard);
        } else {
            // Other button actions remain the same
            performSwipeAction(action, topCard);
        }
    }
}

// Handle swipe gestures (combined actions)
function handleSwipeGesture(direction) {
    const topCard = document.querySelector('.fish-card[data-fish-id]');
    if (topCard) {
        let action;
        switch(direction) {
            case 'right':
                action = 'approve'; // This will now approve AND validate
                break;
            case 'left':
                action = 'reject'; // This will now delete AND invalidate
                break;
            case 'up':
                action = 'skip';
                break;
            case 'down':
                action = 'rotate';
                break;
        }
        if (action) {
            performSwipeAction(action, topCard);
        }
    }
}

// Update statistics display
function updateStats() {
    document.getElementById('remainingCount').textContent = stats.remaining;
    document.getElementById('approvedCount').textContent = stats.approved;
    document.getElementById('rejectedCount').textContent = stats.rejected;
    document.getElementById('skippedCount').textContent = stats.skipped;
    
    // Update progress bar
    const totalProcessed = stats.approved + stats.rejected + stats.skipped;
    const totalFish = totalProcessed + stats.remaining;
    const progressPercent = totalFish > 0 ? (totalProcessed / totalFish) * 100 : 0;
    
    document.getElementById('progressFill').style.width = `${progressPercent}%`;
    document.getElementById('progressText').textContent = 
        `${totalProcessed} of ${totalFish} moderated (${Math.round(progressPercent)}%)`;
}

// Show no more fish message
function showNoMoreFish() {
    document.getElementById('swipeDeck').style.display = 'none';
    document.querySelector('.action-buttons').style.display = 'none';
    document.getElementById('noMoreFish').style.display = 'block';
}

// Setup global event listeners
function setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Only if not focused on an input field
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            switch(e.key.toLowerCase()) {
                case 'a':
                    e.preventDefault();
                    swipeAction('approve');
                    break;
                case 'd':
                    e.preventDefault();
                    swipeAction('reject');
                    break;
                case 's':
                case ' ':
                    e.preventDefault();
                    swipeAction('skip');
                    break;
                case 'r':
                    e.preventDefault();
                    swipeAction('rotate');
                    break;
                case 'v':
                    e.preventDefault();
                    swipeAction('mark-valid');
                    break;
                case 'i':
                    e.preventDefault();
                    swipeAction('mark-invalid');
                    break;
            }
        }
    });
    
    // Prevent context menu on long press (mobile)
    document.addEventListener('contextmenu', function(e) {
        if (e.target.closest('.fish-card')) {
            e.preventDefault();
        }
    });
}

// Utility functions
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}

function calculateScore(fish) {
    const upvotes = fish.upvotes || 0;
    const downvotes = fish.downvotes || 0;
    return upvotes - downvotes;
}

function formatDate(dateValue) {
    if (!dateValue) return 'Unknown';
    
    let date;
    if (dateValue.toDate) {
        date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
        date = dateValue;
    } else {
        date = new Date(dateValue);
    }
    
    return date.toLocaleDateString();
}

// Logout function
function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    window.location.href = '/login.html';
}

// Help modal functions
function showHelpModal() {
    document.getElementById('helpModal').style.display = 'flex';
}

function hideHelpModal() {
    document.getElementById('helpModal').style.display = 'none';
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const helpModal = document.getElementById('helpModal');
    if (e.target === helpModal) {
        hideHelpModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideHelpModal();
    }
});
