import express from 'express';
import { pool } from '../db/database.js';
import { verifyTelegramData } from '../middleware/auth.js';

const router = express.Router();

// Get all quests for player
router.get('/', verifyTelegramData, async (req, res) => {
  try {
    const telegramId = req.user.id;

    const playerResult = await pool.query(
      'SELECT id FROM players WHERE telegram_id = $1',
      [telegramId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const result = await pool.query(
      'SELECT * FROM quests WHERE player_id = $1 ORDER BY completed ASC, created_at DESC',
      [playerResult.rows[0].id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Quests error:', error);
    res.status(500).json({ error: 'Failed to get quests' });
  }
});

// Complete quest
router.post('/:questId/complete', verifyTelegramData, async (req, res) => {
  try {
    const { questId } = req.params;
    const telegramId = req.user.id;

    const playerResult = await pool.query(
      'SELECT id FROM players WHERE telegram_id = $1',
      [telegramId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const playerId = playerResult.rows[0].id;

    // Get quest
    const questResult = await pool.query(
      'SELECT * FROM quests WHERE id = $1 AND player_id = $2',
      [questId, playerId]
    );

    if (questResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    const quest = questResult.rows[0];

    if (quest.completed) {
      return res.status(400).json({ error: 'Quest already completed' });
    }

    // Mark quest as completed
    await pool.query(
      'UPDATE quests SET completed = true, completed_at = CURRENT_TIMESTAMP WHERE id = $1',
      [questId]
    );

    // Reward player
    await pool.query(
      `UPDATE players 
       SET gold = gold + $1, experience = experience + $2
       WHERE id = $3`,
      [quest.reward_gold, quest.reward_xp, playerId]
    );

    res.json({ success: true, rewards: { gold: quest.reward_gold, xp: quest.reward_xp } });
  } catch (error) {
    console.error('Quest completion error:', error);
    res.status(500).json({ error: 'Failed to complete quest' });
  }
});

export default router;
