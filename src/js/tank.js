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
    const isMobile = window.innerWidth <= 768;

    // Scale fish size based on tank dimensions
    // Use smaller dimension to ensure fish fit well on all screen ratios
    const baseDimension = Math.min(tankWidth, tankHeight);

    // Fish width should be roughly 8-12% of the smaller tank dimension
    // For mobile, double the size (20% instead of 10%)
    const basePercentage = isMobile ? 0.2 : 0.1;
    const fishWidth = Math.floor(baseDimension * basePercentage);
    const fishHeight = Math.floor(fishWidth * 0.6); // Maintain 3:5 aspect ratio

    // Set reasonable bounds: 
    // - Mobile: 60px - 300px wide (doubled from desktop)
    // - Desktop: 30px - 150px wide
    const minWidth = isMobile ? 60 : 30;
    const maxWidth = isMobile ? 300 : 150;
    const minHeight = isMobile ? 36 : 18;
    const maxHeight = isMobile ? 180 : 90;
    
    const finalWidth = Math.max(minWidth, Math.min(maxWidth, fishWidth));
    const finalHeight = Math.max(minHeight, Math.min(maxHeight, fishHeight));

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
    
    // Enable high-quality image smoothing
    displayCtx.imageSmoothingEnabled = true;
    displayCtx.imageSmoothingQuality = 'high';
    
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
    imageUrl = null, // 添加原始图片 URL
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
        imageUrl, // 保存原始图片 URL
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
        // Check for duplicate fish before loading
        const fishId = fishData.docId || fishData.id;
        if (fishId) {
            // Check if this fish already exists in the tank
            const existingFish = fishes.find(f => {
                if (f.isDying) return false;
                const existingId = f.docId || f.id;
                return existingId === fishId;
            });
            
            if (existingFish) {
                console.log(`🐠 Skipping duplicate fish (ID: ${fishId}) - already in tank`);
                if (onDone) onDone(existingFish);
                return;
            }
        }
        
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
                imageUrl: imgUrl, // 保存原始图片 URL
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
            console.log(`🐠 Added fish to tank (ID: ${fishId}, Total: ${fishes.length})`);

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
    const sortSelect = document.getElementById('tank-sort') || document.getElementById('tank-sort-sidebar');
    if (sortSelect) {
        updatePageTitle(sortSelect.value);
    } else {
        // Fallback to URL parameter or default
        const urlParams = new URLSearchParams(window.location.search);
        const sortParam = urlParams.get('sort') || 'recent';
        updatePageTitle(sortParam);
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

// Export to window for external access
window.updateTankCapacity = updateTankCapacity;

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

        // Get current user ID to filter user's own fish
        let currentUserId = null;
        try {
            if (typeof getCurrentUserId === 'function') {
                currentUserId = await getCurrentUserId();
            }
        } catch (error) {
            console.warn('Failed to get current user ID:', error);
        }

        // Filter user's own fish - keep only the newest one
        let filteredFishDocs = allFishDocs;
        if (currentUserId) {
            const userFishDocs = [];
            const otherFishDocs = [];

            allFishDocs.forEach(doc => {
                // Handle different possible backend API formats
                let data;
                if (typeof doc.data === 'function') {
                    data = doc.data();
                } else if (doc.data && typeof doc.data === 'object') {
                    data = doc.data;
                } else if (doc.id && (doc.image || doc.Image)) {
                    data = doc;
                } else {
                    otherFishDocs.push(doc);
                    return;
                }

                // Check if this fish belongs to the current user
                const fishUserId = data.user_id || data.UserId || data.userId || data.owner_id || data.ownerId;
                if (fishUserId === currentUserId) {
                    userFishDocs.push(doc);
                } else {
                    otherFishDocs.push(doc);
                }
            });

            // If user has multiple fish, keep only the newest one
            if (userFishDocs.length > 1) {
                // Sort user's fish by creation date (newest first)
                userFishDocs.sort((a, b) => {
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

                    if (!aDate && !bDate) return 0;
                    if (!aDate) return 1;
                    if (!bDate) return -1;

                    const aTime = aDate instanceof Date ? aDate.getTime() : new Date(aDate).getTime();
                    const bTime = bDate instanceof Date ? bDate.getTime() : new Date(bDate).getTime();

                    return bTime - aTime; // Newest first
                });

                // Keep only the newest user fish
                const newestUserFish = userFishDocs[0];
                console.log(`🐠 User has ${userFishDocs.length} fish, keeping only the newest one`);
                filteredFishDocs = [newestUserFish, ...otherFishDocs];
            } else {
                // User has 0 or 1 fish, no filtering needed
                filteredFishDocs = allFishDocs;
            }
        }

        // Track the newest timestamp for the listener
        if (filteredFishDocs.length > 0) {
            const sortedByDate = filteredFishDocs.filter(doc => {
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

        // Remove duplicates from filteredFishDocs before loading
        const uniqueFishDocs = [];
        const seenFishIds = new Set();
        
        filteredFishDocs.forEach((doc) => {
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

            // Check for duplicate fish IDs
            if (fishId && seenFishIds.has(fishId)) {
                console.log(`🐠 Skipping duplicate fish from API (ID: ${fishId})`);
                return;
            }
            
            if (fishId) {
                seenFishIds.add(fishId);
            }
            
            uniqueFishDocs.push(doc);
        });
        
        console.log(`🐠 Filtered ${filteredFishDocs.length} fish docs to ${uniqueFishDocs.length} unique fish`);

        uniqueFishDocs.forEach((doc, index) => {
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
        // Use preserveDistribution=true to maintain even distribution after refresh
        // Clear any existing timeout to prevent multiple calls
        if (window.assignFishToRowsTimeout) {
            clearTimeout(window.assignFishToRowsTimeout);
        }
        if (tankLayoutManager) {
            window.assignFishToRowsTimeout = setTimeout(() => {
                tankLayoutManager.assignFishToRows(fishes, true);
                // Log is now handled inside assignFishToRows
            }, 1000); // Wait 1 second for images to load
        }
        
        // Filter user's fish after loading - keep only the newest one
        // This is a backup filter, main filtering happens in loadFishIntoTank
        setTimeout(async () => {
            await filterUserFishToNewestOnly();
        }, 1500); // Wait 1.5 seconds for all images to load
    }
}

// Filter user's fish to keep only the newest one
async function filterUserFishToNewestOnly() {
    try {
        // Get current user ID from multiple sources
        let currentUserId = null;
        
        // Try getCurrentUserId function first
        if (typeof getCurrentUserId === 'function') {
            try {
                currentUserId = await getCurrentUserId();
            } catch (error) {
                console.warn('getCurrentUserId failed:', error);
            }
        }
        
        // Fallback to localStorage if getCurrentUserId returns null
        if (!currentUserId) {
            const userData = localStorage.getItem('userData');
            if (userData) {
                try {
                    const parsed = JSON.parse(userData);
                    currentUserId = parsed.userId || parsed.uid || parsed.id;
                } catch (error) {
                    console.warn('Failed to parse userData:', error);
                }
            }
            
            // Also try userId directly from localStorage
            if (!currentUserId) {
                currentUserId = localStorage.getItem('userId');
            }
        }
        
        // Also try Supabase auth if available
        if (!currentUserId && window.supabaseAuth) {
            try {
                const user = await window.supabaseAuth.getUser();
                if (user && user.id) {
                    currentUserId = user.id;
                }
            } catch (error) {
                console.warn('Failed to get user from supabaseAuth:', error);
            }
        }
        
        if (!currentUserId) {
            console.log('🐠 No user ID found, skipping user fish filtering');
            return; // User not logged in, no filtering needed
        }
        
        console.log('🐠 Filtering user fish, currentUserId:', currentUserId);
        
        // Find all user's fish in the tank (including those that are dying)
        const userFish = fishes.filter(f => {
            const fUserId = f.userId || f.user_id || f.UserId || f.owner_id || f.ownerId;
            return fUserId === currentUserId;
        });
        
        // Filter out already dying fish
        const aliveUserFish = userFish.filter(f => !f.isDying);
        
        // If user has multiple alive fish, keep only the newest one
        if (aliveUserFish.length > 1) {
            // Sort by creation date (newest first)
            aliveUserFish.sort((a, b) => {
                const aDate = a.createdAt;
                const bDate = b.createdAt;
                
                // Handle Firestore timestamp format
                let aTime, bTime;
                if (aDate && aDate._seconds) {
                    aTime = aDate._seconds * 1000 + (aDate._nanoseconds || 0) / 1000000;
                } else if (aDate instanceof Date) {
                    aTime = aDate.getTime();
                } else if (aDate) {
                    aTime = new Date(aDate).getTime();
                } else {
                    aTime = 0;
                }
                
                if (bDate && bDate._seconds) {
                    bTime = bDate._seconds * 1000 + (bDate._nanoseconds || 0) / 1000000;
                } else if (bDate instanceof Date) {
                    bTime = bDate.getTime();
                } else if (bDate) {
                    bTime = new Date(bDate).getTime();
                } else {
                    bTime = 0;
                }
                
                return bTime - aTime; // Newest first
            });
            
            // Keep only the newest one, remove the rest
            const newestUserFish = aliveUserFish[0];
            const fishToRemove = aliveUserFish.slice(1);
            
            console.log(`🐠 User has ${aliveUserFish.length} alive fish, keeping only the newest one (ID: ${newestUserFish.docId || newestUserFish.id})`);
            
            // Remove old user fish with death animation
            fishToRemove.forEach((oldFish, index) => {
                setTimeout(() => {
                    const oldFishIndex = fishes.indexOf(oldFish);
                    if (oldFishIndex !== -1 && !oldFish.isDying) {
                        console.log(`🐠 Removing duplicate user fish (ID: ${oldFish.docId || oldFish.id})`);
                        animateFishDeath(oldFishIndex);
                    }
                }, index * 200); // Stagger the death animations
            });
        } else if (aliveUserFish.length === 1) {
            console.log(`🐠 User has exactly 1 fish (ID: ${aliveUserFish[0].docId || aliveUserFish[0].id}), no filtering needed`);
        } else {
            console.log('🐠 User has no fish in tank');
        }
    } catch (error) {
        console.error('Error filtering user fish:', error);
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
        
        // Get current user ID once before processing fish
        let currentUserId = null;
        try {
            if (typeof getCurrentUserId === 'function') {
                currentUserId = await getCurrentUserId();
            }
        } catch (error) {
            console.warn('Failed to get current user ID in checkForNewFish:', error);
        }

        // 转换为后端API格式
        const data = { data: newFishDocs };

        // Use for...of loop instead of forEach to support async operations
        for (const fishItem of data.data) {
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
                continue;
            }

            // Skip if data is still undefined or null
            if (!fishData) {
                console.warn('Skipping fish with no data in checkForNewFish:', fishId, fishItem);
                continue;
            }

            const imageUrl = fishData.image || fishData.Image; // Try lowercase first, then uppercase

            if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
                console.warn('Skipping fish with invalid image:', fishId, fishData);
                continue;
            }

            // Only add if we haven't seen this fish before (check both docId and id)
            const fishAlreadyExists = fishes.some(f => {
                if (f.isDying) return false;
                const existingId = f.docId || f.id;
                return existingId === fishId;
            });
            
            if (!fishAlreadyExists) {

                // Check if this new fish belongs to the current user
                const fishUserId = fishData.user_id || fishData.UserId || fishData.userId || fishData.owner_id || fishData.ownerId;
                const isUserFish = currentUserId && fishUserId === currentUserId;

                // If this is user's fish, check if there are other user's fish in the tank
                if (isUserFish) {
                    // Find all user's fish currently in the tank
                    const userFishInTank = fishes.filter(f => {
                        if (f.isDying) return false;
                        const fUserId = f.userId || f.user_id || f.UserId || f.owner_id || f.ownerId;
                        return fUserId === currentUserId;
                    });

                    // If user already has fish in tank, remove the oldest one(s) to keep only the newest
                    if (userFishInTank.length > 0) {
                        // Sort user's fish by creation date (oldest first)
                        userFishInTank.sort((a, b) => {
                            const aDate = a.createdAt;
                            const bDate = b.createdAt;
                            if (!aDate && !bDate) return 0;
                            if (!aDate) return 1;
                            if (!bDate) return -1;
                            const aTime = aDate instanceof Date ? aDate.getTime() : new Date(aDate).getTime();
                            const bTime = bDate instanceof Date ? bDate.getTime() : new Date(bDate).getTime();
                            return aTime - bTime; // Oldest first
                        });

                        // Remove all old user fish except the newest one (if new fish is newer)
                        const newestUserFishInTank = userFishInTank[userFishInTank.length - 1];
                        const newFishDate = fishData.CreatedAt || fishData.createdAt;
                        const newestInTankDate = newestUserFishInTank.createdAt;

                        // Compare dates to see if new fish is newer
                        let shouldRemoveOldFish = true;
                        if (newFishDate && newestInTankDate) {
                            const newFishTime = newFishDate instanceof Date ? newFishDate.getTime() : new Date(newFishDate).getTime();
                            const newestInTankTime = newestInTankDate instanceof Date ? newestInTankDate.getTime() : new Date(newestInTankDate).getTime();
                            shouldRemoveOldFish = newFishTime > newestInTankTime;
                        }

                        if (shouldRemoveOldFish) {
                            // Remove all old user fish
                            userFishInTank.forEach((oldFish, index) => {
                                const oldFishIndex = fishes.indexOf(oldFish);
                                if (oldFishIndex !== -1 && !oldFish.isDying) {
                                    console.log(`🐠 Removing old user fish to make room for newest one`);
                                    animateFishDeath(oldFishIndex);
                                }
                            });
                        } else {
                            // New fish is older than existing user fish, don't add it
                            console.log(`🐠 New fish is older than existing user fish, skipping`);
                            continue;
                        }
                    }
                }

                // Update newest timestamp
                const fishDate = fishData.CreatedAt || fishData.createdAt;
                if (!newestFishTimestamp || (fishDate && new Date(fishDate) > new Date(newestFishTimestamp))) {
                    newestFishTimestamp = fishDate;
                }

                // If at capacity, animate death of oldest fish, then add new one
                if (fishes.length >= maxTankCapacity) {
                    // Find the oldest fish by creation date (excluding dying fish and user's fish if this is user's new fish)
                    const aliveFish = fishes.filter(f => {
                        if (f.isDying) return false;
                        // If adding user's fish, exclude other user's fish from removal candidates
                        if (isUserFish) {
                            const fUserId = f.userId || f.user_id || f.UserId || f.owner_id || f.ownerId;
                            return fUserId !== currentUserId;
                        }
                        return true;
                    });

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
                    } else {
                        // No fish to remove, but we're at capacity - add anyway (user's old fish were already removed)
                        loadFishImageToTank(imageUrl, {
                            ...fishData,
                            docId: fishId
                        }, (newFish) => {
                            // Show subtle notification
                            showNewFishNotification(fishData.Artist || fishData.artist || 'Anonymous');
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
        }
    } catch (error) {
        console.error('Error checking for new fish:', error);
    }
}

// Combined function to load tank with streaming capability
async function loadFishIntoTank(sortType = 'recent') {
    // Load initial fish
    await loadInitialFish(sortType);

    // Filter user's fish after loading - ensure only one user fish exists
    // Use multiple attempts to ensure filtering works correctly
    await filterUserFishToNewestOnly();
    setTimeout(async () => {
        await filterUserFishToNewestOnly();
    }, 2000); // Second attempt after 2 seconds
    setTimeout(async () => {
        await filterUserFishToNewestOnly();
    }, 4000); // Third attempt after 4 seconds

    // Set up real-time listener for new fish (only for recent mode)
    if (sortType === 'recent') {
        setupNewFishListener();
    }
}

// Export to window for external access
window.loadFishIntoTank = loadFishIntoTank;

window.addEventListener('DOMContentLoaded', async () => {
    // Try to get elements from bottom controls, fallback to sidebar
    const sortSelect = document.getElementById('tank-sort') || document.getElementById('tank-sort-sidebar');
    const refreshButton = document.getElementById('refresh-tank') || document.getElementById('refresh-tank-sidebar');

    // Check for URL parameters to set initial sort and capacity
    const urlParams = new URLSearchParams(window.location.search);
    const sortParam = urlParams.get('sort');
    const capacityParam = urlParams.get('capacity');
    let initialSort = 'recent'; // default

    // Validate sort parameter and set dropdown
    if (sortParam && ['recent', 'popular', 'random'].includes(sortParam)) {
        initialSort = sortParam;
        if (sortSelect) {
            sortSelect.value = sortParam;
        }
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
    
    // Also sync with sidebar selector if it exists
    const fishCountSelector = document.getElementById('fish-count-selector-sidebar');
    if (fishCountSelector) {
        // Find closest value to current capacity
        const options = [10, 20, 30, 40, 50];
        let closest = options[0];
        let minDiff = Math.abs(maxTankCapacity - options[0]);
        for (let i = 1; i < options.length; i++) {
            const diff = Math.abs(maxTankCapacity - options[i]);
            if (diff < minDiff) {
                minDiff = diff;
                closest = options[i];
            }
        }
        fishCountSelector.value = closest.toString();
    }
    
    const displayElement = document.getElementById('fish-count-display');
    if (displayElement) {
        displayElement.textContent = maxTankCapacity;
    }
    
    console.log(`🐠 Initialized tank capacity: ${maxTankCapacity}`);
    console.log(`🐠 About to load fish with capacity: ${maxTankCapacity}`);

    // Update page title based on initial selection
    updatePageTitle(initialSort);

    // Handle sort change (only if element exists)
    if (sortSelect) {
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
    }

    // Handle refresh button (only if element exists)
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            const selectedSort = sortSelect ? sortSelect.value : initialSort;
            loadFishIntoTank(selectedSort);
        });
    }

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
    let imgDataUrl;
    let modalWidth = 400; // 默认显示宽度
    let modalHeight = 240; // 默认显示高度
    
    // 如果有原始图片 URL，直接使用原始图片以获得最佳清晰度
    if (fish.imageUrl) {
        imgDataUrl = fish.imageUrl;
        // 使用更大的显示尺寸以充分利用原始图片质量
        modalWidth = 500;
        modalHeight = 300;
    } else {
        // 备用方案：从 fishCanvas 生成（保持向后兼容）
        const canvasScaleFactor = 6;
        const fishImgCanvas = document.createElement('canvas');
        fishImgCanvas.width = fish.width * canvasScaleFactor;
        fishImgCanvas.height = fish.height * canvasScaleFactor;
        const ctx = fishImgCanvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.scale(canvasScaleFactor, canvasScaleFactor);
        ctx.drawImage(fish.fishCanvas, 0, 0);
        
        imgDataUrl = fishImgCanvas.toDataURL('image/png');
        const displayScaleFactor = 3;
        const baseWidth = Math.min(200, fish.width);
        const baseHeight = Math.min(150, fish.height);
        modalWidth = baseWidth * displayScaleFactor;
        modalHeight = baseHeight * displayScaleFactor;
    }

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
    info += `<img src='${imgDataUrl}' style='display:block;margin:0 auto;max-width:${modalWidth}px;max-height:${modalHeight}px;width:auto;height:auto;image-rendering: auto;object-fit: contain;' alt='Fish'>`;
    info += `</div>`;

    // Fish info section (simplified, no background box)
    info += `<div style='margin-bottom: 12px; font-size: 13px; color: #666;'><strong style='color: #333;'>Artist:</strong> ${artistLink}</div>`;

    // Action buttons: Like, Favorite, Report (并列，样式一致)
    info += `<div class="voting-controls modal-controls" style="display: flex; gap: 12px; justify-content: center; margin-bottom: 20px;">`;
    
    // Like button
    info += `<button class="vote-btn upvote-btn" onclick="handleVote('${fish.docId}', 'up', this)" style="flex: 1; padding: 12px 16px; border: none; border-radius: 12px; background: linear-gradient(180deg, #6FE77D 0%, #4CD964 50%, #3CB54A 100%); border-bottom: 3px solid #2E8B3A; color: white; cursor: pointer; font-size: 14px; font-weight: 700; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25); transition: all 0.15s ease; display: flex; align-items: center; justify-content: center; gap: 6px;">`;
    info += `👍 <span class="vote-count upvote-count">${fish.upvotes || 0}</span>`;
    info += `</button>`;
    
    // Add to My Tank button (only show if user is logged in and not their own fish)
    if (showFavoriteButton) {
        info += `<button class="add-to-tank-btn" id="add-tank-btn-${fish.docId}" onclick="if(typeof handleAddToMyTank === 'function') handleAddToMyTank('${fish.docId}', event); else alert('Add to My Tank feature not yet implemented');" style="flex: 1; padding: 12px 16px; border: none; border-radius: 12px; background: linear-gradient(180deg, #4A90E2 0%, #357ABD 50%, #2C5F8F 100%); border-bottom: 3px solid #1E4A6F; color: white; cursor: pointer; font-size: 14px; font-weight: 700; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25); transition: all 0.15s ease; display: flex; align-items: center; justify-content: center; gap: 6px;" title="Add this fish to your personal tank">`;
        info += `🐟 Add to My Tank`;
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

// Handle Add to My Tank click
async function handleAddToMyTank(fishId, event) {
    if (event) event.stopPropagation();
    
    const button = document.getElementById(`add-tank-btn-${fishId}`);
    if (!button) return;
    
    // Check if user is logged in
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
        if (typeof FishTankFavorites !== 'undefined' && FishTankFavorites.showToast) {
            FishTankFavorites.showToast('Please login to add fish to your tank', 'info');
        } else {
            alert('Please login to add fish to your tank');
        }
        return;
    }
    
    try {
        button.disabled = true;
        const originalHTML = button.innerHTML;
        button.innerHTML = '⏳ Adding...';
        
        // Check if already in tank
        const isFav = typeof FishTankFavorites !== 'undefined' 
            ? await FishTankFavorites.isFavorite(fishId)
            : false;
        
        if (isFav) {
            // Remove from tank
            if (typeof FishTankFavorites !== 'undefined') {
                await FishTankFavorites.removeFromFavorites(fishId);
            }
            button.innerHTML = '🐟 Add to My Tank';
            button.style.background = 'linear-gradient(180deg, #4A90E2 0%, #357ABD 50%, #2C5F8F 100%)';
            if (typeof FishTankFavorites !== 'undefined' && FishTankFavorites.showToast) {
                FishTankFavorites.showToast('Removed from your tank');
            }
        } else {
            // Add to tank
            const API_BASE = typeof BACKEND_URL !== 'undefined' ? BACKEND_URL : '';
            const response = await fetch(`${API_BASE}/api/fish/favorite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ fishId })
            });

            const data = await response.json();
            
            if (response.status === 403) {
                // Tank limit reached - show upgrade modal
                showUpgradeModal({
                    title: '🐟 Tank is Full!',
                    message: data.message || 'You have reached your tank limit',
                    currentCount: data.currentCount || 0,
                    maxLimit: data.maxLimit || 5,
                    tier: data.tier || 'free',
                    memberTypeName: data.memberTypeName || 'Free',
                    upgradeUrl: data.upgradeUrl || '/membership.html'
                });
                button.innerHTML = originalHTML;
            } else if (response.ok) {
                // Success
                button.innerHTML = '✅ In My Tank';
                button.style.background = 'linear-gradient(180deg, #6FE77D 0%, #4CD964 50%, #3CB54A 100%)';
                if (typeof FishTankFavorites !== 'undefined' && FishTankFavorites.showToast) {
                    FishTankFavorites.showToast('Fish added to your tank! 🎉');
                }
                // Update cache if available
                if (typeof FishTankFavorites !== 'undefined' && FishTankFavorites.initializeCache) {
                    await FishTankFavorites.initializeCache();
                }
            } else {
                throw new Error(data.error || 'Failed to add fish to tank');
            }
        }
        
    } catch (error) {
        console.error('Error adding to tank:', error);
        if (typeof FishTankFavorites !== 'undefined' && FishTankFavorites.showToast) {
            FishTankFavorites.showToast(error.message || 'Failed to add fish to tank', 'error');
        } else {
            alert(error.message || 'Failed to add fish to tank');
        }
        button.innerHTML = '🐟 Add to My Tank';
        button.style.background = 'linear-gradient(180deg, #4A90E2 0%, #357ABD 50%, #2C5F8F 100%)';
    } finally {
        button.disabled = false;
    }
}

// Show upgrade modal when tank limit is reached
function showUpgradeModal({ title, message, currentCount, maxLimit, tier, memberTypeName, upgradeUrl }) {
    const benefits = {
        free: [
            { plan: 'Plus', limit: 20, features: ['20 fish slots', 'AI chat features'] },
            { plan: 'Premium', limit: 100, features: ['100 fish slots', 'All Plus features', 'Custom chat frequency'] }
        ],
        plus: [
            { plan: 'Premium', limit: 100, features: ['100 fish slots', 'Custom chat frequency', 'Priority support'] }
        ]
    };
    
    const tierBenefits = benefits[tier] || [];
    
    const modalHTML = `
        <div style="padding: 20px; max-width: 500px;">
            <h2 style="margin: 0 0 15px 0; color: #333; font-size: 24px;">${title}</h2>
            <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">${message}</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="font-weight: 600; color: #333;">Current:</span>
                    <span style="color: #666;">${currentCount}/${maxLimit} fish</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="font-weight: 600; color: #333;">Your Plan:</span>
                    <span style="color: #666; text-transform: capitalize;">${memberTypeName}</span>
                </div>
            </div>
            
            ${tierBenefits.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Upgrade Benefits:</h3>
                ${tierBenefits.map(benefit => `
                    <div style="background: white; border: 2px solid #4A90E2; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-weight: 700; color: #4A90E2; font-size: 16px;">${benefit.plan}</span>
                            <span style="color: #666; font-weight: 600;">${benefit.limit} fish slots</span>
                        </div>
                        <ul style="margin: 0; padding-left: 20px; color: #666;">
                            ${benefit.features.map(f => `<li style="margin: 5px 0;">${f}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="this.closest('.modal').remove()" 
                    style="padding: 10px 20px; border: 2px solid #ddd; background: white; border-radius: 6px; cursor: pointer; font-weight: 600; color: #666;">
                    Maybe Later
                </button>
                <button onclick="window.location.href='${upgradeUrl || '/membership.html'}'" 
                    style="padding: 10px 20px; border: none; background: linear-gradient(180deg, #4A90E2 0%, #357ABD 100%); color: white; border-radius: 6px; cursor: pointer; font-weight: 700; box-shadow: 0 2px 4px rgba(74, 144, 226, 0.3);">
                    Upgrade Now
                </button>
            </div>
        </div>
    `;
    
    showModal(modalHTML);
}

// Make functions globally available for onclick handlers
window.handleVote = handleVote;
window.handleReport = handleReport;
window.handleAddToMyTank = handleAddToMyTank;

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

        // Use base position (fish.y) for hit detection instead of animated position
        // This makes the click target stable and easier to hit
        const fishX = fish.x;
        const fishY = fish.y;

        const isWithinBounds = tapX >= fishX && tapX <= fishX + fish.width &&
                              tapY >= fishY && tapY <= fishY + fish.height;

        // Check if tap is within fish bounds
        if (isWithinBounds) {
            // Calculate the current animated swimY for freezing
            const time = Date.now() / 500;
            let frozenSwimY = fish.y;
            
            if (!fish.isDying) {
                const foodDetectionData = foodDetectionCache.get(fish.docId || `fish_${i}`);
                const hasNearbyFood = foodDetectionData ? foodDetectionData.hasNearbyFood : false;
                const currentAmplitude = hasNearbyFood ? fish.amplitude * 0.3 : fish.amplitude;
                frozenSwimY = fish.y + Math.sin(time + fish.phase) * currentAmplitude;
            }
            
            // 标记鱼被点击，冻结游泳动画
            fish.isClicked = true;
            fish.clickedAt = Date.now();
            fish.frozenSwimY = frozenSwimY; // 保存点击时的 swimY
            
            showFishInfoModal(fish);
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

    // Get actual viewport dimensions
    // For mobile, use window.innerHeight which excludes browser UI
    // For better mobile support, we can also use visualViewport if available
    let viewportHeight = window.innerHeight;
    let viewportWidth = window.innerWidth;
    
    if (window.visualViewport) {
        viewportHeight = window.visualViewport.height;
        viewportWidth = window.visualViewport.width;
    }

    // Set canvas to full viewport
    swimCanvas.width = viewportWidth;
    swimCanvas.height = viewportHeight;
    swimCanvas.style.width = viewportWidth + 'px';
    swimCanvas.style.height = viewportHeight + 'px';
    swimCanvas.style.position = 'fixed';
    swimCanvas.style.top = '0';
    swimCanvas.style.left = '0';

    console.log(`🐠 Canvas resized to ${swimCanvas.width}x${swimCanvas.height} (${isMobile ? 'mobile' : 'desktop'}, viewport: ${viewportWidth}x${viewportHeight})`);

    // If canvas size changed significantly, rescale all fish
    if (oldWidth > 0 && oldHeight > 0) {
        const widthChange = Math.abs(oldWidth - swimCanvas.width) / oldWidth;
        const heightChange = Math.abs(oldHeight - swimCanvas.height) / oldHeight;

        // Rescale if size changed by more than 20%
        if (widthChange > 0.2 || heightChange > 0.2) {
            rescaleAllFish();
        }
    }
}
window.addEventListener('resize', resizeForMobile);

// Also listen to visualViewport changes for mobile browsers
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resizeForMobile);
    window.visualViewport.addEventListener('scroll', resizeForMobile);
}

// Initial resize
resizeForMobile();

// Force resize after a short delay to ensure proper initialization
setTimeout(() => {
    resizeForMobile();
}, 100);

// Optimize performance by caching food detection calculations
let foodDetectionCache = new Map();
let cacheUpdateCounter = 0;
let lastFishCountUpdate = 0;

function animateFishes() {
    // Draw ocean gradient background directly on canvas
    const gradient = swimCtx.createLinearGradient(0, 0, 0, swimCanvas.height);
    gradient.addColorStop(0, '#B2EBF2');
    gradient.addColorStop(0.3, '#4FC3F7');
    gradient.addColorStop(0.7, '#0288D1');
    gradient.addColorStop(1, '#01579B');
    swimCtx.fillStyle = gradient;
    swimCtx.fillRect(0, 0, swimCanvas.width, swimCanvas.height);
    
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
            // Check if fish is clicked and frozen
            const isClickedAndFrozen = fish.isClicked && fish.clickedAt && (Date.now() - fish.clickedAt < 5000);
            
            if (!isClickedAndFrozen) {
                // Normal fish behavior (only if not entering and not clicked)
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
        }

        // Calculate swim position - reduce sine wave when fish is attracted to food
        let swimY;
        if (fish.isDying) {
            swimY = fish.y;
        } else if (fish.isClicked && fish.clickedAt) {
            // 如果鱼被点击了，检查是否在冻结期内
            const timeSinceClick = Date.now() - fish.clickedAt;
            if (timeSinceClick < 5000) {
                // 5秒内使用冻结的 swimY，完全静止
                swimY = fish.frozenSwimY !== undefined ? fish.frozenSwimY : fish.y;
            } else {
                // 5秒后恢复游泳动画
                fish.isClicked = false;
                fish.clickedAt = null;
                fish.frozenSwimY = null;
                
                const fishId = fish.docId || `fish_${fishes.indexOf(fish)}`;
                const foodDetectionData = foodDetectionCache.get(fishId);
                const hasNearbyFood = foodDetectionData ? foodDetectionData.hasNearbyFood : false;
                const currentAmplitude = hasNearbyFood ? fish.amplitude * 0.3 : fish.amplitude;
                swimY = fish.y + Math.sin(time + fish.phase) * currentAmplitude;
            }
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
        <span style="font-size: 11px; color: #999;">${chatSession.participantCount || chatSession.dialogues?.length || 0} messages</span>
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

/**
 * 获取并显示用户群聊使用情况
 */
async function displayGroupChatUsage() {
    try {
        // 获取当前用户ID
        let currentUserId = null;
        
        // Try getCurrentUserId function first
        if (typeof getCurrentUserId === 'function') {
            try {
                currentUserId = await getCurrentUserId();
            } catch (error) {
                // Ignore error silently (user not logged in)
                console.log('💬 User not logged in, skipping group chat usage display');
            }
        }
        
        // Fallback to localStorage if getCurrentUserId returns null
        if (!currentUserId) {
            const userData = localStorage.getItem('userData');
            if (userData) {
                try {
                    const parsed = JSON.parse(userData);
                    currentUserId = parsed.userId || parsed.uid || parsed.id;
                } catch (error) {
                    // Ignore error
                }
            }
            
            // Also try userId directly from localStorage
            if (!currentUserId) {
                currentUserId = localStorage.getItem('userId');
            }
        }
        
        if (!currentUserId) {
            // User not logged in, skip
            return;
        }
        
        // 获取使用情况
        const usageResponse = await fetch(`/api/fish-api?action=chat-usage&userId=${encodeURIComponent(currentUserId)}`);
        if (usageResponse && usageResponse.ok) {
            const usageData = await usageResponse.json();
            if (usageData.success) {
                if (usageData.unlimited) {
                    console.log(`💬 当前用户今日已用群聊数 ${usageData.usage}（${usageData.tier} 会员，无限次）`);
                } else {
                    console.log(`💬 当前用户今日已用群聊数 ${usageData.usage}/${usageData.limit}`);
                }
            }
        }
    } catch (error) {
        // 静默失败，不影响主流程
        console.debug('Failed to get group chat usage:', error);
    }
}

// 初始化群聊功能
async function initializeGroupChat() {
    if (!communityChatManager) {
        console.warn('CommunityChatManager not initialized');
        return;
    }
    
    try {
        // 检查用户登录状态
        let isUserLoggedIn = false;
        let currentUserId = null;
        
        // Try getCurrentUserId function first
        if (typeof getCurrentUserId === 'function') {
            try {
                currentUserId = await getCurrentUserId();
                isUserLoggedIn = !!currentUserId;
            } catch (error) {
                // User not logged in
                console.log('🔒 User not logged in, group chat will be disabled');
            }
        }
        
        // Fallback to localStorage
        if (!currentUserId) {
            const userData = localStorage.getItem('userData');
            if (userData) {
                try {
                    const parsed = JSON.parse(userData);
                    currentUserId = parsed.userId || parsed.uid || parsed.id;
                    isUserLoggedIn = !!currentUserId;
                } catch (error) {
                    // Ignore
                }
            }
            if (!currentUserId) {
                currentUserId = localStorage.getItem('userId');
                isUserLoggedIn = !!currentUserId;
            }
        }
        
        // 如果用户未登录，禁用群聊但允许独白（独白是公开展示功能）
        if (!isUserLoggedIn) {
            console.log('🔒 User not logged in');
            console.log('❌ Group chat disabled (requires login)');
            console.log('✅ Monologue allowed (public feature)');
            
            // 禁用群聊
            communityChatManager.setGroupChatEnabled(false);
            updateGroupChatButton(false);
            updateFishTalkToggle(false);
            
            // 独白使用默认设置（允许启用）
            // 从环境变量或 localStorage 读取独白配置
            let monologueEnabled = false;
            const userMonologuePreference = localStorage.getItem('monologueEnabled');
            if (userMonologuePreference !== null) {
                monologueEnabled = userMonologuePreference === 'true';
                console.log(`Monologue: Using user preference: ${monologueEnabled ? 'ON' : 'OFF'}`);
            }
            communityChatManager.setMonologueEnabled(monologueEnabled);
            
            return; // 不继续初始化群聊相关配置
        }
        
        // 显示群聊使用情况（页面加载时）
        await displayGroupChatUsage();
        
        // 从API获取环境变量配置（群聊、独白和费用节省）
        const [groupChatResponse, monoChatResponse, costSavingResponse] = await Promise.all([
            fetch('/api/config-api?action=group-chat').catch(() => null),
            fetch('/api/config-api?action=mono-chat').catch(() => null),
            fetch('/api/config-api?action=chat-cost-saving').catch(() => null)
        ]);
        
        // 处理群聊配置
        let groupChatEnabled = false;
        let groupChatIntervalMinutes = 5; // Default 5 minutes
        if (groupChatResponse && groupChatResponse.ok) {
            const groupChatConfig = await groupChatResponse.json();
            const defaultGroupChatEnabled = groupChatConfig.enabled || false;
            
            // 读取群聊时间间隔配置（单位：分钟）
            if (groupChatConfig.intervalTimeMinutes !== undefined) {
                groupChatIntervalMinutes = parseInt(groupChatConfig.intervalTimeMinutes, 10) || 5;
            }
            
            // 检查用户是否手动设置过（用户设置优先）
            const userPreference = localStorage.getItem('groupChatEnabled');
            if (userPreference !== null) {
                groupChatEnabled = userPreference === 'true';
                console.log(`AI Fish Group Chat: Using user preference: ${groupChatEnabled ? 'ON' : 'OFF'}`);
            } else {
                groupChatEnabled = defaultGroupChatEnabled;
                console.log(`AI Fish Group Chat: Using environment default: ${groupChatEnabled ? 'ON' : 'OFF'}`);
            }
            
            console.log(`  AI Fish Group Chat interval: ${groupChatIntervalMinutes} minutes`);
            
            // 更新聊天面板中的间隔时间显示
            updateChatIntervalText(groupChatIntervalMinutes);
        } else {
            // 如果API失败，检查用户本地设置
            const userPreference = localStorage.getItem('groupChatEnabled');
            if (userPreference === 'true') {
                groupChatEnabled = true;
            }
        }
        
        // 处理独白配置
        let monologueEnabled = false;
        if (monoChatResponse && monoChatResponse.ok) {
            const monoChatConfig = await monoChatResponse.json();
            const defaultMonologueEnabled = monoChatConfig.enabled || false;
        
        // 检查用户是否手动设置过（用户设置优先）
            const userPreference = localStorage.getItem('monologueEnabled');
        if (userPreference !== null) {
                monologueEnabled = userPreference === 'true';
                console.log(`Monologue: Using user preference: ${monologueEnabled ? 'ON' : 'OFF'}`);
        } else {
                monologueEnabled = defaultMonologueEnabled;
                console.log(`Monologue: Using environment default: ${monologueEnabled ? 'ON' : 'OFF'}`);
        }
        }
        
        // 设置群聊间隔时间（先设置间隔，再启用，确保使用正确的间隔）
        communityChatManager.setGroupChatInterval(groupChatIntervalMinutes);
        
        // 设置群聊状态（启用时会使用已设置的间隔）
        communityChatManager.setGroupChatEnabled(groupChatEnabled);
        updateGroupChatButton(groupChatEnabled);
        updateFishTalkToggle(groupChatEnabled); // Also update hamburger menu toggle
        
        // 设置独白状态
        communityChatManager.setMonologueEnabled(monologueEnabled);
        
        // 处理费用节省配置
        let costSavingEnabled = true; // Default to enabled for safety
        let maxInactiveTimeMinutes = 15; // Default 15 minutes
        let maxRunTimeMinutes = 60; // Default 60 minutes
        
        if (costSavingResponse && costSavingResponse.ok) {
            const costSavingConfig = await costSavingResponse.json();
            costSavingEnabled = costSavingConfig.enabled !== false; // Default to true if not specified
            
            // 读取时间配置（单位：分钟）
            if (costSavingConfig.maxInactiveTimeMinutes !== undefined) {
                maxInactiveTimeMinutes = parseInt(costSavingConfig.maxInactiveTimeMinutes, 10) || 15;
            }
            if (costSavingConfig.maxRunTimeMinutes !== undefined) {
                maxRunTimeMinutes = parseInt(costSavingConfig.maxRunTimeMinutes, 10) || 60;
            }
            
            console.log(`Cost saving: ${costSavingEnabled ? 'ON' : 'OFF'}`);
            console.log(`  Max inactive time: ${maxInactiveTimeMinutes} minutes`);
            console.log(`  Max run time: ${maxRunTimeMinutes} minutes`);
        }
        
        // 设置费用节省状态和时间配置
        communityChatManager.setCostSavingEnabled(costSavingEnabled);
        communityChatManager.updateCostControlTimes(maxInactiveTimeMinutes, maxRunTimeMinutes);
        
        if (groupChatEnabled || monologueEnabled) {
            console.log(`✅ Chat features initialized: AI Fish Group Chat ${groupChatEnabled ? 'ON' : 'OFF'}, Monologue ${monologueEnabled ? 'ON' : 'OFF'}, Cost Saving ${costSavingEnabled ? 'ON' : 'OFF'}`);
            // Setup event listeners for cost control (only if cost saving is enabled)
            if (costSavingEnabled) {
                setupChatCostControlListeners();
            }
            
            // Mark as initialized after a short delay to ensure page is fully loaded
            // This prevents false "page hidden" detection during page load
            // Also ensure group chat is scheduled if it was enabled
            setTimeout(() => {
                if (communityChatManager) {
                    console.log('🔍 [DEBUG] Marking chat manager as initialized...');
                    communityChatManager.markInitialized();
                    
                    // Double-check: if group chat is enabled but interval is not set, schedule it
                    if (groupChatEnabled && !communityChatManager.autoChatInterval) {
                        console.log('⚠️ [DEBUG] Group chat enabled but no interval set, rescheduling...');
                        communityChatManager.scheduleAutoChats(communityChatManager.groupChatIntervalMinutes);
                    }
                }
            }, 2000); // 2 seconds delay to ensure page is fully loaded
        } else {
            console.log('ℹ️ Chat features initialized but disabled');
        }
    } catch (error) {
        console.error('Failed to initialize chat features:', error);
        // 默认禁用
        communityChatManager.setGroupChatEnabled(false);
        communityChatManager.setMonologueEnabled(false);
        updateGroupChatButton(false);
        updateFishTalkToggle(false); // Also update hamburger menu toggle
    }
}

// Setup event listeners for cost control (page visibility, user activity)
let costControlListenersSetup = false;
let activityThrottle = null;

function setupChatCostControlListeners() {
    if (!communityChatManager) {
        return;
    }
    
    // Only setup listeners if cost saving is enabled
    if (!communityChatManager.isCostSavingEnabled()) {
        console.log('💰 Cost saving disabled, skipping event listeners setup');
        return;
    }
    
    // Prevent duplicate listener setup
    if (costControlListenersSetup) {
        return;
    }
    
    // Initialize page visibility state (may be false during page load, so check after a delay)
    setTimeout(() => {
        if (communityChatManager) {
            const isVisible = !document.hidden;
            communityChatManager.setPageVisible(isVisible);
        }
    }, 1000); // Wait 1 second after setup to check actual visibility
    
    // Page visibility change (tab switch, minimize window)
    document.addEventListener('visibilitychange', () => {
        // Ignore visibility changes during initialization
        if (communityChatManager && communityChatManager.isInitialized) {
            const isVisible = !document.hidden;
            communityChatManager.setPageVisible(isVisible);
        }
    });
    
    // Window blur/focus (tab loses/gains focus)
    window.addEventListener('blur', () => {
        // Ignore blur events during initialization
        if (communityChatManager && communityChatManager.isInitialized) {
            communityChatManager.setPageVisible(false);
        }
    });
    
    window.addEventListener('focus', () => {
        if (communityChatManager) {
            communityChatManager.setPageVisible(true);
        }
    });
    
    // User activity detection (mouse movement, clicks, keyboard)
    const activityEvents = ['mousemove', 'mousedown', 'click', 'keydown', 'scroll', 'touchstart'];
    
    activityEvents.forEach(eventType => {
        document.addEventListener(eventType, () => {
            if (communityChatManager) {
                // Throttle activity updates to avoid excessive calls
                if (activityThrottle) {
                    clearTimeout(activityThrottle);
                }
                activityThrottle = setTimeout(() => {
                    communityChatManager.updateUserActivity();
                }, 1000); // Update at most once per second
            }
        }, { passive: true });
    });
    
    costControlListenersSetup = true;
    console.log('✅ Cost control event listeners setup complete');
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
async function toggleGroupChat() {
    if (!communityChatManager) {
        console.warn('CommunityChatManager not initialized');
        return;
    }
    
    const currentState = communityChatManager.isGroupChatEnabled();
    const newState = !currentState;
    
    // 如果尝试启用群聊，需要检查登录状态
    if (newState) {
        // 检查用户是否已登录
        let isLoggedIn = false;
        try {
            if (window.supabaseAuth && typeof window.supabaseAuth.isLoggedIn === 'function') {
                isLoggedIn = await window.supabaseAuth.isLoggedIn();
            } else if (window.supabaseAuth && typeof window.supabaseAuth.getCurrentUser === 'function') {
                const user = await window.supabaseAuth.getCurrentUser();
                isLoggedIn = !!user;
            }
        } catch (error) {
            console.error('检查登录状态时出错:', error);
            isLoggedIn = false;
        }
        
        // 如果未登录，阻止启用并显示登录提示
        if (!isLoggedIn) {
            console.log('❌ 未登录用户无法启用群聊');
            // 显示登录提示
            if (window.authUI && window.authUI.showLoginModal) {
                window.authUI.showLoginModal();
            } else {
                // Fallback: 使用 alert
                alert('请先登录以使用群聊功能');
            }
            return;
        }
    }
    
    // 已登录或禁用操作，继续执行
    // 更新管理器状态
    communityChatManager.setGroupChatEnabled(newState);
    
    // 如果启用，设置事件监听器
    if (newState) {
        setupChatCostControlListeners();
    }
    
    // 保存用户偏好到 localStorage
    localStorage.setItem('groupChatEnabled', newState ? 'true' : 'false');
    
    // 更新按钮显示
    updateGroupChatButton(newState);
    updateFishTalkToggle(newState); // Also update hamburger menu toggle
    
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

// Setup Fish Talk toggle switch in hamburger menu (Global)
function setupFishTalkToggle() {
    const toggleSwitch = document.getElementById('fish-talk-switch');
    const toggleContainer = document.getElementById('fish-talk-toggle');
    
    if (!toggleSwitch || !toggleContainer) {
        console.warn('Fish Talk toggle elements not found');
        return;
    }

    // Load saved preference (shared with my tank page)
    // 但只有在用户已登录时才应用保存的偏好
    const savedPreference = localStorage.getItem('groupChatEnabled');
    if (savedPreference === 'true') {
        // 异步检查登录状态
        (async () => {
            let isLoggedIn = false;
            try {
                if (window.supabaseAuth && typeof window.supabaseAuth.isLoggedIn === 'function') {
                    isLoggedIn = await window.supabaseAuth.isLoggedIn();
                } else if (window.supabaseAuth && typeof window.supabaseAuth.getCurrentUser === 'function') {
                    const user = await window.supabaseAuth.getCurrentUser();
                    isLoggedIn = !!user;
                }
            } catch (error) {
                console.error('检查登录状态时出错:', error);
                isLoggedIn = false;
            }
            
            // 只有登录用户才恢复保存的偏好
            if (isLoggedIn) {
                toggleSwitch.checked = true;
                updateToggleStyle(toggleSwitch, true);
            } else {
                // 未登录用户，清除保存的偏好并禁用开关
                toggleSwitch.checked = false;
                updateToggleStyle(toggleSwitch, false);
                localStorage.setItem('groupChatEnabled', 'false');
            }
        })();
    }

    // Handle toggle click
    toggleContainer.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const newState = !toggleSwitch.checked;
        
        // 如果尝试启用 Fish Talk，需要检查登录状态
        if (newState) {
            // 检查用户是否已登录
            let isLoggedIn = false;
            try {
                if (window.supabaseAuth && typeof window.supabaseAuth.isLoggedIn === 'function') {
                    isLoggedIn = await window.supabaseAuth.isLoggedIn();
                } else if (window.supabaseAuth && typeof window.supabaseAuth.getCurrentUser === 'function') {
                    const user = await window.supabaseAuth.getCurrentUser();
                    isLoggedIn = !!user;
                }
            } catch (error) {
                console.error('检查登录状态时出错:', error);
                isLoggedIn = false;
            }
            
            // 如果未登录，阻止启用并显示登录提示
            if (!isLoggedIn) {
                console.log('❌ 未登录用户无法启用 Fish Talk');
                // 恢复开关状态
                toggleSwitch.checked = false;
                updateToggleStyle(toggleSwitch, false);
                
                // 显示登录提示
                if (window.authUI && window.authUI.showLoginModal) {
                    window.authUI.showLoginModal();
                } else {
                    // Fallback: 使用 alert
                    alert('请先登录以使用 Fish Talk 功能');
                }
                return;
            }
        }
        
        // 已登录或禁用操作，继续执行
        toggleSwitch.checked = newState;
        updateToggleStyle(toggleSwitch, newState);
        
        // Update chat manager
        if (communityChatManager) {
            communityChatManager.setGroupChatEnabled(newState);
        }
        
        // Save preference (shared with my tank page)
        localStorage.setItem('groupChatEnabled', newState ? 'true' : 'false');
        
        // Also update the control bar button if it exists
        updateGroupChatButton(newState);
        
        // Trigger custom event for same-tab sync (storage event only works across tabs)
        window.dispatchEvent(new CustomEvent('groupChatEnabledChanged', {
            detail: { enabled: newState }
        }));
        
        console.log(`Fish Talk ${newState ? 'enabled' : 'disabled'} (global)`);
    });
    
    // Listen for changes from other tabs/pages (global sync)
    window.addEventListener('storage', function(e) {
        if (e.key === 'groupChatEnabled') {
            const newState = e.newValue === 'true';
            toggleSwitch.checked = newState;
            updateToggleStyle(toggleSwitch, newState);
            
            // Update chat manager
            if (communityChatManager) {
                communityChatManager.setGroupChatEnabled(newState);
            }
            
            // Also update the control bar button if it exists
            updateGroupChatButton(newState);
            
            console.log(`Fish Talk ${newState ? 'enabled' : 'disabled'} (synced from other tab)`);
        }
    });
    
    // Listen for custom event for same-tab sync
    window.addEventListener('groupChatEnabledChanged', function(e) {
        const newState = e.detail.enabled;
        toggleSwitch.checked = newState;
        updateToggleStyle(toggleSwitch, newState);
        
        // Update chat manager
        if (communityChatManager) {
            communityChatManager.setGroupChatEnabled(newState);
        }
        
        // Also update the control bar button if it exists
        updateGroupChatButton(newState);
    });
}

// Update Fish Talk toggle visual style
function updateFishTalkToggle(enabled) {
    const toggleSwitch = document.getElementById('fish-talk-switch');
    if (toggleSwitch) {
        toggleSwitch.checked = enabled;
        updateToggleStyle(toggleSwitch, enabled);
    }
}

// Update toggle switch visual style
function updateToggleStyle(toggleSwitch, enabled) {
    const slider = toggleSwitch.nextElementSibling;
    const thumb = slider ? slider.nextElementSibling : null;
    
    if (slider && thumb) {
        if (enabled) {
            slider.style.backgroundColor = '#6366F1';
            thumb.style.transform = 'translateX(24px)';
        } else {
            slider.style.backgroundColor = '#ccc';
            thumb.style.transform = 'translateX(0)';
        }
    }
}

// Initialize Fish Talk toggle when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
        setupFishTalkToggle();
        
        // Sync toggle with current state
        if (communityChatManager) {
            const currentState = communityChatManager.isGroupChatEnabled();
            updateFishTalkToggle(currentState);
        }
    }, 500);
});

// 更新聊天间隔时间显示
function updateChatIntervalText(intervalMinutes) {
    const intervalTextEl = document.getElementById('chat-interval-text');
    if (intervalTextEl) {
        if (intervalMinutes === 1) {
            intervalTextEl.textContent = 'New conversations every minute';
        } else {
            intervalTextEl.textContent = `New conversations every ${intervalMinutes} minutes`;
        }
    }
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
