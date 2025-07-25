// Profile page functionality

// Get user profile data from API
async function getUserProfile(userId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/profile/${encodeURIComponent(userId)}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('User not found');
            }
            throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        const data = await response.json();
        return data.profile;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}

// Update action button links based on the profile being viewed
function updateActionButtons(profile, profileUserId, isCurrentUser, isLoggedIn = true) {
    const viewFishBtn = document.getElementById('view-fish-btn');
    const visitTankBtn = document.getElementById('visit-tank-btn');
    const displayName = getDisplayName(profile);

    if (isCurrentUser) {
        // For current user, show their tanks and fish
        viewFishBtn.href = `rank.html?userId=${encodeURIComponent(profileUserId)}`;
        viewFishBtn.textContent = isLoggedIn ? 'View My Fish' : 'View My Local Fish';
        visitTankBtn.href = 'fishtanks.html';
        visitTankBtn.textContent = isLoggedIn ? 'My Tanks' : 'My Local Tanks';

        // Show edit profile button for current user only if logged in
        if (isLoggedIn) {
            showEditProfileButton();
        } else {
            hideEditProfileButton();
        }
    } else {
        // For other users, show their public content
        viewFishBtn.href = `rank.html?userId=${encodeURIComponent(profileUserId)}`;
        viewFishBtn.textContent = `View ${displayName}'s Fish`;
        visitTankBtn.href = `fishtanks.html?userId=${encodeURIComponent(profileUserId)}`;
        visitTankBtn.textContent = `View ${displayName}'s Tanks`;

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

    // Update profile display
    document.getElementById('profile-avatar').textContent = initial;
    const profileName = profile.displayName || profile.artistName || 'Anonymous User';
    
    // Show different labels based on login status
    let displayText;
    if (isCurrentUser && isLoggedIn) {
        displayText = `${profileName} (You)`;
    } else if (isCurrentUser && !isLoggedIn) {
        displayText = `${profileName} (Your Local Profile)`;
    } else {
        displayText = profileName;
    }
    
    document.getElementById('profile-name').textContent = displayText;
    
    // Hide email field since profile endpoint doesn't return it
    const emailElement = document.getElementById('profile-email');
    if (emailElement) {
        emailElement.style.display = 'none';
    }
    
    document.getElementById('profile-joined').textContent = `Joined: ${createdDate}`;

    // Update statistics
    document.getElementById('fish-count').textContent = profile.fishCount || 0;
    document.getElementById('total-score').textContent = profile.totalScore || 0;
    document.getElementById('total-upvotes').textContent = profile.totalUpvotes || 0;
    document.getElementById('total-downvotes').textContent = profile.totalDownvotes || 0;

    // Set score color based on value
    const scoreElement = document.getElementById('total-score');
    const score = profile.totalScore || 0;
    if (score > 0) {
        scoreElement.style.color = '#28a745';
    } else if (score < 0) {
        scoreElement.style.color = '#dc3545';
    } else {
        scoreElement.style.color = '#007bff';
    }

    // Update action button links
    updateActionButtons(profile, profileUserId, isCurrentUser, isLoggedIn);

    // Show profile content
    document.getElementById('profile-content').style.display = 'block';
    document.getElementById('profile-empty').style.display = 'none';
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
    // Check if there's a user ID in the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const searchedUserId = urlParams.get('userId');
    
    if (searchedUserId) {
        // Load specific user's profile from URL
        getUserProfile(searchedUserId).then(profile => {
            displayProfile(profile, searchedUserId);
        }).catch(error => {
            console.error('Error loading user profile from URL:', error);
            showError('User not found or error loading profile');
        });
        return;
    }
    
    // Check authentication state for current user
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    const userIdFromStorage = localStorage.getItem('userId');
        
    // Load current user's profile if logged in
    if (token && userData) {
        try {
            const parsedUserData = JSON.parse(userData);
            const userId = userIdFromStorage || 
                           parsedUserData.uid || 
                           parsedUserData.userId || 
                           parsedUserData.id || 
                           parsedUserData.email;
            
            if (userId) {
                // Load current user's profile directly
                getUserProfile(userId).then(profile => {
                    displayProfile(profile, userId);
                }).catch(error => {
                    console.error('Error loading current user profile:', error);
                    document.getElementById('profile-empty').style.display = 'block';
                });
            } else {
                document.getElementById('profile-empty').style.display = 'block';
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            document.getElementById('profile-empty').style.display = 'block';
        }
    } else if (userIdFromStorage) {
        // User not logged in but has userId in localStorage - show their profile with signup prompt
        getUserProfile(userIdFromStorage).then(profile => {
            displayProfile(profile, userIdFromStorage);
            showSignupPrompt();
        }).catch(error => {
            console.error('Error loading profile for anonymous user:', error);
            document.getElementById('profile-empty').style.display = 'block';
        });
    } else {
        // Show empty state if no user is logged in and no userId in localStorage
        document.getElementById('profile-empty').style.display = 'block';
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
        editBtn.textContent = 'Edit Profile';
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
    isEditMode = !isEditMode;

    if (isEditMode) {
        enterEditMode();
    } else {
        exitEditMode();
    }
}

function enterEditMode() {
    const profileName = document.getElementById('profile-name');
    const currentName = currentProfile.displayName || currentProfile.artistName || 'Anonymous User';

    // Replace name display with input field
    profileName.innerHTML = `
        <input type="text" id="edit-name-input" value="${escapeHtml(currentName)}" class="edit-name-input" maxlength="50" placeholder="Enter your display name">
        <div class="edit-buttons">
            <button onclick="saveProfile()" class="save-btn">Save</button>
            <button onclick="cancelEdit()" class="cancel-btn">Cancel</button>
        </div>
    `;

    // Hide the edit button while in edit mode
    const editBtn = document.getElementById('edit-profile-btn');
    editBtn.style.display = 'none';

    // Focus the input field and add keyboard support
    setTimeout(() => {
        const input = document.getElementById('edit-name-input');
        if (input) {
            input.focus();
            input.select();

            // Add keyboard event listeners
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveProfile();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelEdit();
                }
            });
        }
    }, 100);
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
    
    // Show different labels based on login status
    let displayText;
    if (isCurrentUser && isLoggedIn) {
        displayText = `${displayName} (You)`;
    } else if (isCurrentUser && !isLoggedIn) {
        displayText = `${displayName} (Your Local Profile)`;
    } else {
        displayText = displayName;
    }
    
    profileName.textContent = displayText;

    // Update avatar with new initial
    const nameForInitial = currentProfile.displayName || currentProfile.artistName || 'User';
    const initial = nameForInitial.charAt(0).toUpperCase();
    profileAvatar.textContent = initial;

    // Restore edit button
    const editBtn = document.getElementById('edit-profile-btn');
    editBtn.innerHTML = 'Edit Profile';
    editBtn.style.display = 'inline-block';
    editBtn.onclick = toggleEditProfile;
}

