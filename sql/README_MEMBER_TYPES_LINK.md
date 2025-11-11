# Member Types Table Link to Users

## Overview

This migration establishes a foreign key relationship between `user_subscriptions.plan` and `member_types.id`, enabling GraphQL relation queries.

## Files

1. **`link_member_types_to_users.sql`** - SQL migration to add foreign key constraint
2. **Updated code files**:
   - `api/middleware/membership.js` - Updated to use GraphQL relation queries
   - `src/js/fish-settings.js` - Updated to use GraphQL relation queries

## How to Run

### Step 1: Run the SQL Migration

Execute the SQL migration file in your database:

```bash
psql -h your_host -U your_user -d your_database -f sql/link_member_types_to_users.sql
```

Or through Hasura Console:
1. Go to Hasura Console → Data → SQL
2. Copy and paste the contents of `link_member_types_to_users.sql`
3. Click "Run Migration"

### Step 2: Refresh Hasura Metadata

After running the migration, Hasura needs to detect the new foreign key:

1. Go to Hasura Console → Data → Track All
2. Or manually track the relationship:
   - Go to `user_subscriptions` table
   - Click "Relationships" tab
   - You should see a new relationship: `member_type` (object relationship)

### Step 3: Verify

The code will automatically detect if the relationship is available:

- **If foreign key exists**: Uses GraphQL relation query (`user_subscription.member_type`)
- **If foreign key doesn't exist**: Falls back to manual matching (current behavior)

## Benefits

1. **Database-level integrity**: Foreign key ensures `user_subscriptions.plan` values are valid `member_types.id` values
2. **GraphQL relation queries**: Can directly query `user_subscription.member_type` instead of manual matching
3. **Better performance**: Single query instead of fetching all member_types and matching manually
4. **Type safety**: Database enforces valid plan values

## GraphQL Query Example

After the migration, you can use:

```graphql
query GetUserMembership($userId: String!) {
  users_by_pk(id: $userId) {
    id
    user_subscription {
      plan
      member_type {  # This relationship is automatically generated
        id
        name
        max_fish_count
        can_self_talk
        can_group_chat
        can_promote_owner
        promote_owner_frequency
        lead_topic_frequency
      }
    }
  }
}
```

## Backward Compatibility

The code is backward compatible:
- If foreign key exists → Uses relation query
- If foreign key doesn't exist → Uses manual matching (current behavior)
- If both fail → Falls back to `global_params` table

## Notes

- The foreign key uses `ON DELETE RESTRICT` to prevent deleting member types that are in use
- The foreign key uses `ON UPDATE CASCADE` to automatically update `user_subscriptions.plan` if `member_types.id` changes
- An index is created on `user_subscriptions.plan` for better query performance

