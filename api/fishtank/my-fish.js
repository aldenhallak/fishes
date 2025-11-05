// =====================================================
// Get My Fish API (Created + Favorited)
// =====================================================
// GET /api/fishtank/my-fish
// Returns all fish for the user's private tank (owned + favorited)

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

    // Query to get user's own fish
    // Note: fish_favorites table is not tracked in Hasura yet
    const query = `
      query GetMyFish($userId: String!) {
        fish(
          where: {
            user_id: {_eq: $userId}
          },
          order_by: {created_at: desc}
        ) {
          id
          user_id
          image_url
          artist
          created_at
          talent
          level
          experience
          health
          max_health
          battle_power
          is_alive
        }
      }
    `;

    const hasuraResponse = await fetch(hasuraEndpoint, {
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

    const hasuraData = await hasuraResponse.json();

    if (hasuraData.errors) {
      console.error('Hasura query error:', hasuraData.errors);
      return res.status(500).json({ 
        error: 'Failed to query fish data',
        details: hasuraData.errors,
        endpoint: hasuraEndpoint
      });
    }

    // Process the data
    const ownFish = hasuraData.data.fish || [];
    
    // Mark own fish
    const markedOwnFish = ownFish.map(fish => ({
      ...fish,
      isOwn: true,
      isFavorited: false
    }));

    // For now, only return own fish (favorites table not tracked yet)
    const allFish = markedOwnFish;

    // Calculate stats
    const stats = {
      totalFish: allFish.length,
      ownFish: markedOwnFish.length,
      favoritedFish: 0, // Favorites feature not available yet (fish_favorites table not tracked)
      aliveFish: allFish.filter(f => f.is_alive).length,
      deadFish: allFish.filter(f => !f.is_alive).length,
      totalLevel: allFish.reduce((sum, f) => sum + f.level, 0),
      avgLevel: allFish.length > 0 ? (allFish.reduce((sum, f) => sum + f.level, 0) / allFish.length).toFixed(1) : 0
    };

    return res.status(200).json({
      success: true,
      fish: allFish,
      stats
    });

  } catch (error) {
    console.error('Error in my-fish:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};




