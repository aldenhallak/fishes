/**
 * 获取用户群聊使用情况 API
 * GET /api/fish/chat/usage
 * 
 * 返回当前用户的群聊使用情况（使用次数和限制）
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
        
        // Get usage and limit
        let usage = 0;
        let limit = null;
        
        if (tier === 'free') {
            // Free users have daily limit
            limit = await getGlobalParamInt('free_daily_group_chat_limit', 5);
            usage = await getUserDailyGroupChatUsage(userId);
        } else {
            // Plus and Premium users have unlimited access
            usage = await getUserDailyGroupChatUsage(userId);
            limit = null; // Unlimited
        }

        return res.status(200).json({
            success: true,
            usage: usage,
            limit: limit,
            tier: tier,
            unlimited: tier === 'plus' || tier === 'premium'
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

