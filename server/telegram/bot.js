import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { pool } from '../db/database.js';
import { initializeQuestsForPlayer } from '../game/quests.js';

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN);

export function initializeBot() {
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
    } catch (error) {
      console.error('Bot error:', error);
      bot.sendMessage(chatId, 'Error starting game. Please try again.');
    }
  });

  // Set bot commands
  bot.setMyCommands([
    { command: 'start', description: 'Start playing the game' }
  ]);

  console.log('Telegram bot initialized');
}

export { bot };
