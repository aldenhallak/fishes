// Fish Tank Only JS
// This file contains only the logic for displaying and animating the fish tank.

const swimCanvas = document.getElementById('swim-canvas');
const swimCtx = swimCanvas.getContext('2d');
const fishes = [];

// Calculate optimal fish size based on tank size
function calculateFishSize() {
    const tankWidth = swimCanvas.width;
    const tankHeight = swimCanvas.height;

    // Scale fish size based on tank dimensions
    // Use smaller dimension to ensure fish fit well on all screen ratios
    const baseDimension = Math.min(tankWidth, tankHeight);

    // Fish width should be roughly 8-12% of the smaller tank dimension
    const fishWidth = Math.floor(baseDimension * 0.1); // 10% of smaller dimension
    const fishHeight = Math.floor(fishWidth * 0.6); // Maintain 3:5 aspect ratio

    // Set reasonable bounds: 
    // - Minimum: 30px wide (for very small screens)
    // - Maximum: 150px wide (for very large screens)
    const finalWidth = Math.max(30, Math.min(150, fishWidth));
    const finalHeight = Math.max(18, Math.min(90, fishHeight));

    return {
        width: finalWidth,
        height: finalHeight
    };
}

// Rescale all existing fish to maintain consistency
function rescaleAllFish() {
    const newSize = calculateFishSize();

    fishes.forEach(fish => {
        // Store original image source
        const originalCanvas = fish.fishCanvas;

        // Create a temporary canvas to extract the original image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = originalCanvas.width;
        tempCanvas.height = originalCanvas.height;
        tempCanvas.getContext('2d').drawImage(originalCanvas, 0, 0);

        // Create new resized canvas
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = newSize.width;
        resizedCanvas.height = newSize.height;
        const resizedCtx = resizedCanvas.getContext('2d');

        // Scale the fish image to new size
        resizedCtx.imageSmoothingEnabled = true;
        resizedCtx.imageSmoothingQuality = 'high';
        resizedCtx.drawImage(tempCanvas, 0, 0, newSize.width, newSize.height);

        // Update fish properties
        const oldWidth = fish.width;
        const oldHeight = fish.height;
        fish.fishCanvas = resizedCanvas;
        fish.width = newSize.width;
        fish.height = newSize.height;

        // Adjust position to prevent fish from going off-screen
        fish.x = Math.max(0, Math.min(swimCanvas.width - newSize.width, fish.x));
        fish.y = Math.max(0, Math.min(swimCanvas.height - newSize.height, fish.y));
    });
}

// Helper to crop whitespace (transparent or white) from a canvas
function cropCanvasToContent(srcCanvas) {
    const ctx = srcCanvas.getContext('2d');
    const w = srcCanvas.width;
    const h = srcCanvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    let minX = w, minY = h, maxX = 0, maxY = 0;
    let found = false;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const r = imgData.data[i];
            const g = imgData.data[i + 1];
            const b = imgData.data[i + 2];
            const a = imgData.data[i + 3];
            if (a > 16 && !(r > 240 && g > 240 && b > 240)) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                found = true;
            }
        }
    }
    if (!found) return srcCanvas;
    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    const cropped = document.createElement('canvas');
    cropped.width = cropW;
    cropped.height = cropH;
    cropped.getContext('2d').drawImage(srcCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    return cropped;
}

function makeDisplayFishCanvas(img, width = 80, height = 48) {
    const displayCanvas = document.createElement('canvas');
    displayCanvas.width = width;
    displayCanvas.height = height;
    const displayCtx = displayCanvas.getContext('2d');
    const temp = document.createElement('canvas');
    temp.width = img.width;
    temp.height = img.height;
    temp.getContext('2d').drawImage(img, 0, 0);
    const cropped = cropCanvasToContent(temp);
    displayCtx.clearRect(0, 0, width, height);
    const scale = Math.min(width / cropped.width, height / cropped.height);
    const drawW = cropped.width * scale;
    const drawH = cropped.height * scale;
    const dx = (width - drawW) / 2;
    const dy = (height - drawH) / 2;
    displayCtx.drawImage(cropped, 0, 0, cropped.width, cropped.height, dx, dy, drawW, drawH);
    return displayCanvas;
}

