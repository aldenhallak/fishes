/**
 * Community Chat Manager
 * 
 * Manages the playback of community chat sessions:
 * - Fetches dialogue from backend
 * - Queues messages for sequential display
 * - Triggers display at appropriate intervals
 * - Handles both group chat and self-talk modes
 */

class CommunityChatManager {
  constructor(tankLayoutManager, fishes) {
    this.layoutManager = tankLayoutManager;
    this.fishes = fishes;
    
    // Playback state
    this.isPlaying = false;
    this.currentSession = null;
    this.messageQueue = [];
    this.playbackIndex = 0;
    
    // Timing configuration
    this.timeBetweenMessages = 6000; // 6 seconds between messages
    this.playbackTimer = null;
    
    // Auto-chat scheduling
    this.autoChatInterval = null;
    this.monologueInterval = null;
    
    // Group chat enabled state (can be overridden by user)
    this.groupChatEnabled = false;
    
    // Monologue (self-talk) enabled state (can be overridden by user)
    this.monologueEnabled = false;
    
    // Group chat interval time in minutes (will be updated from API)
    this.groupChatIntervalMinutes = 5; // Default 5 minutes
    
    // Statistics
    this.stats = {
      sessionsPlayed: 0,
      messagesDisplayed: 0,
      lastPlaybackTime: null
    };
    
    // Page visibility and user activity tracking
    this.isPageVisible = true;
    this.lastActivityTime = Date.now();
    this.startTime = Date.now();
    this.isPaused = false;
    this.checkInterval = null;
    
    // Configuration for cost control (will be updated from API)
    this.maxInactiveTime = 15 * 60 * 1000; // 15 minutes in milliseconds (default)
    this.maxRunTime = 60 * 60 * 1000; // 60 minutes in milliseconds (default)
    this.checkIntervalMs = 60 * 1000; // 60 seconds
    
    // Cost saving feature enabled state (controlled by CHAT_COST_SAVING env var)
    this.costSavingEnabled = true; // Default to enabled for safety
    
    console.log('CommunityChatManager initialized');
  }
  
