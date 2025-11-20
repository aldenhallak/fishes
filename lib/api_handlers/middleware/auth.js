/**
 * API 鉴权中间件
 * 
 * 用于验证用户身份和权限
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 从 Authorization header 获取用户
 * @param {Object} req - Request object
 * @returns {Promise<Object>} - User object with id
 * @throws {Error} - If authentication fails
 */
async function getUserFromToken(token) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('Invalid or expired token');
    }
    
    return user;
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

/**
 * 验证请求中的 Authorization header
 * @param {Object} req - Request object
 * @returns {Promise<Object>} - { authenticated: boolean, userId: string|null, user: Object|null }
 */
async function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      userId: null,
      user: null
    };
  }
  
  try {
    const token = authHeader.substring(7);
    const user = await getUserFromToken(token);
    
    return {
      authenticated: true,
      userId: user.id,
      user: user
    };
  } catch (error) {
    console.error('[Auth] Verification failed:', error.message);
    return {
      authenticated: false,
      userId: null,
      user: null
    };
  }
}

/**
 * 中间件：要求用户必须登录
 * 如果未登录，返回 401 错误
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object|null>} - User object if authenticated, null if error response sent
 */
async function requireAuth(req, res) {
  const auth = await verifyAuth(req);
  
  if (!auth.authenticated) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required. Please log in.'
    });
    return null;
  }
  
  return auth;
}

/**
 * 中间件：验证用户 ID 匹配
 * 确保用户只能访问/修改自己的资源
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} requestedUserId - The user ID being accessed
 * @returns {Promise<Object|null>} - User object if authorized, null if error response sent
 */
async function requireUserIdMatch(req, res, requestedUserId) {
  const auth = await requireAuth(req, res);
  
  if (!auth) {
    return null; // Error already sent by requireAuth
  }
  
  if (auth.userId !== requestedUserId) {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'You can only access your own resources.'
    });
    return null;
  }
  
  return auth;
}

/**
 * 从请求中提取用户 ID（支持多种来源）
 * 优先级：1) Authorization header, 2) request body, 3) query parameter
 * @param {Object} req - Request object
 * @returns {Promise<Object>} - { userId: string|null, authenticated: boolean }
 */
async function extractUserId(req) {
  // 1. Try Authorization header first (most secure)
  const auth = await verifyAuth(req);
  if (auth.authenticated) {
    return {
      userId: auth.userId,
      authenticated: true,
      source: 'token'
    };
  }
  
  // 2. Try request body (for POST requests)
  if (req.body && req.body.userId) {
    return {
      userId: req.body.userId,
      authenticated: false,
      source: 'body'
    };
  }
  
  // 3. Try query parameter (for GET requests)
  if (req.query && req.query.userId) {
    return {
      userId: req.query.userId,
      authenticated: false,
      source: 'query'
    };
  }
  
  return {
    userId: null,
    authenticated: false,
    source: null
  };
}

module.exports = {
  getUserFromToken,
  verifyAuth,
  requireAuth,
  requireUserIdMatch,
  extractUserId
};
