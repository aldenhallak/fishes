/**
 * COZE Messages API - 查看会话消息详情
 * 后端代理COZE API的消息列表接口
 * 用于轮询AI回复
 */

require('dotenv').config({ path: '.env.local' });

async function callCozeAPI(url, method, body, apiKey) {
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`COZE API Error: ${response.status} ${await response.text()}`);
  }

  return await response.json();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { conversation_id, chat_id, limit = 20, order = 'desc' } = req.body;
    
    console.log('📥 [COZE Messages API] 接收到的请求:', { conversation_id, chat_id, limit, order });

    if (!conversation_id || !chat_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: conversation_id and chat_id',
      });
    }

    const apiKey = process.env.COZE_API_KEY;
    const baseUrl = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'COZE API Key not configured',
      });
    }

    // 构造COZE API请求
    const url = `${baseUrl}/v3/chat/message/list?conversation_id=${conversation_id}&chat_id=${chat_id}`;
    const requestBody = { limit, order };
    
    console.log('🚀 [COZE Messages API] 调用COZE API:', { url, body: requestBody });

    const cozeResponse = await callCozeAPI(url, 'POST', requestBody, apiKey);
    
    console.log('📨 [COZE Messages API] COZE API响应:', JSON.stringify(cozeResponse, null, 2));

    // COZE API返回格式检查
    if (cozeResponse.code !== 0) {
      console.error('❌ [COZE Messages API] COZE API返回错误:', cozeResponse);
      return res.status(200).json({
        success: false,
        error: 'COZE API returned error',
        code: cozeResponse.code,
        message: cozeResponse.msg || 'Unknown error',
        data: cozeResponse,
      });
    }

    // 提取消息列表 - 处理多种可能的响应格式
    const rawMessages = cozeResponse.data?.messages || cozeResponse.data || cozeResponse.messages || [];
    
    console.log('🔍 [COZE Messages API] 原始消息数量:', Array.isArray(rawMessages) ? rawMessages.length : 'not an array');
    
    if (!Array.isArray(rawMessages)) {
      console.warn('⚠️ [COZE Messages API] 消息列表不是数组:', rawMessages);
      return res.status(200).json({
        success: true,
        data: {
          messages: [],
          has_more: false,
          source: 'coze_api',
          raw_response: cozeResponse,
        },
      });
    }

    // 过滤消息 - 只保留用户真正需要的消息
    const filteredMessages = rawMessages.filter((msg) => {
      // 保留用户消息
      if (msg.role === 'user') return true;

      // AI消息必须满足条件
      if (msg.role === 'assistant') {
        // 必须有内容
        if (!msg.content || !msg.content.trim()) return false;

        // 过滤系统verbose消息
        if (msg.type === 'verbose') return false;

        // 过滤工具调用消息
        if (msg.type && (
          msg.type.includes('_finish') ||
          msg.type.includes('_start') ||
          msg.type === 'function_call' ||
          msg.type === 'tool_call' ||
          msg.type === 'tool_output' ||
          msg.type === 'follow_up'
        )) return false;

        // 优先保留answer类型
        if (msg.type === 'answer') return true;

        // 保留text类型或无type
        if (msg.type === 'text' || !msg.type) return true;

        return true;
      }

      return false;
    });

    console.log('✅ [COZE Messages API] 过滤后消息数量:', filteredMessages.length);
    console.log('📋 [COZE Messages API] 过滤后消息:', filteredMessages.map(m => ({
      role: m.role,
      type: m.type,
      content: m.content?.substring(0, 50) + '...'
    })));

    return res.status(200).json({
      success: true,
      data: {
        messages: filteredMessages,
        has_more: cozeResponse.has_more || false,
        source: 'coze_api',
        coze_original_response: cozeResponse, // 包含原始响应便于调试
      },
    });

  } catch (error) {
    console.error('❌ [COZE Messages API] 错误:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to get messages',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

