# 🔧 Environment Variables Setup Guide

This document lists all environment variables needed for the Fish Art Community Chat System.

## 📋 Required Variables

### 1. COZE AI Configuration (Community Chat)

```bash
COZE_API_KEY=your_coze_api_key_here
COZE_BOT_ID=your_coze_bot_id_here
```

**How to get:**
1. Visit [COZE Developer Console](https://www.coze.com/open/docs/developer)
2. Create an account and create a bot
3. Copy your API key and Bot ID

**Purpose:** Generate AI fish dialogues for the community chat feature.

---

### 2. Supabase Configuration

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

**How to get:**
1. Visit [Supabase Dashboard](https://app.supabase.com/project/_/settings/api)
2. Navigate to Project Settings → API
3. Copy your project URL and API keys

**Purpose:** User authentication and authorization.

---

### 3. Hasura Configuration

```bash
HASURA_GRAPHQL_ADMIN_SECRET=your_hasura_admin_secret_here
HASURA_GRAPHQL_ENDPOINT=https://your-hasura-endpoint.hasura.app/v1/graphql
```

**How to get:**
1. From your Hasura Cloud project settings
2. Or from your self-hosted Hasura instance

**Purpose:** GraphQL API for fish data, chat sessions, and subscriptions.

---

### 4. Qiniu Cloud Storage

```bash
QINIU_ACCESS_KEY=your_qiniu_access_key_here
QINIU_SECRET_KEY=your_qiniu_secret_key_here
QINIU_BUCKET=your_bucket_name
QINIU_DOMAIN=https://cdn.your-domain.com
```

**How to get:**
1. Create account at [Qiniu Cloud](https://www.qiniu.com/)
2. Create a storage bucket
3. Get access keys from account settings

**Purpose:** Store and serve fish images via CDN.

---

### 5. Upstash Redis (Optional but Recommended)

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
```

**How to get:**
1. Create account at [Upstash](https://console.upstash.com/)
2. Create a Redis database
3. Copy REST URL and token from database details

**Purpose:** Cache COZE API responses and reduce costs.

---

## 💳 Optional: Stripe Configuration

*Only needed if you want to enable subscription payments*

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_plan_id
STRIPE_YEARLY_PRICE_ID=price_your_yearly_plan_id
```

**How to get:**
1. Create account at [Stripe](https://dashboard.stripe.com/register)
2. Get API keys from Developers → API keys
3. Create products and prices in Products section
4. Set up webhook endpoint and get webhook secret

**Purpose:** Handle subscription payments for premium features.

---

## 🔨 Setup Instructions

### For Local Development

1. Create a `.env.local` file in the project root:

```bash
cp ENV_SETUP.md .env.local
# Edit .env.local and fill in your values
```

2. For Vercel (recommended):

```bash
# .env.local is automatically loaded
vercel dev
```

3. For Next.js:

```bash
# .env.local is automatically loaded
npm run dev
```

---

### For Production (Vercel Deployment)

1. Go to your Vercel project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable one by one
4. Redeploy your application

**Important:** Never commit `.env` files to Git!

---

## 🧪 Testing Without COZE AI

If you don't have a COZE API key yet, the system will automatically use **fallback dialogues**:

```javascript
// lib/coze-client.js provides fallback messages
generateFallbackDialogue(participants)
```

This allows you to test the community chat feature without requiring COZE API credentials.

---

## 📊 Priority Order

**Essential for basic functionality:**
1. ✅ Supabase (Authentication)
2. ✅ Hasura (Database/GraphQL)
3. ✅ Qiniu (Image Storage)

**For Community Chat:**
4. 🤖 COZE AI (AI Dialogues) - Falls back to static messages
5. 💾 Upstash Redis (Caching) - Optional but recommended

**For Monetization:**
6. 💳 Stripe (Subscriptions) - Only if you want payments

---

## 🐛 Troubleshooting

### COZE API Errors

```bash
Error: COZE_API_KEY environment variable is not set
```

**Solution:** Add COZE_API_KEY to your `.env.local` file

### Hasura Connection Errors

```bash
Error: field 'fish_name' not found
```

**Solution:** Run the database migration script (`scripts/migrate-complete-community-system.sql`)

### Supabase Auth Errors

```bash
Error: Invalid login credentials
```

**Solution:** Create a test user in Supabase Dashboard → Authentication → Users

---

## 📝 Notes

- All variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Use `sk_test_` keys for Stripe testing, `sk_live_` for production
- COZE AI quota: Check your plan limits to avoid overage
- Upstash Redis: Free tier includes 10K commands/day

---

## 🔗 Useful Links

- [COZE API Documentation](https://www.coze.com/open/docs/developer)
- [Supabase Documentation](https://supabase.com/docs)
- [Hasura Documentation](https://hasura.io/docs/)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

