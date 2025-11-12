/**
 * 一次性设置群聊功能完整脚本
 * 包含：数据库迁移、关联设置、测试验证
 */

const { executeGraphQL } = require('./lib/hasura');

// 颜色输出函数
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function executeStep(stepName, stepFunction) {
    log('blue', `\n🔄 执行步骤: ${stepName}`);
    try {
        await stepFunction();
        log('green', `✅ ${stepName} - 完成`);
        return true;
    } catch (error) {
        log('red', `❌ ${stepName} - 失败: ${error.message}`);
        return false;
    }
}

// 步骤1: 检查 initiator_user_id 字段是否存在
async function checkInitiatorUserIdField() {
    const query = `
        query CheckGroupChatSchema {
            __type(name: "group_chat") {
                fields {
                    name
                    type {
                        name
                    }
                }
            }
        }
    `;
    
    const result = await executeGraphQL(query);
    
    if (result.errors) {
        throw new Error(`GraphQL Schema查询失败: ${JSON.stringify(result.errors)}`);
    }
    
    const fields = result.data.__type?.fields || [];
    const hasInitiatorField = fields.some(field => field.name === 'initiator_user_id');
    
    if (hasInitiatorField) {
        log('green', '✅ initiator_user_id 字段已存在');
    } else {
        log('red', '❌ initiator_user_id 字段不存在，请先执行: ALTER TABLE group_chat ADD COLUMN initiator_user_id TEXT;');
        throw new Error('缺少 initiator_user_id 字段');
    }
}

// 步骤2: 测试基本的群聊记录插入和查询
async function testBasicGroupChatOperations() {
    const testUserId = 'test-user-' + Date.now();
    
    // 测试插入
    const insertMutation = `
        mutation TestInsertGroupChat($userId: String!) {
            insert_group_chat_one(
                object: {
                    topic: "测试群聊设置"
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
                topic
            }
        }
    `;
    
    const insertResult = await executeGraphQL(insertMutation, { userId: testUserId });
    
    if (insertResult.errors) {
        throw new Error(`插入测试失败: ${JSON.stringify(insertResult.errors)}`);
    }
    
    const insertedRecord = insertResult.data.insert_group_chat_one;
    log('cyan', `📝 成功插入测试记录: ${insertedRecord.id}`);
    
    // 测试查询使用量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    const usageQuery = `
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
    
    const usageResult = await executeGraphQL(usageQuery, { 
        userId: testUserId, 
        todayStart: todayISO 
    });
    
    if (usageResult.errors) {
        throw new Error(`使用量查询失败: ${JSON.stringify(usageResult.errors)}`);
    }
    
    const count = usageResult.data.group_chat_aggregate?.aggregate?.count || 0;
    log('cyan', `📊 用户 ${testUserId} 今日使用量: ${count}`);
    
    if (count >= 1) {
        log('green', '🎉 使用量计算正常工作！');
    } else {
        throw new Error('使用量计算异常，应该至少为1');
    }
    
    // 清理测试数据
    const deleteQuery = `
        mutation DeleteTestRecord($id: uuid!) {
            delete_group_chat_by_pk(id: $id) {
                id
            }
        }
    `;
    
    await executeGraphQL(deleteQuery, { id: insertedRecord.id });
    log('cyan', '🧹 已清理测试数据');
}