function createFishObject({
    fishCanvas,
    x,
    y,
    direction = 1,
    phase = 0,
    amplitude = 24,
    speed = 2,
    vx = 0,
    vy = 0,
    width = 80,
    height = 48,
    artist = 'Anonymous',
    createdAt = null,
    docId = null,
    peduncle = .4,
    upvotes = 0,
    downvotes = 0,
    score = 0
}) {
    return {
        fishCanvas,
        x,
        y,
        direction,
        phase,
        amplitude,
        speed,
        vx,
        vy,
        width,
        height,
        artist,
        createdAt,
        docId,
        peduncle,
        upvotes,
        downvotes,
        score,
    };
}

function loadFishImageToTank(imgUrl, fishData, onDone) {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
        // Calculate dynamic size based on current tank and fish count
        const fishSize = calculateFishSize();
        const displayCanvas = makeDisplayFishCanvas(img, fishSize.width, fishSize.height);
        if (displayCanvas && displayCanvas.width && displayCanvas.height) {
            const maxX = Math.max(0, swimCanvas.width - fishSize.width);
            const maxY = Math.max(0, swimCanvas.height - fishSize.height);
            const x = Math.floor(Math.random() * maxX);
            const y = Math.floor(Math.random() * maxY);
            const fishObj = createFishObject({
                fishCanvas: displayCanvas,
                x,
                y,
                direction: Math.random() < 0.5 ? -1 : 1, // Randomly choose left or right
                phase: fishData.phase || 0,
                amplitude: fishData.amplitude || 24,
                speed: fishData.speed || 2,
                artist: fishData.artist || fishData.Artist || 'Anonymous',
                createdAt: fishData.createdAt || fishData.CreatedAt || null,
                docId: fishData.docId || null,
                peduncle: fishData.peduncle || .4,
                width: fishSize.width,
                height: fishSize.height,
                upvotes: fishData.upvotes || 0,
                downvotes: fishData.downvotes || 0,
                score: fishData.score || 0
            });
            
            // Add entrance animation for new fish
            if (fishData.docId && fishes.length >= maxTankCapacity - 1) {
                fishObj.isEntering = true;
                fishObj.enterStartTime = Date.now();
                fishObj.enterDuration = 1000; // 1 second entrance
                fishObj.opacity = 0;
                fishObj.scale = 0.3;
            }
            
            fishes.push(fishObj);

            if (onDone) onDone(fishObj);
        } else {
            console.warn('Fish image did not load or is blank:', imgUrl);
        }
    };
    img.src = imgUrl;
}

// Using shared utility function from fish-utils.js

// Global variable to track the newest fish timestamp and listener
let newestFishTimestamp = null;
let newFishListener = null;
let maxTankCapacity = 50; // Dynamic tank capacity controlled by slider
let isUpdatingCapacity = false; // Prevent multiple simultaneous updates

// Update page title based on sort type
function updatePageTitle(sortType) {
    const titles = {
        'recent': `Fish Tank - ${maxTankCapacity} Most Recent`,
        'popular': `Fish Tank - ${maxTankCapacity} Most Popular`,
        'random': `Fish Tank - ${maxTankCapacity} Random Fish`
    };
    document.title = titles[sortType] || 'Fish Tank';
}

// Debounce function to prevent rapid-fire calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update current fish count display
function updateCurrentFishCount() {
    const currentCountElement = document.getElementById('current-fish-count');
    if (currentCountElement) {
        const aliveFishCount = fishes.filter(f => !f.isDying).length;
        const dyingFishCount = fishes.filter(f => f.isDying).length;
        if (dyingFishCount > 0) {
            currentCountElement.textContent = `(${aliveFishCount} swimming, ${dyingFishCount} leaving)`;
        } else {
            currentCountElement.textContent = `(${aliveFishCount} swimming)`;
        }
    }
}

