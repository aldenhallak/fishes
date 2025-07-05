// Fish Tank Only JS
// This file contains only the logic for displaying and animating the fish tank.

const swimCanvas = document.getElementById('swim-canvas');
const swimCtx = swimCanvas.getContext('2d');
const fishes = [];

// Environmental elements
const bubbles = [];
const particles = [];
const kelpStrands = [];
const foregroundKelp = [];
const maxBubbles = 15; // Limit bubbles for performance
const maxParticles = 8; // Limit particles for performance
const maxKelp = 8; // Limit kelp strands for performance
const maxForegroundKelp = 3; // Fewer foreground kelp for performance

// Create environmental bubble
function createBubble() {
    return {
        x: Math.random() * swimCanvas.width,
        y: swimCanvas.height + 10,
        radius: Math.random() * 4 + 2,
        speed: Math.random() * 0.5 + 0.3,
        wobble: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.4 + 0.2
    };
}

// Create floating particle (food/debris)
function createParticle() {
    return {
        x: Math.random() * swimCanvas.width,
        y: Math.random() * swimCanvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        life: 1,
        decay: Math.random() * 0.001 + 0.0005,
        color: `hsl(${Math.random() * 60 + 30}, 60%, 70%)` // Yellowish particles
    };
}

// Create kelp strand within a cluster
function createKelpStrand(clusterCenterX, clusterRadius, strandIndex = 0, totalStrands = 1) {
    // Vary height based on position in cluster - center strands tend to be taller
    const centerDistance = Math.abs(strandIndex - totalStrands / 2) / (totalStrands / 2);
    const heightModifier = 1 - (centerDistance * 0.2); // Center strands up to 20% taller
    const height = (Math.random() * 0.35 + 0.25) * heightModifier; // 25-60% of tank height (much shorter)
    const segments = Math.floor(height * swimCanvas.height / 20) + 3;
    
    // Position within the cluster with some clustering bias toward center
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * clusterRadius * (0.7 + Math.random() * 0.3); // Slightly favor center
    const x = clusterCenterX + Math.cos(angle) * distance;
    
    return {
        x: Math.max(20, Math.min(swimCanvas.width - 20, x)), // Keep within bounds
        baseY: swimCanvas.height + (Math.random() - 0.5) * 5, // Slight variation in ground level
        height: height * swimCanvas.height,
        segments: segments,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayAmount: Math.random() * 15 + 5,
        phase: Math.random() * Math.PI * 2,
        thickness: Math.random() * 3 + 2,
        color: `hsl(${Math.random() * 40 + 80}, ${Math.random() * 30 + 60}%, ${Math.random() * 20 + 25}%)` // Green variations
    };
}

