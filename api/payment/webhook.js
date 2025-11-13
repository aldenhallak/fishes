/**
 * Stripe Webhook处理器
 * POST /api/payment/webhook
 * 
 * 功能：
 * 1. 验证Stripe webhook签名
 * 2. 处理 checkout.session.completed 事件
 * 3. 更新 user_subscriptions 表
 * 4. 记录 stripe_customer_id 和 stripe_subscription_id
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

// 验证环境变量
if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not set');
}

if (!STRIPE_WEBHOOK_SECRET) {
  console.error('❌ STRIPE_WEBHOOK_SECRET not set');
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

async function updateUserSubscription(userId, planId, stripeCustomerId, stripeSubscriptionId, currentPeriodStart, currentPeriodEnd) {
  const mutation = `
    mutation UpdateUserSubscription(
      $userId: String!
      $planId: String!
      $stripeCustomerId: String
      $stripeSubscriptionId: String
      $currentPeriodStart: timestamp
      $currentPeriodEnd: timestamp
    ) {
      insert_user_subscriptions_one(
        object: {
          user_id: $userId
          plan: $planId
          is_active: true
          stripe_customer_id: $stripeCustomerId
          stripe_subscription_id: $stripeSubscriptionId
          current_period_start: $currentPeriodStart
          current_period_end: $currentPeriodEnd
        }
        on_conflict: {
          constraint: user_subscriptions_pkey
          update_columns: [plan, is_active, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, updated_at]
        }
      ) {
        user_id
        plan
        is_active
        stripe_customer_id
        stripe_subscription_id
      }
    }
  `;

  return await queryHasura(mutation, {
    userId,
    planId,
    stripeCustomerId,
    stripeSubscriptionId,
    currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : null,
    currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Stripe webhook not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // 验证webhook签名
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // 处理事件
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // 获取完整的session对象（包含subscription信息）
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['subscription']
        });

        const userId = session.client_reference_id || session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (!userId || !planId) {
          console.error('❌ Missing userId or planId in session metadata');
          return res.status(400).json({ error: 'Missing required metadata' });
        }

        const subscription = fullSession.subscription;
        let stripeCustomerId = session.customer;
        let stripeSubscriptionId = subscription?.id || null;
        let currentPeriodStart = null;
        let currentPeriodEnd = null;

        // 如果是订阅，获取订阅详情
        if (subscription && typeof subscription === 'object') {
          stripeSubscriptionId = subscription.id;
          currentPeriodStart = subscription.current_period_start;
          currentPeriodEnd = subscription.current_period_end;
        } else if (typeof subscription === 'string') {
          // 如果subscription是字符串ID，需要获取详情
          const sub = await stripe.subscriptions.retrieve(subscription);
          stripeCustomerId = sub.customer;
          stripeSubscriptionId = sub.id;
          currentPeriodStart = sub.current_period_start;
          currentPeriodEnd = sub.current_period_end;
        }

        // 更新用户订阅
        await updateUserSubscription(
          userId,
          planId,
          stripeCustomerId,
          stripeSubscriptionId,
          currentPeriodStart,
          currentPeriodEnd
        );

        console.log(`✅ Subscription activated for user ${userId}, plan: ${planId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // 查找用户订阅记录
        const query = `
          query FindSubscriptionByStripeId($stripeSubscriptionId: String!) {
            user_subscriptions(where: { stripe_subscription_id: { _eq: $stripeSubscriptionId } }) {
              user_id
              plan
            }
          }
        `;

        const data = await queryHasura(query, { stripeSubscriptionId: subscription.id });
        
        if (data.user_subscriptions && data.user_subscriptions.length > 0) {
          const userSub = data.user_subscriptions[0];
          
          // 更新订阅信息
          const updateMutation = `
            mutation UpdateSubscription(
              $userId: String!
              $currentPeriodStart: timestamp
              $currentPeriodEnd: timestamp
              $isActive: Boolean
            ) {
              update_user_subscriptions(
                where: { user_id: { _eq: $userId } }
                _set: {
                  current_period_start: $currentPeriodStart
                  current_period_end: $currentPeriodEnd
                  is_active: $isActive
                  updated_at: "now()"
                }
              ) {
                affected_rows
              }
            }
          `;

          await queryHasura(updateMutation, {
            userId: userSub.user_id,
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            isActive: subscription.status === 'active'
          });

          console.log(`✅ Subscription updated for user ${userSub.user_id}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // 查找并停用订阅
        const query = `
          query FindSubscriptionByStripeId($stripeSubscriptionId: String!) {
            user_subscriptions(where: { stripe_subscription_id: { _eq: $stripeSubscriptionId } }) {
              user_id
            }
          }
        `;

        const data = await queryHasura(query, { stripeSubscriptionId: subscription.id });
        
        if (data.user_subscriptions && data.user_subscriptions.length > 0) {
          const userSub = data.user_subscriptions[0];
          
          // 将用户降级为free
          const updateMutation = `
            mutation CancelSubscription($userId: String!) {
              update_user_subscriptions(
                where: { user_id: { _eq: $userId } }
                _set: {
                  plan: "free"
                  is_active: false
                  updated_at: "now()"
                }
              ) {
                affected_rows
              }
            }
          `;

          await queryHasura(updateMutation, { userId: userSub.user_id });
          console.log(`✅ Subscription canceled for user ${userSub.user_id}`);
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
};

