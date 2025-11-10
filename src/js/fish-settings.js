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
        console.log('🔧 初始化设置页面...');
        
        // Get current user
        if (window.supabaseAuth && window.supabaseAuth.getCurrentUser) {
            currentUser = await window.supabaseAuth.getCurrentUser();
            if (!currentUser) {
                showError('请先登录');
                setTimeout(() => window.location.href = 'index.html', 2000);
                return;
            }
            console.log('✅ 当前用户:', currentUser.id);
        } else {
            showError('认证系统未加载');
            return;
        }

        // Load membership info
        await loadMembershipInfo();
        
        // Load user's fish
        await loadUserFish();
        
        // Render UI based on membership
        renderUI();
        
    } catch (error) {
        console.error('初始化失败:', error);
        showError('加载失败: ' + error.message);
    }
}

// Load membership information
async function loadMembershipInfo() {
    try {
        const query = `
            query GetUserMembership($userId: String!) {
                users_by_pk(id: $userId) {
                    id
                    user_subscription {
                        plan
                        is_active
                    }
                    fishes_aggregate {
                        aggregate {
                            count
                        }
                    }
                }
                global_params(where: {key: {_in: ["free_max_fish", "plus_max_fish", "premium_max_fish", "default_chat_frequency", "premium_chat_frequency_min", "premium_chat_frequency_max"]}}) {
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

        const result = await response.json();
        if (result.errors) {
            throw new Error(result.errors[0].message);
        }

        const user = result.data.users_by_pk;
        const globalParams = result.data.global_params;

        const params = globalParams.reduce((acc, param) => {
            acc[param.key] = parseInt(param.value, 10);
            return acc;
        }, {});

        let tier = 'free';
        if (user && user.user_subscription && user.user_subscription.plan) {
            tier = user.user_subscription.plan;
        }

        const currentFishCount = user ? user.fishes_aggregate.aggregate.count : 0;
        let maxFishCount = params.free_max_fish || 1;
        let canSpeak = false;
        let canAdjustFrequency = false;

        if (tier === 'plus') {
            maxFishCount = params.plus_max_fish || 5;
            canSpeak = true;
        } else if (tier === 'premium') {
            maxFishCount = params.premium_max_fish || 20;
            canSpeak = true;
            canAdjustFrequency = true;
        }

        userMembership = {
            tier,
            currentFishCount,
            maxFishCount,
            canSpeak,
            canAdjustFrequency,
            defaultChatFrequency: params.default_chat_frequency || 5,
            chatFrequencyMin: params.premium_chat_frequency_min || 1,
            chatFrequencyMax: params.premium_chat_frequency_max || 10
        };

        console.log('✅ 会员信息:', userMembership);
    } catch (error) {
        console.error('加载会员信息失败:', error);
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
        console.log(`✅ 加载了 ${userFishes.length} 条鱼`);
    } catch (error) {
        console.error('加载鱼列表失败:', error);
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

    membershipInfo.innerHTML = `
        <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
            <div style="font-size: 32px; font-weight: bold; color: ${tierColors[userMembership.tier]};">
                ${tierNames[userMembership.tier]}
            </div>
            <div>
                <p style="margin: 5px 0;">🐟 鱼数量: <strong>${userMembership.currentFishCount} / ${userMembership.maxFishCount}</strong></p>
                <p style="margin: 5px 0;">💬 AI聊天: <strong>${userMembership.canSpeak ? '✅ 已开启' : '❌ 未开启'}</strong></p>
                <p style="margin: 5px 0;">🗣️ 频率调节: <strong>${userMembership.canAdjustFrequency ? '✅ 已开启' : '❌ 未开启'}</strong></p>
            </div>
        </div>
    `;

    // Render fish count
    document.getElementById('fish-count').textContent = userMembership.currentFishCount;
    document.getElementById('fish-max').textContent = userMembership.maxFishCount;

    // Render fish list
    const fishList = document.getElementById('fish-list');
    if (userFishes.length === 0) {
        fishList.innerHTML = '<p style="text-align: center; color: #999;">您还没有创建任何鱼</p>';
    } else {
        fishList.innerHTML = userFishes.map(fish => `
            <div class="fish-card" style="display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 15px;">
                <img src="${fish.image_url}" alt="${fish.fish_name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 5px 0;">${fish.fish_name || '未命名'}</h3>
                    <p style="margin: 0; color: #666; font-size: 14px;">性格: ${fish.personality || '未知'}</p>
                    <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">创建于: ${new Date(fish.created_at).toLocaleDateString()}</p>
                </div>
                ${userMembership.canAdjustFrequency ? `
                    <div style="text-align: right;">
                        <label style="display: block; font-size: 12px; color: #666; margin-bottom: 5px;">说话频率</label>
                        <select 
                            data-fish-id="${fish.id}" 
                            class="chat-frequency-selector" 
                            style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;"
                            onchange="updateChatFrequency('${fish.id}', this.value)"
                        >
                            ${Array.from({length: 10}, (_, i) => i + 1).map(val => `
                                <option value="${val}" ${(fish.chat_frequency || 5) === val ? 'selected' : ''}>${val}次/小时</option>
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
        console.log(`🔧 更新鱼 ${fishId} 的说话频率为 ${frequency}`);
        
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
            console.log('✅ 更新成功');
            showSuccess('说话频率已更新！');
        } else {
            console.error('更新失败:', result.error);
            showError('更新失败: ' + result.message);
        }
    } catch (error) {
        console.error('更新频率失败:', error);
        showError('更新失败: ' + error.message);
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

