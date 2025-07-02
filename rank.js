// Configuration for backend URL - change to false for local development
const USE_PRODUCTION_BACKEND = false;
const BACKEND_URL = USE_PRODUCTION_BACKEND 
    ? 'https://fishes-be-571679687712.northamerica-northeast1.run.app'
    : 'http://localhost:8080';

// Fish Ranking System
let allFishData = [];
let currentSort = 'score';

// Generate random document ID for querying
function generateRandomDocId() {
    // Generate random auto-ID similar to Firestore's format
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 20; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Get random documents using efficient Firestore random selection
async function getRandomFish(limit = 50) {
    const randomDocs = [];
    
    while (randomDocs.length < limit) {
        const randomId = generateRandomDocId();
        
        // Try forward direction first
        let query = window.db.collection('fishes_test')
            .where(window.firebase.firestore.FieldPath.documentId(), '>=', randomId)
            .orderBy(window.firebase.firestore.FieldPath.documentId())
            .limit(limit - randomDocs.length);
        
        let snapshot = await query.get();
        
        // If no results, try backward direction (wrap-around)
        if (snapshot.empty) {
            query = window.db.collection('fishes_test')
                .where(window.firebase.firestore.FieldPath.documentId(), '>=', '')
                .orderBy(window.firebase.firestore.FieldPath.documentId())
                .limit(limit - randomDocs.length);
            
            snapshot = await query.get();
        }
        
        // Add new documents (avoid duplicates)
        const existingIds = new Set(randomDocs.map(doc => doc.id));
        snapshot.docs.forEach(doc => {
            if (!existingIds.has(doc.id) && randomDocs.length < limit) {
                randomDocs.push(doc);
            }
        });
        
        // Safety break to avoid infinite loop
        if (snapshot.empty || snapshot.docs.length === 0) {
            console.warn('No more documents available for random selection');
            break;
        }
    }
    
    return randomDocs;
}

// Get fish from Firestore with efficient querying
async function getFishBySort(sortType, limit = 50) {
    let query = window.db.collection('fishes_test');
    
    switch (sortType) {
        case 'score':
            query = query.orderBy("score", "desc").limit(limit); 
            break;
            
        case 'date':
            // Most efficient - direct database sorting
            query = query.orderBy("CreatedAt", "desc").limit(limit);
            break;
            
        case 'random':
            // Use efficient random document selection
            return await getRandomFish(limit);
            
        default:
            query = query.orderBy("CreatedAt", "desc").limit(limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs;
}

// Test if an image URL is valid and loads successfully
function testImageUrl(imgUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            // Check if image has actual content (not just a tiny placeholder)
            if (img.width > 10 && img.height > 10) {
                resolve(true);
            } else {
                console.warn('Image too small:', imgUrl, `${img.width}x${img.height}`);
                resolve(false);
            }
        };
        
        img.onerror = function() {
            console.warn('Image failed to load:', imgUrl);
            resolve(false);
        };
        
        // Set a timeout to avoid hanging on slow images
        setTimeout(() => {
            console.warn('Image load timeout:', imgUrl);
            resolve(false);
        }, 5000); // 5 second timeout
        
        img.src = imgUrl;
    });
}

// Convert fish image to data URL for display
function createFishImageDataUrl(imgUrl, callback) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 120;
        canvas.height = 80;
        
        // Calculate scaling to fit within canvas while maintaining aspect ratio
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Center the image
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;
        
        // Clear canvas and draw image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        callback(canvas.toDataURL());
    };
    img.onerror = function() {
        callback(null);
    };
    img.src = imgUrl;
}

