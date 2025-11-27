// Profile page functionality

// Get user profile data from Hasura
async function getUserProfileFromHasura(userId) {
    try {
        const query = `
            query GetUserProfile($userId: String!) {
                users_by_pk(id: $userId) {
                    id
                    nick_name
                    email
                    avatar_url
                    created_at
                    total_fish_created
                    reputation_score
                    user_language
                    about_me
                    fish_talk
                    user_subscriptions(
                        order_by: { created_at: desc }
                        limit: 5
                    ) {
                        plan
                        is_active
                        created_at
                        member_type {
                            id
                            name
                        }
                    }
                    fishes_aggregate {
                        aggregate {
                            count
                            sum {
                                upvotes
                            }
                        }
                    }
                }
                fish_favorites_aggregate(where: {user_id: {_eq: $userId}}) {
                    aggregate {
                        count
                    }
                }
            }
        `;

        const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
            throw new Error(result.errors[0].message);
        }

        if (!result.data.users_by_pk) {
            throw new Error('User not found');
        }

        const user = result.data.users_by_pk;
        
        // Get favorite count from separate query
        const favoriteCount = result.data.fish_favorites_aggregate?.aggregate?.count || 0;
        
        // Get membership info
        // Get all subscriptions and find the active one or latest one
        const subscriptions = user.user_subscriptions || [];
        
        // Debug: 输出所有订阅信息
        console.log('🔍 All subscriptions:', subscriptions.map(sub => ({
            plan: sub.plan,
            is_active: sub.is_active,
            created_at: sub.created_at,
            member_type_id: sub.member_type?.id,
            member_type_name: sub.member_type?.name
        })));
        
        // Find active subscription (is_active = true or null)
        // Also check if plan is not 'free'
        let activeSubscription = subscriptions.find(sub => 
            (sub.is_active === true || sub.is_active === null) && 
            sub.plan && 
            sub.plan.toLowerCase() !== 'free'
        );
        
        // If no active non-free subscription, try to find any active subscription
        if (!activeSubscription) {
            activeSubscription = subscriptions.find(sub => 
                sub.is_active === true || sub.is_active === null
            );
        }
        
        // If still no active subscription found, use the latest one (already sorted by created_at desc)
        const latestSubscription = activeSubscription || (subscriptions.length > 0 ? subscriptions[0] : null);
        
        // Debug logging for subscription data
        console.log('🔍 Subscription selection:', {
            userId: user.id,
            subscriptionsCount: subscriptions.length,
            activeSubscription: activeSubscription ? {
                plan: activeSubscription.plan,
                is_active: activeSubscription.is_active,
                member_type_id: activeSubscription.member_type?.id
            } : null,
            latestSubscription: latestSubscription ? {
                plan: latestSubscription.plan,
                is_active: latestSubscription.is_active,
                member_type_id: latestSubscription.member_type?.id
            } : null
        });
        
        // Determine membership tier
        // Priority: plan field > member_type.id > default to 'free'
        let membershipTier = 'free';
        let membershipName = 'Free';
        
        if (latestSubscription) {
            // Use plan field if available (most reliable)
            if (latestSubscription.plan) {
                membershipTier = latestSubscription.plan.toLowerCase().trim();
                console.log('✅ Using plan field for tier:', membershipTier);
            } 
            // Fallback to member_type.id
            else if (latestSubscription.member_type?.id) {
                membershipTier = latestSubscription.member_type.id.toLowerCase().trim();
                console.log('✅ Using member_type.id for tier:', membershipTier);
            }
            
            // Get membership name
            if (latestSubscription.member_type?.name) {
                membershipName = latestSubscription.member_type.name;
            } else {
                // Fallback name based on tier
                const tierNames = {
                    'free': 'Free',
                    'plus': 'Plus',
                    'premium': 'Premium'
                };
                membershipName = tierNames[membershipTier] || 'Free';
            }
        } else {
            console.log('⚠️ No subscription found, defaulting to free');
        }
        
        // Debug logging
        console.log('📊 Profile data:', {
            userId: user.id,
            fishCount: user.fishes_aggregate.aggregate.count || 0,
            favoriteCount: favoriteCount,
            membershipTier: membershipTier,
            membershipName: membershipName,
            subscriptionPlan: latestSubscription?.plan,
            subscriptionIsActive: latestSubscription?.is_active
        });
        
        // Transform to match expected profile format
        return {
            userId: user.id,
            displayName: user.nick_name,
            artistName: user.nick_name,
            nickName: user.nick_name || '', // 用户昵称
            email: user.email,
            avatarUrl: user.avatar_url,
            createdAt: user.created_at,
            fishCount: user.fishes_aggregate.aggregate.count || 0,
            totalScore: user.fishes_aggregate.aggregate.sum?.upvotes || 0,
            totalUpvotes: user.fishes_aggregate.aggregate.sum?.upvotes || 0,
            reputationScore: user.reputation_score || 0,
            favoriteCount: favoriteCount,
            userLanguage: user.user_language || '',
            aboutMe: user.about_me || '',
            fishTalk: user.fish_talk || false,
            membershipTier: membershipTier,
            membershipName: membershipName
        };
    } catch (error) {
        console.error('Error fetching profile from Hasura:', error);
        throw error;
    }
}

// Alias for backward compatibility
async function getUserProfile(userId) {
    return await getUserProfileFromHasura(userId);
}

// Update action button links based on the profile being viewed
function updateActionButtons(profile, profileUserId, isCurrentUser, isLoggedIn = true) {
    const viewFishBtn = document.getElementById('view-fish-btn');
    const visitTankBtn = document.getElementById('visit-tank-btn');
    const shareProfileBtn = document.querySelector('.profile-actions button[onclick="shareProfile()"]');
    const displayName = getDisplayName(profile);

    // 隐藏"View My Fish"按钮
    if (viewFishBtn) {
        viewFishBtn.style.display = 'none';
    }
    
    // 隐藏"Share Profile"按钮
    if (shareProfileBtn) {
        shareProfileBtn.style.display = 'none';
    }

    if (isCurrentUser) {
        // For current user, show their private tank
        visitTankBtn.href = 'tank.html?view=my';
        visitTankBtn.textContent = 'My Tank';

        // Show edit profile button for current user only if logged in
        if (isLoggedIn) {
            showEditProfileButton();
        } else {
            hideEditProfileButton();
        }
    } else {
        // For other users, hide the tank button (or link to their public fish)
        visitTankBtn.style.display = 'none';
        
        // Hide edit profile button for other users
        hideEditProfileButton();
    }
}

