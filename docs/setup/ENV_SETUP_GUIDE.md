# Environment Variables Setup Guide

## Required Environment Variables

### 1. COZE AI (Community Chat System) - **REQUIRED**

```env
COZE_API_KEY=your-coze-api-key-here
COZE_BOT_ID=your-bot-id-here
```

**How to get:**
1. Go to https://www.coze.com/
2. Create an account / sign in
3. Create a new bot
4. Copy the Bot ID
5. Generate an API key in settings

### 2. Hasura GraphQL - **REQUIRED**

```env
HASURA_ENDPOINT=https://your-project.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-hasura-admin-secret-here
```

**How to get:**
- Hasura Cloud dashboard → Your Project → Settings
- Endpoint URL and admin secret

### 3. Supabase - **REQUIRED**

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_STORAGE_BUCKET=fish-images
```

**How to get:**
- Supabase dashboard → Settings → API
- Copy URL and anon/public key

---

## Optional Variables (For Future Phases)

### Stripe (Phase 4 - Subscription System)

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Redis Caching (Performance Optimization)

```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

---

## Setup Instructions

### Local Development

1. Create `.env` file in project root:
```bash
touch .env
```

2. Add required variables:
```env
COZE_API_KEY=your_key
COZE_BOT_ID=your_bot_id
HASURA_ENDPOINT=your_endpoint
HASURA_ADMIN_SECRET=your_secret
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_STORAGE_BUCKET=fish-images
```

3. Start development server:
```bash
vercel dev
# or
npm run dev
```

### Vercel Deployment

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add each variable:
   - Name: `COZE_API_KEY`
   - Value: your actual API key
   - Environments: Production, Preview, Development

### Testing Configuration

Run this in browser console on `tank.html`:
```javascript
// Test if managers initialized
console.log('Layout Manager exists:', typeof tankLayoutManager !== 'undefined');
console.log('Chat Manager exists:', typeof communityChatManager !== 'undefined');

// Test API endpoint
fetch('/api/fish/community-chat', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    participants: [{
      fishId: 'test-1',
      name: 'TestFish',
      personality: 'cheerful'
    }]
  })
}).then(r => r.json()).then(console.log);
```

---

## Troubleshooting

### "COZE_API_KEY environment variable is not set"
- Check .env file exists
- Verify variable name is correct (no typos)
- Restart development server after adding variables
- For Vercel: check deployment logs

### "Failed to generate community chat"
- Verify COZE_API_KEY is valid
- Check COZE_BOT_ID matches your bot
- Look at browser network tab for API errors
- Check Vercel function logs

### "Hasura query failed"
- Verify HASURA_ENDPOINT is correct
- Check HASURA_ADMIN_SECRET matches
- Ensure database migration has been run
- Check Hasura console for table permissions

---

## Environment-Specific Settings

### Development
```env
NODE_ENV=development
DEBUG=true
CHAT_AUTO_INTERVAL_MINUTES=1  # Faster for testing
```

### Production
```env
NODE_ENV=production
DEBUG=false
CHAT_AUTO_INTERVAL_MINUTES=5  # Normal cadence
```

---

## Security Best Practices

✅ **DO:**
- Keep .env in .gitignore
- Use different API keys for dev/prod
- Rotate secrets regularly
- Use environment-specific values

❌ **DON'T:**
- Commit .env to git
- Share API keys publicly
- Use production keys in development
- Hardcode secrets in code

---

## Cost Monitoring

### COZE API Usage
- Monitor at: COZE dashboard → Usage
- Each chat: ~5-8 API calls
- Estimated: $0.002 per chat
- With 1 chat/5min: ~$17/month

### Recommendations:
- Start with lower frequency (10-15 min)
- Use fallback dialogues more
- Implement caching (Phase 8)
- Monitor costs weekly

---

## Template .env File

```env
# REQUIRED
COZE_API_KEY=
COZE_BOT_ID=
HASURA_ENDPOINT=
HASURA_ADMIN_SECRET=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_STORAGE_BUCKET=fish-images

# OPTIONAL (Future phases)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# SETTINGS
NODE_ENV=development
CHAT_AUTO_INTERVAL_MINUTES=5
CHAT_MESSAGE_INTERVAL_MS=6000
```

---

## Quick Start Checklist

- [ ] Create .env file
- [ ] Add COZE API credentials
- [ ] Add Hasura credentials  
- [ ] Add Supabase credentials
- [ ] Run database migration
- [ ] Start development server
- [ ] Test on tank.html
- [ ] Check browser console for errors
- [ ] Verify dialogues appear

---

**Need Help?** Check the console logs - they will tell you exactly which environment variable is missing!

