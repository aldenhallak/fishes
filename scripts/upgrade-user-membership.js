/**
 * Script to upgrade user membership
 * Usage: node scripts/upgrade-user-membership.js <userId> <plan>
 * Example: node scripts/upgrade-user-membership.js f4933d0f-35a0-4aa1-8de5-ba407714b65c plus
 */

require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

const userId = process.argv[2];
const plan = process.argv[3] || 'plus'; // Default to 'plus'

if (!userId) {
  console.error('❌ Error: User ID is required');
  console.log('Usage: node scripts/upgrade-user-membership.js <userId> <plan>');
  console.log('Example: node scripts/upgrade-user-membership.js f4933d0f-35a0-4aa1-8de5-ba407714b65c plus');
  process.exit(1);
}

if (!['free', 'plus', 'premium'].includes(plan)) {
  console.error('❌ Error: Invalid plan. Must be one of: free, plus, premium');
  process.exit(1);
}

async function upgradeUserMembership() {
  // First, try to update existing subscription
  const updateMutation = `
    mutation UpdateUserMembership($userId: String!, $plan: String!) {
      update_user_subscriptions(
        where: { user_id: { _eq: $userId } }
        _set: { plan: $plan, is_active: true }
      ) {
        affected_rows
        returning {
          user_id
          plan
          is_active
          created_at
          updated_at
        }
      }
    }
  `;

  // If no existing subscription, insert new one
  const insertMutation = `
    mutation InsertUserMembership($userId: String!, $plan: String!) {
      insert_user_subscriptions_one(
        object: {
          user_id: $userId
          plan: $plan
          is_active: true
        }
      ) {
        user_id
        plan
        is_active
        created_at
        updated_at
      }
    }
  `;

  try {
    console.log(`🔄 Upgrading user ${userId} to ${plan} membership...`);

    // First try to update
    let response = await fetch(HASURA_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET
      },
      body: JSON.stringify({
        query: updateMutation,
        variables: { userId, plan }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let result = await response.json();

    if (result.errors) {
      console.error('❌ GraphQL errors:', result.errors);
      throw new Error(result.errors[0].message);
    }

    let subscription = null;

    // If update affected rows, use that result
    if (result.data.update_user_subscriptions.affected_rows > 0) {
      subscription = result.data.update_user_subscriptions.returning[0];
      console.log('✅ Updated existing subscription');
    } else {
      // No existing subscription, insert new one
      console.log('   No existing subscription found, creating new one...');
      response = await fetch(HASURA_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': HASURA_ADMIN_SECRET
        },
        body: JSON.stringify({
          query: insertMutation,
          variables: { userId, plan }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      result = await response.json();

      if (result.errors) {
        console.error('❌ GraphQL errors:', result.errors);
        throw new Error(result.errors[0].message);
      }

      subscription = result.data.insert_user_subscriptions_one;
      console.log('✅ Created new subscription');
    }

    if (subscription) {
      console.log('✅ Successfully upgraded user membership!');
      console.log('   User ID:', subscription.user_id);
      console.log('   Plan:', subscription.plan);
      console.log('   Active:', subscription.is_active);
      console.log('   Created:', subscription.created_at);
      console.log('   Updated:', subscription.updated_at);
    } else {
      console.error('❌ Failed to upgrade membership');
    }

  } catch (error) {
    console.error('❌ Error upgrading user membership:', error.message);
    process.exit(1);
  }
}

upgradeUserMembership();