// Helper function to get display name for buttons
function getDisplayName(profile) {
    // Use the profile data directly, with artistName as fallback
    if (profile && profile.displayName && profile.displayName !== 'Anonymous User') {
        return profile.displayName;
    }
    
    if (profile && profile.artistName && profile.artistName !== 'Anonymous User') {
        return profile.artistName;
    }

    // Fallback to just "User" if no display name or artist name
    return 'User';
}

// Display user profile
function displayProfile(profile, searchedUserId = null) {
    // Store current profile data for editing
    currentProfile = profile;

    // Get avatar initial
    const nameForInitial = profile.displayName || profile.artistName || 'User';
    const initial = nameForInitial.charAt(0).toUpperCase();

    // Format dates safely - handle Firestore timestamp format
    let createdDate = 'Unknown';
    if (profile.createdAt) {
        let date;
        
        // Handle Firestore timestamp format
        if (profile.createdAt._seconds) {
            // Convert Firestore timestamp to JavaScript Date
            date = new Date(profile.createdAt._seconds * 1000);
        } else {
            // Handle regular date string/number
            date = new Date(profile.createdAt);
        }
        
        if (!isNaN(date.getTime())) {
            createdDate = date.toLocaleDateString();
        }
    }

    // Check if this is the current user's profile
    const token = localStorage.getItem('userToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userIdFromStorage = localStorage.getItem('userId');
    const currentUserId = userIdFromStorage || userData.uid || userData.userId || userData.id || userData.email;

    // Use the searched userId if provided, otherwise try to get it from profile
    const profileUserId = searchedUserId || profile.userId || profile.userEmail || profile.id;
    const isCurrentUser = currentUserId && (currentUserId === profileUserId);
    const isLoggedIn = !!(token && userData);

    // Update profile display - use membership icon instead of initial
    const membershipTier = profile.membershipTier || 'free';
    const membershipName = profile.membershipName || (membershipTier === 'free' ? 'Free' : membershipTier === 'plus' ? 'Plus' : 'Premium');
    
    // Debug: 输出会员等级信息
    console.log('🎯 Displaying profile with membership:', {
        membershipTier: membershipTier,
        membershipName: membershipName,
        profileData: profile
    });
    
    // Clear avatar and add membership icon
    const avatarElement = document.getElementById('profile-avatar');
    if (!avatarElement) {
        console.error('❌ profile-avatar element not found');
        return;
    }
    
    avatarElement.innerHTML = '';
    
    if (typeof createMembershipBadge === 'function') {
        console.log('✅ Using createMembershipBadge for tier:', membershipTier);
        const membershipBadge = createMembershipBadge(membershipTier, { size: 'large' });
        avatarElement.appendChild(membershipBadge);
        
        // 验证图标是否正确创建
        const img = membershipBadge.querySelector('img');
        if (img) {
            console.log('✅ Membership badge created with image:', img.src);
        } else {
            console.warn('⚠️ Membership badge created but no image found');
        }
    } else {
        // Fallback to SVG icons if membership-icons.js is not loaded
        console.log('⚠️ createMembershipBadge not available, using fallback for tier:', membershipTier);
        const svgMap = {
            'free': 'https://cdn.fishart.online/fishart_web/icon/free.svg',
            'plus': 'https://cdn.fishart.online/fishart_web/icon/plus.svg',
            'premium': 'https://cdn.fishart.online/fishart_web/icon/premium.svg'
        };
        const svgUrl = svgMap[membershipTier] || svgMap['free'];
        console.log('📦 Using fallback SVG URL:', svgUrl);
        const img = document.createElement('img');
        img.src = svgUrl;
        img.alt = membershipName;
        img.style.cssText = 'width: 80px; height: 80px; object-fit: contain;';
        avatarElement.appendChild(img);
    }
    
    const profileName = profile.displayName || profile.artistName || 'Anonymous User';
    
    // 直接显示用户名，不添加"(You)"等后缀
    document.getElementById('profile-name').textContent = profileName;
    
    // Display membership info
    const membershipBadgeElement = document.getElementById('membership-badge');
    const membershipTextElement = document.getElementById('membership-text');
    const upgradeBtn = document.getElementById('upgrade-btn');
    
    if (membershipBadgeElement && typeof createMembershipIcon === 'function') {
        membershipBadgeElement.innerHTML = '';
        const smallBadge = createMembershipIcon(membershipTier);
        membershipBadgeElement.appendChild(smallBadge);
    } else if (membershipBadgeElement) {
        // Fallback to SVG icons if membership-icons.js is not loaded
        const svgMap = {
            'free': 'https://cdn.fishart.online/fishart_web/icon/free.svg',
            'plus': 'https://cdn.fishart.online/fishart_web/icon/plus.svg',
            'premium': 'https://cdn.fishart.online/fishart_web/icon/premium.svg'
        };
        const svgUrl = svgMap[membershipTier] || svgMap['free'];
        const img = document.createElement('img');
        img.src = svgUrl;
        img.alt = membershipName;
        img.style.cssText = 'width: 20px; height: 20px; object-fit: contain;';
        membershipBadgeElement.appendChild(img);
    }
    
    if (membershipTextElement) {
        membershipTextElement.textContent = membershipName;
    }
    
    // Show upgrade button for free and plus members (only for current user)
    if (upgradeBtn && isCurrentUser && (membershipTier === 'free' || membershipTier === 'plus')) {
        upgradeBtn.style.display = 'inline-block';
        upgradeBtn.onclick = () => {
            // Navigate to membership upgrade page
            window.location.href = 'membership.html';
        };
    } else if (upgradeBtn) {
        upgradeBtn.style.display = 'none';
    }
    
    // Hide email field since profile endpoint doesn't return it
    const emailElement = document.getElementById('profile-email');
    if (emailElement) {
        emailElement.style.display = 'none';
    }
    
    document.getElementById('profile-joined').textContent = `Joined: ${createdDate}`;

    // Update statistics
    document.getElementById('fish-count').textContent = profile.fishCount || 0;
    document.getElementById('total-upvotes').textContent = profile.totalUpvotes || 0;
    
    // Update favorite count if element exists
    const favoriteCountElement = document.getElementById('favorite-count');
    if (favoriteCountElement) {
        favoriteCountElement.textContent = profile.favoriteCount || 0;
    }

    // Note: Score color removed as we now only use upvotes

    // Update action button links
    updateActionButtons(profile, profileUserId, isCurrentUser, isLoggedIn);
    
    // 给Fish Created统计卡片添加点击跳转功能
    const statItems = document.querySelectorAll('.stat-item');
    if (statItems.length > 0 && profileUserId) {
        // 第一个是 Fish Created (My fish)
        statItems[0].style.cursor = 'pointer';
        statItems[0].onclick = () => {
            // 跳转到 rank.html 并显示 My Fish 分类
            window.location.href = `rank.html?myfish=true`;
        };
        
        // 第二个是 Favorites（如果存在）
        if (statItems.length > 1) {
            statItems[1].style.cursor = 'pointer';
            statItems[1].onclick = () => {
                // 跳转到 rank.html 并显示收藏的鱼
                window.location.href = `rank.html?favorites=true`;
            };
        }
    }

    // Show profile content
    document.getElementById('profile-content').style.display = 'block';
    document.getElementById('profile-empty').style.display = 'none';
    
    // Load messages if MessageUI is available
    if (typeof MessageUI !== 'undefined' && profileUserId) {
        loadUserMessages(profileUserId);
    }
    
    // Handle #messages hash - scroll to messages section if present
    handleMessagesHashOnLoad();
}

// Show loading state
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error').style.display = 'none';
    document.getElementById('profile-content').style.display = 'none';
    document.getElementById('profile-empty').style.display = 'none';
}

