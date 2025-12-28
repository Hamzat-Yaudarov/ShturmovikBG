import express from 'express';
import { pool } from '../db/database.js';
import { verifyTelegramData } from '../middleware/auth.js';
import { calculateOfflineProgress } from '../game/offlineProgress.js';
import { getPlayerState, updatePlayerState } from '../game/gameState.js';

const router = express.Router();

// Get current game state
router.post('/state', verifyTelegramData, async (req, res) => {
  try {
    const telegramId = req.user.id;

    // Get player data
    const playerResult = await pool.query(
      'SELECT * FROM players WHERE telegram_id = $1',
      [telegramId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const player = playerResult.rows[0];

    // Calculate offline progress
    const offlineRewards = await calculateOfflineProgress(player.id);

    // Update player with offline rewards
    const updatedPlayer = await updatePlayerState(player.id, offlineRewards);

    // Get equipment
    const equipmentResult = await pool.query(
      'SELECT * FROM equipment WHERE player_id = $1 AND equipped = true',
      [player.id]
    );

    const gameState = {
      character: {
        id: updatedPlayer.id,
        level: updatedPlayer.level,
        experience: updatedPlayer.experience,
        hp: updatedPlayer.hp,
        maxHp: updatedPlayer.max_hp,
        atk: updatedPlayer.atk,
        def: updatedPlayer.def,
        attackSpeed: updatedPlayer.attack_speed
      },
      resources: {
        gold: updatedPlayer.gold,
        experience: updatedPlayer.experience
      },
      location: updatedPlayer.current_location,
      equipment: equipmentResult.rows,
      offlineRewards: offlineRewards,
      lastLogin: updatedPlayer.last_login
    };

    // Update last login
    await pool.query(
      'UPDATE players SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [player.id]
    );

    res.json(gameState);
  } catch (error) {
    console.error('Game state error:', error);
    res.status(500).json({ error: 'Failed to get game state' });
  }
});

// Change location
router.post('/location', verifyTelegramData, async (req, res) => {
  try {
    const { location } = req.body;
    const telegramId = req.user.id;

    const validLocations = ['forest', 'ruins'];
    if (!validLocations.includes(location)) {
      return res.status(400).json({ error: 'Invalid location' });
    }

    await pool.query(
      'UPDATE players SET current_location = $1 WHERE telegram_id = $2',
      [location, telegramId]
    );

    res.json({ success: true, location });
  } catch (error) {
    console.error('Location error:', error);
    res.status(500).json({ error: 'Failed to change location' });
  }
});

// Handle combat result
router.post('/combat', verifyTelegramData, async (req, res) => {
  try {
    const { enemyName, playerDamage, enemyDamage, playerHpAfter, experienceGained, goldGained, isCrit } = req.body;
    const telegramId = req.user.id;

    const playerResult = await pool.query(
      'SELECT id FROM players WHERE telegram_id = $1',
      [telegramId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const playerId = playerResult.rows[0].id;

    // Update player stats
    await pool.query(
      `UPDATE players
       SET experience = experience + $1,
           gold = gold + $2,
           hp = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [experienceGained, goldGained, playerHpAfter, playerId]
    );

    // Log combat
    await pool.query(
      `INSERT INTO combat_log (player_id, enemy_name, player_damage, enemy_damage, player_hp_after, experience_gained, gold_gained, is_crit)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [playerId, enemyName, playerDamage, enemyDamage, playerHpAfter, experienceGained, goldGained, isCrit]
    );

    // Update quest progress (enemy kill)
    await pool.query(
      `UPDATE quests
       SET progress = LEAST(progress + 1, target)
       WHERE player_id = $1 AND quest_type = 'kill_enemies' AND completed = false`,
      [playerId]
    );

    // Update quest progress (gold earned)
    if (goldGained > 0) {
      await pool.query(
        `UPDATE quests
         SET progress = LEAST(progress + $1, target)
         WHERE player_id = $2 AND quest_type = 'earn_gold' AND completed = false`,
        [goldGained, playerId]
      );
    }

    // Get updated player
    const updatedPlayer = await pool.query(
      'SELECT level, experience, hp, max_hp, gold FROM players WHERE id = $1',
      [playerId]
    );

    res.json({ success: true, player: updatedPlayer.rows[0] });
  } catch (error) {
    console.error('Combat error:', error);
    res.status(500).json({ error: 'Failed to process combat' });
  }
});

export default router;