// Format date for display
function formatDate(dateValue) {
    if (!dateValue) return 'Unknown date';
    
    let dateObj;
    if (typeof dateValue === 'string') {
        dateObj = new Date(dateValue);
    } else if (typeof dateValue.toDate === 'function') {
        dateObj = dateValue.toDate();
    } else {
        dateObj = dateValue;
    }
    
    if (isNaN(dateObj)) return 'Unknown date';
    
    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Calculate fish score (upvotes - downvotes)
function calculateScore(fish) {
    const upvotes = fish.upvotes || 0;
    const downvotes = fish.downvotes || 0;
    return upvotes - downvotes;
}

// Send vote to endpoint (assumed to exist)
async function sendVote(fishId, voteType) {
    try {
        
        const response = await fetch(`${BACKEND_URL}/api/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fishId: fishId,
                vote: voteType // 'up' or 'down'
            })
        });
        
        if (!response.ok) {
            console.error(`Vote failed with status: ${response.status}`);
            throw new Error(`Vote failed with status: ${response.status}`);
        }
        
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error sending vote:', error);
    }
}

// Handle vote button click
async function handleVote(fishId, voteType, button) {
    // Disable button temporarily
    button.disabled = true;
    button.style.opacity = '0.6';
    
    try {
        const result = await sendVote(fishId, voteType);
        
        // Always update the fish data, regardless of success property
        const fish = allFishData.find(f => f.docId === fishId);
        if (fish) {
            // Check for different response formats and update accordingly
            if (result.upvotes !== undefined && result.downvotes !== undefined) {
                // Direct upvotes/downvotes in response (from real backend)
                fish.upvotes = result.upvotes;
                fish.downvotes = result.downvotes;
            } else if (result.updatedFish) {
                // Nested updatedFish object (from simulation)
                fish.upvotes = result.updatedFish.upvotes || fish.upvotes || 0;
                fish.downvotes = result.updatedFish.downvotes || fish.downvotes || 0;
            } else if (result.success) {
                // If no vote data but success is true, increment locally
                if (voteType === 'up') {
                    fish.upvotes = (fish.upvotes || 0) + 1;
                } else {
                    fish.downvotes = (fish.downvotes || 0) + 1;
                }
            }
            
            // Always recalculate score
            fish.score = calculateScore(fish);
                        
            // Update the display
            updateFishCard(fishId);
            
            // Re-sort if needed
            if (currentSort === 'score') {
                sortAndDisplayFish();
            }
        } else {
            console.error(`Fish with ID ${fishId} not found in allFishData`);
        }
    } catch (error) {
        console.error('Vote failed:', error);
    }
    
    // Re-enable button
    setTimeout(() => {
        button.disabled = false;
        button.style.opacity = '1';
    }, 1000);
}

// Update a single fish card
function updateFishCard(fishId) {
    const fish = allFishData.find(f => f.docId === fishId);
    if (!fish) {
        console.error(`Cannot update card: Fish with ID ${fishId} not found in allFishData`);
        return;
    }
    
    const scoreElement = document.querySelector(`.fish-card[data-fish-id="${fishId}"] .fish-score`);
    const upvoteElement = document.querySelector(`.fish-card[data-fish-id="${fishId}"] .upvote-count`);
    const downvoteElement = document.querySelector(`.fish-card[data-fish-id="${fishId}"] .downvote-count`);
    
    if (scoreElement) {
        scoreElement.textContent = `Score: ${fish.score || 0}`;
    } else {
        console.error(`Score element not found for fish ${fishId}`);
    }
    
    if (upvoteElement) {
        upvoteElement.textContent = fish.upvotes || 0;
    } else {
        console.error(`Upvote element not found for fish ${fishId}`);
    }
    
    if (downvoteElement) {
        downvoteElement.textContent = fish.downvotes || 0;
    } else {
        console.error(`Downvote element not found for fish ${fishId}`);
    }
    
    // Force a repaint to ensure the UI updates
    const fishCard = document.querySelector(`.fish-card[data-fish-id="${fishId}"]`);
    if (fishCard) {
        fishCard.style.opacity = '0.99';
        setTimeout(() => {
            fishCard.style.opacity = '1';
        }, 50);
    }
}

// Create fish card HTML
function createFishCard(fish) {
    const score = fish.score || 0;
    const upvotes = fish.upvotes || 0;
    const downvotes = fish.downvotes || 0;
    
    return `
        <div class="fish-card" data-fish-id="${fish.docId}">
            <div class="fish-image-container">
                <img class="fish-image" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="Fish" data-fish-id="${fish.docId}">
            </div>
            <div class="fish-info">
                <div class="fish-artist">${fish.Artist || 'Anonymous'}</div>
                <div class="fish-date">${formatDate(fish.createdAt)}</div>
                <div class="fish-score">Score: ${score}</div>
            </div>
            <div class="voting-controls">
                <button class="vote-btn upvote-btn" onclick="handleVote('${fish.docId}', 'up', this)">
                    👍 <span class="vote-count upvote-count">${upvotes}</span>
                </button>
                <button class="vote-btn downvote-btn" onclick="handleVote('${fish.docId}', 'down', this)">
                    👎 <span class="vote-count downvote-count">${downvotes}</span>
                </button>
                <button class="report-btn" onclick="handleReport('${fish.docId}', this)" title="Report inappropriate content">
                    🚩
                </button>
            </div>
        </div>
    `;
}

// Sort fish data
function sortFish(fishData, sortType) {
    const sorted = [...fishData];
    
    switch (sortType) {
        case 'score':
            return sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
        case 'date':
            return sorted.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt.toDate ? a.createdAt.toDate() : a.createdAt) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt.toDate ? b.createdAt.toDate() : b.createdAt) : new Date(0);
                return dateB - dateA; // Newest first
            });
        case 'random':
            // Fisher-Yates shuffle
            for (let i = sorted.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
            }
            return sorted;
        default:
            return sorted;
    }
}

// Display fish in the grid
function displayFish(fishData) {
    const grid = document.getElementById('fish-grid');
    grid.innerHTML = fishData.map(fish => createFishCard(fish)).join('');
    
    // Load fish images asynchronously
    fishData.forEach(fish => {
        const imageUrl = fish.image || fish.Image;
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
            createFishImageDataUrl(imageUrl, (dataUrl) => {
                if (dataUrl) {
                    const imgElement = document.querySelector(`img[data-fish-id="${fish.docId}"]`);
                    if (imgElement) {
                        imgElement.src = dataUrl;
                    }
                }
            });
        }
    });
}

// Sort and display fish
function sortAndDisplayFish() {
    const sortedFish = sortFish(allFishData, currentSort);
    displayFish(sortedFish);
}

// Handle sort button clicks
async function handleSortChange(sortType) {
    currentSort = sortType;
    
    // Update active button
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-sort="${sortType}"]`).classList.add('active');
    
    // Show loading and reload data with new sort
    document.getElementById('loading').style.display = 'block';
    document.getElementById('fish-grid').style.display = 'none';
    
    // Reload fish data with new sort criteria
    await loadFishData(sortType);
}

// Filter fish with working images
async function filterValidFish(fishArray) {
    const validFish = [];
    const batchSize = 10; // Test images in batches to avoid overwhelming the browser
    
    document.getElementById('loading').textContent = 'Checking fish images...';
    
    for (let i = 0; i < fishArray.length; i += batchSize) {
        const batch = fishArray.slice(i, i + batchSize);
        
        // Update loading message with progress
        const progress = Math.min(i + batchSize, fishArray.length);
        document.getElementById('loading').textContent = 
            `Checking fish images... ${progress}/${fishArray.length}`;
        
        // Test all images in current batch simultaneously
        const batchResults = await Promise.all(
            batch.map(async (fish) => {
                const imageUrl = fish.image || fish.Image;
                if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
                    return null; // Invalid URL format
                }
                
                const isValid = await testImageUrl(imageUrl);
                return isValid ? fish : null;
            })
        );
        
        // Add valid fish from this batch
        batchResults.forEach(fish => {
            if (fish) validFish.push(fish);
        });
        
        // Small delay between batches to prevent browser overload
        if (i + batchSize < fishArray.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    return validFish;
}

// Load fish data with efficient querying
async function loadFishData(sortType = currentSort) {
    try {
        document.getElementById('loading').textContent = `Loading fish... 🐠`;
        
        const fishDocs = await getFishBySort(sortType, 50);
        
        // Map fish documents to objects
        const allFish = fishDocs.map(doc => {
            const data = doc.data();
            const fish = {
                ...data,
                docId: doc.id,
                score: calculateScore(data)
            };
            return fish;
        });
        
        // Filter to only fish with working images
        const validFish = await filterValidFish(allFish);
        
        // If we don't have enough valid fish, try to get more
        let finalFish = validFish;
        if (validFish.length < 25 && sortType !== 'random') {
            const moreFishDocs = await getFishBySort(sortType, 100);
            const moreFish = moreFishDocs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    docId: doc.id,
                    score: calculateScore(data)
                };
            });
            const moreValidFish = await filterValidFish(moreFish);
            finalFish = moreValidFish.slice(0, 50);
        }
        
        // Apply client-side sorting for score (random is already handled by DB query)
        if (sortType === 'score') {
            finalFish.sort((a, b) => (b.score || 0) - (a.score || 0));
        }
        // Random sorting is now handled efficiently at the database level
        
        allFishData = finalFish.slice(0, 50);
        
        // Hide loading and show grid
        document.getElementById('loading').style.display = 'none';
        document.getElementById('fish-grid').style.display = 'grid';
        
        // Display fish
        displayFish(allFishData);
        
    } catch (error) {
        console.error('Error loading fish:', error);
        document.getElementById('loading').textContent = 'Error loading fish. Please try again.';
    }
}

