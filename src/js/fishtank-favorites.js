// =====================================================
// Fish Tank Favorites Module
// =====================================================
// Handles favorite fish functionality for private tanks

(function(window) {
  'use strict';

  // API endpoint configuration
  const API_BASE = typeof BACKEND_URL !== 'undefined' ? BACKEND_URL : '';
  
  // Cache for favorite status to reduce API calls
  const favoritesCache = new Set();
  let cacheInitialized = false;

  /**
   * Initialize the favorites cache
   */
  async function initializeCache() {
    if (cacheInitialized) return;
    
    try {
      const favorites = await getFavorites();
      favoritesCache.clear();
      favorites.forEach(fav => {
        favoritesCache.add(fav.fish_id || fav.id);
      });
      cacheInitialized = true;
    } catch (error) {
      console.error('Failed to initialize favorites cache:', error);
    }
  }

  /**
   * Add a fish to favorites
   * @param {string} fishId - The ID of the fish to favorite
   * @returns {Promise<Object>} Response data
   */
  async function addToFavorites(fishId) {
    try {
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/api/fish-api?action=favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fishId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add favorite');
      }

      // Update cache
      favoritesCache.add(fishId);

      return data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  /**
   * Remove a fish from favorites
   * @param {string} fishId - The ID of the fish to unfavorite
   * @returns {Promise<Object>} Response data
   */
  async function removeFromFavorites(fishId) {
    try {
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/api/fish-api?action=unfavorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fishId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove favorite');
      }

      // Update cache
      favoritesCache.delete(fishId);

      return data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status of a fish
   * @param {string} fishId - The ID of the fish
   * @returns {Promise<Object>} Response data with isFavorited status
   */
  async function toggleFavorite(fishId) {
    const isFavorited = await isFavorite(fishId);
    
    if (isFavorited) {
      await removeFromFavorites(fishId);
      return { success: true, isFavorited: false };
    } else {
      await addToFavorites(fishId);
      return { success: true, isFavorited: true };
    }
  }

  /**
   * Check if a fish is favorited
   * @param {string} fishId - The ID of the fish
   * @returns {Promise<boolean>} True if favorited
   */
  async function isFavorite(fishId) {
    // Initialize cache if not done
    if (!cacheInitialized) {
      await initializeCache();
    }
    
    return favoritesCache.has(fishId);
  }

  /**
   * Get all favorites for the current user
   * @returns {Promise<Array>} Array of favorite fish
   */
  async function getFavorites() {
    try {
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/api/fish-api?action=my-tank`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get favorites');
      }

      // Filter only favorited fish
      const favoritedFish = data.fish.filter(f => f.is_favorited);
      
      return favoritedFish;
    } catch (error) {
      console.error('Error getting favorites:', error);
      throw error;
    }
  }

  /**
   * Get available backgrounds
   * @returns {Promise<Array>} Array of background options
   */
  async function getBackgrounds() {
    try {
      const response = await fetch(`${API_BASE}/api/fishtank/backgrounds`, {
        method: 'GET'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get backgrounds');
      }

      return data.backgrounds;
    } catch (error) {
      console.error('Error getting backgrounds:', error);
      throw error;
    }
  }

  /**
   * Change tank background
   * @param {number} backgroundId - The ID of the background to set
   * @returns {Promise<Object>} Response data
   */
  async function changeBackground(backgroundId) {
    try {
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/api/fishtank/change-background`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ backgroundId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change background');
      }

      return data;
    } catch (error) {
      console.error('Error changing background:', error);
      throw error;
    }
  }

  /**
   * Get or create user's default private tank
   * @returns {Promise<Object>} Tank data
   */
  async function getDefaultTank() {
    try {
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/api/fishtank/get-or-create-default`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get default tank');
      }

      return data.fishtank;
    } catch (error) {
      console.error('Error getting default tank:', error);
      throw error;
    }
  }

  /**
   * Get all fish in user's private tank (owned + favorited)
   * @returns {Promise<Object>} Fish data with stats
   */
  async function getMyFish() {
    try {
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/api/fish-api?action=my-tank`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get fish');
      }

      return data;
    } catch (error) {
      console.error('Error getting my fish:', error);
      throw error;
    }
  }

  /**
   * Clear the favorites cache
   */
  function clearCache() {
    favoritesCache.clear();
    cacheInitialized = false;
  }

  /**
   * Create a favorite button element
   * @param {string} fishId - The ID of the fish
   * @param {boolean} isFavorited - Initial favorite status
   * @param {Function} callback - Callback after toggle (optional)
   * @returns {HTMLElement} Button element
   */
  function createFavoriteButton(fishId, isFavorited = false, callback = null) {
    const button = document.createElement('button');
    button.className = 'favorite-btn' + (isFavorited ? ' favorited' : '');
    button.setAttribute('data-fish-id', fishId);
    button.innerHTML = isFavorited ? '<span class="star-icon filled">⭐</span>' : '<span class="star-icon">☆</span>';
    button.title = isFavorited ? 'Remove from favorites' : 'Add to favorites';
    
    button.onclick = async (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      try {
        button.disabled = true;
        const result = await toggleFavorite(fishId);
        
        // Update button appearance
        button.classList.toggle('favorited', result.isFavorited);
        button.innerHTML = result.isFavorited ? '<span class="star-icon filled">⭐</span>' : '<span class="star-icon">☆</span>';
        button.title = result.isFavorited ? 'Remove from favorites' : 'Add to favorites';
        
        // Call callback if provided
        if (callback) {
          callback(result.isFavorited);
        }
        
        // Show feedback
        showToast(result.isFavorited ? 'Added to favorites!' : 'Removed from favorites');
        
      } catch (error) {
        console.error('Error toggling favorite:', error);
        showToast(error.message || 'Failed to update favorite', 'error');
      } finally {
        button.disabled = false;
      }
    };
    
    return button;
  }

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of toast (success, error, info)
   */
  function showToast(message, type = 'success') {
    let toast = document.getElementById('favorite-toast');
    
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'favorite-toast';
      toast.className = 'favorite-toast';
      document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = `favorite-toast ${type} show`;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Export to window
  window.FishTankFavorites = {
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavorites,
    getBackgrounds,
    changeBackground,
    getDefaultTank,
    getMyFish,
    clearCache,
    createFavoriteButton,
    showToast,
    initializeCache
  };

})(window);


















