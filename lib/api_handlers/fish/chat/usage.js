/**
 * 获取用户群聊使用情况 API
 * GET /api/fish/chat/usage
 * 
 * 返回当前用户的群聊使用情况（使用次数和限制）
 */

require('dotenv').config({ path: '.env.local' });
const { executeGraphQL } = require('../../../hasura');

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
        return 0; // Return 0 on error
    }
    
    const count = result.data.group_chat_aggregate?.aggregate?.count || 0;
    return count;
}

/**
 * Get user's subscription tier
 * @param {string} userId - User ID
 * @returns {Promise<string>} - User tier: 'free', 'plus', or 'premium'
 */
async function getUserTier(userId) {
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
        return 'free'; // Default to free on error
    }
    
    const user = result.data.users_by_pk;
    if (!user) {
        return 'free'; // Default to free if user not found
    }
    
    const activeSubscription = user.user_subscriptions && user.user_subscriptions.length > 0
        ? user.user_subscriptions[0]
        : null;
    
    return activeSubscription ? activeSubscription.plan : 'free';
}

/**
 * Get user's group chat daily limit from member_types table
 * @param {string} userId - User ID
 * @returns {Promise<{limit: number|null, unlimited: boolean}>} - Limit number or null for unlimited
 */
async function getUserGroupChatLimit(userId) {
    const query = `
        query GetUserGroupChatLimit($userId: String!) {
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
        console.error('[AI Fish Group Chat] Failed to get user group chat limit:', result.errors);
        // Default to 5 for free users if query fails
        return { limit: 5, unlimited: false };
    }
    
    const user = result.data.users_by_pk;
    if (!user) {
        // Default to 5 for free users if user not found
        return { limit: 5, unlimited: false };
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
        return { limit: null, unlimited: true };
    }
    
    // For plus/premium/admin, if limit is not explicitly set, they are unlimited
    if ((tier === 'plus' || tier === 'premium' || tier === 'admin') && 
        (groupChatDailyLimit === null || groupChatDailyLimit === '')) {
        return { limit: null, unlimited: true };
    }
    
    // Parse limit from member_types.group_chat_daily_limit
    if (groupChatDailyLimit && groupChatDailyLimit !== 'unlimited') {
        const parsedLimit = parseInt(groupChatDailyLimit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
            console.log(`[AI Fish Group Chat] Using limit from member_types: ${parsedLimit}`);
            return { limit: parsedLimit, unlimited: false };
        } else {
            console.warn(`[AI Fish Group Chat] Invalid limit value: ${groupChatDailyLimit}, cannot parse as integer`);
        }
    }
    
    // Default to 5 if not set or invalid in member_types
    const defaultLimit = 5;
    console.log(`[AI Fish Group Chat] Using default limit: ${defaultLimit} (group_chat_daily_limit was: ${groupChatDailyLimit})`);
    return { limit: defaultLimit, unlimited: false };
}

/**
 * Main API handler
 */
module.exports = async (req, res) => {
    // Only accept GET
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method Not Allowed'
        });
    }

    try {
        // Get user ID from query parameter or Authorization header
        let userId = req.query.userId;
        
        // If no userId in query, try to get from Authorization header
        if (!userId) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                // For now, we'll require userId in query parameter
                // In the future, we can decode the token to get userId
            }
        }
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing userId parameter'
            });
        }

        // Get user tier
        const tier = await getUserTier(userId);
        
        // Get usage and limit from member_types.group_chat_daily_limit
        const limitInfo = await getUserGroupChatLimit(userId);
        const usage = await getUserDailyGroupChatUsage(userId);
        
        console.log(`[AI Fish Group Chat Usage] User ${userId} (${tier}): ${usage}/${limitInfo.limit || 'unlimited'} (from member_types: ${limitInfo.unlimited ? 'unlimited' : limitInfo.limit})`);

        return res.status(200).json({
            success: true,
            usage: usage,
            limit: limitInfo.limit,
            tier: tier,
            unlimited: limitInfo.unlimited
        });
    } catch (error) {
        console.error('[AI Fish Group Chat] Error getting usage:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get usage',
            details: error.message
        });
    }
};

