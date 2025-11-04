/**
 * 鱼缸功能配置
 * 根据环境变量决定使用哪个后端
 * 
 * 支持的环境变量（按优先级）：
 * 1. BACKEND_TYPE - 全局后端类型
 * 2. FISHTANK_BACKEND - 鱼缸专用后端类型（向后兼容）
 */

module.exports = {
    // 后端类型: 'hasura' 或 'original'
    // 优先使用BACKEND_TYPE，如果未设置则使用FISHTANK_BACKEND
    backend: process.env.BACKEND_TYPE || process.env.FISHTANK_BACKEND || 'hasura',
    
    // 原作者后端URL
    originalBackendUrl: process.env.ORIGINAL_BACKEND_URL || 'https://fishes-be-571679687712.northamerica-northeast1.run.app',
    
    // Hasura配置
    hasuraEndpoint: process.env.HASURA_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_HASURA_GRAPHQL_ENDPOINT,
    hasuraAdminSecret: process.env.HASURA_ADMIN_SECRET,
};

