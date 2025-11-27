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
    
    // Debug log (only for first few fish to avoid spam)
    if (window.debugFishCard !== false && Math.random() < 0.1) {
        console.log('🐟 Fish card debug:', {
            fishId: fish.docId,
            fishUserId: fish.userId,
            isCurrentUserFish,
            hasEditButtons: isCurrentUserFish
        });
        window.debugFishCard = false; // Only log once per page load
    }
    
    // Add highlighting classes and styles for user's fish
    const userFishClass = isCurrentUserFish ? ' user-fish-highlight' : '';

    const fishImageContainer =
        `<div class="fish-image-container">`;
    
    // Only show favorite button for other users' fish and if user is logged in
    const showFavoriteButton = userToken && !isCurrentUserFish;
    
    return `
        <div class="fish-card${userFishClass}" data-fish-id="${fish.docId}" data-fish-name="${escapeHtml(fish.fish_name || fish.Artist || 'Unnamed')}" data-fish-personality="${escapeHtml(fish.personality || 'random')}">
            ${fishImageContainer}
                <img class="fish-image" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="Fish" data-fish-id="${fish.docId}">
            </div>
            <div class="fish-info">
                <div class="fish-artist">
                    ${escapeHtml(fish.fish_name || fish.Artist || 'Unnamed Fish')}
                </div>
                <div class="fish-date">
                    by <a href="profile.html?userId=${encodeURIComponent(fish.userId || 'Anonymous')}" 
                       style="color: inherit; text-decoration: none;">
                        ${escapeHtml(fish.Artist || 'Anonymous')}
                    </a> • ${formatDate(fish.CreatedAt)}
                </div>
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
                ${isCurrentUserFish ? `
                <button class="edit-btn" onclick="showEditFishModal('${fish.docId}')" title="Edit fish information" style="padding: 10px 14px; border: 2px solid #E0E0E0; background: white; cursor: pointer; border-radius: 15px; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); color: #2196F3; font-weight: 600;">
                    ✏️
                </button>
                <button class="delete-btn" onclick="showDeleteFishModal('${fish.docId}')" title="Delete fish" style="padding: 10px 14px; border: 2px solid #E0E0E0; background: white; cursor: pointer; border-radius: 15px; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); color: #F44336; font-weight: 600;">
                    🗑️
                </button>
                ` : `
                <button class="report-btn" onclick="handleReport('${fish.docId}', this)" title="Report inappropriate content">
                    🚩
                </button>
                `}
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

// Removed updateSortButtonText - no longer using buttons

// Handle sort button clicks
async function handleSortChange(sortType) {
    // New sort type, use default direction
    currentSort = sortType;
    sortDirection = sortType === 'date' ? 'desc' : 'desc'; // Default to descending for most sorts

    // Update sort buttons
    const sortHotBtn = document.getElementById('sort-hot-btn');
    const sortDateBtn = document.getElementById('sort-date-btn');
    
    if (sortHotBtn && sortDateBtn) {
        if (sortType === 'hot') {
            sortHotBtn.classList.add('active');
            sortDateBtn.classList.remove('active');
        } else {
            sortDateBtn.classList.add('active');
            sortHotBtn.classList.remove('active');
        }
    }

    // If we're in my-fish or favorites category, just re-sort the existing data
    if (currentCategory === 'my-fish') {
        const sortedData = sortFishArray(myFishData, sortType);
        displayCategoryFish(sortedData);
        return;
    } else if (currentCategory === 'favorites') {
        const sortedData = sortFishArray(favoritesData, sortType);
        displayCategoryFish(sortedData);
        return;
    }

    // For rank category, reset pagination and reload data
    lastDoc = null;
    hasMoreFish = true;
    loadedCount = 0;
    allFishData = [];
    currentPage = 1; // Reset to first page when sort changes
    totalFishCount = 0; // Reset total count (will be recalculated on next load)
    totalPages = 1; // Reset total pages

    // Show loading and reload data with new sort
    document.getElementById('loading').style.display = 'block';
    document.getElementById('fish-grid').style.display = 'none';

    // Reload fish data with new sort criteria
    await loadFishData(sortType);
}

// Helper function to sort fish array
function sortFishArray(fishArray, sortType) {
    const sorted = [...fishArray];
    if (sortType === 'hot') {
        // Sort by votes (descending)
        sorted.sort((a, b) => {
            const votesA = a.votes || a.Votes || 0;
            const votesB = b.votes || b.Votes || 0;
            return votesB - votesA;
        });
    } else {
        // Sort by date (descending - newest first)
        sorted.sort((a, b) => {
            const dateA = new Date(a.created_at || a.CreatedAt);
            const dateB = new Date(b.created_at || b.CreatedAt);
            return dateB - dateA;
        });
    }
    return sorted;
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
        const newFish = fishDocs.map((doc, index) => {
            const data = doc.data();
            const fish = {
                ...data,
                docId: doc.id,
                // Ensure userId is available (may be user_id in data)
                userId: data.userId || data.user_id || data.UserId
            };
            
            // Debug log for first fish to check structure
            if (index === 0) {
                console.log('🐟 Sample fish data structure:', {
                    docId: fish.docId,
                    userId: fish.userId,
                    user_id: data.user_id,
                    Artist: fish.Artist,
                    fish_name: fish.fish_name,
                    personality: fish.personality
                });
            }
            
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
        
        // Update rank count if available
        if (totalFishCount > 0) {
            const rankCountElement = document.getElementById('rank-count');
            if (rankCountElement) {
                rankCountElement.textContent = totalFishCount;
            }
        }

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
        // Hide the "Showing all X fish" message
        loadingElement.style.display = 'none';
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
        loadingElement.style.display = 'none';
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

// Update page header when filtering by user (disabled in new UI)
async function updatePageHeaderForUser(userId) {
    // User filter header is now hidden in the new UI
    // Users can use the category tabs instead
    console.log('User filter header hidden - use category tabs instead');
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
        
        // Ensure category filter is visible
        const filterElement = document.getElementById('fish-category-filter');
        if (filterElement) {
            filterElement.style.display = 'flex';
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
        const pageHeader = document.querySelector('.ranking-header h1');
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

// Fish category management
let currentCategory = 'all'; // 'all', 'my-fish', 'favorites'
let myFishData = [];
let favoritesData = [];

// Load user's fish and favorites
async function loadUserFishCategories() {
    try {
        const user = await window.supabaseAuth.getCurrentUser();
        if (!user) return;
        
        const userToken = localStorage.getItem('userToken');
        if (!userToken) return;
        
        // Load from my-tank API
        const BACKEND_URL = window.BACKEND_URL || '';
        const response = await fetch(`${BACKEND_URL}/api/fish-api?action=my-tank`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        if (!data.success) return;
        
        const allUserFish = data.fish || [];
        
        // Separate into my fish and favorites
        myFishData = allUserFish.filter(f => f.is_own || f.isOwn);
        favoritesData = allUserFish.filter(f => f.is_favorited || f.isFavorited);
        
        // Update counts
        document.getElementById('my-fish-count').textContent = myFishData.length;
        document.getElementById('favorites-count').textContent = favoritesData.length;
        
        // Show filter if user is logged in (show even if no fish yet)
        const filterElement = document.getElementById('fish-category-filter');
        if (filterElement && user) {
            filterElement.style.display = 'flex';
        }
        
        console.log(`✅ Loaded ${myFishData.length} my fish, ${favoritesData.length} favorites`);
    } catch (error) {
        console.error('Error loading user fish categories:', error);
    }
}

// Handle category change
async function handleCategoryChange(category) {
    currentCategory = category;
    
    // Update active tab
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Load appropriate data
    if (category === 'rank') {
        // Clear user filter to show all fish
        const previousUserId = currentUserId;
        currentUserId = null;
        
        // Reset pagination state
        lastDoc = null;
        hasMoreFish = true;
        loadedCount = 0;
        allFishData = [];
        currentPage = 1;
        totalFishCount = 0;
        totalPages = 1;
        
        // Load all fish (normal ranking)
        await loadFishData(currentSort, false, 1);
        
        // Restore userId for other categories if needed
        if (!previousUserId) {
            currentUserId = null;
        }
    } else if (category === 'my-fish') {
        displayCategoryFish(myFishData);
    } else if (category === 'favorites') {
        displayCategoryFish(favoritesData);
    }
}

// Display fish from category
function displayCategoryFish(fishArray) {
    const gridElement = document.getElementById('fish-grid');
    const loadingElement = document.getElementById('loading');
    const paginationControls = document.getElementById('pagination-controls');
    
    if (!fishArray || fishArray.length === 0) {
        gridElement.style.display = 'none';
        paginationControls.style.display = 'none';
        
        let message = 'No fish found.';
        if (currentCategory === 'my-fish') {
            message = 'No fish created yet. Go draw some!';
        } else if (currentCategory === 'favorites') {
            message = 'No favorites yet. Start adding fish to favorites!';
        }
        
        loadingElement.textContent = message;
        loadingElement.style.display = 'block';
        loadingElement.classList.remove('loading');
        return;
    }
    
    // Apply current sort before displaying
    const sortedArray = sortFishArray(fishArray, currentSort);
    
    // Map to display format
    allFishData = sortedArray.map(fish => ({
        ...fish,
        docId: fish.id,
        Artist: fish.artist || fish.Artist,
        CreatedAt: fish.created_at || fish.CreatedAt,
        userId: fish.user_id || fish.userId,
        Image: fish.image_url || fish.Image,
        image: fish.image_url || fish.image,
        upvotes: fish.upvotes || 0,
        votes: fish.upvotes || fish.votes || 0,
        Votes: fish.upvotes || fish.votes || 0
    }));
    
    loadingElement.style.display = 'none';
    gridElement.style.display = 'grid';
    paginationControls.style.display = 'none'; // Hide pagination for user's own fish
    
    displayFish(allFishData, false);
}

// Initialize page
window.addEventListener('DOMContentLoaded', async () => {
    // Initialize user cache first (critical for identifying user's fish)
    if (window.initializeUserCache) {
        await window.initializeUserCache();
        console.log('✅ User cache initialized for rank page');
    }
    
    // Check for URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const showFavorites = urlParams.get('favorites') === 'true';
    const showMyFish = urlParams.get('myfish') === 'true';
    const urlUserId = urlParams.get('userId'); // Keep for backward compatibility
    
    // Load user's fish categories (to populate counts)
    await loadUserFishCategories();
    
    // Determine which category to show initially
    let initialCategory = 'rank'; // Default
    if (showFavorites) {
        initialCategory = 'favorites';
    } else if (showMyFish) {
        initialCategory = 'my-fish';
    }
    
    // Only set currentUserId filter if we're not showing rank category
    // This ensures rank category always shows all fish
    currentUserId = (initialCategory === 'rank') ? null : urlUserId;
    
    // Set active tab based on initial category
    document.querySelectorAll('.category-tab').forEach(tab => {
        const category = tab.getAttribute('data-category');
        if (category === initialCategory) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    currentCategory = initialCategory;
    
    // Hide user filter header if present
    const userFilterNote = document.querySelector('.user-filter-note');
    if (userFilterNote) {
        userFilterNote.style.display = 'none';
    }
    
    // Set up category tab listeners
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            handleCategoryChange(tab.getAttribute('data-category'));
        });
    });
    
    // Set up sort button listeners
    const sortHotBtn = document.getElementById('sort-hot-btn');
    const sortDateBtn = document.getElementById('sort-date-btn');
    
    if (sortHotBtn) {
        sortHotBtn.addEventListener('click', async () => {
            if (sortHotBtn.classList.contains('active')) return; // Already active
            
            // Toggle active states
            sortHotBtn.classList.add('active');
            sortDateBtn.classList.remove('active');
            
            await handleSortChange('hot');
        });
    }
    
    if (sortDateBtn) {
        sortDateBtn.addEventListener('click', async () => {
            if (sortDateBtn.classList.contains('active')) return; // Already active
            
            // Toggle active states
            sortDateBtn.classList.add('active');
            sortHotBtn.classList.remove('active');
            
            await handleSortChange('date');
        });
    }

    // Set up pagination button event listeners
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', goToPrevPage);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', goToNextPage);
    }

    // Load data based on initial category
    if (initialCategory === 'favorites') {
        displayCategoryFish(favoritesData);
    } else if (initialCategory === 'my-fish') {
        displayCategoryFish(myFishData);
    } else {
        // Load rank data (all fish)
        await loadFishData();
        // Update rank count after loading
        if (totalFishCount > 0) {
            document.getElementById('rank-count').textContent = totalFishCount;
        }
    }
    
    // Initialize favorite buttons if user is logged in
    initializeFavoriteButtons();
});

// Handle reporting - rank page specific
function handleReport(fishId, button) {
    handleReportGeneric(fishId, button);
}

// ===== Fish Edit and Delete Functions =====

// Preset personalities list
const PRESET_PERSONALITIES = [
    { value: 'funny', label: '😂 Funny', emoji: '😂' },
    { value: 'cheerful', label: '😊 Cheerful', emoji: '😊' },
    { value: 'brave', label: '💪 Brave', emoji: '💪' },
    { value: 'playful', label: '🎮 Playful', emoji: '🎮' },
    { value: 'curious', label: '🔍 Curious', emoji: '🔍' },
    { value: 'energetic', label: '⚡ Energetic', emoji: '⚡' },
    { value: 'calm', label: '😌 Calm', emoji: '😌' },
    { value: 'gentle', label: '🌸 Gentle', emoji: '🌸' },
    { value: 'sarcastic', label: '😏 Sarcastic', emoji: '😏' },
    { value: 'dramatic', label: '🎭 Dramatic', emoji: '🎭' },
    { value: 'naive', label: '🦋 Naive', emoji: '🦋' },
    { value: 'shy', label: '😳 Shy', emoji: '😳' },
    { value: 'anxious', label: '😰 Anxious', emoji: '😰' },
    { value: 'stubborn', label: '🤨 Stubborn', emoji: '🤨' },
    { value: 'serious', label: '😐 Serious', emoji: '😐' },
    { value: 'lazy', label: '😴 Lazy', emoji: '😴' },
    { value: 'grumpy', label: '😠 Grumpy', emoji: '😠' },
    { value: 'aggressive', label: '👊 Aggressive', emoji: '👊' },
    { value: 'cynical', label: '🙄 Cynical', emoji: '🙄' },
    { value: 'crude', label: '🐻 Crude', emoji: '🐻' }
];

// Check if user has premium membership
async function checkUserMembership() {
    try {
        const userToken = localStorage.getItem('userToken');
        if (!userToken) return 'free';
        
        const BACKEND_URL = window.BACKEND_URL || '';
        const response = await fetch(`${BACKEND_URL}/api/config-api?action=hasura`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });
        
        if (!response.ok) return 'free';
        
        const config = await response.json();
        
        // Query user's membership from Hasura
        const hasuraEndpoint = config.endpoint || '/api/graphql';
        const hasuraSecret = config.secret;
        
        const user = await window.supabaseAuth.getCurrentUser();
        if (!user) return 'free';
        
        const query = `
            query GetUserMembership($userId: String!) {
                users_by_pk(id: $userId) {
                    user_subscriptions(
                        where: { is_active: { _eq: true } }
                        order_by: { created_at: desc }
                        limit: 1
                    ) {
                        plan
                    }
                }
            }
        `;
        
        const graphqlResponse = await fetch(hasuraEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': hasuraSecret
            },
            body: JSON.stringify({
                query,
                variables: { userId: user.id }
            })
        });
        
        const result = await graphqlResponse.json();
        const subscription = result.data?.users_by_pk?.user_subscriptions?.[0];
        
        return subscription?.plan || 'free';
    } catch (error) {
        console.error('Error checking membership:', error);
        return 'free';
    }
}

// Show edit fish modal
async function showEditFishModal(fishId) {
    const fishCard = document.querySelector(`.fish-card[data-fish-id="${fishId}"]`);
    if (!fishCard) {
        console.error('Fish card not found:', fishId);
        return;
    }
    
    const fishName = fishCard.getAttribute('data-fish-name') || 'Unnamed';
    const fishPersonality = fishCard.getAttribute('data-fish-personality') || 'random';
    
    // Check if personality is a preset or custom
    const isPresetPersonality = PRESET_PERSONALITIES.some(p => p.value === fishPersonality);
    const selectedPersonality = isPresetPersonality ? fishPersonality : 'custom';
    const customPersonalityValue = isPresetPersonality ? '' : fishPersonality;
    
    // Check user membership for custom personality
    const userMembership = await checkUserMembership();
    const canUseCustom = userMembership === 'premium' || userMembership === 'plus';
    
    const modalHTML = `
        <div class="modal" id="edit-fish-modal" style="display: block;">
            <div class="modal-content" style="max-width: 500px;">
                <span class="close" onclick="closeEditFishModal()">&times;</span>
                <h2 style="margin-top: 0; color: #4F46E5;">✏️ Edit Fish</h2>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                        Fish Name <span style="color: #F44336;">*</span>
                    </label>
                    <input type="text" id="edit-fish-name" value="${escapeHtml(fishName)}" 
                        maxlength="30" placeholder="Enter fish name"
                        style="width: 100%; padding: 12px; border: 2px solid #E0E0E0; border-radius: 8px; font-size: 14px; box-sizing: border-box;">
                    <small style="color: #666; font-size: 12px;">Maximum 30 characters</small>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                        Personality
                    </label>
                    <select id="edit-fish-personality" onchange="toggleCustomPersonalityInput()"
                        style="width: 100%; padding: 12px; border: 2px solid #E0E0E0; border-radius: 8px; font-size: 14px;">
                        <option value="random" ${selectedPersonality === 'random' ? 'selected' : ''}>🎲 Random</option>
                        <option value="custom" ${selectedPersonality === 'custom' ? 'selected' : ''}>
                            ✨ Custom ${canUseCustom ? '' : '(Premium Only)'}
                        </option>
                        ${PRESET_PERSONALITIES.map(p => `
                            <option value="${p.value}" ${selectedPersonality === p.value ? 'selected' : ''}>${p.label}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div id="custom-personality-container" style="margin-bottom: 20px; display: ${selectedPersonality === 'custom' ? 'block' : 'none'};">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                        Custom Personality
                        ${canUseCustom ? '' : '<span style="color: #F44336; font-size: 12px;">(Upgrade to Premium)</span>'}
                    </label>
                    <input type="text" id="edit-custom-personality" value="${escapeHtml(customPersonalityValue)}"
                        maxlength="50" placeholder="Describe your fish's personality"
                        ${canUseCustom ? '' : 'disabled'}
                        style="width: 100%; padding: 12px; border: 2px solid #E0E0E0; border-radius: 8px; font-size: 14px; box-sizing: border-box;">
                    <small style="color: #666; font-size: 12px;">Maximum 50 characters</small>
                    ${canUseCustom ? '' : `
                        <div style="margin-top: 10px; padding: 10px; background: #FFF3E0; border-radius: 6px; font-size: 13px; color: #E65100;">
                            💎 Custom personalities are available for Premium and Plus members.
                            <a href="membership.html" style="color: #2196F3; text-decoration: underline;">Upgrade now</a>
                        </div>
                    `}
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px;">
                    <button onclick="closeEditFishModal()" 
                        style="padding: 10px 20px; border: 2px solid #E0E0E0; background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: #666;">
                        Cancel
                    </button>
                    <button onclick="saveEditedFish('${fishId}')" 
                        style="padding: 10px 20px; border: none; background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Toggle custom personality input visibility
function toggleCustomPersonalityInput() {
    const select = document.getElementById('edit-fish-personality');
    const container = document.getElementById('custom-personality-container');
    
    if (select && container) {
        container.style.display = select.value === 'custom' ? 'block' : 'none';
    }
}

// Close edit fish modal
function closeEditFishModal() {
    const modal = document.getElementById('edit-fish-modal');
    if (modal) {
        modal.remove();
    }
}

// Save edited fish
async function saveEditedFish(fishId) {
    try {
        const fishName = document.getElementById('edit-fish-name').value.trim();
        const personalitySelect = document.getElementById('edit-fish-personality').value;
        const customPersonality = document.getElementById('edit-custom-personality')?.value.trim();
        
        // Validation
        if (!fishName) {
            alert('Please enter a fish name');
            return;
        }
        
        if (fishName.length > 30) {
            alert('Fish name must be 30 characters or less');
            return;
        }
        
        let personality = personalitySelect;
        let isCustomPersonality = false;
        
        if (personalitySelect === 'custom') {
            if (!customPersonality) {
                alert('Please enter a custom personality or select a preset');
                return;
            }
            if (customPersonality.length > 50) {
                alert('Custom personality must be 50 characters or less');
                return;
            }
            personality = customPersonality;
            isCustomPersonality = true;
        }
        
        // Show loading state
        const saveButton = event.target;
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Saving...';
        saveButton.disabled = true;
        
        // Get user ID
        const user = await window.supabaseAuth.getCurrentUser();
        if (!user) {
            alert('Please login to edit fish');
            closeEditFishModal();
            return;
        }
        
        // Call API
        const BACKEND_URL = window.BACKEND_URL || '';
        const response = await fetch(`${BACKEND_URL}/api/fish-api?action=update-info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fishId,
                fishName,
                personality,
                isCustomPersonality,
                userId: user.id
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update the fish card
            const fishCard = document.querySelector(`.fish-card[data-fish-id="${fishId}"]`);
            if (fishCard) {
                fishCard.setAttribute('data-fish-name', fishName);
                fishCard.setAttribute('data-fish-personality', personality);
            }
            
            // Show success message
            showToast('Fish updated successfully!', 'success');
            closeEditFishModal();
            
            // Reload the page to show updated data
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            throw new Error(result.error || result.details || 'Failed to update fish');
        }
        
    } catch (error) {
        console.error('Error saving fish:', error);
        alert('Failed to update fish: ' + error.message);
        
        // Restore button
        const saveButton = event.target;
        if (saveButton) {
            saveButton.textContent = 'Save Changes';
            saveButton.disabled = false;
        }
    }
}