// 步骤3: 检查是否需要添加外键约束
async function checkForeignKeyConstraint() {
    // 尝试插入一个不存在的用户ID，看是否会被外键约束阻止
    const nonExistentUserId = 'non-existent-user-' + Date.now();
    
    const testMutation = `
        mutation TestForeignKey($userId: String!) {
            insert_group_chat_one(
                object: {
                    topic: "外键测试"
                    time_of_day: "afternoon"
                    participant_fish_ids: []
                    dialogues: {messages: []}
                    display_duration: 30
                    expires_at: "2025-12-12T00:00:00.000Z"
                    initiator_user_id: $userId
                }
            ) {
                id
            }
        }
    `;
    
    try {
        const result = await executeGraphQL(testMutation, { userId: nonExistentUserId });
        
        if (result.errors) {
            // 如果有外键约束，应该会报错
            const errorMessage = JSON.stringify(result.errors);
            if (errorMessage.includes('foreign key') || errorMessage.includes('constraint')) {
                log('green', '✅ 外键约束已存在');
                return true;
            } else {
                log('yellow', '⚠️ 插入失败，但不是外键约束错误');
                return false;
            }
        } else {
            // 如果成功插入，说明没有外键约束
            log('yellow', '⚠️ 没有外键约束，建议添加');
            
            // 清理测试数据
            const insertedId = result.data.insert_group_chat_one.id;
            const deleteQuery = `
                mutation DeleteTestRecord($id: uuid!) {
                    delete_group_chat_by_pk(id: $id) {
                        id
                    }
                }
            `;
            await executeGraphQL(deleteQuery, { id: insertedId });
            
            return false;
        }
    } catch (error) {
        log('yellow', `⚠️ 外键测试异常: ${error.message}`);
        return false;
    }
}

// 步骤4: 提供手动执行的SQL语句
function provideSQLStatements() {
    log('blue', '\n📋 如需添加外键约束和关联，请在 Hasura Console 中执行以下SQL:');
    
    console.log(`
${colors.cyan}-- 1. 添加外键约束 (可选，但推荐)
ALTER TABLE group_chat 
ADD CONSTRAINT fk_group_chat_initiator_user 
FOREIGN KEY (initiator_user_id) REFERENCES users(id);${colors.reset}

${colors.magenta}-- 2. 在 Hasura Console 的 Data 页面中设置关联:
-- 
-- group_chat 表:
--   - 添加 Object Relationship
--   - 关联名: initiator_user
--   - 字段映射: initiator_user_id -> users.id
--
-- users 表:
--   - 添加 Array Relationship  
--   - 关联名: initiated_group_chats
--   - 字段映射: id -> group_chat.initiator_user_id${colors.reset}
    `);
}

// 步骤5: 测试群聊API端点
async function testGroupChatAPI() {
    log('blue', '🌐 测试群聊API端点...');
    
    try {
        const response = await fetch('http://localhost:3000/api/fish/chat/group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                test: true
            })
        });
        
        if (!response.ok) {
            throw new Error(`API响应错误: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            log('green', '✅ 群聊API正常工作');
            if (data.usageInfo) {
                log('cyan', `📊 使用量信息: ${JSON.stringify(data.usageInfo)}`);
            }
        } else {
            log('yellow', `⚠️ API返回失败: ${data.error || '未知错误'}`);
        }
        
    } catch (error) {
        log('red', `❌ API测试失败: ${error.message}`);
        log('yellow', '💡 请确保开发服务器正在运行 (npm run dev)');
    }
}

// 主执行函数
async function main() {
    log('magenta', '🚀 开始设置群聊功能...\n');
    
    const steps = [
        ['检查 initiator_user_id 字段', checkInitiatorUserIdField],
        ['测试基本群聊操作', testBasicGroupChatOperations],
        ['检查外键约束', checkForeignKeyConstraint],
        ['测试群聊API', testGroupChatAPI]
    ];
    
    let successCount = 0;
    
    for (const [stepName, stepFunction] of steps) {
        const success = await executeStep(stepName, stepFunction);
        if (success) successCount++;
    }
    
    // 提供SQL语句
    provideSQLStatements();
    
    // 总结
    log('magenta', `\n📊 执行总结: ${successCount}/${steps.length} 步骤成功`);
    
    if (successCount === steps.length) {
        log('green', '🎉 群聊功能设置完成！');
        log('cyan', '💡 建议: 考虑添加外键约束以确保数据完整性');
    } else {
        log('yellow', '⚠️ 部分步骤失败，请检查上述错误信息');
    }
    
    log('blue', '\n📝 接下来可以:');
    console.log('1. 在浏览器中测试群聊功能');
    console.log('2. 检查浏览器控制台的使用量日志');
    console.log('3. 根据需要添加外键约束和GraphQL关联');
}

// 运行脚本
main().catch(error => {
    log('red', `💥 脚本执行失败: ${error.message}`);
    process.exit(1);
});
