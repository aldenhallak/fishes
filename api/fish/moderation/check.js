/**
 * Fish Content Moderation API
 * 
 * Uses Coze AI to check if user-provided fish information
 * (personality, feeder_name, feeder_info) complies with content policies.
 * 
 * Reference: AIGF_web Coze integration
 */

require('dotenv').config({ path: '.env.local' });

/**
 * Call Coze API for content moderation
 * @param {string} content - Content to check
 * @param {string} contentType - Type of content (personality/feeder_name/feeder_info)
 * @returns {Promise<Object>} - Moderation result
 */
async function callCozeModerationAPI(content, contentType) {
  const apiKey = process.env.COZE_API_KEY;
  const botId = process.env.COZE_MODERATION_BOT_ID;
  const baseUrl = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';

  if (!apiKey || !botId) {
    throw new Error('Missing COZE_API_KEY or COZE_MODERATION_BOT_ID in environment variables');
  }

  // Create conversation
  const conversationResponse = await fetch(`${baseUrl}/v1/conversation/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bot_id: botId,
    })
  });

  if (!conversationResponse.ok) {
    throw new Error(`Failed to create conversation: ${conversationResponse.status}`);
  }

  const conversationData = await conversationResponse.json();
  const conversationId = conversationData.data?.id || conversationData.conversation_id;

  if (!conversationId) {
    throw new Error('Failed to get conversation_id from Coze API');
  }

  // Construct prompt for moderation
  const prompt = `Please check if the following ${contentType} content is appropriate and complies with content policies. Content: "${content}"

Return ONLY a JSON object with this structure:
{
  "is_compliant": true/false,
  "reason": "explanation if not compliant, empty string if compliant"
}`;

  // Send chat message
  const chatResponse = await fetch(`${baseUrl}/v3/chat?conversation_id=${conversationId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bot_id: botId,
      user_id: 'fish-moderation-system',
      stream: false,
      auto_save_history: true,
      additional_messages: [{
        role: 'user',
        content: prompt,
        content_type: 'text'
      }]
    })
  });

  if (!chatResponse.ok) {
    throw new Error(`Chat API error: ${chatResponse.status}`);
  }

  const chatData = await chatResponse.json();

  if (chatData.code !== 0) {
    throw new Error(`Coze API error: ${chatData.msg || 'Unknown error'}`);
  }

  const chatId = chatData.data?.id;

  if (!chatId) {
    throw new Error('Failed to get chat_id from Coze API');
  }

  // Poll for response (wait for AI to finish)
  let attempts = 0;
  const maxAttempts = 10;
  const pollInterval = 2000; // 2 seconds

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    // Check chat status
    const statusResponse = await fetch(
      `${baseUrl}/v1/conversation/message/retrieve?conversation_id=${conversationId}&chat_id=${chatId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const statusData = await statusResponse.json();

    if (statusData.data?.status === 'completed') {
      // Get messages
      const messagesResponse = await fetch(`${baseUrl}/v3/chat/message/list?conversation_id=${conversationId}&chat_id=${chatId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 20,
          order: 'desc'
        })
      });

      const messagesData = await messagesResponse.json();

      if (messagesData.code === 0 && messagesData.data?.data) {
        const messages = messagesData.data.data;
        const aiMessage = messages.find(m => m.role === 'assistant' && m.type === 'answer');

        if (aiMessage && aiMessage.content) {
          return parseModerationResult(aiMessage.content);
        }
      }
    }

    attempts++;
  }

  throw new Error('Moderation check timed out');
}

/**
 * Parse Coze moderation response
 * @param {string} content - AI response content
 * @returns {Object} - Parsed moderation result
 */
function parseModerationResult(content) {
  try {
    // Remove markdown code blocks if present
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const result = JSON.parse(jsonStr);

    return {
      is_compliant: result.is_compliant === true,
      reason: result.reason || ''
    };
  } catch (error) {
    console.error('[Moderation] Failed to parse AI response:', content);
    // Default to not compliant on parse error
    return {
      is_compliant: false,
      reason: 'Unable to verify content safety'
    };
  }
}

/**
 * Main API handler
 */
module.exports = async (req, res) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed'
    });
  }

  try {
    const { personality, feeder_name, feeder_info } = req.body;

    console.log('[Fish Moderation] Checking content:', {
      hasPersonality: !!personality,
      hasFeederName: !!feeder_name,
      hasFeederInfo: !!feeder_info
    });

    const results = {
      personality: { is_compliant: true, reason: '' },
      feeder_name: { is_compliant: true, reason: '' },
      feeder_info: { is_compliant: true, reason: '' }
    };

    // Check personality if provided
    if (personality && personality.trim()) {
      console.log('[Fish Moderation] Checking personality...');
      results.personality = await callCozeModerationAPI(personality, 'personality');
    }

    // Check feeder_name if provided
    if (feeder_name && feeder_name.trim()) {
      console.log('[Fish Moderation] Checking feeder_name...');
      results.feeder_name = await callCozeModerationAPI(feeder_name, 'feeder name');
    }

    // Check feeder_info if provided
    if (feeder_info && feeder_info.trim()) {
      console.log('[Fish Moderation] Checking feeder_info...');
      results.feeder_info = await callCozeModerationAPI(feeder_info, 'feeder information');
    }

    // Determine overall compliance
    const allCompliant = 
      results.personality.is_compliant &&
      results.feeder_name.is_compliant &&
      results.feeder_info.is_compliant;

    // Collect all reasons
    const reasons = [];
    if (!results.personality.is_compliant) reasons.push(`Personality: ${results.personality.reason}`);
    if (!results.feeder_name.is_compliant) reasons.push(`Feeder name: ${results.feeder_name.reason}`);
    if (!results.feeder_info.is_compliant) reasons.push(`Feeder info: ${results.feeder_info.reason}`);

    console.log('[Fish Moderation] Result:', {
      allCompliant,
      reasonCount: reasons.length
    });

    return res.status(200).json({
      success: true,
      is_compliant: allCompliant,
      details: results,
      reason: reasons.join('; ')
    });

  } catch (error) {
    console.error('[Fish Moderation] Error:', error);

    return res.status(500).json({
      success: false,
      error: 'Content moderation failed',
      details: error.message
    });
  }
};

