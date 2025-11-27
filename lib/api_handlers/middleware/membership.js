require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

// 添加调试日志
console.log('=== Membership Middleware配置 ===');
console.log('HASURA_ENDPOINT:', HASURA_GRAPHQL_ENDPOINT ? '已设置' : '未设置');
console.log('HASURA_ADMIN_SECRET:', HASURA_ADMIN_SECRET ? '已设置' : '未设置');
console.log('================================');

async function queryHasura(query, variables = {}) {
    if (!HASURA_GRAPHQL_ENDPOINT || !HASURA_ADMIN_SECRET) {
        console.error('❌ Hasura配置缺失:');
        console.error('  HASURA_ENDPOINT:', HASURA_GRAPHQL_ENDPOINT);
        console.error('  HASURA_ADMIN_SECRET:', HASURA_ADMIN_SECRET ? '已设置' : '未设置');
        throw new Error('Hasura配置缺失，请检查环境变量');
    }

    try {
        console.log('🔍 Membership查询Hasura:', HASURA_GRAPHQL_ENDPOINT);
        console.log('  变量:', JSON.stringify(variables, null, 2));
        
        const response = await fetch(HASURA_GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': HASURA_ADMIN_SECRET
            },
            body: JSON.stringify({ query, variables })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ HTTP错误:', response.status, response.statusText);
            console.error('  响应:', errorText);
            throw new Error(`Hasura query failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        
        if (result.errors) {
            console.error('❌ GraphQL错误:', result.errors);
            throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
        }

        console.log('✅ 查询成功');
        return result.data;
    } catch (error) {
        console.error('❌ queryHasura失败:', error.message);
        throw error;
    }
}

/**
 * 获取用户会员信息和权限
 * 从 member_types 表读取权益配置（替代 global_params）
 * 优先使用 GraphQL 关联查询（如果外键已建立），否则使用手动匹配
 */
async function getUserMembership(userId) {
    // 查询用户的最新活跃订阅（支持多个订阅）
    const queryWithRelation = `
        query GetUserMembership($userId: String!) {
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
                        name
                        max_fish_count
                        draw_fish_limit
                        add_to_my_tank_limit
                        can_self_talk
                        can_group_chat
                        can_promote_owner
                        promote_owner_frequency
                        lead_topic_frequency
                    }
                }
                fishes_aggregate {
                    aggregate {
                        count
                    }
                }
            }
            global_params(where: {key: {_in: ["default_chat_frequency", "premium_chat_frequency_min", "premium_chat_frequency_max"]}}) {
                key
                value
            }
        }
    `;
    
    let data;
    let useRelation = false;
    
    try {
        data = await queryHasura(queryWithRelation, { userId });
        
        // 检查是否成功获取了关联数据
        if (data.users_by_pk && 
            data.users_by_pk.user_subscriptions && 
            data.users_by_pk.user_subscriptions.length > 0 &&
            data.users_by_pk.user_subscriptions[0].member_type) {
            useRelation = true;
            console.log('✅ Using GraphQL relation query for member_types');
        }
    } catch (error) {
        // 如果关联查询失败（可能外键还未建立），使用手动匹配方式
        console.log('⚠️ Relation query failed, using manual matching:', error.message);
        useRelation = false;
    }
    
    // 如果关联查询失败，使用手动匹配方式
    if (!useRelation) {
        const queryManual = `
            query GetUserMembership($userId: String!) {
                users_by_pk(id: $userId) {
                    id
                    user_subscriptions(
                        where: { is_active: { _eq: true } }
                        order_by: { created_at: desc }
                        limit: 1
                    ) {
                        plan
                    }
                    fishes_aggregate {
                        aggregate {
                            count
                        }
                    }
                }
                member_types {
                    id
                    name
                    max_fish_count
                    draw_fish_limit
                    add_to_my_tank_limit
                    can_self_talk
                    can_group_chat
                    can_promote_owner
                    promote_owner_frequency
                    lead_topic_frequency
                }
                global_params(where: {key: {_in: ["default_chat_frequency", "premium_chat_frequency_min", "premium_chat_frequency_max"]}}) {
                    key
                    value
                }
            }
        `;
        
        try {
            data = await queryHasura(queryManual, { userId });
        } catch (error) {
            console.error('❌ Query member_types failed, using fallback:', error.message);
            return await getUserMembershipFallback(userId);
        }
    }
    
    const user = data.users_by_pk;
    const globalParams = data.global_params || [];
    
    let memberType = null;
    let tier = 'free';
    
    // 获取最新的活跃订阅（数组的第一个元素）
    const activeSubscription = user && user.user_subscriptions && user.user_subscriptions.length > 0 
        ? user.user_subscriptions[0] 
        : null;
    
    if (useRelation && activeSubscription && activeSubscription.member_type) {
        // 使用关联查询的结果
        memberType = activeSubscription.member_type;
        tier = memberType.id;
    } else if (activeSubscription && activeSubscription.plan) {
        // 使用手动匹配
        const memberTypes = data.member_types || [];
        const memberTypesMap = {};
        memberTypes.forEach(mt => {
            memberTypesMap[mt.id] = mt;
        });
        
        tier = activeSubscription.plan;
        memberType = memberTypesMap[tier] || memberTypesMap['free'] || null;
        
        // 如果 member_types 表为空，fallback 到 global_params
        if (!memberType && memberTypes.length === 0) {
            console.warn('⚠️ member_types table is empty, using global_params fallback');
            return await getUserMembershipFallback(userId);
        }
    } else {
        // 用户没有订阅，使用 free 会员类型
        const memberTypes = data.member_types || [];
        const memberTypesMap = {};
        memberTypes.forEach(mt => {
            memberTypesMap[mt.id] = mt;
        });
        
        tier = 'free';
        memberType = memberTypesMap['free'] || null;
        
        // 如果 member_types 表为空，fallback 到 global_params
        if (!memberType && memberTypes.length === 0) {
            console.warn('⚠️ member_types table is empty, using global_params fallback');
            return await getUserMembershipFallback(userId);
        }
    }

    const currentFishCount = user ? user.fishes_aggregate.aggregate.count : 0;
    
    // 从 global_params 获取聊天频率相关配置（这些不在 member_types 表中）
    const params = globalParams.reduce((acc, param) => {
        acc[param.key] = parseInt(param.value, 10);
        return acc;
    }, {});
    
    const defaultChatFrequency = params.default_chat_frequency || 5;
    const chatFrequencyMin = params.premium_chat_frequency_min || 1;
    const chatFrequencyMax = params.premium_chat_frequency_max || 10;

    // 解析 add_to_my_tank_limit（可能是字符串，需要转换为整数）
    let addToMyTankLimit = 5; // 默认值 5
    if (memberType && memberType.add_to_my_tank_limit !== null && memberType.add_to_my_tank_limit !== undefined) {
        const parsed = parseInt(memberType.add_to_my_tank_limit, 10);
        if (!isNaN(parsed) && parsed > 0) {
            addToMyTankLimit = parsed;
        }
    }
    
    // 调试日志
    console.log('🔍 [Membership] add_to_my_tank_limit:', {
        raw: memberType?.add_to_my_tank_limit,
        parsed: addToMyTankLimit,
        memberTypeId: memberType?.id,
        tier
    });

    return {
        userId,
        tier,
        currentFishCount,
        maxFishCount: memberType ? memberType.max_fish_count : 1,
        drawFishLimit: memberType ? memberType.draw_fish_limit : '1', // 新增：每日画鱼限制
        addToMyTankLimit, // 新增：收藏限制
        canSpeak: memberType ? memberType.can_self_talk : false,
        canSelfTalk: memberType ? memberType.can_self_talk : false,
        canGroupChat: memberType ? memberType.can_group_chat : false,
        canPromoteOwner: memberType ? memberType.can_promote_owner : false,
        promoteOwnerFrequency: memberType ? memberType.promote_owner_frequency : 0,
        leadTopicFrequency: memberType ? memberType.lead_topic_frequency : 0,
        canAdjustFrequency: tier === 'premium', // Premium 专属功能
        defaultChatFrequency,
        chatFrequencyMin,
        chatFrequencyMax,
        memberTypeName: memberType ? memberType.name : 'Free',
        isAdmin: tier === 'admin' // 新增管理员标识
    };
}

/**
 * Fallback 函数：使用 global_params 表（向后兼容）
 */
async function getUserMembershipFallback(userId) {
    const query = `
        query GetUserMembershipFallback($userId: String!) {
            users_by_pk(id: $userId) {
                id
                user_subscriptions(
                    where: { is_active: { _eq: true } }
                    order_by: { created_at: desc }
                    limit: 1
                ) {
                    plan
                }
                fishes_aggregate {
                    aggregate {
                        count
                    }
                }
            }
            global_params(where: {key: {_in: ["free_max_fish", "plus_max_fish", "premium_max_fish", "default_chat_frequency", "premium_chat_frequency_min", "premium_chat_frequency_max"]}}) {
                key
                value
            }
        }
    `;
    const data = await queryHasura(query, { userId });
    const user = data.users_by_pk;
    const globalParams = data.global_params;

    const params = globalParams.reduce((acc, param) => {
        acc[param.key] = parseInt(param.value, 10);
        return acc;
    }, {});

    let tier = 'free';
    // 获取最新的活跃订阅
    const activeSubscription = user && user.user_subscriptions && user.user_subscriptions.length > 0 
        ? user.user_subscriptions[0] 
        : null;
    if (activeSubscription && activeSubscription.plan) {
        tier = activeSubscription.plan;
    }

    const currentFishCount = user ? user.fishes_aggregate.aggregate.count : 0;
    let maxFishCount = params.free_max_fish || 1;
    let canSpeak = false;
    let canAdjustFrequency = false;
    let defaultChatFrequency = params.default_chat_frequency || 5;
    let chatFrequencyMin = params.premium_chat_frequency_min || 1;
    let chatFrequencyMax = params.premium_chat_frequency_max || 10;

    if (tier === 'plus') {
        maxFishCount = params.plus_max_fish || 5;
        canSpeak = true;
    } else if (tier === 'premium') {
        maxFishCount = params.premium_max_fish || 20;
        canSpeak = true;
        canAdjustFrequency = true;
    }

    // Fallback 的收藏限制（基于等级）
    let addToMyTankLimit = 5; // Free 默认值
    if (tier === 'plus') {
        addToMyTankLimit = 20;
    } else if (tier === 'premium') {
        addToMyTankLimit = 100;
    } else if (tier === 'admin') {
        addToMyTankLimit = 999;
    }

    return {
        userId,
        tier,
        currentFishCount,
        maxFishCount,
        drawFishLimit: tier === 'admin' ? 'unlimited' : (tier === 'premium' ? 'unlimited' : (tier === 'plus' ? '10' : '1')), // 新增：每日画鱼限制
        addToMyTankLimit, // 新增：收藏限制
        canSpeak,
        canSelfTalk: canSpeak,
        canGroupChat: canSpeak, // Fallback: Plus+ 可以群聊
        canPromoteOwner: canSpeak, // Fallback: Plus+ 可以宣传
        promoteOwnerFrequency: tier === 'premium' ? 5 : (tier === 'plus' ? 2 : 0),
        leadTopicFrequency: tier === 'premium' ? 3 : (tier === 'plus' ? 1 : 0),
        canAdjustFrequency,
        defaultChatFrequency,
        chatFrequencyMin,
        chatFrequencyMax,
        memberTypeName: tier === 'premium' ? 'Premium' : (tier === 'plus' ? 'Plus' : 'Free')
    };
}

/**
 * 检查用户会员等级
 */
async function checkMembershipTier(userId) {
    return await getUserMembership(userId);
}

/**
 * 检查用户是否可以创建更多鱼
 */
async function canCreateFish(userId) {
    const membership = await getUserMembership(userId);
    const canCreate = membership.currentFishCount < membership.maxFishCount;
    let reason = '';
    let upgradeSuggestion = '';
    
    if (!canCreate) {
        if (membership.tier === 'free') {
            upgradeSuggestion = 'Upgrade to Plus to create 5 fish, or Premium to create 20 fish';
        } else if (membership.tier === 'plus') {
            upgradeSuggestion = 'Upgrade to Premium to create 20 fish';
        }
        reason = `You have reached the fish limit for ${membership.memberTypeName} membership (${membership.maxFishCount} fish). ${upgradeSuggestion}`;
    }
    
    return {
        canCreate,
        reason,
        tier: membership.tier,
        currentCount: membership.currentFishCount,
        maxCount: membership.maxFishCount,
        upgradeSuggestion
    };
}

/**
 * 检查用户今天是否可以继续画鱼（基于每日限量）
 * @param {string} userId - 用户ID
 * @returns {Promise<{canCreate: boolean, reason: string, currentCount: number, maxLimit: string, tier: string, memberTypeName: string}>}
 */
async function canDrawFishToday(userId) {
    const membership = await getUserMembership(userId);
    
    // 获取今天的开始时间（UTC时区，00:00:00）
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    // 查询今天创建的鱼数量
    const query = `
        query GetTodayFishCount($userId: String!, $todayStart: timestamp!) {
            fish_aggregate(
                where: {
                    user_id: { _eq: $userId }
                    created_at: { _gte: $todayStart }
                }
            ) {
                aggregate {
                    count
                }
            }
        }
    `;
    
    const data = await queryHasura(query, { userId, todayStart: todayISO });
    const todayCount = data.fish_aggregate.aggregate.count;
    
    const drawLimit = membership.drawFishLimit;
    
    // 🔧 修复：管理员不受任何限制
    if (membership.tier === 'admin' || membership.isAdmin) {
        console.log('🔐 管理员用户，跳过画鱼限制检查:', userId);
        return {
            canCreate: true,
            reason: 'Admin user - unlimited access',
            currentCount: todayCount,
            maxLimit: 'unlimited',
            tier: membership.tier,
            memberTypeName: membership.memberTypeName
        };
    }
    
    // 如果 draw_fish_limit 是 "unlimited" 或 null，则不限制
    if (!drawLimit || drawLimit === 'unlimited' || drawLimit === 'null') {
        return {
            canCreate: true,
            reason: '',
            currentCount: todayCount,
            maxLimit: 'unlimited',
            tier: membership.tier,
            memberTypeName: membership.memberTypeName
        };
    }
    
    // 转换为数字
    const maxLimit = parseInt(drawLimit, 10);
    const canCreate = todayCount < maxLimit;
    
    let reason = '';
    if (!canCreate) {
        if (membership.tier === 'free') {
            reason = `You have reached today's drawing limit for ${membership.memberTypeName} membership (${maxLimit} per day). Upgrade to draw more fish!`;
        } else {
            reason = `You have reached today's drawing limit (${maxLimit} per day). Please try again tomorrow.`;
        }
    }
    
    return {
        canCreate,
        reason,
        currentCount: todayCount,
        maxLimit: drawLimit,
        tier: membership.tier,
        memberTypeName: membership.memberTypeName
    };
}

