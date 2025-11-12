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
            svgUrl: 'https://cdn.fishart.online/fishart_web/icon/free.svg',
            text: 'Free',
            color: '#8a8a8a', // 灰色
            bgColor: 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)',
            borderColor: '#8a8a8a',
            shadowColor: 'rgba(138, 138, 138, 0.5)',
            description: '免费会员'
        },
        plus: {
            icon: '🐠',
            emoji: '🐠',
            svgUrl: 'https://cdn.fishart.online/fishart_web/icon/plus.svg',
            text: 'Plus',
            color: '#4EC6BF', // 青色
            bgColor: 'linear-gradient(135deg, #E4FBFC 0%, #B4ECEF 100%)',
            borderColor: '#4EC6BF',
            shadowColor: 'rgba(78, 198, 191, 0.6)',
            description: 'Plus会员'
        },
        premium: {
            icon: '🐡',
            emoji: '🐡',
            svgUrl: 'https://cdn.fishart.online/fishart_web/icon/premium.svg',
            text: 'Premium',
            color: '#D786EA', // 紫色/金色
            bgColor: 'linear-gradient(135deg, #F4ECF7 0%, #E8D5F0 100%)',
            borderColor: '#D786EA',
            shadowColor: 'rgba(215, 134, 234, 0.6)',
            description: 'Premium会员'
        }
    };
    
    return icons[tier] || icons.free;
}

/**
 * 创建会员等级徽章DOM元素（3D鱼图标）
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
        small: { width: '24px', height: '24px', fontSize: '14px', shadowSize: '8px' },
        medium: { width: '40px', height: '40px', fontSize: '20px', shadowSize: '12px' },
        large: { width: '80px', height: '80px', fontSize: '60px', shadowSize: '20px' }
    };
    
    const sizeStyle = sizes[size] || sizes.medium;
    
    // 创建3D鱼图标（使用SVG图标）
    const fishIcon = document.createElement('div');
    fishIcon.className = `membership-fish-icon membership-fish-${tier}`;
    fishIcon.style.cssText = `
        display: inline-block;
        width: ${sizeStyle.width};
        height: ${sizeStyle.height};
        position: relative;
        filter: none;
        transform: none;
        transition: all 0.3s ease;
    `;
    
    // 创建SVG图片元素
    const svgImg = document.createElement('img');
    svgImg.src = iconData.svgUrl;
    svgImg.alt = iconData.text;
    svgImg.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
    `;
    fishIcon.appendChild(svgImg);
    
    // 不添加高光效果，只显示纯图标
    
    // 移除背景、边框、阴影，只显示图标
    badge.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: ${sizeStyle.width};
        height: ${sizeStyle.height};
        position: relative;
        flex-shrink: 0;
        background: transparent;
        border: none;
        box-shadow: none;
    `;
    
    badge.appendChild(fishIcon);
    
    // 移除所有hover动画效果
    
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
 * 创建简单的会员等级图标（用于小图标显示，3D鱼图标）
 * @param {string} tier - 会员等级
 * @returns {HTMLElement} 图标元素
 */
function createMembershipIcon(tier) {
    const iconData = getMembershipIcon(tier);
    const icon = document.createElement('span');
    icon.className = `membership-icon membership-icon-${tier}`;
    icon.setAttribute('title', iconData.description);
    
    // 创建3D鱼图标（使用SVG图标）
    const fishIcon = document.createElement('div');
    fishIcon.style.cssText = `
        display: inline-block;
        width: 20px;
        height: 20px;
        position: relative;
        filter: none;
        transform: none;
        transition: all 0.2s ease;
    `;
    
    // 创建SVG图片元素
    const svgImg = document.createElement('img');
    svgImg.src = iconData.svgUrl;
    svgImg.alt = iconData.text;
    svgImg.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
    `;
    fishIcon.appendChild(svgImg);
    
    // 移除背景、边框、阴影，只显示图标
    icon.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        position: relative;
        background: transparent;
        border: none;
        box-shadow: none;
    `;
    
    icon.appendChild(fishIcon);
    return icon;
}

/**
 * 异步获取用户的会员等级
 * @param {string} userId - 用户ID
 * @returns {Promise<string>} 会员等级
 */
async function getUserMembershipTier(userId) {
    if (!userId) return 'free';
    
    // 使用API代理而不是直接访问Hasura，避免CORS问题
    const query = `
        query GetUserSubscription($userId: String!) {
            user_subscriptions(
                where: {
                    user_id: {_eq: $userId}
                    is_active: {_eq: true}
                }
                order_by: {created_at: desc}
                limit: 1
            ) {
                plan
                is_active
            }
        }
    `;

    try {
        // 通过API代理访问GraphQL，避免CORS问题
        const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query,
                variables: { userId }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.errors) {
            console.error('GraphQL errors:', result.errors);
            return 'free';
        }

        const subscriptions = result.data?.user_subscriptions;
        
        if (!subscriptions || subscriptions.length === 0) {
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

