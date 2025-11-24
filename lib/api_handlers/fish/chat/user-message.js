/**
 * User Chat Message API
 * 
 * Handles user messages in group chat sessions.
 * Users can send messages and AI fish will reply.
 */

require('dotenv').config({ path: '.env.local' });
const { executeGraphQL } = require('../../../hasura');
const { extractUserId } = require('../../middleware/auth');

// Lazy load generateGroupChat to avoid circular dependency issues
let generateGroupChat = null;
function getGenerateGroupChat() {
    if (!generateGroupChat) {
        try {
            const groupChatModule = require('./group');
            generateGroupChat = groupChatModule.generateGroupChat;
            if (!generateGroupChat) {
                throw new Error('generateGroupChat not found in group module');
            }
        } catch (error) {
            console.error('[User Chat Message] Failed to load generateGroupChat:', error);
            throw new Error('generateGroupChat function not available. Please check group.js exports.');
        }
    }
    return generateGroupChat;
}

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
    
    // Parse existing user_talk (String type, stores JSON string)
    let userTalkArray = [];
    if (session.user_talk) {
        try {
            userTalkArray = JSON.parse(session.user_talk);
            if (!Array.isArray(userTalkArray)) {
                userTalkArray = [];
            }
        } catch (error) {
            console.warn('[User Chat Message] Failed to parse existing user_talk, initializing as empty array:', error);
            userTalkArray = [];
        }
    }
    
    // Append new user message
    userTalkArray.push(userMessageData);
    
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
        userTalk: JSON.stringify(userTalkArray)
    });
    
    if (result.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }
    
    return userTalkArray;
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

        const { sessionId, userMessage, userId, userName, tankFishIds } = body;

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

        // Get group chat session (如果sessionId不存在，自动创建新会话)
        let session = null;
        if (sessionId) {
            session = await getGroupChatSession(sessionId);
            if (!session) {
                console.log('[User Chat Message] Session not found, will create new session');
                sessionId = null; // 重置为null，让代码自动创建
            }
        }
        
        // 如果没有sessionId，自动创建新会话
        if (!sessionId || !session) {
            console.log('[User Chat Message] 自动创建新会话（用户发送消息时）');
            
            // 获取tankFishIds（从请求体中）
            const tankFishIds = req.body.tankFishIds || null;
            
            // 如果没有提供tankFishIds，返回错误
            if (!tankFishIds || !Array.isArray(tankFishIds) || tankFishIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No tank fish IDs provided. Please provide tankFishIds in request body.'
                });
            }
            
            // 获取鱼数组
            const fishArray = await getFishArrayFromIds(tankFishIds);
            if (fishArray.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No valid fish found in tank'
                });
            }
            
            // 创建新会话（调用group-chat逻辑，但不包含userTalk）
            const generateGroupChatFn = getGenerateGroupChat();
            const chatResult = await generateGroupChatFn(fishArray, finalUserId, {}, null);
            
            // 保存会话到数据库
            // 从group.js模块导入saveGroupChatSession函数
            const groupModule = require('./group');
            // group.js导出的是mainHandler，saveGroupChatSession是内部函数
            // 我们需要直接调用group-chat API来创建会话，或者将saveGroupChatSession导出
            // 为了简化，我们直接调用内部逻辑
            const { executeGraphQL } = require('../../../hasura');
            
            // 手动保存会话（复制group.js中的saveGroupChatSession逻辑）
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
                    insert_group_chat_one(object: {
                        topic: $topic
                        time_of_day: $time_of_day
                        participant_fish_ids: $participant_fish_ids
                        dialogues: $dialogues
                        display_duration: $display_duration
                        expires_at: $expires_at
                        initiator_user_id: $initiator_user_id
                    }) {
                        id
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
            
            const saveResult = await executeGraphQL(mutation, {
                topic: chatResult.topic || 'User Chat',
                time_of_day: timeOfDay,
                participant_fish_ids: fishArray.map(f => f.fish_id),
                dialogues: { messages: chatResult.dialogues || [] },
                display_duration: (chatResult.dialogues || []).length * 6 || 30,
                expires_at: expiresAt.toISOString(),
                initiator_user_id: finalUserId
            });
            
            if (saveResult.errors) {
                throw new Error(`Failed to save session: ${JSON.stringify(saveResult.errors)}`);
            }
            
            sessionId = saveResult.data.insert_group_chat_one.id;
            
            // 获取新创建的会话
            session = await getGroupChatSession(sessionId);
            if (!session) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to create or retrieve chat session'
                });
            }
            
            console.log('[User Chat Message] ✅ 新会话已创建:', sessionId);
        }

        // Get fish array from participant_fish_ids
        const fishArray = await getFishArrayFromIds(session.participant_fish_ids);
        if (fishArray.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No participant fish found'
            });
        }

        // Generate AI reply using Coze API
        // Pass user_talk and user_name to generateGroupChat
        // Lazy load generateGroupChat to avoid circular dependency
        const generateGroupChatFn = getGenerateGroupChat();
        
        const optionsForGenerateGroupChat = {
            userTalk: userMessage.trim(),
            userName: finalUserName  // 确保传递userName，即使可能是'User'
        };
        
        // 存储调试信息，稍后返回给前端
        const debugInfo = {
            userMessage: userMessage.trim(),
            userName: finalUserName,
            timestamp: new Date().toISOString()
        };
        
        const chatResult = await generateGroupChatFn(fishArray, finalUserId, optionsForGenerateGroupChat, debugInfo);

        // Prepare user message data
        const userMessageData = {
            userId: finalUserId,
            userName: finalUserName,
            message: userMessage.trim(),
            timestamp: new Date().toISOString(),
            aiReplies: chatResult.dialogues || []
        };

        // Update user_talk field
        const updatedUserTalk = await updateUserTalk(sessionId, userMessageData);

        // 准备响应数据，包含调试信息供前端console显示
        const responseData = {
            success: true,
            sessionId: sessionId, // 返回sessionId，前端需要更新currentActiveSessionId
            userTalk: updatedUserTalk,
            aiReplies: chatResult.dialogues || []
        };
        
        // 如果有调试信息（用户发送的消息），添加到响应中
        if (debugInfo && debugInfo.cozeApiRequest) {
            responseData.debug = {
                message: '************用户发送聊天请求************',
                cozeApiRequest: debugInfo.cozeApiRequest,
                cozeApiResponse: debugInfo.cozeApiResponse
            };
        }
        
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

