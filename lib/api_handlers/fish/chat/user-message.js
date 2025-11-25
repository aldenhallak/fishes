/**
 * User Chat Message API
 * 
 * Handles user messages in group chat sessions.
 * Users can send messages and AI fish will reply.
 * 
 * 重构说明：
 * - 使用conversation管理模块
 * - 支持自动过期处理（方案B）
 * - 简化代码逻辑
 */

require('dotenv').config({ path: '.env.local' });
const { executeGraphQL } = require('../../../hasura');
const { extractUserId } = require('../../middleware/auth');
const conversationManager = require('../../../coze-conversation-manager');
const { getGlobalParamInt } = require('../../../global-params');

/**
 * Get group chat session by ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} - Group chat session data
 */
async function getGroupChatSession(sessionId) {
    const query = `
        query GetGroupChatSession($sessionId: uuid!) {
            group_chat_by_pk(id: $sessionId) {
                id
                topic
                participant_fish_ids
                dialogues
                user_talk
                initiator_user_id
            }
        }
    `;
    
    const result = await executeGraphQL(query, { sessionId });
    
    if (result.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }
    
    return result.data.group_chat_by_pk;
}

/**
 * Get fish array from participant fish IDs
 * @param {Array} fishIds - Array of fish IDs
 * @returns {Promise<Array>} - Array of fish data
 */