function cancelEdit() {
    isEditMode = false;
    exitEditMode();
}

async function saveProfile() {
    const nameInput = document.getElementById('edit-name-input');
    const newDisplayName = nameInput.value.trim();

    if (!newDisplayName) {
        alert('Display name cannot be empty');
        return;
    }

    try {
        // Show loading state on save button
        const saveBtn = document.querySelector('.save-btn');
        const cancelBtn = document.querySelector('.cancel-btn');

        saveBtn.textContent = 'Saving...';
        saveBtn.classList.add('saving');
        saveBtn.disabled = true;
        cancelBtn.disabled = true;

        // Get current user ID
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userIdFromStorage = localStorage.getItem('userId');
        const userId = userIdFromStorage || userData.uid || userData.userId || userData.id || userData.email;

        // Update profile via API
        const response = await fetch(`${BACKEND_URL}/api/profile/${encodeURIComponent(userId)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                displayName: newDisplayName
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to update profile: ${response.status}`);
        }

        // Update local profile data
        currentProfile.displayName = newDisplayName;

        // Exit edit mode and refresh display
        isEditMode = false;
        exitEditMode();

        // Show success message
        showSuccessMessage('Profile updated successfully!');

    } catch (error) {
        console.error('Error updating profile:', error);
        alert(`Error updating profile: ${error.message}`);

        // Restore button states
        const saveBtn = document.querySelector('.save-btn');
        const cancelBtn = document.querySelector('.cancel-btn');

        if (saveBtn) {
            saveBtn.textContent = 'Save';
            saveBtn.classList.remove('saving');
            saveBtn.disabled = false;
        }
        if (cancelBtn) {
            cancelBtn.disabled = false;
        }
    }
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