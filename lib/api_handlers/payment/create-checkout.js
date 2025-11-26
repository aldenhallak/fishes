/**
 * 创建Stripe Checkout Session
 * POST /api/payment/create-checkout
 * Body: { userId, planId, billingPeriod }
 * 
 * 功能：
 * 1. 验证用户身份
 * 2. 获取会员套餐价格信息
 * 3. 创建Stripe Checkout Session
 * 4. 返回Checkout URL
 */

require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');
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
    const { userId, planId, billingPeriod = 'monthly' } = req.body;

    // 验证输入
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!planId) {
      return res.status(400).json({ error: 'planId is required' });
    }

    if (!['free', 'plus', 'premium'].includes(planId)) {
      return res.status(400).json({ error: 'Invalid planId' });
    }

    if (planId === 'free') {
      return res.status(400).json({ error: 'Free plan does not require payment' });
    }

    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured. Please set STRIPE_SECRET_KEY in environment variables.' });
    }

    // 查询会员类型和价格信息
    const query = `
      query GetMemberType($planId: String!) {
        member_types_by_pk(id: $planId) {
          id
          name
          fee_per_month
          fee_per_year
        }
      }
    `;

    const data = await queryHasura(query, { planId });
    const memberType = data.member_types_by_pk;

    if (!memberType) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // 从 fee_per_month 获取月度价格
    const monthlyPrice = parseFloat(memberType.fee_per_month) || 0;
    // 从 fee_per_year 获取年度价格
    const yearlyPrice = parseFloat(memberType.fee_per_year) || 0;

    // Stripe 价格 ID 不存在于数据库中，需要动态创建
    const priceId = null;

    // 如果没有配置Stripe价格ID，使用价格创建
    if (!priceId) {
      console.warn(`⚠️ Stripe price ID not configured for ${planId} ${billingPeriod}, creating price on the fly`);
      
      // 创建产品（如果不存在）
      const productName = `FishTalk ${memberType.name} - ${billingPeriod === 'yearly' ? 'Annual' : 'Monthly'}`;
      
      // 创建价格
      const price = await stripe.prices.create({
        unit_amount: Math.round((billingPeriod === 'yearly' ? yearlyPrice : monthlyPrice) * 100),
        currency: 'usd',
        recurring: {
          interval: billingPeriod === 'yearly' ? 'year' : 'month'
        },
        product_data: {
          name: productName,
          description: `${memberType.name} membership plan`
        }
      });

      // 使用新创建的价格ID
      const finalPriceId = price.id;
      
      // 创建Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: finalPriceId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: `${req.headers.origin || 'https://fishtalk.app'}/membership.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || 'https://fishtalk.app'}/membership.html?canceled=true`,
        client_reference_id: userId,
        metadata: {
          userId,
          planId,
          billingPeriod
        }
      });

      return res.status(200).json({
        success: true,
        url: session.url,
        sessionId: session.id
      });
    }

    // 使用配置的价格ID创建Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin || 'https://fishtalk.app'}/membership.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://fishtalk.app'}/membership.html?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId,
        planId,
        billingPeriod
      }
    });

    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('❌ Create checkout error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
};