// Show delete confirmation modal
function showDeleteFishModal(fishId) {
    const fishCard = document.querySelector(`.fish-card[data-fish-id="${fishId}"]`);
    const fishName = fishCard?.getAttribute('data-fish-name') || 'this fish';
    
    const modalHTML = `
        <div class="modal" id="delete-fish-modal" style="display: block;">
            <div class="modal-content" style="max-width: 400px;">
                <span class="close" onclick="closeDeleteFishModal()">&times;</span>
                <h2 style="margin-top: 0; color: #F44336;">🗑️ Delete Fish</h2>
                
                <p style="color: #666; line-height: 1.6;">
                    Are you sure you want to delete <strong>${escapeHtml(fishName)}</strong>?
                </p>
                
                <div style="padding: 12px; background: #FFEBEE; border-left: 4px solid #F44336; margin: 16px 0; border-radius: 4px;">
                    <strong style="color: #C62828;">⚠️ Warning:</strong>
                    <p style="margin: 8px 0 0 0; color: #D32F2F; font-size: 14px;">
                        This action cannot be undone. The fish will be permanently removed.
                    </p>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px;">
                    <button onclick="closeDeleteFishModal()" 
                        style="padding: 10px 20px; border: 2px solid #E0E0E0; background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: #666;">
                        Cancel
                    </button>
                    <button onclick="confirmDeleteFish('${fishId}')" 
                        style="padding: 10px 20px; border: none; background: linear-gradient(135deg, #F44336, #D32F2F); color: white; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Delete Forever
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close delete fish modal
function closeDeleteFishModal() {
    const modal = document.getElementById('delete-fish-modal');
    if (modal) {
        modal.remove();
    }
}

// Confirm and delete fish
async function confirmDeleteFish(fishId) {
    try {
        // Show loading state
        const deleteButton = event.target;
        const originalText = deleteButton.textContent;
        deleteButton.textContent = 'Deleting...';
        deleteButton.disabled = true;
        
        // Get user ID
        const user = await window.supabaseAuth.getCurrentUser();
        if (!user) {
            alert('Please login to delete fish');
            closeDeleteFishModal();
            return;
        }
        
        // Call API
        const BACKEND_URL = window.BACKEND_URL || '';
        const response = await fetch(`${BACKEND_URL}/api/fish-api?action=delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fishId,
                userId: user.id
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Remove the fish card from DOM
            const fishCard = document.querySelector(`.fish-card[data-fish-id="${fishId}"]`);
            if (fishCard) {
                fishCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                fishCard.style.opacity = '0';
                fishCard.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    fishCard.remove();
                }, 300);
            }
            
            // Remove from allFishData
            const index = allFishData.findIndex(f => f.docId === fishId);
            if (index !== -1) {
                allFishData.splice(index, 1);
            }
            
            // Show success message
            showToast('Fish deleted successfully', 'success');
            closeDeleteFishModal();
        } else {
            throw new Error(result.error || 'Failed to delete fish');
        }
        
    } catch (error) {
        console.error('Error deleting fish:', error);
        alert('Failed to delete fish: ' + error.message);
        
        // Restore button
        const deleteButton = event.target;
        if (deleteButton) {
            deleteButton.textContent = 'Delete Forever';
            deleteButton.disabled = false;
        }
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Make edit/delete functions globally available
window.showEditFishModal = showEditFishModal;
window.closeEditFishModal = closeEditFishModal;
window.saveEditedFish = saveEditedFish;
window.toggleCustomPersonalityInput = toggleCustomPersonalityInput;
window.showDeleteFishModal = showDeleteFishModal;
window.closeDeleteFishModal = closeDeleteFishModal;
window.confirmDeleteFish = confirmDeleteFish;

// Add to Tank functionality now handled by modal-utils.js
// The showAddToTankModal function is now available globally from modal-utils.js

// Modal functions are now handled by modal-utils.js

// Handle favorite click
async function handleFavoriteClick(fishId, event) {
    if (event) event.stopPropagation();
    
    const button = document.getElementById(`fav-btn-${fishId}`);
    if (!button) return;
    
    // Check if user is logged in - 使用缓存快速检测
    const isLoggedIn = window.authCache && window.authCache.isLoggedIn();
    if (!isLoggedIn) {
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