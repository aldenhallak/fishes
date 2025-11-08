// =====================================================
// Remove Fish from Favorites API
// =====================================================
// POST /api/fishtank/unfavorite
// Removes a fish from user's favorites

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

    // Delete the favorite
    const deleteMutation = `
      mutation RemoveFavorite($userId: String!, $fishId: uuid!) {
        delete_fish_favorites(where: {user_id: {_eq: $userId}, fish_id: {_eq: $fishId}}) {
          affected_rows
        }
      }
    `;

    const deleteResponse = await fetch(hasuraEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(hasuraSecret && { 'x-hasura-admin-secret': hasuraSecret }),
      },
      body: JSON.stringify({
        query: deleteMutation,
        variables: { userId, fishId }
      })
    });

    const deleteData = await deleteResponse.json();

    if (deleteData.errors) {
      console.error('Hasura delete error:', deleteData.errors);
      return res.status(500).json({ error: 'Failed to remove favorite' });
    }

    const affectedRows = deleteData.data.delete_fish_favorites.affected_rows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Fish removed from favorites',
      affectedRows
    });

  } catch (error) {
    console.error('Error in unfavorite:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};














