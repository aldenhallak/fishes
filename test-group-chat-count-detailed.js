/**
 * 详细测试群聊数量统计 - 检查时区和日期
 */

require('dotenv').config({ path: '.env.local' });
const { executeGraphQL } = require('./lib/hasura');

const userId = '11312701-f1d2-43f8-a13d-260eac812b7a';

async function testGroupChatCountDetailed() {
    console.log('🔍 详细测试群聊数量统计（检查时区）...');
    console.log(`用户ID: ${userId}\n`);
    
    // 获取当前时间信息
    const now = new Date();
    const nowUTC = now.toISOString();
    const nowLocal = now.toString();
    
    console.log('⏰ 当前时间信息:');
    console.log(`  UTC时间: ${nowUTC}`);
    console.log(`  本地时间: ${nowLocal}`);
    console.log(`  时区偏移: ${now.getTimezoneOffset()} 分钟`);
    
    // 获取今天的开始时间（UTC）
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);
    const todayISO = todayUTC.toISOString();
    
    // 获取本地今天的开始时间
    const todayLocal = new Date();
    todayLocal.setHours(0, 0, 0, 0);
    
    console.log(`\n📅 日期范围:`);
    console.log(`  UTC今天开始: ${todayISO}`);
    console.log(`  本地今天开始: ${todayLocal.toISOString()}`);
    console.log(`  本地今天开始（显示）: ${todayLocal.toString()}`);
    
    // 查询所有记录（不限制日期）
    const allRecordsQuery = `
        query GetAllRecords($userId: String!) {
            group_chat(
                where: {
                    initiator_user_id: { _eq: $userId }
                }
                order_by: { created_at: desc }
                limit: 50
            ) {
                id
                topic
                created_at
                initiator_user_id
                conversation_id
            }
        }
    `;
    
    const allResult = await executeGraphQL(allRecordsQuery, { userId });
    const allRecords = allResult.data?.group_chat || [];
    console.log(`\n📊 该用户所有群聊记录总数: ${allRecords.length}`);
    
    // 查询今天的记录（UTC）
    const todayRecordsQuery = `
        query GetTodayRecords($userId: String!, $todayStart: timestamp!) {
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
            }
        }
    `;
    
    const todayResult = await executeGraphQL(todayRecordsQuery, { userId, todayStart: todayISO });
    const todayRecords = todayResult.data?.group_chat || [];
    console.log(`\n✅ 今天（UTC）的记录数: ${todayRecords.length}`);
    
    // 分析记录的时间
    console.log(`\n📋 记录时间分析:`);
    const recordsByDate = {};
    allRecords.forEach(record => {
        const recordDate = new Date(record.created_at);
        const dateKey = recordDate.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!recordsByDate[dateKey]) {
            recordsByDate[dateKey] = [];
        }
        recordsByDate[dateKey].push(record);
    });
    
    Object.keys(recordsByDate).sort().reverse().forEach(date => {
        const records = recordsByDate[date];
        console.log(`  ${date}: ${records.length} 条记录`);
        if (records.length <= 5) {
            records.forEach((r, i) => {
                const localTime = new Date(r.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
                console.log(`    ${i + 1}. ${r.created_at} (北京时间: ${localTime})`);
            });
        } else {
            const first = records[0];
            const last = records[records.length - 1];
            const firstLocal = new Date(first.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
            const lastLocal = new Date(last.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
            console.log(`    最早: ${first.created_at} (北京时间: ${firstLocal})`);
            console.log(`    最晚: ${last.created_at} (北京时间: ${lastLocal})`);
        }
    });
    
    // 检查今天的记录（按北京时间）
    const beijingNow = new Date();
    const beijingTodayStart = new Date(beijingNow.getFullYear(), beijingNow.getMonth(), beijingNow.getDate());
    beijingTodayStart.setHours(0, 0, 0, 0);
    const beijingTodayStartISO = beijingTodayStart.toISOString();
    
    console.log(`\n🇨🇳 北京时间今天开始: ${beijingTodayStartISO}`);
    console.log(`   (${beijingTodayStart.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })})`);
    
    const beijingTodayRecords = allRecords.filter(r => {
        const recordTime = new Date(r.created_at);
        return recordTime >= beijingTodayStart;
    });
    
    console.log(`\n✅ 今天（北京时间）的记录数: ${beijingTodayRecords.length}`);
    
    // 对比
    console.log(`\n📊 对比结果:`);
    console.log(`  UTC今天: ${todayRecords.length} 条`);
    console.log(`  北京时间今天: ${beijingTodayRecords.length} 条`);
    console.log(`  差异: ${Math.abs(todayRecords.length - beijingTodayRecords.length)} 条`);
    
    if (todayRecords.length !== beijingTodayRecords.length) {
        console.log(`\n⚠️  注意：UTC和北京时间的统计结果不同！`);
        console.log(`  这是因为时区差异导致的。`);
    }
}

testGroupChatCountDetailed().catch(console.error);

