require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');
const { canAdjustChatFrequency } = require('../middleware/membership');

const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

async function queryHasura(query, variables = {}) {
    if (!HASURA_GRAPHQL_ENDPOINT || !HASURA_ADMIN_SECRET) {
        throw new Error('Hasura configuration missing, please check .env.local file');
    }
    const response = await fetch(HASURA_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': HASURA_ADMIN_SECRET
        },
        body: JSON.stringify({ query, variables })
    });
    const result = await response.json();
    if (result.errors) {
        throw new Error(result.errors[0].message);
    }
    return result.data;
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, fishId, chatFrequency } = req.body;

        if (!userId || !fishId || chatFrequency === undefined) {
            return res.status(400).json({ success: false, error: 'Missing required fields: userId, fishId, or chatFrequency' });
        }

        // 1. 检查用户是否有权限调节说话频率
        const hasPermission = await canAdjustChatFrequency(userId);
        if (!hasPermission) {
            return res.status(403).json({ success: false, error: 'Permission denied', message: '只有Premium会员才能调节鱼的说话频率。' });
        }

        // 2. 验证 chatFrequency 范围
        if (chatFrequency < 1 || chatFrequency > 10) {
            return res.status(400).json({ success: false, error: 'Invalid chat frequency', message: '说话频率必须在1到10之间。' });
        }

        // 3. 更新鱼的 chat_frequency 字段
        const updateFishQuery = `
            mutation UpdateFishChatFrequency($fishId: uuid!, $chatFrequency: Int!) {
                update_fish_by_pk(pk_columns: {id: $fishId}, _set: {chat_frequency: $chatFrequency}) {
                    id
                    chat_frequency
                }
            }
        `;

        const result = await queryHasura(updateFishQuery, { fishId, chatFrequency });

        if (!result.update_fish_by_pk) {
            return res.status(404).json({ success: false, error: 'Fish not found', message: '未找到指定的鱼。' });
        }

        return res.json({
            success: true,
            message: '鱼的说话频率已更新！',
            fish: result.update_fish_by_pk
        });

    } catch (error) {
        console.error('更新鱼说话频率失败:', error);
        return res.status(500).json({
            success: false,
            error: '服务器错误',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