// Hide loading state
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    document.getElementById('profile-content').style.display = 'none';
    document.getElementById('profile-empty').style.display = 'none';
}

// Add enter key support for search
document.addEventListener('DOMContentLoaded', function () {
    // 检查网络连接状态
    const isOnline = navigator.onLine;
    if (!isOnline) {
        console.warn('⚠️ Network appears to be offline');
    }
    
    // Check if there's a user ID in the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const searchedUserId = urlParams.get('userId');
    
    if (searchedUserId) {
        // Load specific user's profile from URL
        getUserProfile(searchedUserId).then(profile => {
            displayProfile(profile, searchedUserId);
        }).catch(error => {
            console.error('Error loading user profile from URL:', error);
            showError('User not found or error loading profile. Please check your network connection.');
        });
        return;
    }
    
    // Check authentication state for current user - 优先使用Supabase
    async function checkAndLoadProfile() {
        let userId = null;
        let userData = null;
        
        // 优先使用Supabase检查登录状态
        if (window.supabaseAuth && typeof window.supabaseAuth.getCurrentUser === 'function') {
            try {
                const user = await window.supabaseAuth.getCurrentUser();
                if (user && user.id) {
                    userId = user.id;
                    userData = {
                        id: user.id,
                        email: user.email,
                        name: user.user_metadata?.name || user.user_metadata?.nick_name || user.email?.split('@')[0] || 'User',
                        avatar_url: user.user_metadata?.avatar_url,
                        created_at: user.created_at
                    };
                    console.log('✅ 使用Supabase获取用户信息:', userId);
                }
            } catch (error) {
                console.warn('⚠️ Supabase获取用户信息失败:', error);
            }
        }
        
        // 如果Supabase没有用户，回退到localStorage
        if (!userId) {
            const token = localStorage.getItem('userToken');
            const userDataStr = localStorage.getItem('userData');
            const userIdFromStorage = localStorage.getItem('userId');
            
            if (token && userDataStr) {
                try {
                    const parsedUserData = JSON.parse(userDataStr);
                    userId = userIdFromStorage || 
                             parsedUserData.uid || 
                             parsedUserData.userId || 
                             parsedUserData.id || 
                             parsedUserData.email;
                    userData = parsedUserData;
                    console.log('📦 使用localStorage获取用户信息:', userId);
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            } else if (userIdFromStorage) {
                userId = userIdFromStorage;
            }
        }
        
        // 加载用户profile
        if (userId) {
            try {
                // 尝试从API加载
                const profile = await getUserProfile(userId);
                displayProfile(profile, userId);
            } catch (error) {
                console.error('Error loading current user profile:', error);
                // 回退到显示基本信息
                if (userData) {
                    console.log('📦 Falling back to cached user data');
                    const fallbackProfile = {
                        userId: userId,
                        displayName: userData.name || userData.nick_name || userData.display_name || userData.email?.split('@')[0] || 'User',
                        email: userData.email,
                        avatarUrl: userData.avatar_url || userData.avatarUrl,
                        createdAt: userData.created_at || userData.createdAt || new Date().toISOString(),
                        fishCount: userData.fishCount || 0,
                        totalUpvotes: userData.totalUpvotes || 0,
                        reputationScore: userData.reputationScore || 0,
                        favoriteCount: userData.favoriteCount || 0,
                        membershipTier: userData.membershipTier || 'free',
                        membershipName: userData.membershipName || 'Free'
                    };
                    displayProfile(fallbackProfile, userId);
                    
                    // 显示网络提示
                    if (!isOnline) {
                        const errorDiv = document.getElementById('error');
                        if (errorDiv) {
                            errorDiv.textContent = '⚠️ Network unavailable. Showing cached profile data. Some features may be limited.';
                            errorDiv.style.display = 'block';
                            errorDiv.style.background = '#fff3cd';
                            errorDiv.style.color = '#856404';
                            errorDiv.style.border = '1px solid #ffc107';
                        }
                    }
                } else {
                    // 如果连缓存数据都没有，显示空状态
                    document.getElementById('profile-empty').style.display = 'block';
                }
            }
        } else {
            // 没有用户ID，显示空状态
            document.getElementById('profile-empty').style.display = 'block';
        }
    }
    
    // 等待Supabase初始化（最多等待3秒）
    if (window.supabaseAuth) {
        checkAndLoadProfile();
    } else {
        // 如果Supabase还没初始化，等待一下
        let retries = 0;
        const maxRetries = 30; // 最多等待3秒
        const checkInterval = setInterval(() => {
            if (window.supabaseAuth || retries >= maxRetries) {
                clearInterval(checkInterval);
                checkAndLoadProfile();
            }
            retries++;
        }, 100);
    }
});

// Share profile URL
function shareProfile() {
    // Get the user ID to share - could be from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const searchedUserId = urlParams.get('userId');
    const userIdFromStorage = localStorage.getItem('userId');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const currentUserId = userIdFromStorage || userData.uid || userData.userId || userData.id || userData.email;
    
    // Determine which user profile to share
    const profileUserId = searchedUserId || currentUserId;
    
    let shareUrl;
    if (profileUserId) {
        // Create URL with the specific user ID
        const baseUrl = window.location.origin + window.location.pathname;
        shareUrl = `${baseUrl}?userId=${encodeURIComponent(profileUserId)}`;
    } else {
        // Fallback to current URL
        shareUrl = window.location.href;
    }
    
    // Get profile name for the title
    const profileNameElement = document.getElementById('profile-name');
    let profileName = 'Fish Artist';
    if (profileNameElement && currentProfile) {
        const displayName = currentProfile.displayName || currentProfile.artistName || 'Anonymous User';
        profileName = displayName !== 'Anonymous User' ? displayName : 'Fish Artist';
    }
    
    if (navigator.share) {
        navigator.share({
            title: `${profileName}'s Profile - Fish Artist`,
            url: shareUrl
        }).catch(console.error);
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(function () {
            alert('Profile URL copied to clipboard!');
        }).catch(function () {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Profile URL copied to clipboard!');
        });
    }
}

// Edit profile functionality
let isEditMode = false;
let currentProfile = null;

function showEditProfileButton() {
    const profileActions = document.querySelector('.profile-actions');
    let editBtn = document.getElementById('edit-profile-btn');

    if (!editBtn) {
        editBtn = document.createElement('button');
        editBtn.id = 'edit-profile-btn';
        editBtn.textContent = 'Settings';
        editBtn.className = 'action-btn';
        editBtn.onclick = toggleEditProfile;
        profileActions.appendChild(editBtn);
    }

    editBtn.style.display = 'inline-block';
}

function hideEditProfileButton() {
    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) {
        editBtn.style.display = 'none';
    }
}

