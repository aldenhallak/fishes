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
        peduncle
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
                direction: fishData.direction || fishData.Direction || 1,
                phase: fishData.phase || 0,
                amplitude: fishData.amplitude || 24,
                speed: fishData.speed || 2,
                artist: fishData.artist || fishData.Artist || 'Anonymous',
                createdAt: fishData.createdAt || fishData.CreatedAt || null,
                docId: fishData.docId || null,
                peduncle: fishData.peduncle || .4,
                width: fishSize.width,
                height: fishSize.height
            });
            fishes.push(fishObj);
            
            if (onDone) onDone(fishObj);
        } else {
            console.warn('Fish image did not load or is blank:', imgUrl);
        }
    };
    img.src = imgUrl;
}

async function getAllFishes() {
    const allDocs = [];
    let lastDoc = null;
    const pageSize = 100;

    while (true) {
        let query = window.db.collection('fishes_test')
            .orderBy("CreatedAt")
            .limit(pageSize);

        if (lastDoc) {
            query = query.startAfter(lastDoc.data().CreatedAt);
        }

        const snapshot = await query.get();
        snapshot.forEach(doc => allDocs.push(doc));

        if (snapshot.size < pageSize) break;
        lastDoc = snapshot.docs[snapshot.docs.length - 1];
    }

    return allDocs;
}

window.addEventListener('DOMContentLoaded', async () => {
    // Load all fish from Firestore on page load (fetch all pages)
    const allFishDocs = await getAllFishes();
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
});

function showFishInfoModal(fish) {
    const fishImgCanvas = document.createElement('canvas');
    fishImgCanvas.width = fish.width;
    fishImgCanvas.height = fish.height;
    fishImgCanvas.getContext('2d').drawImage(fish.fishCanvas, 0, 0);
    const imgDataUrl = fishImgCanvas.toDataURL();
    
    // Scale display size for modal (max 80x48, maintain aspect ratio)
    const modalWidth = Math.min(80, fish.width);
    const modalHeight = Math.min(48, fish.height);
    
    let info = `<div style='text-align:center;'>`;
    info += `<img src='${imgDataUrl}' width='${modalWidth}' height='${modalHeight}' style='display:block;margin:0 auto 10px auto;border-radius:8px;border:1px solid #ccc;background:#f8f8f8;' alt='Fish'><br>`;
    info += `<b>Artist:</b> ${fish.artist || 'Anonymous'}<br>`;
    if (fish.createdAt) {
        let dateObj;
        if (typeof fish.createdAt === 'string') {
            dateObj = new Date(fish.createdAt);
        } else if (typeof fish.createdAt.toDate === 'function') {
            dateObj = fish.createdAt.toDate();
        } else {
            dateObj = fish.createdAt;
        }
        if (!isNaN(dateObj)) {
            info += `<b>Created:</b> ${dateObj.toLocaleString()}<br>`;
        }
    }
    info += `</div>`;
    showModal(info, () => { });
}

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
    for (const fish of fishes) {
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
        const swimY = fish.y + Math.sin(time + fish.phase) * fish.amplitude;
        drawWigglingFish(fish, fish.x, swimY, fish.direction, time, fish.phase);
        if (fish.x > swimCanvas.width - fish.width || fish.x < 0) {
            fish.direction *= -1;
        }
        fish.x = Math.max(0, Math.min(swimCanvas.width - fish.width, fish.x));
        fish.y = Math.max(0, Math.min(swimCanvas.height - fish.height, fish.y));
    }
    requestAnimationFrame(animateFishes);
}

function drawWigglingFish(fish, x, y, direction, time, phase) {
    const src = fish.fishCanvas;
    const w = fish.width;
    const h = fish.height;
    const tailEnd = Math.floor(w * fish.peduncle);
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
        swimCtx.drawImage(src, drawCol, 0, 1, h, 0, 0, 1, h);
        swimCtx.restore();
    }
}
requestAnimationFrame(animateFishes);
