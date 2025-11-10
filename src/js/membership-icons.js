/**
 * 会员等级图标管理
 */

/**
 * 获取会员等级对应的图标和样式
 * @param {string} tier - 会员等级: 'free', 'plus', 'premium'
 * @returns {Object} 包含图标、颜色、徽章等信息
 */
function getMembershipIcon(tier) {
    const icons = {
        free: {
            icon: '🐟',
            emoji: '🐟',
            text: 'Free',
            color: '#95A5A6',
            bgColor: '#ECF0F1',
            borderColor: '#BDC3C7',
            description: '免费会员'
        },
        plus: {
            icon: '⭐',
            emoji: '⭐',
            text: 'Plus',
            color: '#F39C12',
            bgColor: '#FEF5E7',
            borderColor: '#F39C12',
            description: 'Plus会员'
        },
        premium: {
            icon: '👑',
            emoji: '👑',
            text: 'Premium',
            color: '#9B59B6',
            bgColor: '#F4ECF7',
            borderColor: '#9B59B6',
            description: 'Premium会员'
        }
    };
    
    return icons[tier] || icons.free;
}

/**
 * 创建会员等级徽章DOM元素
 * @param {string} tier - 会员等级
 * @param {Object} options - 配置选项
 * @returns {HTMLElement} 徽章元素
 */
function createMembershipBadge(tier, options = {}) {
    const {
        size = 'medium', // 'small', 'medium', 'large'
        showText = false,
        className = ''
    } = options;
    
    const iconData = getMembershipIcon(tier);
    const badge = document.createElement('div');
    badge.className = `membership-badge membership-${tier} ${className}`;
    badge.setAttribute('data-tier', tier);
    badge.setAttribute('title', iconData.description);
    
    // 根据尺寸设置样式
    const sizes = {
        small: { width: '24px', height: '24px', fontSize: '14px' },
        medium: { width: '40px', height: '40px', fontSize: '20px' },
        large: { width: '80px', height: '80px', fontSize: '40px' }
    };
    
    const sizeStyle = sizes[size] || sizes.medium;
    
    badge.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: ${sizeStyle.width};
        height: ${sizeStyle.height};
        border-radius: 50%;
        background: ${iconData.bgColor};
        border: 2px solid ${iconData.borderColor};
        font-size: ${sizeStyle.fontSize};
        position: relative;
        flex-shrink: 0;
    `;
    
    badge.innerHTML = iconData.emoji;
    
    if (showText) {
        const textSpan = document.createElement('span');
        textSpan.className = 'membership-text';
        textSpan.textContent = iconData.text;
        textSpan.style.cssText = `
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            font-weight: 600;
            color: ${iconData.color};
            white-space: nowrap;
        `;
        badge.appendChild(textSpan);
    }
    
    return badge;
}

/**
 * 创建简单的会员等级图标（用于小图标显示）
 * @param {string} tier - 会员等级
 * @returns {HTMLElement} 图标元素
 */
function createMembershipIcon(tier) {
    const iconData = getMembershipIcon(tier);
    const icon = document.createElement('span');
    icon.className = `membership-icon membership-icon-${tier}`;
    icon.setAttribute('title', iconData.description);
    icon.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${iconData.bgColor};
        border: 1px solid ${iconData.borderColor};
        font-size: 12px;
    `;
    icon.textContent = iconData.emoji;
    return icon;
}

/**
 * 异步获取用户的会员等级
 * @param {string} userId - 用户ID
 * @returns {Promise<string>} 会员等级
 */
async function getUserMembershipTier(userId) {
    if (!userId) return 'free';
    
    const HASURA_ENDPOINT = 'https://fishtalk.hasura.app/v1/graphql';
    const query = `
        query GetUserSubscription($userId: String!) {
            user_subscriptions(where: {user_id: {_eq: $userId}}) {
                plan
                is_active
            }
        }
    `;

    try {
        const response = await fetch(HASURA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query,
                variables: { userId }
            })
        });

        const result = await response.json();
        
        if (result.errors) {
            console.error('GraphQL errors:', result.errors);
            return 'free';
        }

        const subscriptions = result.data.user_subscriptions;
        
        if (!subscriptions || subscriptions.length === 0 || !subscriptions[0].is_active) {
            return 'free';
        }

        return (subscriptions[0].plan || 'free').toLowerCase();
    } catch (error) {
        console.error('查询会员等级失败:', error);
        return 'free';
    }
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getMembershipIcon,
        createMembershipBadge,
        createMembershipIcon,
        getUserMembershipTier
    };
}

