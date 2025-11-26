/**
 * 七牛云图片分类配置
 * 定义不同类型图片的存储分类
 */

/**
 * 图片分类常量
 */
const CATEGORIES = {
  FISH: 'fish',           // 鱼作品图片
  AVATAR: 'avatars',      // 用户头像
  BATTLE: 'battle',       // 战斗相关图片
  TEMP: 'temp'            // 临时文件
};

/**
 * 根据上下文自动判断图片分类
 * @param {Object} context - 上下文信息
 * @param {string} context.url - 请求URL
 * @param {string} context.referer - 来源页面
 * @param {string} context.type - 指定的类型参数
 * @returns {string} 分类名称
 */
function detectCategory(context = {}) {
  const { url, referer, type } = context;
  
  // 优先级1: 根据表单字段type或category参数判断
  if (type) {
    const normalized = type.toLowerCase();
    if (normalized === 'avatar' || normalized === 'avatars') return CATEGORIES.AVATAR;
    if (normalized === 'fish') return CATEGORIES.FISH;
    if (normalized === 'battle') return CATEGORIES.BATTLE;
    if (normalized === 'temp') return CATEGORIES.TEMP;
  }
  
  // 优先级2: 根据API路径判断
  if (url) {
    if (url.includes('/api/avatar/upload')) return CATEGORIES.AVATAR;
    if (url.includes('/api/fish-api?action=upload')) return CATEGORIES.FISH;
    if (url.includes('/api/battle/upload')) return CATEGORIES.BATTLE;
    if (url.includes('/api/temp/upload')) return CATEGORIES.TEMP;
  }
  
  // 优先级3: 根据referer页面判断
  if (referer) {
    if (referer.includes('/profile') || referer.includes('/settings')) {
      return CATEGORIES.AVATAR;
    }
    if (referer.includes('/battle')) {
      return CATEGORIES.BATTLE;
    }
  }
  
  // 默认使用fish分类（鱼作品）
  return CATEGORIES.FISH;
}

/**
 * 验证分类是否有效
 * @param {string} category - 分类名称
 * @returns {boolean}
 */
function isValidCategory(category) {
  return Object.values(CATEGORIES).includes(category);
}

/**
 * 获取所有可用分类
 * @returns {Array<string>}
 */
function getAllCategories() {
  return Object.values(CATEGORIES);
}

module.exports = {
  CATEGORIES,
  detectCategory,
  isValidCategory,
  getAllCategories
};

