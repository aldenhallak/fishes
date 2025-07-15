// Fish Tank Only JS
// This file contains only the logic for displaying and animating the fish tank.

const swimCanvas = document.getElementById('swim-canvas');
const swimCtx = swimCanvas.getContext('2d');
const fishes = [];

// Food system
const foodPellets = [];
const FOOD_SIZE = 8; // Increased size for better visibility
const FOOD_FALL_SPEED = .01;
const FOOD_DETECTION_RADIUS = 200; // Moderate detection radius
const FOOD_LIFESPAN = 15000; // 15 seconds
const FOOD_ATTRACTION_FORCE = 0.003; // Moderate attraction force

// Food pellet creation and management
function createFoodPellet(x, y) {
    return {
        x: x,
        y: y,
        vy: 0, // Initial vertical velocity
        createdAt: Date.now(),
        consumed: false,
        size: FOOD_SIZE
    };
}

function dropFoodPellet(x, y) {
    // Create a small cluster of food pellets for more realistic feeding
    const pelletCount = Math.floor(Math.random() * 3) + 2; // 2-4 pellets
    for (let i = 0; i < pelletCount; i++) {
        const offsetX = (Math.random() - 0.5) * 20; // Spread pellets around click point
        const offsetY = (Math.random() - 0.5) * 10;
        foodPellets.push(createFoodPellet(x + offsetX, y + offsetY));
    }
    
    // Add visual feedback for feeding
    createFeedingEffect(x, y);
}

function createFeedingEffect(x, y) {
    // Create a small splash effect when food is dropped
    const effect = {
        x: x,
        y: y,
        particles: [],
        createdAt: Date.now(),
        duration: 300,
        type: 'feeding'
    };
    
    // Create small splash particles
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        effect.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            life: 1
        });
    }
    
    // Store effect for rendering
    if (!window.feedingEffects) window.feedingEffects = [];
    window.feedingEffects.push(effect);
}

function updateFoodPellets() {
    for (let i = foodPellets.length - 1; i >= 0; i--) {
        const pellet = foodPellets[i];
        
        // Remove consumed or expired pellets
        if (pellet.consumed || Date.now() - pellet.createdAt > FOOD_LIFESPAN) {
            foodPellets.splice(i, 1);
            continue;
        }
        
        // Apply gravity
        pellet.vy += FOOD_FALL_SPEED; // Slower gravity acceleration
        pellet.y += pellet.vy;
        
        // Stop at bottom of tank
        if (pellet.y > swimCanvas.height - pellet.size) {
            pellet.y = swimCanvas.height - pellet.size;
            pellet.vy = 0;
        }
        
        // Check for fish consumption
        for (let fish of fishes) {
            if (fish.isDying || fish.isEntering) continue;
            
            const fishCenterX = fish.x + fish.width / 2;
            const fishCenterY = fish.y + fish.height / 2;
            const dx = pellet.x - fishCenterX;
            const dy = pellet.y - fishCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If fish is close enough, consume the pellet
            if (distance < fish.width / 2 + pellet.size) {
                pellet.consumed = true;
                // Add a small visual effect when food is consumed
                createFoodConsumptionEffect(pellet.x, pellet.y);
                break;
            }
        }
    }
}

function createFoodConsumptionEffect(x, y) {
    // Create a small particle effect when food is consumed
    const effect = {
        x: x,
        y: y,
        particles: [],
        createdAt: Date.now(),
        duration: 500
    };
    
    // Create small particles
    for (let i = 0; i < 5; i++) {
        effect.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1
        });
    }
    
    // Store effect for rendering (we'll add this to the animation loop)
    if (!window.foodEffects) window.foodEffects = [];
    window.foodEffects.push(effect);
}

