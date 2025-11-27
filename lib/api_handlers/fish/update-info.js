/**
 * Fish Information Update API
 * 
 * Updates fish name, personality and user's feeder information
 * after successful fish upload and content moderation.
 * 
 * Supports custom personalities for premium/plus members.
 */

require('dotenv').config({ path: '.env.local' });
const { executeGraphQL } = require('../../hasura');

// Preset personalities list
const PRESET_PERSONALITIES = [
    'random', 'funny', 'cheerful', 'brave', 'playful', 'curious', 'energetic',
    'calm', 'gentle', 'sarcastic', 'dramatic', 'naive', 'shy', 'anxious',
    'stubborn', 'serious', 'lazy', 'grumpy', 'aggressive', 'cynical', 'crude'
];

module.exports = async (req, res) => {
    // Only accept POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method Not Allowed'
        });
    }

    try {
        const { fishId, fishName, personality, userId, feederName, feederInfo, isCustomPersonality } = req.body;

        console.log('[Fish Update Info] Received request:', {
            fishId,
            fishName,
            personality,
            userId,
            isCustomPersonality,
            hasFeederName: !!feederName,
            hasFeederInfo: !!feederInfo
        });

        // Validate required fields
        if (!fishId || !fishName || !personality || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: fishId, fishName, personality, userId'
            });
        }

        // Validate field lengths
        if (fishName.length > 30) {
            return res.status(400).json({
                success: false,
                error: 'Fish name must be 30 characters or less'
            });
        }

        // Verify fish ownership
        const ownershipQuery = `
            query CheckFishOwnership($fishId: uuid!) {
                fish_by_pk(id: $fishId) {
                    id
                    user_id
                }
            }
        `;

        const ownershipResult = await executeGraphQL(ownershipQuery, { fishId });

        if (ownershipResult.errors) {
            console.error('[Fish Update Info] Ownership check errors:', ownershipResult.errors);
            throw new Error('Failed to verify fish ownership');
        }

        const fish = ownershipResult.data?.fish_by_pk;

        if (!fish) {
            return res.status(404).json({
                success: false,
                error: 'Fish not found'
            });
        }

        if (fish.user_id !== userId) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to edit this fish'
            });
        }

        // Handle custom personality validation
        if (isCustomPersonality) {
            // Check if personality is custom (not in preset list)
            const isPreset = PRESET_PERSONALITIES.includes(personality.toLowerCase());
            
            if (!isPreset) {
                // Custom personality - check membership
                if (personality.length > 50) {
                    return res.status(400).json({
                        success: false,
                        error: 'Custom personality must be 50 characters or less'
                    });
                }

                // Check user membership
                const membershipQuery = `
                    query CheckUserMembership($userId: String!) {
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

                const membershipResult = await executeGraphQL(membershipQuery, { userId });

                if (membershipResult.errors) {
                    console.error('[Fish Update Info] Membership check errors:', membershipResult.errors);
                    // Continue with update but log warning
                    console.warn('[Fish Update Info] Could not verify membership, allowing update');
                } else {
                    const subscription = membershipResult.data?.users_by_pk?.user_subscriptions?.[0];
                    const membershipPlan = subscription?.plan || 'free';

                    if (membershipPlan === 'free') {
                        return res.status(403).json({
                            success: false,
                            error: 'Custom personalities are only available for Premium and Plus members',
                            requiresUpgrade: true
                        });
                    }

                    console.log('[Fish Update Info] Custom personality authorized for member:', membershipPlan);
                }
            }
        }

        // Update fish information
        const updateFishMutation = `
            mutation UpdateFish($fishId: uuid!, $fishName: String!, $personality: String!) {
                update_fish_by_pk(
                    pk_columns: { id: $fishId },
                    _set: {
                        fish_name: $fishName,
                        personality: $personality
                    }
                ) {
                    id
                    fish_name
                    personality
                }
            }
        `;

        const fishResult = await executeGraphQL(updateFishMutation, {
            fishId,
            fishName,
            personality
        });

        if (fishResult.errors) {
            console.error('[Fish Update Info] GraphQL errors:', fishResult.errors);
            throw new Error(`Failed to update fish: ${JSON.stringify(fishResult.errors)}`);
        }

        if (!fishResult.data?.update_fish_by_pk) {
            throw new Error('Fish not found or update failed');
        }

        console.log('[Fish Update Info] Fish updated successfully:', fishResult.data.update_fish_by_pk);

        // Update user feeder information if provided
        if (feederName || feederInfo) {
            const updateUserMutation = `
                mutation UpdateUserInfo($userId: String!, $nickName: String, $aboutMe: String) {
                    update_users_by_pk(
                        pk_columns: { id: $userId },
                        _set: {
                            nick_name: $nickName,
                            about_me: $aboutMe
                        }
                    ) {
                        id
                        nick_name
                        about_me
                    }
                }
            `;

            const userResult = await executeGraphQL(updateUserMutation, {
                userId,
                nickName: feederName || null,
                aboutMe: feederInfo || null
            });

            if (userResult.errors) {
                console.error('[Fish Update Info] User update errors:', userResult.errors);
                // Don't fail the entire request if user update fails
                console.warn('[Fish Update Info] Fish updated but user feeder info failed to update');
            } else {
                console.log('[Fish Update Info] User feeder info updated successfully');
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Fish information updated successfully',
            fish: fishResult.data.update_fish_by_pk
        });

    } catch (error) {
        console.error('[Fish Update Info] Error:', error);

        return res.status(500).json({
            success: false,
            error: 'Failed to update fish information',
            details: error.message
        });
    }
};

