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

async function activateSubscription(userId) {
    console.log('\n🔧 激活用户的 Plus 订阅...\n');
    console.log('用户ID:', userId);
    console.log('='.repeat(70));
    
    // 1. 查询用户的所有订阅
    const querySubscriptions = `
        query GetSubscriptions($userId: String!) {
            user_subscriptions(
                where: { user_id: { _eq: $userId } }
                order_by: { created_at: desc }
            ) {
                id
                user_id
                plan
                is_active
                created_at
            }
        }
    `;
    
    const data = await queryHasura(querySubscriptions, { userId });
    
    if (data.user_subscriptions.length === 0) {
        console.log('\n❌ 用户没有订阅记录！\n');
        return;
    }
    
    console.log('\n📋 当前订阅记录：\n');
    data.user_subscriptions.forEach((sub, idx) => {
        const icon = sub.is_active ? '✅' : '  ';
        console.log(`${icon} ${idx + 1}. ${sub.plan.toUpperCase()}`);
        console.log(`     id: ${sub.id}`);
        console.log(`     is_active: ${sub.is_active}`);
        console.log(`     created_at: ${sub.created_at}`);
        console.log('');
    });
    
    const plusSub = data.user_subscriptions.find(s => s.plan === 'plus');
    
    if (!plusSub) {
        console.log('❌ 用户没有 Plus 订阅记录！\n');
        return;
    }
    
    if (plusSub.is_active) {
        console.log('✅ Plus 订阅已经是激活状态！\n');
        return;
    }
    
    // 2. 激活 Plus 订阅
    console.log('🔧 正在激活 Plus 订阅...\n');
    
    const activateMutation = `
        mutation ActivateSubscription($id: Int!) {
            update_user_subscriptions_by_pk(
                pk_columns: { id: $id }
                _set: { is_active: true }
            ) {
                id
                plan
                is_active
                updated_at
            }
        }
    `;
    
    const result = await queryHasura(activateMutation, { id: plusSub.id });
    
    console.log('✅ Plus 订阅已激活！\n');
    console.log('订阅详情:');
    console.log(`  ID: ${result.update_user_subscriptions_by_pk.id}`);
    console.log(`  Plan: ${result.update_user_subscriptions_by_pk.plan}`);
    console.log(`  Active: ${result.update_user_subscriptions_by_pk.is_active}`);
    console.log(`  Updated: ${result.update_user_subscriptions_by_pk.updated_at}`);
    console.log('');
    
    // 3. 显示会员权益
    console.log('📌 Plus 会员权益:');
    console.log('  - draw_fish_limit: 10 (每天最多画 10 条鱼)');
    console.log('  - add_to_my_tank_limit: 30 (鱼缸最多 30 条鱼)');
    console.log('  - 可以参与 AI 群聊');
    console.log('  - 更多功能...');
    console.log('');
    
    console.log('='.repeat(70));
    console.log('✅ 完成！用户现在可以继续创建鱼了！');
}

const userId = process.argv[2];

if (!userId) {
    console.log('使用方法: node activate-user-subscription.js <用户ID>');
    console.log('');
    console.log('示例: node activate-user-subscription.js 11312701-f1d2-43f8-a13d-260eac812b7a');
    process.exit(1);
}

activateSubscription(userId).catch(err => {
    console.error('\n❌ 执行失败:', err.message);
    process.exit(1);
});

