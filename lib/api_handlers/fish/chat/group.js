/**
 * AI Fish Group Chat API
 * 
 * Generates group chat dialogue for multiple fish using Coze AI
 * with parameters (fish_array) passed to the bot.
 * 
 * Reference: AIGF_web Coze integration
 */

require('dotenv').config({ path: '.env.local' });
const { executeGraphQL } = require('../../../hasura');
const { getGlobalParamInt } = require('../../../global-params');

/**
 * Get user's daily AI Fish Group Chat usage count
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of group chats today initiated by this user
 */
async function getUserDailyGroupChatUsage(userId) {
    // Get start of today (00:00:00) in UTC
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    // Query group_chat records created today by this user
    // Use initiator_user_id if available, otherwise count all records
    const query = `
        query GetUserDailyUsage($userId: String!, $todayStart: timestamp!) {
            group_chat_aggregate(
                where: {
                    created_at: { _gte: $todayStart },
                    initiator_user_id: { _eq: $userId }
                }
            ) {
                aggregate {
                    count
                }
            }
        }
    `;
    
    const result = await executeGraphQL(query, { userId, todayStart: todayISO });
    
    if (result.errors) {
        console.error('[AI Fish Group Chat] Failed to get daily usage:', result.errors);
        return 0; // Return 0 on error to allow usage
    }
    
    const count = result.data.group_chat_aggregate?.aggregate?.count || 0;
    
    console.log(`[AI Fish Group Chat] User ${userId} has initiated ${count} group chats today (since ${todayISO})`);
    
    // Debug: Also query the actual records to verify
    const debugQuery = `
        query GetUserDailyUsageDebug($userId: String!, $todayStart: timestamp!) {
            group_chat(
                where: {
                    created_at: { _gte: $todayStart },
                    initiator_user_id: { _eq: $userId }
                }
                order_by: { created_at: desc }
            ) {
                id
                topic
                created_at
                initiator_user_id
            }
        }
    `;
    
    try {
        const debugResult = await executeGraphQL(debugQuery, { userId, todayStart: todayISO });
        if (debugResult.data && debugResult.data.group_chat) {
            console.log(`[AI Fish Group Chat] Debug: Found ${debugResult.data.group_chat.length} records:`, 
                debugResult.data.group_chat.map(gc => ({
                    id: gc.id,
                    topic: gc.topic,
                    created_at: gc.created_at,
                    initiator_user_id: gc.initiator_user_id
                }))
            );
        }
    } catch (debugError) {
        console.warn('[AI Fish Group Chat] Debug query failed:', debugError);
    }
    
    return count;
}

/**
 * Check if user can create AI Fish Group Chat (check daily limit for free users)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - { allowed: boolean, usage?: number, limit?: number, tier?: string }
 */
