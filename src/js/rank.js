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

// Pagination variables
let currentPage = 1;
let pageSize = 20; // Number of fish per page
let totalPages = 1; // Will be updated based on data
let totalFishCount = 0; // Total count of fish (set once on initial load)
let pageHistory = []; // Track page history for "back" navigation

// Cache for image validation results to avoid testing the same image multiple times
const imageValidationCache = new Map(); // url -> {isValid: boolean, timestamp: number}

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

// Date formatting is now in fish-utils.js

// Vote sending function is now in fish-utils.js

// Handle vote button click - rank page specific
function handleVote(fishId, voteType, button) {
    handleVoteGeneric(fishId, voteType, button, (result, voteType) => {
        // Update the fish data in allFishData array
        const fish = allFishData.find(f => f.docId === fishId);
        if (fish) {
            // Update upvotes based on result
            if (result.upvotes !== undefined) {
                fish.upvotes = result.upvotes;
            } else if (result.updatedFish && result.updatedFish.upvotes !== undefined) {
                fish.upvotes = result.updatedFish.upvotes;
            } else if (result.action === 'upvote') {
                fish.upvotes = (fish.upvotes || 0) + 1;
            } else if (result.action === 'cancel_upvote') {
                fish.upvotes = Math.max(0, (fish.upvotes || 0) - 1);
            }

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

    const upvoteElement = document.querySelector(`.fish-card[data-fish-id="${fishId}"] .upvote-count`);

    if (upvoteElement) {
        upvoteElement.textContent = fish.upvotes || 0;
    } else {
        console.error(`Upvote element not found for fish ${fishId}`);
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
    const upvotes = fish.upvotes || 0;
    const userToken = localStorage.getItem('userToken');
    
    // Check if this is the current user's fish
    const isCurrentUserFish = isUserFish(fish);
    
    // Add highlighting classes and styles for user's fish
    const userFishClass = isCurrentUserFish ? ' user-fish-highlight' : '';

    const fishImageContainer =
        `<div class="fish-image-container">`;
    
    // Only show favorite button for other users' fish and if user is logged in
    const showFavoriteButton = userToken && !isCurrentUserFish;
    
    return `
        <div class="fish-card${userFishClass}" data-fish-id="${fish.docId}">
            ${fishImageContainer}
                <img class="fish-image" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="Fish" data-fish-id="${fish.docId}">
            </div>
            <div class="fish-info">
                <div class="fish-artist">
                    <a href="profile.html?userId=${encodeURIComponent(fish.userId || 'Anonymous')}" 
                       style="color: inherit; text-decoration: none;">
                        ${escapeHtml(fish.Artist || 'Anonymous')}
                    </a>
                </div>
                <div class="fish-date">${formatDate(fish.CreatedAt)}</div>
            </div>
            <div class="voting-controls">
                <button class="vote-btn upvote-btn" onclick="handleVote('${fish.docId}', 'up', this)">
                    👍 <span class="vote-count upvote-count">${upvotes}</span>
                </button>
                ${showFavoriteButton ? `
                <button class="favorite-btn" id="fav-btn-${fish.docId}" onclick="handleFavoriteClick('${fish.docId}', event)" title="Add to favorites">
                    <span class="star-icon">☆</span>
                </button>
                ` : ''}
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
            tooltip = sortDirection === 'desc' ? 'Newest first' : 'Oldest first';
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
    currentPage = 1; // Reset to first page when sort changes
    totalFishCount = 0; // Reset total count (will be recalculated on next load)
    totalPages = 1; // Reset total pages

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
                const imageUrl = fish.image || fish.Image || fish.image_url;
                if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
                    return null; // Invalid URL format
                }

                try {
                const isValid = await testImageUrl(imageUrl);
                return isValid ? fish : null;
                } catch (error) {
                    console.warn('Error testing image URL:', imageUrl, error);
                    return null;
                }
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
async function loadFishData(sortType = currentSort, isInitialLoad = true, page = currentPage) {
    if (isLoading) {
        return;
    }

    isLoading = true;
    currentPage = page;

    try {
        const loadingElement = document.getElementById('loading');
        const gridElement = document.getElementById('fish-grid');
        const paginationControls = document.getElementById('pagination-controls');

        // Calculate offset based on page number
        // For Hasura, startAfter is used as offset
        const offset = (page - 1) * pageSize;

        loadingElement.textContent = `Loading fish... 🐠`;
        loadingElement.style.display = 'block';
        loadingElement.classList.add('loading');
        gridElement.style.display = 'none';
        paginationControls.style.display = 'none';

        // Load one page worth of fish (we'll load a bit more to account for invalid images)
        const loadCount = pageSize + 10; // Load a bit more to account for filtering

        // Use offset for pagination (getFishBySort uses startAfter as offset for Hasura)
        const fishDocs = await getFishBySort(sortType, loadCount, offset, sortDirection, currentUserId);

        // Get total count from the response (stored in _totalCount property)
        // Set it once and keep it consistent throughout pagination
        if (fishDocs._totalCount !== undefined && totalFishCount === 0) {
            totalFishCount = fishDocs._totalCount;
            totalPages = Math.ceil(totalFishCount / pageSize);
        }

        // Map fish documents to objects
        const newFish = fishDocs.map(doc => {
            const data = doc.data();
            const fish = {
                ...data,
                docId: doc.id
            };
            return fish;
        });

        // Filter to only fish with working images
        const validFish = await filterValidFish(newFish);

        // Take only the first pageSize fish for this page
        const pageFish = validFish.slice(0, pageSize);

        // Check if there are more pages based on total count
        if (totalFishCount > 0) {
            // Use total count to determine if there are more pages
            const currentPageEndIndex = currentPage * pageSize;
            hasMoreFish = currentPageEndIndex < totalFishCount;
        } else {
            // Fallback: check based on loaded data
            hasMoreFish = validFish.length > pageSize || fishDocs.length >= loadCount;
        }

        // Update allFishData for the current page
        allFishData = pageFish;
        loadedCount = allFishData.length;

        // Hide loading and show grid
        loadingElement.style.display = 'none';
        loadingElement.classList.remove('loading');
        gridElement.style.display = 'grid';
        paginationControls.style.display = 'flex';
        
        displayFish(allFishData, false);
        updatePaginationControls();
        updateStatusMessage();

        // Scroll to top when page changes
        if (!isInitialLoad) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

    } catch (error) {
        console.error('Error loading fish:', error);
        const loadingElement = document.getElementById('loading');
        loadingElement.textContent = 'Error loading fish. Please try again.';
        loadingElement.classList.remove('loading');
    } finally {
        isLoading = false;
    }
}

// Update status message
function updateStatusMessage() {
    const loadingElement = document.getElementById('loading');
    if (!loadingElement) return;

    if (!hasMoreFish && loadedCount > 0) {
        loadingElement.textContent = `Showing all ${loadedCount} fish 🐟`;
        loadingElement.style.display = 'block';
        loadingElement.style.color = '#666';
        loadingElement.style.fontSize = '0.9em';
        loadingElement.style.padding = '20px';
        // 移除 loading 类以停止转圈动画
        loadingElement.classList.remove('loading');
    } else if (loadedCount === 0 && !isLoading) {
        // 如果没有鱼且不在加载中，隐藏 loading 元素
        loadingElement.style.display = 'none';
        loadingElement.classList.remove('loading');
    } else if (isLoading) {
        // 如果正在加载，确保有 loading 类
        loadingElement.classList.add('loading');
    } else {
        // 其他情况，确保移除 loading 类并隐藏
        loadingElement.classList.remove('loading');
        if (loadingElement.textContent.includes('Showing all')) {
            // 如果显示最终消息，保持显示但不转圈
            loadingElement.style.display = 'block';
        } else {
            loadingElement.style.display = 'none';
        }
    }
}

// Update pagination controls
function updatePaginationControls() {
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    const currentPageSpan = document.getElementById('current-page');
    const totalPagesSpan = document.getElementById('total-pages');

    // Update page numbers
    if (currentPageSpan) {
        currentPageSpan.textContent = currentPage;
    }
    
    // Use calculated total pages (set once on initial load)
    if (totalPagesSpan) {
        totalPagesSpan.textContent = totalPages;
    }

    // Update button states
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = !hasMoreFish || currentPage >= totalPages;
    }
}

// Go to next page
function goToNextPage() {
    if (!isLoading && hasMoreFish) {
        const urlParams = new URLSearchParams(window.location.search);
        const showFavorites = urlParams.get('favorites') === 'true';
        if (showFavorites) {
            loadFavoriteFish(false, currentPage + 1);
        } else {
        loadFishData(currentSort, false, currentPage + 1);
        }
    }
}

// Go to previous page
function goToPrevPage() {
    if (!isLoading && currentPage > 1) {
        const urlParams = new URLSearchParams(window.location.search);
        const showFavorites = urlParams.get('favorites') === 'true';
        if (showFavorites) {
            loadFavoriteFish(false, currentPage - 1);
        } else {
        loadFishData(currentSort, false, currentPage - 1);
        }
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

// Load favorite fish
async function loadFavoriteFish(isInitialLoad = true, page = currentPage) {
    if (isLoading) {
        return;
    }

    isLoading = true;
    currentPage = page;

    try {
        const loadingElement = document.getElementById('loading');
        const gridElement = document.getElementById('fish-grid');
        const paginationControls = document.getElementById('pagination-controls');

        loadingElement.textContent = `Loading favorites... ⭐`;
        loadingElement.style.display = 'block';
        loadingElement.classList.add('loading');
        gridElement.style.display = 'none';
        paginationControls.style.display = 'none';

        // Get user token
        const userToken = localStorage.getItem('userToken');
        if (!userToken) {
            throw new Error('Please login to view favorites');
        }

        // Get favorites from API
        const API_BASE = typeof BACKEND_URL !== 'undefined' ? BACKEND_URL : '';
        const response = await fetch(`${API_BASE}/api/fish-api?action=my-tank`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load favorites');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Failed to load favorites');
        }

        // Filter only favorited fish
        const favoritedFish = (data.fish || []).filter(f => f.is_favorited);
        
        if (favoritedFish.length === 0) {
            // No favorites, show empty state
            loadingElement.textContent = 'No favorites yet. Start adding fish to your favorites! ⭐';
            loadingElement.classList.remove('loading');
            gridElement.style.display = 'grid';
            gridElement.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">No favorite fish yet. Go to the Rank page and click the star icon on fish you like!</div>';
            paginationControls.style.display = 'none';
            allFishData = [];
            loadedCount = 0;
            totalFishCount = 0;
            totalPages = 1;
            hasMoreFish = false;
            isLoading = false;
            return;
        }
        
        // Map to fish format
        const newFish = favoritedFish.map(fish => ({
            ...fish,
            docId: fish.id,
            Artist: fish.artist,
            CreatedAt: fish.created_at,
            userId: fish.user_id,
            image: fish.image_url, // Map image_url to image for compatibility
            Image: fish.image_url
        }));

        // For favorites, skip image validation to speed up loading
        // Images will be validated when displayed
        loadingElement.textContent = `Loading ${newFish.length} favorite fish... ⭐`;
        const validFish = newFish; // Skip validation for favorites to speed up

        // Pagination
        const offset = (page - 1) * pageSize;
        const pageFish = validFish.slice(offset, offset + pageSize);
        
        totalFishCount = validFish.length;
        totalPages = Math.ceil(totalFishCount / pageSize);
        hasMoreFish = offset + pageSize < totalFishCount;

        // Update allFishData for the current page
        allFishData = pageFish;
        loadedCount = allFishData.length;

        // Set isLoading to false before updating status to prevent spinner from restarting
        isLoading = false;

        // Hide loading and show grid
        loadingElement.style.display = 'none';
        loadingElement.classList.remove('loading');
        gridElement.style.display = 'grid';
        paginationControls.style.display = 'flex';
        
        displayFish(allFishData, false);
        updatePaginationControls();
        updateStatusMessage();

        // Update page header
        const pageHeader = document.querySelector('.page-header h1');
        if (pageHeader) {
            pageHeader.textContent = '⭐ My Favorites';
        }

        // Scroll to top when page changes
        if (!isInitialLoad) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

    } catch (error) {
        console.error('Error loading favorites:', error);
        console.error('Error stack:', error.stack);
        const loadingElement = document.getElementById('loading');
        const gridElement = document.getElementById('fish-grid');
        const paginationControls = document.getElementById('pagination-controls');
        
        loadingElement.textContent = error.message || 'Error loading favorites. Please try again.';
        loadingElement.classList.remove('loading');
        gridElement.style.display = 'grid';
        gridElement.innerHTML = `<div style="text-align: center; padding: 40px; color: #ff6b6b;">
            <p>Failed to load favorites</p>
            <p style="font-size: 0.9em; color: #666;">${error.message || 'Please try again later'}</p>
        </div>`;
        paginationControls.style.display = 'none';
    } finally {
        isLoading = false;
    }
}

// Initialize page
window.addEventListener('DOMContentLoaded', async () => {
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const showFavorites = urlParams.get('favorites') === 'true';
    currentUserId = urlParams.get('userId');
    
    if (showFavorites) {
        // Load favorite fish
        await loadFavoriteFish();
    } else {
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

    // Set up pagination button event listeners
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', goToPrevPage);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', goToNextPage);
    }

    // Disable infinite scroll (we're using pagination buttons now)
    // Commented out to use pagination instead of infinite scroll
    // window.addEventListener('scroll', throttledScroll);

    // Initialize button text with arrows
    updateSortButtonText();

    // Load initial fish data
    loadFishData();
    }
    
    // Initialize favorite buttons if user is logged in
    initializeFavoriteButtons();
});

// Handle reporting - rank page specific
function handleReport(fishId, button) {
    handleReportGeneric(fishId, button);
}

// Add to Tank functionality now handled by modal-utils.js
// The showAddToTankModal function is now available globally from modal-utils.js

// Modal functions are now handled by modal-utils.js

// Handle favorite click
async function handleFavoriteClick(fishId, event) {
    if (event) event.stopPropagation();
    
    const button = document.getElementById(`fav-btn-${fishId}`);
    if (!button) return;
    
    // Check if user is logged in
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
        FishTankFavorites.showToast('Please login to favorite fish', 'info');
        return;
    }
    
    try {
        button.disabled = true;
        
        // Check if already favorited
        const isFav = await FishTankFavorites.isFavorite(fishId);
        
        if (isFav) {
            // Remove from favorites
            await FishTankFavorites.removeFromFavorites(fishId);
            button.innerHTML = '<span class="star-icon">☆</span>';
            button.title = 'Add to favorites';
            button.classList.remove('favorited');
            FishTankFavorites.showToast('Removed from favorites');
        } else {
            // Add to favorites
            await FishTankFavorites.addToFavorites(fishId);
            button.innerHTML = '<span class="star-icon filled">⭐</span>';
            button.title = 'Remove from favorites';
            button.classList.add('favorited');
            FishTankFavorites.showToast('Added to favorites!');
        }
        
    } catch (error) {
        console.error('Error toggling favorite:', error);
        FishTankFavorites.showToast(error.message || 'Failed to update favorite', 'error');
    } finally {
        button.disabled = false;
    }
}

// Initialize favorite buttons state on page load
async function initializeFavoriteButtons() {
    const userToken = localStorage.getItem('userToken');
    if (!userToken) return;
    
    try {
        // Initialize the favorites cache
        await FishTankFavorites.initializeCache();
        
        // Update all favorite buttons
        allFishData.forEach(async (fish) => {
            const button = document.getElementById(`fav-btn-${fish.docId}`);
            if (button) {
                const isFav = await FishTankFavorites.isFavorite(fish.docId);
                if (isFav) {
                    button.innerHTML = '<span class="star-icon filled">⭐</span>';
                    button.title = 'Remove from favorites';
                    button.classList.add('favorited');
                } else {
                    button.innerHTML = '<span class="star-icon">☆</span>';
                    button.title = 'Add to favorites';
                    button.classList.remove('favorited');
                }
            }
        });
    } catch (error) {
        console.error('Error initializing favorite buttons:', error);
    }
}

// Make functions globally available
window.handleVote = handleVote;
window.handleReport = handleReport;
window.handleFavoriteClick = handleFavoriteClick;
// Modal functions are now handled by modal-utils.js
// showAddToTankModal, closeAddToTankModal, and closeLoginPromptModal are exported there

// ===== 背景气泡效果 =====
function createBackgroundBubbles() {
    const container = document.querySelector('.background-bubbles');
    if (!container) return;
    
    const bubbleCount = 15;
    
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
document.addEventListener('DOMContentLoaded', () => {
    createBackgroundBubbles();
});