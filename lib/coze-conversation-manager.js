/**
 * COZE Conversation Manager
 * 
 * 管理COZE对话上下文的生命周期
 * 采用方案B：被动处理 + 自动重试
 * 
 * 核心功能：
 * - 创建和获取conversation
 * - 自动处理过期（检测Coze API错误并重试）
 * - 可选的定期清理功能
 */

const { executeGraphQL } = require('./hasura');
const cozeClient = require('./coze-client');

/**
 * 创建新的conversation
 * @param {string} userId - 用户ID
 * @param {Array<string>} fishIds - 参与的鱼ID数组
 * @param {string} topic - 对话主题（可选）
 * @returns {Promise<Object>} - 创建的conversation对象
 */
async function createConversation(userId, fishIds, topic = null) {
    console.log('[Conversation Manager] 创建新conversation', {
        userId,
        fishCount: fishIds.length,
        topic
    });
    
    try {
        // 1. 调用Coze API创建conversation
        const cozeConversationId = await cozeClient.createCozeConversation();
        
        // 2. 保存到数据库
        const mutation = `
            mutation CreateConversation(
                $coze_conversation_id: String!
                $user_id: String
                $participant_fish_ids: [uuid!]!
                $topic: String
            ) {
                insert_conversations_one(
                    object: {
                        coze_conversation_id: $coze_conversation_id
                        user_id: $user_id
                        participant_fish_ids: $participant_fish_ids
                        topic: $topic
                        status: "active"
                        message_count: 0
                    }
                ) {
                    id
                    coze_conversation_id
                    user_id
                    participant_fish_ids
                    topic
                    status
                    created_at
                    expires_at
                }
            }
        `;
        
        const variables = {
            coze_conversation_id: cozeConversationId,
            user_id: userId || null,
            participant_fish_ids: fishIds,
            topic: topic || 'Fish Tank Chat'
        };
        
        const result = await executeGraphQL(mutation, variables);
        
        if (result.errors) {
            throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
        }
        
        const conversation = result.data.insert_conversations_one;
        
        console.log('[Conversation Manager] ✅ Conversation创建成功:', {
            id: conversation.id,
            coze_conversation_id: conversation.coze_conversation_id
        });
        
        return conversation;
        
    } catch (error) {
        console.error('[Conversation Manager] ❌ 创建conversation失败:', error);
        throw error;
    }
}

/**
 * 获取conversation
 * @param {string} conversationId - Conversation ID (数据库UUID)
 * @returns {Promise<Object|null>} - Conversation对象或null
 */
async function getConversation(conversationId) {
    const query = `
        query GetConversation($id: uuid!) {
            conversations_by_pk(id: $id) {
                id
                coze_conversation_id
                user_id
                participant_fish_ids
                topic
                status
                message_count
                created_at
                updated_at
                last_message_at
                expires_at
            }
        }
    `;
    
    const result = await executeGraphQL(query, { id: conversationId });
    
    if (result.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }
    
    return result.data.conversations_by_pk;
}

/**
 * 更新conversation
 * @param {string} conversationId - Conversation ID
 * @param {Object} updates - 要更新的字段
 * @returns {Promise<Object>} - 更新后的conversation
 */
async function updateConversation(conversationId, updates) {
    const mutation = `
        mutation UpdateConversation(
            $id: uuid!
            $updates: conversations_set_input!
        ) {
            update_conversations_by_pk(
                pk_columns: { id: $id }
                _set: $updates
            ) {
                id
                coze_conversation_id
                status
                message_count
                updated_at
                last_message_at
            }
        }
    `;
    
    const result = await executeGraphQL(mutation, {
        id: conversationId,
        updates
    });
    
    if (result.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }
    
    return result.data.update_conversations_by_pk;
}

/**
 * 标记conversation为过期
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} - 更新后的conversation
 */
