# Deployment Checklist

## Before Deploying

### Local Setup ✓
- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] .env.local file created with all variables
- [ ] Local tests pass (`npm run dev`)
- [ ] Game runs without errors in browser

### Telegram Bot ✓
- [ ] Bot token obtained from @BotFather
- [ ] Bot username available and unique
- [ ] Bot permissions set to receive messages

### Database ✓
- [ ] Neon PostgreSQL account created
- [ ] Database created and connection string copied
- [ ] Connection tested from your machine
- [ ] DATABASE_URL format verified

### Railway Setup ✓
- [ ] Railway account created
- [ ] GitHub repository connected
- [ ] Project created on Railway
- [ ] Build command configured: `npm install && npm run build`
- [ ] Start command configured: `npm start`

### Environment Variables on Railway ✓
- [ ] BOT_TOKEN set correctly
- [ ] BOT_USERNAME set correctly
- [ ] WEBAPP_URL set to Railway domain (will be provided after first deploy)
- [ ] DATABASE_URL set correctly
- [ ] NODE_ENV set to "production"
- [ ] PORT set to "8080"

### Code Ready ✓
- [ ] All files committed to git
- [ ] No sensitive data in code
- [ ] Assets folder included
- [ ] .gitignore configured
- [ ] node_modules in .gitignore

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial Telegram Idle RPG deployment"
   git push origin main
   ```

2. **Monitor Railway Deployment**
   - Railway automatically deploys on push
   - Check logs for any errors
   - Wait for "Deployment succeeded" message

3. **Get Your Railway URL**
   - Copy the deployed URL from Railway dashboard
   - Format: `https://yourapp-production.up.railway.app`

4. **Update Environment Variables**
   - Go to Railway project settings
   - Update WEBAPP_URL with your Railway URL
   - Redeploy project

5. **Configure Bot Webhook** (After Railway URL is confirmed)
   ```bash
   curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_RAILWAY_URL>
   ```

6. **Test the Bot**
   - Search for your bot in Telegram
   - Send `/start` command
   - Click the game button
   - Verify game loads and plays

## Post-Deployment Testing

### Functionality Tests
- [ ] /start command works
- [ ] Game button opens Mini App
- [ ] Character runs and fights enemies
- [ ] HP decreases in combat
- [ ] Gold and XP are awarded
- [ ] Level progression works
- [ ] Equipment can be equipped
- [ ] Quests appear in quest list
- [ ] Can create/join clans
- [ ] Offline rewards calculated on login

### Performance Tests
- [ ] Game loads within 3 seconds
- [ ] No lag during combat
- [ ] Smooth enemy spawning
- [ ] Smooth navigation between screens
- [ ] No console errors

### Database Tests
- [ ] Player data persists after refresh
- [ ] Equipment persists
- [ ] Quest progress saved
- [ ] Offline progress calculated
- [ ] Clan data saved

### Security Tests
- [ ] Cannot modify stats via console
- [ ] Cannot cheat gold/XP values
- [ ] Player can only see own data
- [ ] Telegram verification working
- [ ] Database queries protected from SQL injection

## Troubleshooting Checklist

If something doesn't work:

- [ ] Check Railway logs for errors
- [ ] Verify all environment variables in Railway
- [ ] Test bot token: `curl https://api.telegram.org/bot<TOKEN>/getMe`
- [ ] Verify database connection from Railway
- [ ] Check WEBAPP_URL is correct
- [ ] Verify all files are deployed
- [ ] Check browser console for frontend errors
- [ ] Verify CORS settings
- [ ] Check Telegram API rate limits

## Performance Monitoring

After deployment, monitor:
- Railway resource usage (CPU, Memory)
- Database connection pool
- API response times
- Error logs
- Player count

## Success Criteria

✅ Bot responds to /start immediately
✅ Game loads in 2-3 seconds
✅ Combat works without lag
✅ All data persists correctly
✅ No errors in logs
✅ Database queries are efficient

---

Once all checks pass, your game is ready for players! 🎮
