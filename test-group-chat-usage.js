/**
 * 测试群聊使用量计算是否正常工作
 */

const { executeGraphQL } = require('./lib/hasura');

async function testGroupChatUsage() {
    console.log('🧪 测试群聊使用量计算...');
    
    // 测试查询今日群聊使用量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    const testUserId = 'test-user-123'; // 使用测试用户ID
    
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
    
    try {
        console.log(`📅 查询日期: ${todayISO}`);
        console.log(`👤 用户ID: ${testUserId}`);
        
        const result = await executeGraphQL(query, { 
            userId: testUserId, 
            todayStart: todayISO 
        });
        
        if (result.errors) {
            console.error('❌ GraphQL 查询失败:', result.errors);
            return;
        }
        
        const count = result.data.group_chat_aggregate?.aggregate?.count || 0;
        console.log(`✅ 查询成功! 用户今日群聊使用量: ${count}`);
        
        // 显示详细结果
        console.log('📊 详细结果:', JSON.stringify(result.data, null, 2));
        
        // 测试插入一条记录
        console.log('\n📝 测试插入群聊记录...');
        const insertMutation = `
            mutation TestInsertGroupChat($userId: String!) {
                insert_group_chat_one(
                    object: {
                        topic: "测试群聊"
                        time_of_day: "afternoon"
                        participant_fish_ids: []
                        dialogues: {messages: []}
                        display_duration: 30
                        expires_at: "2025-12-12T00:00:00.000Z"
                        initiator_user_id: $userId
                    }
                ) {
                    id
                    created_at
                    initiator_user_id
                }
            }
        `;
        
        const insertResult = await executeGraphQL(insertMutation, { userId: testUserId });
        
        if (insertResult.errors) {
            console.error('❌ 插入失败:', insertResult.errors);
        } else {
            console.log('✅ 插入成功:', insertResult.data.insert_group_chat_one);
            
            // 再次查询使用量
            console.log('\n🔄 重新查询使用量...');
            const result2 = await executeGraphQL(query, { 
                userId: testUserId, 
                todayStart: todayISO 
            });
            
            const count2 = result2.data.group_chat_aggregate?.aggregate?.count || 0;
            console.log(`📈 更新后的使用量: ${count2}`);
            
            if (count2 > count) {
                console.log('🎉 使用量计算正常工作！');
            } else {
                console.log('⚠️ 使用量没有增加，可能有问题');
            }
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error);
    }
}

// 运行测试
testGroupChatUsage();
