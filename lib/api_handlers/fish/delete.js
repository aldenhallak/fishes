/**
 * Fish Delete API
 * 
 * Soft-deletes a fish by setting is_alive to false.
 * Only the fish owner can delete their fish.
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
        const { fishId, userId } = req.body;

        console.log('[Fish Delete] Received request:', {
            fishId,
            userId
        });

        // Validate required fields
        if (!fishId || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: fishId, userId'
            });
        }

        // Verify fish ownership
        const ownershipQuery = `
            query CheckFishOwnership($fishId: uuid!) {
                fish_by_pk(id: $fishId) {
                    id
                    user_id
                    fish_name
                    is_approved
                }
            }
        `;

        const ownershipResult = await executeGraphQL(ownershipQuery, { fishId });

        if (ownershipResult.errors) {
            console.error('[Fish Delete] Ownership check errors:', ownershipResult.errors);
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
                error: 'You do not have permission to delete this fish'
            });
        }

        // Soft delete the fish by setting is_approved to false
        // This makes the fish invisible in normal queries while keeping the data
        const deleteMutation = `
            mutation DeleteFish($fishId: uuid!) {
                update_fish_by_pk(
                    pk_columns: { id: $fishId },
                    _set: {
                        is_approved: false
                    }
                ) {
                    id
                    fish_name
                    is_approved
                }
            }
        `;

        const deleteResult = await executeGraphQL(deleteMutation, { fishId });

        if (deleteResult.errors) {
            console.error('[Fish Delete] GraphQL errors:', deleteResult.errors);
            throw new Error(`Failed to delete fish: ${JSON.stringify(deleteResult.errors)}`);
        }

        if (!deleteResult.data?.update_fish_by_pk) {
            throw new Error('Fish not found or delete failed');
        }

        console.log('[Fish Delete] Fish deleted successfully:', deleteResult.data.update_fish_by_pk);

        return res.status(200).json({
            success: true,
            message: 'Fish deleted successfully',
            fish: deleteResult.data.update_fish_by_pk
        });

    } catch (error) {
        console.error('[Fish Delete] Error:', error);

        return res.status(500).json({
            success: false,
            error: 'Failed to delete fish',
            details: error.message
        });
    }
};

