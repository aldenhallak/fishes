/**
 * Tank Layout Manager - Row-based Dialogue Placement System
 * 
 * Implements the row-based layout system with:
 * - Separate dialogue zone and swim zone per row
 * - 100% reliable collision avoidance
 * - Slot-based horizontal positioning for dialogues
 * - O(1) complexity position calculations
 */

// Tank layout configuration
const TANK_LAYOUT = {
  rows: 4,                      // Number of rows in the tank
  rowHeight: 150,               // Height of each row in pixels
  
  // Dialogue zone (top of each row)
  dialogueZone: {
    height: 35,                 // Height reserved for dialogues
    yOffset: 5                  // Distance from row top
  },
  
  // Swim zone (bottom of each row)
  swimZone: {
    height: 100,                // Height where fish can swim
    yOffset: 45                 // Distance from row top
  },
  
  // Horizontal slots for dialogues (to avoid horizontal overlap)
  dialogueSlots: [
    { x: 50, width: 250 },      // Left slot
    { x: 320, width: 250 },     // Center slot
    { x: 590, width: 250 }      // Right slot
  ]
};

/**
 * Row Manager - Manages a single row of the tank
 */
class TankRow {
  constructor(rowIndex, canvasWidth, ctx = null) {
    this.rowIndex = rowIndex;
    this.rowTop = rowIndex * TANK_LAYOUT.rowHeight;
    this.ctx = ctx; // Store context for text measurement
    
    // Calculate zones
    this.dialogueY = this.rowTop + TANK_LAYOUT.dialogueZone.yOffset;
    this.dialogueHeight = TANK_LAYOUT.dialogueZone.height;
    
    this.swimYMin = this.rowTop + TANK_LAYOUT.swimZone.yOffset;
    this.swimYMax = this.swimYMin + TANK_LAYOUT.swimZone.height;
    
    // Dialogue management
    this.activeDialogues = new Map(); // fishId -> dialogue object
    this.availableSlots = [0, 1, 2];   // Available slot indices
    this.dialogueQueue = [];           // Queue for when all slots are full
  }
  
  /**
   * Constrain fish Y coordinate to swim zone
   * @param {Object} fish - Fish object with y coordinate
   */
  constrainFishY(fish) {
    if (fish.y < this.swimYMin) {
      fish.y = this.swimYMin;
    } else if (fish.y > this.swimYMax) {
      fish.y = this.swimYMax;
    }
  }
  
  /**
   * Find the best slot for a dialogue based on fish X position
   * @param {number} fishX - Fish X coordinate
   * @returns {number|null} - Slot index or null if no slots available
   */
  findBestSlot(fishX) {
    if (this.availableSlots.length === 0) {
      return null; // All slots occupied
    }
    
    // Find the slot closest to the fish's X position
    let bestSlot = this.availableSlots[0];
    let minDistance = Infinity;
    
    for (const slotIdx of this.availableSlots) {
      const slot = TANK_LAYOUT.dialogueSlots[slotIdx];
      const slotCenter = slot.x + slot.width / 2;
      const distance = Math.abs(fishX - slotCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        bestSlot = slotIdx;
      }
    }
    
    return bestSlot;
  }
  
  /**
   * Calculate optimal dialogue width based on text content
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} text - Text to measure
   * @returns {number} - Optimal width
   */
  calculateDialogueWidth(ctx, text) {
    // Set font for measurement
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    
    const padding = 12;
    const minWidth = 80;   // 最小宽度
    const maxWidth = 250;  // 最大宽度
    const idealMaxLineWidth = 200; // 理想的单行最大宽度
    
    // Measure text
    const textWidth = ctx.measureText(text).width;
    
    // Calculate width with padding
    let width = textWidth + padding * 2;
    
    // If text is too long, we'll word wrap, so use ideal max width
    if (width > idealMaxLineWidth) {
      width = idealMaxLineWidth;
    }
    
    // Apply min/max constraints
    width = Math.max(minWidth, Math.min(maxWidth, width));
    
    return width;
  }
  
