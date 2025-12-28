# 🚀 Railway Environment Variables Setup

Your app is deployed, but it's crashing because **environment variables are not set on Railway**.

## Current Status
✅ Build succeeds  
❌ App crashes on startup - missing:
- `BOT_TOKEN` 
- `DATABASE_URL`
- `WEBAPP_URL`

## Quick Fix (5 minutes)

### Step 1: Go to Your Railway Dashboard

1. Open https://railway.app
2. Log in with your account
3. Click your **project** (telegram-idle-rpg)
4. Click the **Settings** tab

### Step 2: Add Environment Variables

Look for the **Environment** or **Variables** section.

Click **+ Add Variable** for each of these:

#### Variable 1: BOT_TOKEN
| Key | Value |
|-----|-------|
| `BOT_TOKEN` | `8583073668:AAFs22qlCKekb0rWifTRLF1Y1r4atZKSR_4` |

#### Variable 2: BOT_USERNAME
| Key | Value |
|-----|-------|
| `BOT_USERNAME` | `cryptoladderbot` |

#### Variable 3: DATABASE_URL
| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_SGpiYWIx8mu0@ep-odd-mountain-ag1uo1g2-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |

**⚠️ IMPORTANT:** Make sure you have `&` not `&amp;` in the DATABASE_URL

#### Variable 4: WEBAPP_URL
| Key | Value |
|-----|-------|
| `WEBAPP_URL` | `https://shturmovikbg-production.up.railway.app` |

#### Variable 5: NODE_ENV
| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |

#### Variable 6: PORT
| Key | Value |
|-----|-------|
| `PORT` | `8080` |

### Step 3: Save and Redeploy

1. After adding all variables, click **Save**
2. Go to the **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Wait for deployment to complete

### Step 4: Verify

Watch the logs - you should see:

```
✓ Telegram bot initialized
✓ Server running on port 8080
✓ Mini App URL: https://shturmovikbg-production.up.railway.app
```

If you see this, **congratulations! 🎉 Your app is working!**

## Troubleshooting

### Still seeing "DATABASE_URL not set"?
- Double-check you pasted the entire connection string
- Make sure `&` is there (not `&amp;`)
- Click Save after adding

### Still seeing "Telegram Bot Token not provided"?
- Verify you copied the token correctly from @BotFather
- It should start with numbers and contain a colon
- Check for extra spaces at the beginning/end

### Variables don't seem to be applied?
- Click **Redeploy** after saving variables
- Railway doesn't automatically restart - you must redeploy

## Find Your Values

If you need to find your credentials again:

**BOT_TOKEN:**
- Open Telegram
- Message @BotFather
- Select `/mybots`
- Select your bot
- Select "API Token"
- Copy the token

**DATABASE_URL:**
- Go to https://console.neon.tech
- Select your project
- Click your database name
- Click "Connection string" or "Connection details"
- Copy the full connection string
- Select "Pooled connection" (recommended)

**WEBAPP_URL:**
- After deployment succeeds on Railway, it shows at the top
- Format: `https://yourapp-production.up.railway.app`
- Check your Railway project page for the exact URL

## What Happens Next

Once variables are set:

1. Railway redeploys the app (2-3 minutes)
2. App connects to your Neon database
3. Bot starts accepting /start commands
4. Mini App opens when users click the button

## Still Not Working?

Check the Railway logs:
1. Open your Railway project
2. Click the **Logs** tab
3. Look for errors
4. Common issues:
   - `DATABASE_URL` connection failed → Check credentials
   - `BOT_TOKEN` invalid → Check token format
   - `ECONNREFUSED` → Usually means DATABASE_URL is wrong

---

**That's it! Once variables are set, your game goes live.** 🎮
