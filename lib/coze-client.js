/**
 * COZE AI Client for Fish Community Chat
 * 
 * This module handles all interactions with the COZE API for generating
 * fish dialogue in the community chat system.
 */

const fetch = require('node-fetch');

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
    
    console.log('[parseCozeResponse] 原始内容:', content.substring(0, 500));
    
    // Try to extract JSON from the content
    // Sometimes COZE wraps it in markdown code blocks
    let jsonStr = content.trim();
    
    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Parse JSON
    const parsed = JSON.parse(jsonStr);
    
    console.log('[parseCozeResponse] 解析后的结构:', {
      isArray: Array.isArray(parsed),
      hasFishArray: !!parsed.fish_array,
      keys: Object.keys(parsed)
    });
    
    // 检查是否是新格式（包含fish_array或output的对象）
    let dialogues;
    if (parsed.fish_array && Array.isArray(parsed.fish_array)) {
      // 格式1：{ fish_array: [...], output_language: "..." }
      console.log('[parseCozeResponse] 使用格式1（fish_array）');
      dialogues = parsed.fish_array;
    } else if (parsed.output && Array.isArray(parsed.output)) {
      // 格式2：{ output: [...], output_language: "..." }
      console.log('[parseCozeResponse] 使用格式2（output）');
      dialogues = parsed.output;
    } else if (Array.isArray(parsed)) {
      // 格式3：直接是数组
      console.log('[parseCozeResponse] 使用格式3（直接数组）');
      dialogues = parsed;
    } else {
      throw new Error('Response format not recognized. Expected array or object with fish_array/output field');
    }
    
    // Validate each dialogue object
    const validatedDialogues = dialogues.map((d, index) => {
      // 新格式使用 fish_id 和 talk
      // 旧格式使用 fishName 和 message
      const fishId = d.fish_id;
      const fishName = d.fishName || d.fish_name || 'Unknown';
      const message = d.talk || d.message;
      const sequence = d.seq ? parseInt(d.seq) : (index + 1);
      
      if (!message) {
        throw new Error(`Invalid dialogue at index ${index}: missing message/talk`);
      }
      
      return {
        fishId: fishId,
        fishName: fishName,
        message: message,
        sequence: sequence
      };
    });
    
    console.log('[parseCozeResponse] ✅ 解析成功，对话数量:', validatedDialogues.length);
    
    return validatedDialogues;
    
  } catch (error) {
    console.error('[parseCozeResponse] ❌ 解析失败:', error);
    console.error('[parseCozeResponse] 响应内容:', response);
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

/**
 * 创建Coze conversation
 * @returns {Promise<string>} - Coze conversation ID
 */
async function createCozeConversation() {
  const apiKey = process.env.COZE_API_KEY;
  const botId = process.env.COZE_BOT_ID;
  const baseUrl = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';

  if (!apiKey || !botId) {
    throw new Error('Missing COZE_API_KEY or COZE_BOT_ID in environment variables');
  }

  try {
    console.log('[Coze Client] 创建新conversation...');
    
    const response = await fetch(`${baseUrl}/v1/conversation/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bot_id: botId,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Coze API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // 尝试多个可能的字段
    const conversationId = data.data?.id || data.data?.conversation_id || data.conversation_id || data.id;
    
    if (!conversationId) {
      throw new Error('Failed to get conversation_id from Coze API');
    }

    console.log('[Coze Client] ✅ Conversation创建成功:', conversationId);
    
    return conversationId;
    
  } catch (error) {
    console.error('[Coze Client] ❌ 创建conversation失败:', error);
    throw error;
  }
}

/**
 * 判断是否是Coze的conversation过期错误
 * @param {Error} error - 错误对象
 * @returns {boolean} - 是否是过期错误
 */
function isConversationExpiredError(error) {
  if (!error) return false;
  
  // 检查错误代码
  if (error.code === 'CONVERSATION_EXPIRED' || error.code === 'CONVERSATION_NOT_FOUND') {
    return true;
  }
  
  // 检查错误消息
  const message = error.message?.toLowerCase() || '';
  return message.includes('conversation has expired') ||
         message.includes('conversation not found') ||
         message.includes('conversation expired') ||
         message.includes('invalid conversation');
}

/**
 * 使用conversation生成对话
 * @param {string} topic - 对话主题
 * @param {Array} participants - 参与者数组
 * @param {string} conversationId - Coze conversation ID
 * @param {string} userMessage - 用户消息（可选）
 * @param {string} userName - 用户名（可选）
 * @returns {Promise<Object>} - { dialogues }
 */
async function generateDialogueWithConversation(
  topic,
  participants,
  conversationId,
  userMessage = null,
  userName = null
) {
  const apiKey = process.env.COZE_API_KEY;
  const botId = process.env.COZE_BOT_ID;
  const baseUrl = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';

  if (!apiKey || !botId) {
    throw new Error('Missing COZE_API_KEY or COZE_BOT_ID in environment variables');
  }

  try {
    // 构建简单的prompt（鱼信息通过parameters传递）
    let prompt = userMessage && userMessage.trim() 
      ? userMessage.trim()
      : `请生成关于"${topic}"的对话`;
    
    console.log('[Coze Client] 使用conversation发送消息:', {
      conversationId,
      hasUserMessage: !!userMessage,
      participantCount: participants.length
    });
    
    // 构建parameters（这是关键！）
    const parameters = {
      fish_array: participants.map(p => ({
        fish_id: p.fish_id,
        fish_name: p.fish_name,
        personality: p.personality,
        nick_name: p.nick_name || null,
        about_me: p.about_me || null
      })),
      output_language: '简体中文'
    };
    
    // 如果有用户消息，添加到parameters
    if (userMessage && userMessage.trim()) {
      parameters.user_talk = userMessage.trim();
      if (userName) {
        parameters.user_name = userName;
      }
    }
    
    // 构建请求体
    const requestBody = {
      bot_id: botId,
      user_id: 'fish-tank-system',
      stream: false,
      auto_save_history: true,
      additional_messages: [{
        role: 'user',
        content: prompt,
        content_type: 'text'
      }],
      parameters: parameters  // 关键：使用parameters传递鱼的信息
    };
    
    // 打印完整的请求信息（格式与测试页一致）
    console.log('[Parameters Test] 发送聊天请求（带parameters）');
    console.log(JSON.stringify(requestBody, null, 2));
    
    // 发送消息
    const response = await fetch(`${baseUrl}/v3/chat?conversation_id=${conversationId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Coze API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    console.log('[Coze Client] Coze API初始响应:', {
      code: data.code,
      msg: data.msg,
      hasData: !!data.data,
      status: data.data?.status,
      chatId: data.data?.id
    });
    
    if (data.code !== 0) {
      throw new Error(`Coze API returned error: ${data.msg}`);
    }

    // 检查data.data是否存在
    if (!data.data) {
      console.error('[Coze Client] ❌ Coze API返回的data为空');
      throw new Error('Coze API returned empty data');
    }

    // 如果状态是in_progress，需要轮询等待结果
    const chatId = data.data.id;
    const conversationIdForPoll = data.data.conversation_id;
    
    if (data.data.status === 'in_progress') {
      console.log('[Coze Client] 对话生成中，开始轮询...');
      
      // 轮询获取结果
      const maxAttempts = 10;
      const pollInterval = 3000; // 3秒
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
        console.log(`[Coze Client] 轮询第${attempt}次...`);
        
        // 获取对话消息
        const messagesUrl = `${baseUrl}/v3/chat/message/list?conversation_id=${conversationIdForPoll}&chat_id=${chatId}`;
        const messagesResponse = await fetch(messagesUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (!messagesResponse.ok) {
          console.warn(`[Coze Client] 轮询失败: ${messagesResponse.status}`);
          continue;
        }
        
        const messagesData = await messagesResponse.json();
        
        console.log(`[Coze Client] 轮询第${attempt}次响应:`, {
          code: messagesData.code,
          hasData: !!messagesData.data,
          messageCount: messagesData.data?.length || 0
        });
        
        if (messagesData.code === 0 && messagesData.data && messagesData.data.length > 0) {
          console.log('============ Coze API 轮询响应详情 ============');
          console.log('消息列表:');
          messagesData.data.forEach((msg, idx) => {
            console.log(`消息${idx + 1}:`, {
              role: msg.role,
              type: msg.type,
              contentLength: msg.content?.length || 0,
              content: msg.content?.substring(0, 200) + (msg.content?.length > 200 ? '...' : '')
            });
          });
          console.log('==========================================');
          
          // 找到assistant的回复
          const assistantMessage = messagesData.data.find(msg => msg.role === 'assistant' && msg.type === 'answer');
          
          if (assistantMessage && assistantMessage.content) {
            console.log('[Coze Client] ✅ 获取到对话结果');
            console.log('Assistant回复内容:');
            console.log(assistantMessage.content);
            
            // 解析响应
            const dialogues = parseCozeResponse({ messages: [{ content: assistantMessage.content }] });
            
            return {
              dialogues,
              participantCount: participants.length,
              topic
            };
          }
        }
      }
      
      throw new Error('Coze API轮询超时，未能获取对话结果');
    }

    // 如果不是in_progress，直接解析
    const dialogues = parseCozeResponse(data.data);
    
    console.log('[Coze Client] ✅ 对话生成成功:', {
      dialogueCount: dialogues.length
    });
    
    return {
      dialogues,
      participantCount: participants.length,
      topic
    };
    
  } catch (error) {
    console.error('[Coze Client] ❌ 生成对话失败:', error);
    console.error('[Coze Client] 错误详情:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

module.exports = {
  generateDialogue,
  generateFallbackDialogue,
  selectTopic,
  getTimeOfDay,
  buildPrompt,
  parseCozeResponse,
  createCozeConversation,
  isConversationExpiredError,
  generateDialogueWithConversation,
  TOPICS_BY_TIME
};

