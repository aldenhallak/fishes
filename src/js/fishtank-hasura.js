/**
 * 鱼缸功能的Hasura GraphQL API封装
 * 替代原有的REST API调用
 */

// Hasura GraphQL endpoint
const HASURA_ENDPOINT = '/api/graphql'; // 通过本地代理访问Hasura

/**
 * 执行GraphQL查询
 */
async function executeGraphQL(query, variables = {}) {
    try {
        // 获取认证token
        let authToken = null;
        if (window.supabaseAuth) {
            authToken = await window.supabaseAuth.getAccessToken();
        }

        const headers = {
            'Content-Type': 'application/json',
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(HASURA_ENDPOINT, {
            method: 'POST',
            headers,
            body: JSON.stringify({ query, variables })
        });

        if (!response.ok) {
            throw new Error(`GraphQL request failed: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
            console.error('GraphQL errors:', result.errors);
            throw new Error(result.errors[0].message);
        }

        return result.data;
    } catch (error) {
        console.error('GraphQL execution error:', error);
        throw error;
    }
}

/**
 * 获取用户的鱼缸列表
 */
async function getMyTanks(userId) {
    const query = `
        query GetMyTanks($userId: String!) {
            fishtanks(
                where: { user_id: { _eq: $userId } }
                order_by: { updated_at: desc }
            ) {
                id
                name
                description
                is_public
                share_id
                fish_count
                view_count
                created_at
                updated_at
            }
        }
    `;

    const data = await executeGraphQL(query, { userId });
    return data.fishtanks;
}

/**
 * 获取公开鱼缸列表
 */
async function getPublicTanks(limit = 12, offset = 0, sortBy = 'updated_at') {
    const orderBy = {};
    orderBy[sortBy] = 'desc';

    const query = `
        query GetPublicTanks($limit: Int!, $offset: Int!, $orderBy: [fishtanks_order_by!]) {
            fishtanks(
                where: { is_public: { _eq: true } }
                limit: $limit
                offset: $offset
                order_by: $orderBy
            ) {
                id
                name
                description
                is_public
                share_id
                fish_count
                view_count
                created_at
                updated_at
                user_id
            }
        }
    `;

    const data = await executeGraphQL(query, { limit, offset, orderBy: [orderBy] });
    return data.fishtanks;
}

/**
 * 获取特定用户的公开鱼缸
 */
async function getUserPublicTanks(userId) {
    const query = `
        query GetUserPublicTanks($userId: String!) {
            fishtanks(
                where: { 
                    user_id: { _eq: $userId },
                    is_public: { _eq: true }
                }
                order_by: { updated_at: desc }
            ) {
                id
                name
                description
                is_public
                share_id
                fish_count
                view_count
                created_at
                updated_at
            }
        }
    `;

    const data = await executeGraphQL(query, { userId });
    return data.fishtanks;
}

/**
 * 通过ID获取鱼缸详情（包括鱼列表）
 */
async function getTankById(tankId) {
    const query = `
        query GetTankById($tankId: uuid!) {
            fishtanks_by_pk(id: $tankId) {
                id
                name
                description
                is_public
                share_id
                fish_count
                view_count
                created_at
                updated_at
                user_id
            }
            fishtank_fish(where: { fishtank_id: { _eq: $tankId } }) {
                id
                fish_id
                added_at
                fish {
                    id
                    artist
                    image_url
                    created_at
                    upvotes
                    downvotes
                    level
                    talent
                }
            }
        }
    `;

    const data = await executeGraphQL(query, { tankId });
    
    if (!data.fishtanks_by_pk) {
        throw new Error('Tank not found');
    }

    return {
        fishtank: data.fishtanks_by_pk,
        fish: data.fishtank_fish.map(tf => ({
            ...tf.fish,
            addedAt: tf.added_at
        }))
    };
}

/**
 * 通过share_id获取鱼缸
 */
async function getTankByShareId(shareId) {
    const query = `
        query GetTankByShareId($shareId: String!) {
            fishtanks(where: { share_id: { _eq: $shareId } }, limit: 1) {
                id
                name
                description
                is_public
                share_id
                fish_count
                view_count
                created_at
                updated_at
                user_id
            }
            fishtank_fish(where: { fishtank: { share_id: { _eq: $shareId } } }) {
                id
                fish_id
                added_at
                fish {
                    id
                    artist
                    image_url
                    created_at
                    upvotes
                    downvotes
                    level
                    talent
                }
            }
        }
    `;

    const data = await executeGraphQL(query, { shareId });
    
    if (!data.fishtanks || data.fishtanks.length === 0) {
        throw new Error('Tank not found');
    }

    return {
        fishtank: data.fishtanks[0],
        fish: data.fishtank_fish.map(tf => ({
            ...tf.fish,
            addedAt: tf.added_at
        }))
    };
}

/**
 * 创建新鱼缸
 */
async function createTank(tankData) {
    const query = `
        mutation CreateTank($tankData: fishtanks_insert_input!) {
            insert_fishtanks_one(object: $tankData) {
                id
                name
                description
                is_public
                share_id
                created_at
                updated_at
            }
        }
    `;

    const data = await executeGraphQL(query, { tankData });
    return data.insert_fishtanks_one;
}

/**
 * 更新鱼缸信息
 */
async function updateTank(tankId, updates) {
    const query = `
        mutation UpdateTank($tankId: uuid!, $updates: fishtanks_set_input!) {
            update_fishtanks_by_pk(
                pk_columns: { id: $tankId }
                _set: $updates
            ) {
                id
                name
                description
                is_public
                updated_at
            }
        }
    `;

    const data = await executeGraphQL(query, { tankId, updates });
    
    if (!data.update_fishtanks_by_pk) {
        throw new Error('Failed to update tank');
    }

    return data.update_fishtanks_by_pk;
}

/**
 * 删除鱼缸
 */
async function deleteTank(tankId) {
    const query = `
        mutation DeleteTank($tankId: uuid!) {
            delete_fishtanks_by_pk(id: $tankId) {
                id
            }
        }
    `;

    const data = await executeGraphQL(query, { tankId });
    return data.delete_fishtanks_by_pk;
}

/**
 * 添加鱼到鱼缸
 */
async function addFishToTank(tankId, fishId) {
    const query = `
        mutation AddFishToTank($tankId: uuid!, $fishId: uuid!) {
            insert_fishtank_fish_one(
                object: { fishtank_id: $tankId, fish_id: $fishId }
                on_conflict: {
                    constraint: fishtank_fish_fishtank_id_fish_id_key
                    update_columns: []
                }
            ) {
                id
                fishtank_id
                fish_id
                added_at
            }
        }
    `;

    const data = await executeGraphQL(query, { tankId, fishId });
    return data.insert_fishtank_fish_one;
}

/**
 * 从鱼缸移除鱼
 */
async function removeFishFromTank(tankId, fishId) {
    const query = `
        mutation RemoveFishFromTank($tankId: uuid!, $fishId: uuid!) {
            delete_fishtank_fish(
                where: { 
                    fishtank_id: { _eq: $tankId },
                    fish_id: { _eq: $fishId }
                }
            ) {
                affected_rows
            }
        }
    `;

    const data = await executeGraphQL(query, { tankId, fishId });
    return data.delete_fishtank_fish;
}

/**
 * 记录鱼缸浏览
 */
async function recordTankView(tankId, viewerIp = null) {
    const query = `
        mutation RecordTankView($tankId: uuid!, $viewerIp: String) {
            insert_fishtank_views_one(
                object: { fishtank_id: $tankId, viewer_ip: $viewerIp }
            ) {
                id
            }
            update_fishtanks_by_pk(
                pk_columns: { id: $tankId }
                _inc: { view_count: 1 }
            ) {
                id
                view_count
            }
        }
    `;

    const data = await executeGraphQL(query, { tankId, viewerIp });
    return data;
}

/**
 * 获取鱼缸统计信息
 */
async function getTankStats(tankId) {
    const query = `
        query GetTankStats($tankId: uuid!, $thirtyDaysAgo: timestamp!) {
            fishtanks_by_pk(id: $tankId) {
                view_count
            }
            recent_views: fishtank_views_aggregate(
                where: { 
                    fishtank_id: { _eq: $tankId },
                    viewed_at: { _gte: $thirtyDaysAgo }
                }
            ) {
                aggregate {
                    count
                }
            }
            last_view: fishtank_views(
                where: { fishtank_id: { _eq: $tankId } }
                order_by: { viewed_at: desc }
                limit: 1
            ) {
                viewed_at
            }
            daily_views: fishtank_views(
                where: { 
                    fishtank_id: { _eq: $tankId },
                    viewed_at: { _gte: $thirtyDaysAgo }
                }
            ) {
                viewed_at
            }
        }
    `;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const data = await executeGraphQL(query, { 
        tankId, 
        thirtyDaysAgo: thirtyDaysAgo.toISOString() 
    });

    // 处理每日浏览数据
    const dailyViews = {};
    if (data.daily_views) {
        data.daily_views.forEach(view => {
            const date = new Date(view.viewed_at).toISOString().split('T')[0];
            dailyViews[date] = (dailyViews[date] || 0) + 1;
        });
    }

    return {
        totalViews: data.fishtanks_by_pk?.view_count || 0,
        recentViews: data.recent_views.aggregate.count,
        lastViewedAt: data.last_view[0]?.viewed_at || null,
        dailyViews
    };
}

// 导出函数
window.fishtankHasura = {
    getMyTanks,
    getPublicTanks,
    getUserPublicTanks,
    getTankById,
    getTankByShareId,
    createTank,
    updateTank,
    deleteTank,
    addFishToTank,
    removeFishFromTank,
    recordTankView,
    getTankStats
};

