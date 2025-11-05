// =====================================================
// Change Tank Background API
// =====================================================
// POST /api/fishtank/change-background
// Changes the background of user's private tank (costs fish food)

const { createClient } = require('@supabase/supabase-js');
const { BACKGROUNDS } = require('../config/fishtank-config');

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
    const { backgroundId } = req.body;

    if (!backgroundId) {
      return res.status(400).json({ error: 'Missing backgroundId parameter' });
    }

    // Find the background
    const background = BACKGROUNDS.find(bg => bg.id === parseInt(backgroundId));
    
    if (!background) {
      return res.status(404).json({ error: 'Background not found' });
    }

    // Get Hasura configuration
    const hasuraEndpoint = process.env.HASURA_GRAPHQL_ENDPOINT;
    const hasuraSecret = process.env.HASURA_ADMIN_SECRET;

    if (!hasuraEndpoint) {
      return res.status(500).json({ error: 'Hasura endpoint not configured' });
    }

    // If background costs fish food, check balance and deduct
    if (background.cost > 0) {
      // Check user's fish food balance
      const balanceQuery = `
        query GetBalance($userId: String!) {
          user_economy(where: {user_id: {_eq: $userId}}) {
            fish_food
          }
        }
      `;

      const balanceResponse = await fetch(hasuraEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(hasuraSecret && { 'x-hasura-admin-secret': hasuraSecret }),
        },
        body: JSON.stringify({
          query: balanceQuery,
          variables: { userId }
        })
      });

      const balanceData = await balanceResponse.json();

      if (balanceData.errors) {
        console.error('Hasura balance query error:', balanceData.errors);
        return res.status(500).json({ error: 'Failed to check balance' });
      }

      const userEconomy = balanceData.data.user_economy[0];
      
      if (!userEconomy) {
        return res.status(400).json({ error: 'User economy data not found. Please create a fish first.' });
      }

      if (userEconomy.fish_food < background.cost) {
        return res.status(400).json({ 
          error: 'Insufficient fish food',
          required: background.cost,
          available: userEconomy.fish_food
        });
      }

      // Deduct fish food
      const deductMutation = `
        mutation DeductFishFood($userId: String!, $cost: Int!) {
          update_user_economy(
            where: {user_id: {_eq: $userId}},
            _inc: {fish_food: $cost}
          ) {
            affected_rows
            returning {
              fish_food
            }
          }
        }
      `;

      const deductResponse = await fetch(hasuraEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(hasuraSecret && { 'x-hasura-admin-secret': hasuraSecret }),
        },
        body: JSON.stringify({
          query: deductMutation,
          variables: { userId, cost: -background.cost }
        })
      });

      const deductData = await deductResponse.json();

      if (deductData.errors) {
        console.error('Hasura deduct error:', deductData.errors);
        return res.status(500).json({ error: 'Failed to deduct fish food' });
      }

      // Log the transaction
      const logMutation = `
        mutation LogTransaction($userId: String!, $amount: Int!, $operation: String!, $description: String!) {
          insert_economy_log_one(object: {
            user_id: $userId,
            amount: $amount,
            operation_type: $operation,
            description: $description,
            balance_after: ${deductData.data.update_user_economy.returning[0].fish_food}
          }) {
            id
          }
        }
      `;

      await fetch(hasuraEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(hasuraSecret && { 'x-hasura-admin-secret': hasuraSecret }),
        },
        body: JSON.stringify({
          query: logMutation,
          variables: { 
            userId, 
            amount: -background.cost,
            operation: 'background_change',
            description: `Changed tank background to: ${background.name}`
          }
        })
      });
    }

    // Update tank background
    const updateMutation = `
      mutation UpdateBackground($userId: String!, $backgroundUrl: String!) {
        update_fishtanks(
          where: {user_id: {_eq: $userId}, is_default: {_eq: true}},
          _set: {background_url: $backgroundUrl}
        ) {
          affected_rows
          returning {
            id
            background_url
            updated_at
          }
        }
      }
    `;

    const updateResponse = await fetch(hasuraEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(hasuraSecret && { 'x-hasura-admin-secret': hasuraSecret }),
      },
      body: JSON.stringify({
        query: updateMutation,
        variables: { userId, backgroundUrl: background.url }
      })
    });

    const updateData = await updateResponse.json();

    if (updateData.errors) {
      console.error('Hasura update error:', updateData.errors);
      return res.status(500).json({ error: 'Failed to update background' });
    }

    if (updateData.data.update_fishtanks.affected_rows === 0) {
      return res.status(404).json({ error: 'Tank not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Background changed successfully',
      background,
      tank: updateData.data.update_fishtanks.returning[0],
      costDeducted: background.cost
    });

  } catch (error) {
    console.error('Error in change-background:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};




