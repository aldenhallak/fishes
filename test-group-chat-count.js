/**
 * 测试群聊数量统计
 * 检查用户 11312701-f1d2-43f8-a13d-260eac812b7a 今天的群聊记录
 */

require('dotenv').config({ path: '.env.local' });
const { executeGraphQL } = require('./lib/hasura');

const userId = '11312701-f1d2-43f8-a13d-260eac812b7a';

async function testGroupChatCount() {
    console.log('🔍 测试群聊数量统计...');
    console.log(`用户ID: ${userId}`);
    
    // 获取今天的开始时间（UTC）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    console.log(`今天开始时间 (UTC): ${todayISO}`);
    
    // 1. 查询所有今天的记录（包括 initiator_user_id 为 NULL 的）
    const allRecordsQuery = `
        query GetAllTodayRecords($todayStart: timestamp!) {
            group_chat(
                where: {
                    created_at: { _gte: $todayStart }
                }
                order_by: { created_at: desc }
            ) {
                id
                topic
                created_at
                initiator_user_id
                conversation_id
                user_talk
            }
        }
    `;
    
    const allResult = await executeGraphQL(allRecordsQuery, { todayStart: todayISO });
    const allRecords = allResult.data?.group_chat || [];
    console.log(`\n📊 今天所有群聊记录总数: ${allRecords.length}`);
    
    // 2. 查询该用户的记录（initiator_user_id 不为 NULL）
    const userRecordsQuery = `
        query GetUserRecords($userId: String!, $todayStart: timestamp!) {
            group_chat(
                where: {
                    created_at: { _gte: $todayStart },
                    initiator_user_id: { _eq: $userId, _is_null: false }
                }
                order_by: { created_at: desc }
            ) {
                id
                topic
                created_at
                initiator_user_id
                conversation_id
                user_talk
            }
        }
    `;
    
    const userResult = await executeGraphQL(userRecordsQuery, { userId, todayStart: todayISO });
    const userRecords = userResult.data?.group_chat || [];
    console.log(`\n✅ 该用户发起的群聊记录数: ${userRecords.length}`);
    
    // 3. 查询 initiator_user_id 为 NULL 的记录
    const nullRecordsQuery = `
        query GetNullRecords($todayStart: timestamp!) {
            group_chat(
                where: {
                    created_at: { _gte: $todayStart },
                    initiator_user_id: { _is_null: true }
                }
                order_by: { created_at: desc }
            ) {
                id
                topic
                created_at
                initiator_user_id
                conversation_id
                user_talk
            }
        }
    `;
    
    const nullResult = await executeGraphQL(nullRecordsQuery, { todayStart: todayISO });
    const nullRecords = nullResult.data?.group_chat || [];
    console.log(`\n⚠️  initiator_user_id 为 NULL 的记录数: ${nullRecords.length}`);
    
    // 4. 统计信息
    console.log('\n📈 统计信息:');
    console.log(`  - 总记录数: ${allRecords.length}`);
    console.log(`  - 该用户记录数: ${userRecords.length}`);
    console.log(`  - NULL记录数: ${nullRecords.length}`);
    console.log(`  - 其他用户记录数: ${allRecords.length - userRecords.length - nullRecords.length}`);
    
    // 5. 检查 conversation_id 和 user_talk
    const nullConversationCount = userRecords.filter(r => !r.conversation_id).length;
    const nullUserTalkCount = userRecords.filter(r => !r.user_talk).length;
    
    console.log(`\n🔍 该用户记录详情:`);
    console.log(`  - conversation_id 为 NULL 的记录数: ${nullConversationCount}`);
    console.log(`  - user_talk 为 NULL 的记录数: ${nullUserTalkCount}`);
    
    // 6. 显示前5条记录
    if (userRecords.length > 0) {
        console.log(`\n📋 前5条用户记录:`);
        userRecords.slice(0, 5).forEach((record, index) => {
            console.log(`  ${index + 1}. ID: ${record.id}`);
            console.log(`     主题: ${record.topic || 'N/A'}`);
            console.log(`     创建时间: ${record.created_at}`);
            console.log(`     initiator_user_id: ${record.initiator_user_id}`);
            console.log(`     conversation_id: ${record.conversation_id || 'NULL'}`);
            console.log(`     user_talk: ${record.user_talk ? '有数据' : 'NULL'}`);
            console.log('');
        });
    }
    
    // 7. 使用 aggregate 查询（与API使用相同的查询）
    const aggregateQuery = `
        query GetUserDailyUsage($userId: String!, $todayStart: timestamp!) {
            group_chat_aggregate(
                where: {
                    created_at: { _gte: $todayStart },
                    initiator_user_id: { _eq: $userId, _is_null: false }
                }
            ) {
                aggregate {
                    count
                }
            }
        }
    `;
    
    const aggregateResult = await executeGraphQL(aggregateQuery, { userId, todayStart: todayISO });
    const aggregateCount = aggregateResult.data?.group_chat_aggregate?.aggregate?.count || 0;
    console.log(`\n🎯 Aggregate 查询结果: ${aggregateCount}`);
    console.log(`   与详细查询结果对比: ${aggregateCount === userRecords.length ? '✅ 一致' : '❌ 不一致'}`);
}

testGroupChatCount().catch(console.error);