function toggleEditProfile() {
    showEditProfileModal();
}

// Show edit profile modal
function showEditProfileModal() {
    // Get current values
    const currentName = currentProfile.nickName || currentProfile.displayName || currentProfile.artistName || '';
    const currentLanguage = currentProfile.userLanguage || '';
    const currentAboutMe = currentProfile.aboutMe || '';
    const currentFishTalk = currentProfile.fishTalk || false;

    // Supported languages
    const languages = [
        { value: '', label: 'Default (English)' },
        { value: 'English', label: 'English' },
        { value: 'French', label: 'French' },
        { value: 'Spanish', label: 'Spanish' },
        { value: 'Chinese', label: 'Chinese (简体中文)' },
        { value: 'Traditional Chinese', label: 'Traditional Chinese (繁體中文)' },
        { value: 'Japanese', label: 'Japanese' },
        { value: 'Korean', label: 'Korean' }
    ];

    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'edit-profile-modal-overlay';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    // Create modal content
    // 在移动端使用响应式宽度，避免占满屏幕
    const isMobile = window.innerWidth <= 768;
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 10px;
        max-width: ${isMobile ? 'calc(100vw - 40px)' : '500px'};
        width: ${isMobile ? 'calc(100vw - 40px)' : '90%'};
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        box-sizing: border-box;
    `;

    modalContent.innerHTML = `
        <h2 style="margin-top: 0; margin-bottom: 20px; color: #333;">Settings</h2>
        <form id="edit-profile-form">
            <div style="margin-bottom: 20px;">
                <label for="edit-feeder-name" style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">
                    Nickname
                </label>
                <input 
                    type="text" 
                    id="edit-feeder-name" 
                    value="${escapeHtml(currentName)}" 
                    class="edit-input" 
                    maxlength="50" 
                    placeholder="Enter your nickname"
                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box; background: white; color: #000000;"
                >
            </div>
            <div style="margin-bottom: 20px;">
                <label for="edit-about-me" style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">
                    About Me
                </label>
                <textarea 
                    id="edit-about-me" 
                    class="edit-textarea"
                    maxlength="200" 
                    rows="2"
                    placeholder="A brief introduction about yourself, your fish will talk about you..."
                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box; background: white; color: #000000; resize: vertical; min-height: 50px; font-family: inherit;"
                >${escapeHtml(currentAboutMe)}</textarea>
            </div>
            <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="icons/chat.svg" alt="Chat" style="width: 20px; height: 20px; object-fit: contain;">
                        <span style="font-weight: 600; color: #555;">Fish Talk</span>
                    </div>
                    <label style="position: relative; display: inline-block; width: 50px; height: 26px; margin: 0;">
                        <input type="checkbox" id="fish-talk-switch-profile" style="opacity: 0; width: 0; height: 0;">
                        <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 26px;"></span>
                        <span style="position: absolute; content: ''; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%;"></span>
                    </label>
                </div>
            </div>
            <div style="margin-bottom: 25px;">
                <label for="edit-user-language" style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">
                    Language
                </label>
                <select 
                    id="edit-user-language" 
                    class="edit-select"
                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box; background: white; color: #000000;"
                >
                    <option value="" ${currentLanguage === '' ? 'selected' : ''} style="color: #000000;">Default (English)</option>
                    <option value="English" ${currentLanguage === 'English' ? 'selected' : ''} style="color: #000000;">English</option>
                    <option value="French" ${currentLanguage === 'French' ? 'selected' : ''} style="color: #000000;">French</option>
                    <option value="Spanish" ${currentLanguage === 'Spanish' ? 'selected' : ''} style="color: #000000;">Spanish</option>
                    <option value="简体中文" ${currentLanguage === '简体中文' || currentLanguage === 'Chinese' ? 'selected' : ''} style="color: #000000;">简体中文</option>
                    <option value="繁體中文" ${currentLanguage === '繁體中文' || currentLanguage === 'Traditional Chinese' ? 'selected' : ''} style="color: #000000;">繁體中文</option>
                    <option value="Japanese" ${currentLanguage === 'Japanese' ? 'selected' : ''} style="color: #000000;">Japanese</option>
                    <option value="Korean" ${currentLanguage === 'Korean' ? 'selected' : ''} style="color: #000000;">Korean</option>
                </select>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                <button 
                    type="button" 
                    onclick="closeEditProfileModal()" 
                    class="cancel-btn"
                    style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 5px; cursor: pointer; font-size: 14px;"
                >
                    Cancel
                </button>
                <button 
                    type="button" 
                    onclick="saveProfileFromModal()" 
                    class="save-btn"
                    style="padding: 10px 20px; border: none; background: #007bff; color: white; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 600;"
                >
                    Save
                </button>
            </div>
        </form>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Initialize Fish Talk toggle
    initializeFishTalkToggle();

    // Close modal when clicking overlay
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeEditProfileModal();
        }
    });

    // Focus first input
    setTimeout(() => {
        const input = document.getElementById('edit-feeder-name');
        if (input) {
            input.focus();
        }
    }, 100);
}

