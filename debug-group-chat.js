/**
 * 群聊功能调试脚本
 * 直接测试API端点，验证使用量计算
 */

const fetch = require('node-fetch');

async function testGroupChatAPI() {
    console.log('🧪 开始测试群聊API...');
    
    const apiUrl = 'http://localhost:3000/api/fish/chat/group';
    
    try {
        // 第一次调用
        console.log('\n📞 第一次调用群聊API...');
        const response1 = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                test: true
            })
        });
        
        const data1 = await response1.json();
        console.log('✅ 第一次响应:', {
            success: data1.success,
            usageInfo: data1.usageInfo,
            dialogues: data1.dialogues?.length || 0
        });
        
        // 等待1秒
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 第二次调用
        console.log('\n📞 第二次调用群聊API...');
        const response2 = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                test: true
            })
        });
        
        const data2 = await response2.json();
        console.log('✅ 第二次响应:', {
            success: data2.success,
            usageInfo: data2.usageInfo,
            dialogues: data2.dialogues?.length || 0
        });
        
        // 比较使用量
        if (data1.usageInfo && data2.usageInfo) {
            const usage1 = data1.usageInfo.usage;
            const usage2 = data2.usageInfo.usage;
            
            console.log('\n📊 使用量对比:');
            console.log(`第一次: ${usage1}/${data1.usageInfo.limit}`);
            console.log(`第二次: ${usage2}/${data2.usageInfo.limit}`);
            
            if (usage2 > usage1) {
                console.log('✅ 使用量正确递增！');
            } else {
                console.log('❌ 使用量没有递增，可能有问题');
            }
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

// 运行测试
testGroupChatAPI();
