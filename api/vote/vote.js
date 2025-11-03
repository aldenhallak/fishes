/**
 * 投票API（点赞/点踩）
 * POST /api/vote/vote
 * Body: { fishId, userId, voteType: 'up'|'down' }
 * 
 * 功能：
 * 1. 验证参数
 * 2. 检查是否已经投过票
 * 3. 如果已投票，则更新投票类型或取消
 * 4. 更新fish表的upvotes/downvotes
 * 5. 返回新的投票数
 */

require('dotenv').config({ path: '.env.local' });

const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { fishId, userId, voteType } = req.body;
    
    // 验证参数
    if (!fishId || !userId || !voteType) {
      return res.status(400).json({
        success: false,
        error: '缺少必填字段'
      });
    }
    
    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        error: '无效的投票类型，必须是 up 或 down'
      });
    }
    
    // 1. 检查鱼是否存在
    const getFishQuery = `
      query GetFish($fishId: uuid!) {
        fish_by_pk(id: $fishId) {
          id
          upvotes
          downvotes
          is_approved
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
    
    if (!fish.is_approved || fish.reported) {
      return res.status(403).json({
        success: false,
        error: '该鱼不可投票'
      });
    }
    
    // 2. 检查是否已经投过票
    const getVoteQuery = `
      query GetVote($fishId: uuid!, $userId: String!) {
        votes(where: { fish_id: { _eq: $fishId }, user_id: { _eq: $userId } }) {
          id
          vote_type
        }
      }
    `;
    
    const voteData = await queryHasura(getVoteQuery, { fishId, userId });
    const existingVote = voteData.votes[0];
    
    let newUpvotes = fish.upvotes;
    let newDownvotes = fish.downvotes;
    let action = '';
    
    if (existingVote) {
      // 已经投过票
      if (existingVote.vote_type === voteType) {
        // 相同类型的投票 -> 取消投票
        const deleteVoteQuery = `
          mutation DeleteVote($id: uuid!) {
            delete_votes_by_pk(id: $id) {
              id
            }
          }
        `;
        
        await queryHasura(deleteVoteQuery, { id: existingVote.id });
        
        // 减少对应的计数
        if (voteType === 'up') {
          newUpvotes--;
          action = 'cancel_upvote';
        } else {
          newDownvotes--;
          action = 'cancel_downvote';
        }
      } else {
        // 不同类型的投票 -> 更改投票
        const updateVoteQuery = `
          mutation UpdateVote($id: uuid!, $voteType: String!) {
            update_votes_by_pk(
              pk_columns: { id: $id },
              _set: { vote_type: $voteType }
            ) {
              id
              vote_type
            }
          }
        `;
        
        await queryHasura(updateVoteQuery, { 
          id: existingVote.id, 
          voteType 
        });
        
        // 减少旧的，增加新的
        if (existingVote.vote_type === 'up') {
          newUpvotes--;
          newDownvotes++;
          action = 'change_to_downvote';
        } else {
          newDownvotes--;
          newUpvotes++;
          action = 'change_to_upvote';
        }
      }
    } else {
      // 首次投票
      const insertVoteQuery = `
        mutation InsertVote($fishId: uuid!, $userId: String!, $voteType: String!) {
          insert_votes_one(
            object: {
              fish_id: $fishId,
              user_id: $userId,
              vote_type: $voteType
            }
          ) {
            id
            vote_type
          }
        }
      `;
      
      await queryHasura(insertVoteQuery, { fishId, userId, voteType });
      
      // 增加对应的计数
      if (voteType === 'up') {
        newUpvotes++;
        action = 'upvote';
      } else {
        newDownvotes++;
        action = 'downvote';
      }
    }
    
    // 3. 更新fish表的计数
    const updateFishQuery = `
      mutation UpdateFish($fishId: uuid!, $upvotes: Int!, $downvotes: Int!) {
        update_fish_by_pk(
          pk_columns: { id: $fishId },
          _set: { upvotes: $upvotes, downvotes: $downvotes }
        ) {
          id
          upvotes
          downvotes
        }
      }
    `;
    
    const updatedFish = await queryHasura(updateFishQuery, {
      fishId,
      upvotes: newUpvotes,
      downvotes: newDownvotes
    });
    
    // 4. 返回结果
    return res.json({
      success: true,
      action,
      upvotes: updatedFish.update_fish_by_pk.upvotes,
      downvotes: updatedFish.update_fish_by_pk.downvotes,
      score: newUpvotes - newDownvotes
    });
    
  } catch (error) {
    console.error('投票失败:', error);
    return res.status(500).json({
      success: false,
      error: '服务器错误',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