// Initialize Fish Talk toggle in profile modal
function initializeFishTalkToggle() {
    const toggleSwitch = document.getElementById('fish-talk-switch-profile');
    const toggleContainer = toggleSwitch?.parentElement?.parentElement;
    
    if (!toggleSwitch || !toggleContainer) {
        console.warn('Fish Talk toggle elements not found in profile modal');
        return;
    }

    // Load from database fish_talk field, fallback to localStorage
    const dbFishTalk = currentProfile?.fishTalk;
    const savedPreference = localStorage.getItem('groupChatEnabled');
    const isEnabled = dbFishTalk !== undefined ? dbFishTalk : (savedPreference === 'true');
    
    // Set initial state
    toggleSwitch.checked = isEnabled;
    updateProfileToggleStyle(toggleSwitch, isEnabled);

    // Handle toggle click
    toggleContainer.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const newState = !toggleSwitch.checked;
        
        // 如果尝试启用 Fish Talk，需要检查登录状态
        if (newState) {
            // 检查用户是否已登录
            let isLoggedIn = false;
            try {
                if (window.supabaseAuth && typeof window.supabaseAuth.isLoggedIn === 'function') {
                    isLoggedIn = await window.supabaseAuth.isLoggedIn();
                } else if (window.supabaseAuth && typeof window.supabaseAuth.getCurrentUser === 'function') {
                    const user = await window.supabaseAuth.getCurrentUser();
                    isLoggedIn = !!user;
                }
            } catch (error) {
                console.error('检查登录状态时出错:', error);
                isLoggedIn = false;
            }
            
            // 如果未登录，阻止启用并显示登录提示
            if (!isLoggedIn) {
                console.log('❌ 未登录用户无法启用 Fish Talk');
                // 恢复开关状态
                toggleSwitch.checked = false;
                updateProfileToggleStyle(toggleSwitch, false);
                
                // 显示登录提示
                if (window.authUI && window.authUI.showLoginModal) {
                    window.authUI.showLoginModal();
                } else {
                    // Fallback: 使用 alert
                    alert('请先登录以使用 Fish Talk 功能');
                }
                return;
            }
        }
        
        // 已登录或禁用操作，继续执行
        toggleSwitch.checked = newState;
        updateProfileToggleStyle(toggleSwitch, newState);
        
        // Save preference immediately to localStorage
        localStorage.setItem('groupChatEnabled', newState ? 'true' : 'false');
        
        // Update current profile data
        if (currentProfile) {
            currentProfile.fishTalk = newState;
        }
        
        // Trigger custom event for same-tab sync
        window.dispatchEvent(new CustomEvent('groupChatEnabledChanged', {
            detail: { enabled: newState }
        }));
        
        console.log(`Fish Talk ${newState ? 'enabled' : 'disabled'} (from profile settings)`);
    });
}

// Update Fish Talk toggle visual style in profile modal
function updateProfileToggleStyle(toggleSwitch, enabled) {
    const slider = toggleSwitch.nextElementSibling;
    const thumb = slider ? slider.nextElementSibling : null;
    
    if (slider && thumb) {
        if (enabled) {
            slider.style.backgroundColor = '#6366F1';
            thumb.style.transform = 'translateX(24px)';
        } else {
            slider.style.backgroundColor = '#ccc';
            thumb.style.transform = 'translateX(0)';
        }
    }
}

