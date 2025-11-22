/**
 * Membership Page Logic
 * 会员套餐页面逻辑
 */

const BACKEND_URL = window.BACKEND_URL || '';

let currentUser = null;
let currentPlan = 'free';
let memberTypes = [];

// 初始化页面
async function initMembershipPage() {
    try {
        console.log('💎 Initializing membership page...');
        
        // 获取当前用户
        if (window.supabaseAuth && window.supabaseAuth.getCurrentUser) {
            currentUser = await window.supabaseAuth.getCurrentUser();
            if (currentUser) {
                console.log('✅ Current user:', currentUser.id);
                await loadCurrentMembership();
            }
        }
        
        // 加载会员套餐数据
        await loadMemberTypes();
        
        // 渲染套餐卡片
        renderPlanCards();
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showError('Failed to load membership plans: ' + error.message);
    }
}

// 加载当前会员信息
async function loadCurrentMembership() {
    if (!currentUser) return;
    
    try {
        const query = `
            query GetUserMembership($userId: String!) {
                users_by_pk(id: $userId) {
                    user_subscriptions(
                        where: { is_active: { _eq: true } }
                        order_by: { created_at: desc }
                        limit: 1
                    ) {
                        plan
                    }
                }
            }
        `;
        
        const response = await fetch(`${BACKEND_URL}/api/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query,
                variables: { userId: currentUser.id }
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.errors) {
            throw new Error(result.errors[0].message);
        }
        
        if (result.data?.users_by_pk?.user_subscriptions?.[0]) {
            currentPlan = result.data.users_by_pk.user_subscriptions[0].plan;
            console.log('✅ Current plan:', currentPlan);
        }
    } catch (error) {
        console.error('❌ Failed to load current membership:', error);
    }
}

// 加载会员类型数据
async function loadMemberTypes() {
    try {
        const query = `
            query GetMemberTypes {
                member_types(order_by: { fee_per_month: asc }) {
                    id
                    name
                    draw_fish_limit
                    can_self_talk
                    can_group_chat
                    can_promote_owner
                    group_chat_daily_limit
                    fee_per_month
                    fee_per_year
                }
            }
        `;
        
        const response = await fetch(`${BACKEND_URL}/api/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });
        
        if (!response.ok) {
            const text = await response.text();
            console.error('❌ HTTP error:', response.status, response.statusText);
            console.error('Response text:', text.substring(0, 200));
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.errors) {
            throw new Error(result.errors[0].message);
        }
        
        memberTypes = result.data.member_types || [];
        
        // 过滤掉管理员计划
        memberTypes = memberTypes.filter(type => type.id !== 'admin');
        
        console.log('✅ Loaded member types:', memberTypes);
        console.log('🔍 Raw values:', memberTypes.map(t => ({ 
            id: t.id, 
            draw_fish_limit: t.draw_fish_limit,
            fee_per_month: t.fee_per_month, 
            fee_per_year: t.fee_per_year,
            type_draw_limit: typeof t.draw_fish_limit,
            type_month: typeof t.fee_per_month,
            type_year: typeof t.fee_per_year
        })));
        
        // 转换 fee_per_month 和 fee_per_year 为数字，保留 draw_fish_limit
        memberTypes = memberTypes.map(type => {
            // fee_per_month 是 numeric 类型，可能是字符串、数字或 null
            let monthlyPrice = 0;
            if (type.fee_per_month !== null && type.fee_per_month !== undefined) {
                const parsed = parseFloat(type.fee_per_month);
                if (!isNaN(parsed) && parsed >= 0) {
                    monthlyPrice = parsed;
                }
            }
            
            // fee_per_year 从数据库获取
            let yearlyPrice = 0;
            if (type.fee_per_year !== null && type.fee_per_year !== undefined) {
                const parsed = parseFloat(type.fee_per_year);
                if (!isNaN(parsed) && parsed >= 0) {
                    yearlyPrice = parsed;
                }
            }
            
            // draw_fish_limit 是 String 类型，直接保留
            const drawFishLimit = type.draw_fish_limit || null;
            
            console.log(`💰 ${type.id}: draw_fish_limit=${drawFishLimit}, fee_per_month=${type.fee_per_month} -> monthly_price=${monthlyPrice}, fee_per_year=${type.fee_per_year} -> yearly_price=${yearlyPrice}`);
            
            return {
                ...type,
                draw_fish_limit: drawFishLimit,
                monthly_price: monthlyPrice,
                yearly_price: yearlyPrice
            };
        });
        
        // 检查是否有任何价格数据
        const hasAnyPrice = memberTypes.some(type => type.monthly_price > 0 || (type.fee_per_month !== null && type.fee_per_month !== undefined));
        
        // 如果没有价格数据，使用默认值（但保留从数据库获取的其他数据）
        if (!hasAnyPrice && memberTypes.length > 0) {
            console.warn('⚠️ No price data found in database, using defaults');
            memberTypes = memberTypes.map(type => {
                const defaults = {
                    free: { monthly: 0, yearly: 0 },
                    plus: { monthly: 9.99, yearly: 99.99 },
                    premium: { monthly: 19.99, yearly: 199.99 }
                };
                const def = defaults[type.id] || defaults.free;
                return {
                    ...type,
                    monthly_price: def.monthly,
                    yearly_price: def.yearly
                };
            });
        }
    } catch (error) {
        console.error('❌ Failed to load member types:', error);
        // 使用默认数据
        memberTypes = [
            {
                id: 'free',
                name: 'Free',
                draw_fish_limit: '1',
                can_self_talk: false,
                can_group_chat: false,
                can_promote_owner: false,
                monthly_price: 0,
                yearly_price: 0
            },
            {
                id: 'plus',
                name: 'Plus',
                draw_fish_limit: '5',
                can_self_talk: true,
                can_group_chat: true,
                can_promote_owner: true,
                monthly_price: 9.99,
                yearly_price: 99.99
            },
            {
                id: 'premium',
                name: 'Premium',
                draw_fish_limit: '20',
                can_self_talk: true,
                can_group_chat: true,
                can_promote_owner: true,
                monthly_price: 19.99,
                yearly_price: 199.99
            }
        ];
    }
}

