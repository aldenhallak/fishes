// Fish Settings Page Logic

const BACKEND_URL = window.BACKEND_URL || '';
const HASURA_ENDPOINT = window.HASURA_GRAPHQL_ENDPOINT || '';
const HASURA_SECRET = window.HASURA_ADMIN_SECRET || '';

let currentUser = null;
let userMembership = null;
let userFishes = [];

// Initialize page
async function initSettingsPage() {
    try {
        console.log('🔧 Initializing settings page...');
        
        // Get current user
        if (window.supabaseAuth && window.supabaseAuth.getCurrentUser) {
            currentUser = await window.supabaseAuth.getCurrentUser();
            if (!currentUser) {
                showError('Please login first');
                setTimeout(() => window.location.href = 'index.html', 2000);
                return;
            }
            console.log('✅ Current user:', currentUser.id);
        } else {
            showError('Authentication system not loaded');
            return;
        }

        // Load membership info
        await loadMembershipInfo();
        
        // Load user's fish
        await loadUserFish();
        
        // Render UI based on membership
        renderUI();
        
    } catch (error) {
        console.error('Initialization failed:', error);
        showError('Failed to load: ' + error.message);
    }
}

// Load membership information
async function loadMembershipInfo() {
    try {
        // Try to use relation query first (if foreign key is established)
        // Query latest active subscription (supports multiple subscriptions)
        let query = `
            query GetUserMembership($userId: String!) {
                users_by_pk(id: $userId) {
                    id
                    user_subscriptions(
                        where: { is_active: { _eq: true } }
                        order_by: { created_at: desc }
                        limit: 1
                    ) {
                        plan
                        is_active
                        member_type {
                            id
                            name
                            max_fish_count
                            can_self_talk
                            can_group_chat
                            can_promote_owner
                            promote_owner_frequency
                            lead_topic_frequency
                        }
                    }
                    fishes_aggregate {
                        aggregate {
                            count
                        }
                    }
                }
                global_params(where: {key: {_in: ["default_chat_frequency", "premium_chat_frequency_min", "premium_chat_frequency_max"]}}) {
                    key
                    value
                }
            }
        `;

        const response = await fetch(HASURA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': HASURA_SECRET
            },
            body: JSON.stringify({
                query,
                variables: { userId: currentUser.id }
            })
        });

        let result = await response.json();
        
        // If relation query failed, try manual matching
        const activeSubscription = result.data?.users_by_pk?.user_subscriptions?.[0];
        if (result.errors || !activeSubscription?.member_type) {
            console.log('Relation query not available, using manual matching');
            query = `
                query GetUserMembership($userId: String!) {
                    users_by_pk(id: $userId) {
                        id
                        user_subscriptions(
                            where: { is_active: { _eq: true } }
                            order_by: { created_at: desc }
                            limit: 1
                        ) {
                            plan
                            is_active
                        }
                        fishes_aggregate {
                            aggregate {
                                count
                            }
                        }
                    }
                    member_types {
                        id
                        name
                        max_fish_count
                        can_self_talk
                        can_group_chat
                        can_promote_owner
                        promote_owner_frequency
                        lead_topic_frequency
                    }
                    global_params(where: {key: {_in: ["default_chat_frequency", "premium_chat_frequency_min", "premium_chat_frequency_max"]}}) {
                        key
                        value
                    }
                }
            `;
            
            const response2 = await fetch(HASURA_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-hasura-admin-secret': HASURA_SECRET
                },
                body: JSON.stringify({
                    query,
                    variables: { userId: currentUser.id }
                })
            });
            
            result = await response2.json();
        }
        
        if (result.errors) {
            throw new Error(result.errors[0].message);
        }

        const user = result.data.users_by_pk;
        const globalParams = result.data.global_params || [];
        
        // Get latest active subscription (array first element)
        const activeSubscription = user?.user_subscriptions?.[0] || null;
        
        let memberType = null;
        let tier = 'free';
        
        // Check if we got member_type from relation query
        if (activeSubscription?.member_type) {
            memberType = activeSubscription.member_type;
            tier = memberType.id;
        } else if (activeSubscription?.plan) {
            // Use manual matching
            const memberTypes = result.data.member_types || [];
            const memberTypesMap = {};
            memberTypes.forEach(mt => {
                memberTypesMap[mt.id] = mt;
            });
            
            tier = activeSubscription.plan;
            memberType = memberTypesMap[tier] || memberTypesMap['free'] || null;
        }

        const currentFishCount = user ? user.fishes_aggregate.aggregate.count : 0;

        // Get chat frequency params from global_params
        const params = globalParams.reduce((acc, param) => {
            acc[param.key] = parseInt(param.value, 10);
            return acc;
        }, {});

        userMembership = {
            tier,
            currentFishCount,
            maxFishCount: memberType ? memberType.max_fish_count : 1,
            canSpeak: memberType ? memberType.can_self_talk : false,
            canSelfTalk: memberType ? memberType.can_self_talk : false,
            canGroupChat: memberType ? memberType.can_group_chat : false,
            canPromoteOwner: memberType ? memberType.can_promote_owner : false,
            promoteOwnerFrequency: memberType ? memberType.promote_owner_frequency : 0,
            leadTopicFrequency: memberType ? memberType.lead_topic_frequency : 0,
            canAdjustFrequency: tier === 'premium', // Premium 专属功能
            defaultChatFrequency: params.default_chat_frequency || 5,
            chatFrequencyMin: params.premium_chat_frequency_min || 1,
            chatFrequencyMax: params.premium_chat_frequency_max || 10,
            memberTypeName: memberType ? memberType.name : 'Free'
        };

        console.log('✅ Membership info:', userMembership);
    } catch (error) {
        console.error('Failed to load membership info:', error);
        throw error;
    }
}