async function getFishArrayFromIds(fishIds) {
    if (!fishIds || fishIds.length === 0) {
        throw new Error('No participant fish IDs provided');
    }
    
    const query = `
        query GetFishArray($fishIds: [uuid!]!) {
            fish(
                where: { 
                    id: { _in: $fishIds }
                }
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
    
    const result = await executeGraphQL(query, { fishIds });
    
    if (result.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }
    
    const fishes = result.data.fish || [];
    
    // Transform to fish_array format
    // 注意：user_language和user_id是用户数据，不应该包含在fish_array中
    return fishes.map(fish => ({
        fish_id: fish.id,
        fish_name: fish.fish_name || 'Unnamed',
        personality: fish.personality || 'cheerful',
        feeder_name: fish.user?.feeder_name || null,
        feeder_info: fish.user?.feeder_info || null
        // 不包含 user_language 和 user_id（这些是用户数据，不是鱼的数据）
    }));
}

/**
 * Update user_talk field in group_chat table
 * @param {string} sessionId - Session ID
 * @param {Object} userMessageData - User message data with AI replies
 * @returns {Promise<Array>} - Updated user_talk array
 */
async function updateUserTalk(sessionId, userMessageData) {
    // Get current user_talk
    const session = await getGroupChatSession(sessionId);
    if (!session) {
        throw new Error('Group chat session not found');
    }
    
    // Parse existing user_talk (String type, stores plain text)
    // 支持旧格式（JSON数组）和新格式（纯文本）
    let existingText = '';
    if (session.user_talk) {
        try {
            // 尝试解析为JSON数组（兼容旧格式）
            const parsed = JSON.parse(session.user_talk);
            if (Array.isArray(parsed)) {
                // 旧格式：JSON数组，转换为换行分隔的文本
                existingText = parsed.filter(msg => typeof msg === 'string').join('\n');
            } else if (typeof parsed === 'string') {
                existingText = parsed;
            }
        } catch (error) {
            // 不是JSON，直接作为文本使用
            existingText = session.user_talk;
        }
    }
    
    // 提取新消息文本
    const messageText = typeof userMessageData === 'string' 
        ? userMessageData 
        : (userMessageData.userMessage || userMessageData.message || String(userMessageData));
    const newMessage = messageText.trim();
    
    // 追加新消息（用换行符连接）
    const updatedText = existingText 
        ? `${existingText}\n${newMessage}`
        : newMessage;
    
    // Update database
    const mutation = `
        mutation UpdateUserTalk($sessionId: uuid!, $userTalk: String!) {
            update_group_chat_by_pk(
                pk_columns: { id: $sessionId }
                _set: { user_talk: $userTalk }
            ) {
                id
                user_talk
            }
        }
    `;
    
    const result = await executeGraphQL(mutation, {
        sessionId,
        userTalk: updatedText
    });
    
    if (result.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }
    
    return updatedText;
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
        // 关键日志：用户发送聊天请求
        console.log('************用户发送聊天请求************');
        console.log('[User Chat Message] Request method:', req.method);
        console.log('[User Chat Message] Request body:', JSON.stringify(req.body, null, 2));
        console.log('[User Chat Message] Has Authorization header:', !!req.headers.authorization);

        // Extract user ID
        const userIdInfo = await extractUserId(req);
        console.log('[User Chat Message] Extracted userId:', userIdInfo.userId, 'source:', userIdInfo.source);
        
        if (!userIdInfo.userId) {
            console.warn('[User Chat Message] ⚠️ No user ID found, request denied');
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Authentication required. Please log in to send messages.',
                requiresAuth: true
            });
        }
        
        const requestUserId = userIdInfo.userId;

        // Parse request body
        let body = req.body;
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                console.warn('[User Chat Message] Failed to parse request body:', e);
                return res.status(400).json({
                    success: false,
                    error: 'Invalid request body'
                });
            }
        }

        const { sessionId, userMessage, userId, userName, tankFishIds, conversationId } = body;

        // Validate parameters
        // sessionId 现在是可选的，如果不存在，后端会自动创建会话
        if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid userMessage'
            });
        }

        if (userMessage.length > 200) {
            return res.status(400).json({
                success: false,
                error: 'Message is too long (max 200 characters)'
            });
        }

        // Verify userId matches authenticated user
        if (userId && userId !== requestUserId) {
            console.warn('[User Chat Message] ⚠️ User ID mismatch:', { userId, requestUserId });
            return res.status(403).json({
                success: false,
                error: 'User ID mismatch'
            });
        }

        const finalUserId = userId || requestUserId;
        
        // 如果userName没有提供，从数据库查询users表的nick_name
        let finalUserName = userName;
        if (!finalUserName && finalUserId) {
            try {
                const userQuery = `
                    query GetUserNickName($userId: String!) {
                        users_by_pk(id: $userId) {
                            nick_name
                            feeder_name
                        }
                    }
                `;
                const userResult = await executeGraphQL(userQuery, { userId: finalUserId });
                if (userResult.data && userResult.data.users_by_pk) {
                    finalUserName = userResult.data.users_by_pk.nick_name || 
                                   userResult.data.users_by_pk.feeder_name || 
                                   'User';
                    console.log('[User Chat Message] Retrieved user name from database:', finalUserName);
                } else {
                    finalUserName = 'User';
                }
            } catch (error) {
                console.warn('[User Chat Message] Failed to get user name from database, using default:', error);
                finalUserName = 'User';
            }
        } else if (!finalUserName) {
            finalUserName = 'User';
        }

        // 获取tankFishIds
        if (!tankFishIds || !Array.isArray(tankFishIds) || tankFishIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No tank fish IDs provided. Please provide tankFishIds in request body.'
            });
        }
        
        // 获取全局参数：参与鱼的数量限制
        const maxParticipants = await getGlobalParamInt('fish_chat_participant_count', 3);
        
        console.log('[User Chat Message] 参与鱼数量限制', {
            totalFish: tankFishIds.length,
            maxParticipants,
            willLimit: tankFishIds.length > maxParticipants
        });
        
        // 限制参与鱼的数量
        let selectedFishIds = tankFishIds;
        if (tankFishIds.length > maxParticipants) {
            // 随机选择指定数量的鱼
            selectedFishIds = [...tankFishIds]
                .sort(() => Math.random() - 0.5)
                .slice(0, maxParticipants);
            
            console.log('[User Chat Message] ✅ 已限制参与鱼数量', {
                from: tankFishIds.length,
                to: selectedFishIds.length,
                selectedIds: selectedFishIds
            });
        }
        
        console.log('[User Chat Message] 发送消息', {
            conversationId: conversationId || '(will create new)',
            userMessage: userMessage.substring(0, 50),
            userName: finalUserName,
            fishCount: selectedFishIds.length
        });
        
        // 使用conversation管理器发送消息（自动处理过期）
        const result = await conversationManager.sendMessageWithAutoRenew(
            conversationId,
            userMessage.trim(),
            finalUserId,
            selectedFishIds,
            finalUserName,
            'User Chat'
        );
        
        // 准备 user_talk 数据：只保存用户消息文本（纯字符串）
        // 如果有历史消息，用换行符连接；否则只保存当前消息
        const userTalkText = userMessage.trim();
        
        // 保存到group_chat表
        const mutation = `
            mutation SaveGroupChat(
                $topic: String!
                $time_of_day: String
                $participant_fish_ids: [uuid!]!
                $dialogues: jsonb!
                $display_duration: Int!
                $expires_at: timestamp!
                $initiator_user_id: String
                $conversation_id: uuid
                $user_talk: String
            ) {
                insert_group_chat_one(object: {
                    topic: $topic
                    time_of_day: $time_of_day
                    participant_fish_ids: $participant_fish_ids
                    dialogues: $dialogues
                    display_duration: $display_duration
                    expires_at: $expires_at
                    initiator_user_id: $initiator_user_id
                    conversation_id: $conversation_id
                    user_talk: $user_talk
                }) {
                    id
                    conversation_id
                    user_talk
                }
            }
        `;
        
        // Determine time of day
        const hour = new Date().getHours();
        const timeOfDay = hour >= 6 && hour < 12 ? 'morning' : 
                        hour >= 12 && hour < 18 ? 'afternoon' : 
                        hour >= 18 && hour < 22 ? 'evening' : 'night';
        
        // Calculate expires_at (30 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        // 确保 conversationId 是有效的 UUID 或 null
        let conversationIdValue = result.conversationId || null;
        if (conversationIdValue && typeof conversationIdValue !== 'string') {
            console.warn('[User Chat Message] conversationId is not a string, converting:', conversationIdValue);
            conversationIdValue = String(conversationIdValue);
        }
        
        const saveResult = await executeGraphQL(mutation, {
            topic: result.topic || 'User Chat',
            time_of_day: timeOfDay,
            participant_fish_ids: selectedFishIds,  // 使用选中的鱼ID
            dialogues: { messages: result.dialogues || [] },
            display_duration: (result.dialogues || []).length * 6 || 30,
            expires_at: expiresAt.toISOString(),
            initiator_user_id: finalUserId,
            conversation_id: conversationIdValue,
            user_talk: userTalkText
        });
        
        if (saveResult.errors) {
            throw new Error(`Failed to save session: ${JSON.stringify(saveResult.errors)}`);
        }
        
        const newSessionId = saveResult.data.insert_group_chat_one.id;
        const savedConversationId = saveResult.data.insert_group_chat_one.conversation_id;
        const savedUserTalk = saveResult.data.insert_group_chat_one.user_talk;
        
        console.log('[User Chat Message] ✅ 消息发送成功', {
            sessionId: newSessionId,
            conversationId: savedConversationId,
            userTalkSaved: !!savedUserTalk,
            isNewConversation: result.isNewConversation
        });
        
        // 验证保存的数据
        if (!savedConversationId && result.conversationId) {
            console.warn('[User Chat Message] ⚠️ conversation_id 未正确保存', {
                expected: result.conversationId,
                saved: savedConversationId
            });
        }
        if (!savedUserTalk) {
            console.warn('[User Chat Message] ⚠️ user_talk 未正确保存');
        }
        
        // 准备响应数据
        const responseData = {
            success: true,
            sessionId: newSessionId,
            conversationId: result.conversationId,
            isNewConversation: result.isNewConversation,
            aiReplies: result.dialogues || []
        };
        
        return res.status(200).json(responseData);

    } catch (error) {
        console.error('[User Chat Message] Error:', error);

        return res.status(500).json({
            success: false,
            error: 'Failed to process user message',
            details: error.message
        });
    }
};

