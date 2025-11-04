/**
 * 鱼缸后端配置API
 * 告诉前端应该使用哪个后端
 */

const fishtankConfig = require('./fishtank');

module.exports = async (req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        res.status(200).json({
            backend: fishtankConfig.backend,
            // 不暴露敏感信息，只返回需要的配置
            originalBackendUrl: fishtankConfig.backend === 'original' ? fishtankConfig.originalBackendUrl : null,
            useHasura: fishtankConfig.backend === 'hasura'
        });
    } catch (error) {
        console.error('Error getting fishtank config:', error);
        res.status(500).json({ error: 'Failed to get configuration' });
    }
};

