/**
 * 鱼缸功能适配器
 * 根据配置自动选择使用Hasura或原作者后端
 */

// 后端配置
let backendConfig = {
    backend: 'hasura', // 默认使用hasura
    originalBackendUrl: null,
    useHasura: true
};

// 初始化标志
let configLoaded = false;

/**
 * 加载后端配置
 */
async function loadBackendConfig() {
    if (configLoaded) return;
    
    try {
        const response = await fetch('/api/config/fishtank-backend');
        if (response.ok) {
            const config = await response.json();
            backendConfig = config;
            console.log(`🔧 鱼缸后端配置: ${config.backend === 'hasura' ? 'Hasura' : '原作者后端'}`);
        } else {
            console.warn('⚠️ 无法加载鱼缸后端配置，使用默认值');
        }
    } catch (error) {
        console.warn('⚠️ 加载鱼缸后端配置失败，使用默认值:', error);
    }
    
    configLoaded = true;
}

/**
 * 原作者后端API调用
 */
const originalBackend = {
    async getMyTanks(userId) {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${backendConfig.originalBackendUrl}/api/fishtanks/my-tanks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to load tanks');
        const data = await response.json();
        return data.fishtanks;
    },

    async getPublicTanks(limit = 12, offset = 0, sortBy = 'updatedAt') {
        const response = await fetch(
            `${backendConfig.originalBackendUrl}/api/fishtanks/public/list?limit=${limit}&offset=${offset}&sortBy=${sortBy}`
        );
        if (!response.ok) throw new Error('Failed to load public tanks');
        const data = await response.json();
        return data.fishtanks;
    },

    async getUserPublicTanks(userId) {
        const response = await fetch(
            `${backendConfig.originalBackendUrl}/api/fishtanks/public?userId=${encodeURIComponent(userId)}`
        );
        if (!response.ok) throw new Error('Failed to load user tanks');
        const data = await response.json();
        return data.fishtanks;
    },

    async getTankById(tankId) {
        const token = localStorage.getItem('userToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const response = await fetch(`${backendConfig.originalBackendUrl}/api/fishtanks/${tankId}`, {
            headers
        });
        if (!response.ok) throw new Error('Failed to load tank');
        return await response.json();
    },

    async createTank(tankData) {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${backendConfig.originalBackendUrl}/api/fishtanks/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(tankData)
        });
        if (!response.ok) throw new Error('Failed to create tank');
        return await response.json();
    },

    async updateTank(tankId, updates) {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${backendConfig.originalBackendUrl}/api/fishtanks/${tankId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update tank');
        return await response.json();
    },

    async deleteTank(tankId) {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${backendConfig.originalBackendUrl}/api/fishtanks/${tankId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete tank');
        return await response.json();
    },

    async addFishToTank(tankId, fishId) {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${backendConfig.originalBackendUrl}/api/fishtanks/${tankId}/add-fish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ fishId })
        });
        if (!response.ok) throw new Error('Failed to add fish to tank');
        return await response.json();
    },

    async removeFishFromTank(tankId, fishId) {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${backendConfig.originalBackendUrl}/api/fishtanks/${tankId}/fish/${fishId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to remove fish');
        return await response.json();
    },

    async getTankStats(tankId) {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${backendConfig.originalBackendUrl}/api/fishtanks/${tankId}/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to load tank statistics');
        return await response.json();
    }
};

/**
 * 适配器统一接口
 */