/**
 * 检查鱼是否可以说话（Plus及以上会员）
 * @deprecated 使用 canFishSelfTalk 替代
 */
async function canFishSpeak(userId) {
    const membership = await getUserMembership(userId);
    return membership.canSpeak;
}

/**
 * 检查鱼是否可以自语
 */
async function canFishSelfTalk(userId) {
    const membership = await getUserMembership(userId);
    const canSelfTalk = membership.canSelfTalk;
    
    let reason = '';
    let upgradeSuggestion = '';
    
    if (!canSelfTalk) {
        if (membership.tier === 'free') {
            upgradeSuggestion = 'Upgrade to Plus or Premium membership to enable fish self-talk';
        }
        reason = `Your ${membership.memberTypeName} membership does not support fish self-talk. ${upgradeSuggestion}`;
    }
    
    return {
        canSelfTalk,
        reason,
        tier: membership.tier,
        upgradeSuggestion
    };
}

/**
 * 检查鱼是否可以参与群聊
 */
async function canFishGroupChat(userId) {
    const membership = await getUserMembership(userId);
    const canGroupChat = membership.canGroupChat;
    
    let reason = '';
    let upgradeSuggestion = '';
    
    if (!canGroupChat) {
        if (membership.tier === 'free') {
            upgradeSuggestion = 'Upgrade to Plus or Premium membership to enable fish group chat';
        }
        reason = `Your ${membership.memberTypeName} membership does not support fish group chat. ${upgradeSuggestion}`;
    }
    
    return {
        canGroupChat,
        reason,
        tier: membership.tier,
        upgradeSuggestion
    };
}