// 渲染套餐卡片
function renderPlanCards() {
    const container = document.getElementById('plans-grid');
    if (!container) {
        console.error('❌ Plans grid container not found');
        return;
    }
    
    container.innerHTML = '';
    
    memberTypes.forEach(plan => {
        const card = createPlanCard(plan);
        container.appendChild(card);
    });
}

// 创建套餐卡片
function createPlanCard(plan) {
    const card = document.createElement('div');
    card.className = `plan-card ${plan.id}`;
    
    const isCurrentPlan = currentUser && currentPlan === plan.id;
    const isUpgrade = currentUser && shouldShowUpgrade(plan.id);
    
    // 获取会员等级对应的钻石图标
    const iconData = typeof getMembershipIcon === 'function' ? getMembershipIcon(plan.id) : null;
    const badgeIconUrl = iconData ? iconData.svgUrl : '';
    
    // Plus 使用 emoji，其他使用 SVG
    const isPlus = plan.id === 'plus';
    const badgeIcon = isPlus ? '💎' : `<img src="${badgeIconUrl}" alt="${plan.name}" class="plan-badge-icon" style="width: 48px; height: 48px; min-width: 48px; min-height: 48px; max-width: 48px; max-height: 48px; object-fit: contain; display: block;">`;
    
    // 生成唯一ID用于价格切换器
    const priceToggleId = `price-toggle-${plan.id}`;
    
    card.innerHTML = `
        <div class="plan-badge ${plan.id}">
            ${isPlus ? `<span class="plan-badge-emoji" style="font-size: 48px; line-height: 48px; display: inline-block; width: 48px; height: 48px; text-align: center;">${badgeIcon}</span>` : badgeIcon}
            <span class="plan-badge-text">${plan.name}</span>
        </div>
        
        <div class="plan-price">
            <div class="plan-price-wrapper">
                <div class="plan-price-amount" id="price-amount-${plan.id}">$${plan.monthly_price.toFixed(2)}</div>
                ${plan.yearly_price > 0 ? `
                    <div class="plan-price-toggle">
                        <div class="price-toggle-labels">
                            <span class="price-toggle-label monthly" id="label-monthly-${plan.id}">Monthly</span>
                            <label class="price-toggle-switch">
                                <input type="checkbox" id="${priceToggleId}" class="price-toggle-input" onchange="handlePriceToggle('${plan.id}', ${plan.monthly_price}, ${plan.yearly_price})">
                                <span class="price-toggle-slider"></span>
                            </label>
                            <span class="price-toggle-label yearly" id="label-yearly-${plan.id}">Yearly</span>
                        </div>
                    </div>
                ` : ''}
            </div>
            ${plan.yearly_price > 0 ? `
                <div class="plan-price-savings" id="price-savings-${plan.id}" style="display: none;">
                    <span style="color: #4CD964; font-weight: 700; font-size: 14px;">
                        Save ${Math.round((1 - plan.yearly_price / (plan.monthly_price * 12)) * 100)}%
                    </span>
                </div>
            ` : ''}
        </div>
        
        <ul class="plan-features">
            <li>
                <span class="feature-icon">✅</span>
                <span class="feature-text">Draw your fish${plan.draw_fish_limit && plan.draw_fish_limit !== 'unlimited' ? ` (${plan.draw_fish_limit} per day)` : plan.draw_fish_limit === 'unlimited' ? ' (unlimited)' : ''}</span>
            </li>
            <li>
                <span class="feature-icon">✅</span>
                <span class="feature-text">AI fish Group Chat${plan.group_chat_daily_limit && plan.group_chat_daily_limit !== 'unlimited' ? ` (${plan.group_chat_daily_limit} per day)` : plan.group_chat_daily_limit === 'unlimited' ? ' (unlimited)' : ''}</span>
            </li>
            <li>
                <span class="feature-icon">${plan.id === 'free' ? '❌' : '✅'}</span>
                <span class="feature-text">Fish talk about you</span>
            </li>
            <li>
                <span class="feature-icon">${plan.id === 'free' ? '❌' : '✅'}</span>
                <span class="feature-text">Join fish chat</span>
            </li>
        </ul>
        
        <button 
            class="plan-button ${isCurrentPlan ? 'current' : isUpgrade ? 'upgrade ' + plan.id : ''}" 
            data-plan-id="${plan.id}"
            data-billing-period="monthly"
            ${isCurrentPlan ? 'disabled' : ''}
            onclick="handlePlanButtonClick('${plan.id}')"
        >
            ${isCurrentPlan ? 'Current Plan' : isUpgrade ? 'Upgrade Now ✨' : plan.id === 'free' ? 'Get Started' : 'Upgrade Now ✨'}
        </button>
    `;
    
    return card;
}