// Load user's fish
async function loadUserFish() {
    try {
        const query = `
            query GetUserFish($userId: String!) {
                fish(where: {user_id: {_eq: $userId}, is_alive: {_eq: true}}, order_by: {created_at: desc}) {
                    id
                    fish_name
                    personality
                    image_url
                    chat_frequency
                    created_at
                }
            }
        `;

        const response = await fetch(HASURA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': HASURA_SECRET
            },
            body: JSON.stringify({
                query,
                variables: { userId: currentUser.id }
            })
        });

        const result = await response.json();
        if (result.errors) {
            throw new Error(result.errors[0].message);
        }

        userFishes = result.data.fish || [];
        console.log(`✅ Loaded ${userFishes.length} fish`);
    } catch (error) {
        console.error('Failed to load fish list:', error);
        throw error;
    }
}

// Render UI based on membership
function renderUI() {
    // Render membership info
    const membershipInfo = document.getElementById('membership-info');
    const tierColors = {
        free: '#999',
        plus: '#667eea',
        premium: '#ffd700'
    };
    const tierNames = {
        free: 'Free',
        plus: 'Plus',
        premium: 'Premium'
    };

    // Build upgrade suggestion
    let upgradeSuggestion = '';
    if (userMembership.tier === 'free') {
        upgradeSuggestion = '<p style="margin: 10px 0; padding: 10px; background: #fff3cd; border-radius: 4px; color: #856404;">💡 Upgrade to Plus or Premium membership to unlock more features!</p>';
    } else if (userMembership.tier === 'plus') {
        upgradeSuggestion = '<p style="margin: 10px 0; padding: 10px; background: #fff3cd; border-radius: 4px; color: #856404;">💡 Upgrade to Premium membership to unlock frequency adjustment!</p>';
    }

    membershipInfo.innerHTML = `
        <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
            <div style="font-size: 32px; font-weight: bold; color: ${tierColors[userMembership.tier]};">
                ${userMembership.memberTypeName || tierNames[userMembership.tier]}
            </div>
            <div style="flex: 1;">
                <p style="margin: 5px 0;">🐟 Fish Count: <strong>${userMembership.currentFishCount} / ${userMembership.maxFishCount}</strong></p>
                <p style="margin: 5px 0;">💬 Self-Talk: <strong>${userMembership.canSelfTalk ? '✅ Enabled' : '❌ Disabled'}</strong></p>
                <p style="margin: 5px 0;">👥 Group Chat: <strong>${userMembership.canGroupChat ? '✅ Enabled' : '❌ Disabled'}</strong></p>
                <p style="margin: 5px 0;">📢 Owner Promotion: <strong>${userMembership.canPromoteOwner ? `✅ Enabled (${userMembership.promoteOwnerFrequency}/hour)` : '❌ Disabled'}</strong></p>
                <p style="margin: 5px 0;">🗣️ Frequency Adjustment: <strong>${userMembership.canAdjustFrequency ? '✅ Enabled' : '❌ Disabled'}</strong></p>
                ${upgradeSuggestion}
            </div>
        </div>
    `;

    // Render fish count
    document.getElementById('fish-count').textContent = userMembership.currentFishCount;
    document.getElementById('fish-max').textContent = userMembership.maxFishCount;

    // Render fish list
    const fishList = document.getElementById('fish-list');
    if (userFishes.length === 0) {
        fishList.innerHTML = '<p style="text-align: center; color: #999;">You haven\'t created any fish yet</p>';
    } else {
        fishList.innerHTML = userFishes.map(fish => `
            <div class="fish-card" style="display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 15px;">
                <img src="${fish.image_url}" alt="${fish.fish_name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 5px 0;">${fish.fish_name || 'Unnamed'}</h3>
                    <p style="margin: 0; color: #666; font-size: 14px;">Personality: ${fish.personality || 'Unknown'}</p>
                    <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">Created: ${new Date(fish.created_at).toLocaleDateString()}</p>
                </div>
                ${userMembership.canAdjustFrequency ? `
                    <div style="text-align: right;">
                        <label style="display: block; font-size: 12px; color: #666; margin-bottom: 5px;">Chat Frequency</label>
                        <select 
                            data-fish-id="${fish.id}" 
                            class="chat-frequency-selector" 
                            style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;"
                            onchange="updateChatFrequency('${fish.id}', this.value)"
                        >
                            ${Array.from({length: 10}, (_, i) => i + 1).map(val => `
                                <option value="${val}" ${(fish.chat_frequency || 5) === val ? 'selected' : ''}>${val}/hour</option>
                            `).join('')}
                        </select>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // Show/hide sections based on membership
    if (userMembership.canAdjustFrequency) {
        document.getElementById('chat-frequency-section').style.display = 'block';
        document.getElementById('locked-features').style.display = 'none';
    } else {
        document.getElementById('chat-frequency-section').style.display = 'none';
        document.getElementById('locked-features').style.display = 'block';
    }
}

// Update chat frequency
async function updateChatFrequency(fishId, frequency) {
    try {
        console.log(`🔧 Updating fish ${fishId} chat frequency to ${frequency}`);
        
        const response = await fetch(`${BACKEND_URL}/api/fish/update-chat-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                fishId,
                chatFrequency: parseInt(frequency, 10)
            })
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Update successful');
            showSuccess('Chat frequency updated!');
        } else {
            console.error('Update failed:', result.error);
            showError('Update failed: ' + result.message);
        }
    } catch (error) {
        console.error('Failed to update frequency:', error);
        showError('Update failed: ' + error.message);
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 4000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// Export function to window
window.updateChatFrequency = updateChatFrequency;

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettingsPage);
} else {
    initSettingsPage();
}