async function checkUserGroupChatLimit(userId) {
    // Get user's subscription with member_type info
    const query = `
        query GetUserSubscription($userId: String!) {
            users_by_pk(id: $userId) {
                id
                user_subscriptions(
                    where: { is_active: { _eq: true } }
                    order_by: { created_at: desc }
                    limit: 1
                ) {
                    plan
                    member_type {
                        id
                        group_chat_daily_limit
                    }
                }
            }
        }
    `;
    
    const result = await executeGraphQL(query, { userId });
    
    if (result.errors) {
        console.error('[AI Fish Group Chat] Failed to get user subscription:', result.errors);
        return { allowed: true }; // Allow on error
    }
    
    const user = result.data.users_by_pk;
    if (!user) {
        console.warn('[AI Fish Group Chat] User not found:', userId);
        return { allowed: true }; // Allow if user not found
    }
    
    const activeSubscription = user.user_subscriptions && user.user_subscriptions.length > 0
        ? user.user_subscriptions[0]
        : null;
    
    const tier = activeSubscription ? activeSubscription.plan : 'free';
    let memberType = activeSubscription?.member_type;
    let groupChatDailyLimit = memberType?.group_chat_daily_limit;
    
    // Always query member_types table to ensure we get the latest value
    // This is more reliable than relying on the subscription's member_type relation
    console.log(`[AI Fish Group Chat] Querying member_types table for tier: ${tier}`);
    const memberTypeQuery = `
        query GetMemberType($tierId: String!) {
            member_types_by_pk(id: $tierId) {
                id
                group_chat_daily_limit
            }
        }
    `;
    
    try {
        const memberTypeResult = await executeGraphQL(memberTypeQuery, { tierId: tier });
        if (!memberTypeResult.errors && memberTypeResult.data?.member_types_by_pk) {
            const queriedMemberType = memberTypeResult.data.member_types_by_pk;
            // Use the value from direct query (more reliable)
            groupChatDailyLimit = queriedMemberType.group_chat_daily_limit;
            console.log(`[AI Fish Group Chat] Found member_type for ${tier}: group_chat_daily_limit = ${groupChatDailyLimit}`);
            memberType = queriedMemberType;
        } else {
            console.warn(`[AI Fish Group Chat] member_types_by_pk returned no data for tier: ${tier}`);
        }
    } catch (error) {
        console.warn(`[AI Fish Group Chat] Failed to query member_types for ${tier}:`, error);
    }
    
    console.log(`[AI Fish Group Chat] User ${userId} tier: ${tier}, group_chat_daily_limit: ${groupChatDailyLimit}, memberType:`, memberType);
    
    // Check if unlimited (only for plus/premium/admin, or if explicitly set to 'unlimited')
    if (groupChatDailyLimit === 'unlimited') {
        console.log(`[AI Fish Group Chat] User ${userId} is ${tier}, unlimited access (explicitly set)`);
        return { allowed: true, tier, unlimited: true };
    }
    
    // For plus/premium/admin, if limit is not explicitly set, they are unlimited
    if ((tier === 'plus' || tier === 'premium' || tier === 'admin') && 
        (groupChatDailyLimit === null || groupChatDailyLimit === '')) {
        console.log(`[AI Fish Group Chat] User ${userId} is ${tier}, unlimited access (default for tier)`);
        return { allowed: true, tier, unlimited: true };
    }
    
    // Parse daily limit from member_types.group_chat_daily_limit
    let dailyLimit = 5; // Default fallback
    if (groupChatDailyLimit && groupChatDailyLimit !== 'unlimited') {
        const parsedLimit = parseInt(groupChatDailyLimit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
            dailyLimit = parsedLimit;
            console.log(`[AI Fish Group Chat] Using limit from member_types: ${dailyLimit}`);
        } else {
            // Fallback to global param if invalid
            dailyLimit = await getGlobalParamInt('free_daily_group_chat_limit', 5);
            console.log(`[AI Fish Group Chat] Invalid limit value: ${groupChatDailyLimit}, using fallback: ${dailyLimit}`);
        }
    } else {
        // Fallback to global param if not set
        dailyLimit = await getGlobalParamInt('free_daily_group_chat_limit', 5);
        console.log(`[AI Fish Group Chat] No limit set (was: ${groupChatDailyLimit}), using fallback: ${dailyLimit}`);
    }
    
    const dailyUsage = await getUserDailyGroupChatUsage(userId);
    
    const allowed = dailyUsage < dailyLimit;
    
    console.log(`[AI Fish Group Chat] User ${userId} (${tier}): ${dailyUsage}/${dailyLimit} used today, allowed: ${allowed} (limit from member_types: ${groupChatDailyLimit})`);
    
    return {
        allowed,
        usage: dailyUsage,
        limit: dailyLimit,
        tier: tier
    };
}

/**
 * Select random fish from tank with their information
 * All approved fish can participate regardless of membership tier
 * @param {number} count - Number of fish to select
 * @param {Array} tankFishIds - Optional array of fish IDs that are currently in the tank
 * @returns {Promise<Array>} - Array of fish with owner info
 */
