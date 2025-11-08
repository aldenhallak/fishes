/**
 * GraphQL 查询测试脚本
 * 使用方法: node test-graphql-query.js
 */

const { query } = require('./lib/hasura.js');

async function testQueryFish() {
    console.log('🔍 测试查询鱼数据...\n');
    
    try {
        // 查询鱼数据
        const queryStr = `
            query GetFish {
                fish(
                    limit: 5
                    where: { is_approved: { _eq: true } }
                    order_by: { created_at: desc }
                ) {
                    id
                    image_url
                    artist
                    created_at
                    upvotes
                    level
                    health
                    max_health
                    is_alive
                }
            }
        `;
        
        const result = await query(queryStr);
        
        console.log('✅ 查询成功！');
        console.log(`📊 找到 ${result.fish.length} 条鱼\n`);
        
        // 显示每条鱼的信息
        result.fish.forEach((fish, index) => {
            console.log(`${index + 1}. 鱼 ID: ${fish.id}`);
            console.log(`   作者: ${fish.artist || '匿名'}`);
            console.log(`   点赞数: ${fish.upvotes}`);
            console.log(`   等级: ${fish.level}`);
            console.log(`   血量: ${fish.health}/${fish.max_health}`);
            console.log(`   状态: ${fish.is_alive ? '存活' : '死亡'}`);
            console.log(`   创建时间: ${fish.created_at}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ 查询失败:', error.message);
        console.error('错误详情:', error);
    }
}

// 执行测试
testQueryFish();











