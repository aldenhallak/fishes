/**
 * Fish Monologue API
 * 
 * Returns a random monologue for a randomly selected fish from the tank.
 * Uses pre-stored content from fish_monologues table.
 * 
 * Trigger mechanism: Entire tank triggers once every N seconds (controlled by global_params),
 * and one random fish speaks each time.
 */

require('dotenv').config({ path: '.env.local' });
const { executeGraphQL } = require('../../../lib/hasura');
const { canFishSelfTalk } = require('../../middleware/membership');

/**
 * Select one random fish from the tank
 * Only selects fish from users whose membership allows self-talk
 * @returns {Promise<Object>} - Selected fish with user info
 */
async function selectRandomFish() {
    // First, get all fish with their user subscription info
    const query = `
        query GetRandomFish {
            fish(
                where: { 
                    is_approved: { _eq: true },
                    personality: { _is_null: false }
                },
                order_by: { created_at: desc },
                limit: 200
            ) {
                id
                fish_name
                personality
                user_id
                user {
                    id
                    user_subscriptions(
                        where: { is_active: { _eq: true } }
                        order_by: { created_at: desc }
                        limit: 1
                    ) {
                        plan
                    }
                }
            }
            member_types {
                id
                can_self_talk
            }
        }
    `;

    const result = await executeGraphQL(query);

    if (result.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }

    const allFishes = result.data.fish || [];
    const memberTypes = result.data.member_types || [];

    // Create member types map
    const memberTypesMap = {};
    memberTypes.forEach(mt => {
        memberTypesMap[mt.id] = mt;
    });

    if (allFishes.length === 0) {
        throw new Error('No approved fish found in the tank');
    }

    // Filter fish: only include fish from users whose membership allows self-talk
    const eligibleFishes = allFishes.filter(fish => {
        // Get latest active subscription
        const activeSubscription = fish.user && fish.user.user_subscriptions && fish.user.user_subscriptions.length > 0
            ? fish.user.user_subscriptions[0]
            : null;
        
        if (!activeSubscription) {
            // No subscription = free tier
            const freeType = memberTypesMap['free'];
            return freeType ? freeType.can_self_talk : false;
        }
        
        const plan = activeSubscription.plan || 'free';
        const memberType = memberTypesMap[plan] || memberTypesMap['free'];
        return memberType ? memberType.can_self_talk : false;
    });

    if (eligibleFishes.length === 0) {
        // No eligible fish found - this means no users have self-talk enabled
        throw new Error('NO_ELIGIBLE_FISH');
    }

    // Randomly select one fish from eligible ones
    const randomIndex = Math.floor(Math.random() * eligibleFishes.length);
    const selectedFish = eligibleFishes[randomIndex];
    
    // Return in the expected format (without user info for backward compatibility)
    return {
        id: selectedFish.id,
        fish_name: selectedFish.fish_name,
        personality: selectedFish.personality,
        user_id: selectedFish.user_id
    };
}

/**
 * Get a random monologue for a specific personality
 * @param {string} personality - Fish personality
 * @returns {Promise<string>} - Monologue content
 */
async function getRandomMonologue(personality) {
    const query = `
        query GetMonologue($personality: String!) {
            fish_monologues(
                where: { personality: { _eq: $personality } },
                limit: 20
            ) {
                id
                content
            }
        }
    `;

    const result = await executeGraphQL(query, { personality });

    if (result.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }

    let monologues = result.data.fish_monologues || [];

    // If no monologues found for this personality, try default
    if (monologues.length === 0) {
        console.log(`[Monologue] No monologues found for personality "${personality}", using default`);
        
        const defaultQuery = `
            query GetDefaultMonologue {
                fish_monologues(
                    where: { personality: { _eq: "default" } },
                    limit: 20
                ) {
                    id
                    content
                }
            }
        `;

        const defaultResult = await executeGraphQL(defaultQuery);

        if (defaultResult.errors) {
            throw new Error(`GraphQL Error: ${JSON.stringify(defaultResult.errors)}`);
        }

        monologues = defaultResult.data.fish_monologues || [];
    }

    if (monologues.length === 0) {
        // Ultimate fallback
        return "Just another day being a fish. Could be worse, could be on a plate!";
    }

    // Randomly select one monologue
    const randomIndex = Math.floor(Math.random() * monologues.length);
    return monologues[randomIndex].content;
}

/**
 * Save monologue to logs
 * @param {Object} fish - Fish data
 * @param {string} message - Monologue message
 * @returns {Promise<string>} - Log ID
 */
async function saveMonologueLog(fish, message) {
    const mutation = `
        mutation SaveMonologueLog(
            $fish_id: uuid!
            $fish_name: String
            $personality: String
            $message: String!
            $expires_at: timestamp!
        ) {
            insert_fish_monologue_logs_one(
                object: {
                    fish_id: $fish_id
                    fish_name: $fish_name
                    personality: $personality
                    message: $message
                    expires_at: $expires_at
                }
            ) {
                id
                created_at
            }
        }
    `;

    // Calculate expires_at (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const variables = {
        fish_id: fish.id,
        fish_name: fish.fish_name,
        personality: fish.personality,
        message: message,
        expires_at: expiresAt.toISOString()
    };

    try {
        const result = await executeGraphQL(mutation, variables);
        if (result.errors) {
            throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
        }
        return result.data.insert_fish_monologue_logs_one.id;
    } catch (error) {
        console.error('[Monologue] Failed to save log:', error);
        throw error;
    }
}

/**
 * Main API handler
 */
module.exports = async (req, res) => {
    // Accept GET or POST
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method Not Allowed'
        });
    }

    try {
        console.log('[Monologue] Generating monologue...');

        // Select one random fish
        const fish = await selectRandomFish();
        console.log('[Monologue] Selected fish:', fish.fish_name, 'Personality:', fish.personality);

        // Get random monologue for this fish's personality
        const monologue = await getRandomMonologue(fish.personality);
        console.log('[Monologue] Generated:', monologue.substring(0, 50) + '...');

        // Save to logs
        let logId = null;
        try {
            logId = await saveMonologueLog(fish, monologue);
            console.log('[Monologue] Log saved:', logId);
        } catch (saveError) {
            console.error('[Monologue] Failed to save log, continuing anyway:', saveError);
            // Continue even if save fails
        }

        return res.status(200).json({
            success: true,
            logId,
            fish: {
                id: fish.id,
                name: fish.fish_name,
                personality: fish.personality
            },
            message: monologue
        });

    } catch (error) {
        console.error('[Monologue] Error:', error);

        // Special handling for no eligible fish
        if (error.message === 'NO_ELIGIBLE_FISH') {
            return res.status(403).json({
                success: false,
                error: 'No eligible fish for monologue',
                message: 'No eligible fish found for monologue. Only Plus or Premium members\' fish can self-talk.',
                upgradeSuggestion: 'Upgrade to Plus or Premium membership to enable fish self-talk'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Failed to generate monologue',
            details: error.message
        });
    }
};