async function selectRandomFish(count, tankFishIds = null) {
    // If tankFishIds provided, only select from those fish
    const useTankFilter = tankFishIds && Array.isArray(tankFishIds) && tankFishIds.length > 0;
    
    if (useTankFilter) {
        console.log(`[AI Fish Group Chat] Selecting from ${tankFishIds.length} fish in current tank`);
    }
    
    const query = useTankFilter ? `
        query GetRandomFish($limit: Int!, $fishIds: [uuid!]!) {
            fish(
                where: { 
                    is_approved: { _eq: true },
                    personality: { _is_null: false },
                    id: { _in: $fishIds }
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
                    user_language
                }
            }
        }
    ` : `
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
                    user_language
                }
            }
        }
    `;

    const variables = { limit: count };
    if (useTankFilter) {
        variables.fishIds = tankFishIds;
    }

    const result = await executeGraphQL(query, variables);

    if (result.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }

    const allFishes = result.data.fish || [];

    if (allFishes.length === 0) {
        throw new Error('No approved fish found in the tank');
    }

    // Randomly select 'count' fish (no membership filtering)
    const shuffled = allFishes.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, allFishes.length));

    console.log(`[AI Fish Group Chat] Selected ${selected.length} fish from ${allFishes.length} available`);

    // Transform to fish_array format
    return selected.map(fish => ({
        fish_id: fish.id,
        fish_name: fish.fish_name || 'Unnamed',
        personality: fish.personality || 'cheerful',
        feeder_name: fish.user?.feeder_name || null,
        feeder_info: fish.user?.feeder_info || null,
        user_language: fish.user?.user_language || null,
        user_id: fish.user?.id || null
    }));
}

/**
 * Determine the language to use for group chat
 * Priority: 1) initiator's language, 2) first non-empty user_language from fish array, 3) default to "English"
 * @param {Array} fishArray - Array of fish data with user_language
 * @param {string} initiatorUserId - Optional user ID of the initiator
 * @returns {Promise<string>} - Language value directly from user setting (e.g., "简体中文", "English")
 */
async function determineGroupChatLanguage(fishArray, initiatorUserId = null) {
    // First, try to get initiator's language preference
    if (initiatorUserId) {
        try {
            const userQuery = `
                query GetUserLanguage($userId: String!) {
                    users_by_pk(id: $userId) {
                        user_language
                    }
                }
            `;
            const userResult = await executeGraphQL(userQuery, { userId: initiatorUserId });
            if (userResult.data && userResult.data.users_by_pk && userResult.data.users_by_pk.user_language) {
                const initiatorLanguage = userResult.data.users_by_pk.user_language.trim();
                console.log('[AI Fish Group Chat] Using initiator language:', initiatorLanguage);
                return initiatorLanguage;
            }
        } catch (error) {
            console.warn('[AI Fish Group Chat] Failed to get initiator language, falling back to fish languages:', error);
        }
    }
    
    // Fallback: Find the first non-empty user_language from fish array
    for (const fish of fishArray) {
        if (fish.user_language && fish.user_language.trim()) {
            const fishLanguage = fish.user_language.trim();
            console.log('[AI Fish Group Chat] Using fish owner language:', fishLanguage);
            return fishLanguage;
        }
    }
    
    // Default to English if no language is set
    console.log('[AI Fish Group Chat] No language found, defaulting to English');
    return 'English';
}

/**
 * Call Coze API for group chat generation
 * @param {Array} fishArray - Array of fish data
 * @param {string} initiatorUserId - Optional user ID of the initiator (for language preference)
 * @returns {Promise<Object>} - Chat result
 */
