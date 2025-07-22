// Backend configuration is now in fish-utils.js

// Fish Ranking System
let allFishData = [];
let currentSort = 'hot';
let sortDirection = 'desc'; // 'asc' or 'desc'
let isLoading = false;
let hasMoreFish = true;
let lastDoc = null; // For pagination with Firestore
let loadedCount = 0; // Track total loaded fish count
let currentUserId = null; // Track user filter for showing specific user's fish

// Cache for image validation results to avoid testing the same image multiple times
const imageValidationCache = new Map(); // url -> {isValid: boolean, timestamp: number}

// Random fish selection and getFishBySort are now in fish-utils.js

// Test if an image URL is valid and loads successfully
function testImageUrl(imgUrl) {
    // Check cache first (valid for 5 minutes)
    const cached = imageValidationCache.get(imgUrl);
    if (cached && (Date.now() - cached.timestamp) < 300000) {
        return Promise.resolve(cached.isValid);
    }

    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        const resolveAndCache = (isValid) => {
            // Cache the result
            imageValidationCache.set(imgUrl, {
                isValid,
                timestamp: Date.now()
            });
            resolve(isValid);
        };

        img.onload = function () {
            // Check if image has actual content (not just a tiny placeholder)
            if (img.width > 10 && img.height > 10) {
                resolveAndCache(true);
            } else {
                console.warn('Image too small:', imgUrl, `${img.width}x${img.height}`);
                resolveAndCache(false);
            }
        };

        img.onerror = function () {
            console.warn('Image failed to load:', imgUrl);
            resolveAndCache(false);
        };

        // Set a timeout to avoid hanging on slow images
        setTimeout(() => {
            // console.warn('Image load timeout:', imgUrl);
            // TODO: Fix this. Does nothing rn.
            resolveAndCache(false);
        }, 20000); // 20 second timeout - more realistic for slow images

        img.src = imgUrl;
    });
}

// Convert fish image to data URL for display
function createFishImageDataUrl(imgUrl, callback) {
    // Check validation cache first - don't try to load images that we know are invalid
    const cached = imageValidationCache.get(imgUrl);
    if (cached && !cached.isValid && (Date.now() - cached.timestamp) < 300000) {
        callback(null);
        return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    let isCompleted = false;

    const completeOnce = (result) => {
        if (!isCompleted) {
            isCompleted = true;
            callback(result);
        }
    };

    img.onload = function () {
        clearTimeout(timeoutId);
        try {
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

            completeOnce(canvas.toDataURL());
        } catch (error) {
            console.error('Error creating image data URL:', error);
            completeOnce(null);
        }
    };

    img.onerror = function () {
        clearTimeout(timeoutId);
        console.warn('Image failed to load for display:', imgUrl);
        completeOnce(null);
    };

    // Add timeout for display function as well
    const timeoutId = setTimeout(() => {
        console.warn('Image display timeout:', imgUrl);
        img.src = ''; // Cancel the loading
        completeOnce(null);
    }, 20000); // Same 20 second timeout

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
    
    // Check if this is the current user's fish
    const isCurrentUserFish = isUserFish(fish);
    
    // Add highlighting classes and styles for user's fish
    const userFishClass = isCurrentUserFish ? ' user-fish-highlight' : '';

    const fishImageContainer =
        `<div class="fish-image-container" onclick="showAddToTankModal('${fish.docId}')" title="Click to add to your tank" style="cursor: pointer;">`;
    return `
        <div class="fish-card${userFishClass}" data-fish-id="${fish.docId}">
            ${fishImageContainer}
                <img class="fish-image" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="Fish" data-fish-id="${fish.docId}">
            </div>
            <div class="fish-info">
                <div class="fish-artist">
                    <a href="profile.html?userId=${encodeURIComponent(fish.userId || 'Anonymous')}" 
                       style="color: inherit; text-decoration: none;">
                        ${fish.Artist || 'Anonymous'}
                    </a>
                </div>
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

        const fishDocs = await getFishBySort(sortType, 50, lastDoc, sortDirection, currentUserId);

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

// Update page header when filtering by user
async function updatePageHeaderForUser(userId) {
    try {
        // Fetch user profile to get display name
        const profile = await getUserProfile(userId);
        const displayName = getDisplayName(profile);
        
        const headerElement = document.querySelector('.ranking-header h1');
        if (headerElement) {
            headerElement.textContent = `Fish by ${displayName}`;
        }
        
        // Update page title
        document.title = `Fish by ${displayName} - Fish Ranking`;
        
        // Add a note about the filter
        const existingNote = document.querySelector('.user-filter-note');
        if (!existingNote) {
            const note = document.createElement('p');
            note.className = 'user-filter-note';
            note.style.textAlign = 'center';
            note.style.color = '#666';
            note.style.marginBottom = '20px';
            note.textContent = `Showing all fish created by ${displayName}`;
            
            const headerContainer = document.querySelector('.ranking-header');
            if (headerContainer) {
                headerContainer.appendChild(note);
                
                // Add back to profile link
                const backLink = document.createElement('p');
                backLink.style.textAlign = 'center';
                backLink.style.marginTop = '10px';
                backLink.innerHTML = `<a href="profile.html?userId=${encodeURIComponent(userId)}" style="color: #007bff; text-decoration: none;">&larr; Back to ${displayName}'s Profile</a>`;
                headerContainer.appendChild(backLink);
            }
        }
    } catch (error) {
        console.error('Error updating page header for user:', error);
        // Fallback to using userId if profile fetch fails
        const headerElement = document.querySelector('.ranking-header h1');
        if (headerElement) {
            headerElement.textContent = `Fish by ${userId}`;
        }
        document.title = `Fish by ${userId} - Fish Ranking`;
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
window.addEventListener('DOMContentLoaded', async () => {
    // Check for userId parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    currentUserId = urlParams.get('userId');
    
    // Update page header if filtering by user
    if (currentUserId) {
        await updatePageHeaderForUser(currentUserId);
    }
    
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
// Modal functions are now handled by modal-utils.js
// showAddToTankModal, closeAddToTankModal, and closeLoginPromptModal are exported there