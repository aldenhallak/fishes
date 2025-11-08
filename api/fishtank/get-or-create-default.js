// =====================================================
// Get or Create Default Private Tank API
// =====================================================
// GET /api/fishtank/get-or-create-default
// Returns the user's default private tank, creating it if it doesn't exist

const { createClient } = require('@supabase/supabase-js');
const { BACKGROUNDS } = require('../config/fishtank-config');
const { randomBytes } = require('crypto');

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

    // Try to get existing default tank using Hasura GraphQL
    const hasuraEndpoint = process.env.HASURA_GRAPHQL_ENDPOINT;
    const hasuraSecret = process.env.HASURA_ADMIN_SECRET;

    if (!hasuraEndpoint) {
      return res.status(500).json({ error: 'Hasura endpoint not configured' });
    }

    // Query for existing default tank
    const query = `
      query GetDefaultTank($userId: String!) {
        fishtanks(where: {user_id: {_eq: $userId}, is_default: {_eq: true}}, limit: 1) {
          id
          user_id
          name
          description
          is_public
          is_default
          background_url
          fish_count
          view_count
          created_at
          updated_at
          share_id
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
      return res.status(500).json({ error: 'Failed to query tank data' });
    }

    // If tank exists, return it
    if (hasuraData.data.fishtanks && hasuraData.data.fishtanks.length > 0) {
      return res.status(200).json({
        success: true,
        fishtank: hasuraData.data.fishtanks[0]
      });
    }

    // Tank doesn't exist, create it
    const shareId = randomBytes(8).toString('hex');
    const defaultBackground = BACKGROUNDS[0].url; // Use first background as default

    const createMutation = `
      mutation CreateDefaultTank($userId: String!, $name: String!, $description: String!, $shareId: String!, $backgroundUrl: String!) {
        insert_fishtanks_one(object: {
          user_id: $userId,
          name: $name,
          description: $description,
          is_public: false,
          is_default: true,
          share_id: $shareId,
          background_url: $backgroundUrl,
          fish_count: 0,
          view_count: 0
        }) {
          id
          user_id
          name
          description
          is_public
          is_default
          background_url
          fish_count
          view_count
          created_at
          updated_at
          share_id
        }
      }
    `;

    const createResponse = await fetch(hasuraEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(hasuraSecret && { 'x-hasura-admin-secret': hasuraSecret }),
      },
      body: JSON.stringify({
        query: createMutation,
        variables: {
          userId,
          name: 'My Private Tank',
          description: 'My personal fish collection',
          shareId,
          backgroundUrl: defaultBackground
        }
      })
    });

    const createData = await createResponse.json();

    if (createData.errors) {
      console.error('Hasura mutation error:', createData.errors);
      return res.status(500).json({ error: 'Failed to create tank' });
    }

    return res.status(201).json({
      success: true,
      created: true,
      fishtank: createData.data.insert_fishtanks_one
    });

  } catch (error) {
    console.error('Error in get-or-create-default:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};














