/**
 * Fish Information Collection Modal
 * 
 * Shows a modal after fish upload success to collect:
 * - Fish name
 * - Personality
 * - Feeder name (owner's nickname)
 * - Feeder info (owner's description)
 * 
 * Then checks content moderation before saving.
 */

/**
 * Show fish information collection modal
 * @param {string} fishId - ID of the uploaded fish
 * @param {string} imageUrl - URL of the fish image
 * @param {Function} onComplete - Callback when information is saved
 */
async function showFishInfoModal(fishId, imageUrl, onComplete) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;

    const modalHTML = `
        <div class="fish-info-modal" style="
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        ">
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 60px; margin-bottom: 15px;">🎉</div>
                <h2 style="color: #6366F1; margin: 0 0 10px 0; font-size: 28px;">
                    Fish Created Successfully!
                </h2>
                <p style="color: #666; margin: 0;">
                    Tell us more about your fish
                </p>
            </div>

            <div style="margin-bottom: 24px;">
                <img src="${imageUrl}" alt="Your Fish" style="
                    width: 100%;
                    max-width: 300px;
                    display: block;
                    margin: 0 auto;
                    border-radius: 12px;
                    border: 3px solid #6366F1;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
                ">
            </div>

            <form id="fish-info-form" style="display: flex; flex-direction: column; gap: 20px;">
                <div class="form-group">
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">
                        🐠 Fish Name <span style="color: #ff6b6b;">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="fish-name" 
                        name="fishName"
                        placeholder="e.g., Nemo, Dory, Bubbles..."
                        required
                        style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e2e8f0;
                            border-radius: 8px;
                            font-size: 16px;
                            transition: border-color 0.3s;
                            box-sizing: border-box;
                        "
                    >
                </div>

                <div class="form-group">
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">
                        ✨ Personality <span style="color: #ff6b6b;">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="fish-personality" 
                        name="personality"
                        placeholder="e.g., cheerful, shy, brave, lazy, curious..."
                        required
                        style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e2e8f0;
                            border-radius: 8px;
                            font-size: 16px;
                            transition: border-color 0.3s;
                            box-sizing: border-box;
                        "
                    >
                    <small style="color: #666; font-size: 12px; margin-top: 4px; display: block;">
                        Describe your fish's personality in one word or phrase
                    </small>
                </div>

                <div class="form-group">
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">
                        👤 Owner Nickname (Optional)
                    </label>
                    <input 
                        type="text" 
                        id="feeder-name" 
                        name="feederName"
                        placeholder="e.g., Captain Fisher, Ocean Lover..."
                        style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e2e8f0;
                            border-radius: 8px;
                            font-size: 16px;
                            transition: border-color 0.3s;
                            box-sizing: border-box;
                        "
                    >
                </div>

                <div class="form-group">
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">
                        📝 Owner Info (Optional)
                    </label>
                    <textarea 
                        id="feeder-info" 
                        name="feederInfo"
                        placeholder="Tell us about yourself..."
                        rows="3"
                        style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e2e8f0;
                            border-radius: 8px;
                            font-size: 16px;
                            transition: border-color 0.3s;
                            resize: vertical;
                            font-family: inherit;
                            box-sizing: border-box;
                        "
                    ></textarea>
                    <small style="color: #666; font-size: 12px; margin-top: 4px; display: block;">
                        This helps your fish chat about you!
                    </small>
                </div>

                <div id="error-message" style="
                    display: none;
                    background: #fee;
                    border: 1px solid #fcc;
                    color: #c33;
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 14px;
                "></div>

                <div style="display: flex; gap: 12px; margin-top: 10px;">
                    <button 
                        type="submit"
                        id="confirm-fish-info"
                        style="
                            flex: 1;
                            padding: 14px 24px;
                            background: #6366F1;
                            color: white;
                            border: none;
                            border-radius: 10px;
                            font-weight: 600;
                            font-size: 16px;
                            cursor: pointer;
                            transition: all 0.3s;
                        "
                    >
                        Confirm & Continue
                    </button>
                </div>
            </form>
        </div>
    `;

    overlay.innerHTML = modalHTML;
    document.body.appendChild(overlay);

    // Add focus styles
    const inputs = overlay.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', (e) => {
            e.target.style.borderColor = '#6366F1';
            e.target.style.outline = 'none';
        });
        input.addEventListener('blur', (e) => {
            e.target.style.borderColor = '#e2e8f0';
        });
    });

    // Handle form submission
    const form = overlay.querySelector('#fish-info-form');
    const errorDiv = overlay.querySelector('#error-message');
    const confirmBtn = overlay.querySelector('#confirm-fish-info');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fishName = form.fishName.value.trim();
        const personality = form.personality.value.trim();
        const feederName = form.feederName.value.trim();
        const feederInfo = form.feederInfo.value.trim();

        if (!fishName || !personality) {
            showError('Please fill in all required fields');
            return;
        }

        // Disable button and show loading
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Checking content...';

        try {
            // Step 1: Content moderation check
            console.log('[Fish Info] Checking content moderation...');
            const moderationResult = await checkContentModeration({
                personality,
                feeder_name: feederName,
                feeder_info: feederInfo
            });

            if (!moderationResult.is_compliant) {
                showError(`Content policy violation: ${moderationResult.reason}`);
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Confirm & Continue';
                return;
            }

            // Step 2: Update fish and user information
            console.log('[Fish Info] Updating fish information...');
            confirmBtn.textContent = 'Saving...';

            await updateFishInfo(fishId, {
                fishName,
                personality,
                feederName,
                feederInfo
            });

            console.log('[Fish Info] Information saved successfully!');

            // Close modal
            document.body.removeChild(overlay);

            // Call completion callback
            if (onComplete) {
                onComplete();
            }

        } catch (error) {
            console.error('[Fish Info] Error:', error);
            showError(error.message || 'An error occurred. Please try again.');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm & Continue';
        }
    });

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    // Don't allow closing by clicking outside (must complete form)
    // But allow escape key
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            if (confirm('Are you sure you want to skip adding fish information?')) {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', escHandler);
                if (onComplete) {
                    onComplete();
                }
            }
        }
    });
}

/**
 * Check content moderation using API
 * @param {Object} data - Content to check
 * @returns {Promise<Object>} - Moderation result
 */
async function checkContentModeration(data) {
    const response = await fetch(`${window.BACKEND_URL}/api/fish/moderation/check`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`Moderation check failed: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.error || 'Moderation check failed');
    }

    return result;
}

/**
 * Update fish and user information
 * @param {string} fishId - Fish ID
 * @param {Object} data - Fish and user information
 */
async function updateFishInfo(fishId, data) {
    // Get current user
    const currentUser = await window.getCurrentUser();

    if (!currentUser) {
        throw new Error('User not authenticated');
    }

    // Get auth token
    let authToken = null;
    if (window.supabaseAuth) {
        authToken = await window.supabaseAuth.getAccessToken();
    }

    // Update fish information
    const response = await fetch(`${window.BACKEND_URL}/api/fish/update-info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
            fishId,
            fishName: data.fishName,
            personality: data.personality,
            userId: currentUser.id,
            feederName: data.feederName || null,
            feederInfo: data.feederInfo || null
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update fish information');
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.error || 'Failed to update fish information');
    }

    return result;
}

// Export functions
window.showFishInfoModal = showFishInfoModal;