async function expireConversation(conversationId) {
    console.log('[Conversation Manager] 标记conversation为过期:', conversationId);
    
    return await updateConversation(conversationId, {
        status: 'expired'
    });
}

/**
 * 将fish_id映射到fish_name
 * @param {Array} dialogues - 对话数组
 * @param {Array} fishDetails - 鱼详情数组
 * @returns {Array} - 包含鱼名称的对话数组
 */
function mapFishIdsToNames(dialogues, fishDetails) {
    const fishMap = {};
    fishDetails.forEach(fish => {
        fishMap[fish.fish_id] = fish.fish_name;
    });
    
    return dialogues.map(dialogue => ({
        ...dialogue,
        fishName: fishMap[dialogue.fishId] || dialogue.fishName || 'Unknown Fish'
    }));
}

/**
 * 获取鱼的详细信息
 * @param {Array<string>} fishIds - 鱼ID数组
 * @returns {Promise<Array>} - 鱼信息数组
 */
async function getFishDetails(fishIds) {
    const query = `
        query GetFishDetails($fishIds: [uuid!]!) {
            fish(where: { id: { _in: $fishIds } }) {
                id
                fish_name
                personality
                user {
                    feeder_name
                    feeder_info
                }
            }
        }
    `;
    
    const result = await executeGraphQL(query, { fishIds });
    
    if (result.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }
    
    return (result.data.fish || []).map(fish => {
        // 如果没有名字，使用ID后6位作为默认名称
        const defaultName = fish.fish_name || `Fish-${fish.id.slice(-6)}`;
        
        return {
            fish_id: fish.id,
            fish_name: defaultName,
            personality: fish.personality || 'cheerful',
            feeder_name: fish.user?.feeder_name || null,
            feeder_info: fish.user?.feeder_info || null
        };
    });
}

/**
 * 发送消息并自动处理过期（方案B核心逻辑）
 * 
 * 这是整个系统的核心函数：
 * 1. 直接使用conversationId调用Coze API
 * 2. 如果Coze返回过期错误，自动创建新conversation并重试
 * 3. 用户完全无感知
 * 
 * @param {string} conversationId - Conversation ID (可能为null)
 * @param {string} message - 用户消息（null表示自动发起）
 * @param {string} userId - 用户ID
 * @param {Array<string>} fishIds - 参与的鱼ID数组
 * @param {string} userName - 用户名（可选）
 * @param {string} topic - 对话主题（可选）
 * @returns {Promise<Object>} - { dialogues, conversationId, isNewConversation }
 */
