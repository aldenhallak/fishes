/**
 * GraphQL API代理
 * 将前端GraphQL请求转发到Hasura
 */

const fetch = require('node-fetch');

const HASURA_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

module.exports = async (req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    if (!HASURA_ENDPOINT) {
        console.error('❌ HASURA_GRAPHQL_ENDPOINT not configured');
        res.status(500).json({ error: 'Hasura endpoint not configured' });
        return;
    }

    try {
        const { query, variables } = req.body;

        if (!query) {
            res.status(400).json({ error: 'GraphQL query is required' });
            return;
        }

        // 从请求头获取认证token
        const authHeader = req.headers.authorization;
        
        // 准备Hasura请求头
        const hasuraHeaders = {
            'Content-Type': 'application/json'
        };

        // 优先使用用户token，否则使用admin secret
        if (authHeader) {
            hasuraHeaders['Authorization'] = authHeader;
        } else if (HASURA_ADMIN_SECRET) {
            hasuraHeaders['x-hasura-admin-secret'] = HASURA_ADMIN_SECRET;
        }

        // 转发请求到Hasura
        const hasuraResponse = await fetch(HASURA_ENDPOINT, {
            method: 'POST',
            headers: hasuraHeaders,
            body: JSON.stringify({
                query,
                variables
            })
        });

        if (!hasuraResponse.ok) {
            throw new Error(`Hasura request failed: ${hasuraResponse.status}`);
        }

        const result = await hasuraResponse.json();
        
        // 返回Hasura响应
        res.status(200).json(result);

    } catch (error) {
        console.error('❌ GraphQL proxy error:', error);
        res.status(500).json({ 
            error: 'Failed to execute GraphQL query',
            message: error.message 
        });
    }
};