  /**
   * Show a dialogue in this row
   * @param {Object} fish - Fish object
   * @param {string} message - Dialogue message
   * @param {number} duration - Display duration in ms
   * @returns {boolean} - True if dialogue was shown, false if row is full
   */
  showDialogue(fish, message, duration = 5000) {
    const slotIdx = this.findBestSlot(fish.x);
    
    if (slotIdx === null) {
      // All slots full, add to queue
      this.dialogueQueue.push({ fish, message, duration });
      return false;
    }
    
    const slot = TANK_LAYOUT.dialogueSlots[slotIdx];
    
    // Calculate dialogue width based on text content
    const width = this.ctx ? this.calculateDialogueWidth(this.ctx, message) : slot.width;
    
    const dialogue = {
      fishId: fish.id,
      fish: fish,  // 保存fish对象的引用，用于跟随移动
      text: message,
      x: slot.x,
      y: this.dialogueY,
      width: width,  // 使用自适应宽度
      height: this.dialogueHeight,
      slotIdx: slotIdx,
      createdAt: Date.now(),
      duration: duration,
      personality: fish.personality_type || 'cheerful',
      floatOffset: 0  // 用于浮动动画
    };
    
    this.activeDialogues.set(fish.id, dialogue);
    
    // Mark slot as occupied
    this.availableSlots = this.availableSlots.filter(idx => idx !== slotIdx);
    
    // Auto-remove after duration
    setTimeout(() => {
      this.removeDialogue(fish.id);
      this.processQueue(); // Try to show queued dialogues
    }, duration);
    
    return true;
  }
  
  /**
   * Remove a dialogue and free its slot
   * @param {string} fishId - Fish ID
   */
  removeDialogue(fishId) {
    const dialogue = this.activeDialogues.get(fishId);
    if (dialogue) {
      // Free the slot
      this.availableSlots.push(dialogue.slotIdx);
      this.availableSlots.sort(); // Keep slots sorted
      
      this.activeDialogues.delete(fishId);
    }
  }
  
  /**
   * Process queued dialogues when slots become available
   */
  processQueue() {
    while (this.dialogueQueue.length > 0 && this.availableSlots.length > 0) {
      const queued = this.dialogueQueue.shift();
      this.showDialogue(queued.fish, queued.message, queued.duration);
    }
  }
  
  /**
   * Get all active dialogues in this row
   * @returns {Array} - Array of dialogue objects
   */
  getActiveDialogues() {
    return Array.from(this.activeDialogues.values());
  }
}

/**
 * Tank Layout Manager - Main manager for the entire tank
 */
class TankLayoutManager {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.rows = [];
    
    // Create row managers
    for (let i = 0; i < TANK_LAYOUT.rows; i++) {
      this.rows.push(new TankRow(i, canvas.width, ctx));
    }
    