// Handle tank capacity changes
async function updateTankCapacity(newCapacity) {
    // Prevent multiple simultaneous updates
    if (isUpdatingCapacity) {
        return;
    }
    
    isUpdatingCapacity = true;
    
    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
        loadingIndicator.textContent = 'updating tank...';
    }
    
    const oldCapacity = maxTankCapacity;
    maxTankCapacity = newCapacity;
    
    // Update the display
    const displayElement = document.getElementById('fish-count-display');
    if (displayElement) {
        displayElement.textContent = newCapacity;
    }
    
    // Update current fish count display
    updateCurrentFishCount();
    
    // Update page title
    const sortSelect = document.getElementById('tank-sort');
    if (sortSelect) {
        updatePageTitle(sortSelect.value);
    }
    
    // Update URL parameter
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('capacity', newCapacity);
    window.history.replaceState({}, '', newUrl);
    
    // If capacity decreased, remove excess fish with death animation
    if (newCapacity < fishes.length) {
        const currentFishCount = fishes.filter(f => !f.isDying).length;
        const excessCount = Math.max(0, currentFishCount - newCapacity);
        
        console.log(`Reducing capacity from ${currentFishCount} to ${newCapacity}, removing ${excessCount} fish`);
        
        // Get references to fish that are not already dying
        const aliveFish = fishes.filter(f => !f.isDying);
        
        // Only remove the excess amount, not all fish
        const fishToRemove = aliveFish.slice(0, excessCount);
        
        console.log(`Fish to remove: ${fishToRemove.length} out of ${aliveFish.length} alive fish`);
        
        // Stagger the death animations to avoid overwhelming the system
        fishToRemove.forEach((fishObj, i) => {
            setTimeout(() => {
                // Find the current index of this fish object
                const currentIndex = fishes.indexOf(fishObj);
                if (currentIndex !== -1 && !fishObj.isDying) {
                    console.log(`Animating death of fish with docId: ${fishObj.docId || 'unknown'}`);
                    animateFishDeath(currentIndex);
                }
            }, i * 200); // 200ms delay between each death
        });
    }
    // If capacity increased, try to add more fish (if available from current sort)
    else if (newCapacity > fishes.length && newCapacity > oldCapacity) {
        const sortSelect = document.getElementById('tank-sort');
        const currentSort = sortSelect ? sortSelect.value : 'recent';
        const neededCount = newCapacity - fishes.length;
        
        // Load additional fish
        await loadAdditionalFish(currentSort, neededCount);
    }
    
    // Hide loading indicator
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    
    isUpdatingCapacity = false;
}

// Load additional fish when capacity is increased
async function loadAdditionalFish(sortType, count) {
    try {
        // Get existing fish IDs to prevent duplicates
        const existingIds = new Set(fishes.map(f => f.docId).filter(id => id));
        
        // Get additional fish, accounting for potential duplicates
        const additionalFishDocs = await getFishBySort(sortType, count * 2); // Get more to account for duplicates
        
        let addedCount = 0;
        
        for (const doc of additionalFishDocs) {
            // Stop if we've reached the capacity or added enough fish
            if (fishes.length >= maxTankCapacity || addedCount >= count) {
                break;
            }
            
            const data = doc.data();
            const imageUrl = data.image || data.Image;
            
            // Skip if invalid image or already exists
            if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
                continue;
            }
            
            if (existingIds.has(doc.id)) {
                continue;
            }
            
            // Add to existing IDs to prevent duplicates within this batch
            existingIds.add(doc.id);
            
            loadFishImageToTank(imageUrl, {
                ...data,
                docId: doc.id
            });
            
            addedCount++;
        }
    } catch (error) {
        console.error('Error loading additional fish:', error);
    }
}

