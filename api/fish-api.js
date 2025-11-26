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

const path = require('path');

// 动态加载 handler，避免启动时出错
let listHandler, submitHandler, myTankHandler, favoriteHandler, unfavoriteHandler, uploadHandler;
let updateInfoHandler, updateChatSettingsHandler, getBattleFishHandler, communityChatHandler;
let groupChatHandler, monologueHandler, chatUsageHandler, moderationCheckHandler, createHandler;
let userChatMessageHandler;

function loadHandler(relativePath) {
  try {
    const handlerPath = path.resolve(__dirname, relativePath);
    console.log(`[Fish API] Loading handler from: ${handlerPath}`);
    const handler = require(handlerPath);
    console.log(`[Fish API] ✅ Handler loaded successfully: ${relativePath}`);
    return handler;
  } catch (error) {
    console.error(`[Fish API] ❌ Failed to load handler: ${relativePath}`);
    console.error(`[Fish API] Error name: ${error.name}`);
    console.error(`[Fish API] Error message: ${error.message}`);
    console.error(`[Fish API] Error stack: ${error.stack}`);
    console.error(`[Fish API] Error code: ${error.code}`);
    return null;
  }
}

module.exports = async function handler(req, res) {
  const { action } = req.query;
  
  // 调试日志：记录所有请求
  if (action === 'user-chat-message') {
    console.log('************用户发送聊天请求************');
    console.log('[Fish API] 收到用户聊天消息请求');
    console.log('[Fish API] Request method:', req.method);
    console.log('[Fish API] Request body:', JSON.stringify(req.body, null, 2));
    console.log('[Fish API] Has Authorization header:', !!req.headers.authorization);
    console.log('[Fish API] Query params:', req.query);
  }
  
  // 动态加载 handlers（延迟加载，避免启动错误）
  if (!listHandler) {
    listHandler = loadHandler('../lib/api_handlers/fish/list.js');
    submitHandler = loadHandler('../lib/api_handlers/fish/submit.js');
    myTankHandler = loadHandler('../lib/api_handlers/fish/my-tank.js');
    favoriteHandler = loadHandler('../lib/api_handlers/fish/favorite.js');
    unfavoriteHandler = loadHandler('../lib/api_handlers/fish/unfavorite.js');
    uploadHandler = loadHandler('../lib/api_handlers/fish/upload.js');
    updateInfoHandler = loadHandler('../lib/api_handlers/fish/update-info.js');
    updateChatSettingsHandler = loadHandler('../lib/api_handlers/fish/update-chat-settings.js');
    getBattleFishHandler = loadHandler('../lib/api_handlers/fish/get-battle-fish.js');
    communityChatHandler = loadHandler('../lib/api_handlers/fish/community-chat.js');
    groupChatHandler = loadHandler('../lib/api_handlers/fish/chat/group.js');
    monologueHandler = loadHandler('../lib/api_handlers/fish/chat/monologue.js');
    chatUsageHandler = loadHandler('../lib/api_handlers/fish/chat/usage.js');
    moderationCheckHandler = loadHandler('../lib/api_handlers/fish/moderation/check.js');
    createHandler = loadHandler('../lib/api_handlers/fish/create.js');
    userChatMessageHandler = loadHandler('../lib/api_handlers/fish/chat/user-message.js');
  }
  
  // 路由分发
  try {
    switch (action) {
      case 'list':
        if (!listHandler) return res.status(500).json({ error: 'List handler not available' });
        return await listHandler(req, res);
      case 'submit':
        if (!submitHandler) return res.status(500).json({ error: 'Submit handler not available' });
        return await submitHandler(req, res);
      case 'create':
        if (!createHandler) return res.status(404).json({ error: 'Create handler not available' });
        return await createHandler(req, res);
      case 'my-tank':
        if (!myTankHandler) return res.status(500).json({ error: 'My tank handler not available' });
        return await myTankHandler(req, res);
      case 'favorite':
        if (!favoriteHandler) return res.status(500).json({ error: 'Favorite handler not available' });
        return await favoriteHandler(req, res);
      case 'unfavorite':
        if (!unfavoriteHandler) return res.status(500).json({ error: 'Unfavorite handler not available' });
        return await unfavoriteHandler(req, res);
      case 'upload':
        if (!uploadHandler) {
          console.error('[Fish API] Upload handler is null/undefined');
          return res.status(500).json({ 
            error: 'Upload handler not available',
            details: 'Handler failed to load during initialization. Check server logs for details.'
          });
        }
        return await uploadHandler(req, res);
      case 'update-info':
        if (!updateInfoHandler) return res.status(500).json({ error: 'Update info handler not available' });
        return await updateInfoHandler(req, res);
      case 'update-chat-settings':
        if (!updateChatSettingsHandler) return res.status(500).json({ error: 'Update chat settings handler not available' });
        return await updateChatSettingsHandler(req, res);
      case 'get-battle-fish':
        if (!getBattleFishHandler) return res.status(500).json({ error: 'Get battle fish handler not available' });
        return await getBattleFishHandler(req, res);
      case 'community-chat':
        if (!communityChatHandler) return res.status(500).json({ error: 'Community chat handler not available' });
        return await communityChatHandler(req, res);
      case 'group-chat':
        if (!groupChatHandler) return res.status(500).json({ error: 'Group chat handler not available' });
        return await groupChatHandler(req, res);
      case 'monologue':
        if (!monologueHandler) return res.status(500).json({ error: 'Monologue handler not available' });
        return await monologueHandler(req, res);
      case 'chat-usage':
        if (!chatUsageHandler) return res.status(500).json({ error: 'Chat usage handler not available' });
        return await chatUsageHandler(req, res);
      case 'moderation-check':
        if (!moderationCheckHandler) return res.status(500).json({ error: 'Moderation check handler not available' });
        return await moderationCheckHandler(req, res);
      case 'user-chat-message':
        console.log('[Fish API] 路由到 user-chat-message handler');
        if (!userChatMessageHandler) {
          console.error('[Fish API] ❌ userChatMessageHandler not loaded!');
          return res.status(500).json({ error: 'User chat message handler not available' });
        }
        console.log('[Fish API] ✅ userChatMessageHandler loaded, calling...');
        return await userChatMessageHandler(req, res);
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
    console.error('[Fish API] Stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

