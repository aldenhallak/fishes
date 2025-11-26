/**
 * 聊天费用节省配置 API
 * GET /api/config/chat-cost-saving
 * 
 * 返回费用节省功能配置
 * �?CHAT_COST_SAVING = ON 时，启用费用节省功能（页面不可见/用户不活�?超过最大运行时间时自动暂停�? * �?CHAT_COST_SAVING = OFF 时，禁用费用节省功能（始终运行，不受限制�? */

// 在本地开发环境加�?.env.local，在生产环境（Vercel）直接从 process.env 读取
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (error) {
    // .env.local 文件不存在时忽略错误
  }
}
const { getGlobalParamInt } = require('../../global-params');

module.exports = async function handler(req, res) {
  // 只允�?GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    // 从环境变量读取费用节省模式（默认 ON，启用费用节省）
    const costSavingMode = process.env.CHAT_COST_SAVING || 'ON';
    const isEnabled = costSavingMode.toUpperCase() === 'ON';

    // 从全局参数表读取时间配置（单位：分钟）
    // CHAT_COST_SAVING_INACTIVE_TIME: 用户无活动时间阈值（默认15分钟�?    // CHAT_COST_SAVING_MAX_TALKING_TIME: 最大连续运行时间（默认60分钟�?    const maxInactiveTimeMinutes = await getGlobalParamInt('CHAT_COST_SAVING_INACTIVE_TIME', 15);
    const maxRunTimeMinutes = await getGlobalParamInt('CHAT_COST_SAVING_MAX_TALKING_TIME', 60);

    // 隐藏日志

    return res.status(200).json({
      costSavingMode: costSavingMode,
      enabled: isEnabled,
      maxInactiveTimeMinutes: maxInactiveTimeMinutes,
      maxRunTimeMinutes: maxRunTimeMinutes
    });
  } catch (error) {
    console.error('获取费用节省配置失败:', error);
    return res.status(500).json({
      error: '服务器错�?,
      details: error.message
    });
  }
};


