/**
 * 全局后端配置API
 * 告诉前端应该使用哪个后端（鱼数据 + 鱼缸功能）
 */

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
        const backendType = process.env.BACKEND_TYPE || process.env.FISHTANK_BACKEND || 'hasura';
        const originalBackendUrl = process.env.ORIGINAL_BACKEND_URL || 'https://fishes-be-571679687712.northamerica-northeast1.run.app';

        res.status(200).json({
            backend: backendType,
            useHasura: backendType === 'hasura',
            useOriginal: backendType === 'original',
            originalBackendUrl: backendType === 'original' ? originalBackendUrl : null,
            hasuraEndpoint: backendType === 'hasura' ? '/api/graphql' : null
        });
    } catch (error) {
        console.error('Error getting backend config:', error);
        res.status(500).json({ error: 'Failed to get configuration' });
    }
};

