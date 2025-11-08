/**
 * Global Parameters Utility
 * 
 * Reads configuration from global_params table with caching
 * to avoid frequent database queries.
 */

const { executeGraphQL } = require('./hasura');

// Cache for global parameters
const cache = {
  data: {},
  lastFetch: 0,
  ttl: 60000 // Cache TTL: 60 seconds
};

/**
 * Fetch all global parameters from database
 * @returns {Promise<Object>} - Key-value pairs of parameters
 */
async function fetchAllParams() {
  const query = `
    query GetGlobalParams {
      global_params {
        key
        value
        description
        updated_at
      }
    }
  `;

  try {
    const result = await executeGraphQL(query);
    
    if (result.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }

    const params = result.data.global_params;
    
    // Convert array to key-value object
    const paramsMap = {};
    params.forEach(param => {
      paramsMap[param.key] = param.value;
    });

    // Update cache
    cache.data = paramsMap;
    cache.lastFetch = Date.now();

    console.log('[Global Params] Fetched and cached:', Object.keys(paramsMap));
    
    return paramsMap;
  } catch (error) {
    console.error('[Global Params] Failed to fetch:', error);
    throw error;
  }
}

/**
 * Get a specific global parameter
 * Uses cache if available and not expired
 * 
 * @param {string} key - Parameter key
 * @param {any} defaultValue - Default value if parameter not found
 * @returns {Promise<string>} - Parameter value
 */
async function getGlobalParam(key, defaultValue = null) {
  // Check if cache is valid
  const cacheAge = Date.now() - cache.lastFetch;
  const cacheValid = cacheAge < cache.ttl && Object.keys(cache.data).length > 0;

  if (!cacheValid) {
    console.log('[Global Params] Cache expired or empty, fetching...');
    await fetchAllParams();
  }

  const value = cache.data[key];
  
  if (value === undefined) {
    if (defaultValue !== null) {
      console.log(`[Global Params] Key "${key}" not found, using default:`, defaultValue);
      return defaultValue;
    } else {
      throw new Error(`Global parameter "${key}" not found and no default value provided`);
    }
  }

  return value;
}

/**
 * Get a global parameter as integer
 * @param {string} key - Parameter key
 * @param {number} defaultValue - Default value if parameter not found
 * @returns {Promise<number>} - Parameter value as integer
 */
async function getGlobalParamInt(key, defaultValue = null) {
  const value = await getGlobalParam(key, defaultValue);
  const intValue = parseInt(value, 10);
  
  if (isNaN(intValue)) {
    throw new Error(`Global parameter "${key}" value "${value}" is not a valid integer`);
  }
  
  return intValue;
}

/**
 * Get a global parameter as float
 * @param {string} key - Parameter key
 * @param {number} defaultValue - Default value if parameter not found
 * @returns {Promise<number>} - Parameter value as float
 */
async function getGlobalParamFloat(key, defaultValue = null) {
  const value = await getGlobalParam(key, defaultValue);
  const floatValue = parseFloat(value);
  
  if (isNaN(floatValue)) {
    throw new Error(`Global parameter "${key}" value "${value}" is not a valid float`);
  }
  
  return floatValue;
}

/**
 * Get a global parameter as boolean
 * Recognizes: "true", "1", "yes" as true
 * @param {string} key - Parameter key
 * @param {boolean} defaultValue - Default value if parameter not found
 * @returns {Promise<boolean>} - Parameter value as boolean
 */
async function getGlobalParamBool(key, defaultValue = null) {
  const value = await getGlobalParam(key, defaultValue);
  const lowerValue = String(value).toLowerCase().trim();
  
  return ['true', '1', 'yes'].includes(lowerValue);
}

/**
 * Get all global parameters
 * Uses cache if available and not expired
 * @returns {Promise<Object>} - All parameters as key-value pairs
 */
async function getAllGlobalParams() {
  // Check if cache is valid
  const cacheAge = Date.now() - cache.lastFetch;
  const cacheValid = cacheAge < cache.ttl && Object.keys(cache.data).length > 0;

  if (!cacheValid) {
    console.log('[Global Params] Cache expired or empty, fetching all...');
    await fetchAllParams();
  }

  return { ...cache.data }; // Return copy
}

/**
 * Manually clear cache
 * Useful after updating parameters in database
 */
function clearCache() {
  cache.data = {};
  cache.lastFetch = 0;
  console.log('[Global Params] Cache cleared');
}

/**
 * Update cache TTL (time-to-live)
 * @param {number} ttlMs - TTL in milliseconds
 */
function setCacheTTL(ttlMs) {
  cache.ttl = ttlMs;
  console.log(`[Global Params] Cache TTL updated to ${ttlMs}ms`);
}

module.exports = {
  getGlobalParam,
  getGlobalParamInt,
  getGlobalParamFloat,
  getGlobalParamBool,
  getAllGlobalParams,
  clearCache,
  setCacheTTL
};