// Create a cluster of kelp
function createKelpCluster(centerX, radius, strandCount) {
    const cluster = [];
    for (let i = 0; i < strandCount; i++) {
        cluster.push(createKelpStrand(centerX, radius, i, strandCount));
    }
    return cluster;
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
        // Enhanced behavior properties
        baseSpeed: speed,
        targetX: x,
        targetY: y,
        idleTime: 0,
        lastDirectionChange: 0,
        schooling: Math.random() > 0.7, // 30% chance to be schooling fish
        personality: Math.random(), // 0 = shy, 1 = bold
        depthPreference: Math.random() * 0.6 + 0.2, // Prefer different depth levels
        restingPhase: Math.random() * 100, // For occasional resting
        preferredKelpDistance: Math.random() * 40 + 20, // Preferred distance from kelp (20-60 pixels)
        exploringMode: Math.random() > 0.5 // Some fish prefer exploring between kelp
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

// Enhanced fish behavior functions
function updateFishBehavior(fish, time, allFish) {
    // Skip behavior updates for dying or entering fish
    if (fish.isDying || fish.isEntering) return;
    
    // Update idle time
    fish.idleTime++;
    
    // Subtle schooling behavior - find nearby fish (much weaker influence)
    if (fish.schooling && allFish.length > 1) {
        const nearbyFish = allFish.filter(otherFish => {
            if (otherFish === fish || otherFish.isDying || otherFish.isEntering) return false;
            const dx = otherFish.x - fish.x;
            const dy = otherFish.y - fish.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < 80; // Smaller schooling radius
        });
        
        if (nearbyFish.length > 0) {
            // Calculate average position of nearby fish
            let avgX = 0, avgY = 0;
            nearbyFish.forEach(otherFish => {
                avgX += otherFish.x;
                avgY += otherFish.y;
            });
            avgX /= nearbyFish.length;
            avgY /= nearbyFish.length;
            
            // Very gentle pull toward school (much weaker)
            const pullStrength = 0.005 * fish.personality;
            fish.vy += (avgY - fish.y) * pullStrength; // Only slight vertical influence
        }
    }
    
    // Gentle depth preference behavior
    const preferredY = swimCanvas.height * fish.depthPreference;
    const depthDiff = preferredY - fish.y;
    if (Math.abs(depthDiff) > 50) {
        fish.vy += depthDiff * 0.003; // Much gentler depth correction
    }
    
    // Enhanced kelp interaction - fish naturally navigate between clusters
    if (kelpStrands.length > 0) {
        // Find nearby kelp for navigation
        const nearbyKelp = kelpStrands.filter(kelp => {
            const distance = Math.sqrt(Math.pow(kelp.x - fish.x, 2) + Math.pow(kelp.y - fish.y, 2));
            return distance < 80; // Within 80 pixels
        });
        
        if (nearbyKelp.length > 0) {
            // Shy fish hide behind kelp
            if (fish.personality < 0.6) {
                const closestKelp = nearbyKelp.reduce((closest, kelp) => {
                    const distFish = Math.sqrt(Math.pow(kelp.x - fish.x, 2) + Math.pow(kelp.y - fish.y, 2));
                    const distClosest = Math.sqrt(Math.pow(closest.x - fish.x, 2) + Math.pow(closest.y - fish.y, 2));
                    return distFish < distClosest ? kelp : closest;
                });
                
                const pullStrength = 0.008 * (1 - fish.personality);
                fish.vx += (closestKelp.x - fish.x) * pullStrength;
                fish.vy += (closestKelp.y - fish.y) * pullStrength;
            }
            
            // All fish navigate between kelp clusters
            nearbyKelp.forEach(kelp => {
                const dx = kelp.x - fish.x;
                const dy = kelp.y - fish.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Avoid very close kelp (collision avoidance)
                if (distance < 30) {
                    const avoidStrength = 0.02;
                    fish.vx -= (dx / distance) * avoidStrength;
                    fish.vy -= (dy / distance) * avoidStrength;
                }
            });
            
            // Find swimming lanes between kelp clusters
            if (fish.exploringMode && nearbyKelp.length >= 2) {
                // Find the midpoint between two kelp clusters
                const kelp1 = nearbyKelp[0];
                const kelp2 = nearbyKelp[1];
                const midX = (kelp1.x + kelp2.x) / 2;
                const midY = (kelp1.y + kelp2.y) / 2;
                
                // Gentle attraction to swim in the lane between kelp
                const laneStrength = 0.004;
                fish.vx += (midX - fish.x) * laneStrength;
                fish.vy += (midY - fish.y) * laneStrength;
            }
            
            // Bold fish prefer to swim in open areas
            if (fish.personality > 0.7) {
                const averageKelpX = nearbyKelp.reduce((sum, kelp) => sum + kelp.x, 0) / nearbyKelp.length;
                const averageKelpY = nearbyKelp.reduce((sum, kelp) => sum + kelp.y, 0) / nearbyKelp.length;
                
                // Swim away from dense kelp areas
                const openWaterStrength = 0.003;
                fish.vx -= (averageKelpX - fish.x) * openWaterStrength;
                fish.vy -= (averageKelpY - fish.y) * openWaterStrength;
            }
        }
    }
    
    // Subtle vertical drift
    if (Math.abs(fish.vy) < 0.1) {
        fish.vy += (Math.random() - 0.5) * 0.3;
    }
    
    // Occasional random direction changes (but keep swimming)
    if (fish.idleTime > 400 + Math.random() * 300) {
        fish.idleTime = 0;
        // Slight speed variation instead of stopping
        fish.speed = fish.baseSpeed * (0.6 + Math.random() * 0.8);
        fish.vy += (Math.random() - 0.5) * 1.5;
        
        // Occasionally flip direction with brief pause
        if (Math.random() < 0.25) {
            fish.direction *= -1;
            fish.speed *= 0.3; // Brief pause during turn
        }
        
        // Occasionally dart between kelp clusters
        if (Math.random() < 0.15 && kelpStrands.length > 0) {
            const randomKelp = kelpStrands[Math.floor(Math.random() * kelpStrands.length)];
            const dx = randomKelp.x - fish.x;
            const dy = randomKelp.y - fish.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 60 && distance < 200) {
                // Quick dart toward or away from kelp
                const dartStrength = fish.personality > 0.5 ? 3 : -2; // Bold fish dart toward, shy fish dart away
                fish.vx += (dx / distance) * dartStrength;
                fish.vy += (dy / distance) * dartStrength;
                fish.speed = fish.baseSpeed * 1.5; // Speed up during dart
            }
        }
    }
    
    // Occasional resting behavior (less frequent)
    if (Math.sin(time * 0.005 + fish.restingPhase) > 0.98) {
        fish.speed = fish.baseSpeed * 0.5; // Slow down but keep moving
        fish.amplitude = Math.max(8, fish.amplitude * 0.9); // Reduce swimming motion
    } else {
        fish.speed = fish.baseSpeed;
        fish.amplitude = Math.min(24, fish.amplitude * 1.01); // Restore swimming motion
    }
    
    // Apply gentle damping to vertical movement only
    fish.vy *= 0.98;
    
    // Limit vertical velocities (horizontal movement is handled by main loop)
    fish.vy = Math.max(-2, Math.min(2, fish.vy));
}