// Animate a fish death (turn upside down, fade, and fall)
function animateFishDeath(fishIndex, onComplete) {
    if (fishIndex < 0 || fishIndex >= fishes.length) {
        if (onComplete) onComplete();
        return;
    }

    const dyingFish = fishes[fishIndex];
    const deathDuration = 2000; // 2 seconds
    const startTime = Date.now();
    
    // Store original values
    const originalDirection = dyingFish.direction;
    const originalY = dyingFish.y;
    const originalOpacity = 1;
    
    // Death animation properties
    dyingFish.isDying = true;
    dyingFish.deathStartTime = startTime;
    dyingFish.deathDuration = deathDuration;
    dyingFish.originalY = originalY;
    dyingFish.opacity = originalOpacity;
    
    // Set fish upside down
    dyingFish.direction = -Math.abs(dyingFish.direction); // Ensure it's negative (upside down)
    
    // Animation will be handled in the main animation loop
    // After the animation completes, remove the fish
    setTimeout(() => {
        const index = fishes.indexOf(dyingFish);
        if (index !== -1) {
            fishes.splice(index, 1);
        }
        if (onComplete) onComplete();
    }, deathDuration);
}

// Show a subtle notification when new fish arrive
function showNewFishNotification(artistName) {
    // Check if notifications are enabled
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (!notificationsToggle || !notificationsToggle.checked) {
        return;
    }
    
    // Create retro notification element
    const notification = document.createElement('div');
    notification.textContent = `New fish from ${artistName}!`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        color: #000000;
        background: #c0c0c0;
        border: 2px outset #808080;
        padding: 4px 8px;
        font-size: 11px;
        font-family: "MS Sans Serif", sans-serif;
        font-weight: bold;
        z-index: 1000;
        pointer-events: none;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds (no animation)
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// Load initial fish into tank based on sort type
async function loadInitialFish(sortType = 'recent') {
    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }

    // Clear existing fish
    fishes.length = 0;

    try {
        // Load initial fish from Firestore using shared utility
        const allFishDocs = await getFishBySort(sortType, maxTankCapacity); // Load based on current capacity
        
        // Track the newest timestamp for the listener
        if (allFishDocs.length > 0) {
            const sortedByDate = allFishDocs.sort((a, b) => {
                const aDate = a.data().CreatedAt || a.data().createdAt;
                const bDate = b.data().CreatedAt || b.data().createdAt;
                return bDate.toDate() - aDate.toDate();
            });
            newestFishTimestamp = sortedByDate[0].data().CreatedAt || sortedByDate[0].data().createdAt;
        }

        allFishDocs.forEach(doc => {
            const data = doc.data();
            const imageUrl = data.image || data.Image;
            if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
                console.warn('Skipping fish with invalid image:', doc.id, data);
                return;
            }
            loadFishImageToTank(imageUrl, {
                ...data,
                docId: doc.id
            });
        });
    } catch (error) {
        console.error('Error loading initial fish:', error);
    } finally {
        // Hide loading indicator
        if (loadingIndicator) {
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
            }, 500);
        }
    }
}

