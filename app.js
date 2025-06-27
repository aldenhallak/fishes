// Drawing logic
const canvas = document.getElementById('draw-canvas');
const ctx = canvas.getContext('2d');
ctx.lineWidth = 6; // Make lines thicker for better visibility in the tank
let drawing = false;

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});
canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
});
canvas.addEventListener('mouseup', () => {
    drawing = false;
});
canvas.addEventListener('mouseleave', () => {
    drawing = false;
});

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    drawing = true;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
});
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (drawing) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
        ctx.stroke();
    }
});
canvas.addEventListener('touchend', () => {
    drawing = false;
});
canvas.addEventListener('touchcancel', () => {
    drawing = false;
});

// Swim logic
const swimBtn = document.getElementById('swim-btn');
const swimCanvas = document.getElementById('swim-canvas');
const swimCtx = swimCanvas.getContext('2d');

// Store all fish objects (add artist, createdAt, docId)
const fishes = [];

// Modal helpers
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

// Helper to fetch all fishes from Firestore with pagination using document ID
async function getAllFishes() {
    const allDocs = [];
    let lastDoc = null;
    const pageSize = 100;
    while (true) {
        let query = window.db.collection('fishes').limit(pageSize);
        if (lastDoc) query = query.startAfter(lastDoc.id);
        const snapshot = await query.get();
        snapshot.forEach(doc => allDocs.push(doc));
        if (snapshot.size < pageSize) break;
        lastDoc = snapshot.docs[snapshot.docs.length - 1];
    }
    return allDocs;
}

// --- Fish object creation helper ---
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
    peduncle = { x: 0.4 }
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

// --- Fish image loading helper ---
function loadFishImageToTank(imgUrl, fishData, onDone) {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        const displayCanvas = makeDisplayFishCanvas(img, 80, 48);
        if (displayCanvas && displayCanvas.width && displayCanvas.height) {
            // Clamp x and y to ensure fish are always visible and not negative
            const maxX = Math.max(0, swimCanvas.width - 80);
            const maxY = Math.max(0, swimCanvas.height - 48);
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
                peduncle: fishData.peduncle || { x: 0.4 }
            });
            fishes.push(fishObj);
            if (onDone) onDone(fishObj);
        } else {
            console.warn('Fish image did not load or is blank:', imgUrl);
        }
    };
    img.src = imgUrl;
}

// --- Fish submission helper ---
async function submitFishToTank({
    fishCanvas,
    x,
    y,
    direction,
    phase,
    amplitude,
    speed,
    artist,
    createdAt,
    docId = null
}) {
    const fishImgData = fishCanvas.toDataURL('image/png');
    const img = new window.Image();
    img.onload = function() {
        const displayCanvas = makeDisplayFishCanvas(img, 80, 48);
        fishes.push(createFishObject({
            fishCanvas: displayCanvas,
            x,
            y,
            direction,
            phase,
            amplitude,
            speed,
            artist,
            createdAt,
            docId
        }));
    };
    img.src = fishImgData;
}