/**
 * 检查鱼是否可以宣传主人
 */
async function canFishPromoteOwner(userId) {
    const membership = await getUserMembership(userId);
    const canPromoteOwner = membership.canPromoteOwner;
    
    let reason = '';
    let upgradeSuggestion = '';
    
    if (!canPromoteOwner) {
        if (membership.tier === 'free') {
            upgradeSuggestion = 'Upgrade to Plus or Premium membership to enable fish owner promotion';
        }
        reason = `Your ${membership.memberTypeName} membership does not support fish owner promotion. ${upgradeSuggestion}`;
    }
    
    return {
        canPromoteOwner,
        reason,
        tier: membership.tier,
        promoteOwnerFrequency: membership.promoteOwnerFrequency,
        upgradeSuggestion
    };
}

/**
 * 获取宣传主人的频率
 */
async function getPromoteOwnerFrequency(userId) {
    const membership = await getUserMembership(userId);
    return membership.promoteOwnerFrequency;
}

/**
 * 获取主导话题的频率
 */
async function getLeadTopicFrequency(userId) {
    const membership = await getUserMembership(userId);
    return membership.leadTopicFrequency;
}

/**
 * 检查是否可以调节聊天频率（Premium会员）
 */
async function canAdjustChatFrequency(userId) {
    const membership = await getUserMembership(userId);
    return membership.canAdjustFrequency;
}

module.exports = {
    checkMembershipTier,
    canCreateFish,
    canDrawFishToday,
    canFishSpeak,
    canFishSelfTalk,
    canFishGroupChat,
    canFishPromoteOwner,
    getPromoteOwnerFrequency,
    getLeadTopicFrequency,
    canAdjustChatFrequency,
    getUserMembership
};

