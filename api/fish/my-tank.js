// =====================================================
// Get My Tank Fish API
// =====================================================
// GET /api/fish/my-tank
// Returns user's own fish + favorited fish for Private Tank view

const { createClient } = require('@supabase/supabase-js');

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
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

    // Get Hasura configuration
    const hasuraEndpoint = process.env.HASURA_GRAPHQL_ENDPOINT;
    const hasuraSecret = process.env.HASURA_ADMIN_SECRET;

    if (!hasuraEndpoint) {
      return res.status(500).json({ error: 'Hasura endpoint not configured' });
    }

    // GraphQL query to get user's own fish + favorited fish
    const query = `
      query GetMyTankFish($userId: String!) {
        # User's own fish
        ownFish: fish(
          where: {user_id: {_eq: $userId}}
          order_by: {created_at: desc}
        ) {
          id
          user_id
          fish_name
          image_url
          personality
          talent
          level
          experience
          health
          max_health
          upvotes
          is_approved
          is_alive
          created_at
          updated_at
        }
        
        # User's favorited fish
        favoritedFish: fish_favorites(
          where: {user_id: {_eq: $userId}}
          order_by: {created_at: desc}
        ) {
          id
          fish_id
          created_at
          fish {
            id
            user_id
            fish_name
            image_url
            personality
            talent
            level
            experience
            health
            max_health
            upvotes
            is_approved
            is_alive
            created_at
            updated_at
          }
        }
      }
    `;

    const response = await fetch(hasuraEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(hasuraSecret && { 'x-hasura-admin-secret': hasuraSecret }),
      },
      body: JSON.stringify({
        query,
        variables: { userId }
      })
    });

    const data = await response.json();

    if (data.errors) {
      console.error('Hasura query error:', data.errors);
      return res.status(500).json({ error: 'Failed to query fish data' });
    }

    // Extract favorited fish from the nested structure
    const favoritedFish = data.data.favoritedFish.map(fav => ({
      ...fav.fish,
      is_favorited: true,
      favorited_at: fav.created_at
    }));

    // Combine and sort by created_at
    const allFish = [
      ...data.data.ownFish.map(fish => ({
        ...fish,
        is_own: true,
        is_favorited: false
      })),
      ...favoritedFish.map(fish => ({
        ...fish,
        is_own: false
      }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Calculate stats
    const stats = {
      totalCount: allFish.length,
      ownCount: data.data.ownFish.length,
      favoritedCount: favoritedFish.length,
      aliveCount: allFish.filter(f => f.is_alive).length,
      approvedCount: allFish.filter(f => f.is_approved).length
    };

    return res.status(200).json({
      success: true,
      fish: allFish,
      stats,
      userId
    });

  } catch (error) {
    console.error('Error in my-tank:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

