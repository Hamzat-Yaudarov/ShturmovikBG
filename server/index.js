import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeBot } from './telegram/bot.js';
import { initDatabase } from './db/database.js';
import gameRoutes from './routes/game.js';
import playerRoutes from './routes/player.js';
import questRoutes from './routes/quests.js';
import clanRoutes from './routes/clans.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.WEBAPP_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Serve static files from dist folder (built frontend)
app.use(express.static(join(__dirname, '../dist'), {
  maxAge: '1d',
  etag: false
}));

// Middleware to ensure database is initialized before API calls
app.use('/api', async (req, res, next) => {
  await initDatabase();
  next();
});

// Initialize database (non-blocking)
initDatabase().catch(err => {
  console.error('Initial database initialization failed:', err.message);
  console.log('Will retry on first API request...');
});

// Initialize Telegram bot
initializeBot();

// Routes
app.use('/api/game', gameRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/clans', clanRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback - serve index.html for all non-API routes
// This allows React Router to handle routing on the client
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✓ Server running on port ${PORT}`);
  console.log(`✓ Mini App URL: ${process.env.WEBAPP_URL}\n`);
});
