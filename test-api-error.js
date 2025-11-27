/**
 * Test script to debug the 500 error
 */

async function testGroupChatAPI() {
    const userId = '11312701-f1d2-43f8-a13d-260eac812b7a';
    
    console.log('=== Testing Group Chat API ===');
    console.log('User ID:', userId);
    
    const requestBody = {
        prompt: 'Generate a "casual conversation" conversation',
        tankFishIds: [], // Empty for test
        userId: userId
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    try {
        const response = await fetch('http://localhost:3000/api/fish-api?action=group-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('Response body:', responseText);
        
        if (!response.ok) {
            console.error('❌ API Error - Status:', response.status);
            console.error('❌ API Error - Body:', responseText);
            
            // Try to parse as JSON for more details
            try {
                const errorData = JSON.parse(responseText);
                console.error('❌ Parsed error data:', JSON.stringify(errorData, null, 2));
            } catch (e) {
                console.error('❌ Could not parse error response as JSON');
            }
        } else {
            console.log('✅ API call successful');
            try {
                const result = JSON.parse(responseText);
                console.log('✅ Parsed result:', JSON.stringify(result, null, 2));
            } catch (e) {
                console.error('❌ Could not parse success response as JSON');
            }
        }
        
    } catch (error) {
        console.error('❌ Network/Fetch error:', error);
    }
}

// Run the test
testGroupChatAPI();