// Close edit profile modal
function closeEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function exitEditMode() {
    // Restore original display
    const profileName = document.getElementById('profile-name');
    const profileAvatar = document.getElementById('profile-avatar');
    const token = localStorage.getItem('userToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userIdFromStorage = localStorage.getItem('userId');
    const currentUserId = userIdFromStorage || userData.uid || userData.userId || userData.id || userData.email;

    // Use the searched userId if provided, otherwise try to get it from profile
    const urlParams = new URLSearchParams(window.location.search);
    const searchedUserId = urlParams.get('userId');
    const profileUserId = searchedUserId || currentProfile.userId || currentProfile.userEmail || currentProfile.id;
    const isCurrentUser = currentUserId && (currentUserId === profileUserId);
    const isLoggedIn = !!(token && userData);

    const displayName = currentProfile.displayName || currentProfile.artistName || 'Anonymous User';
    
    // 直接显示用户名，不添加任何后缀
    profileName.textContent = displayName;

    // Update avatar with membership icon instead of initial
    profileAvatar.innerHTML = '';
    const membershipTier = currentProfile.membershipTier || 'free';
    
    if (typeof createMembershipBadge === 'function') {
        const membershipBadge = createMembershipBadge(membershipTier, { size: 'large' });
        profileAvatar.appendChild(membershipBadge);
    } else if (typeof createMembershipIcon === 'function') {
        const membershipIcon = createMembershipIcon(membershipTier);
        const iconElement = membershipIcon.querySelector('div');
        if (iconElement) {
            iconElement.style.width = '80px';
            iconElement.style.height = '80px';
        }
        profileAvatar.appendChild(membershipIcon);
    } else {
        // 回退：使用SVG图标
        const svgMap = {
            'free': 'https://cdn.fishart.online/fishart_web/icon/free.svg',
            'plus': 'https://cdn.fishart.online/fishart_web/icon/plus.svg',
            'premium': 'https://cdn.fishart.online/fishart_web/icon/premium.svg'
        };
        const svgUrl = svgMap[membershipTier] || svgMap['free'];
        const img = document.createElement('img');
        img.src = svgUrl;
        img.alt = membershipTier;
        img.style.cssText = 'width: 80px; height: 80px; object-fit: contain;';
        profileAvatar.appendChild(img);
    }

    // Restore edit button
    const editBtn = document.getElementById('edit-profile-btn');
    editBtn.innerHTML = 'Settings';
    editBtn.style.display = 'inline-block';
    editBtn.onclick = toggleEditProfile;
}

function cancelEdit() {
    isEditMode = false;
    exitEditMode();
}

// Save profile from modal
async function saveProfileFromModal() {
    const nameInput = document.getElementById('edit-feeder-name');
    const languageSelect = document.getElementById('edit-user-language');
    const aboutMeTextarea = document.getElementById('edit-about-me');
    const fishTalkSwitch = document.getElementById('fish-talk-switch-profile');
    
    const newNickName = nameInput.value.trim();
    const newUserLanguage = languageSelect.value.trim();
    const newAboutMe = aboutMeTextarea ? aboutMeTextarea.value.trim() : '';
    const newFishTalk = fishTalkSwitch ? fishTalkSwitch.checked : false;

    // Check if user is logged in and get fresh token
    let token = localStorage.getItem('userToken');
    if (!token) {
        alert('You must be logged in to edit your profile');
        return;
    }
    
    // 尝试获取最新的token
    try {
        if (window.supabaseAuth && typeof window.supabaseAuth.getCurrentUser === 'function') {
            const user = await window.supabaseAuth.getCurrentUser();
            if (user && window.supabaseAuth.getSession) {
                const session = await window.supabaseAuth.getSession();
                if (session?.data?.session?.access_token) {
                    token = session.data.session.access_token;
                    localStorage.setItem('userToken', token);
                    console.log('🔄 已更新token');
                }
            }
        }
    } catch (error) {
        console.warn('⚠️ 获取最新token失败，使用缓存token:', error);
    }

    try {
        // Show loading state on save button
        const saveBtn = document.querySelector('#edit-profile-modal-overlay .save-btn');
        const cancelBtn = document.querySelector('#edit-profile-modal-overlay .cancel-btn');

        if (saveBtn) {
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
        }
        if (cancelBtn) {
            cancelBtn.disabled = true;
        }

        // Get current user ID
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userIdFromStorage = localStorage.getItem('userId');
        const userId = userIdFromStorage || userData.uid || userData.userId || userData.id || userData.email;

        // Update profile via API endpoint (uses admin secret, avoids JWT issues)
        const backendUrl = window.BACKEND_URL || '';
        const requestBody = {
            nick_name: newNickName,
            user_language: newUserLanguage,
            about_me: newAboutMe,
            fish_talk: newFishTalk
        };
        
        console.log('📝 发送profile更新请求:', {
            url: `${backendUrl}/api/profile/${encodeURIComponent(userId)}`,
            method: 'PUT',
            body: requestBody,
            hasToken: !!token,
            tokenLength: token ? token.length : 0,
            tokenPrefix: token ? token.substring(0, 30) + '...' : 'null'
        });
        
        const response = await fetch(`${backendUrl}/api/profile/${encodeURIComponent(userId)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error || errorJson.message || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || '更新失败');
        }

        // Update local profile data
        if (result.user) {
            currentProfile.nickName = result.user.nick_name || newNickName;
            currentProfile.userLanguage = result.user.user_language || newUserLanguage;
            currentProfile.displayName = result.user.nick_name || newNickName || currentProfile.displayName;
            currentProfile.aboutMe = result.user.about_me || newAboutMe || '';
            currentProfile.fishTalk = result.user.fish_talk !== undefined ? result.user.fish_talk : newFishTalk;
        } else {
            currentProfile.nickName = newNickName;
            currentProfile.userLanguage = newUserLanguage;
            currentProfile.displayName = newNickName || currentProfile.displayName;
            currentProfile.aboutMe = newAboutMe || '';
            currentProfile.fishTalk = newFishTalk;
        }

        // Update profile name display immediately
        const profileNameElement = document.getElementById('profile-name');
        if (profileNameElement) {
            const displayName = currentProfile.displayName || currentProfile.nickName || currentProfile.artistName || 'Anonymous User';
            profileNameElement.textContent = displayName;
            
            // Update avatar with membership icon instead of initial
            const profileAvatar = document.getElementById('profile-avatar');
            if (profileAvatar) {
                // 清空并重新显示会员图标
                profileAvatar.innerHTML = '';
                const membershipTier = currentProfile.membershipTier || 'free';
                
                if (typeof createMembershipBadge === 'function') {
                    const membershipBadge = createMembershipBadge(membershipTier, { size: 'large' });
                    profileAvatar.appendChild(membershipBadge);
                } else if (typeof createMembershipIcon === 'function') {
                    // 使用 createMembershipIcon 作为回退
                    const membershipIcon = createMembershipIcon(membershipTier);
                    // 调整图标大小以适应profile-avatar
                    const iconElement = membershipIcon.querySelector('div');
                    if (iconElement) {
                        iconElement.style.width = '80px';
                        iconElement.style.height = '80px';
                    }
                    profileAvatar.appendChild(membershipIcon);
                } else {
                    // 最后的回退：使用SVG图标
                    const svgMap = {
                        'free': 'https://cdn.fishart.online/fishart_web/icon/free.svg',
                        'plus': 'https://cdn.fishart.online/fishart_web/icon/plus.svg',
                        'premium': 'https://cdn.fishart.online/fishart_web/icon/premium.svg'
                    };
                    const svgUrl = svgMap[membershipTier] || svgMap['free'];
                    const img = document.createElement('img');
                    img.src = svgUrl;
                    img.alt = membershipTier;
                    img.style.cssText = 'width: 80px; height: 80px; object-fit: contain;';
                    profileAvatar.appendChild(img);
                }
            }
        }

        // Update navigation bar user name
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement && newNickName) {
            userNameElement.textContent = newNickName;
            console.log('✅ 已更新导航栏用户名:', newNickName);
        }

        // Update auth UI to refresh user menu with latest profile data
        if (window.authUI && window.authUI.updateAuthUI) {
            try {
                // 重新获取用户信息并更新UI
                if (window.supabaseAuth && typeof window.supabaseAuth.getCurrentUser === 'function') {
                    const user = await window.supabaseAuth.getCurrentUser();
                    if (user) {
                        // 从数据库获取最新的用户信息
                        const backendUrl = window.BACKEND_URL || '';
                        const profileResponse = await fetch(`${backendUrl}/api/profile/${encodeURIComponent(user.id)}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        
                        if (profileResponse.ok) {
                            const profileData = await profileResponse.json();
                            if (profileData.user) {
                                // 更新user_metadata中的显示名称
                                const updatedUser = {
                                    ...user,
                                    user_metadata: {
                                        ...user.user_metadata,
                                        // 使用 nick_name
                                        name: profileData.user.nick_name || user.user_metadata?.name,
                                        nick_name: profileData.user.nick_name || user.user_metadata?.nick_name
                                    }
                                };
                                // 更新auth UI
                                await window.authUI.updateAuthUI(updatedUser);
                                console.log('✅ 已更新Auth UI用户信息');
                            }
                        }
                    }
                }
            } catch (error) {
                console.warn('⚠️ 更新Auth UI失败，但profile已更新:', error);
                // 即使更新Auth UI失败，也直接更新导航栏用户名
                if (userNameElement && newNickName) {
                    userNameElement.textContent = newNickName;
                }
            }
        } else if (userNameElement && newNickName) {
            // 如果authUI不可用，直接更新导航栏用户名
            userNameElement.textContent = newNickName;
        }

        // Sync Fish Talk state to localStorage and trigger events
        localStorage.setItem('groupChatEnabled', newFishTalk ? 'true' : 'false');
        window.dispatchEvent(new CustomEvent('groupChatEnabledChanged', {
            detail: { enabled: newFishTalk }
        }));

        // Close modal
        closeEditProfileModal();

        // Show success message
        showSuccessMessage('Profile updated successfully!');

    } catch (error) {
        console.error('Error updating profile:', error);
        alert(`Error updating profile: ${error.message}`);

        // Restore button states
        const saveBtn = document.querySelector('#edit-profile-modal-overlay .save-btn');
        const cancelBtn = document.querySelector('#edit-profile-modal-overlay .cancel-btn');

        if (saveBtn) {
            saveBtn.textContent = 'Save';
            saveBtn.disabled = false;
        }
        if (cancelBtn) {
            cancelBtn.disabled = false;
        }
    }
}

