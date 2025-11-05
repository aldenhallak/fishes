// =====================================================
// Private Fish Tank with Swimming Animation
// =====================================================
// Shows only user's own fish and favorited fish swimming

(function() {
  'use strict';

  // Canvas setup
  const swimCanvas = document.getElementById('swim-canvas');
  const swimCtx = swimCanvas.getContext('2d');
  const fishes = [];
  let userBalance = 0;

  // Food system
  const foodPellets = [];
  const FOOD_SIZE = 8;
  const FOOD_FALL_SPEED = .01;
  const FOOD_DETECTION_RADIUS = 200;
  const FOOD_LIFESPAN = 15000;
  const FOOD_ATTRACTION_FORCE = 0.003;

  // Initialize
  document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    if (!await requireAuthentication()) {
      return; // Will redirect to login
    }

    // Setup canvas
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Setup food dropping
    setupFoodControls();

    // Load data
    await loadUserBalance();
    await loadPrivateFish();

    // Start animation loop
    animateSwimming();
  });

  /**
   * Resize canvas to full screen
   */
  function resizeCanvas() {
    const controlsHeight = document.querySelector('.cute-controls-container')?.offsetHeight || 100;
    swimCanvas.width = window.innerWidth;
    swimCanvas.height = window.innerHeight - controlsHeight;
  }

  /**
   * Load user's fish food balance
   */
  async function loadUserBalance() {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch(`${BACKEND_URL || ''}/api/economy/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        userBalance = data.fishFood || 0;
        updateBalanceDisplay();
      }
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  }

  /**
   * Update balance display
   */
  function updateBalanceDisplay() {
    const amountEl = document.getElementById('fish-food-amount');
    if (amountEl) {
      amountEl.textContent = userBalance;
    }
  }

  /**
   * Load private fish (own + favorited)
   */
  async function loadPrivateFish() {
    const loadingEl = document.getElementById('loading-indicator');
    const countDisplay = document.getElementById('fish-count-display');

    try {
      if (loadingEl) loadingEl.style.display = 'flex';
      if (countDisplay) countDisplay.textContent = 'Loading your fish...';

      // Get token from localStorage
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('Not logged in - no token found');
      }

      console.log('🐠 Loading fish with token...');

      // Use backend API to avoid CORS issues
      const BACKEND_URL = window.location.origin;
      const response = await fetch(`${BACKEND_URL}/api/fishtank/my-fish`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load fish');
      }

      const myFish = result.fish || [];
      console.log(`✅ Loaded ${myFish.length} fish from API`);
      console.log('Fish data:', myFish);

      // Update stats
      updateStats(result.stats);

      // Clear existing fish
      fishes.length = 0;

      // Create fish objects
      for (const fishData of myFish) {
        const fishObj = await createFishObject(fishData);
        if (fishObj) {
          fishes.push(fishObj);
        }
      }

      console.log(`🐟 Created ${fishes.length} fish objects for animation`);

      // Update count display
      if (countDisplay) {
        const ownCount = myFish.filter(f => f.isOwn).length;
        const favCount = myFish.filter(f => f.isFavorited).length;
        countDisplay.textContent = `${fishes.length} fish (${ownCount} own, ${favCount} favorited)`;
      }

      if (loadingEl) loadingEl.style.display = 'none';

      // Show message if no fish
      if (fishes.length === 0) {
        if (countDisplay) {
          countDisplay.innerHTML = 'No fish yet! <a href="index.html" style="color: #6366F1; text-decoration: underline;">Draw your first fish</a>';
        }
      }

    } catch (error) {
      console.error('❌ Error loading private fish:', error);
      if (loadingEl) loadingEl.style.display = 'none';
      if (countDisplay) {
        countDisplay.textContent = 'Error: ' + error.message;
      }
    }
  }

  /**
   * Create a fish object for animation
   */
  async function createFishObject(fishData) {
    try {
      // Create fish canvas
      const fishCanvas = document.createElement('canvas');
      fishCanvas.width = 100;
      fishCanvas.height = 100;
      const fishCtx = fishCanvas.getContext('2d');

      // Load fish image
      if (fishData.image_url) {
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = function() {
            const scale = Math.min(100 / img.width, 100 / img.height);
            const x = (100 - img.width * scale) / 2;
            const y = (100 - img.height * scale) / 2;
            fishCtx.drawImage(img, x, y, img.width * scale, img.height * scale);
            resolve();
          };
          img.onerror = reject;
          img.src = fishData.image_url;
        });
      }

      // Create fish object
      const fish = {
        id: fishData.id,
        canvas: fishCanvas,
        x: Math.random() * swimCanvas.width,
        y: Math.random() * swimCanvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 50 + Math.random() * 30,
        angle: 0,
        targetAngle: 0,
        isOwn: fishData.isOwn,
        isFavorited: fishData.isFavorited,
        level: fishData.level || 1,
        artist: fishData.artist || 'Anonymous',
        health: fishData.health || 100,
        is_alive: fishData.is_alive !== false,
        // Food attraction
        targetFood: null,
        isEating: false,
        lastFedTime: 0
      };

      // Dead fish swim slower and sink slightly
      if (!fish.is_alive) {
        fish.vx *= 0.3;
        fish.vy = Math.abs(fish.vy) * 0.2; // Sink slowly
      }

      return fish;
    } catch (error) {
      console.error('Error creating fish object:', error);
      return null;
    }
  }

  /**
   * Update stats display
   */
  function updateStats(stats) {
    const ownEl = document.getElementById('own-fish-count');
    const favEl = document.getElementById('favorited-fish-count');
    const avgEl = document.getElementById('avg-fish-level');

    if (ownEl) ownEl.textContent = stats.ownFish || 0;
    if (favEl) favEl.textContent = stats.favoritedFish || 0;
    if (avgEl) avgEl.textContent = stats.avgLevel || 0;
  }

  /**
   * Animation loop
   */
  function animateSwimming() {
    // Clear canvas
    swimCtx.clearRect(0, 0, swimCanvas.width, swimCanvas.height);

    // Update and draw food
    updateFood();
    drawFood();

    // Update and draw fish
    fishes.forEach(fish => {
      updateFishPosition(fish);
      drawFish(fish);
    });

    requestAnimationFrame(animateSwimming);
  }

  /**
   * Update fish position
   */
  function updateFishPosition(fish) {
    // Check for nearby food if not already eating
    if (!fish.isEating && foodPellets.length > 0) {
      let closestFood = null;
      let closestDist = FOOD_DETECTION_RADIUS;

      foodPellets.forEach(food => {
        if (!food.consumed) {
          const dist = Math.hypot(food.x - fish.x, food.y - fish.y);
          if (dist < closestDist) {
            closestDist = dist;
            closestFood = food;
          }
        }
      });

      if (closestFood) {
        fish.targetFood = closestFood;
        // Swim toward food
        const dx = closestFood.x - fish.x;
        const dy = closestFood.y - fish.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 0) {
          fish.vx += (dx / dist) * FOOD_ATTRACTION_FORCE;
          fish.vy += (dy / dist) * FOOD_ATTRACTION_FORCE;
        }

        // Eat food if close enough
        if (dist < fish.size / 2) {
          closestFood.consumed = true;
          fish.isEating = true;
          fish.lastFedTime = Date.now();
          setTimeout(() => {
            fish.isEating = false;
            fish.targetFood = null;
          }, 2000);
        }
      }
    }

    // Update position
    fish.x += fish.vx;
    fish.y += fish.vy;

    // Bounce off walls
    if (fish.x < 0 || fish.x > swimCanvas.width) {
      fish.vx *= -1;
      fish.x = Math.max(0, Math.min(swimCanvas.width, fish.x));
    }
    if (fish.y < 0 || fish.y > swimCanvas.height) {
      fish.vy *= -1;
      fish.y = Math.max(0, Math.min(swimCanvas.height, fish.y));
    }

    // Slow down if not chasing food
    if (!fish.targetFood) {
      fish.vx *= 0.99;
      fish.vy *= 0.99;

      // Add random movement
      fish.vx += (Math.random() - 0.5) * 0.1;
      fish.vy += (Math.random() - 0.5) * 0.1;

      // Limit speed
      const speed = Math.hypot(fish.vx, fish.vy);
      const maxSpeed = fish.is_alive ? 2 : 0.5;
      if (speed > maxSpeed) {
        fish.vx = (fish.vx / speed) * maxSpeed;
        fish.vy = (fish.vy / speed) * maxSpeed;
      }
    }

    // Update angle for direction
    fish.targetAngle = Math.atan2(fish.vy, fish.vx);
    fish.angle += (fish.targetAngle - fish.angle) * 0.1;
  }

  /**
   * Draw fish
   */
  function drawFish(fish) {
    swimCtx.save();
    
    // Move to fish position
    swimCtx.translate(fish.x, fish.y);
    swimCtx.rotate(fish.angle);

    // Draw fish canvas
    const drawSize = fish.size;
    swimCtx.drawImage(
      fish.canvas,
      -drawSize / 2,
      -drawSize / 2,
      drawSize,
      drawSize
    );

    // Draw badge for own/favorited
    swimCtx.restore();
    swimCtx.save();
    swimCtx.translate(fish.x, fish.y - fish.size / 2 - 15);

    if (fish.isOwn) {
      // Own fish badge
      swimCtx.fillStyle = 'rgba(99, 102, 241, 0.9)';
      swimCtx.beginPath();
      swimCtx.arc(0, 0, 12, 0, Math.PI * 2);
      swimCtx.fill();
      swimCtx.fillStyle = 'white';
      swimCtx.font = 'bold 10px Arial';
      swimCtx.textAlign = 'center';
      swimCtx.textBaseline = 'middle';
      swimCtx.fillText('ME', 0, 0);
    } else if (fish.isFavorited) {
      // Favorited badge
      swimCtx.font = '16px Arial';
      swimCtx.textAlign = 'center';
      swimCtx.textBaseline = 'middle';
      swimCtx.fillText('❤️', 0, 0);
    }

    // Dead indicator
    if (!fish.is_alive) {
      swimCtx.translate(20, 0);
      swimCtx.font = '14px Arial';
      swimCtx.fillText('💀', 0, 0);
    }

    swimCtx.restore();
  }

  /**
   * Update food pellets
   */
  function updateFood() {
    const now = Date.now();
    
    // Remove old or consumed food
    for (let i = foodPellets.length - 1; i >= 0; i--) {
      const food = foodPellets[i];
      
      if (food.consumed || (now - food.createdAt) > FOOD_LIFESPAN) {
        foodPellets.splice(i, 1);
        continue;
      }

      // Food falls
      food.vy += FOOD_FALL_SPEED;
      food.y += food.vy;

      // Stop at bottom
      if (food.y >= swimCanvas.height - FOOD_SIZE) {
        food.y = swimCanvas.height - FOOD_SIZE;
        food.vy = 0;
      }
    }
  }

  /**
   * Draw food pellets
   */
  function drawFood() {
    foodPellets.forEach(food => {
      if (!food.consumed) {
        swimCtx.fillStyle = '#8B4513';
        swimCtx.beginPath();
        swimCtx.arc(food.x, food.y, food.size, 0, Math.PI * 2);
        swimCtx.fill();
        
        // Highlight
        swimCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        swimCtx.beginPath();
        swimCtx.arc(food.x - 2, food.y - 2, food.size / 3, 0, Math.PI * 2);
        swimCtx.fill();
      }
    });
  }

  /**
   * Create food pellet
   */
  function createFoodPellet(x, y) {
    foodPellets.push({
      x: x,
      y: y,
      vy: 0,
      createdAt: Date.now(),
      consumed: false,
      size: FOOD_SIZE
    });
  }

  /**
   * Setup food dropping controls
   */
  function setupFoodControls() {
    // Desktop: Shift+Click or Right-click
    swimCanvas.addEventListener('click', (e) => {
      if (e.shiftKey) {
        const rect = swimCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        createFoodPellet(x, y);
      }
    });

    swimCanvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const rect = swimCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      createFoodPellet(x, y);
    });

    // Mobile: Double-tap or Long-press
    let touchStartTime = 0;
    let lastTap = 0;

    swimCanvas.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
    });

    swimCanvas.addEventListener('touchend', (e) => {
      const touchDuration = Date.now() - touchStartTime;
      const now = Date.now();
      
      // Long press (> 500ms)
      if (touchDuration > 500) {
        const touch = e.changedTouches[0];
        const rect = swimCanvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        createFoodPellet(x, y);
        return;
      }

      // Double tap (< 300ms between taps)
      if (now - lastTap < 300) {
        const touch = e.changedTouches[0];
        const rect = swimCanvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        createFoodPellet(x, y);
      }
      
      lastTap = now;
    });
  }

})();