// Set up real-time listener for new fish
function setupNewFishListener() {
    // Remove existing listener if any
    if (newFishListener) {
        newFishListener();
        newFishListener = null;
    }

    // Set up the listener for new fish only
    const baseQuery = window.db.collection('fishes_test')
        .where('isVisible', '==', true)
        .orderBy('CreatedAt', 'desc');

    // If we have a timestamp, only listen for fish created after it
    const query = newestFishTimestamp 
        ? baseQuery.where('CreatedAt', '>', newestFishTimestamp)
        : baseQuery;

    newFishListener = query.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const doc = change.doc;
                const data = doc.data();
                const imageUrl = data.image || data.Image;
                
                if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
                    console.warn('Skipping fish with invalid image:', doc.id, data);
                    return;
                }

                // Only add if we haven't seen this fish before
                if (!fishes.some(f => f.docId === doc.id)) {
                    // If at capacity, animate death of oldest fish, then add new one
                    if (fishes.length >= maxTankCapacity) {
                       // Find the oldest fish (first non-dying fish)
                        const oldestFishIndex = fishes.findIndex(f => !f.isDying);
                        
                        if (oldestFishIndex !== -1) {
                            animateFishDeath(oldestFishIndex, () => {
                                // After death animation completes, add new fish
                                loadFishImageToTank(imageUrl, {
                                    ...data,
                                    docId: doc.id
                                }, (newFish) => {
                                    // Show subtle notification
                                    showNewFishNotification(data.artist || data.Artist || 'Anonymous');
                                    
                                    // Update our timestamp tracking
                                    const fishTimestamp = data.CreatedAt || data.createdAt;
                                    if (!newestFishTimestamp || fishTimestamp.toDate() > newestFishTimestamp.toDate()) {
                                        newestFishTimestamp = fishTimestamp;
                                    }
                                });
                            });
                        }
                    } else {
                        // Tank not at capacity, add fish immediately
                         loadFishImageToTank(imageUrl, {
                            ...data,
                            docId: doc.id
                        }, (newFish) => {
                            // Show subtle notification
                            showNewFishNotification(data.artist || data.Artist || 'Anonymous');
                            
                            // Update our timestamp tracking
                            const fishTimestamp = data.CreatedAt || data.createdAt;
                            if (!newestFishTimestamp || fishTimestamp.toDate() > newestFishTimestamp.toDate()) {
                                newestFishTimestamp = fishTimestamp;
                            }
                        });
                    }
                }
            }
        });
    }, (error) => {
        console.error('Error listening for new fish:', error);
    });
}

// Combined function to load tank with streaming capability
async function loadFishIntoTank(sortType = 'recent') {
    // Load initial fish
    await loadInitialFish(sortType);
    
    // Set up real-time listener for new fish (only for recent mode)
    if (sortType === 'recent') {
        setupNewFishListener();
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    const sortSelect = document.getElementById('tank-sort');
    const refreshButton = document.getElementById('refresh-tank');

    // Check for URL parameters to set initial sort and capacity
    const urlParams = new URLSearchParams(window.location.search);
    const sortParam = urlParams.get('sort');
    const capacityParam = urlParams.get('capacity');
    let initialSort = 'recent'; // default

    // Validate sort parameter and set dropdown
    if (sortParam && ['recent', 'popular', 'random'].includes(sortParam)) {
        initialSort = sortParam;
        sortSelect.value = sortParam;
    }
    
    // Initialize capacity from URL parameter
    if (capacityParam) {
        const capacity = parseInt(capacityParam);
        if (capacity >= 1 && capacity <= 100) {
            maxTankCapacity = capacity;
            const fishCountSlider = document.getElementById('fish-count-slider');
            if (fishCountSlider) {
                fishCountSlider.value = capacity;
            }
        }
    }

    // Update page title based on initial selection
    updatePageTitle(initialSort);

    // Handle sort change
    sortSelect.addEventListener('change', () => {
        const selectedSort = sortSelect.value;
        
        // Clean up existing listener before switching modes
        if (newFishListener) {
            newFishListener();
            newFishListener = null;
        }
        
        loadFishIntoTank(selectedSort);

        // Update page title based on selection
        updatePageTitle(selectedSort);
        
        // Update URL without reloading the page
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('sort', selectedSort);
        window.history.replaceState({}, '', newUrl);
    });

    // Handle refresh button
    refreshButton.addEventListener('click', () => {
        const selectedSort = sortSelect.value;
        loadFishIntoTank(selectedSort);
    });

    // Handle fish count slider
    const fishCountSlider = document.getElementById('fish-count-slider');
    if (fishCountSlider) {
        // Use debounced function for input events (for real-time display updates)
        const debouncedUpdateCapacity = debounce((newCapacity) => {
            updateTankCapacity(newCapacity);
        }, 300); // 300ms delay
        
        // Update display immediately but debounce the actual capacity change
        fishCountSlider.addEventListener('input', (e) => {
            const newCapacity = parseInt(e.target.value);
            
            // Update display immediately
            const displayElement = document.getElementById('fish-count-display');
            if (displayElement) {
                displayElement.textContent = newCapacity;
            }
            
            // Debounce the actual fish loading
            debouncedUpdateCapacity(newCapacity);
        });
        
        // Also handle the change event for when user stops dragging
        fishCountSlider.addEventListener('change', (e) => {
            const newCapacity = parseInt(e.target.value);
            updateTankCapacity(newCapacity);
        });
        
        // Initialize the display
        updateTankCapacity(maxTankCapacity);
    }

    // Load initial fish based on URL parameter or default
    await loadFishIntoTank(initialSort);

    // Clean up listener when page is unloaded
    window.addEventListener('beforeunload', () => {
        if (newFishListener) {
            newFishListener();
            newFishListener = null;
        }
    });
});

