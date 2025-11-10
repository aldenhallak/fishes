// Fish Tank Only JS
// This file contains only the logic for displaying and animating the fish tank.

const swimCanvas = document.getElementById('swim-canvas');
const swimCtx = swimCanvas.getContext('2d');
const fishes = [];

// Export fishes array to window for external access
window.fishes = fishes;
window.currentUser = null;

// Initialize Fish Dialogue System (Phase 0)
let fishDialogueManager = null;
if (typeof SimpleFishDialogueManager !== 'undefined') {
    fishDialogueManager = new SimpleFishDialogueManager(swimCanvas, swimCtx);
    console.log('✅ Fish dialogue system initialized');
}

// Initialize Tank Layout Manager (Community Chat System)
let tankLayoutManager = null;
let communityChatManager = null;
if (typeof TankLayoutManager !== 'undefined') {
    tankLayoutManager = new TankLayoutManager(swimCanvas, swimCtx);
    communityChatManager = new CommunityChatManager(tankLayoutManager, fishes);
    
    // Export to window for testing and external access
    window.tankLayoutManager = tankLayoutManager;
    window.communityChatManager = communityChatManager;
    
    console.log('✅ Tank Layout Manager initialized');
    console.log('✅ Community Chat Manager initialized');
    
    // Initialize group chat based on environment variable and user preference
    initializeGroupChat();
}

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
    // Create a colorful splash effect when food is dropped
    const effect = {
        x: x,
        y: y,
        particles: [],
        createdAt: Date.now(),
        duration: 500,
        type: 'feeding'
    };

    // Create purple splash particles
    const colors = ['#6366F1', '#A5B4FC', '#C7D2FE', '#EEF2FF'];
    for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        const velocity = Math.random() * 3 + 2;
        effect.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            life: 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 4 + 2
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

        for (const particle of effect.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.96; // Slight drag
            particle.vy *= 0.96;

            // Use particle's own color
            swimCtx.fillStyle = particle.color || '#4CAF50';
            swimCtx.beginPath();
            swimCtx.arc(particle.x, particle.y, particle.size || 2, 0, Math.PI * 2);
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
    userId = null,
    // Community Chat System properties
    id = null,
    fishName = null,
    personality = null,
    // Legacy battle properties
    health = 100,
    level = 1,
    experience = 0,
    attack = 10,
    defense = 5
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
        userId,
        // Community Chat System properties
        id,
        fishName,
        personality,
        // Legacy battle properties
        health,
        level,
        experience,
        attack,
        defense
    };
}