// 处理价格切换（按月/按年）
function handlePriceToggle(planId, monthlyPrice, yearlyPrice) {
    const toggle = document.getElementById(`price-toggle-${planId}`);
    const priceAmount = document.getElementById(`price-amount-${planId}`);
    const priceSavings = document.getElementById(`price-savings-${planId}`);
    const planButton = document.querySelector(`.plan-card.${planId} .plan-button`);
    const monthlyLabel = document.getElementById(`label-monthly-${planId}`);
    const yearlyLabel = document.getElementById(`label-yearly-${planId}`);
    
    if (!toggle || !priceAmount) return;
    
    if (toggle.checked) {
        // 切换到年度
        priceAmount.textContent = `$${yearlyPrice.toFixed(2)}`;
        if (priceSavings) priceSavings.style.display = 'block';
        if (planButton) planButton.setAttribute('data-billing-period', 'yearly');
        if (monthlyLabel) monthlyLabel.style.color = '#666';
        if (yearlyLabel) yearlyLabel.style.color = '#4CD964';
    } else {
        // 切换到月度
        priceAmount.textContent = `$${monthlyPrice.toFixed(2)}`;
        if (priceSavings) priceSavings.style.display = 'none';
        if (planButton) planButton.setAttribute('data-billing-period', 'monthly');
        if (monthlyLabel) monthlyLabel.style.color = '#4CD964';
        if (yearlyLabel) yearlyLabel.style.color = '#666';
    }
}

// 判断是否应该显示升级按钮
function shouldShowUpgrade(planId) {
    if (!currentUser) return false;
    if (planId === 'free') return false;
    
    const planOrder = { free: 0, plus: 1, premium: 2 };
    const currentOrder = planOrder[currentPlan] || 0;
    const targetOrder = planOrder[planId] || 0;
    
    return targetOrder > currentOrder;
}

// 处理套餐按钮点击
async function handlePlanButtonClick(planId) {
    if (!currentUser) {
        // 未登录，跳转到登录页面
        if (window.authUI && window.authUI.showLoginModal) {
            window.authUI.showLoginModal();
        } else {
            window.location.href = 'login.html';
        }
        return;
    }
    
    if (planId === 'free') {
        // Free计划，不需要支付
        alert('Free plan is already available to all users!');
        return;
    }
    
    // 检查是否已经是该计划
    if (currentPlan === planId) {
        alert('You are already on this plan!');
        return;
    }
    
    // 检查是否是降级
    const planOrder = { free: 0, plus: 1, premium: 2 };
    const currentOrder = planOrder[currentPlan] || 0;
    const targetOrder = planOrder[planId] || 0;
    
    if (targetOrder < currentOrder) {
        if (!confirm('Are you sure you want to downgrade? Your current features will be limited.')) {
            return;
        }
    }
    
    // 获取选择的计费周期
    const planButton = document.querySelector(`.plan-card.${planId} .plan-button`);
    const billingPeriod = planButton ? (planButton.getAttribute('data-billing-period') || 'monthly') : 'monthly';
    
    // 创建支付会话
    try {
        showLoading('Creating checkout session...');
        
        const response = await fetch('/api/payment/create-checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                planId: planId,
                billingPeriod: billingPeriod
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to create checkout session');
        }
        
        if (result.url) {
            // 重定向到Stripe Checkout
            window.location.href = result.url;
        } else {
            throw new Error('No checkout URL returned');
        }
    } catch (error) {
        console.error('❌ Checkout error:', error);
        hideLoading();
        showError('Failed to start checkout: ' + error.message);
    }
}

// 显示加载状态
function showLoading(message) {
    // 可以添加加载提示
    console.log('⏳', message);
}

// 隐藏加载状态
function hideLoading() {
    // 可以移除加载提示
}

// 显示错误
function showError(message) {
    alert('Error: ' + message);
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMembershipPage);
} else {
    initMembershipPage();
}

// 导出函数供全局使用
window.handlePlanButtonClick = handlePlanButtonClick;
window.handlePriceToggle = handlePriceToggle;

