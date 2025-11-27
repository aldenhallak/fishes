/**
 * Test COZE API connection and basic functionality
 */

require('dotenv').config({ path: '.env.local' });

async function testCozeConnection() {
    const apiKey = process.env.COZE_API_KEY;
    const botId = process.env.COZE_BOT_ID;
    const baseUrl = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';
    
    console.log('=== Testing COZE API Connection ===');
    console.log('Base URL:', baseUrl);
    console.log('Bot ID:', botId);
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
    console.log('');
    
    if (!apiKey || !botId) {
        console.error('❌ Missing COZE_API_KEY or COZE_BOT_ID');
        return;
    }
    
    try {
        // Step 1: Create conversation
        console.log('Step 1: Creating conversation...');
        const convResponse = await fetch(`${baseUrl}/v1/conversation/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bot_id: botId,
            })
        });
        
        console.log('Conversation response status:', convResponse.status);
        
        if (!convResponse.ok) {
            const errorText = await convResponse.text();
            console.error('❌ Failed to create conversation:', errorText);
            return;
        }
        
        const convData = await convResponse.json();
        console.log('Conversation response:', JSON.stringify(convData, null, 2));
        
        const conversationId = convData.data?.id || convData.data?.conversation_id || convData.conversation_id || convData.id;
        
        if (!conversationId) {
            console.error('❌ Failed to get conversation ID');
            return;
        }
        
        console.log('✅ Conversation created:', conversationId);
        console.log('');
        
        // Step 2: Send a simple chat message
        console.log('Step 2: Sending chat message...');
        
        const testFishArray = [
            {
                fish_id: 'test-fish-1',
                fish_name: 'TestFish1',
                personality: 'cheerful',
                feeder_name: 'TestUser'
            }
        ];
        
        const parameters = {
            fish_array: testFishArray,
            output_language: '繁體中文'
        };
        
        const chatRequestBody = {
            bot_id: botId,
            user_id: 'test-user',
            conversation_id: conversationId,
            query: 'Generate a simple greeting from the fish.',
            stream: false,
            parameters: parameters
        };
        
        console.log('Chat request body:', JSON.stringify(chatRequestBody, null, 2));
        
        const chatResponse = await fetch(`${baseUrl}/v3/chat`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(chatRequestBody)
        });
        
        console.log('Chat response status:', chatResponse.status);
        
        if (!chatResponse.ok) {
            const errorText = await chatResponse.text();
            console.error('❌ Failed to send chat:', errorText);
            return;
        }
        
        const chatData = await chatResponse.json();
        console.log('Chat response:', JSON.stringify(chatData, null, 2));
        
        if (chatData.code !== 0) {
            console.error('❌ COZE API error:', chatData.msg);
            return;
        }
        
        const chatId = chatData.data?.id || chatData.data?.chat_id || chatData.chat_id || chatData.id;
        
        if (!chatId) {
            console.error('❌ Failed to get chat ID');
            return;
        }
        
        console.log('✅ Chat initiated:', chatId);
        console.log('');
        
        // Step 3: Poll for response (just 2 attempts for testing)
        console.log('Step 3: Polling for response...');
        
        for (let attempt = 1; attempt <= 2; attempt++) {
            console.log(`Poll attempt ${attempt}...`);
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Check status
            const statusResponse = await fetch(
                `${baseUrl}/v1/conversation/message/retrieve?conversation_id=${conversationId}&chat_id=${chatId}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            
            const statusData = await statusResponse.json();
            console.log(`Status response:`, JSON.stringify(statusData, null, 2));
            
            // Get messages
            const messagesResponse = await fetch(
                `${baseUrl}/v3/chat/message/list?conversation_id=${conversationId}&chat_id=${chatId}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        limit: 20,
                        order: 'desc'
                    })
                }
            );
            
            const messagesData = await messagesResponse.json();
            console.log(`Messages response:`, JSON.stringify(messagesData, null, 2));
            
            // Check for AI response
            if (messagesData.data?.data && Array.isArray(messagesData.data.data)) {
                const aiMessage = messagesData.data.data.find(m => 
                    m.role === 'assistant' && 
                    m.type === 'answer' && 
                    m.content && 
                    m.content.trim()
                );
                
                if (aiMessage) {
                    console.log('✅ Found AI response:', aiMessage.content);
                    return;
                }
            }
        }
        
        console.log('⚠️ No AI response found after 2 attempts');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testCozeConnection();
