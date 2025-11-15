/**
 * 管理员权限验证工具
 * 通过subscription记录确认当前用户的会员等级
 */

async function checkAdminAccess(user = null) {
  try {
    // 获取当前用户（如果未提供）
    if (!user) {
      user = await window.supabaseAuth?.getCurrentUser();
      // 如果仍然没有，尝试从 localStorage 获取
      if (!user) {
        try {
          const userData = localStorage.getItem('userData');
          const userId = localStorage.getItem('userId');
          if (userData || userId) {
            let parsedUserData = {};
            if (userData) {
              try {
                parsedUserData = JSON.parse(userData);
              } catch (e) {
                // ignore
              }
            }
            user = {
              id: userId || parsedUserData.uid || parsedUserData.userId || parsedUserData.id,
              email: parsedUserData.email
            };
          }
        } catch (error) {
          // ignore
        }
      }
    }
    
    if (!user || !user.id) {
      console.log('❌ No user logged in');
      return false;
    }

    // 查询用户的会员类型（通过subscription记录）
    // 使用后端API代理GraphQL查询（避免在前端暴露admin secret）
    const query = `
      query CheckAdmin($userId: String!) {
        users_by_pk(id: $userId) {
          email
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

    // 使用后端API代理GraphQL查询
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables: { userId: user.id }
      })
    });

    if (!response.ok) {
      console.error('❌ GraphQL request failed:', response.status, response.statusText);
      return false;
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ GraphQL errors:', result.errors);
      return false;
    }

    const userData = result.data?.users_by_pk;
    if (!userData) {
      console.log('❌ User not found in database');
      return false;
    }

    const subscription = userData?.user_subscriptions?.[0];
    const memberTypes = result.data?.member_types || [];
    
    // 详细日志：输出完整的subscription信息
    console.log('🔍 Subscription details:', {
      hasSubscription: !!subscription,
      subscription: subscription ? {
        id: subscription.id,
        plan: subscription.plan,
        is_active: subscription.is_active,
        member_type: subscription.member_type,
        member_type_id: subscription.member_type?.id,
        member_type_name: subscription.member_type?.name
      } : null,
      allMemberTypes: memberTypes.map(mt => ({ id: mt.id, name: mt.name }))
    });
    
    // 构建 member_types 映射表（用于手动匹配）
    const memberTypesMap = {};
    memberTypes.forEach(mt => {
      memberTypesMap[mt.id] = mt;
    });
    
    let tier = 'free';
    let memberType = null;
    
    // 检查逻辑：优先使用 plan，如果 plan 为空则使用 member_type
    if (subscription?.plan) {
      // 优先使用 plan 字段
      tier = subscription.plan;
      // 尝试从 member_types 映射表中找到对应的 member_type
      memberType = memberTypesMap[tier] || null;
    } else if (subscription?.member_type) {
      // 如果 plan 为空，使用关联查询的结果
      memberType = subscription.member_type;
      tier = memberType.id;
    }
    
    // 检查是否为管理员：tier === 'admin' 或 plan === 'admin'
    const isAdmin = tier === 'admin' || subscription?.plan === 'admin';

    console.log('🔐 Admin check result:', { 
      userId: user.id,
      email: userData.email,
      isAdmin,
      tier,
      plan: subscription?.plan,
      memberTypeId: memberType?.id,
      memberTypeName: memberType?.name,
      hasSubscription: !!subscription,
      subscriptionId: subscription?.id
    });
    
    return isAdmin;

  } catch (error) {
    console.error('❌ Admin check failed:', error);
    return false;
  }
}

async function requireAdminAccess() {
  console.log('🔐 requireAdminAccess called');
  
  // 确保 supabaseAuth 已初始化（等待更长时间）
  if (!window.supabaseAuth) {
    console.log('⏳ Waiting for supabaseAuth to initialize...');
    await new Promise(resolve => {
      let attempts = 0;
      const maxAttempts = 50; // 最多等待5秒 (50 * 100ms)
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.supabaseAuth) {
          console.log(`✅ supabaseAuth initialized after ${attempts * 100}ms`);
          clearInterval(checkInterval);
          resolve();
        } else if (attempts >= maxAttempts) {
          console.warn('⚠️ supabaseAuth not initialized after 5 seconds, continuing anyway');
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }
  
  // 等待 supabaseConfigReady（如果存在）
  if (window.supabaseConfigReady === false) {
    console.log('⏳ Waiting for supabase config to be ready...');
    await new Promise(resolve => {
      if (window.supabaseConfigReady) {
        resolve();
      } else {
        window.addEventListener('supabaseConfigReady', resolve, { once: true });
        // 超时保护
        setTimeout(resolve, 3000);
      }
    });
  }
  
  // 尝试获取用户（多次重试）
  let user = null;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!user && attempts < maxAttempts) {
    attempts++;
    try {
      user = await window.supabaseAuth?.getCurrentUser();
      if (!user && attempts < maxAttempts) {
        console.log(`⏳ User not ready, waiting... (attempt ${attempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.warn(`⚠️ Error getting user (attempt ${attempts}):`, error);
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }
  
  // 如果仍然没有用户，尝试从 localStorage 获取
  if (!user) {
    console.log('⚠️ Could not get user from supabaseAuth, trying localStorage...');
    try {
      const userData = localStorage.getItem('userData');
      const userId = localStorage.getItem('userId');
      if (userData || userId) {
        let parsedUserData = {};
        if (userData) {
          try {
            parsedUserData = JSON.parse(userData);
          } catch (e) {
            console.warn('Failed to parse userData:', e);
          }
        }
        user = {
          id: userId || parsedUserData.uid || parsedUserData.userId || parsedUserData.id,
          email: parsedUserData.email || parsedUserData.email
        };
        console.log('✅ Got user from localStorage:', user);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
  }
  
  if (!user || !user.id) {
    console.log('❌ No user logged in when checking admin access');
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; font-family: sans-serif;">
        <h1>🔒 Access Denied</h1>
        <p>Please log in first.</p>
        <a href="/" style="margin-top: 20px; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Return to Home</a>
      </div>
    `;
    return false;
  }
  
  console.log('👤 Current user:', { id: user.id, email: user.email });
  
  const isAdmin = await checkAdminAccess(user);
  
  console.log('🔐 Admin access check result:', isAdmin);
  
  if (!isAdmin) {
    // 显示未授权页面
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; font-family: sans-serif;">
        <h1>🔒 Access Denied</h1>
        <p>This page is only accessible to administrators.</p>
        <p style="color: #666; font-size: 14px; margin-top: 10px;">User ID: ${user.id}</p>
        <p style="color: #666; font-size: 14px;">Email: ${user.email || 'N/A'}</p>
        <a href="/" style="margin-top: 20px; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Return to Home</a>
      </div>
    `;
    return false;
  }
  
  console.log('✅ Admin access granted');
  return true;
}

window.adminAuth = { checkAdminAccess, requireAdminAccess };