function loadFishImageToTank(imgUrl, fishData, onDone) {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    
    img.onerror = function() {
        console.error(`Failed to load fish image: ${imgUrl}`);
        if (onDone) onDone();
    };
    
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
                userId: fishData.userId || fishData.UserId || fishData.user_id || null,
                // Community Chat System properties
                id: fishData.id || fishData.docId || null,
                fishName: fishData.fish_name || null,
                personality: fishData.personality || null,
                // Legacy battle properties (kept for compatibility)
                health: fishData.health !== undefined ? fishData.health : 100,
                level: fishData.level || 1,
                experience: fishData.experience || 0,
                attack: fishData.attack || 10,
                defense: fishData.defense || 5
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
let maxTankCapacity = 20; // Dynamic tank capacity controlled by slider
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

        // Get references to fish that are not already dying, sorted by creation date (oldest first)
        const aliveFish = fishes.filter(f => !f.isDying).sort((a, b) => {
            const dateA = a.createdAt;
            const dateB = b.createdAt;
            if (!dateA && !dateB) return 0;
            if (!dateA) return -1; // Fish without creation date go first
            if (!dateB) return 1;
            
            // Handle both Date objects and string timestamps
            const timeA = dateA instanceof Date ? dateA.getTime() : new Date(dateA).getTime();
            const timeB = dateB instanceof Date ? dateB.getTime() : new Date(dateB).getTime();
            
            return timeA - timeB; // Oldest first
        });

        // Remove the oldest fish first
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

            // Handle different possible backend API formats
            let data, fishId;

            if (typeof doc.data === 'function') {
                // Firestore-style document with data() function
                data = doc.data();
                fishId = doc.id;
            } else if (doc.data && typeof doc.data === 'object') {
                // Backend returns {id: '...', data: {...}}
                data = doc.data;
                fishId = doc.id;
            } else if (doc.id && (doc.image || doc.Image)) {
                // Backend returns fish data directly as properties
                data = doc;
                fishId = doc.id;
            } else {
                // Unknown format, skip
                continue;
            }

            // Skip if data is still undefined or null
            if (!data) {
                continue;
            }

            const imageUrl = data.image || data.Image; // Try lowercase first, then uppercase

            // Skip if invalid image or already exists
            if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
                continue;
            }

            if (existingIds.has(fishId)) {
                continue;
            }

            loadFishImageToTank(imageUrl, {
                ...data,
                docId: fishId
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
        console.log(`🐠 Loading ${maxTankCapacity} fish with sort type: ${sortType}`);
        const allFishDocs = await getFishBySort(sortType, maxTankCapacity); // Load based on current capacity
        console.log(`🐠 Received ${allFishDocs ? allFishDocs.length : 0} fish documents`);

        // Track the newest timestamp for the listener
        if (allFishDocs.length > 0) {
            const sortedByDate = allFishDocs.filter(doc => {
                // Handle different possible backend API formats for filtering
                let data;
                if (typeof doc.data === 'function') {
                    data = doc.data();
                } else if (doc.data && typeof doc.data === 'object') {
                    data = doc.data;
                } else if (doc.id && (doc.image || doc.Image)) {
                    data = doc;
                } else {
                    return false;
                }
                return data && (data.CreatedAt || data.createdAt);
            }).sort((a, b) => {
                // Handle backend response format - fish data may need extraction
                let aData, bData;
                if (typeof a.data === 'function') {
                    aData = a.data();
                } else if (a.data && typeof a.data === 'object') {
                    aData = a.data;
                } else {
                    aData = a;
                }

                if (typeof b.data === 'function') {
                    bData = b.data();
                } else if (b.data && typeof b.data === 'object') {
                    bData = b.data;
                } else {
                    bData = b;
                }

                const aDate = aData.CreatedAt || aData.createdAt;
                const bDate = bData.CreatedAt || bData.createdAt;

                // Handle both Date objects and ISO strings
                const aTime = aDate instanceof Date ? aDate.getTime() : new Date(aDate).getTime();
                const bTime = bDate instanceof Date ? bDate.getTime() : new Date(bDate).getTime();

                return bTime - aTime;
            });

            if (sortedByDate.length > 0) {
                const newestFish = sortedByDate[0];
                let newestData;
                if (typeof newestFish.data === 'function') {
                    newestData = newestFish.data();
                } else if (newestFish.data && typeof newestFish.data === 'object') {
                    newestData = newestFish.data;
                } else {
                    newestData = newestFish;
                }
                newestFishTimestamp = newestData.CreatedAt || newestData.createdAt;
            }
        }

        allFishDocs.forEach((doc, index) => {

            // Handle different possible backend API formats
            let data, fishId;

            if (typeof doc.data === 'function') {
                // Firestore-style document with data() function
                data = doc.data();
                fishId = doc.id;
            } else if (doc.data && typeof doc.data === 'object') {
                // Backend returns {id: '...', data: {...}}
                data = doc.data;
                fishId = doc.id;
            } else if (doc.id && (doc.image || doc.Image)) {
                // Backend returns fish data directly as properties
                data = doc;
                fishId = doc.id;
            } else {
                // Unknown format
                console.warn('Skipping fish with unknown format:', doc);
                return;
            }

            // Skip if data is still undefined or null
            if (!data) {
                console.warn('Skipping fish with no data after extraction:', fishId, doc);
                return;
            }

            const imageUrl = data.image || data.Image; // Try lowercase first, then uppercase
            if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
                console.warn('Skipping fish with invalid image:', fishId, data);
                return;
            }
            loadFishImageToTank(imageUrl, {
                ...data,
                docId: fishId
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
        
        // Assign fish to rows for community chat layout (wait for images to load)
        if (tankLayoutManager) {
            setTimeout(() => {
                tankLayoutManager.assignFishToRows(fishes);
                console.log(`✅ Assigned ${fishes.length} fish to ${tankLayoutManager.rows.length} rows`);
            }, 1000); // Wait 1 second for images to load
        }
    }
}

// Set up periodic polling instead of real-time listener to reduce costs
function setupNewFishListener() {
    // Remove existing listener if any
    if (newFishListener) {
        clearInterval(newFishListener);
        newFishListener = null;
    }

    // Use polling every 30 seconds instead of real-time listener
    newFishListener = setInterval(async () => {
        try {
            await checkForNewFish();
        } catch (error) {
            console.error('Error checking for new fish:', error);
        }
    }, 30000); // Poll every 30 seconds
}

// Check for new fish using backend API instead of real-time listener
async function checkForNewFish() {
    try {
        // 使用getFishBySort获取最新的鱼，确保使用正确的后端
        const newFishDocs = await getFishBySort('recent', 5, null, 'desc', null);
        
        // 转换为后端API格式
        const data = { data: newFishDocs };

        data.data.forEach((fishItem) => {
            // Handle different possible backend API formats
            let fishData, fishId;

            if (typeof fishItem.data === 'function') {
                // Firestore-style document with data() function
                fishData = fishItem.data();
                fishId = fishItem.id;
            } else if (fishItem.data && typeof fishItem.data === 'object') {
                // Backend returns {id: '...', data: {...}}
                fishData = fishItem.data;
                fishId = fishItem.id;
            } else if (fishItem.id && (fishItem.image || fishItem.Image)) {
                // Backend returns fish data directly as properties
                fishData = fishItem;
                fishId = fishItem.id;
            } else {
                // Unknown format
                console.warn('Skipping fish with unknown format in checkForNewFish:', fishItem);
                return;
            }

            // Skip if data is still undefined or null
            if (!fishData) {
                console.warn('Skipping fish with no data in checkForNewFish:', fishId, fishItem);
                return;
            }

            const imageUrl = fishData.image || fishData.Image; // Try lowercase first, then uppercase

            if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
                console.warn('Skipping fish with invalid image:', fishId, fishData);
                return;
            }

            // Only add if we haven't seen this fish before
            if (!fishes.some(f => f.docId === fishId)) {
                // Update newest timestamp
                const fishDate = fishData.CreatedAt || fishData.createdAt;
                if (!newestFishTimestamp || (fishDate && new Date(fishDate) > new Date(newestFishTimestamp))) {
                    newestFishTimestamp = fishDate;
                }

                // If at capacity, animate death of oldest fish, then add new one
                if (fishes.length >= maxTankCapacity) {
                    // Find the oldest fish by creation date (excluding dying fish)
                    const aliveFish = fishes.filter(f => !f.isDying);
                    let oldestFishIndex = -1;
                    let oldestDate = null;

                    aliveFish.forEach((fish, index) => {
                        const fishDate = fish.createdAt;
                        if (!oldestDate) {
                            // First fish or no previous date found
                            oldestDate = fishDate;
                            oldestFishIndex = fishes.indexOf(fish);
                        } else if (!fishDate) {
                            // Fish without creation date should be considered oldest
                            oldestDate = null;
                            oldestFishIndex = fishes.indexOf(fish);
                        } else if (oldestDate && new Date(fishDate) < new Date(oldestDate)) {
                            // Found an older fish
                            oldestDate = fishDate;
                            oldestFishIndex = fishes.indexOf(fish);
                        }
                    });

                    if (oldestFishIndex !== -1) {
                        animateFishDeath(oldestFishIndex, () => {
                            // After death animation completes, add new fish
                            loadFishImageToTank(imageUrl, {
                                ...fishData,
                                docId: fishId
                            }, (newFish) => {
                                // Show subtle notification
                                showNewFishNotification(fishData.Artist || fishData.artist || 'Anonymous');
                            });
                        });
                    }
                } else {
                    // Tank not at capacity, add fish immediately
                    loadFishImageToTank(imageUrl, {
                        ...fishData,
                        docId: fishId
                    }, (newFish) => {
                        // Show subtle notification
                        showNewFishNotification(fishData.Artist || fishData.artist || 'Anonymous');
                    });
                }
            }
        });
    } catch (error) {
        console.error('Error checking for new fish:', error);
    }
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

    // Initialize capacity from URL parameter (if present), otherwise use default (20)
    if (capacityParam) {
        const capacity = parseInt(capacityParam);
        if (capacity >= 1 && capacity <= 100) {
            maxTankCapacity = capacity;
        }
    } else {
        // No URL parameter, ensure we use the default value (20)
        maxTankCapacity = 20;
    }
    
    // Ensure slider and display are synchronized with maxTankCapacity
    let fishCountSlider = document.getElementById('fish-count-slider');
    if (fishCountSlider) {
        fishCountSlider.value = maxTankCapacity;
    }
    
    const displayElement = document.getElementById('fish-count-display');
    if (displayElement) {
        displayElement.textContent = maxTankCapacity;
    }
    
    console.log(`🐠 Initialized tank capacity: ${maxTankCapacity}`);
    console.log(`🐠 About to load fish with capacity: ${maxTankCapacity}`);

    // Update page title based on initial selection
    updatePageTitle(initialSort);

    // Handle sort change
    sortSelect.addEventListener('change', () => {
        const selectedSort = sortSelect.value;

        // Clean up existing listener before switching modes
        if (newFishListener) {
            clearInterval(newFishListener);
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

    // Handle fish count slider (reuse the variable declared above)
    if (!fishCountSlider) {
        fishCountSlider = document.getElementById('fish-count-slider');
    }
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

        // Initialize the display (but don't reload fish, just update UI)
        const displayElement = document.getElementById('fish-count-display');
        if (displayElement) {
            displayElement.textContent = maxTankCapacity;
        }
    }

    // Load initial fish based on URL parameter or default
    await loadFishIntoTank(initialSort);
    
    // Update fish count display after initial load
    setTimeout(() => {
        updateCurrentFishCount();
    }, 1000); // Wait 1 second for images to load

    // Clean up listener when page is unloaded
    window.addEventListener('beforeunload', () => {
        if (newFishListener) {
            clearInterval(newFishListener);
            newFishListener = null;
        }
    });
});

function showFishInfoModal(fish) {
    // Create higher resolution canvas for better image quality
    const canvasScaleFactor = 2; // Scale up canvas for better quality
    const fishImgCanvas = document.createElement('canvas');
    fishImgCanvas.width = fish.width * canvasScaleFactor;
    fishImgCanvas.height = fish.height * canvasScaleFactor;
    const ctx = fishImgCanvas.getContext('2d');
    
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Scale up the drawing
    ctx.scale(canvasScaleFactor, canvasScaleFactor);
    ctx.drawImage(fish.fishCanvas, 0, 0);
    
    // Use PNG format with higher quality
    const imgDataUrl = fishImgCanvas.toDataURL('image/png');

    // Scale display size for modal (higher quality, maintain aspect ratio)
    const displayScaleFactor = 3; // Display scale factor
    const baseWidth = Math.min(200, fish.width);
    const baseHeight = Math.min(150, fish.height);
    const modalWidth = baseWidth * displayScaleFactor;
    const modalHeight = baseHeight * displayScaleFactor;

    // Check if this is the user's fish
    const isCurrentUserFish = isUserFish(fish);
    const userToken = localStorage.getItem('userToken');
    const showFavoriteButton = userToken && !isCurrentUserFish;

    // Make artist name a clickable link to their profile if userId exists
    const artistName = fish.artist || 'Anonymous';
    const userId = fish.userId;
    const artistLink = userId 
        ? `<a href="profile.html?userId=${encodeURIComponent(userId)}" target="_blank" style="color: #4A90E2; text-decoration: none; font-weight: 700;">${escapeHtml(artistName)}</a>`
        : escapeHtml(artistName);

    let info = `<div class="fish-info-modal" style="background: linear-gradient(180deg, #F8F9FA 0%, #E8E8E8 100%); padding: 24px; border-radius: 16px;">`;

    // Add highlighting if this is the user's fish
    if (isCurrentUserFish) {
        info += `<div style='margin-bottom: 16px; padding: 10px; background: linear-gradient(135deg, #FFE55C 0%, #FFD700 50%, #E5BF00 100%); border: 3px solid #BFA000; border-radius: 12px; color: #5D4E00; font-weight: 900; font-size: 13px; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.2); text-align: center; text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);'>⭐ Your Fish</div>`;
    }

    // Fish image (no frame, direct display)
    info += `<div style="text-align: center; margin-bottom: 20px;">`;
    info += `<img src='${imgDataUrl}' width='${modalWidth}' height='${modalHeight}' style='display:block;margin:0 auto;image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;' alt='Fish'>`;
    info += `</div>`;

    // Fish info section (simplified, no background box)
    info += `<div style='margin-bottom: 12px; font-size: 13px; color: #666;'><strong style='color: #333;'>Artist:</strong> ${artistLink}</div>`;

    // Action buttons: Like, Favorite, Report (并列，样式一致)
    info += `<div class="voting-controls modal-controls" style="display: flex; gap: 12px; justify-content: center; margin-bottom: 20px;">`;
    
    // Like button
    info += `<button class="vote-btn upvote-btn" onclick="handleVote('${fish.docId}', 'up', this)" style="flex: 1; padding: 12px 16px; border: none; border-radius: 12px; background: linear-gradient(180deg, #6FE77D 0%, #4CD964 50%, #3CB54A 100%); border-bottom: 3px solid #2E8B3A; color: white; cursor: pointer; font-size: 14px; font-weight: 700; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25); transition: all 0.15s ease; display: flex; align-items: center; justify-content: center; gap: 6px;">`;
    info += `👍 <span class="vote-count upvote-count">${fish.upvotes || 0}</span>`;
    info += `</button>`;
    
    // Favorite button (only show if user is logged in and not their own fish)
    if (showFavoriteButton) {
        info += `<button class="favorite-btn" id="fav-btn-${fish.docId}" onclick="if(typeof handleFavoriteClick === 'function') handleFavoriteClick('${fish.docId}', event); else alert('收藏功能暂未实现');" style="flex: 1; padding: 12px 16px; border: none; border-radius: 12px; background: linear-gradient(180deg, #FFB340 0%, #FF9500 50%, #E67E00 100%); border-bottom: 3px solid #CC6E00; color: white; cursor: pointer; font-size: 14px; font-weight: 700; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25); transition: all 0.15s ease; display: flex; align-items: center; justify-content: center; gap: 6px;" title="Add to favorites">`;
        info += `⭐ Favorite`;
        info += `</button>`;
    }
    
    // Report button
    info += `<button class="report-btn" onclick="handleReport('${fish.docId}', this)" style="flex: 1; padding: 12px 16px; border: none; border-radius: 12px; background: linear-gradient(180deg, #FFE55C 0%, #FFD700 50%, #E5BF00 100%); border-bottom: 3px solid #BFA000; color: #5D4E00; cursor: pointer; font-size: 14px; font-weight: 700; text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5); box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25); transition: all 0.15s ease; display: flex; align-items: center; justify-content: center; gap: 6px;" title="Report inappropriate content">`;
    info += `🚩 Report`;
    info += `</button>`;
    
    info += `</div>`;

    // Add hover effects via CSS (will be handled by existing modal button styles)
    info += `<style>
        .modal-content .vote-btn:hover,
        .modal-content .favorite-btn:hover,
        .modal-content .report-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 0 rgba(0, 0, 0, 0.25);
        }
        .modal-content .vote-btn:active,
        .modal-content .favorite-btn:active,
        .modal-content .report-btn:active {
            transform: translateY(2px);
            box-shadow: 0 2px 0 rgba(0, 0, 0, 0.25);
        }
    </style>`;

    // Add messages section placeholder
    info += `<div id="fish-messages-container" style="margin-top: 20px; text-align: left;"></div>`;

    info += `</div>`;

    showModal(info, () => { });
    
    // Load messages after modal is shown
    setTimeout(() => {
        if (typeof MessageUI !== 'undefined' && fish.docId) {
            MessageUI.renderMessagesSection('fish-messages-container', 'to_fish', fish.docId, {
                showForm: true,
                showFishInfo: false,
                showDeleteBtn: true,
                title: '💬 Messages'
            });
        }
    }, 100);
}

// Tank-specific vote handler using shared utilities
function handleVote(fishId, voteType, button) {
    handleVoteGeneric(fishId, voteType, button, (result, voteType) => {
        // Find the fish in the fishes array and update it
        const fish = fishes.find(f => f.docId === fishId);
        if (fish) {
            // Update fish upvotes based on response
            if (result.upvotes !== undefined) {
                fish.upvotes = result.upvotes;
            } else if (result.updatedFish && result.updatedFish.upvotes !== undefined) {
                fish.upvotes = result.updatedFish.upvotes;
            } else if (result.action === 'upvote') {
                fish.upvotes = (fish.upvotes || 0) + 1;
            } else if (result.action === 'cancel_upvote') {
                fish.upvotes = Math.max(0, (fish.upvotes || 0) - 1);
            }

            // Update the modal display with new counts
            const upvoteCount = document.querySelector('.modal-controls .upvote-count');
            const upvotesDisplay = document.querySelector('.modal-upvotes');

            if (upvoteCount) upvoteCount.textContent = fish.upvotes || 0;
            if (upvotesDisplay) upvotesDisplay.textContent = fish.upvotes || 0;
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

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Add close button if not already present in HTML
    if (!html.includes('class="close"') && !html.includes("class='close'")) {
        modalContent.innerHTML = '<span class="close">&times;</span>' + html;
    } else {
        modalContent.innerHTML = html;
    }

    modal.appendChild(modalContent);

    function close() {
        document.body.removeChild(modal);
        if (onClose) onClose();
    }
    
    // Add close button click handler
    const closeBtn = modalContent.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', close);
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });
    document.body.appendChild(modal);
    return { close, modal };
}

function handleTankTap(e) {
    // 检查是否刚刚点击了鱼（防止事件延迟触发）
    if (window.lastFishClickTime && (Date.now() - window.lastFishClickTime) < 100) {
        return; // 100ms 内不执行移动逻辑
    }
    
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

    // 检查是否点击到了鱼，如果点击到了鱼就不执行移动逻辑
    const time = Date.now() / 500;
    for (let i = fishes.length - 1; i >= 0; i--) {
        const fish = fishes[i];
        if (fish.isDying) continue;

        const fishX = fish.x;
        let fishY = fish.y;

        // Account for swimming animation
        const foodDetectionData = foodDetectionCache.get(fish.docId || `fish_${i}`);
        const hasNearbyFood = foodDetectionData ? foodDetectionData.hasNearbyFood : false;
        const currentAmplitude = hasNearbyFood ? fish.amplitude * 0.3 : fish.amplitude;
        fishY = fish.y + Math.sin(time + fish.phase) * currentAmplitude;

        // Check if tap is within fish bounds (增加一些容差，避免边缘点击误判)
        const padding = 5; // 5像素容差
        if (
            tapX >= fishX - padding && tapX <= fishX + fish.width + padding &&
            tapY >= fishY - padding && tapY <= fishY + fish.height + padding
        ) {
            // 点击到了鱼，不执行移动逻辑，并阻止事件传播
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            // 记录点击时间，防止后续事件触发移动
            window.lastFishClickTime = Date.now();
            return;
        }
    }

    // Original scare behavior - 只在没有点击到鱼时执行
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

    // Handle different event types
    if (e.touches && e.touches.length > 0) {
        // Touch event with active touches
        tapX = e.touches[0].clientX - rect.left;
        tapY = e.touches[0].clientY - rect.top;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
        // Touch end event
        tapX = e.changedTouches[0].clientX - rect.left;
        tapY = e.changedTouches[0].clientY - rect.top;
    } else {
        // Mouse event
        tapX = e.clientX - rect.left;
        tapY = e.clientY - rect.top;
    }

    // Check if tap hit any fish (iterate from top to bottom)
    for (let i = fishes.length - 1; i >= 0; i--) {
        const fish = fishes[i];

        // Calculate fish position including any swimming animation
        const time = Date.now() / 500;
        const fishX = fish.x;
        let fishY = fish.y;

        // Account for swimming animation unless fish is dying
        if (!fish.isDying) {
            const foodDetectionData = foodDetectionCache.get(fish.docId || `fish_${i}`);
            const hasNearbyFood = foodDetectionData ? foodDetectionData.hasNearbyFood : false;
            const currentAmplitude = hasNearbyFood ? fish.amplitude * 0.3 : fish.amplitude;
            fishY = fish.y + Math.sin(time + fish.phase) * currentAmplitude;
        }

        // Check if tap is within fish bounds (增加容差，避免边缘点击误判)
        const padding = 5; // 5像素容差
        if (
            tapX >= fishX - padding && tapX <= fishX + fish.width + padding &&
            tapY >= fishY - padding && tapY <= fishY + fish.height + padding
        ) {
            // 点击到鱼时，阻止事件传播，只显示弹窗，不移动鱼
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation(); // 阻止所有后续事件处理器
            
            // 标记已点击鱼，防止后续事件触发移动
            const clickTimestamp = Date.now();
            window.lastFishClickTime = clickTimestamp;
            
            // 标记这条鱼被点击了，在动画循环中暂停移动和游泳动画
            fish.isClicked = true;
            fish.clickedAt = clickTimestamp;
            // 保存点击时的位置，用于固定游泳动画的Y坐标
            fish.clickedY = fish.y;
            fish.clickedSwimY = fishY; // 保存点击时的 swimY
            
            // 清除鱼的速度，让它停止移动
            fish.vx = 0;
            fish.vy = 0;
            
            // 延迟显示弹窗，确保事件完全处理完毕
            setTimeout(() => {
                showFishInfoModal(fish);
            }, 10);
            
            return; // Found a fish, don't handle tank tap
        }
    }

    // No fish was hit, handle tank tap
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

// Handle touch start for position tracking
swimCanvas.addEventListener('touchstart', (e) => {
    touchStartTime = Date.now();
    const rect = swimCanvas.getBoundingClientRect();
    touchStartPos = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
    };
});

// Handle touch end for fish interaction and feeding
swimCanvas.addEventListener('touchend', (e) => {
    e.preventDefault(); // Prevent default mobile behavior
    const currentTime = Date.now();
    const touchDuration = currentTime - touchStartTime;
    const rect = swimCanvas.getBoundingClientRect();
    const tapX = e.changedTouches[0].clientX - rect.left;
    const tapY = e.changedTouches[0].clientY - rect.top;

    // Debug logging for mobile touch issues

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

    // Single tap - check for fish interaction first, then handle tank tap
    // Create a mock event for handleFishTap with correct coordinates
    const mockEvent = {
        clientX: rect.left + tapX,
        clientY: rect.top + tapY,
        touches: null // Indicate this is from touch end
    };

    handleFishTap(mockEvent);

    lastTapTime = currentTime;
});

function resizeForMobile() {
    const isMobile = window.innerWidth <= 768;
    const oldWidth = swimCanvas.width;
    const oldHeight = swimCanvas.height;

    if (isMobile) {
        // Match the CSS dimensions for mobile
        swimCanvas.width = window.innerWidth;
        swimCanvas.height = window.innerHeight - 120; // Match calc(100vh - 120px)
        swimCanvas.style.width = '100vw';
        swimCanvas.style.height = 'calc(100vh - 120px)';
        swimCanvas.style.maxWidth = '100vw';
        swimCanvas.style.maxHeight = 'calc(100vh - 120px)';
    } else {
        // Desktop dimensions - full screen, controls below
        swimCanvas.width = window.innerWidth;
        swimCanvas.height = window.innerHeight; // Full viewport height
        swimCanvas.style.width = '100vw';
        swimCanvas.style.height = '100vh';
        swimCanvas.style.maxWidth = '100vw';
        swimCanvas.style.maxHeight = '100vh';
    }

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
let lastFishCountUpdate = 0;

function animateFishes() {
    swimCtx.clearRect(0, 0, swimCanvas.width, swimCanvas.height);
    const time = Date.now() / 500;
    const currentTime = Date.now();

    // Update fish count display every 2 seconds
    if (currentTime - lastFishCountUpdate > 2000) {
        updateCurrentFishCount();
        lastFishCountUpdate = currentTime;
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

        // 检查鱼的健康值，如果已死亡但还没开始死亡动画，启动死亡动画
        if (!fish.isDying && !fish.isEntering && window.isBattleMode) {
            const fishHealth = fish.health !== undefined ? fish.health : (fish.max_health || 100);
            const isAlive = fish.is_alive !== undefined ? fish.is_alive : true;
            
            if (!isAlive || fishHealth <= 0) {
                console.log(`☠️ 检测到死亡的鱼: ${fish.artist || fish.docId} (health: ${fishHealth}, is_alive: ${isAlive})`);
                
                // 启动死亡动画
                fish.isDying = true;
                fish.deathStartTime = Date.now();
                fish.deathDuration = 2000;
                fish.originalY = fish.y;
                fish.opacity = 1;
                fish.direction = -Math.abs(fish.direction);
                fish.health = 0;
                fish.is_alive = false;
                
                // 2秒后移除
                const deadFishId = fish.docId || fish.id;
                setTimeout(() => {
                    const index = fishes.findIndex(f => (f.docId || f.id) === deadFishId);
                    if (index !== -1) {
                        fishes.splice(index, 1);
                        console.log(`🗑️ 已自动移除死亡的鱼 (ID: ${deadFishId})`);
                    }
                }, 2000);
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
            
            // 如果鱼被点击了，完全跳过所有移动逻辑（类似 fish.locked 的处理方式）
            if (fish.isClicked && fish.clickedAt) {
                const timeSinceClick = Date.now() - fish.clickedAt;
                if (timeSinceClick < 3000) {
                    // 3秒内保持完全静止
                    // 清除所有速度，防止任何移动
                    fish.vx = 0;
                    fish.vy = 0;
                    // 直接跳过所有移动逻辑，不执行任何位置更新
                    // 注意：这里不能使用 continue，因为后面还需要绘制鱼
                } else {
                    // 3秒后恢复移动
                    fish.isClicked = false;
                    fish.clickedAt = null;
                    fish.clickedY = null;
                    fish.clickedSwimY = null;
                    // 恢复初始速度
                    if (Math.abs(fish.vx) < 0.01 && Math.abs(fish.vy) < 0.01) {
                        fish.vx = fish.speed * fish.direction * 0.1;
                        fish.vy = 0;
                    }
                }
            }
            
            // 如果鱼被点击了且在3秒内，完全跳过所有移动逻辑
            const isClickedAndRecent = fish.isClicked && fish.clickedAt && (Date.now() - fish.clickedAt) < 3000;
            if (!isClickedAndRecent) {
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
                    // 随机向上或向下移动1行（30-50像素）
                    const verticalShift = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 20);
                    fish.y = Math.max(0, Math.min(swimCanvas.height - fish.height, fish.y + verticalShift));
                } else if (fish.x >= swimCanvas.width - fish.width) {
                    fish.x = swimCanvas.width - fish.width;
                    fish.direction = -1; // Face left
                    fish.vx = -Math.abs(fish.vx); // Ensure velocity points left
                    hitEdge = true;
                    // 随机向上或向下移动1行（30-50像素）
                    const verticalShift = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 20);
                    fish.y = Math.max(0, Math.min(swimCanvas.height - fish.height, fish.y + verticalShift));
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
            } // 结束 if (!isClickedAndRecent) 块（移动逻辑）
        }

        // Calculate swim position - reduce sine wave when fish is attracted to food
        let swimY;
        if (fish.isDying) {
            swimY = fish.y;
        } else if (fish.isClicked && fish.clickedAt && (Date.now() - fish.clickedAt) < 3000) {
            // 如果鱼被点击了且在3秒内，完全停止游泳动画，保持静止
            // 使用点击时保存的 swimY，完全静止，不应用任何动画
            swimY = fish.clickedSwimY !== undefined ? fish.clickedSwimY : fish.y;
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

    // Update and draw fish dialogues (Phase 0 - Simple System)
    if (fishDialogueManager && !tankLayoutManager) {
        fishDialogueManager.updateDialogues(fishes);
        fishDialogueManager.drawDialogues();
    }
    
    // Render community chat dialogues (New System)
    if (tankLayoutManager) {
        tankLayoutManager.renderDialogues();
    }

    requestAnimationFrame(animateFishes);
}

function drawWigglingFish(fish, x, y, direction, time, phase) {
    const src = fish.fishCanvas;
    const w = fish.width;
    const h = fish.height;
    const tailEnd = Math.floor(w * fish.peduncle);

    // Check if this is the current user's fish
    const isCurrentUserFish = isUserFish(fish);

    // Add highlighting effect for user's fish
    if (isCurrentUserFish && !fish.isDying) {
        swimCtx.save();

        // Draw explosive lines radiating from the fish
        const centerX = x + w / 2;
        const centerY = y + h / 2;
        const maxRadius = Math.max(w, h) / 2 + 15;
        const lineCount = 12;
        const lineLength = 15;
        const timeOffset = time * 0.002; // Slow rotation

        swimCtx.strokeStyle = 'rgba(255, 215, 0, 0.8)'; // Bright gold
        swimCtx.lineWidth = 2;
        swimCtx.lineCap = 'round';

        // Draw radiating lines with slight animation
        for (let i = 0; i < lineCount; i++) {
            const angle = (i / lineCount) * Math.PI * 2 + timeOffset;
            const startRadius = maxRadius + 5;
            const endRadius = startRadius + lineLength;

            // Add some variation to line lengths
            const lengthVariation = Math.sin(angle * 3 + timeOffset * 2) * 3;
            const actualEndRadius = endRadius + lengthVariation;

            const startX = centerX + Math.cos(angle) * startRadius;
            const startY = centerY + Math.sin(angle) * startRadius;
            const endX = centerX + Math.cos(angle) * actualEndRadius;
            const endY = centerY + Math.sin(angle) * actualEndRadius;

            // Fade out lines at the edges
            const fadeAlpha = 0.8 - (i % 3) * 0.2;
            swimCtx.strokeStyle = `rgba(255, 215, 0, ${fadeAlpha})`;

            swimCtx.beginPath();
            swimCtx.moveTo(startX, startY);
            swimCtx.lineTo(endX, endY);
            swimCtx.stroke();
        }

        swimCtx.restore();
    }

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

// ==========================================
// Chat UI Management
// ==========================================

// Update chat list display
function updateChatUI(chatSession) {
    const chatMessages = document.getElementById('chat-messages');
    const chatStatus = document.getElementById('chat-status');
    
    if (!chatMessages) return;
    
    // 更新状态
    if (chatStatus) {
        chatStatus.textContent = `${chatSession.topic} 🎭`;
        chatStatus.style.color = '#6366F1';
    }
    
    // 清空提示文本（首次聊天时）
    const placeholder = chatMessages.querySelector('[style*="text-align: center"]');
    if (placeholder) {
        placeholder.remove();
    }
    
    // 创建聊天会话卡片
    const sessionCard = document.createElement('div');
    sessionCard.style.cssText = `
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(167, 139, 250, 0.05) 100%);
        border-radius: 12px;
        padding: 15px;
        margin-bottom: 12px;
        border-left: 3px solid #6366F1;
        animation: slideIn 0.5s ease;
    `;
    
    // 会话标题
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
    `;
    titleDiv.innerHTML = `
        <span style="font-weight: 600; color: #6366F1; font-size: 14px;">💬 ${chatSession.topic}</span>
        <span style="font-size: 11px; color: #999;">${chatSession.participantCount || chatSession.dialogues?.length || 0} 条消息</span>
    `;
    sessionCard.appendChild(titleDiv);
    
    // 消息列表
    if (chatSession.dialogues && chatSession.dialogues.length > 0) {
        chatSession.dialogues.forEach((msg, index) => {
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = `
                background: white;
                border-radius: 8px;
                padding: 8px 12px;
                margin-bottom: 6px;
                font-size: 13px;
                line-height: 1.5;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                animation: fadeIn 0.3s ease ${index * 0.1}s both;
            `;
            
            // 根据personality设置颜色
            const personalityColors = {
                cheerful: '#FF9800',
                shy: '#2196F3',
                brave: '#E91E63',
                lazy: '#9C27B0'
            };
            const color = personalityColors[msg.personality] || '#666';
            
            messageDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                    <span style="font-weight: 600; color: ${color}; font-size: 12px;">🐟 ${msg.fishName || 'Unknown'}</span>
                    <span style="font-size: 10px; color: #999;">${msg.sequence || index + 1}</span>
                </div>
                <div style="color: #333;">${msg.message}</div>
            `;
            
            sessionCard.appendChild(messageDiv);
        });
    }
    
    // 插入到顶部
    chatMessages.insertBefore(sessionCard, chatMessages.firstChild);
    
    // 限制显示最多3个会话
    while (chatMessages.children.length > 3) {
        chatMessages.removeChild(chatMessages.lastChild);
    }
    
    // 添加动画样式（如果还没有）
    if (!document.getElementById('chat-animations')) {
        const style = document.createElement('style');
        style.id = 'chat-animations';
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            #chat-messages::-webkit-scrollbar {
                width: 6px;
            }
            #chat-messages::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.05);
                border-radius: 3px;
            }
            #chat-messages::-webkit-scrollbar-thumb {
                background: rgba(99, 102, 241, 0.3);
                border-radius: 3px;
            }
            #chat-messages::-webkit-scrollbar-thumb:hover {
                background: rgba(99, 102, 241, 0.5);
            }
        `;
        document.head.appendChild(style);
    }
}

// 监听聊天事件
if (communityChatManager) {
    // 重写startSession方法来触发UI更新
    const originalStartSession = communityChatManager.startSession.bind(communityChatManager);
    communityChatManager.startSession = function(chatSession) {
        console.log('🎭 [Chat UI] 开始显示聊天:', chatSession);
        
        // 更新UI
        updateChatUI(chatSession);
        
        // 调用原始方法
        return originalStartSession(chatSession);
    };
}

// 初始化群聊功能
async function initializeGroupChat() {
    if (!communityChatManager) {
        console.warn('CommunityChatManager not initialized');
        return;
    }
    
    try {
        // 从API获取环境变量配置
        const response = await fetch('/api/config/group-chat');
        if (!response.ok) {
            console.log('Could not fetch group chat config, using default (OFF)');
            // 检查用户本地设置
            const userPreference = localStorage.getItem('groupChatEnabled');
            if (userPreference === 'true') {
                communityChatManager.setGroupChatEnabled(true);
                updateGroupChatButton(true);
            }
            return;
        }
        
        const config = await response.json();
        const defaultEnabled = config.enabled || false;
        
        // 检查用户是否手动设置过（用户设置优先）
        const userPreference = localStorage.getItem('groupChatEnabled');
        let shouldEnable = defaultEnabled;
        
        if (userPreference !== null) {
            // 用户有手动设置，使用用户设置
            shouldEnable = userPreference === 'true';
            console.log(`Using user preference: ${shouldEnable ? 'ON' : 'OFF'}`);
        } else {
            // 用户没有设置，使用环境变量默认值
            shouldEnable = defaultEnabled;
            console.log(`Using environment default: ${shouldEnable ? 'ON' : 'OFF'}`);
        }
        
        // 设置群聊状态
        communityChatManager.setGroupChatEnabled(shouldEnable);
        updateGroupChatButton(shouldEnable);
        
        if (shouldEnable) {
            console.log('✅ Group chat initialized and enabled');
        } else {
            console.log('ℹ️ Group chat initialized but disabled');
        }
    } catch (error) {
        console.error('Failed to initialize group chat:', error);
        // 默认禁用
        communityChatManager.setGroupChatEnabled(false);
        updateGroupChatButton(false);
    }
}

// 更新群聊开关按钮状态
function updateGroupChatButton(enabled) {
    const toggleGroupChatBtn = document.getElementById('toggle-group-chat-btn');
    if (!toggleGroupChatBtn) return;
    
    const iconSpan = toggleGroupChatBtn.querySelector('.game-control-icon');
    const textSpan = toggleGroupChatBtn.querySelector('span:last-child');
    
    // 保持橙色，但根据状态调整渐变强度
    toggleGroupChatBtn.className = 'game-btn game-btn-orange';
    
    if (enabled) {
        // 启用状态：使用明亮的橙色渐变
        toggleGroupChatBtn.style.background = 'linear-gradient(180deg, #FFB340 0%, #FF9500 50%, #E67E00 100%)';
        toggleGroupChatBtn.style.borderBottom = '3px solid #CC6E00';
        toggleGroupChatBtn.style.color = 'white';
        toggleGroupChatBtn.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
        if (iconSpan) iconSpan.textContent = '💬';
        if (textSpan) textSpan.textContent = 'Chat ON';
    } else {
        // 禁用状态：使用较暗的橙色渐变
        toggleGroupChatBtn.style.background = 'linear-gradient(180deg, #FF9500 0%, #E67E00 50%, #CC6E00 100%)';
        toggleGroupChatBtn.style.borderBottom = '3px solid #B85C00';
        toggleGroupChatBtn.style.color = 'white';
        toggleGroupChatBtn.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
        if (iconSpan) iconSpan.textContent = '💬';
        if (textSpan) textSpan.textContent = 'Chat OFF';
    }
}

// 切换群聊开关
function toggleGroupChat() {
    if (!communityChatManager) {
        console.warn('CommunityChatManager not initialized');
        return;
    }
    
    const currentState = communityChatManager.isGroupChatEnabled();
    const newState = !currentState;
    
    // 更新管理器状态
    communityChatManager.setGroupChatEnabled(newState);
    
    // 保存用户偏好到 localStorage
    localStorage.setItem('groupChatEnabled', newState ? 'true' : 'false');
    
    // 更新按钮显示
    updateGroupChatButton(newState);
    
    console.log(`Group chat ${newState ? 'enabled' : 'disabled'} by user`);
}

// 聊天面板切换功能
const chatPanel = document.getElementById('chat-panel');
const toggleChatBtn = document.getElementById('toggle-chat-btn');
const toggleGroupChatBtn = document.getElementById('toggle-group-chat-btn');
const closeChatBtn = document.getElementById('close-chat-panel');
const tankWrapper = document.getElementById('tank-wrapper-main');

let isChatPanelOpen = false;

function toggleChatPanel() {
    isChatPanelOpen = !isChatPanelOpen;
    
    if (isChatPanelOpen) {
        // 显示聊天面板
        chatPanel.style.display = 'flex';
        chatPanel.style.visibility = 'visible';
        chatPanel.style.right = '0';
        tankWrapper.style.marginRight = '0';
        // 更新按钮文本（保持图标和文本结构）
        const textSpan = toggleChatBtn.querySelector('span:last-child');
        if (textSpan) {
            textSpan.textContent = 'Close';
        }
    } else {
        // 隐藏聊天面板
        chatPanel.style.right = '-350px';
        tankWrapper.style.marginRight = '0';
        // 延迟隐藏，等待动画完成
        setTimeout(() => {
            chatPanel.style.display = 'none';
            chatPanel.style.visibility = 'hidden';
        }, 300);
        // 恢复按钮文本
        const textSpan = toggleChatBtn.querySelector('span:last-child');
        if (textSpan) {
            textSpan.textContent = 'Chat Box';
        }
    }
}

// Chat Box 按钮：只用于切换聊天面板
if (toggleChatBtn) {
    toggleChatBtn.addEventListener('click', toggleChatPanel);
    toggleChatBtn.title = '打开/关闭聊天面板';
}

// Chat ON/OFF 按钮：用于切换所有聊天功能（群聊和自语）
if (toggleGroupChatBtn) {
    toggleGroupChatBtn.addEventListener('click', toggleGroupChat);
    toggleGroupChatBtn.title = '开启/关闭所有聊天功能（群聊和自语）';
}

if (closeChatBtn) {
    closeChatBtn.addEventListener('click', toggleChatPanel);
}

// 导出函数供全局使用
window.toggleGroupChat = toggleGroupChat;
window.updateGroupChatButton = updateGroupChatButton;

// 立即触发聊天按钮
const triggerChatBtn = document.getElementById('trigger-chat-btn');
if (triggerChatBtn && communityChatManager) {
    triggerChatBtn.addEventListener('click', async () => {
        const statusEl = document.getElementById('chat-status');
        if (statusEl) {
            statusEl.textContent = '生成中...';
            statusEl.style.color = '#FF9800';
        }
        
        triggerChatBtn.disabled = true;
        triggerChatBtn.textContent = '⏳ 生成中...';
        
        try {
            await communityChatManager.triggerChat();
        } catch (error) {
            console.error('触发聊天失败:', error);
            if (statusEl) {
                statusEl.textContent = '❌ 失败';
                statusEl.style.color = '#f44336';
            }
        } finally {
            triggerChatBtn.disabled = false;
            triggerChatBtn.textContent = '🎯 立即触发聊天';
        }
    });
}

// ===== 背景气泡效果 =====
function createBackgroundBubbles() {
    const container = document.querySelector('.background-bubbles');
    if (!container) return;
    
    const bubbleCount = 20; // 鱼缸页面多一些气泡
    
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // 随机大小
        const size = Math.random() * 40 + 20;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        
        // 随机水平位置
        bubble.style.left = Math.random() * 100 + '%';
        
        // 随机动画延迟
        bubble.style.animationDelay = Math.random() * 5 + 's';
        
        // 随机动画持续时间
        bubble.style.animationDuration = (Math.random() * 3 + 4) + 's';
        
        container.appendChild(bubble);
    }
}

// 页面加载时初始化气泡效果
createBackgroundBubbles();

// Continue the animation loop
requestAnimationFrame(animateFishes);