function renderFoodPellets() {
    if (foodPellets.length > 0) {
        swimCtx.fillStyle = '#FF6B35'; // Orange color for better visibility
        
        for (const pellet of foodPellets) {
            if (!pellet.consumed) {
                swimCtx.beginPath();
                swimCtx.arc(pellet.x, pellet.y, pellet.size, 0, Math.PI * 2);
                swimCtx.fill();
            }
        }
    }
}

function renderFoodEffects() {
    if (!window.foodEffects) return;
    
    for (let i = window.foodEffects.length - 1; i >= 0; i--) {
        const effect = window.foodEffects[i];
        const elapsed = Date.now() - effect.createdAt;
        const progress = elapsed / effect.duration;
        
        if (progress >= 1) {
            window.foodEffects.splice(i, 1);
            continue;
        }
        
        swimCtx.save();
        swimCtx.globalAlpha = 1 - progress;
        swimCtx.fillStyle = '#FFD700'; // Gold color for consumption effect
        
        for (const particle of effect.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98; // Slight drag
            particle.vy *= 0.98;
            
            swimCtx.beginPath();
            swimCtx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
            swimCtx.fill();
        }
        
        swimCtx.restore();
    }
}

function renderFeedingEffects() {
    if (!window.feedingEffects) return;
    
    for (let i = window.feedingEffects.length - 1; i >= 0; i--) {
        const effect = window.feedingEffects[i];
        const elapsed = Date.now() - effect.createdAt;
        const progress = elapsed / effect.duration;
        
        if (progress >= 1) {
            window.feedingEffects.splice(i, 1);
            continue;
        }
        
        swimCtx.save();
        swimCtx.globalAlpha = 1 - progress;
        swimCtx.fillStyle = '#4CAF50'; // Green color for feeding effect
        
        for (const particle of effect.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.95; // Slight drag
            particle.vy *= 0.95;
            
            swimCtx.beginPath();
            swimCtx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            swimCtx.fill();
        }
        
        swimCtx.restore();
    }
}

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
            const direction = Math.random() < 0.5 ? -1 : 1;
            const speed = fishData.speed || 2;
            const fishObj = createFishObject({
                fishCanvas: displayCanvas,
                x,
                y,
                direction: direction,
                phase: fishData.phase || 0,
                amplitude: fishData.amplitude || 32,
                speed: speed,
                vx: speed * direction * 0.1, // Initialize with base velocity
                vy: (Math.random() - 0.5) * 0.5, // Small random vertical velocity
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
                
        // Get references to fish that are not already dying
        const aliveFish = fishes.filter(f => !f.isDying);
        
        // Only remove the excess amount, not all fish
        const fishToRemove = aliveFish.slice(0, excessCount);
                
        // Stagger the death animations to avoid overwhelming the system
        fishToRemove.forEach((fishObj, i) => {
            setTimeout(() => {
                // Find the current index of this fish object
                const currentIndex = fishes.indexOf(fishObj);
                if (currentIndex !== -1 && !fishObj.isDying) {
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
    
    // Check if this is a feeding action (right click, or shift+click, or double tap)
    const isFeeding = e.button === 2 || e.shiftKey || e.ctrlKey || e.metaKey;
    
    if (isFeeding) {
        // Drop food pellets
        dropFoodPellet(tapX, tapY);
        e.preventDefault(); // Prevent context menu on right click
        return;
    }
    
    // Original scare behavior
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

// Add right-click support for feeding
swimCanvas.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // Prevent context menu
    handleTankTap(e);
});

// Enhanced mobile touch support
let lastTapTime = 0;
let touchStartTime = 0;
let touchStartPos = { x: 0, y: 0 };

// Handle touch start for long press detection and fish interaction
swimCanvas.addEventListener('touchstart', (e) => {
    touchStartTime = Date.now();
    const rect = swimCanvas.getBoundingClientRect();
    touchStartPos = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
    };
    
    // Also handle fish tap detection on touch start
    handleFishTap(e);
});

// Handle touch end for double tap and long press
swimCanvas.addEventListener('touchend', (e) => {
    e.preventDefault(); // Prevent default mobile behavior
    const currentTime = Date.now();
    const touchDuration = currentTime - touchStartTime;
    const rect = swimCanvas.getBoundingClientRect();
    const tapX = e.changedTouches[0].clientX - rect.left;
    const tapY = e.changedTouches[0].clientY - rect.top;
    
    // Check if finger moved significantly during touch
    const moveDistance = Math.sqrt(
        Math.pow(tapX - touchStartPos.x, 2) + 
        Math.pow(tapY - touchStartPos.y, 2)
    );
    
    // Long press for feeding (500ms+ and minimal movement)
    if (touchDuration >= 500 && moveDistance < 20) {
        dropFoodPellet(tapX, tapY);
        return;
    }
    
    // Double tap for feeding
    if (currentTime - lastTapTime < 300 && moveDistance < 20) { // Double tap within 300ms
        dropFoodPellet(tapX, tapY);
        return;
    }
    
    lastTapTime = currentTime;
});

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

// Optimize performance by caching food detection calculations
let foodDetectionCache = new Map();
let cacheUpdateCounter = 0;

function animateFishes() {
    swimCtx.clearRect(0, 0, swimCanvas.width, swimCanvas.height);
    const time = Date.now() / 500;
    
    // Update fish count display occasionally
    if (Math.floor(time) % 2 === 0) { // Every 2 seconds
        updateCurrentFishCount();
    }
    
    // Update food pellets
    updateFoodPellets();
    
    // Clear food detection cache every few frames to prevent stale data
    cacheUpdateCounter++;
    if (cacheUpdateCounter % 5 === 0) {
        foodDetectionCache.clear();
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
            
            // Use cached food detection to improve performance
            const fishId = fish.docId || `fish_${fishes.indexOf(fish)}`;
            let foodDetectionData = foodDetectionCache.get(fishId);
            
            if (!foodDetectionData) {
                // Calculate food detection data and cache it
                const fishCenterX = fish.x + fish.width / 2;
                const fishCenterY = fish.y + fish.height / 2;
                
                let nearestFood = null;
                let nearestDistance = FOOD_DETECTION_RADIUS;
                let hasNearbyFood = false;
                
                // Optimize: Only check active food pellets
                const activePellets = foodPellets.filter(p => !p.consumed);
                
                // Find nearest food pellet using more efficient distance calculation
                for (const pellet of activePellets) {
                    const dx = pellet.x - fishCenterX;
                    const dy = pellet.y - fishCenterY;
                    
                    // Use squared distance for initial comparison (more efficient)
                    const distanceSquared = dx * dx + dy * dy;
                    const radiusSquared = FOOD_DETECTION_RADIUS * FOOD_DETECTION_RADIUS;
                    
                    if (distanceSquared < radiusSquared) {
                        hasNearbyFood = true;
                        
                        // Only calculate actual distance if within radius
                        const distance = Math.sqrt(distanceSquared);
                        if (distance < nearestDistance) {
                            nearestFood = pellet;
                            nearestDistance = distance;
                        }
                    }
                }
                
                foodDetectionData = {
                    nearestFood,
                    nearestDistance,
                    hasNearbyFood,
                    fishCenterX,
                    fishCenterY
                };
                
                foodDetectionCache.set(fishId, foodDetectionData);
            }
            
            // Initialize velocity if not set
            if (!fish.vx) fish.vx = 0;
            if (!fish.vy) fish.vy = 0;
            
            // Always apply base swimming movement
            fish.vx += fish.speed * fish.direction * 0.1; // Continuous base movement
            
            // Apply food attraction using cached data
            if (foodDetectionData.nearestFood) {
                const dx = foodDetectionData.nearestFood.x - foodDetectionData.fishCenterX;
                const dy = foodDetectionData.nearestFood.y - foodDetectionData.fishCenterY;
                const distance = foodDetectionData.nearestDistance;
                
                if (distance > 0) {
                    // Calculate attraction force (stronger when closer, with smooth falloff)
                    const distanceRatio = distance / FOOD_DETECTION_RADIUS;
                    const attractionStrength = FOOD_ATTRACTION_FORCE * (1 - distanceRatio * distanceRatio);
                    
                    // Apply force towards food more gently
                    fish.vx += (dx / distance) * attractionStrength;
                    fish.vy += (dy / distance) * attractionStrength;
                    
                    // Update fish direction to face the food (but not too abruptly)
                    if (Math.abs(dx) > 10) { // Only change direction if food is significantly left/right
                        fish.direction = dx > 0 ? 1 : -1;
                    }
                }
            }
            
            // Always move based on velocity
            fish.x += fish.vx;
            fish.y += fish.vy;
            
            // Handle edge collisions BEFORE applying friction
            let hitEdge = false;
            
            // Left and right edges
            if (fish.x <= 0) {
                fish.x = 0;
                fish.direction = 1; // Face right
                fish.vx = Math.abs(fish.vx); // Ensure velocity points right
                hitEdge = true;
            } else if (fish.x >= swimCanvas.width - fish.width) {
                fish.x = swimCanvas.width - fish.width;
                fish.direction = -1; // Face left
                fish.vx = -Math.abs(fish.vx); // Ensure velocity points left
                hitEdge = true;
            }
            
            // Top and bottom edges
            if (fish.y <= 0) {
                fish.y = 0;
                fish.vy = Math.abs(fish.vy) * 0.5; // Bounce off top, but gently
                hitEdge = true;
            } else if (fish.y >= swimCanvas.height - fish.height) {
                fish.y = swimCanvas.height - fish.height;
                fish.vy = -Math.abs(fish.vy) * 0.5; // Bounce off bottom, but gently
                hitEdge = true;
            }
            
            // Apply friction - less when attracted to food
            const frictionFactor = foodDetectionData.hasNearbyFood ? 0.88 : 0.85;
            fish.vx *= frictionFactor;
            fish.vy *= frictionFactor;
            
            // Limit velocity to prevent fish from moving too fast
            const maxVel = fish.speed * 2;
            const velMag = Math.sqrt(fish.vx * fish.vx + fish.vy * fish.vy);
            if (velMag > maxVel) {
                fish.vx = (fish.vx / velMag) * maxVel;
                fish.vy = (fish.vy / velMag) * maxVel;
            }
            
            // Ensure minimum movement to prevent complete stops
            if (Math.abs(fish.vx) < 0.1) {
                fish.vx = fish.speed * fish.direction * 0.1;
            }
            
            // If fish hit an edge, give it a small push away from the edge
            if (hitEdge) {
                fish.vx += fish.speed * fish.direction * 0.2;
                // Add small random vertical component to avoid getting stuck
                fish.vy += (Math.random() - 0.5) * 0.3;
            }
        }
        
        // Calculate swim position - reduce sine wave when fish is attracted to food
        let swimY;
        if (fish.isDying) {
            swimY = fish.y;
        } else {
            // Use cached food detection data for swim animation
            const fishId = fish.docId || `fish_${fishes.indexOf(fish)}`;
            const foodDetectionData = foodDetectionCache.get(fishId);
            const hasNearbyFood = foodDetectionData ? foodDetectionData.hasNearbyFood : false;
            
            // Reduce sine wave amplitude when attracted to food for more realistic movement
            const currentAmplitude = hasNearbyFood ? fish.amplitude * 0.3 : fish.amplitude;
            swimY = fish.y + Math.sin(time + fish.phase) * currentAmplitude;
        }
        
        drawWigglingFish(fish, fish.x, swimY, fish.direction, time, fish.phase);
    }
    
    // Render food pellets
    renderFoodPellets();
    
    // Render food consumption effects
    renderFoodEffects();
    
    // Render feeding effects
    renderFeedingEffects();
    
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
