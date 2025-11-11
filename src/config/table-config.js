/**
 * 表管理配置
 * 定义字段权限、危险表、表级权限等
 */

// 表名到中文名的映射
const tableDisplayNames = {
  'fish': '鱼表',
  'votes': '投票表',
  'reports': '举报表',
  'user_economy': '用户经济表',
  'economy_log': '经济日志',
  'battle_log': '战斗日志',
  'battle_config': '战斗配置',
  'fishtanks': '鱼缸表',
  'fishtank_fish': '鱼缸-鱼关联表',
  'fishtank_views': '鱼缸浏览记录',
  'member_types': '会员类型表',
};

// 字段名到中文名的映射
const fieldDisplayNames = {
  'id': 'ID',
  'user_id': '用户ID',
  'fish_id': '鱼ID',
  'artist': '作者',
  'image_url': '图片URL',
  'level': '等级',
  'talent': '天赋',
  'upvotes': '赞成票',
  'downvotes': '反对票',
  'is_approved': '已审核',
  'is_banned': '已封禁',
  'created_at': '创建时间',
  'updated_at': '更新时间',
  'vote_type': '投票类型',
  'reason': '原因',
  'balance': '余额',
  'transaction_type': '交易类型',
  'amount': '金额',
  'description': '描述',
  'winner_id': '胜者ID',
  'loser_id': '败者ID',
  'level_weight': '等级权重',
  'talent_weight': '天赋权重',
  'upvote_weight': '赞成票权重',
  'name': '名称',
  'is_public': '是否公开',
  'share_id': '分享ID',
  'fish_count': '鱼数量',
  'view_count': '浏览次数',
  'fishtank_id': '鱼缸ID',
  'added_at': '添加时间',
  'viewed_at': '浏览时间',
  'viewer_ip': '浏览者IP',
  // member_types 表字段
  'can_group_chat': '可参与群聊',
  'can_promote_owner': '可宣传主人',
  'can_self_talk': '可自语',
  'lead_topic_frequency': '主导话题频率',
  'max_fish_count': '最大鱼数量',
  'promote_owner_frequency': '宣传主人频率',
};

// 危险表列表
const dangerousTables = new Set([
  'user_economy',
  'economy_log',
  'battle_config',
]);

// 只读字段模式
const readOnlyFieldPatterns = [
  /^id$/i,
  /^created_at$/i,
  /^updated_at$/i,
  /_aggregate$/,
  /_connection$/,
];

// 默认表权限
const defaultPermissions = {
  create: false,
  read: true,
  update: true,
  delete: false,
};

// 特定表的权限配置
const tablePermissionsConfig = {
  'fish': { update: true, delete: true },
  'votes': { update: true, delete: true },
  'reports': { update: true, delete: true },
  'fishtanks': { create: true, update: true, delete: true },
  'fishtank_fish': { create: true, update: true, delete: true },
  'fishtank_views': { delete: true },
  'user_economy': { update: true, delete: false },
  'economy_log': { update: false, delete: false },
  'battle_log': { update: false, delete: false },
  'battle_config': { update: true, delete: false },
  'member_types': { update: true, delete: false },
};

function getTableDisplayName(tableName) {
  return tableDisplayNames[tableName] || tableName;
}

function getFieldDisplayName(fieldName) {
  return fieldDisplayNames[fieldName] || fieldName;
}

function isDangerousTable(tableName) {
  return dangerousTables.has(tableName);
}

function isReadOnlyField(fieldName) {
  return readOnlyFieldPatterns.some(pattern => pattern.test(fieldName));
}

function getTableConfig(tableName) {
  const specificPermissions = tablePermissionsConfig[tableName] || {};
  const permissions = {
    ...defaultPermissions,
    ...specificPermissions,
  };
  
  return {
    permissions,
    isDangerous: isDangerousTable(tableName),
    displayName: getTableDisplayName(tableName),
  };
}

function getTablePermissions(tableName) {
  return getTableConfig(tableName).permissions;
}

const BATCH_DELETE_LIMITS = {
  'user_economy': 10,
  'battle_config': 5,
  'default': 100,
};

function getBatchDeleteLimit(tableName) {
  return BATCH_DELETE_LIMITS[tableName] || BATCH_DELETE_LIMITS.default;
}

module.exports = {
  tableDisplayNames,
  fieldDisplayNames,
  dangerousTables,
  getTableDisplayName,
  getFieldDisplayName,
  isDangerousTable,
  isReadOnlyField,
  getTableConfig,
  getTablePermissions,
  getBatchDeleteLimit
};

























