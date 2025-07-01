// Drawing logic
const canvas = document.getElementById('draw-canvas');
const ctx = canvas.getContext('2d');
ctx.lineWidth = 6; // Make lines thicker for better visibility
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
    checkFishAfterStroke();
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
    checkFishAfterStroke();
});
canvas.addEventListener('touchcancel', () => {
    drawing = false;
});

// Swim logic (submission only)
const swimBtn = document.getElementById('swim-btn');

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

// --- Fish submission modal handler ---
async function submitFish(artist) {
    const createdAt = new Date().toISOString();
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
    // Convert dataURL to Blob
    function dataURLtoBlob(dataurl) {
        const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
        return new Blob([u8arr], { type: mime });
    }
    const fishImgData = fishCanvas.toDataURL('image/png');
    const imageBlob = dataURLtoBlob(fishImgData);
    const formData = new FormData();
    formData.append('image', imageBlob, 'fish.png');
    formData.append('artist', artist);
    // Spinner UI
    let submitBtn = document.getElementById('submit-fish');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class='spinner' style='display:inline-block;width:18px;height:18px;border:3px solid #3498db;border-top:3px solid #fff;border-radius:50%;animation:spin 1s linear infinite;vertical-align:middle;'></span>`;
    }
    // Add spinner CSS
    if (!document.getElementById('spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = `@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`;
        document.head.appendChild(style);
    }
    try {
        // Await server response
        const resp = await fetch('https://fishes-be-571679687712.northamerica-northeast1.run.app/uploadfish', {
            method: 'POST',
            body: formData
        });
        const result = await resp.json();
        // Remove spinner and re-enable button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
        if (result && result.data && result.data.Image) {
            // Hide modal and reset UI
            window.location.href = 'tank.html';
        } else {
            alert('Sorry, there was a problem uploading your fish. Please try again.');
        }
    } catch (err) {
        alert('Failed to submit fish: ' + err.message);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    }
}

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
    // Check fish validity before allowing submit
    const isFish = await verifyFishDoodle(canvas);
    lastFishCheck = isFish;
    showFishWarning(!isFish);
    if (!isFish) {
        // No popup, just block submission and keep background red
        return;
    }
    // Get saved artist name or use Anonymous
    const savedArtist = localStorage.getItem('artistName');
    const defaultName = (savedArtist && savedArtist !== 'Anonymous') ? savedArtist : 'Anonymous';
    
    // Show sign modal immediately (no yes/no)
    showModal(`<div style='text-align:center;'>Sign your art:<br><input id='artist-name' value='${defaultName}' style='margin:10px 0 16px 0;padding:6px;width:80%;max-width:180px;'><br>
        <button id='submit-fish' style='padding:6px 18px;'>Submit</button>
        <button id='cancel-fish' style='padding:6px 18px;margin-left:10px;'>Cancel</button></div>`, () => { });
    document.getElementById('submit-fish').onclick = async () => {
        const artist = document.getElementById('artist-name').value.trim() || 'Anonymous';
        // Save artist name to localStorage for future use
        localStorage.setItem('artistName', artist);
        await submitFish(artist);
    };
    document.getElementById('cancel-fish').onclick = () => {
        document.querySelector('div[style*="z-index: 9999"]')?.remove();
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

// ONNX fish doodle classifier integration
let ortSession = null;
let lastFishCheck = true;

// Load ONNX model (make sure fish_doodle_classifier.onnx is in your public folder)
async function loadFishModel() {
    if (!ortSession) {
        ortSession = await window.ort.InferenceSession.create('fish_doodle_classifier.onnx');
    }
}

// Preprocess canvas for ONNX (adjust SIZE and normalization as needed)
function preprocessCanvasForONNX(canvas) {
    const SIZE = 224;
    // 1. Crop to content (non-transparent or non-white)
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
    // Crop to content
    const cropped = cropCanvasToContent(canvas);
    // 2. Paste onto white 224x224, scaling to fit
    const tmp = document.createElement('canvas');
    tmp.width = SIZE;
    tmp.height = SIZE;
    const ctx = tmp.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, SIZE, SIZE);
    // Scale and center
    const scale = Math.min(SIZE / cropped.width, SIZE / cropped.height);
    const drawW = cropped.width * scale;
    const drawH = cropped.height * scale;
    const dx = (SIZE - drawW) / 2;
    const dy = (SIZE - drawH) / 2;
    ctx.drawImage(cropped, 0, 0, cropped.width, cropped.height, dx, dy, drawW, drawH);
    // 3. Grayscale, 1 channel, normalize
    const imgData = ctx.getImageData(0, 0, SIZE, SIZE).data;
    const input = new Float32Array(1 * SIZE * SIZE);
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const idx = (y * SIZE + x) * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            let gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const norm = (gray / 255 - 0.5) / 0.5;
            input[y * SIZE + x] = norm;
        }
    }
    return new window.ort.Tensor('float32', input, [1, 1, SIZE, SIZE]);
}

// Run ONNX model and return true if fish, false otherwise
async function verifyFishDoodle(canvas) {
    await loadFishModel();
    const inputTensor = preprocessCanvasForONNX(canvas);
    let feeds = {};
    if (ortSession && ortSession.inputNames && ortSession.inputNames.length > 0) {
        feeds[ortSession.inputNames[0]] = inputTensor;
    } else {
        feeds['input'] = inputTensor;
    }
    const results = await ortSession.run(feeds);
    const outputKey = Object.keys(results)[0];
    const output = results[outputKey].data;
    let isFish, prob;
    if (output.length > 1) {
        const exp0 = Math.exp(output[0]);
        const exp1 = Math.exp(output[1]);
        prob = exp1 / (exp0 + exp1);
        isFish = output[1] > output[0];
    } else {
        prob = 1 / (1 + Math.exp(-output[0]));
        isFish = prob >= 0.15; // Threshold for fish detection
    }
    // Show probability under the drawing area
    let probDiv = document.getElementById('fish-probability');
    if (!probDiv) {
        probDiv = document.createElement('div');
        probDiv.id = 'fish-probability';
        probDiv.style.textAlign = 'center';
        probDiv.style.margin = '10px 0 0 0';
        probDiv.style.fontWeight = 'bold';
        probDiv.style.fontSize = '1.1em';
        probDiv.style.color = prob >= 0.1 ? '#218838' : '#c0392b';
        const drawCanvas = document.getElementById('draw-canvas');
        if (drawCanvas && drawCanvas.parentNode) {
            // Insert directly after the canvas
            if (drawCanvas.nextSibling) {
                drawCanvas.parentNode.insertBefore(probDiv, drawCanvas.nextSibling);
            } else {
                drawCanvas.parentNode.appendChild(probDiv);
            }
        } else {
            // Fallback: append to draw-ui
            const drawUI = document.getElementById('draw-ui');
            if (drawUI) drawUI.appendChild(probDiv);
        }
    }
    probDiv.textContent = `Fish probability: ${(prob * 100).toFixed(1)}%`;
    probDiv.style.color = prob >= 0.1 ? '#218838' : '#c0392b';
    return isFish;
}

// Show/hide fish warning and update background color
function showFishWarning(show) {
    const drawUI = document.getElementById('draw-ui');
    if (drawUI) {
        drawUI.style.background = show ? '#ffeaea' : '#eaffea'; // red for invalid, green for valid
        drawUI.style.transition = 'background 0.3s';
    }
}

// After each stroke, check if it's a fish
async function checkFishAfterStroke() {
    if (!window.ort) return; // ONNX runtime not loaded
    const isFish = await verifyFishDoodle(canvas);
    lastFishCheck = isFish;
    showFishWarning(!isFish);
}

// Load ONNX Runtime Web from CDN if not present
(function ensureONNXRuntime() {
    if (!window.ort) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js';
        script.onload = () => { loadFishModel(); };
        document.head.appendChild(script);
    } else {
        loadFishModel();
    }
})();
