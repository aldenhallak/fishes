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
    modal.style.background = 'rgba(192,192,192,0.8)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.innerHTML = `<div style="background:#c0c0c0;padding:15px;border: 2px outset #808080;min-width:300px;max-width:90vw;max-height:90vh;overflow:auto;font-family:'MS Sans Serif',sans-serif;font-size:11px;">${html}</div>`;
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
async function submitFish(artist, needsModeration = false) {
    function dataURLtoBlob(dataurl) {
        const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
        return new Blob([u8arr], { type: mime });
    }
    const fishImgData = canvas.toDataURL('image/png');
    const imageBlob = dataURLtoBlob(fishImgData);
    const formData = new FormData();
    formData.append('image', imageBlob, 'fish.png');
    formData.append('artist', artist);
    formData.append('needsModeration', needsModeration.toString());
    // Retro loading indicator
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
        const resp = await fetch(`${BACKEND_URL}/uploadfish`, {
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
            // Save today's date to track fish submission
            const today = new Date().toDateString();
            localStorage.setItem('lastFishDate', today);
            
            // Show success message based on moderation status
            if (needsModeration) {
                showModal(`<div style='text-align:center;'>
                    <h1>Fish Submitted for Review</div>
                    <div>Your fish has been submitted and will appear in the tank once it passes moderator review.</div>
                    <button onclick="window.location.href='tank.html'">View Tank</button>
                </div>`, () => {});
            } else {
                // Regular fish - go directly to tank
                window.location.href = 'tank.html';
            }
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
    // Check fish validity for warning purposes
    const isFish = await verifyFishDoodle(canvas);
    lastFishCheck = isFish;
    showFishWarning(!isFish);
    
    // Get saved artist name or use Anonymous
    const savedArtist = localStorage.getItem('artistName');
    const defaultName = (savedArtist && savedArtist !== 'Anonymous') ? savedArtist : 'Anonymous';
    
    // Show different modal based on fish validity
    if (!isFish) {
        // Show moderation warning modal for low-scoring fish
        showModal(`<div style='text-align:center;'>
            <div style='color:#ff6b35;font-weight:bold;margin-bottom:12px;'>Low Fish Score</div>
            <div style='margin-bottom:16px;line-height:1.4;'>i dont think this is a fish but you can submit it anyway and ill review it</div>
            <div style='margin-bottom:16px;'>Sign your art:<br><input id='artist-name' value='${defaultName}' style='margin:10px 0 16px 0;padding:6px;width:80%;max-width:180px;'></div>
            <button id='submit-fish' >Submit for Review</button>
            <button id='cancel-fish' >Cancel</button>
        </div>`, () => { });
    } else {
        // Show normal submission modal for good fish
        showModal(`<div style='text-align:center;'>
            <div style='color:#27ae60;font-weight:bold;margin-bottom:12px;'>Great Fish!</div>
            <div style='margin-bottom:16px;'>Sign your art:<br><input id='artist-name' value='${defaultName}' style='margin:10px 0 16px 0;padding:6px;width:80%;max-width:180px;'></div>
            <button id='submit-fish' style='padding:6px 18px;background:#27ae60;color:white;border:none;border-radius:4px;'>Submit</button>
            <button id='cancel-fish' style='padding:6px 18px;margin-left:10px;background:#ccc;border:none;border-radius:4px;'>Cancel</button>
        </div>`, () => { });
    }
    
    document.getElementById('submit-fish').onclick = async () => {
        const artist = document.getElementById('artist-name').value.trim() || 'Anonymous';
        // Save artist name to localStorage for future use
        localStorage.setItem('artistName', artist);
        await submitFish(artist, !isFish); // Pass moderation flag
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
        paintBar.style.margin = '8px auto';
        paintBar.style.alignItems = 'center';
        paintBar.style.justifyContent = 'center';
        paintBar.style.padding = '6px 10px';
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
        btn.style.border = '1px solid #000';
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
        btn.style.border = '1px solid #000';
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
let isModelLoading = false;
let modelLoadPromise = null;

// Load ONNX model (make sure fish_doodle_classifier.onnx is in your public folder)
async function loadFishModel() {
    // If already loaded, return immediately
    if (ortSession) {
        return ortSession;
    }
    
    // If already loading, return the existing promise
    if (isModelLoading && modelLoadPromise) {
        return modelLoadPromise;
    }
    
    // Start loading
    isModelLoading = true;
    console.log('Loading fish model...');
    
    modelLoadPromise = (async () => {
        try {
            ortSession = await window.ort.InferenceSession.create('fish_doodle_classifier.onnx');
            console.log('Fish model loaded successfully');
            return ortSession;
        } catch (error) {
            console.error('Failed to load fish model:', error);
            throw error;
        } finally {
            isModelLoading = false;
        }
    })();
    
    return modelLoadPromise;
}

// Add debugging to frontend preprocessing
function debugPreprocessCanvasForONNX(canvas) {
    const SIZE = 224;
    
    // 1. Get canvas data
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    // 2. Crop to content (copy the exact same logic)
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
    
    if (!found) {
        minX = 0; minY = 0; maxX = w - 1; maxY = h - 1;
        console.log('Frontend - No content found, using full image');
    }
    
    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
        
    // 3. Create cropped canvas
    const cropped = document.createElement('canvas');
    cropped.width = cropW;
    cropped.height = cropH;
    cropped.getContext('2d').drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    
    // 4. Create 224x224 canvas with white background
    const tmp = document.createElement('canvas');
    tmp.width = SIZE;
    tmp.height = SIZE;
    const tmpCtx = tmp.getContext('2d');
    tmpCtx.fillStyle = '#fff';
    tmpCtx.fillRect(0, 0, SIZE, SIZE);
    
    // 5. Scale and center
    const scale = Math.min(SIZE / cropped.width, SIZE / cropped.height);
    const drawW = cropped.width * scale;
    const drawH = cropped.height * scale;
    const dx = (SIZE - drawW) / 2;
    const dy = (SIZE - drawH) / 2;
    
    tmpCtx.drawImage(cropped, 0, 0, cropped.width, cropped.height, dx, dy, drawW, drawH);
    // 6. Get final image data and process
    const finalImgData = tmpCtx.getImageData(0, 0, SIZE, SIZE).data;
        
    // 7. Convert to tensor
    const input = new Float32Array(1 * SIZE * SIZE);
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const idx = (y * SIZE + x) * 4;
            const r = finalImgData[idx];
            const g = finalImgData[idx + 1];
            const b = finalImgData[idx + 2];
            let gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const norm = (gray / 255 - 0.5) / 0.5;
            input[y * SIZE + x] = norm;
        }
    }
        
    return new window.ort.Tensor('float32', input, [1, 1, SIZE, SIZE]);
}

// Modify your verifyFishDoodle function to call this debug version
async function verifyFishDoodle(canvas) {
    // Model should already be loaded, but check just in case
    if (!ortSession) {
        throw new Error('Fish model not loaded');
    }
    
    // Use debug version for detailed logging
    const inputTensor = debugPreprocessCanvasForONNX(canvas);
    
    // Rest of your existing code...
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
        isFish = prob >= 0.15;
    }
        
    // Your existing UI update code...
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
            if (drawCanvas.nextSibling) {
                drawCanvas.parentNode.insertBefore(probDiv, drawCanvas.nextSibling);
            } else {
                drawCanvas.parentNode.appendChild(probDiv);
            }
        } else {
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
    
    // Wait for model to be loaded if it's not ready yet
    if (!ortSession) {
        try {
            await loadFishModel();
        } catch (error) {
            console.error('Model not available for fish checking:', error);
            return;
        }
    }
    
    const isFish = await verifyFishDoodle(canvas);
    lastFishCheck = isFish;
    showFishWarning(!isFish);
}

// Load ONNX Runtime Web from CDN if not present
(function ensureONNXRuntime() {
    if (!window.ort) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js';
        script.onload = () => { 
            console.log('ONNX Runtime loaded, starting model load...');
            loadFishModel().catch(error => {
                console.error('Failed to load model on startup:', error);
            });
        };
        document.head.appendChild(script);
    } else {
        console.log('ONNX Runtime already available, starting model load...');
        loadFishModel().catch(error => {
            console.error('Failed to load model on startup:', error);
        });
    }
})();

// Check if user already drew a fish today when page loads
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toDateString();
    const lastFishDate = localStorage.getItem('lastFishDate');
    console.log(`Last fish date: ${lastFishDate}, Today: ${today}`);
    if (lastFishDate === today) {
        showModal(`<div style='text-align:center;'>You already drew a fish today!<br><br>
            <button id='go-to-tank' style='padding:8px 16px; margin: 0 5px;'>Take me to fishtank</button>
            <button id='draw-another' style='padding:8px 16px; margin: 0 5px;'>I want to draw another fish</button></div>`, () => { });
        
        document.getElementById('go-to-tank').onclick = () => {
            window.location.href = 'tank.html';
        };
        
        document.getElementById('draw-another').onclick = () => {
            document.querySelector('div[style*="z-index: 9999"]')?.remove();
        };
    }
});
