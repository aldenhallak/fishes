/**
 * Fish API Router - 合并所有鱼相关端点
 * 通过 action 参数路由到相应的处理逻辑
 * 
 * 支持的 actions:
 * - list: 获取鱼列表
 * - submit: 提交新鱼  
 * - create: 创建鱼
 * - my-tank: 获取我的鱼缸
 * - favorite: 收藏鱼
 * - unfavorite: 取消收藏
 * - upload: 上传图片
 * - update-info: 更新鱼信息
 * - update-chat-settings: 更新聊天设置
 * - get-battle-fish: 获取战斗鱼
 * - community-chat: 社区聊天
 * - group-chat: 群聊
 * - monologue: 独白
 * - chat-usage: 聊天使用情况
 * - moderation-check: 审核检查
 */

// 导入原有的处理函数
const listHandler = require('../lib/api_handlers/fish/list');
const submitHandler = require('../lib/api_handlers/fish/submit');
const myTankHandler = require('../lib/api_handlers/fish/my-tank');
const favoriteHandler = require('../lib/api_handlers/fish/favorite');
const unfavoriteHandler = require('../lib/api_handlers/fish/unfavorite');
const uploadHandler = require('../lib/api_handlers/fish/upload');
const updateInfoHandler = require('../lib/api_handlers/fish/update-info');
const updateChatSettingsHandler = require('../lib/api_handlers/fish/update-chat-settings');
const getBattleFishHandler = require('../lib/api_handlers/fish/get-battle-fish');
const communityChatHandler = require('../lib/api_handlers/fish/community-chat');
const groupChatHandler = require('../lib/api_handlers/fish/chat/group');
const monologueHandler = require('../lib/api_handlers/fish/chat/monologue');
const chatUsageHandler = require('../lib/api_handlers/fish/chat/usage');
const moderationCheckHandler = require('../lib/api_handlers/fish/moderation/check');

// 如果 create.js 存在
let createHandler;
try {
  createHandler = require('../lib/api_handlers/fish/create');
} catch (e) {
  createHandler = null;
}

module.exports = async function handler(req, res) {
  const { action } = req.query;
  
  // 路由分发
  try {
    switch (action) {
      case 'list':
        return await listHandler(req, res);
      case 'submit':
        return await submitHandler(req, res);
      case 'create':
        return createHandler ? await createHandler(req, res) : res.status(404).json({ error: 'Not found' });
      case 'my-tank':
        return await myTankHandler(req, res);
      case 'favorite':
        return await favoriteHandler(req, res);
      case 'unfavorite':
        return await unfavoriteHandler(req, res);
      case 'upload':
        return await uploadHandler(req, res);
      case 'update-info':
        return await updateInfoHandler(req, res);
      case 'update-chat-settings':
        return await updateChatSettingsHandler(req, res);
      case 'get-battle-fish':
        return await getBattleFishHandler(req, res);
      case 'community-chat':
        return await communityChatHandler(req, res);
      case 'group-chat':
        return await groupChatHandler(req, res);
      case 'monologue':
        return await monologueHandler(req, res);
      case 'chat-usage':
        return await chatUsageHandler(req, res);
      case 'moderation-check':
        return await moderationCheckHandler(req, res);
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          available: ['list', 'submit', 'create', 'my-tank', 'favorite', 'unfavorite', 'upload', 
                      'update-info', 'update-chat-settings', 'get-battle-fish', 'community-chat',
                      'group-chat', 'monologue', 'chat-usage', 'moderation-check']
        });
    }
  } catch (error) {
    console.error('[Fish API] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

