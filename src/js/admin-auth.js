/**
 * 管理员权限验证工具
 */

async function checkAdminAccess() {
  try {
    // 获取当前用户
    const user = await window.supabaseAuth?.getCurrentUser();
    if (!user) {
      console.log('❌ No user logged in');
      return false;
    }

    // 查询用户的会员类型（与后端 getUserMembership 逻辑保持一致）
    const query = `
      query CheckAdmin($userId: String!) {
        users_by_pk(id: $userId) {
          user_subscriptions(
            where: { is_active: { _eq: true } }
            order_by: { created_at: desc }
            limit: 1
          ) {
            plan
            member_type {
              id
              name
            }
          }
        }
        member_types {
          id
          name
        }
      }
    `;

    const response = await fetch(window.HASURA_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': window.HASURA_ADMIN_SECRET
      },
      body: JSON.stringify({
        query,
        variables: { userId: user.id }
      })
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ GraphQL errors:', result.errors);
      return false;
    }

    const userData = result.data?.users_by_pk;
    const subscription = userData?.user_subscriptions?.[0];
    const memberTypes = result.data?.member_types || [];
    
    // 构建 member_types 映射表（用于手动匹配）
    const memberTypesMap = {};
    memberTypes.forEach(mt => {
      memberTypesMap[mt.id] = mt;
    });
    
    let tier = 'free';
    let memberType = null;
    
    // 检查逻辑与 getUserMembership 保持一致
    if (subscription?.member_type) {
      // 使用关联查询的结果
      memberType = subscription.member_type;
      tier = memberType.id;
    } else if (subscription?.plan) {
      // 使用手动匹配
      tier = subscription.plan;
      memberType = memberTypesMap[tier] || memberTypesMap['free'] || null;
    }
    
    // 检查是否为管理员：tier === 'admin'
    const isAdmin = tier === 'admin';

    console.log('🔐 Admin check:', { 
      userId: user.id, 
      isAdmin,
      tier,
      plan: subscription?.plan,
      memberTypeId: memberType?.id,
      memberTypeName: memberType?.name,
      hasSubscription: !!subscription
    });
    
    return isAdmin;

  } catch (error) {
    console.error('❌ Admin check failed:', error);
    return false;
  }
}

async function requireAdminAccess() {
  const isAdmin = await checkAdminAccess();
  
  if (!isAdmin) {
    // 显示未授权页面
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; font-family: sans-serif;">
        <h1>🔒 Access Denied</h1>
        <p>This page is only accessible to administrators.</p>
        <a href="/" style="margin-top: 20px; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Return to Home</a>
      </div>
    `;
    return false;
  }
  
  return true;
}

window.adminAuth = { checkAdminAccess, requireAdminAccess };

