/**
 * 订阅管理API
 * POST /api/payment/manage-subscription
 * Body: { userId, action }
 * 
 * 功能：
 * 1. 取消订阅
 * 2. 恢复订阅
 * 3. 查询订阅状态
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

// 验证环境变量
if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not set');
}

if (!HASURA_GRAPHQL_ENDPOINT || !HASURA_ADMIN_SECRET) {
  console.error('❌ Hasura configuration missing');
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

async function queryHasura(query, variables = {}) {
  if (!HASURA_GRAPHQL_ENDPOINT || !HASURA_ADMIN_SECRET) {
    throw new Error('Hasura configuration missing');
  }

  const response = await fetch(HASURA_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    throw new Error(`Hasura query failed: ${response.status}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, action } = req.body;

    // 验证输入
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!action || !['cancel', 'resume', 'status'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be: cancel, resume, or status' });
    }

    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    // 查询用户订阅信息
    const query = `
      query GetUserSubscription($userId: String!) {
        user_subscriptions(where: { user_id: { _eq: $userId } }) {
          user_id
          plan
          is_active
          stripe_customer_id
          stripe_subscription_id
          current_period_start
          current_period_end
        }
      }
    `;

    const data = await queryHasura(query, { userId });
    const subscription = data.user_subscriptions && data.user_subscriptions.length > 0 
      ? data.user_subscriptions[0] 
      : null;

    if (!subscription || !subscription.stripe_subscription_id) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // 处理不同的操作
    switch (action) {
      case 'status': {
        // 查询订阅状态
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
        
        return res.status(200).json({
          success: true,
          subscription: {
            plan: subscription.plan,
            status: stripeSubscription.status,
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
          }
        });
      }

      case 'cancel': {
        // 取消订阅（在周期结束时）
        const stripeSubscription = await stripe.subscriptions.update(
          subscription.stripe_subscription_id,
          {
            cancel_at_period_end: true
          }
        );

        // 更新数据库
        const updateMutation = `
          mutation UpdateSubscriptionCancel($userId: String!) {
            update_user_subscriptions(
              where: { user_id: { _eq: $userId } }
              _set: {
                cancel_at_period_end: true
                updated_at: "now()"
              }
            ) {
              affected_rows
            }
          }
        `;

        await queryHasura(updateMutation, { userId });

        return res.status(200).json({
          success: true,
          message: 'Subscription will be canceled at the end of the current period',
          cancelAtPeriodEnd: true,
          currentPeriodEnd: subscription.current_period_end
        });
      }

      case 'resume': {
        // 恢复订阅
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
        
        if (!stripeSubscription.cancel_at_period_end) {
          return res.status(400).json({ error: 'Subscription is not scheduled for cancellation' });
        }

        // 取消取消操作
        await stripe.subscriptions.update(
          subscription.stripe_subscription_id,
          {
            cancel_at_period_end: false
          }
        );

        // 更新数据库
        const updateMutation = `
          mutation UpdateSubscriptionResume($userId: String!) {
            update_user_subscriptions(
              where: { user_id: { _eq: $userId } }
              _set: {
                cancel_at_period_end: false
                updated_at: "now()"
              }
            ) {
              affected_rows
            }
          }
        `;

        await queryHasura(updateMutation, { userId });

        return res.status(200).json({
          success: true,
          message: 'Subscription has been resumed'
        });
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('❌ Manage subscription error:', error);
    return res.status(500).json({
      error: 'Failed to manage subscription',
      message: error.message
    });
  }
};