function showFishInfoModal(fish) {
    const fishImgCanvas = document.createElement('canvas');
    fishImgCanvas.width = fish.width;
    fishImgCanvas.height = fish.height;
    fishImgCanvas.getContext('2d').drawImage(fish.fishCanvas, 0, 0);
    const imgDataUrl = fishImgCanvas.toDataURL();

    // Scale display size for modal (max 120x80, maintain aspect ratio)
    const modalWidth = Math.min(120, fish.width);
    const modalHeight = Math.min(80, fish.height);

    let info = `<div style='text-align:center;'>`;
    info += `<img src='${imgDataUrl}' width='${modalWidth}' height='${modalHeight}' style='display:block;margin:0 auto 10px auto;border:1px solid #808080;background:#ffffff;' alt='Fish'><br>`;
    info += `<div style='margin-bottom:10px;'>`;
    info += `<strong>Artist:</strong> ${fish.artist || 'Anonymous'}<br>`;
    if (fish.createdAt) {
        info += `<strong>Created:</strong> ${formatDate(fish.createdAt)}<br>`;
    }
    const score = calculateScore(fish);
    info += `<strong class="modal-score">Score: ${score}</strong>`;
    info += `</div>`;

    // Add voting controls using shared utility
    info += createVotingControlsHTML(fish.docId, fish.upvotes || 0, fish.downvotes || 0, false, 'modal-controls');
    
    // Add "Add to Tank" button only if user is logged in
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
        info += `<div style='margin-top: 10px; text-align: center;'>`;
        info += `<button onclick="showAddToTankModal('${fish.docId}')" style="border: 1px solid #000; padding: 4px 8px; cursor: pointer;">Add to Tank</button>`;
        info += `</div>`;
    }
    
    info += `</div>`;

    showModal(info, () => { });
}

// Tank-specific vote handler using shared utilities
function handleVote(fishId, voteType, button) {
    handleVoteGeneric(fishId, voteType, button, (result, voteType) => {
        // Find the fish in the fishes array and update it
        const fish = fishes.find(f => f.docId === fishId);
        if (fish) {
            // Update fish data based on response format
            if (result.upvotes !== undefined && result.downvotes !== undefined) {
                fish.upvotes = result.upvotes;
                fish.downvotes = result.downvotes;
            } else if (result.updatedFish) {
                fish.upvotes = result.updatedFish.upvotes || fish.upvotes || 0;
                fish.downvotes = result.updatedFish.downvotes || fish.downvotes || 0;
            } else if (result.success) {
                if (voteType === 'up') {
                    fish.upvotes = (fish.upvotes || 0) + 1;
                } else {
                    fish.downvotes = (fish.downvotes || 0) + 1;
                }
            }

            // Update the modal display with new counts
            const upvoteCount = document.querySelector('.modal-controls .upvote-count');
            const downvoteCount = document.querySelector('.modal-controls .downvote-count');
            const scoreDisplay = document.querySelector('.modal-score');

            if (upvoteCount) upvoteCount.textContent = fish.upvotes || 0;
            if (downvoteCount) downvoteCount.textContent = fish.downvotes || 0;
            if (scoreDisplay) scoreDisplay.textContent = `Score: ${calculateScore(fish)}`;
        }
    });
}

