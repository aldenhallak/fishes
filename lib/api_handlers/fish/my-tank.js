// =====================================================
// Get My Tank Fish API
// =====================================================
// GET /api/fish/my-tank
// Returns user's own fish + favorited fish for Private Tank view

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

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
          artist
          image_url
          personality
          upvotes
          is_approved
          created_at
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
            artist
            image_url
            personality
            upvotes
            is_approved
            created_at
          }
        }
      }
    `;

    console.log('🔍 Querying Hasura for userId:', userId);
    console.log('🔍 Hasura endpoint:', hasuraEndpoint ? 'configured' : 'missing');
    
    let response;
    try {
      response = await fetch(hasuraEndpoint, {
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
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError.message);
      return res.status(500).json({ 
        error: 'Failed to connect to Hasura',
        details: fetchError.message 
      });
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('❌ Hasura request failed:', response.status, response.statusText);
      console.error('❌ Error details:', errorText);
      return res.status(500).json({ 
        error: 'Failed to query fish data from Hasura',
        status: response.status,
        statusText: response.statusText,
        details: errorText
      });
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('❌ Failed to parse Hasura response:', jsonError);
      const textResponse = await response.text();
      console.error('❌ Raw response:', textResponse);
      return res.status(500).json({ 
        error: 'Invalid response from Hasura',
        details: jsonError.message 
      });
    }

    if (data.errors) {
      console.error('❌ Hasura query error:', JSON.stringify(data.errors, null, 2));
      return res.status(500).json({ 
        error: 'Failed to query fish data',
        details: data.errors 
      });
    }

    if (!data.data) {
      console.error('❌ Hasura returned no data');
      console.error('❌ Response:', JSON.stringify(data, null, 2));
      return res.status(500).json({ 
        error: 'No data returned from Hasura',
        response: data 
      });
    }

    // Extract favorited fish from the nested structure
    const favoritedFish = (data.data.favoritedFish || []).map(fav => {
      if (!fav.fish) {
        console.warn('⚠️ Favorited fish entry missing fish data:', fav);
        return null;
      }
      return {
        ...fav.fish,
        is_favorited: true,
        favorited_at: fav.created_at
      };
    }).filter(fish => fish !== null);

    // Combine and sort by created_at
    const allFish = [
      ...(data.data.ownFish || []).map(fish => ({
        ...fish,
        is_own: true,
        is_favorited: false
      })),
      ...favoritedFish.map(fish => ({
        ...fish,
        is_own: false
      }))
    ].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
    
    console.log(`✅ Found ${allFish.length} fish (${data.data.ownFish?.length || 0} own, ${favoritedFish.length} favorited)`);

    // Calculate stats
    const stats = {
      totalCount: allFish.length,
      ownCount: (data.data.ownFish || []).length,
      favoritedCount: favoritedFish.length,
      approvedCount: allFish.filter(f => f.is_approved).length
    };

    return res.status(200).json({
      success: true,
      fish: allFish,
      stats,
      userId
    });

  } catch (error) {
    console.error('❌ Error in my-tank:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