async function sendMessageWithAutoRenew(
    conversationId,
    message,
    userId,
    fishIds,
    userName = null,
    topic = null
) {
    console.log('[Conversation Manager] 发送消息', {
        conversationId: conversationId || '(will create new)',
        hasMessage: !!message,
        userName,
        fishCount: fishIds.length
    });
    
    try {
        // 获取鱼的详细信息
        console.log('[Conversation Manager] 获取鱼详情', {
            fishIdsCount: fishIds.length,
            fishIds: fishIds.slice(0, 5)
        });
        
        const fishDetails = await getFishDetails(fishIds);
        
        console.log('[Conversation Manager] 鱼详情获取完成', {
            fishDetailsCount: fishDetails.length,
            fishNames: fishDetails.map(f => f.fish_name).slice(0, 5)
        });
        
        if (fishDetails.length === 0) {
            throw new Error('No valid fish found');
        }
        
        // 如果没有conversationId，先创建一个
        if (!conversationId) {
            console.log('[Conversation Manager] 首次对话，创建新conversation');
            const newConv = await createConversation(userId, fishIds, topic);
            conversationId = newConv.id;
            
            // 使用新conversation发送消息
            const result = await cozeClient.generateDialogueWithConversation(
                topic || 'Fish Tank Chat',
                fishDetails,
                newConv.coze_conversation_id,
                message,
                userName
            );
            
            // 更新消息计数
            await updateConversation(conversationId, {
                message_count: 1,
                last_message_at: new Date().toISOString()
            });
            
            // 将fish_id映射到fish_name
            const dialoguesWithNames = mapFishIdsToNames(result.dialogues, fishDetails);
            
            return {
                ...result,
                dialogues: dialoguesWithNames,
                conversationId,
                isNewConversation: true
            };
        }
        
        // 获取现有conversation
        const conversation = await getConversation(conversationId);
        
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        
        // 尝试使用现有conversation发送消息
        try {
            const result = await cozeClient.generateDialogueWithConversation(
                conversation.topic || 'Fish Tank Chat',
                fishDetails,
                conversation.coze_conversation_id,
                message,
                userName
            );
            
            // 更新消息计数和最后消息时间
            await updateConversation(conversationId, {
                message_count: (conversation.message_count || 0) + 1,
                last_message_at: new Date().toISOString()
            });
            
            console.log('[Conversation Manager] ✅ 消息发送成功（复用conversation）');
            
            // 将fish_id映射到fish_name
            const dialoguesWithNames = mapFishIdsToNames(result.dialogues, fishDetails);
            
            return {
                ...result,
                dialogues: dialoguesWithNames,
                conversationId,
                isNewConversation: false
            };
            
        } catch (error) {
            // 检查是否是Coze的过期错误
            if (cozeClient.isConversationExpiredError(error)) {
                console.log('[Conversation Manager] ⚠️ Coze conversation过期，自动创建新的');
                
                // 标记旧conversation为过期
                await expireConversation(conversationId);
                
                // 创建新conversation
                const newConv = await createConversation(userId, fishIds, conversation.topic);
                
                // 使用新conversation重试
                const result = await cozeClient.generateDialogueWithConversation(
                    newConv.topic || 'Fish Tank Chat',
                    fishDetails,
                    newConv.coze_conversation_id,
                    message,
                    userName
                );
                
                // 更新消息计数
                await updateConversation(newConv.id, {
                    message_count: 1,
                    last_message_at: new Date().toISOString()
                });
                
                console.log('[Conversation Manager] ✅ 自动重试成功（新conversation）');
                
                // 将fish_id映射到fish_name
                const dialoguesWithNames = mapFishIdsToNames(result.dialogues, fishDetails);
                
                return {
                    ...result,
                    dialogues: dialoguesWithNames,
                    conversationId: newConv.id,
                    isNewConversation: true
                };
            }
            
            // 其他错误直接抛出
            throw error;
        }
        
    } catch (error) {
        console.error('[Conversation Manager] ❌ 发送消息失败:', error);
        throw error;
    }
}

/**
 * 清理旧的过期conversations（可选功能）
 * 删除30天前的expired记录
 * 
 * @returns {Promise<number>} - 删除的记录数
 */
async function cleanupOldConversations() {
    console.log('[Conversation Manager] 开始清理旧conversations...');
    
    try {
        const mutation = `
            mutation CleanupOldConversations($cutoff_date: timestamptz!) {
                delete_conversations(
                    where: {
                        status: { _eq: "expired" }
                        updated_at: { _lt: $cutoff_date }
                    }
                ) {
                    affected_rows
                }
            }
        `;
        
        // 30天前的日期
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        
        const result = await executeGraphQL(mutation, {
            cutoff_date: cutoffDate.toISOString()
        });
        
        if (result.errors) {
            throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
        }
        
        const deletedCount = result.data.delete_conversations.affected_rows;
        
        console.log(`[Conversation Manager] ✅ 清理完成，删除了 ${deletedCount} 条记录`);
        
        return deletedCount;
        
    } catch (error) {
        console.error('[Conversation Manager] ❌ 清理失败:', error);
        throw error;
    }
}

module.exports = {
    createConversation,
    getConversation,
    updateConversation,
    expireConversation,
    sendMessageWithAutoRenew,
    cleanupOldConversations
};
