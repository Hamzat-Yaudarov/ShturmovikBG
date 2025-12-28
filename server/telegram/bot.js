import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { pool } from '../db/database.js';
import { initializeQuestsForPlayer } from '../game/quests.js';

dotenv.config();

let bot = null;

export function initializeBot() {
  // Check if BOT_TOKEN is available
  if (!process.env.BOT_TOKEN) {
    console.error('🔴 CRITICAL: BOT_TOKEN environment variable not set');
    console.error('📌 Please add BOT_TOKEN to your Railway project settings');
    console.error('📌 Get your token from @BotFather on Telegram');
    console.log('⏸️ Bot initialization skipped - set BOT_TOKEN and redeploy');
    return;
  }

  try {
    bot = new TelegramBot(process.env.BOT_TOKEN);
  } catch (error) {
    console.error('🔴 Failed to initialize Telegram bot:', error.message);
    console.log('⏸️ Bot will not be available');
    return;
  }

  // Handle /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;

    try {
      // Check if player exists, if not create
      let result = await pool.query(
        'SELECT id FROM players WHERE telegram_id = $1',
        [telegramId]
      );

      let playerId;
      if (result.rows.length === 0) {
        // Create new player
        const insertResult = await pool.query(
          'INSERT INTO players (telegram_id, username) VALUES ($1, $2) RETURNING id',
          [telegramId, username]
        );
        playerId = insertResult.rows[0].id;

        // Initialize quests for new player
        await initializeQuestsForPlayer(playerId);
      } else {
        playerId = result.rows[0].id;
      }

      // Send welcome message with game button
      const keyboard = {
        inline_keyboard: [
          [
            {
              text: '🎮 Play Game',
              web_app: { url: process.env.WEBAPP_URL }
            }
          ]
        ]
      };

      if (bot) {
        bot.sendMessage(
          chatId,
          `👋 Welcome to Idle RPG, ${username}!\n\n` +
          `🏃 Your character runs and fights automatically\n` +
          `💎 Collect loot and level up\n` +
          `📈 Progress even when offline\n` +
          `👥 Join a clan with your friends\n\n` +
          `Tap the button below to start your adventure!`,
          { reply_markup: keyboard }
        );
      }
    } catch (error) {
      console.error('Bot error:', error);
      if (bot) {
        bot.sendMessage(chatId, 'Error starting game. Please try again.');
      }
    }
  });

  // Set bot commands
  if (bot) {
    try {
      bot.setMyCommands([
        { command: 'start', description: 'Start playing the game' }
      ]);
      console.log('✓ Telegram bot initialized');
    } catch (error) {
      console.error('Failed to set bot commands:', error.message);
    }
  }
}

export { bot };