const fishtankAdapter = {
    /**
     * 获取用户的鱼缸列表
     */
    async getMyTanks(userId) {
        await loadBackendConfig();
        
        if (backendConfig.useHasura && window.fishtankHasura) {
            return await window.fishtankHasura.getMyTanks(userId);
        } else {
            return await originalBackend.getMyTanks(userId);
        }
    },

    /**
     * 获取公开鱼缸列表
     */
    async getPublicTanks(limit = 12, offset = 0, sortBy = 'updated_at') {
        await loadBackendConfig();
        
        if (backendConfig.useHasura && window.fishtankHasura) {
            return await window.fishtankHasura.getPublicTanks(limit, offset, sortBy);
        } else {
            // 原始后端使用驼峰命名
            const originalSortBy = sortBy === 'updated_at' ? 'updatedAt' : 
                                   sortBy === 'created_at' ? 'createdAt' : 
                                   sortBy === 'view_count' ? 'viewCount' : sortBy;
            return await originalBackend.getPublicTanks(limit, offset, originalSortBy);
        }
    },

    /**
     * 获取特定用户的公开鱼缸
     */
    async getUserPublicTanks(userId) {
        await loadBackendConfig();
        
        if (backendConfig.useHasura && window.fishtankHasura) {
            return await window.fishtankHasura.getUserPublicTanks(userId);
        } else {
            return await originalBackend.getUserPublicTanks(userId);
        }
    },

    /**
     * 通过ID获取鱼缸详情
     */
    async getTankById(tankId) {
        await loadBackendConfig();
        
        if (backendConfig.useHasura && window.fishtankHasura) {
            return await window.fishtankHasura.getTankById(tankId);
        } else {
            return await originalBackend.getTankById(tankId);
        }
    },

    /**
     * 通过分享ID获取鱼缸
     */
    async getTankByShareId(shareId) {
        await loadBackendConfig();
        
        if (backendConfig.useHasura && window.fishtankHasura) {
            return await window.fishtankHasura.getTankByShareId(shareId);
        } else {
            // 原始后端使用相同的getTankById接口
            return await originalBackend.getTankById(shareId);
        }
    },

    /**
     * 创建新鱼缸
     */
    async createTank(tankData) {
        await loadBackendConfig();
        
        if (backendConfig.useHasura && window.fishtankHasura) {
            // Hasura需要添加user_id
            const userId = await getCurrentUserId();
            const hasuraData = {
                ...tankData,
                user_id: userId,
                is_public: tankData.isPublic !== undefined ? tankData.isPublic : true
            };
            // 移除驼峰命名的字段
            delete hasuraData.isPublic;
            
            return await window.fishtankHasura.createTank(hasuraData);
        } else {
            return await originalBackend.createTank(tankData);
        }
    },

    /**
     * 更新鱼缸信息
     */
    async updateTank(tankId, updates) {
        await loadBackendConfig();
        
        if (backendConfig.useHasura && window.fishtankHasura) {
            // 转换字段名为下划线格式
            const hasuraUpdates = {};
            if (updates.name) hasuraUpdates.name = updates.name;
            if (updates.description !== undefined) hasuraUpdates.description = updates.description;
            if (updates.isPublic !== undefined) hasuraUpdates.is_public = updates.isPublic;
            
            return await window.fishtankHasura.updateTank(tankId, hasuraUpdates);
        } else {
            return await originalBackend.updateTank(tankId, updates);
        }
    },

    /**
     * 删除鱼缸
     */
    async deleteTank(tankId) {
        await loadBackendConfig();
        
        if (backendConfig.useHasura && window.fishtankHasura) {
            return await window.fishtankHasura.deleteTank(tankId);
        } else {
            return await originalBackend.deleteTank(tankId);
        }
    },

    /**
     * 添加鱼到鱼缸
     */
    async addFishToTank(tankId, fishId) {
        await loadBackendConfig();
        
        if (backendConfig.useHasura && window.fishtankHasura) {
            return await window.fishtankHasura.addFishToTank(tankId, fishId);
        } else {
            return await originalBackend.addFishToTank(tankId, fishId);
        }
    },

    /**
     * 从鱼缸移除鱼
     */
    async removeFishFromTank(tankId, fishId) {
        await loadBackendConfig();
        
        if (backendConfig.useHasura && window.fishtankHasura) {
            return await window.fishtankHasura.removeFishFromTank(tankId, fishId);
        } else {
            return await originalBackend.removeFishFromTank(tankId, fishId);
        }
    },

    /**
     * 记录鱼缸浏览
     */
    async recordTankView(tankId, viewerIp = null) {
        await loadBackendConfig();
        
        if (backendConfig.useHasura && window.fishtankHasura) {
            return await window.fishtankHasura.recordTankView(tankId, viewerIp);
        } else {
            // 原始后端可能没有这个接口，返回null
            return null;
        }
    },

    /**
     * 获取鱼缸统计信息
     */
    async getTankStats(tankId) {
        await loadBackendConfig();
        
        if (backendConfig.useHasura && window.fishtankHasura) {
            return await window.fishtankHasura.getTankStats(tankId);
        } else {
            return await originalBackend.getTankStats(tankId);
        }
    },

    /**
     * 获取当前配置
     */
    getConfig() {
        return backendConfig;
    }
};

/**
 * 获取当前用户ID
 */
async function getCurrentUserId() {
    if (window.supabaseAuth) {
        const user = await window.supabaseAuth.getCurrentUser();
        return user?.id;
    }
    
    // 从localStorage获取
    const userData = localStorage.getItem('userData');
    if (userData) {
        const user = JSON.parse(userData);
        return user.id;
    }
    
    throw new Error('User not authenticated');
}

// 导出适配器
window.fishtankAdapter = fishtankAdapter;