// Update environmental effects
function updateEnvironmentalEffects(time) {
    // Update bubbles
    for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        bubble.y -= bubble.speed;
        bubble.x += Math.sin(time * bubble.wobble + bubble.phase) * 0.5;
        
        // Remove bubbles that reach the top
        if (bubble.y + bubble.radius < 0) {
            bubbles.splice(i, 1);
        }
    }
    
    // Add new bubbles occasionally (reduced rate if performance is low)
    const bubbleRate = 0.02 * performanceLevel;
    if (bubbles.length < maxBubbles * performanceLevel && Math.random() < bubbleRate) {
        bubbles.push(createBubble());
    }
    
    // Occasionally create bubbles near kelp clusters
    if (kelpStrands.length > 0 && Math.random() < 0.008 * performanceLevel) {
        const randomKelp = kelpStrands[Math.floor(Math.random() * kelpStrands.length)];
        // Create 2-3 bubbles near the kelp base for more realistic effect
        const bubbleCount = Math.floor(Math.random() * 2) + 1;
        
        for (let i = 0; i < bubbleCount; i++) {
            bubbles.push({
                x: randomKelp.x + (Math.random() - 0.5) * 30,
                y: randomKelp.baseY - Math.random() * 30,
                radius: Math.random() * 2 + 1,
                speed: Math.random() * 0.8 + 0.4,
                wobble: Math.random() * 0.02 + 0.01,
                phase: Math.random() * Math.PI * 2,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    }
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life -= particle.decay;
        
        // Wrap particles around screen
        if (particle.x < 0) particle.x = swimCanvas.width;
        if (particle.x > swimCanvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = swimCanvas.height;
        if (particle.y > swimCanvas.height) particle.y = 0;
        
        // Remove dead particles
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    // Add new particles occasionally (reduced rate if performance is low)
    const particleRate = 0.01 * performanceLevel;
    if (particles.length < maxParticles * performanceLevel && Math.random() < particleRate) {
        particles.push(createParticle());
    }
}

// Draw kelp strand
function drawKelpStrand(ctx, kelp, time) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = kelp.color;
    ctx.lineWidth = kelp.thickness;
    ctx.lineCap = 'round';
    
    // Calculate sway effect
    const sway = Math.sin(time * kelp.swaySpeed + kelp.phase) * kelp.swayAmount;
    
    // Draw kelp as connected segments
    ctx.beginPath();
    
    for (let i = 0; i <= kelp.segments; i++) {
        const progress = i / kelp.segments;
        const y = kelp.baseY - (progress * kelp.height);
        
        // Progressive sway - more sway at the top
        const currentSway = sway * progress * progress;
        const x = kelp.x + currentSway;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    
    // Add some small leaves/fronds
    if (performanceLevel > 0.5) {
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 1;
        
        for (let i = 2; i < kelp.segments - 1; i += 2) {
            const progress = i / kelp.segments;
            const y = kelp.baseY - (progress * kelp.height);
            const currentSway = sway * progress * progress;
            const x = kelp.x + currentSway;
            
            // Small fronds
            const frondLength = kelp.thickness * 2;
            const frondAngle = Math.sin(time * 2 + kelp.phase + i) * 0.5;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(frondAngle) * frondLength, y + Math.sin(frondAngle) * frondLength);
            ctx.moveTo(x, y);
            ctx.lineTo(x - Math.cos(frondAngle) * frondLength, y + Math.sin(frondAngle) * frondLength);
            ctx.stroke();
        }
    }
    
    ctx.restore();
}

// Draw environmental effects
function drawEnvironmentalEffects(ctx) {
    const time = Date.now() * 0.001;
    
    // Draw subtle water gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, swimCanvas.height);
    gradient.addColorStop(0, 'rgba(135, 206, 235, 0.03)'); // Light blue at top
    gradient.addColorStop(1, 'rgba(25, 25, 112, 0.08)'); // Darker blue at bottom
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, swimCanvas.width, swimCanvas.height);
    
    // Draw kelp in background (behind fish)
    kelpStrands.forEach(kelp => {
        drawKelpStrand(ctx, kelp, time);
    });
    
    // Draw subtle water surface ripples (very minimal)
    if (performanceLevel > 0.7) {
        ctx.save();
        ctx.globalAlpha = 0.02;
        ctx.strokeStyle = '#87CEEB';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const y = 20 + i * 15;
            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x < swimCanvas.width; x += 20) {
                const waveY = y + Math.sin(time * 0.5 + x * 0.01 + i) * 3;
                ctx.lineTo(x, waveY);
            }
            ctx.stroke();
        }
        ctx.restore();
    }
    
    // Draw bubbles
    bubbles.forEach(bubble => {
        ctx.save();
        ctx.globalAlpha = bubble.opacity;
        ctx.strokeStyle = '#87CEEB';
        ctx.fillStyle = 'rgba(135, 206, 235, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    });
    
    // Draw particles
    particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life * 0.7;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

// Using shared utility function from fish-utils.js

// Global variable to track the newest fish timestamp and listener
let newestFishTimestamp = null;
let newFishListener = null;
let maxTankCapacity = 50; // Dynamic tank capacity controlled by slider
let isUpdatingCapacity = false; // Prevent multiple simultaneous updates

// Performance monitoring
let frameCount = 0;
let lastFpsTime = Date.now();
let currentFps = 60;
let performanceLevel = 1; // 1 = full effects, 0.5 = reduced effects, 0 = minimal effects

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
    
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = `new fish from ${artistName}!`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        color: black;
        background: white;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        pointer-events: none;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
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
    info += `<img src='${imgDataUrl}' width='${modalWidth}' height='${modalHeight}' style='display:block;margin:0 auto 15px auto;border-radius:8px;border:1px solid #ccc;background:#f8f8f8;' alt='Fish'><br>`;
    info += `<div style='margin-bottom:15px;'>`;
    info += `<b>Artist:</b> ${fish.artist || 'Anonymous'}<br>`;
    if (fish.createdAt) {
        info += `<b>Created:</b> ${formatDate(fish.createdAt)}<br>`;
    }
    const score = calculateScore(fish);
    info += `<b class="modal-score">Score: ${score}</b>`;
    info += `</div>`;

    // Add voting controls using shared utility
    info += createVotingControlsHTML(fish.docId, fish.upvotes || 0, fish.downvotes || 0, false, 'modal-controls');
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
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.35)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.innerHTML = `<div style="background:#fff;padding:28px 24px 18px 24px;border-radius:12px;box-shadow:0 4px 32px #0002;min-width:260px;max-width:90vw;max-height:90vh;overflow:auto;">${html}</div>`;
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
    
    // Create some bubbles at tap location
    for (let i = 0; i < 3; i++) {
        if (bubbles.length < maxBubbles) {
            bubbles.push({
                x: tapX + (Math.random() - 0.5) * 30,
                y: tapY + (Math.random() - 0.5) * 30,
                radius: Math.random() * 3 + 2,
                speed: Math.random() * 1 + 0.5,
                wobble: Math.random() * 0.03 + 0.02,
                phase: Math.random() * Math.PI * 2,
                opacity: Math.random() * 0.6 + 0.4
            });
        }
    }
    
    // Also create bubbles near kelp if tapped near them
    if (kelpStrands.length > 0) {
        const nearbyKelp = kelpStrands.filter(kelp => {
            const distance = Math.sqrt(Math.pow(kelp.x - tapX, 2) + Math.pow(kelp.y - tapY, 2));
            return distance < 60;
        });
        
        nearbyKelp.forEach(kelp => {
            if (bubbles.length < maxBubbles) {
                bubbles.push({
                    x: kelp.x + (Math.random() - 0.5) * 20,
                    y: kelp.baseY - Math.random() * 20,
                    radius: Math.random() * 2 + 1,
                    speed: Math.random() * 0.8 + 0.4,
                    wobble: Math.random() * 0.02 + 0.01,
                    phase: Math.random() * Math.PI * 2,
                    opacity: Math.random() * 0.4 + 0.3
                });
            }
        });
    }
    
    fishes.forEach(fish => {
        const fx = fish.x + fish.width / 2;
        const fy = fish.y + fish.height / 2;
        const dx = fx - tapX;
        const dy = fy - tapY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radius) {
            // Fish react based on their personality
            const shyness = 1 - fish.personality;
            const force = (8 + shyness * 4) * (1 - dist / radius);
            const norm = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Apply force (gentler than before)
            fish.vx = (dx / norm) * force * (0.3 + shyness * 0.4);
            fish.vy = (dy / norm) * force * (0.2 + shyness * 0.3);
            
            // Only change direction if force is significant
            if (Math.abs(fish.vx) > 2) {
                fish.direction = dx > 0 ? 1 : -1;
            }
            
            // Reset idle time to trigger more active behavior
            fish.idleTime = 0;
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
        
        // Regenerate kelp clusters for new canvas size
        kelpStrands.length = 0;
        foregroundKelp.length = 0;
        
        const numClusters = Math.min(6, Math.floor(swimCanvas.width / 120) + 2);
        
        for (let i = 0; i < numClusters; i++) {
            const baseX = (swimCanvas.width / (numClusters + 1)) * (i + 1);
            const clusterX = baseX + (Math.random() - 0.5) * 40;
            const clusterRadius = 25 + Math.random() * 20;
            const strandsPerCluster = 3 + Math.floor(Math.random() * 3);
            
            // Create background kelp cluster
            const backgroundCluster = createKelpCluster(clusterX, clusterRadius, strandsPerCluster);
            kelpStrands.push(...backgroundCluster);
            
            // 50% chance to add a foreground kelp cluster
            if (Math.random() < 0.5) {
                const foregroundCluster = createKelpCluster(
                    clusterX + (Math.random() - 0.5) * 50,
                    clusterRadius * 0.7,
                    Math.floor(strandsPerCluster * 0.6)
                );
                
                // Make foreground kelp more prominent
                foregroundCluster.forEach(kelp => {
                    kelp.height = kelp.height * 1.2;
                    kelp.thickness = kelp.thickness * 1.4;
                    kelp.color = `hsl(${Math.random() * 30 + 85}, ${Math.random() * 20 + 70}%, ${Math.random() * 15 + 18}%)`;
                });
                
                foregroundKelp.push(...foregroundCluster);
            }
        }
    }
}
window.addEventListener('resize', resizeForMobile);
resizeForMobile();

// Initialize environmental effects
function initializeEnvironmentalEffects() {
    // Add some initial bubbles (fewer to start)
    for (let i = 0; i < 3; i++) {
        bubbles.push(createBubble());
    }
    
    // Add some initial particles (fewer to start)
    for (let i = 0; i < 2; i++) {
        particles.push(createParticle());
    }
    
    // Add kelp clusters
    const numClusters = Math.min(12, Math.floor(swimCanvas.width / 120) + 2); // 2-12 clusters based on width
    
    for (let i = 0; i < numClusters; i++) {
        // Position clusters with some spacing and randomness
        const baseX = (swimCanvas.width / (numClusters + 1)) * (i + 1);
        const clusterX = baseX + (Math.random() - 0.5) * 40; // Add some randomness
        const clusterRadius = 25 + Math.random() * 20; // 25-45 pixel radius (smaller)
        const strandsPerCluster = 3 + Math.floor(Math.random() * 3); // 3-5 strands per cluster
        
        // Create background kelp cluster
        const backgroundCluster = createKelpCluster(clusterX, clusterRadius, strandsPerCluster);
        kelpStrands.push(...backgroundCluster);
        
        // 50% chance to add a foreground kelp cluster
        if (Math.random() < 0.5) {
            const foregroundCluster = createKelpCluster(
                clusterX + (Math.random() - 0.5) * 50, // Slightly offset from background
                clusterRadius * 0.7, // Smaller radius
                Math.floor(strandsPerCluster * 0.6) // Fewer strands
            );
            
            // Make foreground kelp more prominent
            foregroundCluster.forEach(kelp => {
                kelp.height = kelp.height * 1.2; // Taller
                kelp.thickness = kelp.thickness * 1.4; // Thicker
                kelp.color = `hsl(${Math.random() * 30 + 85}, ${Math.random() * 20 + 70}%, ${Math.random() * 15 + 18}%)`; // Darker green
            });
            
            foregroundKelp.push(...foregroundCluster);
        }
    }
}

// Initialize when page loads
initializeEnvironmentalEffects();

function animateFishes() {
    swimCtx.clearRect(0, 0, swimCanvas.width, swimCanvas.height);
    const time = Date.now() / 500;
    
    // Performance monitoring
    frameCount++;
    const now = Date.now();
    if (now - lastFpsTime >= 1000) {
        currentFps = frameCount;
        frameCount = 0;
        lastFpsTime = now;
        
        // Adjust performance level based on FPS
        if (currentFps < 30) {
            performanceLevel = Math.max(0, performanceLevel - 0.1);
        } else if (currentFps > 50) {
            performanceLevel = Math.min(1, performanceLevel + 0.05);
        }
    }
    
    // Update environmental effects (skip if performance is low)
    if (performanceLevel > 0.3) {
        updateEnvironmentalEffects(time);
    }
    
    // Draw environmental effects (background)
    if (performanceLevel > 0.2) {
        drawEnvironmentalEffects(swimCtx);
    }
    
    // Update fish count display occasionally
    if (Math.floor(time) % 2 === 0) { // Every 2 seconds
        updateCurrentFishCount();
    }
    
    // Show performance indicator in console if performance drops significantly
    if (currentFps < 20 && Math.floor(time) % 10 === 0) {
        console.log(`Tank performance: ${currentFps} FPS (Effects level: ${Math.round(performanceLevel * 100)}%)`);
    }
    
    // Debug info (uncomment to see kelp cluster info)
    // if (Math.floor(time) % 5 === 0 && frameCount === 0) {
    //     console.log(`Kelp clusters: ${kelpStrands.length} background + ${foregroundKelp.length} foreground strands`);
    // }
    
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
            // Enhanced fish behavior (skip advanced behaviors if performance is low)
            if (performanceLevel > 0.4) {
                updateFishBehavior(fish, time, fishes);
            }
            
            // Main horizontal swimming motion (always active)
            fish.x += fish.speed * fish.direction;
            
            // Apply subtle vertical movement from behaviors
            if (fish.vy) {
                fish.y += fish.vy;
            }
            
            // Handle external forces (from tapping) with decay
            if (fish.vx) {
                fish.x += fish.vx;
                fish.vx *= 0.92; // Decay the external force
                if (Math.abs(fish.vx) < 0.5) fish.vx = 0;
                
                // Update direction based on external force
                if (Math.abs(fish.vx) > 0.1) {
                    fish.direction = fish.vx > 0 ? 1 : -1;
                }
            }
            
            // Boundary constraints with direction flip
            if (fish.x > swimCanvas.width - fish.width || fish.x < 0) {
                fish.direction *= -1;
                fish.vx = 0; // Clear external forces when hitting boundary
            }
            fish.x = Math.max(0, Math.min(swimCanvas.width - fish.width, fish.x));
            fish.y = Math.max(0, Math.min(swimCanvas.height - fish.height, fish.y));
        }
        
        // Enhanced swimming motion with personality
        const swimAmplitude = fish.amplitude * (0.7 + 0.3 * fish.personality);
        const swimFrequency = 1 + (fish.personality * 0.3);
        const swimY = fish.isDying ? fish.y : fish.y + Math.sin(time * swimFrequency + fish.phase) * swimAmplitude;
        
        drawWigglingFish(fish, fish.x, swimY, fish.direction, time, fish.phase);
    }
    
    // Draw foreground kelp (in front of fish)
    if (performanceLevel > 0.3) {
        foregroundKelp.forEach(kelp => {
            swimCtx.save();
            swimCtx.globalAlpha = 0.3; // Make it semi-transparent so fish can be seen through it
            drawKelpStrand(swimCtx, kelp, time);
            swimCtx.restore();
        });
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
