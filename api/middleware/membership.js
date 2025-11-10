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
 */
async function getUserMembership(userId) {
    const query = `
        query GetUserMembership($userId: String!) {
            users_by_pk(id: $userId) {
                id
                user_subscription {
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
    if (user && user.user_subscription && user.user_subscription.plan) {
        tier = user.user_subscription.plan;
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

    return {
        userId,
        tier,
        currentFishCount,
        maxFishCount,
        canSpeak,
        canAdjustFrequency,
        defaultChatFrequency,
        chatFrequencyMin,
        chatFrequencyMax
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
    if (!canCreate) {
        reason = `您已达到${membership.tier}会员等级的鱼数量上限（${membership.maxFishCount}条）。请升级会员以创建更多鱼。`;
    }
    return {
        canCreate,
        reason,
        tier: membership.tier,
        currentCount: membership.currentFishCount,
        maxCount: membership.maxFishCount
    };
}

/**
 * 检查鱼是否可以说话（Plus及以上会员）
 */
async function canFishSpeak(userId) {
    const membership = await getUserMembership(userId);
    return membership.canSpeak;
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
    canFishSpeak,
    canAdjustChatFrequency,
    getUserMembership
};

