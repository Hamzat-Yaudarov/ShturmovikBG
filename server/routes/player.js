import express from 'express';
import { pool } from '../db/database.js';
import { verifyTelegramData } from '../middleware/auth.js';

const router = express.Router();

// Get player profile
router.get('/profile', verifyTelegramData, async (req, res) => {
  try {
    const telegramId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM players WHERE telegram_id = $1',
      [telegramId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const player = result.rows[0];

    // Get clan info
    let clanInfo = null;
    if (player.clan_id) {
      const clanResult = await pool.query(
        'SELECT id, name, level, gold_bonus_percent, xp_bonus_percent FROM clans WHERE id = $1',
        [player.clan_id]
      );
      clanInfo = clanResult.rows[0];
    }

    res.json({
      ...player,
      clan: clanInfo
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Get player equipment
router.get('/equipment', verifyTelegramData, async (req, res) => {
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
      'SELECT * FROM equipment WHERE player_id = $1 ORDER BY equipped DESC',
      [playerResult.rows[0].id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Equipment error:', error);
    res.status(500).json({ error: 'Failed to get equipment' });
  }
});

// Upgrade player stat
router.post('/upgrade', verifyTelegramData, async (req, res) => {
  try {
    const { stat } = req.body;
    const telegramId = req.user.id;

    const validStats = ['atk', 'def', 'hp'];
    if (!validStats.includes(stat)) {
      return res.status(400).json({ error: 'Invalid stat' });
    }

    const playerResult = await pool.query(
      'SELECT * FROM players WHERE telegram_id = $1',
      [telegramId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const player = playerResult.rows[0];

    // Calculate upgrade cost (base 100 gold, scales with level)
    const upgradeCost = 100 * player.level;

    if (player.gold < upgradeCost) {
      return res.status(400).json({ error: 'Insufficient gold', requiredGold: upgradeCost });
    }

    // Upgrade stat based on type
    let statIncrease = 0;
    if (stat === 'atk') {
      statIncrease = 5 + Math.floor(player.level / 5);
    } else if (stat === 'def') {
      statIncrease = 3 + Math.floor(player.level / 7);
    } else if (stat === 'hp') {
      statIncrease = 50 + player.level * 2;
    }

    // Update player
    const updateQuery = stat === 'atk'
      ? 'UPDATE players SET atk = atk + $1, gold = gold - $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *'
      : stat === 'def'
      ? 'UPDATE players SET def = def + $1, gold = gold - $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *'
      : 'UPDATE players SET max_hp = max_hp + $1, hp = hp + $1, gold = gold - $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *';

    const result = await pool.query(updateQuery, [statIncrease, upgradeCost, player.id]);

    res.json({ success: true, player: result.rows[0] });
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ error: 'Failed to upgrade stat' });
  }
});

// Equip item
router.post('/equip', verifyTelegramData, async (req, res) => {
  try {
    const { itemId } = req.body;
    const telegramId = req.user.id;

    const playerResult = await pool.query(
      'SELECT id FROM players WHERE telegram_id = $1',
      [telegramId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const playerId = playerResult.rows[0].id;

    // Get item to equip
    const itemResult = await pool.query(
      'SELECT * FROM equipment WHERE id = $1 AND player_id = $2',
      [itemId, playerId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = itemResult.rows[0];

    // Unequip other items of same type
    await pool.query(
      'UPDATE equipment SET equipped = false WHERE player_id = $1 AND item_type = $2',
      [playerId, item.item_type]
    );

    // Equip new item
    await pool.query(
      'UPDATE equipment SET equipped = true WHERE id = $1',
      [itemId]
    );

    // Recalculate player stats
    const statsResult = await pool.query(
      `SELECT 
        COALESCE(SUM(atk_bonus), 0) as total_atk,
        COALESCE(SUM(def_bonus), 0) as total_def,
        COALESCE(SUM(hp_bonus), 0) as total_hp
       FROM equipment WHERE player_id = $1 AND equipped = true`,
      [playerId]
    );

    const equipment = statsResult.rows[0];

    // Update player base stats + equipment bonuses
    const baseStats = { atk: 10, def: 5, hp: 100 };
    await pool.query(
      'UPDATE players SET atk = $1, def = $2, max_hp = $3 WHERE id = $4',
      [
        baseStats.atk + equipment.total_atk,
        baseStats.def + equipment.total_def,
        baseStats.hp + equipment.total_hp,
        playerId
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Equip error:', error);
    res.status(500).json({ error: 'Failed to equip item' });
  }
});

export default router;
