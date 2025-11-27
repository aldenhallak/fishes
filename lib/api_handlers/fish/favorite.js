// =====================================================
// Add Fish to Favorites API
// =====================================================
// POST /api/fish/favorite
// Adds a fish to user's favorites

const { createClient } = require('@supabase/supabase-js');
const { getUserMembership } = require('../middleware/membership');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - Missing or invalid token' });
    }

    const token = authHeader.substring(7);
    
    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    const userId = user.id;
    const { fishId } = req.body;

    if (!fishId) {
      return res.status(400).json({ error: 'Missing fishId parameter' });
    }

    // Get Hasura configuration
    const hasuraEndpoint = process.env.HASURA_GRAPHQL_ENDPOINT;
    const hasuraSecret = process.env.HASURA_ADMIN_SECRET;

    if (!hasuraEndpoint) {
      return res.status(500).json({ error: 'Hasura endpoint not configured' });
    }

    // Check if user already has too many favorites
    const countQuery = `
      query CountFavorites($userId: String!) {
        fish_favorites_aggregate(where: {user_id: {_eq: $userId}}) {
          aggregate {
            count
          }
        }
      }
    `;

    const countResponse = await fetch(hasuraEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(hasuraSecret && { 'x-hasura-admin-secret': hasuraSecret }),
      },
      body: JSON.stringify({
        query: countQuery,
        variables: { userId }
      })
    });

    const countData = await countResponse.json();
    
    if (countData.errors) {
      console.error('Hasura count error:', countData.errors);
      return res.status(500).json({ error: 'Failed to check favorites count' });
    }

    const currentCount = countData.data.fish_favorites_aggregate.aggregate.count;
    
    // 获取用户会员信息，包括收藏限制
    let membership;
    try {
      membership = await getUserMembership(userId);
    } catch (error) {
      console.error('Error getting membership:', error);
      // 如果获取会员信息失败，使用默认限制
      membership = { addToMyTankLimit: 5, tier: 'free', memberTypeName: 'Free' };
    }
    
    const maxLimit = membership.addToMyTankLimit || 5; // 默认值 5
    
    // 调试日志
    console.log('🔍 [Favorite API] Limit check:', {
      userId,
      currentCount,
      maxLimit,
      tier: membership.tier,
      willBlock: currentCount >= maxLimit
    });
    
    if (currentCount >= maxLimit) {
      // 构建升级提示信息
      let upgradeMessage = '';
      if (membership.tier === 'free') {
        upgradeMessage = 'Upgrade to Plus to add up to 20 fish, or Premium for 100 fish!';
      } else if (membership.tier === 'plus') {
        upgradeMessage = 'Upgrade to Premium to add up to 100 fish!';
      } else {
        upgradeMessage = 'You have reached the maximum limit. Contact us if you need more space.';
      }
      
      return res.status(403).json({ 
        error: 'Tank limit reached',
        message: `Your ${membership.memberTypeName} membership allows up to ${maxLimit} fish in your tank. ${upgradeMessage}`,
        currentCount,
        maxLimit,
        tier: membership.tier,
        memberTypeName: membership.memberTypeName,
        upgradeUrl: '/membership.html'
      });
    }

    // Check if fish exists and is not the user's own fish
    const fishQuery = `
      query GetFish($fishId: uuid!) {
        fish_by_pk(id: $fishId) {
          id
          user_id
          is_approved
        }
      }
    `;

    const fishResponse = await fetch(hasuraEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(hasuraSecret && { 'x-hasura-admin-secret': hasuraSecret }),
      },
      body: JSON.stringify({
        query: fishQuery,
        variables: { fishId }
      })
    });

    const fishData = await fishResponse.json();

    if (fishData.errors) {
      console.error('Hasura fish query error:', fishData.errors);
      return res.status(500).json({ error: 'Failed to verify fish' });
    }

    if (!fishData.data.fish_by_pk) {
      return res.status(404).json({ error: 'Fish not found' });
    }

    const fish = fishData.data.fish_by_pk;

    // Don't allow users to favorite their own fish
    if (fish.user_id === userId) {
      return res.status(400).json({ error: 'You cannot favorite your own fish' });
    }

    // Don't allow favoriting unapproved fish
    if (!fish.is_approved) {
      return res.status(400).json({ error: 'This fish is not approved' });
    }

    // Add to favorites
    const insertMutation = `
      mutation AddFavorite($userId: String!, $fishId: uuid!) {
        insert_fish_favorites_one(
          object: {user_id: $userId, fish_id: $fishId},
          on_conflict: {constraint: unique_user_fish_favorite, update_columns: []}
        ) {
          id
          user_id
          fish_id
          created_at
        }
      }
    `;

    const insertResponse = await fetch(hasuraEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(hasuraSecret && { 'x-hasura-admin-secret': hasuraSecret }),
      },
      body: JSON.stringify({
        query: insertMutation,
        variables: { userId, fishId }
      })
    });

    const insertData = await insertResponse.json();

    if (insertData.errors) {
      console.error('Hasura insert error:', insertData.errors);
      return res.status(500).json({ error: 'Failed to add favorite' });
    }

    return res.status(200).json({
      success: true,
      message: 'Fish added to favorites',
      favorite: insertData.data.insert_fish_favorites_one
    });

  } catch (error) {
    console.error('Error in favorite:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

