/**
 * 群聊配置 API
 * GET /api/config/group-chat
 * 
 * 返回群聊功能配置（仅限开发环境）
 * 当 GROUP_CHAT = ON 时，默认开启群聊；= OFF 时默认关闭
 */

// 在本地开发环境加载 .env.local，在生产环境（Vercel）直接从 process.env 读取
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (error) {
    // .env.local 文件不存在时忽略错误
  }
}
const { getGlobalParamInt } = require('../../global-params');

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

    // 从全局参数表读取群聊时间间隔（单位：秒，转换为分钟）
    // group_chat_interval_s: 群聊间隔（秒），默认 30 秒 = 0.5 分钟，但通常设置为 300 秒 = 5 分钟
    const intervalTimeSeconds = await getGlobalParamInt('group_chat_interval_s', 300);
    const intervalTimeMinutes = Math.round(intervalTimeSeconds / 60); // 转换为分钟（四舍五入）

    // 隐藏日志

    return res.status(200).json({
      groupChatMode: groupChatMode,
      enabled: isEnabled,
      intervalTimeMinutes: intervalTimeMinutes
    });
  } catch (error) {
    console.error('获取群聊配置失败:', error);
    return res.status(500).json({
      error: '服务器错误',
      details: error.message
    });
  }
};