// Tank-specific report handler using shared utilities  
function handleReport(fishId, button) {
    handleReportGeneric(fishId, button);
}

// Make functions globally available for onclick handlers
window.handleVote = handleVote;
window.handleReport = handleReport;

function showModal(html, onClose) {
    let modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.background = 'white';
    modalContent.style.margin = '100px auto';
    modalContent.style.padding = '20px';
    modalContent.style.width = 'auto';
    modalContent.style.minWidth = '300px';
    modalContent.style.maxWidth = '90vw';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.borderRadius = '10px';
    modalContent.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    modalContent.style.overflow = 'auto';
    modalContent.innerHTML = html;
    
    modal.appendChild(modalContent);
    
    function close() {
        document.body.removeChild(modal);
        if (onClose) onClose();
    }
    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });
    document.body.appendChild(modal);
    return { close, modal };
}

function handleTankTap(e) {
    let rect = swimCanvas.getBoundingClientRect();
    let tapX, tapY;
    if (e.touches && e.touches.length > 0) {
        tapX = e.touches[0].clientX - rect.left;
        tapY = e.touches[0].clientY - rect.top;
    } else {
        tapX = e.clientX - rect.left;
        tapY = e.clientY - rect.top;
    }
    const radius = 120;
    fishes.forEach(fish => {
        const fx = fish.x + fish.width / 2;
        const fy = fish.y + fish.height / 2;
        const dx = fx - tapX;
        const dy = fy - tapY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radius) {
            const force = 16 * (1 - dist / radius);
            const norm = Math.sqrt(dx * dx + dy * dy) || 1;
            fish.vx = (dx / norm) * force;
            fish.vy = (dy / norm) * force;
            fish.direction = dx > 0 ? 1 : -1;
        }
    });
}

function handleFishTap(e) {
    let rect = swimCanvas.getBoundingClientRect();
    let tapX, tapY;
    if (e.touches && e.touches.length > 0) {
        tapX = e.touches[0].clientX - rect.left;
        tapY = e.touches[0].clientY - rect.top;
    } else {
        tapX = e.clientX - rect.left;
        tapY = e.clientY - rect.top;
    }
    for (let i = fishes.length - 1; i >= 0; i--) {
        const fish = fishes[i];
        if (
            tapX >= fish.x && tapX <= fish.x + fish.width &&
            tapY >= fish.y && tapY <= fish.y + fish.height
        ) {
            showFishInfoModal(fish);
            return;
        }
    }
    handleTankTap(e);
}

swimCanvas.addEventListener('mousedown', handleFishTap);
swimCanvas.addEventListener('touchstart', handleFishTap);

function resizeForMobile() {
    const oldWidth = swimCanvas.width;
    const oldHeight = swimCanvas.height;

    swimCanvas.width = window.innerWidth;
    swimCanvas.height = window.innerHeight;
    swimCanvas.style.width = '100vw';
    swimCanvas.style.height = '100vh';
    swimCanvas.style.maxWidth = '100vw';
    swimCanvas.style.maxHeight = '100vh';

    // If canvas size changed significantly, rescale all fish
    const widthChange = Math.abs(oldWidth - swimCanvas.width) / oldWidth;
    const heightChange = Math.abs(oldHeight - swimCanvas.height) / oldHeight;

    // Rescale if size changed by more than 20%
    if (widthChange > 0.2 || heightChange > 0.2) {
        rescaleAllFish();
    }
}
window.addEventListener('resize', resizeForMobile);
resizeForMobile();

