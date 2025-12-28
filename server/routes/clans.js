import express from 'express';
import { pool } from '../db/database.js';
import { verifyTelegramData } from '../middleware/auth.js';

const router = express.Router();

// Create clan
router.post('/create', verifyTelegramData, async (req, res) => {
  try {
    const { clanName } = req.body;
    const telegramId = req.user.id;

    if (!clanName || clanName.length < 3) {
      return res.status(400).json({ error: 'Clan name must be at least 3 characters' });
    }

    const playerResult = await pool.query(
      'SELECT id FROM players WHERE telegram_id = $1',
      [telegramId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const playerId = playerResult.rows[0].id;

    // Check if player is already in a clan
    const playerClanResult = await pool.query(
      'SELECT clan_id FROM players WHERE id = $1',
      [playerId]
    );

    if (playerClanResult.rows[0].clan_id) {
      return res.status(400).json({ error: 'Already in a clan' });
    }

    // Create clan
    const clanResult = await pool.query(
      'INSERT INTO clans (name, leader_id) VALUES ($1, $2) RETURNING *',
      [clanName, playerId]
    );

    const clan = clanResult.rows[0];

    // Add player to clan
    await pool.query(
      'UPDATE players SET clan_id = $1 WHERE id = $2',
      [clan.id, playerId]
    );

    await pool.query(
      'INSERT INTO clan_members (clan_id, player_id, role) VALUES ($1, $2, $3)',
      [clan.id, playerId, 'leader']
    );

    res.json({ success: true, clan });
  } catch (error) {
    console.error('Clan creation error:', error);
    res.status(500).json({ error: 'Failed to create clan' });
  }
});

// Join clan
router.post('/join', verifyTelegramData, async (req, res) => {
  try {
    const { clanId } = req.body;
    const telegramId = req.user.id;

    const playerResult = await pool.query(
      'SELECT id FROM players WHERE telegram_id = $1',
      [telegramId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const playerId = playerResult.rows[0].id;

    // Check if clan exists
    const clanResult = await pool.query(
      'SELECT * FROM clans WHERE id = $1',
      [clanId]
    );

    if (clanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clan not found' });
    }

    // Check if player is already in a clan
    const playerClanResult = await pool.query(
      'SELECT clan_id FROM players WHERE id = $1',
      [playerId]
    );

    if (playerClanResult.rows[0].clan_id) {
      return res.status(400).json({ error: 'Already in a clan' });
    }

    // Add player to clan
    await pool.query(
      'UPDATE players SET clan_id = $1 WHERE id = $2',
      [clanId, playerId]
    );

    await pool.query(
      'INSERT INTO clan_members (clan_id, player_id) VALUES ($1, $2)',
      [clanId, playerId]
    );

    // Update clan member count
    await pool.query(
      'UPDATE clans SET member_count = member_count + 1 WHERE id = $1',
      [clanId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Clan join error:', error);
    res.status(500).json({ error: 'Failed to join clan' });
  }
});

// Get clan info
router.get('/:clanId', async (req, res) => {
  try {
    const { clanId } = req.params;

    const clanResult = await pool.query(
      'SELECT * FROM clans WHERE id = $1',
      [clanId]
    );

    if (clanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clan not found' });
    }

    const clan = clanResult.rows[0];

    // Get members
    const membersResult = await pool.query(
      `SELECT p.id, p.username, p.level, cm.role
       FROM clan_members cm
       JOIN players p ON cm.player_id = p.id
       WHERE cm.clan_id = $1
       ORDER BY cm.role DESC`,
      [clanId]
    );

    res.json({
      ...clan,
      members: membersResult.rows
    });
  } catch (error) {
    console.error('Clan info error:', error);
    res.status(500).json({ error: 'Failed to get clan info' });
  }
});

export default router;
