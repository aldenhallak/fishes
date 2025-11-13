/**
 * COZE 配置 API
 * 返回环境变量中的 COZE API Key 和 Bot ID
 */

module.exports = async (req, res) => {
  try {
    // 从环境变量读取配置
    const apiKey = process.env.COZE_API_KEY || '';
    const botId = process.env.COZE_BOT_ID || '';
    const baseUrl = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';
    
    // 返回配置（API Key脱敏处理）
    return res.status(200).json({
      success: true,
      data: {
        apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : '', // 脱敏显示
        apiKeyFull: apiKey, // 完整的Key
        botId: botId,
        baseUrl: baseUrl,
        hasApiKey: !!apiKey,
        hasBotId: !!botId
      }
    });
  } catch (error) {
    console.error('获取COZE配置失败:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

