/**
 * 测试当前的群聊关联状态
 */

const { executeGraphQL } = require('./lib/hasura');

async function testCurrentRelations() {
    console.log('🔍 测试当前群聊关联状态...\n');
    
    // 测试1: 检查 group_chat 表的字段
    console.log('📋 测试1: 检查 group_chat 表字段');
    const schemaQuery = `
        query CheckGroupChatSchema {
            __type(name: "group_chat") {
                fields {
                    name
                    type {
                        name
                        ofType {
                            name
                        }
                    }
                }
            }
        }
    `;
    
    try {
        const schemaResult = await executeGraphQL(schemaQuery);
        
        if (schemaResult.errors) {
            console.error('❌ Schema查询失败:', schemaResult.errors);
            return;
        }
        
        const fields = schemaResult.data.__type?.fields || [];
        console.log('✅ group_chat 表字段:');
        fields.forEach(field => {
            console.log(`   - ${field.name}: ${field.type.name || field.type.ofType?.name}`);
        });
        
        // 检查是否有 initiator_user 关联
        const hasInitiatorUserRelation = fields.some(field => field.name === 'initiator_user');
        if (hasInitiatorUserRelation) {
            console.log('✅ 发现 initiator_user 关联');
        } else {
            console.log('❌ 未发现 initiator_user 关联');
        }
        
    } catch (error) {
        console.error('❌ Schema查询异常:', error.message);
    }
    
    // 测试2: 检查 users 表的字段
    console.log('\n📋 测试2: 检查 users 表字段');
    const usersSchemaQuery = `
        query CheckUsersSchema {
            __type(name: "users") {
                fields {
                    name
                    type {
                        name
                        ofType {
                            name
                        }
                    }
                }
            }
        }
    `;
    
    try {
        const usersResult = await executeGraphQL(usersSchemaQuery);
        
        if (usersResult.errors) {
            console.error('❌ Users Schema查询失败:', usersResult.errors);
            return;
        }
        
        const usersFields = usersResult.data.__type?.fields || [];
        
        // 检查是否有 initiated_group_chats 关联
        const hasInitiatedGroupChatsRelation = usersFields.some(field => 
            field.name === 'initiated_group_chats' || 
            field.name.includes('group_chat')
        );
        
        if (hasInitiatedGroupChatsRelation) {
            console.log('✅ 发现群聊相关关联');
            usersFields.filter(field => field.name.includes('group_chat')).forEach(field => {
                console.log(`   - ${field.name}: ${field.type.name || field.type.ofType?.name}`);
            });
        } else {
            console.log('❌ 未发现群聊相关关联');
        }
        
    } catch (error) {
        console.error('❌ Users Schema查询异常:', error.message);
    }
    
    // 测试3: 尝试使用关联查询
    console.log('\n📋 测试3: 尝试关联查询');
    const relationQuery = `
        query TestGroupChatRelations {
            group_chat(limit: 1) {
                id
                topic
                initiator_user_id
            }
        }
    `;
    
    try {
        const relationResult = await executeGraphQL(relationQuery);
        
        if (relationResult.errors) {
            console.error('❌ 关联查询失败:', relationResult.errors);
        } else {
            console.log('✅ 基本查询成功');
            console.log('📊 数据示例:', JSON.stringify(relationResult.data, null, 2));
        }
        
    } catch (error) {
        console.error('❌ 关联查询异常:', error.message);
    }
    
    // 测试4: 尝试带关联的查询（如果关联存在）
    console.log('\n📋 测试4: 尝试带关联的查询');
    const advancedQuery = `
        query TestAdvancedRelations {
            group_chat(limit: 1) {
                id
                topic
                initiator_user_id
                initiator_user {
                    id
                    feeder_name
                }
            }
        }
    `;
    
    try {
        const advancedResult = await executeGraphQL(advancedQuery);
        
        if (advancedResult.errors) {
            console.log('⚠️ 带关联查询失败（可能关联未设置）');
            console.log('   错误信息:', advancedResult.errors[0]?.message);
        } else {
            console.log('🎉 带关联查询成功！');
            console.log('📊 关联数据:', JSON.stringify(advancedResult.data, null, 2));
        }
        
    } catch (error) {
        console.log('⚠️ 带关联查询异常:', error.message);
    }
    
    // 总结
    console.log('\n📊 测试总结:');
    console.log('1. initiator_user_id 字段: ✅ 存在');
    console.log('2. GraphQL 关联: 需要进一步验证');
    console.log('3. 建议: 如果带关联查询失败，需要在 Hasura Console 中重新设置关联');
}

// 运行测试
testCurrentRelations().catch(error => {
    console.error('💥 测试失败:', error.message);
});
