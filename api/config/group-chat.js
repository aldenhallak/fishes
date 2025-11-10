/**
 * 群聊配置 API
 * GET /api/config/group-chat
 * 
 * 返回群聊功能配置（仅限开发环境）
 * 当 GROUP_CHAT = ON 时，默认开启群聊；= OFF 时默认关闭
 */

require('dotenv').config({ path: '.env.local' });

module.exports = async function handler(req, res) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    // 从环境变量读取群聊模式（默认 OFF）
    const groupChatMode = process.env.GROUP_CHAT || 'OFF';
    const isEnabled = groupChatMode.toUpperCase() === 'ON';

    console.log('💬 Group chat config requested');
    console.log(`   Mode: ${groupChatMode} (enabled: ${isEnabled})`);

    return res.status(200).json({
      groupChatMode: groupChatMode,
      enabled: isEnabled
    });
  } catch (error) {
    console.error('获取群聊配置失败:', error);
    return res.status(500).json({
      error: '服务器错误',
      details: error.message
    });
  }
};