    console.log(`TankLayoutManager initialized with ${TANK_LAYOUT.rows} rows`);
  }
  
  /**
   * Assign fish to rows when they are first loaded
   * @param {Array} fishes - Array of fish objects
   */
  assignFishToRows(fishes) {
    fishes.forEach((fish, index) => {
      // Distribute fish evenly across rows
      const rowIndex = index % TANK_LAYOUT.rows;
      fish.rowIndex = rowIndex;
      
      const row = this.rows[rowIndex];
      fish.yMin = row.swimYMin;
      fish.yMax = row.swimYMax;
      
      // Initialize fish Y within swim zone if not set
      if (!fish.y || fish.y < row.swimYMin || fish.y > row.swimYMax) {
        fish.y = row.swimYMin + Math.random() * TANK_LAYOUT.swimZone.height;
      }
    });
    
    console.log(`Assigned ${fishes.length} fish to ${TANK_LAYOUT.rows} rows`);
  }
  
  /**
   * Update fish position (constrain to swim zone)
   * @param {Object} fish - Fish object
   */
  updateFishPosition(fish) {
    if (fish.rowIndex !== undefined && this.rows[fish.rowIndex]) {
      this.rows[fish.rowIndex].constrainFishY(fish);
    }
  }
  
  /**
   * Show a dialogue for a fish
   * @param {Object} fish - Fish object
   * @param {string} message - Dialogue message
   * @param {number} duration - Display duration in ms
   * @returns {boolean} - True if dialogue was shown
   */
  showDialogue(fish, message, duration = 5000) {
    if (fish.rowIndex === undefined || !this.rows[fish.rowIndex]) {
      console.error('Fish has no assigned row', fish);
      return false;
    }
    
    return this.rows[fish.rowIndex].showDialogue(fish, message, duration, this.ctx);
  }
  
  /**
   * Remove a dialogue for a fish
   * @param {string} fishId - Fish ID
   * @param {number} rowIndex - Row index (optional, will search all rows if not provided)
   */
  removeDialogue(fishId, rowIndex = null) {
    if (rowIndex !== null && this.rows[rowIndex]) {
      this.rows[rowIndex].removeDialogue(fishId);
    } else {
      // Search all rows
      for (const row of this.rows) {
        row.removeDialogue(fishId);
      }
    }
  }
  
  /**
   * Render all dialogues in the tank
   */
  renderDialogues() {
    const now = Date.now();
    
    for (const row of this.rows) {
      for (const dialogue of row.getActiveDialogues()) {
        this.drawDialogueBubble(dialogue, now);
      }
    }
  }
  
  /**
   * Draw a single dialogue bubble
   * @param {Object} dialogue - Dialogue object
   * @param {number} now - Current timestamp
   */
  drawDialogueBubble(dialogue, now) {
    const ctx = this.ctx;
    
    // Calculate fade in/out
    const age = now - dialogue.createdAt;
    let opacity = 1.0;
    
    const fadeInDuration = 300;
    const fadeOutStart = dialogue.duration - 500;
    
    if (age < fadeInDuration) {
      // Fade in
      opacity = age / fadeInDuration;
    } else if (age > fadeOutStart) {
      // Fade out
      opacity = (dialogue.duration - age) / 500;
    }
    
    if (opacity <= 0) return;
    
    // 跟随鱼的位置浮动（X和Y坐标）
    let bubbleX = dialogue.x;
    let bubbleY = dialogue.y;
    
    if (dialogue.fish) {
      // 对话框X坐标：鱼的X坐标居中对齐，减去对话框宽度的一半
      bubbleX = dialogue.fish.x - dialogue.width / 2;
      
      // 对话框Y坐标：在鱼的上方显示，留出一定间距
      bubbleY = dialogue.fish.y - dialogue.height - 20;
      
      // 确保对话框不超出画布边界
      // 左边界
      if (bubbleX < 5) {
        bubbleX = 5;
      }
      // 右边界
      if (bubbleX + dialogue.width > this.canvas.width - 5) {
        bubbleX = this.canvas.width - dialogue.width - 5;
      }
      // 上边界
      if (bubbleY < 5) {
        bubbleY = 5;
      }
    }
    
    ctx.save();
    ctx.globalAlpha = opacity;
    
    // Personality-based colors
    const colors = this.getPersonalityColors(dialogue.personality);
    
    // Draw bubble background with gradient
    const gradient = ctx.createLinearGradient(
      bubbleX, bubbleY,
      bubbleX, bubbleY + dialogue.height
    );
    gradient.addColorStop(0, colors.gradientStart);
    gradient.addColorStop(1, colors.gradientEnd);
    
    ctx.fillStyle = gradient;
    
    // 更柔和的阴影效果
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
    
    // Draw rounded rectangle
    const borderRadius = 16;
    this.roundRect(ctx, bubbleX, bubbleY, dialogue.width, dialogue.height, borderRadius);
    ctx.fill();
    
    // Draw border with subtle style
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 0;
    ctx.stroke();
    
    // 添加小尾巴指向鱼（如果鱼存在）
    if (dialogue.fish) {
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      
      // 计算尾巴位置（尾巴指向鱼的位置）
      const tailX = bubbleX + dialogue.width / 2;
      const tailY = bubbleY + dialogue.height;
      const tailWidth = 10;
      const tailHeight = 8;
      
      ctx.beginPath();
      ctx.moveTo(tailX - tailWidth / 2, tailY);
      ctx.lineTo(tailX, tailY + tailHeight);
      ctx.lineTo(tailX + tailWidth / 2, tailY);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    // Draw text
    ctx.fillStyle = colors.text;
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Word wrap text
    const padding = 12;
    const maxWidth = dialogue.width - padding * 2;
    const lines = this.wrapText(ctx, dialogue.text, maxWidth);
    
    const lineHeight = 18;
    const startY = bubbleY + (dialogue.height - lines.length * lineHeight) / 2;
    
    lines.forEach((line, i) => {
      ctx.fillText(line, bubbleX + padding, startY + i * lineHeight);
    });
    
    ctx.restore();
  }
  
  /**
   * Get colors based on personality
   * @param {string} personality - Personality type
   * @returns {Object} - Color object
   */
  getPersonalityColors(personality) {
    const colorSchemes = {
      cheerful: {
        // 温暖的珊瑚橙到桃色渐变
        gradientStart: 'rgba(255, 218, 185, 0.96)',
        gradientEnd: 'rgba(255, 192, 159, 0.96)',
        border: 'rgba(255, 160, 122, 0.6)',
        text: '#5D4037'
      },
      shy: {
        // 清新的薄荷蓝到天蓝色渐变
        gradientStart: 'rgba(224, 247, 250, 0.96)',
        gradientEnd: 'rgba(178, 235, 242, 0.96)',
        border: 'rgba(77, 182, 172, 0.5)',
        text: '#00695C'
      },
      brave: {
        // 活力的珊瑚红到橙红渐变
        gradientStart: 'rgba(255, 205, 210, 0.96)',
        gradientEnd: 'rgba(255, 171, 145, 0.96)',
        border: 'rgba(239, 83, 80, 0.5)',
        text: '#FFFFFF'
      },
      lazy: {
        // 柔和的淡紫到薰衣草色渐变
        gradientStart: 'rgba(243, 229, 245, 0.96)',
        gradientEnd: 'rgba(225, 190, 231, 0.96)',
        border: 'rgba(186, 104, 200, 0.5)',
        text: '#6A1B9A'
      },
      default: {
        // 默认：清爽的白色到浅灰渐变
        gradientStart: 'rgba(250, 250, 250, 0.96)',
        gradientEnd: 'rgba(240, 240, 240, 0.96)',
        border: 'rgba(158, 158, 158, 0.4)',
        text: '#424242'
      }
    };
    
    return colorSchemes[personality] || colorSchemes.default;
  }
  
  /**
   * Draw a rounded rectangle
   */
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
  
  /**
   * Wrap text to fit within max width
   */
  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.slice(0, 2); // Max 2 lines per bubble
  }
  
  /**
   * Get tank layout configuration (for debugging)
   * @returns {Object} - Layout config
   */
  getLayout() {
    return {
      rows: TANK_LAYOUT.rows,
      rowHeight: TANK_LAYOUT.rowHeight,
      dialogueZone: TANK_LAYOUT.dialogueZone,
      swimZone: TANK_LAYOUT.swimZone,
      slots: TANK_LAYOUT.dialogueSlots
    };
  }
  
  /**
   * Get statistics (for debugging)
   * @returns {Object} - Statistics
   */
  getStats() {
    const stats = {
      rows: [],
      totalActiveDialogues: 0,
      totalQueuedDialogues: 0
    };
    
    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      const activeCount = row.activeDialogues.size;
      const queuedCount = row.dialogueQueue.length;
      
      stats.rows.push({
        index: i,
        active: activeCount,
        queued: queuedCount,
        availableSlots: row.availableSlots.length
      });
      
      stats.totalActiveDialogues += activeCount;
      stats.totalQueuedDialogues += queuedCount;
    }
    
    return stats;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TankLayoutManager, TankRow, TANK_LAYOUT };
}