// On page load, show drawing UI only if user hasn't submitted a fish
window.addEventListener('DOMContentLoaded', async () => {
    const hasSubmitted = localStorage.getItem('fishSubmitted');
    const drawUI = document.getElementById('draw-ui');
    // Use the already-declared swimCanvas variable
    if (hasSubmitted) {
        if (drawUI) drawUI.style.display = 'none';
        if (swimCanvas) swimCanvas.style.display = '';
    } else {
        if (drawUI) drawUI.style.display = '';
        if (swimCanvas) swimCanvas.style.display = 'none';
    }
    // Load all fish from Firestore on page load (fetch all pages)
    const allFishDocs = await getAllFishes();
    allFishDocs.forEach(doc => {
        const data = doc.data();
        // Accept both 'image' and 'Image' keys for compatibility
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

swimBtn.addEventListener('click', async () => {
    // Save fish at a fixed resolution (e.g., 320x192)
    const SAVE_W = 320;
    const SAVE_H = 192;
    const fishCanvas = document.createElement('canvas');
    fishCanvas.width = SAVE_W;
    fishCanvas.height = SAVE_H;
    const fishCtx = fishCanvas.getContext('2d');
    fishCtx.imageSmoothingEnabled = true;
    fishCtx.imageSmoothingQuality = 'high';
    fishCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, SAVE_W, SAVE_H);
    // Randomize initial position and direction
    const direction = Math.random() > 0.5 ? 1 : -1;
    const x = Math.floor(Math.random() * (swimCanvas.width - 80));
    const y = Math.floor(Math.random() * (swimCanvas.height - 48));
    const fishObj = {
        fishCanvas,
        x,
        y,
        direction,
        phase: Math.random() * Math.PI * 2,
        amplitude: 20 + Math.random() * 10,
        speed: 1.5 + Math.random(),
        vx: 0,
        vy: 0,
        width: 80,
        height: 48
    };
    // Modal: Would you like to sign the art?
    showModal(`<div style='text-align:center;'>Would you like to sign the art?<br><br>
        <button id='sign-yes' style='margin:0 12px 0 0;padding:6px 18px;'>Yes</button>
        <button id='sign-no' style='padding:6px 18px;'>No</button></div>`, () => {});
    // Helper to handle fish submission (shared by sign-yes and sign-no)
    async function submitFish(artist) {
        const createdAt = new Date().toISOString();
        const fishImgData = fishCanvas.toDataURL('image/png');
        // Convert dataURL to Blob
        function dataURLtoBlob(dataurl) {
            const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
            return new Blob([u8arr], { type: mime });
        }
        const imageBlob = dataURLtoBlob(fishImgData);
        const formData = new FormData();
        formData.append('image', imageBlob, 'fish.png');
        formData.append('artist', artist);
        await fetch('https://fishes-be-571679687712.northamerica-northeast1.run.app/uploadfish', {
            method: 'POST',
            body: formData
        });
        // Add to tank immediately
        await submitFishToTank({
            fishCanvas,
            x: Math.random() * (swimCanvas.width - 80),
            y: Math.random() * (swimCanvas.height - 48),
            direction,
            phase: fishObj.phase,
            amplitude: fishObj.amplitude,
            speed: fishObj.speed,
            artist,
            createdAt
        });
        localStorage.setItem('fishSubmitted', 'true');
        const drawUI = document.getElementById('draw-ui');
        if (drawUI) drawUI.style.display = 'none';
        if (swimCanvas) swimCanvas.style.display = '';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.querySelector('div[style*="z-index: 9999"]')?.remove();
    }

    document.getElementById('sign-yes').onclick = async () => {
        document.querySelector('div[style*="z-index: 9999"]')?.remove();
        showModal(`<div style='text-align:center;'>Enter your name:<br><input id='artist-name' style='margin:10px 0 16px 0;padding:6px;width:80%;max-width:180px;'><br>
            <button id='submit-fish' style='padding:6px 18px;'>Submit</button></div>`, () => {});
        document.getElementById('submit-fish').onclick = async () => {
            const artist = document.getElementById('artist-name').value.trim() || 'Anonymous';
            await submitFish(artist);
        };
    };
    document.getElementById('sign-no').onclick = async () => {
        document.querySelector('div[style*="z-index: 9999"]')?.remove();
        await submitFish('Anonymous');
    };
});

// Paint options UI
const colors = ['#000000', '#ff0000', '#00cc00', '#0000ff', '#ffff00', '#ff8800', '#ffffff'];
let currentColor = colors[0];
let currentLineWidth = 6;
let undoStack = [];

function createPaintOptions() {
    let paintBar = document.getElementById('paint-bar');
    if (!paintBar) {
        paintBar = document.createElement('div');
        paintBar.id = 'paint-bar';
        paintBar.style.display = 'flex';
        paintBar.style.gap = '8px';
        paintBar.style.margin = '8px 0';
        paintBar.style.alignItems = 'center';
        paintBar.style.background = '#f8f8f8';
        paintBar.style.border = '1px solid #ccc';
        paintBar.style.padding = '6px 10px';
        paintBar.style.borderRadius = '8px';
        paintBar.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
        // Insert at the top of draw-ui
        const drawUI = document.getElementById('draw-ui');
        if (drawUI) drawUI.insertBefore(paintBar, drawUI.firstChild);
    } else {
        paintBar.innerHTML = '';
    }
    // Color buttons
    colors.forEach(color => {
        const btn = document.createElement('button');
        btn.style.background = color;
        btn.style.width = '28px';
        btn.style.height = '28px';
        btn.style.border = color === '#ffffff' ? '1px solid #888' : 'none';
        btn.style.borderRadius = '50%';
        btn.style.cursor = 'pointer';
        btn.title = color;
        btn.onclick = () => {
            currentColor = color;
        };
        paintBar.appendChild(btn);
    });
    // Line width
    const widthLabel = document.createElement('span');
    widthLabel.textContent = 'Line:';
    widthLabel.style.marginLeft = '12px';
    paintBar.appendChild(widthLabel);
    [4, 6, 10, 16].forEach(w => {
        const btn = document.createElement('button');
        btn.textContent = w;
        btn.style.width = '28px';
        btn.style.height = '28px';
        btn.style.borderRadius = '50%';
        btn.style.marginLeft = '2px';
        btn.style.cursor = 'pointer';
        btn.onclick = () => {
            currentLineWidth = w;
        };
        paintBar.appendChild(btn);
    });
}
createPaintOptions();

function pushUndo() {
    // Save current canvas state as image data
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    // Limit stack size
    if (undoStack.length > 30) undoStack.shift();
}

function undo() {
    if (undoStack.length > 0) {
        const imgData = undoStack.pop();
        ctx.putImageData(imgData, 0, 0);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function createUndoButton() {
    let paintBar = document.getElementById('paint-bar');
    if (paintBar) {
        const undoBtn = document.createElement('button');
        undoBtn.textContent = 'Undo';
        undoBtn.style.marginLeft = '16px';
        undoBtn.style.padding = '0 12px';
        undoBtn.style.height = '28px';
        undoBtn.style.borderRadius = '6px';
        undoBtn.style.cursor = 'pointer';
        undoBtn.onclick = undo;
        paintBar.appendChild(undoBtn);
    }
}

// Push to undo stack before every new stroke
canvas.addEventListener('mousedown', pushUndo);
canvas.addEventListener('touchstart', pushUndo);

// Add undo button to paint bar
createUndoButton();

// Update drawing color and line width
canvas.addEventListener('mousedown', () => {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentLineWidth;
});
canvas.addEventListener('touchstart', () => {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentLineWidth;
});

// Make sure handleTankTap is defined before event listeners
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
    const radius = 120; // Distance for effect
    fishes.forEach(fish => {
        // Center of fish
        const fx = fish.x + fish.width / 2;
        const fy = fish.y + fish.height / 2;
        const dx = fx - tapX;
        const dy = fy - tapY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < radius) {
            // Add velocity away from tap
            const force = 16 * (1 - dist / radius); // Stronger if closer
            const norm = Math.sqrt(dx*dx + dy*dy) || 1;
            fish.vx = (dx / norm) * force;
            fish.vy = (dy / norm) * force;
            // Optionally, make fish face away
            fish.direction = dx > 0 ? 1 : -1;
        }
    });
}

// Remove any previous handlers to avoid duplicates/conflicts
swimCanvas.removeEventListener('mousedown', window._swimFishMousedownHandler || (()=>{}));
swimCanvas.removeEventListener('touchstart', window._swimFishTouchstartHandler || (()=>{}));

// --- Unified handler for both mouse and touch, with fish image in modal ---
function showFishInfoModal(fish) {
    // Create a canvas snapshot of the fish
    const fishImgCanvas = document.createElement('canvas');
    fishImgCanvas.width = fish.width;
    fishImgCanvas.height = fish.height;
    fishImgCanvas.getContext('2d').drawImage(fish.fishCanvas, 0, 0);
    const imgDataUrl = fishImgCanvas.toDataURL();
    let info = `<div style='text-align:center;'>`;
    info += `<img src='${imgDataUrl}' width='80' height='48' style='display:block;margin:0 auto 10px auto;border-radius:8px;border:1px solid #ccc;background:#f8f8f8;' alt='Fish'><br>`;
    info += `<b>Artist:</b> ${fish.artist || 'Anonymous'}<br>`;
    info += `<b>Created:</b> ${new Date(fish.createdAt).toLocaleString()}<br>`;
    info += `</div>`;
    showModal(info, () => {});
}

// --- Unified handler for both mouse and touch ---
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
    // Use bounding box hit detection, topmost fish first
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
    // If no fish was hit, trigger flying-away effect
    handleTankTap(e);
}

// Add event listeners for fish tapping
swimCanvas.addEventListener('mousedown', handleFishTap);
swimCanvas.addEventListener('touchstart', handleFishTap);

// Responsive canvas and UI for mobile
function resizeForMobile() {
    swimCanvas.width = window.innerWidth;
    swimCanvas.height = window.innerHeight;
    swimCanvas.style.width = '100vw';
    swimCanvas.style.height = '100vh';
    swimCanvas.style.maxWidth = '100vw';
    swimCanvas.style.maxHeight = '100vh';
}
window.addEventListener('resize', resizeForMobile);
resizeForMobile();

// Animate all fish with sine wave swimming and tail wiggle
function animateFishes() {
    swimCtx.clearRect(0, 0, swimCanvas.width, swimCanvas.height);
    const time = Date.now() / 500;
    for (const fish of fishes) {
        // If fish has velocity from a tap, move it and apply friction
        if (fish.vx || fish.vy) {
            fish.x += fish.vx;
            fish.y += fish.vy;
            fish.vx *= 0.92; // Friction
            fish.vy *= 0.92;
            if (Math.abs(fish.vx) < 0.5) fish.vx = 0;
            if (Math.abs(fish.vy) < 0.5) fish.vy = 0;
        } else {
            fish.x += fish.speed * fish.direction;
        }
        // Sine wave for y position
        const swimY = fish.y + Math.sin(time + fish.phase) * fish.amplitude;
        // Tail wiggle: warp the image horizontally
        drawWigglingFish(fish, fish.x, swimY, fish.direction, time, fish.phase);
        if (fish.x > swimCanvas.width - fish.width || fish.x < 0) {
            fish.direction *= -1;
        }
        // Clamp fish inside the tank
        fish.x = Math.max(0, Math.min(swimCanvas.width - fish.width, fish.x));
        fish.y = Math.max(0, Math.min(swimCanvas.height - fish.height, fish.y));
    }
    requestAnimationFrame(animateFishes);
}
// Draw a fish with a tail wiggle effect
function drawWigglingFish(fish, x, y, direction, time, phase) {
    const src = fish.fishCanvas;
    const w = fish.width;
    const h = fish.height;
    const tailEnd = Math.floor(w * fish.peduncle.x); // peduncle% is tail.
    for (let i = 0; i < w; i++) {
        let isTail, t, wiggle, drawCol, drawX;
        if (direction === 1) {
            // Right-facing: tail is left, head is right
            isTail = i < tailEnd;
            t = isTail ? (tailEnd - i - 1) / (tailEnd - 1) : 0;
            wiggle = isTail ? Math.sin(time * 3 + phase + t * 2) * t * 12 : 0;
            drawCol = i;
            drawX = x + i + wiggle;
        } else {
            // Left-facing: tail is rightmost 40%, head is left
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
            const g = imgData.data[i+1];
            const b = imgData.data[i+2];
            const a = imgData.data[i+3];
            // Consider non-transparent and not white as content
            if (a > 16 && !(r > 240 && g > 240 && b > 240)) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                found = true;
            }
        }
    }
    if (!found) return srcCanvas; // No content found
    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    const cropped = document.createElement('canvas');
    cropped.width = cropW;
    cropped.height = cropH;
    cropped.getContext('2d').drawImage(srcCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    return cropped;
}

// Helper to crop, scale, and center a fish image into a display canvas
function makeDisplayFishCanvas(img, width = 80, height = 48) {
    const displayCanvas = document.createElement('canvas');
    displayCanvas.width = width;
    displayCanvas.height = height;
    const displayCtx = displayCanvas.getContext('2d');
    // Draw image to temp canvas at its natural size
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
