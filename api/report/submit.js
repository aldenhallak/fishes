/**
 * 举报API
 * POST /api/report/submit
 * Body: { fishId, reason, reporterIp?, userAgent?, url? }
 * 
 * 功能：
 * 1. 创建举报记录
 * 2. 自动增加fish的report_count（通过触发器）
 * 3. 如果report_count >= 5，自动标记为reported
 * 4. 返回举报结果
 */

require('dotenv').config({ path: '.env.local' });

const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

// 自动隐藏阈值
const AUTO_HIDE_THRESHOLD = 5;

async function queryHasura(query, variables = {}) {
  const response = await fetch(HASURA_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET
    },
    body: JSON.stringify({ query, variables })
  });
  
  const result = await response.json();
  
  if (result.errors) {
    console.error('Hasura错误:', result.errors);
    throw new Error(result.errors[0].message);
  }
  
  return result.data;
}

/**
 * 获取客户端IP（Vercel环境）
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         'unknown';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { 
      fishId, 
      reason, 
      reporterIp: providedIp,
      userAgent: providedUserAgent,
      url: providedUrl
    } = req.body;
    
    // 验证参数
    if (!fishId || !reason) {
      return res.status(400).json({
        success: false,
        error: '缺少必填字段：fishId 或 reason'
      });
    }
    
    if (reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: '举报原因至少5个字符'
      });
    }
    
    // 获取IP和User Agent
    const reporterIp = providedIp || getClientIp(req);
    const userAgent = providedUserAgent || req.headers['user-agent'] || 'Unknown';
    const url = providedUrl || req.headers.referer || 'Unknown';
    
    // 1. 检查鱼是否存在
    const getFishQuery = `
      query GetFish($fishId: uuid!) {
        fish_by_pk(id: $fishId) {
          id
          report_count
          reported
        }
      }
    `;
    
    const fishData = await queryHasura(getFishQuery, { fishId });
    
    if (!fishData.fish_by_pk) {
      return res.status(404).json({
        success: false,
        error: '鱼不存在'
      });
    }
    
    const fish = fishData.fish_by_pk;
    
    // 2. 检查是否同一IP重复举报（可选，防止滥用）
    const checkDuplicateQuery = `
      query CheckDuplicate($fishId: uuid!, $reporterIp: String!) {
        reports(
          where: {
            fish_id: { _eq: $fishId },
            reporter_ip: { _eq: $reporterIp }
          }
        ) {
          id
          created_at
        }
      }
    `;
    
    const duplicateData = await queryHasura(checkDuplicateQuery, { 
      fishId, 
      reporterIp 
    });
    
    if (duplicateData.reports.length > 0) {
      const lastReport = duplicateData.reports[0];
      const timeSinceLastReport = Date.now() - new Date(lastReport.created_at).getTime();
      
      // 5分钟内不能重复举报
      if (timeSinceLastReport < 5 * 60 * 1000) {
        return res.json({
          success: false,
          duplicate: true,
          message: '您已经举报过该内容，请勿重复举报'
        });
      }
    }
    
    // 3. 创建举报记录（触发器会自动增加report_count）
    const insertReportQuery = `
      mutation InsertReport(
        $fishId: uuid!,
        $reporterIp: String!,
        $reason: String!,
        $userAgent: String!,
        $url: String!
      ) {
        insert_reports_one(
          object: {
            fish_id: $fishId,
            reporter_ip: $reporterIp,
            reason: $reason,
            user_agent: $userAgent,
            url: $url,
            status: "pending"
          }
        ) {
          id
          created_at
        }
      }
    `;
    
    await queryHasura(insertReportQuery, {
      fishId,
      reporterIp,
      reason: reason.trim(),
      userAgent,
      url
    });
    
    // 4. 获取更新后的fish数据（触发器已经更新了report_count）
    const updatedFishData = await queryHasura(getFishQuery, { fishId });
    const updatedFish = updatedFishData.fish_by_pk;
    
    // 5. 返回结果
    const isHidden = updatedFish.report_count >= AUTO_HIDE_THRESHOLD;
    
    return res.json({
      success: true,
      message: '举报提交成功',
      reportCount: updatedFish.report_count,
      isHidden,
      autoHideThreshold: AUTO_HIDE_THRESHOLD
    });
    
  } catch (error) {
    console.error('提交举报失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



