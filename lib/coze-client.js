/**
 * COZE AI Client for Fish Community Chat
 * 
 * This module handles all interactions with the COZE API for generating
 * fish dialogue in the community chat system.
 */

const COZE_API_URL = 'https://api.coze.com/open_api/v2/chat';

/**
 * Unified Prompt Template for Fish Community Chat
 * Generates both group conversations and individual musings
 */
const UNIFIED_PROMPT_TEMPLATE = `You are managing a lively community fish tank. Generate 5-8 natural messages from the fish below, mixing group conversations and individual musings.

Topic: {topic}
Time: {time_of_day}
Fish participants:
{fish_list}

Requirements:
1. Mix conversation types naturally:
   - Some fish chat with each other (respond to previous messages)
   - Some fish talk to themselves (independent thoughts)
2. Each message: 10-30 words
3. Clearly reflect each fish's personality:
   - Cheerful: Enthusiastic, positive, friendly
   - Shy: Quiet, hesitant, uses "um" and "..."
   - Brave: Confident, encouraging, protective
   - Lazy: Sleepy, slow, avoids activity
4. Use emojis sparingly (1-2 per message max)
5. Make it feel organic and spontaneous
6. Output ONLY a valid JSON array, no other text

Example output (notice the mix):
[
  {"fishName": "Bubbles", "message": "Good morning everyone! 🌅 Water feels great!"},
  {"fishName": "Shadow", "message": "Um... morning. *swims to corner quietly*"},
  {"fishName": "Lazy", "message": "Zzz... five more minutes... *drifts lazily*"},
  {"fishName": "Hero", "message": "Shadow, you don't have to be shy! Join us!"},
  {"fishName": "Bubbles", "message": "Yes! The more the merrier! 💙"},
  {"fishName": "Lazy", "message": "Why is everyone so loud... *yawns*"},
  {"fishName": "Shadow", "message": "Okay Hero... I'll try. Thanks."}
]

Note: Bubbles+Hero+Shadow are having a conversation, while Lazy is just talking to himself. This creates a natural, lively tank atmosphere.

NOW GENERATE for the given topic and fish. Output ONLY the JSON array:`;

/**
 * Topic lists by time of day
 */
const TOPICS_BY_TIME = {
  morning: [
    "Morning Greetings",
    "Breakfast Time",
    "New Day Energy",
    "Morning Swimming",
    "Wake Up Call"
  ],
  afternoon: [
    "Swimming Fun",
    "Afternoon Relaxation",
    "Midday Chat",
    "Exploring the Tank",
    "Bubble Watching"
  ],
  evening: [
    "Sunset Time",
    "Evening Stories",
    "Day Reflection",
    "Dinner Discussion",
    "Twilight Tales"
  ],
  night: [
    "Night Owls",
    "Stargazing",
    "Peaceful Night",
    "Moonlight Swimming",
    "Bedtime Thoughts"
  ]
};

/**
 * Get current time of day
 * @returns {string} - morning, afternoon, evening, or night
 */
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'night';
}

/**
 * Select a random topic based on time of day
 * @param {string} timeOfDay - Optional time period override
 * @returns {string} - Selected topic
 */
function selectTopic(timeOfDay = null) {
  const time = timeOfDay || getTimeOfDay();
  const topics = TOPICS_BY_TIME[time] || TOPICS_BY_TIME.afternoon;
  return topics[Math.floor(Math.random() * topics.length)];
}

/**
 * Build the prompt for COZE API
 * @param {string} topic - Chat topic
 * @param {Array} participants - Array of fish objects with name and personality
 * @returns {string} - Complete prompt
 */
function buildPrompt(topic, participants) {
  const timeOfDay = getTimeOfDay();
  
  const fishList = participants.map((fish, index) => 
    `${index + 1}. ${fish.name} (${fish.personality || 'cheerful'})`
  ).join('\n');
  
  return UNIFIED_PROMPT_TEMPLATE
    .replace('{topic}', topic)
    .replace('{time_of_day}', timeOfDay)
    .replace('{fish_list}', fishList);
}