async function generateGroupChat(fishArray, initiatorUserId = null) {
    const apiKey = process.env.COZE_API_KEY;
    const botId = process.env.COZE_BOT_ID;
    const baseUrl = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';

    if (!apiKey || !botId) {
        throw new Error('Missing COZE_API_KEY or COZE_BOT_ID in environment variables');
    }

    // Determine the language to use (prioritize initiator's language)
    const outputLanguage = await determineGroupChatLanguage(fishArray, initiatorUserId);
    console.log('[AI Fish Group Chat] Using language:', outputLanguage);

    // Create conversation
    console.log('[AI Fish Group Chat] Creating conversation...');
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

    console.log('[AI Fish Group Chat] Conversation created:', conversationId);

    // Generate prompt for AI Fish Group Chat
    const prompt = `Generate a lively group chat conversation for these fish in the tank. Each fish should speak 1-2 times, reflecting their personality and occasionally mentioning their owner.`;

    // Send chat with parameters
    // 根据Coze API文档，使用parameters字段传递参数给Bot
    console.log('[AI Fish Group Chat] Sending chat request with parameters...');
    console.log('[AI Fish Group Chat] Fish array:', JSON.stringify(fishArray, null, 2));
    
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
                fish_array: fishArray,  // 直接传递对象数组
                output_language: outputLanguage  // 使用英文全称，如 "English", "French", "Chinese" 等
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

    console.log('[AI Fish Group Chat] Chat sent, waiting for response...');

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
            console.log(`[AI Fish Group Chat] Poll attempt ${attempts}: COZE API error ${messagesData.code} - ${messagesData.msg}`);
            continue; // 继续下一次轮询
        }
        
        // 成功响应，提取消息
        const messages = messagesData.data?.data || messagesData.data || messagesData.messages || [];
        console.log(`[AI Fish Group Chat] Poll attempt ${attempts}: got ${messages.length} messages`);

        if (messages.length > 0) {
            // 查找AI回复 - 必须是 role='assistant' 且 type='answer'
            const aiMessage = messages.find(m => 
                m.role === 'assistant' && 
                m.type === 'answer' && 
                m.content && 
                m.content.trim()
            );

            if (aiMessage) {
                console.log('[AI Fish Group Chat] AI response received:', aiMessage.content.substring(0, 100));
                return parseGroupChatResponse(aiMessage.content, fishArray);
            }
        }
    }

    throw new Error('AI Fish Group Chat generation timed out');
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
                topic: 'AI Fish Group Chat'
            };
        }

        throw new Error('No dialogues found');

    } catch (error) {
        console.error('[AI Fish Group Chat] Failed to parse response:', error);
        console.error('[AI Fish Group Chat] Content:', content.substring(0, 200));
        
        // Fallback: return as plain text
        return {
            dialogues: [{
                fishName: fishArray[0]?.fish_name || 'Fish',
                message: content.substring(0, 200)
            }],
            participantCount: fishArray.length,
            topic: 'AI Fish Group Chat',
            raw: content
        };
    }
}

/**
 * Save group chat session to database
 * @param {Object} chatResult - Chat result from Coze
 * @param {Array} fishArray - Array of participating fish
 * @param {string} initiatorUserId - User ID who initiated this chat
 * @returns {Promise<string>} - Session ID
 */
