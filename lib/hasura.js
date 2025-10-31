/**
 * Hasura GraphQL客户端封装
 * 支持自建Hasura服务器
 */

// 环境变量配置
const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

if (!HASURA_GRAPHQL_ENDPOINT) {
  console.warn('⚠️ HASURA_GRAPHQL_ENDPOINT not set');
}

if (!HASURA_ADMIN_SECRET) {
  console.warn('⚠️ HASURA_ADMIN_SECRET not set');
}

/**
 * 执行GraphQL查询
 * @param {string} query - GraphQL查询语句
 * @param {object} variables - 查询变量
 * @returns {Promise<object>} 查询结果
 */
async function query(query, variables = {}) {
  try {
    const response = await fetch(HASURA_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      throw new Error(result.errors[0].message);
    }

    return result.data;
  } catch (error) {
    console.error('Hasura query error:', error);
    throw error;
  }
}

/**
 * 执行GraphQL mutation
 * @param {string} mutation - GraphQL mutation语句
 * @param {object} variables - mutation变量
 * @returns {Promise<object>} mutation结果
 */
async function mutation(mutation, variables = {}) {
  try {
    const response = await fetch(HASURA_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET
      },
      body: JSON.stringify({
        query: mutation,
        variables
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      throw new Error(result.errors[0].message);
    }

    return result.data;
  } catch (error) {
    console.error('Hasura mutation error:', error);
    throw error;
  }
}

/**
 * 批量查询鱼数据
 * @param {object} where - 查询条件
 * @param {number} limit - 限制数量
 * @param {string} orderBy - 排序字段
 * @param {string} order - 排序方向
 * @returns {Promise<Array>} 鱼数据数组
 */
async function getFish(where = {}, limit = 50, orderBy = 'created_at', order = 'desc') {
  const queryStr = `
    query GetFish($where: fish_bool_exp!, $limit: Int!, $order_by: [fish_order_by!]) {
      fish(where: $where, limit: $limit, order_by: $order_by) {
        id
        user_id
        artist
        image_url
        created_at
        talent
        level
        experience
        health
        max_health
        upvotes
        downvotes
        battle_power
        is_alive
        is_in_battle_mode
        total_wins
        total_losses
      }
    }
  `;

  const variables = {
    where,
    limit,
    order_by: { [orderBy]: order }
  };

  const data = await query(queryStr, variables);
  return data.fish;
}

/**
 * 根据ID获取单条鱼数据
 * @param {string} fishId - 鱼ID
 * @returns {Promise<object>} 鱼数据
 */
async function getFishById(fishId) {
  const queryStr = `
    query GetFishById($id: uuid!) {
      fish_by_pk(id: $id) {
        id
        user_id
        artist
        image_url
        created_at
        talent
        level
        experience
        health
        max_health
        upvotes
        downvotes
        battle_power
        is_alive
        is_in_battle_mode
        last_battle_time
        total_wins
        total_losses
      }
    }
  `;

  const data = await query(queryStr, { id: fishId });
  return data.fish_by_pk;
}

/**
 * 更新鱼数据
 * @param {string} fishId - 鱼ID
 * @param {object} updates - 更新的字段
 * @returns {Promise<object>} 更新后的鱼数据
 */
async function updateFish(fishId, updates) {
  const mutationStr = `
    mutation UpdateFish($id: uuid!, $updates: fish_set_input!) {
      update_fish_by_pk(pk_columns: { id: $id }, _set: $updates) {
        id
        health
        experience
        level
        is_alive
        is_in_battle_mode
      }
    }
  `;

  const data = await mutation(mutationStr, { id: fishId, updates });
  return data.update_fish_by_pk;
}

/**
 * 批量更新鱼数据（用于战斗结算）
 * @param {Array} updates - 更新数组 [{id, ...fields}]
 * @returns {Promise<object>} 更新结果
 */
async function batchUpdateFish(updates) {
  // 构建批量更新mutation
  const mutations = updates.map((update, index) => {
    const { id, ...fields } = update;
    return `
      fish${index}: update_fish_by_pk(
        pk_columns: { id: "${id}" },
        _set: ${JSON.stringify(fields).replace(/"([^"]+)":/g, '$1:')}
      ) {
        id
        health
        experience
        level
        is_alive
      }
    `;
  }).join('\n');

  const mutationStr = `
    mutation BatchUpdateFish {
      ${mutations}
    }
  `;

  return await mutation(mutationStr);
}

/**
 * 获取战斗配置
 * @returns {Promise<object>} 战斗配置
 */
async function getBattleConfig() {
  const queryStr = `
    query GetBattleConfig {
      battle_config_by_pk(id: 1) {
        id
        level_weight
        talent_weight
        upvote_weight
        random_factor
        exp_per_win
        health_loss_per_defeat
        max_battle_users
        updated_at
      }
    }
  `;

  const data = await query(queryStr);
  return data.battle_config_by_pk;
}

/**
 * 记录战斗日志
 * @param {object} battleData - 战斗数据
 * @returns {Promise<object>} 插入结果
 */
async function logBattle(battleData) {
  const mutationStr = `
    mutation LogBattle($battle: battle_log_insert_input!) {
      insert_battle_log_one(object: $battle) {
        id
        created_at
      }
    }
  `;

  return await mutation(mutationStr, { battle: battleData });
}

/**
 * 获取用户经济数据
 * @param {string} userId - 用户ID
 * @returns {Promise<object>} 经济数据
 */
async function getUserEconomy(userId) {
  const queryStr = `
    query GetUserEconomy($userId: String!) {
      user_economy_by_pk(user_id: $userId) {
        user_id
        fish_food
        last_daily_bonus
        created_at
      }
    }
  `;

  const data = await query(queryStr, { userId });
  
  // 如果用户不存在，创建默认记录
  if (!data.user_economy_by_pk) {
    return await createUserEconomy(userId);
  }
  
  return data.user_economy_by_pk;
}

/**
 * 创建用户经济记录
 * @param {string} userId - 用户ID
 * @returns {Promise<object>} 创建的经济数据
 */
async function createUserEconomy(userId) {
  const mutationStr = `
    mutation CreateUserEconomy($userId: String!) {
      insert_user_economy_one(object: { user_id: $userId, fish_food: 10 }) {
        user_id
        fish_food
        last_daily_bonus
        created_at
      }
    }
  `;

  const data = await mutation(mutationStr, { userId });
  return data.insert_user_economy_one;
}

/**
 * 更新用户鱼食数量
 * @param {string} userId - 用户ID
 * @param {number} amount - 变化量（正数增加，负数减少）
 * @returns {Promise<object>} 更新后的数据
 */
async function updateFishFood(userId, amount) {
  const mutationStr = `
    mutation UpdateFishFood($userId: String!, $amount: Int!) {
      update_user_economy_by_pk(
        pk_columns: { user_id: $userId },
        _inc: { fish_food: $amount }
      ) {
        user_id
        fish_food
      }
    }
  `;

  return await mutation(mutationStr, { userId, amount });
}

/**
 * 测试连接
 * @returns {Promise<boolean>} 连接是否成功
 */
async function testConnection() {
  try {
    const queryStr = `
      query TestConnection {
        __typename
      }
    `;
    
    await query(queryStr);
    console.log('✅ Hasura连接成功');
    return true;
  } catch (error) {
    console.error('❌ Hasura连接失败:', error.message);
    return false;
  }
}

// 导出
module.exports = {
  query,
  mutation,
  getFish,
  getFishById,
  updateFish,
  batchUpdateFish,
  getBattleConfig,
  logBattle,
  getUserEconomy,
  createUserEconomy,
  updateFishFood,
  testConnection
};