/**
 * Parse COZE API response and extract dialogue array
 * @param {Object} response - COZE API response
 * @returns {Array} - Array of dialogue objects
 */
function parseCozeResponse(response) {
  try {
    // COZE response structure: response.messages[0].content
    const content = response.messages?.[0]?.content || '';
    
    // Try to extract JSON array from the content
    // Sometimes COZE wraps it in markdown code blocks
    let jsonStr = content.trim();
    
    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Parse JSON
    const dialogues = JSON.parse(jsonStr);
    
    // Validate structure
    if (!Array.isArray(dialogues)) {
      throw new Error('Response is not an array');
    }
    
    // Validate each dialogue object
    const validatedDialogues = dialogues.map((d, index) => {
      if (!d.fishName || !d.message) {
        throw new Error(`Invalid dialogue at index ${index}: missing fishName or message`);
      }
      
      return {
        fishName: d.fishName,
        message: d.message,
        sequence: index + 1
      };
    });
    
    return validatedDialogues;
    
  } catch (error) {
    console.error('Failed to parse COZE response:', error);
    console.error('Response content:', response);
    throw new Error(`Failed to parse dialogue: ${error.message}`);
  }
}

/**
 * Call COZE API to generate fish dialogue
 * @param {string} topic - Chat topic
 * @param {Array} participants - Array of fish objects
 * @returns {Promise<Array>} - Array of dialogue objects
 */
async function generateDialogue(topic, participants) {
  if (!process.env.COZE_API_KEY) {
    throw new Error('COZE_API_KEY environment variable is not set');
  }
  
  if (!process.env.COZE_BOT_ID) {
    throw new Error('COZE_BOT_ID environment variable is not set');
  }
  
  if (!participants || participants.length < 2) {
    throw new Error('At least 2 fish participants are required');
  }
  
  try {
    const prompt = buildPrompt(topic, participants);
    
    console.log('Calling COZE API...', {
      topic,
      participantCount: participants.length,
      timeOfDay: getTimeOfDay()
    });
    
    const response = await fetch(COZE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COZE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_id: `fish-chat-${Date.now()}`,
        bot_id: process.env.COZE_BOT_ID,
        user: 'fish-tank-system',
        query: prompt,
        stream: false
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`COZE API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('COZE API response received', {
      code: data.code,
      msg: data.msg
    });
    
    if (data.code !== 0) {
      throw new Error(`COZE API returned error: ${data.msg}`);
    }
    
    const dialogues = parseCozeResponse(data.data);
    
    console.log('Successfully parsed dialogues:', {
      count: dialogues.length,
      fishNames: dialogues.map(d => d.fishName)
    });
    
    return dialogues;
    
  } catch (error) {
    console.error('Failed to generate dialogue:', error);
    throw error;
  }
}

/**
 * Generate fallback dialogue when COZE API fails
 * @param {Array} participants - Array of fish objects
 * @returns {Array} - Array of fallback dialogue objects
 */
function generateFallbackDialogue(participants) {
  const fallbacks = {
    cheerful: [
      "What a lovely day to be swimming!",
      "Hello everyone! 🌊",
      "This water feels amazing!"
    ],
    shy: [
      "Um... hello... *swims quietly*",
      "I'll just stay over here...",
      "..."
    ],
    brave: [
      "Ready for any adventure!",
      "Don't worry, I've got your back!",
      "Let's explore together!"
    ],
    lazy: [
      "Zzz... *drifts slowly*",
      "Too tired for this...",
      "*yawns* Maybe later..."
    ]
  };
  
  return participants.slice(0, 5).map((fish, index) => {
    const personality = fish.personality || 'cheerful';
    const messages = fallbacks[personality] || fallbacks.cheerful;
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    return {
      fishName: fish.name,
      message: message,
      sequence: index + 1
    };
  });
}

module.exports = {
  generateDialogue,
  generateFallbackDialogue,
  selectTopic,
  getTimeOfDay,
  buildPrompt,
  parseCozeResponse,
  TOPICS_BY_TIME
};

