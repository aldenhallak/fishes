/**
 * Fish Group Chat API
 * 
 * Generates group chat dialogue for multiple fish using Coze AI
 * with parameters (fish_array) passed to the bot.
 * 
 * Reference: AIGF_web Coze integration
 */

require('dotenv').config({ path: '.env.local' });
const { executeGraphQL } = require('../../../lib/hasura');
const { getGlobalParamInt } = require('../../../lib/global-params');

/**
 * Select random fish from tank with their information
 * @param {number} count - Number of fish to select
 * @returns {Promise<Array>} - Array of fish with owner info
 */
async function selectRandomFish(count) {
    const query = `
        query GetRandomFish($limit: Int!) {
            fish(
                where: { 
                    is_approved: { _eq: true },
                    personality: { _is_null: false }
                },
                order_by: { created_at: desc },
                limit: $limit
            ) {
                id
                fish_name
                personality
                user {
                    id
                    feeder_name
                    feeder_info
                }
            }
        }
    `;

    const result = await executeGraphQL(query, { limit: count * 3 }); // Get more than needed for randomization

    if (result.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }

    const fishes = result.data.fish || [];

    if (fishes.length === 0) {
        throw new Error('No approved fish found in the tank');
    }

    // Randomly select 'count' fish
    const shuffled = fishes.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, fishes.length));

    // Transform to fish_array format
    return selected.map(fish => ({
        fish_id: fish.id,
        fish_name: fish.fish_name || 'Unnamed',
        personality: fish.personality || 'cheerful',
        feeder_name: fish.user?.feeder_name || null,
        feeder_info: fish.user?.feeder_info || null
    }));
}

/**
 * Call Coze API for group chat generation
 * @param {Array} fishArray - Array of fish data
 * @returns {Promise<Object>} - Chat result
 */
async function generateGroupChat(fishArray) {
    const apiKey = process.env.COZE_API_KEY;
    const botId = process.env.COZE_BOT_ID;
    const baseUrl = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';

    if (!apiKey || !botId) {
        throw new Error('Missing COZE_API_KEY or COZE_BOT_ID in environment variables');
    }

    // Create conversation
    console.log('[Group Chat] Creating conversation...');
    const convResponse = await fetch(`${baseUrl}/v1/conversation/create`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            bot_id: botId,
        })
    });

    if (!convResponse.ok) {
        throw new Error(`Failed to create conversation: ${convResponse.status}`);
    }

    const convData = await convResponse.json();
    const conversationId = convData.data?.id || convData.conversation_id;

    if (!conversationId) {
        throw new Error('Failed to get conversation_id from Coze API');
    }

    console.log('[Group Chat] Conversation created:', conversationId);

    // Generate prompt for group chat
    const prompt = `Generate a lively group chat conversation for these fish in the tank. Each fish should speak 1-2 times, reflecting their personality and occasionally mentioning their owner.`;

    // Send chat with parameters
    // 根据Coze API文档，使用parameters字段传递参数给Bot
    console.log('[Group Chat] Sending chat request with parameters...');
    console.log('[Group Chat] Fish array:', JSON.stringify(fishArray, null, 2));
    
    const chatResponse = await fetch(`${baseUrl}/v3/chat?conversation_id=${conversationId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            bot_id: botId,
            user_id: 'fish-tank-system',
            stream: false,
            auto_save_history: true,
            additional_messages: [{
                role: 'user',
                content: prompt,
                content_type: 'text'
            }],
            parameters: {
                fish_array: fishArray  // 直接传递对象数组
            }
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

    console.log('[Group Chat] Chat sent, waiting for response...');

    // Poll for response
    let attempts = 0;
    const maxAttempts = 15;
    const pollInterval = 2000;

    while (attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, pollInterval));

        // Simplified polling: directly get message list without checking status
        const messagesResponse = await fetch(
            `${baseUrl}/v3/chat/message/list?conversation_id=${conversationId}&chat_id=${chatId}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    limit: 20,
                    order: 'desc'
                })
            }
        );

        const messagesData = await messagesResponse.json();
        
        // 检查COZE API是否返回错误
        if (messagesData.code && messagesData.code !== 0) {
            console.log(`[Group Chat] Poll attempt ${attempts}: COZE API error ${messagesData.code} - ${messagesData.msg}`);
            continue; // 继续下一次轮询
        }
        
        // 成功响应，提取消息
        const messages = messagesData.data?.data || messagesData.data || messagesData.messages || [];
        console.log(`[Group Chat] Poll attempt ${attempts}: got ${messages.length} messages`);

        if (messages.length > 0) {
            // 查找AI回复 - 必须是 role='assistant' 且 type='answer'
            const aiMessage = messages.find(m => 
                m.role === 'assistant' && 
                m.type === 'answer' && 
                m.content && 
                m.content.trim()
            );

            if (aiMessage) {
                console.log('[Group Chat] AI response received:', aiMessage.content.substring(0, 100));
                return parseGroupChatResponse(aiMessage.content, fishArray);
            }
        }
    }

    throw new Error('Group chat generation timed out');
}