function animateFishes() {
    swimCtx.clearRect(0, 0, swimCanvas.width, swimCanvas.height);
    const time = Date.now() / 500;
    
    // Update fish count display occasionally
    if (Math.floor(time) % 2 === 0) { // Every 2 seconds
        updateCurrentFishCount();
    }
    
    for (const fish of fishes) {
        // Handle entrance animation
        if (fish.isEntering) {
            const elapsed = Date.now() - fish.enterStartTime;
            const progress = Math.min(elapsed / fish.enterDuration, 1);
            
            // Fade in and scale up
            fish.opacity = progress;
            fish.scale = 0.3 + (progress * 0.7); // Scale from 0.3 to 1.0
            
            // Remove entrance flag when done
            if (progress >= 1) {
                fish.isEntering = false;
                fish.opacity = 1;
                fish.scale = 1;
            }
        }
        
        // Handle death animation
        if (fish.isDying) {
            const elapsed = Date.now() - fish.deathStartTime;
            const progress = Math.min(elapsed / fish.deathDuration, 1);
            
            // Fade out
            fish.opacity = 1 - progress;
            
            // Fall down
            fish.y = fish.originalY + (progress * progress * 200); // Accelerating fall
            
            // Slow down horizontal movement
            fish.speed = fish.speed * (1 - progress * 0.5);
        } else if (!fish.isEntering) {
            // Normal fish behavior (only if not entering)
            if (fish.vx || fish.vy) {
                fish.x += fish.vx;
                fish.y += fish.vy;
                fish.vx *= 0.92;
                fish.vy *= 0.92;
                if (Math.abs(fish.vx) < 0.5) fish.vx = 0;
                if (Math.abs(fish.vy) < 0.5) fish.vy = 0;
            } else {
                fish.x += fish.speed * fish.direction;
            }
            
            if (fish.x > swimCanvas.width - fish.width || fish.x < 0) {
                fish.direction *= -1;
            }
            fish.x = Math.max(0, Math.min(swimCanvas.width - fish.width, fish.x));
            fish.y = Math.max(0, Math.min(swimCanvas.height - fish.height, fish.y));
        }
        
        const swimY = fish.isDying ? fish.y : fish.y + Math.sin(time + fish.phase) * fish.amplitude;
        drawWigglingFish(fish, fish.x, swimY, fish.direction, time, fish.phase);
    }
    requestAnimationFrame(animateFishes);
}

function drawWigglingFish(fish, x, y, direction, time, phase) {
    const src = fish.fishCanvas;
    const w = fish.width;
    const h = fish.height;
    const tailEnd = Math.floor(w * fish.peduncle);
    
    // Set opacity for dying or entering fish
    if ((fish.isDying || fish.isEntering) && fish.opacity !== undefined) {
        swimCtx.globalAlpha = fish.opacity;
    }
    
    // Calculate scale for entering fish
    const scale = fish.scale || 1;
    
    for (let i = 0; i < w; i++) {
        let isTail, t, wiggle, drawCol, drawX;
        if (direction === 1) {
            isTail = i < tailEnd;
            t = isTail ? (tailEnd - i - 1) / (tailEnd - 1) : 0;
            wiggle = isTail ? Math.sin(time * 3 + phase + t * 2) * t * 12 : 0;
            drawCol = i;
            drawX = x + i + wiggle;
        } else {
            isTail = i >= w - tailEnd;
            t = isTail ? (i - (w - tailEnd)) / (tailEnd - 1) : 0;
            wiggle = isTail ? Math.sin(time * 3 + phase + t * 2) * t * 12 : 0;
            drawCol = w - i - 1;
            drawX = x + i - wiggle;
        }
        swimCtx.save();
        swimCtx.translate(drawX, y);
        
        // Apply scale for entering fish
        if (fish.isEntering && scale !== 1) {
            swimCtx.scale(scale, scale);
        }
        
        // Flip upside down for dying fish
        if (fish.isDying) {
            swimCtx.scale(1, -1);
        }
        
        swimCtx.drawImage(src, drawCol, 0, 1, h, 0, 0, 1, h);
        swimCtx.restore();
    }
    
    // Reset opacity
    if ((fish.isDying || fish.isEntering) && fish.opacity !== undefined) {
        swimCtx.globalAlpha = 1;
    }
}
requestAnimationFrame(animateFishes);
