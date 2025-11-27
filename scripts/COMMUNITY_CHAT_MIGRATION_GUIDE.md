# Community Chat System Migration Guide

## Overview

This migration transforms Fish Art from a battle-centric system to a community chat system by:
- Removing all battle-related database fields
- Creating tables for community chat sessions
- Setting up the foundation for COZE AI integration

## Pre-Migration Checklist

- [ ] Backup your database
- [ ] Ensure `fish_name` and `personality_type` columns exist in `fish` table
- [ ] Verify Hasura console access
- [ ] Note: This migration will permanently remove battle data

## Migration Steps

### Step 1: Backup Database

```bash
# Using PostgreSQL pg_dump
pg_dump -h your-db-host -U your-user -d your-database > backup_$(date +%Y%m%d_%H%M%S).sql

# Or export from Hasura Cloud/Neon dashboard
```

### Step 2: Run Migration SQL

**Option A: Using Hasura Console**

1. Open Hasura Console
2. Go to `Data` tab → `SQL` section
3. Copy contents of `scripts/migrate-community-chat-system.sql`
4. Paste into SQL editor
5. Check "Track this" if you want Hasura to auto-track new tables
6. Click "Run!"

**Option B: Using psql CLI**

```bash
psql -h your-db-host -U your-user -d your-database -f scripts/migrate-community-chat-system.sql
```

**Option C: Using Neon Console**

1. Login to Neon dashboard
2. Select your project
3. Go to SQL Editor
4. Paste migration script
5. Execute

### Step 3: Verify Migration

Run this verification query:

```sql
-- Check if battle fields are removed
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'fish' 
  AND column_name IN ('talent', 'level', 'battle_power');
-- Should return 0 rows

-- Check if new table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'community_chat_sessions';
-- Should return 1 row

-- Check fish table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fish' 
ORDER BY ordinal_position;

-- Check community_chat_sessions structure
\d community_chat_sessions
```

Expected fish table columns after migration:
```
id                    | uuid
user_id               | character varying(255)
image_url             | text
artist                | character varying(255)
fish_name             | character varying(50)     ← ✅
personality_type      | character varying(20)     ← ✅
upvotes               | integer
is_alive              | boolean
is_approved           | boolean
reported              | boolean
created_at            | timestamp
```

### Step 4: Track Tables in Hasura

1. Go to Hasura Console → `Data` tab
2. Click "Track" for:
   - `community_chat_sessions`
   - `recent_chat_sessions` (view)
3. Untrack old tables (if still tracked):
   - `battle_log`
   - `battle_config`

### Step 5: Configure Permissions

For `community_chat_sessions` table:

**Select Permission (user role):**
```json
{
  "filter": {},
  "columns": ["id", "topic", "time_of_day", "dialogues", "created_at"]
}
```

**Insert Permission (backend role):**
```json
{
  "check": {},
  "columns": ["topic", "time_of_day", "participant_fish_ids", "dialogues", "display_duration"]
}
```

For `user_subscriptions` table:

**Select Permission (user role):**
```json
{
  "filter": {
    "user_id": {
      "_eq": "X-Hasura-User-Id"
    }
  },
  "columns": ["user_id", "plan", "is_active", "current_period_end"]
}
```

### Step 6: Set Up Auto-Cleanup (Optional but Recommended)

Create a cron job to clean up expired chat sessions:

**Using Hasura Scheduled Triggers:**

1. Go to Hasura Console → `Events` → `Cron Triggers`
2. Create new trigger:
   - Name: `cleanup_expired_chats`
   - Webhook: `https://your-domain.com/api/cron/cleanup-chats`
   - Schedule: `0 2 * * *` (daily at 2 AM)

3. Create webhook endpoint `api/cron/cleanup-chats.js`:

```javascript
export default async function handler(req, res) {
  // Verify Hasura secret
  if (req.headers['x-hasura-admin-secret'] !== process.env.HASURA_ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const query = `
    mutation CleanupExpiredChats {
      delete_community_chat_sessions(
        where: { expires_at: { _lt: "now()" } }
      ) {
        affected_rows
      }
    }
  `;

  const result = await queryHasura(query);
  
  return res.json({
    success: true,
    deleted: result.delete_community_chat_sessions.affected_rows
  });
}
```

**Or using PostgreSQL pg_cron extension:**

```sql
-- Install pg_cron (if not already)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 2 AM
SELECT cron.schedule(
  'cleanup-expired-chats',
  '0 2 * * *',
  'SELECT cleanup_expired_chat_sessions();'
);
```

## Post-Migration Verification

### Test Queries

**1. Insert a test chat session:**

```graphql
mutation TestInsertChatSession {
  insert_community_chat_sessions_one(
    object: {
      topic: "Test Morning Chat"
      time_of_day: "morning"
      participant_fish_ids: []
      dialogues: {
        messages: [
          {
            fishId: "test-id"
            fishName: "TestFish"
            message: "Hello world!"
            sequence: 1
          }
        ]
      }
      display_duration: 6
    }
  ) {
    id
    topic
    created_at
  }
}
```

**2. Query recent chats:**

```graphql
query GetRecentChats {
  recent_chat_sessions {
    id
    topic
    time_of_day
    message_count
    created_at
  }
}
```

**3. Verify fish table (no battle fields):**

```graphql
query GetFish {
  fish(limit: 5) {
    id
    fish_name
    personality_type
    artist
    upvotes
    created_at
  }
}
```

**4. Check subscription:**

```graphql
query GetUserSubscription {
  user_subscriptions(where: { user_id: { _eq: "your-user-id" } }) {
    user_id
    plan
    is_active
    current_period_end
  }
}
```

## Rollback (If Needed)

If you need to rollback:

```sql
-- Restore from backup
psql -h your-db-host -U your-user -d your-database < backup_YYYYMMDD_HHMMSS.sql

-- Or manually recreate battle tables (not recommended)
```

## Common Issues

### Issue 1: "column does not exist" error

**Solution:** Some battle columns may have already been removed. This is safe to ignore.

### Issue 2: Foreign key constraint errors

**Solution:** Make sure `users` table exists before creating subscriptions table.

### Issue 3: Permission denied

**Solution:** Ensure you're running migration with database admin user.

### Issue 4: Hasura not seeing new tables

**Solution:** 
1. Reload Hasura metadata
2. Manually track tables in Hasura console
3. Clear Hasura cache

## Next Steps

After successful migration:

1. ✅ Mark Phase 1 complete
2. ➡️ Move to Phase 2: COZE AI Integration
3. Create `/api/fish/community-chat.js` endpoint
4. Implement `TankLayoutManager` frontend component
5. Test dialogue generation

## Support

If you encounter issues:
1. Check Hasura console logs
2. Review PostgreSQL error messages
3. Verify all prerequisites are met
4. Check database user permissions

---

**Migration completed?** You're ready for Phase 2: COZE AI Integration! 🚀