/**
 * Parse Coze response to extract dialogue
 * @param {string} content - AI response content
 * @param {Array} fishArray - Original fish array for reference
 * @returns {Object} - Parsed dialogue
 */
function parseGroupChatResponse(content, fishArray) {
    try {
        // Try to parse as JSON
        let jsonStr = content.trim();
        
        // Remove markdown code blocks if present
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(jsonStr);
        
        // Check if it's the Coze format with "output" wrapper
        let dialogues;
        if (parsed.output && Array.isArray(parsed.output)) {
            // Coze format: {"output": [{"fish_id": "...", "seq": "1", "talk": "..."}]}
            dialogues = parsed.output.map(item => {
                // Find fish name by fish_id
                const fish = fishArray.find(f => f.fish_id === item.fish_id);
                return {
                    fishId: item.fish_id,
                    fishName: fish?.fish_name || `Fish ${item.seq}`,
                    message: item.talk,
                    sequence: parseInt(item.seq, 10)
                };
            });
        } else if (Array.isArray(parsed)) {
            // Direct array format: [{"fishId": "...", "fishName": "...", "message": "..."}]
            dialogues = parsed;
        } else {
            throw new Error('Invalid dialogue format');
        }

        if (dialogues && dialogues.length > 0) {
            // Sort by sequence if available
            dialogues.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
            
            return {
                dialogues,
                participantCount: fishArray.length,
                topic: 'Group Chat'
            };
        }

        throw new Error('No dialogues found');

    } catch (error) {
        console.error('[Group Chat] Failed to parse response:', error);
        console.error('[Group Chat] Content:', content.substring(0, 200));
        
        // Fallback: return as plain text
        return {
            dialogues: [{
                fishName: fishArray[0]?.fish_name || 'Fish',
                message: content.substring(0, 200)
            }],
            participantCount: fishArray.length,
            topic: 'Group Chat',
            raw: content
        };
    }
}

/**
 * Save group chat session to database
 * @param {Object} chatResult - Chat result from Coze
 * @param {Array} fishArray - Array of participating fish
 * @returns {Promise<string>} - Session ID
 */
async function saveGroupChatSession(chatResult, fishArray) {
    const mutation = `
        mutation SaveGroupChat(
            $topic: String!
            $time_of_day: String
            $participant_fish_ids: [uuid!]!
            $dialogues: jsonb!
            $display_duration: Int!
            $expires_at: timestamp!
        ) {
            insert_group_chat_one(
                object: {
                    topic: $topic
                    time_of_day: $time_of_day
                    participant_fish_ids: $participant_fish_ids
                    dialogues: $dialogues
                    display_duration: $display_duration
                    expires_at: $expires_at
                }
            ) {
                id
                created_at
            }
        }
    `;

    // Determine time of day
    const hour = new Date().getHours();
    const timeOfDay = hour >= 6 && hour < 12 
        ? 'morning' 
        : hour >= 12 && hour < 18 
        ? 'afternoon' 
        : hour >= 18 && hour < 22
        ? 'evening' 
        : 'night';

    // Calculate expires_at (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const variables = {
        topic: chatResult.topic || 'Group Chat',
        time_of_day: timeOfDay,
        participant_fish_ids: fishArray.map(f => f.fish_id),
        dialogues: { messages: chatResult.dialogues },
        display_duration: chatResult.dialogues ? chatResult.dialogues.length * 6 : 30,
        expires_at: expiresAt.toISOString()
    };

    try {
        const result = await executeGraphQL(mutation, variables);
        if (result.errors) {
            throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
        }
        return result.data.insert_group_chat_one.id;
    } catch (error) {
        console.error('[Group Chat] Failed to save session:', error);
        throw error;
    }
}

/**
 * Main API handler
 */
module.exports = async (req, res) => {
    // Only accept GET or POST
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method Not Allowed'
        });
    }

    try {
        console.log('[Group Chat] Starting group chat generation...');

        // Get participant count from global params
        const participantCount = await getGlobalParamInt('fish_chat_participant_count', 5);
        console.log('[Group Chat] Participant count:', participantCount);

        // Select random fish
        const fishArray = await selectRandomFish(participantCount);
        console.log('[Group Chat] Selected fish:', fishArray.map(f => f.fish_name));

        // Generate chat using Coze
        const chatResult = await generateGroupChat(fishArray);

        console.log('[Group Chat] Generation successful!');

        // Save to database
        let sessionId = null;
        try {
            sessionId = await saveGroupChatSession(chatResult, fishArray);
            console.log('[Group Chat] Session saved:', sessionId);
        } catch (saveError) {
            console.error('[Group Chat] Failed to save session, continuing anyway:', saveError);
            // Continue even if save fails
        }

        return res.status(200).json({
            success: true,
            sessionId,
            ...chatResult,
            participants: fishArray
        });

    } catch (error) {
        console.error('[Group Chat] Error:', error);

        return res.status(500).json({
            success: false,
            error: 'Failed to generate group chat',
            details: error.message
        });
    }
};


