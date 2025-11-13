/**
 * Fish Information Update API
 * 
 * Updates fish name, personality and user's feeder information
 * after successful fish upload and content moderation.
 */

require('dotenv').config({ path: '.env.local' });
const { executeGraphQL } = require('../../hasura');

module.exports = async (req, res) => {
    // Only accept POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method Not Allowed'
        });
    }

    try {
        const { fishId, fishName, personality, userId, feederName, feederInfo } = req.body;

        console.log('[Fish Update Info] Received request:', {
            fishId,
            fishName,
            personality,
            userId,
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
                    updated_at
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
                mutation UpdateUserFeederInfo($userId: String!, $feederName: String, $feederInfo: String) {
                    update_users_by_pk(
                        pk_columns: { id: $userId },
                        _set: {
                            feeder_name: $feederName,
                            feeder_info: $feederInfo
                        }
                    ) {
                        id
                        feeder_name
                        feeder_info
                    }
                }
            `;

            const userResult = await executeGraphQL(updateUserMutation, {
                userId,
                feederName: feederName || null,
                feederInfo: feederInfo || null
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

