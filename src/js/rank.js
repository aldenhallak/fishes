// Backend configuration is now in fish-utils.js

// Fish Ranking System
let allFishData = [];
let currentSort = 'hot';
let sortDirection = 'desc'; // 'asc' or 'desc'
let isLoading = false;
let hasMoreFish = true;
let lastDoc = null; // For pagination with Firestore
let loadedCount = 0; // Track total loaded fish count

// Random fish selection and getFishBySort are now in fish-utils.js

// Test if an image URL is valid and loads successfully
function testImageUrl(imgUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = function () {
            // Check if image has actual content (not just a tiny placeholder)
            if (img.width > 10 && img.height > 10) {
                resolve(true);
            } else {
                console.warn('Image too small:', imgUrl, `${img.width}x${img.height}`);
                resolve(false);
            }
        };

        img.onerror = function () {
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
    img.onload = function () {
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
    img.onerror = function () {
        callback(null);
    };
    img.src = imgUrl;
}

// Date formatting and score calculation are now in fish-utils.js

// Vote sending function is now in fish-utils.js

// Handle vote button click - rank page specific
function handleVote(fishId, voteType, button) {
    handleVoteGeneric(fishId, voteType, button, (result, voteType) => {
        // Update the fish data in allFishData array
        const fish = allFishData.find(f => f.docId === fishId);
        if (fish) {
            // Check for different response formats and update accordingly
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

            // Always recalculate score
            fish.score = calculateScore(fish);

            // Update the display
            updateFishCard(fishId);
        } else {
            console.error(`Fish with ID ${fishId} not found in allFishData`);
        }
    });
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
    const userToken = localStorage.getItem('userToken');

    const fishImageContainer =
        `<div class="fish-image-container" onclick="showAddToTankModal('${fish.docId}')" title="Click to add to your tank" style="cursor: pointer;">`;
    return `
        <div class="fish-card" data-fish-id="${fish.docId}">
            ${fishImageContainer}
                <img class="fish-image" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="Fish" data-fish-id="${fish.docId}">
            </div>
            <div class="fish-info">
                <div class="fish-artist">${fish.Artist || 'Anonymous'}</div>
                <div class="fish-date">${formatDate(fish.CreatedAt)}</div>
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
function sortFish(fishData, sortType, direction = 'desc') {
    const sorted = [...fishData];

    switch (sortType) {
        case 'score':
            return sorted.sort((a, b) => {
                const scoreA = a.score || 0;
                const scoreB = b.score || 0;
                return direction === 'desc' ? scoreB - scoreA : scoreA - scoreB;
            });
        case 'date':
            return sorted.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt.toDate ? a.createdAt.toDate() : a.createdAt) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt.toDate ? b.createdAt.toDate() : b.createdAt) : new Date(0);
                return direction === 'desc' ? dateB - dateA : dateA - dateB;
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
function displayFish(fishData, append = false) {
    const grid = document.getElementById('fish-grid');

    if (append) {
        // Append new fish to existing grid
        const newFishHTML = fishData.map(fish => createFishCard(fish)).join('');
        grid.insertAdjacentHTML('beforeend', newFishHTML);
    } else {
        // Replace all fish (initial load or sort change)
        grid.innerHTML = fishData.map(fish => createFishCard(fish)).join('');
    }

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
    const sortedFish = sortFish(allFishData, currentSort, sortDirection);
    displayFish(sortedFish);
}

// Update button text with sort direction arrows
function updateSortButtonText() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        const sortType = btn.getAttribute('data-sort');
        let baseText = '';
        let arrow = '';
        let tooltip = '';

        switch (sortType) {
            case 'hot':
                baseText = 'Sort by Hot';
                break;
            case 'score':
                baseText = 'Sort by Score';
                break;
            case 'date':
                baseText = 'Sort by Date';
                break;
            case 'random':
                baseText = 'Random Order';
                tooltip = 'Show fish in random order';
                break;
        }

        // Add arrow for current sort (except random)
        if (sortType === currentSort && sortType !== 'random') {
            arrow = sortDirection === 'desc' ? ' ↓' : ' ↑';
            tooltip = sortType === 'score'
                ? (sortDirection === 'desc' ? 'Highest score first' : 'Lowest score first')
                : (sortDirection === 'desc' ? 'Newest first' : 'Oldest first');
        } else if (sortType !== 'random') {
            tooltip = `Click to sort by ${sortType}. Click again to reverse order.`;
        }

        btn.textContent = baseText + arrow;
        btn.title = tooltip;
    });
}

// Handle sort button clicks
async function handleSortChange(sortType) {
    // If clicking the same sort button, toggle direction
    if (currentSort === sortType && sortType !== 'random') {
        sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    } else {
        // New sort type, use default direction
        currentSort = sortType;
        sortDirection = sortType === 'date' ? 'desc' : 'desc'; // Default to descending for most sorts
    }

    // Reset pagination state whenever sort changes (including direction)
    lastDoc = null;
    hasMoreFish = true;
    loadedCount = 0;
    allFishData = [];

    // Update active button
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-sort="${sortType}"]`).classList.add('active');

    // Update button text with arrows
    updateSortButtonText();

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

// Load fish data with efficient querying and pagination
async function loadFishData(sortType = currentSort, isInitialLoad = true) {
    if (isLoading || (!hasMoreFish && !isInitialLoad)) {
        return;
    }

    isLoading = true;

    try {
        const loadingElement = document.getElementById('loading');
        const gridElement = document.getElementById('fish-grid');

        if (isInitialLoad) {
            loadingElement.textContent = `Loading fish... 🐠`;
            loadingElement.style.display = 'block';
            gridElement.style.display = 'none';
        } else {
            // Show inline loading for pagination
            loadingElement.textContent = `Loading more fish... 🐠`;
            loadingElement.style.display = 'block';
        }

        const fishDocs = await getFishBySort(sortType, 50, lastDoc, sortDirection);

        // Check if we got fewer docs than requested (indicates end of data)
        if (fishDocs.length < 50 && sortType !== 'random') {
            hasMoreFish = false;
        }

        // For random sorting, disable infinite scroll after first load
        if (sortType === 'random' && !isInitialLoad) {
            hasMoreFish = false;
        }

        // Map fish documents to objects
        const newFish = fishDocs.map(doc => {
            const data = doc.data();
            const fish = {
                ...data,
                docId: doc.id,
                score: calculateScore(data)
            };
            return fish;
        });

        // Filter to only fish with working images
        const validFish = await filterValidFish(newFish);

        // Update lastDoc for pagination (except for random sorting)
        if (fishDocs.length > 0 && sortType !== 'random') {
            lastDoc = fishDocs[fishDocs.length - 1];
        }

        // Apply client-side sorting for score (random is already handled by DB query)
        if (sortType === 'score') {
            validFish.sort((a, b) => {
                const scoreA = a.score || 0;
                const scoreB = b.score || 0;
                return sortDirection === 'desc' ? scoreB - scoreA : scoreA - scoreB;
            });
        }

        if (isInitialLoad) {
            allFishData = validFish;
            loadedCount = allFishData.length;

            // Hide loading and show grid
            loadingElement.style.display = 'none';
            gridElement.style.display = 'grid';
            displayFish(allFishData, false);
            updateStatusMessage();
        } else {
            // Filter out duplicates when appending
            const existingIds = new Set(allFishData.map(fish => fish.docId));
            const newValidFish = validFish.filter(fish => !existingIds.has(fish.docId));

            if (newValidFish.length > 0) {
                allFishData = [...allFishData, ...newValidFish];
                loadedCount = allFishData.length;
                displayFish(newValidFish, true);
            } else {
                // No new fish found, might have reached the end
                hasMoreFish = false;
            }

            // Hide loading and show status if needed
            loadingElement.style.display = 'none';
            updateStatusMessage();
        }

    } catch (error) {
        console.error('Error loading fish:', error);
        document.getElementById('loading').textContent = 'Error loading fish. Please try again.';
    } finally {
        isLoading = false;
    }
}

// Update status message
function updateStatusMessage() {
    const loadingElement = document.getElementById('loading');

    if (!hasMoreFish && loadedCount > 0) {
        loadingElement.textContent = `Showing all ${loadedCount} fish 🐟`;
        loadingElement.style.display = 'block';
        loadingElement.style.color = '#666';
        loadingElement.style.fontSize = '0.9em';
        loadingElement.style.padding = '20px';
    }
}

// Check if user has scrolled near the bottom of the page
function isNearBottom() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Trigger when user is within 200px of the bottom
    return scrollTop + windowHeight >= documentHeight - 200;
}

// Handle infinite scroll
function handleScroll() {
    if (isNearBottom() && !isLoading && hasMoreFish) {
        loadFishData(currentSort, false);
    }
}

// Throttle scroll event to improve performance
let scrollTimeout;
function throttledScroll() {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(handleScroll, 100);
}

// Initialize page
window.addEventListener('DOMContentLoaded', () => {
    // Set up sort button event listeners
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            await handleSortChange(btn.getAttribute('data-sort'));
        });
    });

    // Set up infinite scroll
    window.addEventListener('scroll', throttledScroll);

    // Initialize button text with arrows
    updateSortButtonText();

    // Load initial fish data
    loadFishData();
});

// Handle reporting - rank page specific
function handleReport(fishId, button) {
    handleReportGeneric(fishId, button);
}

// Add to Tank functionality now handled by modal-utils.js
// The showAddToTankModal function is now available globally from modal-utils.js

// Modal functions are now handled by modal-utils.js

// Make functions globally available
window.handleVote = handleVote;
window.handleReport = handleReport;
window.showAddToTankModal = showAddToTankModal;
window.addFishToTank = addFishToTank;
window.closeAddToTankModal = closeAddToTankModal;
window.closeLoginPromptModal = closeLoginPromptModal;