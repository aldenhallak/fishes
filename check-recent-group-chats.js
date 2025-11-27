/**
 * 检查最近的群聊记录
 */

require('dotenv').config({ path: '.env.local' });
const { executeGraphQL } = require('./lib/hasura');

const userId = '11312701-f1d2-43f8-a13d-260eac812b7a';

async function checkRecentGroupChats() {
    console.log('🔍 检查最近的群聊记录...\n');
    
    // 查询最近10条记录（不限制日期）
    const query = `
        query GetRecentGroupChats($userId: String!) {
            group_chat(
                where: {
                    initiator_user_id: { _eq: $userId }
                }
                order_by: { created_at: desc }
                limit: 10
            ) {
                id
                topic
                created_at
                initiator_user_id
                conversation_id
            }
        }
    `;
    
    const result = await executeGraphQL(query, { userId });
    const records = result.data?.group_chat || [];
    
    console.log(`📊 找到 ${records.length} 条记录\n`);
    
    if (records.length > 0) {
        records.forEach((record, index) => {
            const date = new Date(record.created_at);
            const beijingTime = date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
            console.log(`${index + 1}. ID: ${record.id}`);
            console.log(`   主题: ${record.topic || 'N/A'}`);
            console.log(`   创建时间 (UTC): ${record.created_at}`);
            console.log(`   创建时间 (北京时间): ${beijingTime}`);
            console.log(`   initiator_user_id: ${record.initiator_user_id}`);
            console.log(`   conversation_id: ${record.conversation_id || 'NULL'}`);
            console.log('');
        });
        
        // 检查今天的记录
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        todayStart.setHours(0, 0, 0, 0);
        
        const todayRecords = records.filter(r => {
            const recordDate = new Date(r.created_at);
            return recordDate >= todayStart;
        });
        
        console.log(`\n✅ 今天（北京时间）的记录数: ${todayRecords.length}`);
    } else {
        console.log('❌ 没有找到任何记录');
    }
}

checkRecentGroupChats().catch(console.error);