  /**
   * Select random fish participants from the tank
   * @param {number} count - Number of fish to select (5-8)
   * @returns {Array} - Array of selected fish
   */
  selectParticipants(count = 6) {
    if (this.fishes.length === 0) {
      console.warn('No fish available for chat');
      return [];
    }
    
    // Ensure count doesn't exceed available fish
    const actualCount = Math.min(count, this.fishes.length);
    
    // Select random fish with names and personalities
    const eligibleFish = this.fishes.filter(f => f.fishName && f.personality);
    
    if (eligibleFish.length === 0) {
      console.warn('No eligible fish with names and personalities');
      return [];
    }
    
    // Shuffle and take first N
    const shuffled = eligibleFish.slice().sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(actualCount, eligibleFish.length));
  }
  
  /**
   * Select a random topic based on current time
   * @returns {string} - Selected topic
   */
  selectTopic() {
    const hour = new Date().getHours();
    let timeOfDay;
    
    if (hour >= 6 && hour < 12) {
      timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 18) {
      timeOfDay = 'afternoon';
    } else if (hour >= 18 && hour < 24) {
      timeOfDay = 'evening';
    } else {
      timeOfDay = 'night';
    }
    
    const topics = {
      morning: ['Morning Greetings', 'Breakfast Time', 'New Day Energy', 'Morning Swimming'],
      afternoon: ['Swimming Fun', 'Afternoon Relaxation', 'Midday Chat', 'Exploring the Tank'],
      evening: ['Sunset Time', 'Evening Stories', 'Day Reflection', 'Dinner Discussion'],
      night: ['Night Owls', 'Stargazing', 'Peaceful Night', 'Moonlight Swimming', 'Bedtime Thoughts']
    };
    
    const topicList = topics[timeOfDay] || topics.afternoon;
    return topicList[Math.floor(Math.random() * topicList.length)];
  }
  
  /**
   * Generate a community chat session
   * @returns {Promise<Object>} - Generated chat session
   */
  async generateChatSession() {
    try {
      // Get current tank fish IDs (only fish that are actually in the tank)
      const currentTankFishIds = this.fishes
        .filter(f => f.id || f.docId)
        .map(f => f.id || f.docId)
        .filter(id => id !== null);
      
      if (currentTankFishIds.length < 2) {
        console.error('Not enough fish in tank for chat (need at least 2)');
        return null;
      }
      
      const participants = this.selectParticipants();
      
      if (participants.length < 2) {
        console.error('Not enough participants for chat');
        return null;
      }
      
      const topic = this.selectTopic();
      
      console.log(`Generating chat session: "${topic}" with ${participants.length} fish`);
      console.log('Participants:', participants.map(p => ({ id: p.id, name: p.fishName })));
      console.log('Current tank fish IDs:', currentTankFishIds.length);
      
      // Call backend API for group chat (using Coze AI)
      // Pass current tank fish IDs to ensure only fish in the tank are selected
      const response = await fetch('/api/fish/chat/group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: `Generate a "${topic}" conversation`,
          tankFishIds: currentTankFishIds // Pass current tank fish IDs
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate chat');
      }
      
      console.log(`✅ Group chat generated: ${data.dialogues?.length || 0} messages`, {
        sessionId: data.sessionId,
        topic: data.topic
      });
      
      // Map dialogues to expected format and verify fish exist
      const dialogues = (data.dialogues || []).map((d, index) => {
        // Try to find the fish in current tank to verify it exists
        const fishInTank = this.fishes.find(f => {
          const fishName1 = (f.fishName || '').trim().toLowerCase();
          const fishName2 = (f.fish_name || '').trim().toLowerCase();
          const searchName = (d.fishName || '').trim().toLowerCase();
          return fishName1 === searchName || fishName2 === searchName ||
                 f.id === d.fishId || f.docId === d.fishId;
        });
        
        if (!fishInTank) {
          console.warn(`⚠️ Dialogue fish not in current tank: ${d.fishName || d.fishId}`, {
            dialogue: d,
            availableFishes: this.fishes.length
          });
        }
        
        return {
          fishId: d.fishId,
          fishName: d.fishName,
          message: d.message,
          sequence: d.sequence || index + 1
        };
      });
      
      return {
        sessionId: data.sessionId,
        topic: data.topic || topic,
        dialogues: dialogues,
        usedFallback: false,
        participants: data.participants || participants
      };
      
    } catch (error) {
      console.error('Failed to generate chat session:', error);
      return this.generateFallbackSession();
    }
  }
  
  /**
   * Generate a fallback chat session if API fails
   * @returns {Object} - Fallback session
   */
  generateFallbackSession() {
    const participants = this.selectParticipants();
    
    if (participants.length === 0) {
      return null;
    }
    
    const fallbackMessages = [
      { fishName: participants[0].fishName, message: "Hello everyone! 🌊" },
      { fishName: participants[1]?.fishName || participants[0].fishName, message: "Nice to see you all!" },
      { fishName: participants[0].fishName, message: "What a lovely day!" }
    ];
    
    return {
      sessionId: null,
      topic: 'General Chat',
      dialogues: fallbackMessages.map((d, i) => ({
        ...d,
        sequence: i + 1,
        fishId: participants.find(p => p.fishName === d.fishName)?.id
      })),
      usedFallback: true,
      participants: participants
    };
  }
  
  /**
   * Start playing a chat session
   * @param {Object} session - Chat session object
   */
  startSession(session) {
    if (!session || !session.dialogues) {
      console.error('Invalid session', session);
      return;
    }
    
    // Stop any current session
    this.stopSession();
    
    this.currentSession = session;
    this.messageQueue = [...session.dialogues].sort((a, b) => a.sequence - b.sequence);
    this.playbackIndex = 0;
    this.isPlaying = true;
    
    console.log(`Starting chat session: "${session.topic}" with ${this.messageQueue.length} messages`);
    
    // Display first message immediately
    this.displayNextMessage();
    
    // Schedule remaining messages
    this.playbackTimer = setInterval(() => {
      this.displayNextMessage();
    }, this.timeBetweenMessages);
    
    this.stats.lastPlaybackTime = new Date();
  }
  
  /**
   * Display the next message in the queue
   */
  displayNextMessage() {
    if (this.playbackIndex >= this.messageQueue.length) {
      console.log('Chat session complete');
      this.stopSession();
      this.stats.sessionsPlayed++;
      return;
    }
    
    const dialogue = this.messageQueue[this.playbackIndex];
    this.playbackIndex++;
    
    // Find the fish by ID (try multiple ID fields) or name
    let fish = null;
    if (dialogue.fishId) {
      // Try multiple ID field names
      fish = this.fishes.find(f => 
        f.id === dialogue.fishId || 
        f.docId === dialogue.fishId ||
        f.fish_id === dialogue.fishId
      );
    }
    
    // Fallback to name matching (case-insensitive, trim whitespace)
    if (!fish && dialogue.fishName) {
      const searchName = dialogue.fishName.trim();
      fish = this.fishes.find(f => {
        const fishName1 = (f.fishName || '').trim();
        const fishName2 = (f.fish_name || '').trim();
        return fishName1.toLowerCase() === searchName.toLowerCase() || 
               fishName2.toLowerCase() === searchName.toLowerCase();
      });
    }
    
    if (!fish) {
      // Enhanced debugging: show available fish names
      const availableNames = this.fishes
        .map(f => f.fishName || f.fish_name || f.id || 'unnamed')
        .filter(name => name !== 'unnamed' && name !== null)
        .slice(0, 10); // Show first 10 for debugging
      
      console.warn(`Fish not found for dialogue: ${dialogue.fishName || dialogue.fishId}`, {
        searchName: dialogue.fishName,
        searchId: dialogue.fishId,
        totalFishes: this.fishes.length,
        availableNames: availableNames,
        dialogue: dialogue
      });
      return;
    }
    
    // Ensure fish has row assigned
    if (fish.rowIndex === undefined && this.layoutManager && this.layoutManager.assignFishToRows) {
      this.layoutManager.assignFishToRows([fish]);
    }
    
    // Check if fish has row assigned
    if (fish.rowIndex === undefined) {
      console.warn(`Fish has no assigned row: ${fish.fishName || fish.id}`);
      return;
    }
    
    console.log(`[${this.playbackIndex}/${this.messageQueue.length}] ${fish.fishName || 'Unknown'}: ${dialogue.message}`);
    
    // Display dialogue through layout manager
    const success = this.layoutManager.showDialogue(fish, dialogue.message, this.timeBetweenMessages - 1000);
    
    if (success) {
      this.stats.messagesDisplayed++;
    }
  }
  
  /**
   * Stop the current session
   */
  stopSession() {
    this.isPlaying = false;
    
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
    
    this.currentSession = null;
    this.messageQueue = [];
    this.playbackIndex = 0;
  }
  
  /**
   * Start an automatic chat session (for testing or scheduled chats)
   * @returns {Promise} - Resolves when session starts
   */
  async startAutoChatSession() {
    // Check if group chat is enabled before starting
    if (!this.groupChatEnabled) {
      console.log('Group chat is disabled, skipping auto chat session');
      return;
    }
    
    // Check if generation should be paused
    if (this.shouldPauseGeneration()) {
      console.log('⏸️ Skipping auto chat session (generation paused)');
      return;
    }
    
    if (this.isPlaying) {
      console.log('Chat session already in progress');
      return;
    }
    
    console.log('Starting automatic chat session...');
    
    const session = await this.generateChatSession();
    
    if (session) {
      this.startSession(session);
    } else {
      console.error('Failed to start chat session');
    }
  }
  
  /**
   * Manually trigger a community chat session (for testing/debugging)
   * @returns {Promise} - Resolves when session starts
   */
  async triggerChat() {
    if (!this.groupChatEnabled) {
      console.log('❌ Group chat is disabled, cannot trigger chat');
      return;
    }
    
    console.log('🎮 Manually triggering community chat...');
    return this.startAutoChatSession();
  }
  
  /**
   * Schedule periodic auto-chats
   * @param {number} intervalMinutes - Interval between chats in minutes
   */
  scheduleAutoChats(intervalMinutes = null) {
    // Clear existing interval if any
    if (this.autoChatInterval) {
      clearInterval(this.autoChatInterval);
      this.autoChatInterval = null;
    }
    
    if (!this.groupChatEnabled) {
      console.log('Group chat is disabled, skipping auto-chat scheduling');
      return;
    }
    
    // Use provided interval or fall back to configured interval
    const actualInterval = intervalMinutes !== null ? intervalMinutes : this.groupChatIntervalMinutes;
    
    console.log(`Scheduling auto-chats every ${actualInterval} minutes`);
    
    // Start first chat after 10 seconds
    setTimeout(() => {
      if (this.groupChatEnabled && !this.isPlaying && !this.shouldPauseGeneration()) {
        this.startAutoChatSession();
      }
    }, 10000);
    
    // Schedule periodic chats
    this.autoChatInterval = setInterval(() => {
      if (this.groupChatEnabled && !this.isPlaying && !this.shouldPauseGeneration()) {
        this.startAutoChatSession();
      }
    }, actualInterval * 60 * 1000);
  }
  
  /**
   * Generate a monologue (self-talk) for a random fish
   * @returns {Promise<Object>} - Generated monologue
   */
  async generateMonologue() {
    try {
      const eligibleFish = this.fishes.filter(f => f.fishName && f.personality);
      
      if (eligibleFish.length === 0) {
        console.warn('No eligible fish for monologue');
        return null;
      }
      
      // Randomly select one fish
      const selectedFish = eligibleFish[Math.floor(Math.random() * eligibleFish.length)];
      
      console.log(`🗣️ Generating monologue for: ${selectedFish.fishName} (${selectedFish.personality})`);
      
      // Call backend API for monologue
      const response = await fetch('/api/fish/chat/monologue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate monologue');
      }
      
      // Use selectedFish from frontend, not data.fish from API (which may not match)
      const fishName = selectedFish.fishName || data.fish?.fishName || 'Unknown';
      console.log(`✅ Monologue generated for ${fishName}: ${data.message?.substring(0, 50)}...`);
      
      return {
        fish: selectedFish, // Use the fish we selected, not API response
        message: data.message,
        logId: data.logId
      };
      
    } catch (error) {
      console.error('Failed to generate monologue:', error);
      return null;
    }
  }
  
  /**
   * Display a monologue for a fish
   */
  async displayMonologue() {
    // Check if monologue is enabled before displaying
    if (!this.monologueEnabled) {
      return;
    }
    
    // Check if generation should be paused
    if (this.shouldPauseGeneration()) {
      console.log('⏸️ Skipping monologue (generation paused)');
      return;
    }
    
    const monologue = await this.generateMonologue();
    
    if (!monologue || !monologue.fish) {
      return;
    }
    
    const fish = monologue.fish;
    
    // Ensure fish has row assigned
    if (fish.rowIndex === undefined && this.layoutManager && this.layoutManager.assignFishToRows) {
      this.layoutManager.assignFishToRows([fish]);
    }
    
    // Check if fish has row assigned
    if (fish.rowIndex === undefined) {
      console.warn(`Fish has no assigned row for monologue: ${fish.fishName || fish.id}`);
      return;
    }
    
    // Display the monologue
    const success = this.layoutManager.showDialogue(
      fish, 
      monologue.message, 
      8000 // 8 seconds display time for monologue
    );
    
    if (success) {
      console.log(`💬 [Monologue] ${fish.fishName || 'Unknown'}: ${monologue.message}`);
    }
  }
  
  /**
   * Schedule periodic monologues (self-talk)
   * @param {number} intervalSeconds - Interval between monologues in seconds
   */
  scheduleMonologues(intervalSeconds = 15) {
    // Clear existing interval if any
    if (this.monologueInterval) {
      clearInterval(this.monologueInterval);
      this.monologueInterval = null;
    }
    
    if (!this.monologueEnabled) {
      console.log('Monologue is disabled, skipping monologue scheduling');
      return;
    }
    
    console.log(`Scheduling monologues every ${intervalSeconds} seconds`);
    
    // Start first monologue after 20 seconds
    setTimeout(() => {
      if (this.monologueEnabled && !this.shouldPauseGeneration()) {
        this.displayMonologue();
      }
    }, 20000);
    
    // Schedule periodic monologues
    this.monologueInterval = setInterval(() => {
      if (this.monologueEnabled && !this.shouldPauseGeneration()) {
        this.displayMonologue();
      }
    }, intervalSeconds * 1000);
  }
  
  /**
   * Enable group chat functionality
   */
  enableGroupChat() {
    if (this.groupChatEnabled) {
      return; // Already enabled
    }
    
    this.groupChatEnabled = true;
    this.resetStartTime(); // Reset timer when enabled
    console.log('✅ Group chat enabled');
    
    // Restart scheduling if manager was initialized
    if (this.layoutManager) {
      this.scheduleAutoChats(this.groupChatIntervalMinutes);
      this.startPeriodicCheck(); // Start periodic check
    }
  }
  
  /**
   * Enable monologue functionality
   */
  enableMonologue() {
    if (this.monologueEnabled) {
      return; // Already enabled
    }
    
    this.monologueEnabled = true;
    this.resetStartTime(); // Reset timer when enabled
    console.log('✅ Monologue enabled');
    
    // Restart scheduling if manager was initialized
    if (this.layoutManager) {
      this.scheduleMonologues(15);
      this.startPeriodicCheck(); // Start periodic check
    }
  }
  
  /**
   * Disable group chat functionality
   */
  disableGroupChat() {
    if (!this.groupChatEnabled) {
      return; // Already disabled
    }
    
    this.groupChatEnabled = false;
    console.log('❌ Group chat disabled');
    
    // Stop current session
    this.stopSession();
    
    // Clear all dialogues from display
    if (this.layoutManager) {
      this.layoutManager.clearAllDialogues();
    }
    
    // Clear intervals
    if (this.autoChatInterval) {
      clearInterval(this.autoChatInterval);
      this.autoChatInterval = null;
    }
    
    // Stop periodic check if both are disabled
    if (!this.monologueEnabled) {
      this.stopPeriodicCheck();
    }
  }
  
  /**
   * Disable monologue functionality
   */
  disableMonologue() {
    if (!this.monologueEnabled) {
      return; // Already disabled
    }
    
    this.monologueEnabled = false;
    console.log('❌ Monologue disabled');
    
    // Clear monologue interval
    if (this.monologueInterval) {
      clearInterval(this.monologueInterval);
      this.monologueInterval = null;
    }
    
    // Stop periodic check if both are disabled
    if (!this.groupChatEnabled) {
      this.stopPeriodicCheck();
    }
  }
  
  /**
   * Set monologue enabled state
   * @param {boolean} enabled - Whether to enable monologue
   */
  setMonologueEnabled(enabled) {
    if (enabled) {
      this.enableMonologue();
    } else {
      this.disableMonologue();
    }
  }
  
  /**
   * Check if monologue is enabled
   * @returns {boolean} - Whether monologue is enabled
   */
  isMonologueEnabled() {
    return this.monologueEnabled;
  }
  
  /**
   * Set group chat enabled state
   * @param {boolean} enabled - Whether to enable group chat
   */
  setGroupChatEnabled(enabled) {
    if (enabled) {
      this.enableGroupChat();
    } else {
      this.disableGroupChat();
    }
  }
  
  /**
   * Check if group chat is enabled
   * @returns {boolean} - Whether group chat is enabled
   */
  isGroupChatEnabled() {
    return this.groupChatEnabled;
  }
  
  /**
   * Check if page is currently visible
   * @returns {boolean} - Whether page is visible
   */
  checkPageVisible() {
    return !document.hidden && this.isPageVisible;
  }
  
  /**
   * Check if user is currently active
   * @returns {boolean} - Whether user is active
   */
  isUserActive() {
    const now = Date.now();
    const inactiveTime = now - this.lastActivityTime;
    return inactiveTime < this.maxInactiveTime;
  }
  
  /**
   * Check if maximum run time has been exceeded
   * @returns {boolean} - Whether max run time exceeded
   */
  hasExceededMaxRunTime() {
    const now = Date.now();
    const runTime = now - this.startTime;
    return runTime > this.maxRunTime;
  }
  
  /**
   * Determine if generation should be paused
   * @returns {boolean} - Whether generation should be paused
   */
  shouldPauseGeneration() {
    // If cost saving is disabled, never pause (allow continuous generation)
    if (!this.costSavingEnabled) {
      return false;
    }
    
    // If both group chat and monologue are disabled, always pause
    if (!this.groupChatEnabled && !this.monologueEnabled) {
      return true;
    }
    
    // Pause if page is not visible
    if (!this.checkPageVisible()) {
      return true;
    }
    
    // Pause if user is inactive
    if (!this.isUserActive()) {
      return true;
    }
    
    // Pause if max run time exceeded
    if (this.hasExceededMaxRunTime()) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Pause generation to prevent cost
   */
  pauseGeneration() {
    // If cost saving is disabled, don't pause
    if (!this.costSavingEnabled) {
      return;
    }
    
    if (this.isPaused) {
      return; // Already paused
    }
    
    this.isPaused = true;
    console.log('⏸️ Pausing chat generation to prevent cost (page hidden, user inactive, or max time exceeded)');
    
    // Clear intervals but keep them in memory for resume
    if (this.autoChatInterval) {
      clearInterval(this.autoChatInterval);
      this.autoChatInterval = null;
    }
    
    if (this.monologueInterval) {
      clearInterval(this.monologueInterval);
      this.monologueInterval = null;
    }
  }
  
  /**
   * Resume generation when conditions are met
   */
  resumeGeneration() {
    if (!this.isPaused) {
      return; // Not paused
    }
    
    // Check if we should actually resume
    if (this.shouldPauseGeneration()) {
      return; // Conditions not met, stay paused
    }
    
    this.isPaused = false;
    console.log('▶️ Resuming chat generation');
    
    // Restart scheduling based on enabled features
    if (this.groupChatEnabled) {
      this.scheduleAutoChats(this.groupChatIntervalMinutes);
    }
    if (this.monologueEnabled) {
      this.scheduleMonologues(15);
    }
  }
  
  /**
   * Update page visibility state
   * @param {boolean} visible - Whether page is visible
   */
  setPageVisible(visible) {
    // Only track visibility if cost saving is enabled
    if (!this.costSavingEnabled) {
      return;
    }
    
    const wasVisible = this.checkPageVisible();
    this.isPageVisible = visible;
    
    if (wasVisible !== visible) {
      if (visible) {
        console.log('📄 Page became visible');
        this.resumeGeneration();
      } else {
        console.log('📄 Page became hidden');
        this.pauseGeneration();
      }
    }
  }
  
  /**
   * Update user activity timestamp
   */
  updateUserActivity() {
    // Only track activity if cost saving is enabled
    if (!this.costSavingEnabled) {
      return;
    }
    
    const wasActive = this.isUserActive();
    this.lastActivityTime = Date.now();
    
    if (!wasActive && this.isUserActive()) {
      console.log('👆 User activity detected');
      this.resumeGeneration();
    }
  }
  
  /**
   * Reset start time (when user manually enables or resumes)
   */
  resetStartTime() {
    this.startTime = Date.now();
    console.log('🔄 Reset run time counter');
  }
  
  /**
   * Start periodic check for pause/resume conditions
   */
  startPeriodicCheck() {
    // Clear existing check interval if any
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    // Only start periodic check if cost saving is enabled
    if (!this.costSavingEnabled) {
      return;
    }
    
    // Check every 60 seconds
    this.checkInterval = setInterval(() => {
      if (this.shouldPauseGeneration()) {
        if (!this.isPaused) {
          this.pauseGeneration();
        }
      } else {
        if (this.isPaused) {
          this.resumeGeneration();
        }
      }
    }, this.checkIntervalMs);
  }
  
  /**
   * Set cost saving enabled state
   * @param {boolean} enabled - Whether to enable cost saving
   */
  setCostSavingEnabled(enabled) {
    this.costSavingEnabled = enabled;
    console.log(`💰 Cost saving ${enabled ? 'enabled' : 'disabled'}`);
    
    // If disabling, resume any paused generation
    if (!enabled && this.isPaused) {
      this.isPaused = false;
      console.log('▶️ Resuming generation (cost saving disabled)');
      
      // Restart scheduling based on enabled features
      if (this.groupChatEnabled) {
        this.scheduleAutoChats(this.groupChatIntervalMinutes);
      }
      if (this.monologueEnabled) {
        this.scheduleMonologues(15);
      }
    }
    
    // If enabling, start periodic check
    if (enabled && (this.groupChatEnabled || this.monologueEnabled)) {
      this.startPeriodicCheck();
    } else {
      this.stopPeriodicCheck();
    }
  }
  
  /**
   * Check if cost saving is enabled
   * @returns {boolean} - Whether cost saving is enabled
   */
  isCostSavingEnabled() {
    return this.costSavingEnabled;
  }
  
  /**
   * Update cost control time settings
   * @param {number} maxInactiveTimeMinutes - Maximum inactive time in minutes
   * @param {number} maxRunTimeMinutes - Maximum run time in minutes
   */
  updateCostControlTimes(maxInactiveTimeMinutes, maxRunTimeMinutes) {
    this.maxInactiveTime = maxInactiveTimeMinutes * 60 * 1000; // Convert minutes to milliseconds
    this.maxRunTime = maxRunTimeMinutes * 60 * 1000; // Convert minutes to milliseconds
    console.log(`💰 Cost control times updated: inactive=${maxInactiveTimeMinutes}min, run=${maxRunTimeMinutes}min`);
  }
  
  /**
   * Set group chat interval time
   * @param {number} intervalMinutes - Interval between group chats in minutes
   */
  setGroupChatInterval(intervalMinutes) {
    this.groupChatIntervalMinutes = intervalMinutes;
    console.log(`💬 Group chat interval set to ${intervalMinutes} minutes`);
    
    // If group chat is already enabled, restart scheduling with new interval
    if (this.groupChatEnabled && this.layoutManager) {
      this.scheduleAutoChats(intervalMinutes);
    }
  }
  
  /**
   * Stop periodic check
   */
  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
  
  /**
   * Get current playback state
   * @returns {Object} - Playback state
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      currentTopic: this.currentSession?.topic,
      progress: this.currentSession 
        ? `${this.playbackIndex}/${this.messageQueue.length}` 
        : '0/0',
      queueLength: this.messageQueue.length,
      stats: this.stats
    };
  }
  
  /**
   * Update fish list (when fish are added/removed)
   * @param {Array} fishes - Updated fish array
   */
  updateFishes(fishes) {
    this.fishes = fishes;
    console.log(`CommunityChatManager: fish list updated (${fishes.length} fish)`);
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CommunityChatManager };
}