// Legacy function for backward compatibility
async function saveProfile() {
    // Redirect to modal-based editing
    showEditProfileModal();
}

// Helper function to show success message
function showSuccessMessage(message) {
    // Create and show a temporary success message
    const successDiv = document.createElement('div');
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    document.body.appendChild(successDiv);

    // Remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 3000);
}

// Show signup prompt for anonymous users with local data
function showSignupPrompt() {
    // Check if prompt has already been shown recently to avoid being too intrusive
    const promptShown = sessionStorage.getItem('signupPromptShown');
    if (promptShown) {
        return;
    }

    // Create info bar at the top of the page
    const infoBar = document.createElement('div');
    infoBar.id = 'signup-info-bar';
    infoBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: white;
        padding: 12px 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        font-size: 14px;
        line-height: 1.4;
        animation: slideDown 0.3s ease-out;
    `;

    // Add CSS animation
    if (!document.getElementById('signup-info-bar-styles')) {
        const style = document.createElement('style');
        style.id = 'signup-info-bar-styles';
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .signup-info-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 15px;
            }
            .signup-info-text {
                flex: 1;
                min-width: 250px;
            }
            .signup-info-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            .signup-info-btn {
                background: rgba(255,255,255,0.2);
                color: white;
                border: 1px solid rgba(255,255,255,0.3);
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s ease;
                white-space: nowrap;
            }
            .signup-info-btn:hover {
                background: rgba(255,255,255,0.3);
                border-color: rgba(255,255,255,0.5);
            }
            .signup-info-btn.primary {
                background: #28a745;
                border-color: #28a745;
            }
            .signup-info-btn.primary:hover {
                background: #218838;
            }
            .signup-info-close {
                background: rgba(255,255,255,0.1);
                border: none;
                color: white;
                padding: 4px 8px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 16px;
                line-height: 1;
                margin-left: 10px;
            }
            .signup-info-close:hover {
                background: rgba(255,255,255,0.2);
            }
            @media (max-width: 768px) {
                .signup-info-content {
                    flex-direction: column;
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(style);
    }

    infoBar.innerHTML = `
        <div class="signup-info-content">
            <div class="signup-info-text">
                <strong> Save Your Fish Data!</strong> It's stored locally rn.
                Sign up or log in to preserve it across devices.
            </div>
            <div class="signup-info-actions">
                <button id="signup-info-login" class="signup-info-btn">Log In</button>
                <button id="signup-info-signup" class="signup-info-btn primary">Sign Up</button>
                <button id="signup-info-dismiss" class="signup-info-btn">Dismiss</button>
                <button id="signup-info-close" class="signup-info-close">&times;</button>
            </div>
        </div>
    `;

    // Insert at the beginning of the body
    document.body.insertBefore(infoBar, document.body.firstChild);

    // Adjust page content to account for the info bar
    document.body.style.paddingTop = '60px';

    // Add event listeners
    document.getElementById('signup-info-login').onclick = () => {
        sessionStorage.setItem('signupPromptShown', 'true');
        removeInfoBar();
        window.location.href = 'login.html';
    };

    document.getElementById('signup-info-signup').onclick = () => {
        sessionStorage.setItem('signupPromptShown', 'true');
        removeInfoBar();
        window.location.href = 'login.html?signup=true';
    };

    document.getElementById('signup-info-dismiss').onclick = () => {
        sessionStorage.setItem('signupPromptShown', 'true');
        removeInfoBar();
    };

    document.getElementById('signup-info-close').onclick = () => {
        sessionStorage.setItem('signupPromptShown', 'true');
        removeInfoBar();
    };

    // Auto-dismiss after 30 seconds
    setTimeout(() => {
        if (document.getElementById('signup-info-bar')) {
            sessionStorage.setItem('signupPromptShown', 'true');
            removeInfoBar();
        }
    }, 30000);

    function removeInfoBar() {
        const bar = document.getElementById('signup-info-bar');
        if (bar) {
            bar.style.animation = 'slideUp 0.3s ease-in forwards';
            setTimeout(() => {
                if (bar.parentNode) {
                    bar.parentNode.removeChild(bar);
                }
                document.body.style.paddingTop = '';
            }, 300);
        }
    }

    // Add slide up animation
    const style = document.getElementById('signup-info-bar-styles');
    if (style && !style.textContent.includes('slideUp')) {
        style.textContent += `
            @keyframes slideUp {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(-100%); opacity: 0; }
            }
        `;
    }
}

// ===== 背景气泡效果 =====
function createBackgroundBubbles() {
    const container = document.querySelector('.background-bubbles');
    if (!container) return;
    
    const bubbleCount = 15;
    
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // 随机大小
        const size = Math.random() * 40 + 20;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        
        // 随机水平位置
        bubble.style.left = Math.random() * 100 + '%';
        
        // 随机动画延迟
        bubble.style.animationDelay = Math.random() * 5 + 's';
        
        // 随机动画持续时间
        bubble.style.animationDuration = (Math.random() * 3 + 4) + 's';
        
        container.appendChild(bubble);
    }
}

// 页面加载时初始化气泡效果
createBackgroundBubbles();

/**
 * 加载用户收到的留言
 * @param {string} userId - 用户ID
 */
async function loadUserMessages(userId) {
    try {
        const messagesSection = document.getElementById('profile-messages-section');
        const messagesContainer = document.getElementById('profile-messages-container');
        const messagesCount = document.getElementById('profile-messages-count');
        
        if (!messagesSection || !messagesContainer) {
            console.warn('⚠️ Messages section or container not found');
            return;
        }

        // 显示留言区域
        messagesSection.style.display = 'block';
        console.log('✅ Messages section displayed');
        
        // 显示加载状态
        messagesContainer.innerHTML = '<div class="messages-loading" style="text-align: center; padding: 20px; color: #666;">Loading messages...</div>';

        // 使用 MessageUI 渲染留言
        if (typeof MessageUI !== 'undefined') {
            await MessageUI.renderMessagesSection('profile-messages-container', 'to_owner', userId, {
                showForm: false,
                showFishInfo: true,
                showDeleteBtn: true,
                title: 'Received Messages'
            });

            // 检查是否有消息
            const messages = messagesContainer.querySelectorAll('.message-card');
            if (messages.length === 0) {
                // 如果没有消息，显示空状态
                messagesContainer.innerHTML = `
                    <div class="messages-empty" style="text-align: center; padding: 40px 20px; color: #999;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No messages yet</div>
                        <div style="font-size: 14px;">You haven't received any messages.</div>
                    </div>
                `;
            }
            
            // 更新留言数量
            if (messagesCount) {
                messagesCount.textContent = messages.length;
            }
            console.log(`✅ Loaded ${messages.length} messages`);
        } else {
            console.warn('⚠️ MessageUI not available');
            messagesContainer.innerHTML = `
                <div class="messages-empty" style="text-align: center; padding: 40px 20px; color: #999;">
                    <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Message system unavailable</div>
                    <div style="font-size: 14px;">Please refresh the page to try again.</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Load user messages error:', error);
        const messagesContainer = document.getElementById('profile-messages-container');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="message-error" style="text-align: center; padding: 40px 20px; color: #e74c3c;">
                    <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Failed to load messages</div>
                    <div style="font-size: 14px;">${error.message || 'Unknown error'}</div>
                    <button onclick="location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Refresh Page</button>
                </div>
            `;
        }
    }
}

/**
 * 处理 #messages hash - 在页面加载时滚动到消息区域
 */
function handleMessagesHashOnLoad() {
    // 检查URL hash
    if (window.location.hash === '#messages') {
        console.log('🎯 Hash #messages detected, scrolling to messages section');
        setTimeout(() => {
            const messagesSection = document.getElementById('profile-messages-section');
            if (messagesSection) {
                // 确保消息区域可见
                messagesSection.style.display = 'block';
                
                // 滚动到消息区域
                messagesSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
                
                // 展开所有消息分组
                const groupTitles = messagesSection.querySelectorAll('.messages-group-title.collapsed');
                groupTitles.forEach(title => {
                    const group = title.closest('.messages-group');
                    const list = group.querySelector('.messages-group-list');
                    const icon = title.querySelector('.group-icon');
                    
                    if (list && list.style.display === 'none') {
                        list.style.display = 'flex';
                        title.classList.remove('collapsed');
                        if (icon) icon.textContent = '▼';
                    }
                });
                
                console.log('✅ Scrolled to messages section and expanded groups');
            } else {
                console.warn('⚠️ Messages section not found for scrolling');
            }
        }, 500); // 等待消息加载完成
    }
}

// 监听 hash 变化
window.addEventListener('hashchange', function() {
    if (window.location.hash === '#messages') {
        handleMessagesHashOnLoad();
    }
});

// Export showEditProfileModal globally for use in other modules
window.showEditProfileModal = showEditProfileModal;