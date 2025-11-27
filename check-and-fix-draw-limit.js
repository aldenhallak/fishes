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

async function checkAndFixDrawLimit() {
    console.log('\n🔍 检查 member_types 表的 draw_fish_limit 配置...\n');
    console.log('='.repeat(70));
    
    // 1. 查询当前配置
    const query = `
        query GetMemberTypes {
            member_types(order_by: {id: asc}) {
                id
                name
                draw_fish_limit
                add_to_my_tank_limit
            }
        }
    `;
    
    const data = await queryHasura(query);
    
    console.log('\n📋 当前会员类型配置：\n');
    data.member_types.forEach(mt => {
        console.log(`  ${mt.id.toUpperCase()} (${mt.name}):`);
        console.log(`    draw_fish_limit:      ${mt.draw_fish_limit === null ? 'NULL' : mt.draw_fish_limit}`);
        console.log(`    add_to_my_tank_limit: ${mt.add_to_my_tank_limit}`);
        console.log('');
    });
    
    // 2. 检查是否需要修复
    const needsFix = [];
    
    data.member_types.forEach(mt => {
        let expectedLimit;
        
        switch(mt.id) {
            case 'free':
                expectedLimit = '1';
                break;
            case 'plus':
                expectedLimit = 'unlimited'; // Plus 应该是无限制
                break;
            case 'premium':
                expectedLimit = 'unlimited';
                break;
            case 'admin':
                expectedLimit = 'unlimited';
                break;
            default:
                expectedLimit = null;
        }
        
        if (expectedLimit && mt.draw_fish_limit !== expectedLimit) {
            needsFix.push({
                id: mt.id,
                name: mt.name,
                current: mt.draw_fish_limit,
                expected: expectedLimit
            });
        }
    });
    
    if (needsFix.length === 0) {
        console.log('✅ 所有会员类型的 draw_fish_limit 配置正确！\n');
        console.log('='.repeat(70));
        return;
    }
    
    // 3. 显示需要修复的项
    console.log('⚠️  发现需要修复的配置：\n');
    needsFix.forEach(fix => {
        console.log(`  ${fix.id} (${fix.name}):`);
        console.log(`    当前值: ${fix.current === null ? 'NULL' : fix.current}`);
        console.log(`    期望值: ${fix.expected}`);
        console.log('');
    });
    
    // 4. 执行修复
    console.log('🔧 开始修复...\n');
    
    for (const fix of needsFix) {
        const updateMutation = `
            mutation UpdateDrawLimit($id: String!, $limit: String!) {
                update_member_types_by_pk(
                    pk_columns: { id: $id }
                    _set: { draw_fish_limit: $limit }
                ) {
                    id
                    name
                    draw_fish_limit
                }
            }
        `;
        
        try {
            const result = await queryHasura(updateMutation, {
                id: fix.id,
                limit: fix.expected
            });
            
            console.log(`  ✅ ${fix.id}: ${fix.current} → ${fix.expected}`);
        } catch (error) {
            console.log(`  ❌ ${fix.id}: 修复失败 - ${error.message}`);
        }
    }
    
    // 5. 验证修复结果
    console.log('\n🔍 验证修复结果...\n');
    
    const verifyData = await queryHasura(query);
    
    console.log('修复后的配置：\n');
    verifyData.member_types.forEach(mt => {
        const wasFixed = needsFix.find(f => f.id === mt.id);
        const icon = wasFixed ? '✅' : '  ';
        console.log(`${icon} ${mt.id.toUpperCase()}: draw_fish_limit = ${mt.draw_fish_limit}`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ 修复完成！\n');
    
    // 6. 显示推荐的配置
    console.log('📌 推荐配置：\n');
    console.log('  FREE:    draw_fish_limit = "1"         (每天1条)');
    console.log('  PLUS:    draw_fish_limit = "unlimited" (无限制) ⭐');
    console.log('  PREMIUM: draw_fish_limit = "unlimited" (无限制) ⭐');
    console.log('  ADMIN:   draw_fish_limit = "unlimited" (无限制) ⭐');
    console.log('');
}

checkAndFixDrawLimit().catch(err => {
    console.error('\n❌ 执行失败:', err.message);
    process.exit(1);
});

