/**
 * Payment API Router - 合并所有支付相关端点
 * 
 * 支持的 actions:
 * - create-checkout: 创建结账会话
 * - webhook: Stripe webhook
 * - manage-subscription: 管理订阅
 */

const createCheckoutHandler = require('./payment/create-checkout');
const webhookHandler = require('./payment/webhook');
const manageSubscriptionHandler = require('./payment/manage-subscription');

module.exports = async function handler(req, res) {
  const { action } = req.query;
  
  try {
    switch (action) {
      case 'create-checkout':
        return await createCheckoutHandler(req, res);
      case 'webhook':
        return await webhookHandler(req, res);
      case 'manage-subscription':
        return await manageSubscriptionHandler(req, res);
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          available: ['create-checkout', 'webhook', 'manage-subscription']
        });
    }
  } catch (error) {
    console.error('[Payment API] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

