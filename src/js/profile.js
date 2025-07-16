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
        console.log(data.profile); // Log the profile data for debugging
        return data.profile;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}

// Update action button links based on the profile being viewed
function updateActionButtons(profile, profileUserId, isCurrentUser) {
    const viewFishBtn = document.getElementById('view-fish-btn');
    const visitTankBtn = document.getElementById('visit-tank-btn');
    const displayName = getDisplayName(profile);

    if (isCurrentUser) {
        // For current user, show their tanks and fish
        viewFishBtn.href = `rank.html?userId=${encodeURIComponent(profileUserId)}`;
        viewFishBtn.textContent = 'View My Fish';
        visitTankBtn.href = 'fishtanks.html';
        visitTankBtn.textContent = 'My Tanks';

        // Show edit profile button for current user
        showEditProfileButton();
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
    // Use the profile data directly
    if (profile && profile.displayName && profile.displayName !== 'Anonymous User') {
        return profile.displayName;
    }

    // Fallback to just "User" if no display name
    return 'User';
}

// Display user profile
function displayProfile(profile, searchedUserId = null) {
    // Store current profile data for editing
    currentProfile = profile;

    // Get avatar initial
    const initial = profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U';

    // Format dates
    const createdDate = new Date(profile.createdAt).toLocaleDateString();
    const updatedDate = new Date(profile.updatedAt).toLocaleDateString();

    // Check if this is the current user's profile
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userIdFromStorage = localStorage.getItem('userId');
    const currentUserId = userIdFromStorage || userData.uid || userData.userId || userData.id || userData.email;

    // Use the searched userId if provided, otherwise try to get it from profile
    const profileUserId = searchedUserId || profile.userId || profile.userEmail || profile.id;
    const isCurrentUser = currentUserId && (currentUserId === profileUserId);

    // Update profile display
    document.getElementById('profile-avatar').textContent = initial;
    const profileName = profile.displayName || 'Anonymous User';
    document.getElementById('profile-name').textContent = isCurrentUser ? `${profileName} (You)` : profileName;
    document.getElementById('profile-email').textContent = profile.userEmail || 'No email provided';
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
    updateActionButtons(profile, profileUserId, isCurrentUser);

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
    console.log('Profile page loading...');
    
    // Check authentication state
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!userData);
    
    // Load current user's profile if logged in
    if (token && userData) {
        try {
            const parsedUserData = JSON.parse(userData);
            const userIdFromStorage = localStorage.getItem('userId');
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
    } else {
        // Show empty state if no user is logged in
        document.getElementById('profile-empty').style.display = 'block';
    }
});

// Share profile URL
function shareProfile() {
    const currentUrl = window.location.href;
    if (navigator.share) {
        navigator.share({
            title: 'Fish Artist Profile',
            url: currentUrl
        }).catch(console.error);
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(currentUrl).then(function () {
            alert('Profile URL copied to clipboard!');
        }).catch(function () {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = currentUrl;
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
        editBtn.onclick = toggleEditMode;
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

function toggleEditMode() {
    isEditMode = !isEditMode;

    if (isEditMode) {
        enterEditMode();
    } else {
        exitEditMode();
    }
}

function enterEditMode() {
    const profileName = document.getElementById('profile-name');
    const currentName = currentProfile.displayName || 'Anonymous User';

    // Replace name display with input field
    profileName.innerHTML = `
        <input type="text" id="edit-name-input" value="${currentName}" class="edit-name-input" maxlength="50" placeholder="Enter your display name">
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
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userIdFromStorage = localStorage.getItem('userId');
    const currentUserId = userIdFromStorage || userData.uid || userData.userId || userData.id || userData.email;

    // Use the searched userId if provided, otherwise try to get it from profile
    const urlParams = new URLSearchParams(window.location.search);
    const searchedUserId = urlParams.get('userId');
    const profileUserId = searchedUserId || currentProfile.userId || currentProfile.userEmail || currentProfile.id;
    const isCurrentUser = currentUserId && (currentUserId === profileUserId);

    const displayName = currentProfile.displayName || 'Anonymous User';
    profileName.textContent = isCurrentUser ? `${displayName} (You)` : displayName;

    // Update avatar with new initial
    const initial = currentProfile.displayName ? currentProfile.displayName.charAt(0).toUpperCase() : 'U';
    profileAvatar.textContent = initial;

    // Restore edit button
    const editBtn = document.getElementById('edit-profile-btn');
    editBtn.innerHTML = 'Edit Profile';
    editBtn.style.display = 'inline-block';
    editBtn.onclick = toggleEditMode;
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