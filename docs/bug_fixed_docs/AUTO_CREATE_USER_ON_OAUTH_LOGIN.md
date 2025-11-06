# OAuth登录自动创建用户记录

## 修改日期
2025-11-04

## 问题描述

Google OAuth登录成功后，用户信息保存在Supabase Auth中，但没有在应用的`users`表中创建对应的记录。这导致：
- Profile页面查询Hasura时找不到用户记录
- 用户无法进行需要users表关联的操作（如提交鱼）
- 数据库外键约束可能导致操作失败

## 解决方案

在用户登录后的认证状态更新流程中，自动检查并创建users表记录。

### 实现位置

`src/js/auth-ui.js` 中的 `updateAuthUI()` 方法

### 实现逻辑

1. 用户登录成功后
2. 保存用户信息到localStorage
3. **新增**：调用`ensureUserExistsInDatabase()`检查并创建用户记录
4. 更新UI显示用户菜单

### 核心代码

```javascript
/**
 * 更新认证UI状态
 */
async updateAuthUI() {
  if (!window.supabaseAuth) return;
  
  const user = await window.supabaseAuth.getCurrentUser();
  this.currentUser = user;
  
  if (user) {
    // 已登录：显示用户信息并保存到localStorage
    await this.saveUserToLocalStorage(user);
    // 确保用户在数据库中存在
    await this.ensureUserExistsInDatabase(user);
    this.showUserMenu(user);
  } else {
    // 未登录：清除localStorage并显示登录按钮
    this.clearUserFromLocalStorage();
    this.showLoginButton();
  }
}

/**
 * 确保用户在数据库中存在
 */
async ensureUserExistsInDatabase(user) {
  try {
    // 1. 检查用户是否存在
    const checkUserQuery = `
      query CheckUser($userId: String!) {
        users_by_pk(id: $userId) {
          id
        }
      }
    `;
    
    const checkResponse = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: checkUserQuery,
        variables: { userId: user.id }
      })
    });
    
    const checkResult = await checkResponse.json();
    
    // 如果用户已存在，直接返回
    if (checkResult.data?.users_by_pk) {
      console.log('✅ 用户已存在于数据库中');
      return;
    }
    
    // 2. 用户不存在，创建新用户
    console.log('📝 创建新用户记录:', user.id);
    
    const displayName = user.user_metadata?.name || 
                       user.user_metadata?.full_name || 
                       user.email?.split('@')[0] || 
                       'User';
    
    const avatarUrl = user.user_metadata?.avatar_url || 
                     user.user_metadata?.picture;
    
    const createUserMutation = `
      mutation CreateUser($userId: String!, $email: String!, $displayName: String!, $avatarUrl: String) {
        insert_users_one(
          object: { 
            id: $userId, 
            email: $email,
            display_name: $displayName,
            avatar_url: $avatarUrl,
            is_banned: false
          }
        ) {
          id
          email
          display_name
        }
      }
    `;
    
    const createResponse = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: createUserMutation,
        variables: { 
          userId: user.id,
          email: user.email,
          displayName: displayName,
          avatarUrl: avatarUrl
        }
      })
    });
    
    const createResult = await createResponse.json();
    
    if (createResult.errors) {
      console.error('❌ GraphQL创建用户错误:', createResult.errors);
      return;
    }
    
    console.log('✅ 用户记录创建成功:', createResult.data?.insert_users_one);
  } catch (error) {
    console.error('❌ 确保用户存在时出错:', error);
  }
}
```

## 创建的用户字段

从OAuth用户信息中提取以下字段创建users记录：

| 字段 | 来源 | 说明 |
|------|------|------|
| `id` | `user.id` | Supabase Auth的用户UUID |
| `email` | `user.email` | 用户邮箱 |
| `display_name` | `user.user_metadata.name` / `full_name` / 邮箱用户名 | 显示名称 |
| `avatar_url` | `user.user_metadata.avatar_url` / `picture` | Google头像URL |
| `is_banned` | `false` | 默认未封禁 |

## 特性

- ✅ **自动执行**：用户登录后自动触发，无需手动操作
- ✅ **幂等性**：重复调用不会创建重复记录
- ✅ **容错性**：失败不影响登录流程，只记录错误日志
- ✅ **透明性**：在控制台输出详细日志，便于调试

## 控制台日志

### 用户已存在
```
✅ 用户已存在于数据库中
```

### 创建新用户
```
📝 创建新用户记录: xxx-xxx-xxx-xxx
✅ 用户记录创建成功: { id: "xxx", email: "user@example.com", display_name: "User Name" }
```

### 错误情况
```
❌ 检查用户失败: [错误信息]
❌ GraphQL创建用户错误: [错误详情]
❌ 确保用户存在时出错: [异常信息]
```

## 测试验证

1. 清除localStorage和数据库中的测试用户
2. 使用Google OAuth登录
3. 检查控制台日志，应看到"创建新用户记录"
4. 查询users表，确认记录已创建
5. 访问profile页面，确认能正常显示用户信息
6. 再次刷新页面，应看到"用户已存在于数据库中"

## 注意事项

1. **时序**：创建用户操作在`saveUserToLocalStorage`之后执行，确保localStorage已有数据
2. **异步**：使用async/await确保用户创建完成后再更新UI
3. **错误处理**：即使创建失败，也不影响登录流程，用户仍能使用应用
4. **权限**：需要GraphQL API允许匿名插入users表，或确保有适当的权限配置

## 兼容性

- ✅ 支持所有OAuth提供商（Google, Twitter, Facebook, Discord等）
- ✅ 向后兼容现有邮箱/密码注册流程
- ✅ 不影响已存在用户的登录

## 相关文件

- `src/js/auth-ui.js` - 实现自动创建用户的逻辑
- `graphql/schema.graphql` - users表的GraphQL schema定义


