// Initialize page
window.addEventListener('DOMContentLoaded', () => {
    // Set up sort button event listeners
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            await handleSortChange(btn.getAttribute('data-sort'));
        });
    });
    
    // Load fish data
    loadFishData();
});

// Handle reporting
async function handleReport(fishId, button) {
    try {
        // Show confirmation dialog
        const reason = prompt(
            'Please specify the reason for reporting this fish:\n\n' +
            '• Inappropriate content\n' +
            '• Spam\n' +
            '• Copyright violation\n' +
            '• Other\n\n' +
            'Enter reason:'
        );
        
        if (!reason || reason.trim() === '') {
            return; // User cancelled or entered empty reason
        }
        
        // Disable button immediately
        button.disabled = true;
        button.style.opacity = '0.6';
        
        // Send report to API endpoint
        const response = await fetch(`${BACKEND_URL}/api/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fishId: fishId,
                reason: reason.trim(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            alert('Report submitted successfully. Thank you for helping keep our community safe!');
            
            // Update button to show success
            button.textContent = '✅';
            button.title = 'Report submitted';
            button.style.opacity = '1';
            button.style.backgroundColor = '#4CAF50';
            
            // Keep button disabled to prevent duplicate reports
            setTimeout(() => {
                button.textContent = '🚩';
                button.title = 'Report inappropriate content';
                button.style.backgroundColor = '';
                button.disabled = false;
                button.style.opacity = '1';
            }, 10000); // 10 second cooldown
            
        } else {
            throw new Error(result.message || 'Report submission failed');
        }
        
    } catch (error) {
        console.error('Error submitting report:', error);
        
        // Re-enable button on error
        button.disabled = false;
        button.style.opacity = '1';
        
        
        alert('Error submitting report. Please try again later.');
        
    }
}

// Make functions globally available
window.handleVote = handleVote;
window.handleReport = handleReport;