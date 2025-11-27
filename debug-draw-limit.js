require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const HASURA_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_SECRET = process.env.HASURA_ADMIN_SECRET;

async function queryHasura(query, variables = {}) {
    const response = await fetch(HASURA_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': HASURA_SECRET
        },
        body: JSON.stringify({ query, variables })
    });
    
    const result = await response.json();
    if (result.errors) {
        console.error('GraphQL错误:', JSON.stringify(result.errors, null, 2));
        throw new Error('Query failed');
    }
    return result.data;
}

async function debugDrawLimit(userId) {
    console.log('\n🔍 检查用户画鱼限制问题...\n');
    console.log('用户ID:', userId);
    console.log('=' .repeat(60));
    
    // 1. 检查 member_types 表配置
    console.log('\n📋 步骤1: 检查 member_types 表配置\n');
    const memberTypesQuery = `
        query GetMemberTypes {
            member_types(order_by: {id: asc}) {
                id
                name
                draw_fish_limit
                add_to_my_tank_limit
            }
        }
    `;
    
    const memberTypesData = await queryHasura(memberTypesQuery);
    console.log('会员类型配置:');
    memberTypesData.member_types.forEach(mt => {
        console.log(`  - ${mt.id} (${mt.name}):`);
        console.log(`      draw_fish_limit: ${mt.draw_fish_limit}`);
        console.log(`      add_to_my_tank_limit: ${mt.add_to_my_tank_limit}`);
    });
    
    // 2. 检查用户订阅状态
    console.log('\n👤 步骤2: 检查用户订阅状态\n');
    const userQuery = `
        query GetUserSubscription($userId: String!) {
            users_by_pk(id: $userId) {
                id
                user_subscriptions(order_by: {created_at: desc}) {
                    id
                    plan
                    is_active
                    created_at
                    updated_at
                }
            }
        }
    `;
    
    const userData = await queryHasura(userQuery, { userId });
    if (!userData.users_by_pk) {
        console.log('❌ 用户不存在!');
        return;
    }
    
    console.log('用户订阅记录:');
    if (userData.users_by_pk.user_subscriptions.length === 0) {
        console.log('  (无订阅记录)');
    } else {
        userData.users_by_pk.user_subscriptions.forEach((sub, idx) => {
            console.log(`  ${idx + 1}. plan: ${sub.plan}, is_active: ${sub.is_active}, created_at: ${sub.created_at}`);
        });
    }
    
    const activeSub = userData.users_by_pk.user_subscriptions.find(s => s.is_active);
    if (!activeSub) {
        console.log('\n⚠️ 没有找到活跃的订阅 (is_active = true)');
        console.log('   这可能是问题所在！');
    } else {
        console.log(`\n✅ 活跃订阅: ${activeSub.plan}`);
    }
    
    // 3. 检查今天创建的鱼数量
    console.log('\n🐟 步骤3: 检查今天创建的鱼数量\n');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    const todayFishQuery = `
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
            fish(
                where: {
                    user_id: { _eq: $userId }
                    created_at: { _gte: $todayStart }
                }
                order_by: {created_at: desc}
            ) {
                id
                fish_name
                created_at
            }
        }
    `;
    
    const todayFishData = await queryHasura(todayFishQuery, { userId, todayStart: todayISO });
    const todayCount = todayFishData.fish_aggregate.aggregate.count;
    
    console.log(`今天 (UTC ${todayISO}) 创建的鱼: ${todayCount} 条`);
    if (todayCount > 0) {
        console.log('\n最近创建的鱼:');
        todayFishData.fish.forEach((f, idx) => {
            console.log(`  ${idx + 1}. ${f.fish_name || '(无名)'} - ${f.created_at}`);
        });
    }
    
    // 4. 模拟会员权限判断
    console.log('\n🎯 步骤4: 模拟会员权限判断\n');
    
    const tier = activeSub ? activeSub.plan : 'free';
    const memberType = memberTypesData.member_types.find(mt => mt.id === tier);
    
    if (!memberType) {
        console.log(`❌ 找不到会员类型 "${tier}" 的配置!`);
        console.log('   这可能是问题所在！');
        return;
    }
    
    console.log(`会员等级: ${tier}`);
    console.log(`draw_fish_limit: ${memberType.draw_fish_limit}`);
    console.log(`今日已创建: ${todayCount} 条`);
    
    const drawLimit = memberType.draw_fish_limit;
    
    // 判断逻辑 (与 canDrawFishToday 一致)
    if (tier === 'admin') {
        console.log('\n✅ 管理员 - 无限制');
    } else if (!drawLimit || drawLimit === 'unlimited' || drawLimit === 'null') {
        console.log('\n✅ draw_fish_limit 为 unlimited/null - 无限制');
    } else {
        const maxLimit = parseInt(drawLimit, 10);
        console.log(`\n📊 限制检查: ${todayCount} / ${maxLimit}`);
        
        if (todayCount >= maxLimit) {
            console.log('❌ 已达到每日限制 - 无法继续创建');
            console.log(`   原因: 今日创建数 (${todayCount}) >= 限制 (${maxLimit})`);
        } else {
            console.log(`✅ 未达到限制 - 今天还可以创建 ${maxLimit - todayCount} 条鱼`);
        }
    }
    
    // 5. 建议修复方案
    console.log('\n💡 修复建议:\n');
    
    if (!activeSub) {
        console.log('1. ⚠️ 用户没有活跃订阅 (is_active = true)');
        console.log('   解决方法: 确保用户的订阅记录 is_active = true');
        console.log(`   SQL: UPDATE user_subscriptions SET is_active = true WHERE id = '订阅ID';`);
    }
    
    if (memberType && memberType.draw_fish_limit && memberType.draw_fish_limit !== 'unlimited') {
        const limit = parseInt(memberType.draw_fish_limit, 10);
        if (todayCount >= limit) {
            console.log(`2. ⚠️ 今天已经创建了 ${todayCount} 条鱼，达到 ${tier} 会员的每日限制 (${limit})`);
            console.log('   解决方法: ');
            console.log(`   - 修改 member_types 表，将 ${tier} 的 draw_fish_limit 改为更大的值或 'unlimited'`);
            console.log(`   SQL: UPDATE member_types SET draw_fish_limit = 'unlimited' WHERE id = '${tier}';`);
            console.log('   或');
            console.log('   - 等待明天 (UTC 00:00) 重置');
        }
    }
    
    console.log('\n' + '='.repeat(60));
}

// 获取命令行参数
const userId = process.argv[2];

if (!userId) {
    console.log('使用方法: node debug-draw-limit.js <用户ID>');
    console.log('');
    console.log('示例: node debug-draw-limit.js google-oauth2|123456789');
    process.exit(1);
}

debugDrawLimit(userId).catch(err => {
    console.error('\n❌ 调试失败:', err.message);
    process.exit(1);
});

