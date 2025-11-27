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

async function verifyUserSubscription(userId) {
    console.log('\n🔍 验证用户订阅状态...\n');
    console.log('用户ID:', userId);
    console.log('='.repeat(70));
    
    const query = `
        query VerifyUser($userId: String!) {
            users_by_pk(id: $userId) {
                id
                user_subscriptions(
                    order_by: {created_at: desc}
                ) {
                    id
                    plan
                    is_active
                    created_at
                }
            }
        }
    `;
    
    const data = await queryHasura(query, { userId });
    
    if (!data.users_by_pk) {
        console.log('\n❌ 用户不存在！\n');
        return;
    }
    
    console.log('\n📋 用户订阅记录：\n');
    
    if (data.users_by_pk.user_subscriptions.length === 0) {
        console.log('  ⚠️ 没有订阅记录\n');
        console.log('💡 解决方法：为用户创建一个 Plus 订阅记录');
        console.log('   SQL: INSERT INTO user_subscriptions (user_id, plan, is_active) VALUES (\'' + userId + '\', \'plus\', true);');
        return;
    }
    
    data.users_by_pk.user_subscriptions.forEach((sub, idx) => {
        const icon = sub.is_active ? '✅' : '  ';
        console.log(`${icon} ${idx + 1}. ${sub.plan.toUpperCase()}`);
        console.log(`     is_active: ${sub.is_active}`);
        console.log(`     created_at: ${sub.created_at}`);
        console.log('');
    });
    
    const activeSub = data.users_by_pk.user_subscriptions.find(s => s.is_active);
    
    if (!activeSub) {
        console.log('❌ 没有活跃的订阅 (is_active = true)\n');
        console.log('💡 解决方法：激活用户的 Plus 订阅');
        const plusSub = data.users_by_pk.user_subscriptions.find(s => s.plan === 'plus');
        if (plusSub) {
            console.log(`   SQL: UPDATE user_subscriptions SET is_active = true WHERE id = '${plusSub.id}';`);
        } else {
            console.log('   用户没有 Plus 订阅记录，需要创建一个');
        }
    } else if (activeSub.plan !== 'plus') {
        console.log(`⚠️ 活跃订阅是 ${activeSub.plan.toUpperCase()}，不是 PLUS\n`);
        console.log('💡 如果要改为 Plus 会员：');
        console.log(`   SQL: UPDATE user_subscriptions SET is_active = false WHERE id = '${activeSub.id}';`);
        const plusSub = data.users_by_pk.user_subscriptions.find(s => s.plan === 'plus');
        if (plusSub) {
            console.log(`   SQL: UPDATE user_subscriptions SET is_active = true WHERE id = '${plusSub.id}';`);
        }
    } else {
        console.log('✅ 用户的 Plus 订阅已激活！\n');
        console.log('📌 会员权益 (Plus):');
        console.log('   - draw_fish_limit: unlimited (每天画鱼无限制) ⭐');
        console.log('   - add_to_my_tank_limit: 30 (鱼缸最多30条鱼)');
        console.log('');
    }
    
    console.log('='.repeat(70));
}

const userId = process.argv[2];

if (!userId) {
    console.log('使用方法: node verify-user-subscription.js <用户ID>');
    console.log('');
    console.log('示例: node verify-user-subscription.js google-oauth2|123456789');
    process.exit(1);
}

verifyUserSubscription(userId).catch(err => {
    console.error('\n❌ 执行失败:', err.message);
    process.exit(1);
});

