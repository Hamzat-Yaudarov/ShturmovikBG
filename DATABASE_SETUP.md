# 🚨 CRITICAL: Database Connection Setup

## The Problem

Your Railway deployment is failing because the `DATABASE_URL` environment variable is not set or is incorrectly formatted.

The app was trying to connect to `localhost:5432` (local PostgreSQL) instead of your Neon database.

## Quick Fix for Railway Deployment

### Step 1: Fix the DATABASE_URL Format

**⚠️ IMPORTANT:** If you copied your DATABASE_URL from a web form, it may have `&amp;` instead of `&`

**❌ WRONG:**
```
postgresql://neondb_owner:npg_SGpiYWIx8mu0@ep-odd-mountain-ag1uo1g2-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&amp;channel_binding=require
```

**✅ CORRECT:**
```
postgresql://neondb_owner:npg_SGpiYWIx8mu0@ep-odd-mountain-ag1uo1g2-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Notice: `&amp;` → `&` (just one ampersand, not `&amp;`)

### Step 2: Set on Railway

1. Go to your Railway project dashboard
2. Click **Settings** → **Environment** (or Variables)
3. Add/update these variables:

| Variable | Value |
|----------|-------|
| `BOT_TOKEN` | Your bot token from @BotFather |
| `BOT_USERNAME` | Your bot username |
| `WEBAPP_URL` | `https://yourapp-production.up.railway.app` (Railway will provide this) |
| `DATABASE_URL` | Your corrected Neon connection string (with `&` not `&amp;`) |
| `NODE_ENV` | `production` |
| `PORT` | `8080` |

### Step 3: Redeploy

1. Push your changes to GitHub:
```bash
git add .
git commit -m "Fix: Add database error handling and logging"
git push origin main
```

2. Railway will automatically redeploy
3. Watch the logs for: `✓ Database connected:`

## Verify Database Connection

After deployment, check Railway logs for one of these:

### ✅ SUCCESS
```
✓ DATABASE_URL is configured
✓ Database connected: { now: '2024-...' }
✓ Database tables initialized
✓ Server running on port 8080
```

### ❌ FAILURE
```
⚠️ WARNING: DATABASE_URL environment variable not set
✗ Database connection error: ...
```

If you see the failure message, return to Step 1-2 and verify the DATABASE_URL is set correctly.

## Test the Connection Locally

Before redeploying, test locally:

```bash
# Create .env.local with the correct DATABASE_URL
# Then run:
npm run dev

# You should see:
# ✓ Database connected: { now: '2024-...' }
```

## Common Issues

### Issue: `ECONNREFUSED 127.0.0.1:5432`
**Cause:** DATABASE_URL is not set  
**Fix:** Set DATABASE_URL environment variable on Railway

### Issue: `SSL certificate problem`
**Cause:** SSL not configured for Neon  
**Fix:** Use `sslmode=require` in connection string (already in your URL)

### Issue: `FATAL: password authentication failed`
**Cause:** Wrong password or username in connection string  
**Fix:** Double-check your Neon credentials

### Issue: `Could not translate host name to address`
**Cause:** Wrong host URL in connection string  
**Fix:** Copy the connection string directly from Neon dashboard

## Get Your Correct CONNECTION STRING

1. Go to **https://console.neon.tech**
2. Select your project
3. Click your database
4. Click **Connection string**
5. Select **Pooled connection** (recommended for serverless)
6. Copy the full string
7. **Make sure there are no `&amp;` - replace with `&` if needed**

---

Once DATABASE_URL is correctly set on Railway, the app will deploy successfully! 🚀
