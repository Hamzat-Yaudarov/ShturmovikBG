# Telegram Idle RPG - Setup & Deployment Guide

## Prerequisites

You'll need:
- Node.js 18+ installed
- A Telegram Bot Token (from @BotFather)
- A Neon PostgreSQL database
- A Railway account for hosting
- Git for version control

## Step 1: Get Your Telegram Bot Token

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` and follow the instructions
3. Copy your bot token (looks like: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

## Step 2: Setup Your Database

### Using Neon (PostgreSQL)

1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy your connection string (DATABASE_URL)
4. Example: `postgresql://user:password@host:port/database`

## Step 3: Clone and Setup Project Locally

```bash
# Clone the repository
git clone <your-repo-url>
cd telegram-idle-rpg

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your credentials:
# BOT_TOKEN=your_bot_token_here
# BOT_USERNAME=your_bot_username
# WEBAPP_URL=http://localhost:5173  # For local testing
# DATABASE_URL=your_neon_connection_string
# NODE_ENV=development
# PORT=3000
```

## Step 4: Test Locally

```bash
# Start both backend and frontend in development
npm run dev

# Backend will run on http://localhost:3000
# Frontend will run on http://localhost:5173

# Test the bot: @YourBotUsername /start
# You should see a button to open the game
```

## Step 5: Deploy to Railway

### Setup Railway Project

1. Go to https://railway.app and log in
2. Click "New Project" → "Deploy from GitHub"
3. Connect your GitHub repository
4. Railway will auto-detect the Node.js app

### Configure Environment Variables on Railway

In Railway's project settings, add these variables:

```
BOT_TOKEN=your_telegram_bot_token
BOT_USERNAME=your_bot_username
WEBAPP_URL=https://your-railway-app.up.railway.app
DATABASE_URL=your_neon_connection_string
NODE_ENV=production
PORT=8080
```

### Build Command
```
npm install && npm run build
```

### Start Command
```
npm start
```

### Important: Update Bot Webhook

After Railway deploys, your bot needs to know the correct webhook URL:

1. Run this command in any terminal (replace with your values):
```bash
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_RAILWAY_URL>/webhook
```

Example:
```bash
curl -X POST https://api.telegram.org/bot123456:ABC-DEF1234/setWebhook?url=https://myapp-production.up.railway.app/webhook
```

### Update Mini App URL in Bot Settings

1. Talk to @BotFather in Telegram
2. Select your bot
3. Go to "Bot Settings" → "Menu button"
4. Set the URL to your Railway app URL

## Step 6: Test Deployment

1. Open Telegram and search for your bot (@BotUsername)
2. Send `/start` command
3. Click the "🎮 Play Game" button
4. The game should load in the Telegram Mini App

## Game Features Checklist

- ✅ Auto-running character with automatic combat
- ✅ 2 locations (Forest, Ruins) with 8 enemy types
- ✅ Character stats: HP, ATK, DEF, Attack Speed
- ✅ Level progression with XP
- ✅ Equipment system (Weapon, Armor, Artifact)
- ✅ Rarity system (Common, Rare, Epic)
- ✅ Offline progression (up to 8 hours)
- ✅ Quest system (game + Telegram quests)
- ✅ Clan system with bonuses
- ✅ Combat calculations with critical hits
- ✅ Telegram Mini App integration

## Troubleshooting

### Bot doesn't respond to /start
- Check BOT_TOKEN is correct
- Verify bot is running on Railway
- Check Railway logs for errors

### Game doesn't load
- Verify WEBAPP_URL in environment variables
- Check browser console for errors
- Ensure DATABASE_URL is correct and database is initialized

### Database connection errors
- Test connection string in Neon dashboard
- Verify DATABASE_URL in Railway settings
- Check if database tables are created (should happen automatically)

### Combat not registering
- Check server logs on Railway
- Verify authentication middleware is working
- Check Telegram init data is being sent correctly

## Performance Tips

1. **Sprite Loading**: All sprites are cached after first load
2. **Database**: Neon handles connection pooling automatically
3. **API Calls**: Game state is refreshed every 30 seconds
4. **Offline Rewards**: Calculated server-side for security

## Security Notes

- ✅ All combat calculations happen server-side
- ✅ Player stats cannot be manipulated from client
- ✅ Telegram signature verification on all API calls
- ✅ SQL injection protection with parameterized queries
- ✅ CORS configured for Mini App security

## Next Steps (Future Enhancements)

- PvP Arena battles
- Boss encounters
- Reincarnation system
- Premium currency
- New locations
- Equipment enchanting
- Trading system

## Support

If you encounter issues:

1. Check Railway logs: Open your project → "View Logs"
2. Check server console output
3. Verify all environment variables are set correctly
4. Ensure Neon database is accessible
5. Test bot token with: `curl https://api.telegram.org/bot<TOKEN>/getMe`

## Resources

- Telegram Bot API: https://core.telegram.org/bots/api
- Telegram Mini Apps: https://core.telegram.org/bots/webapps
- Neon Database: https://neon.tech/docs
- Railway Docs: https://docs.railway.app
- Phaser Framework: https://phaser.io/
