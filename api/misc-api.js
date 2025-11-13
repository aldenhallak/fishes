/**
 * Misc API Router - 合并杂项端点
 * 
 * 支持的 actions:
 * - profile: 用户资料
 * - report: 举报
 * - vote: 投票
 */

const profileHandler = require('../lib/api_handlers/profile/[userId]');
const reportHandler = require('../lib/api_handlers/report/submit');
const voteHandler = require('../lib/api_handlers/vote/vote');

module.exports = async function handler(req, res) {
  const { action } = req.query;
  
  try {
    switch (action) {
      case 'profile':
        return await profileHandler(req, res);
      case 'report':
        return await reportHandler(req, res);
      case 'vote':
        return await voteHandler(req, res);
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          available: ['profile', 'report', 'vote']
        });
    }
  } catch (error) {
    console.error('[Misc API] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