async function saveGroupChatSession(chatResult, fishArray, initiatorUserId = null) {
    const mutation = `
        mutation SaveGroupChat(
            $topic: String!
            $time_of_day: String
            $participant_fish_ids: [uuid!]!
            $dialogues: jsonb!
            $display_duration: Int!
            $expires_at: timestamp!
            $initiator_user_id: String
        ) {
            insert_group_chat_one(
                object: {
                    topic: $topic
                    time_of_day: $time_of_day
                    participant_fish_ids: $participant_fish_ids
                    dialogues: $dialogues
                    display_duration: $display_duration
                    expires_at: $expires_at
                    initiator_user_id: $initiator_user_id
                }
            ) {
                id
                created_at
                initiator_user_id
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
        topic: chatResult.topic || 'AI Fish Group Chat',
        time_of_day: timeOfDay,
        participant_fish_ids: fishArray.map(f => f.fish_id),
        dialogues: { messages: chatResult.dialogues },
        display_duration: chatResult.dialogues ? chatResult.dialogues.length * 6 : 30,
        expires_at: expiresAt.toISOString(),
        initiator_user_id: initiatorUserId || null  // Explicitly set to null if undefined
    };

    console.log('[AI Fish Group Chat] Saving group chat session with variables:', {
        topic: variables.topic,
        participant_count: variables.participant_fish_ids.length,
        initiator_user_id: variables.initiator_user_id,
        expires_at: variables.expires_at
    });

    try {
        const result = await executeGraphQL(mutation, variables);
        if (result.errors) {
            console.error('[AI Fish Group Chat] GraphQL errors:', result.errors);
            throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
        }
        
        const savedSession = result.data.insert_group_chat_one;
        console.log('[AI Fish Group Chat] Session saved successfully:', {
            id: savedSession.id,
            created_at: savedSession.created_at,
            initiator_user_id: savedSession.initiator_user_id
        });
        
        return savedSession.id;
    } catch (error) {
        console.error('[AI Fish Group Chat] Failed to save session:', error);
        console.error('[AI Fish Group Chat] Error details:', {
            message: error.message,
            stack: error.stack,
            initiatorUserId: initiatorUserId
        });
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
        console.log('[AI Fish Group Chat] Starting generation...');

        // Get participant count from global params
        const participantCount = await getGlobalParamInt('fish_chat_participant_count', 5);
        console.log('[AI Fish Group Chat] Participant count:', participantCount);

        // Get tank fish IDs and user ID from request body (if provided)
        let tankFishIds = null;
        let requestUserId = null;
        if (req.method === 'POST') {
            // Parse request body if it's a string (Vercel may not auto-parse)
            let body = req.body;
            if (typeof body === 'string') {
                try {
                    body = JSON.parse(body);
                } catch (e) {
                    console.warn('[AI Fish Group Chat] Failed to parse request body:', e);
                }
            }
            
            if (body && body.tankFishIds && Array.isArray(body.tankFishIds) && body.tankFishIds.length > 0) {
                tankFishIds = body.tankFishIds;
                console.log('[AI Fish Group Chat] Using provided tank fish IDs:', tankFishIds.length);
            }
            
            // Get user ID from request body (preferred method)
            if (body && body.userId) {
                requestUserId = body.userId;
                console.log('[AI Fish Group Chat] Using provided user ID from request:', requestUserId);
            }
        }

        // Select random fish (only from current tank if tankFishIds provided)
        let fishArray;
        try {
            fishArray = await selectRandomFish(participantCount, tankFishIds);
            console.log('[AI Fish Group Chat] Selected fish:', fishArray.map(f => f.fish_name));
        } catch (error) {
            throw error; // Re-throw errors
        }

        // Get user ID: priority 1) from request body, 2) from first fish
        // For multi-user tanks, we use the requesting user (from request) or first fish's owner
        let requestingUserId = requestUserId || fishArray[0]?.user_id;
        
        console.log('[AI Fish Group Chat] Requesting user ID:', requestingUserId, '(from request:', !!requestUserId, ', from fish:', !!fishArray[0]?.user_id, ')');
        console.log('[AI Fish Group Chat] Selected fish user IDs:', fishArray.map(f => ({ fishName: f.fish_name, userId: f.user_id, userLanguage: f.user_language })));
        
        if (!requestingUserId) {
            console.warn('[AI Fish Group Chat] ⚠️ No user ID found (neither from request nor from fish), allowing request but will not save initiator_user_id');
        } else {
            // Check if user has reached daily limit (for free users)
            const limitCheck = await checkUserGroupChatLimit(requestingUserId);
            console.log('[AI Fish Group Chat] Limit check result:', limitCheck);
            
            if (!limitCheck.allowed) {
                // Free user has reached daily limit
                return res.status(200).json({
                    success: false,
                    error: 'Daily limit reached',
                    message: `Free members can generate AI Fish Group Chat ${limitCheck.usage}/${limitCheck.limit} times per day.`,
                    upgradeSuggestion: 'Upgrade to Plus or Premium membership for unlimited AI Fish Group Chat',
                    useFallback: true,
                    limitInfo: {
                        usage: limitCheck.usage,
                        limit: limitCheck.limit,
                        tier: limitCheck.tier
                    }
                });
            }
        }

        // Generate chat using Coze (with initiator's language preference)
        const chatResult = await generateGroupChat(fishArray, requestingUserId);

        console.log('[AI Fish Group Chat] Generation successful!');

        // Save to database with initiator user ID
        let sessionId = null;
        try {
            console.log('[AI Fish Group Chat] Saving session with initiator_user_id:', requestingUserId);
            sessionId = await saveGroupChatSession(chatResult, fishArray, requestingUserId);
            console.log('[AI Fish Group Chat] ✅ Session saved successfully:', sessionId, 'with initiator_user_id:', requestingUserId);
        } catch (saveError) {
            console.error('[AI Fish Group Chat] ❌ Failed to save session, continuing anyway:', saveError);
            console.error('[AI Fish Group Chat] Save error details:', {
                error: saveError.message,
                stack: saveError.stack,
                initiatorUserId: requestingUserId
            });
            // Continue even if save fails
        }

        return res.status(200).json({
            success: true,
            sessionId,
            ...chatResult,
            participants: fishArray
        });

    } catch (error) {
        console.error('[AI Fish Group Chat] Error:', error);

        return res.status(500).json({
            success: false,
            error: 'Failed to generate AI Fish Group Chat',
            details: error.message
        });
    }
};


