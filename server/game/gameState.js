import { pool } from '../db/database.js';

const LEVEL_UP_THRESHOLD = 100; // XP needed per level

/**
 * Get player state with proper calculations
 */
export async function getPlayerState(playerId) {
  const result = await pool.query(
    'SELECT * FROM players WHERE id = $1',
    [playerId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Update player state and handle level ups
 */
export async function updatePlayerState(playerId, rewards) {
  try {
    const player = await getPlayerState(playerId);

    if (!player) {
      return null;
    }

    let newXp = player.experience + (rewards.xp || 0);
    let newLevel = player.level;
    let newMaxHp = player.max_hp;

    // Check for level ups
    while (newXp >= LEVEL_UP_THRESHOLD * newLevel) {
      newXp -= LEVEL_UP_THRESHOLD * newLevel;
      newLevel += 1;
      
      // Stat increases per level
      newMaxHp += 20;
    }

    // Update player
    const result = await pool.query(
      `UPDATE players 
       SET gold = gold + $1,
           experience = $2,
           level = $3,
           max_hp = $4,
           hp = hp + (($4 - $5) / 2),
           atk = atk + ($3 - $6) * 2,
           def = def + ($3 - $6),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        rewards.gold || 0,
        newXp,
        newLevel,
        newMaxHp,
        player.max_hp,
        player.level,
        playerId
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Update state error:', error);
    return player;
  }
}

/**
 * Get combat formulas and calculations
 */
export function calculateDamage(attacker, defender, isCrit = false) {
  let damage = attacker.atk - defender.def;
  
  // Minimum 1 damage
  if (damage < 1) {
    damage = 1;
  }

  // Critical hit multiplier (1.5x)
  if (isCrit) {
    damage = Math.floor(damage * 1.5);
  }

  return damage;
}

/**
 * Calculate crit chance
 */
export function getCritChance(level) {
  // 5% base + 1% per level
  return Math.min(5 + level, 25); // Cap at 25%
}

/**
 * Generate equipment drops
 */
export function generateEquipmentDrop(enemyLevel) {
  const rarities = ['common', 'rare', 'epic'];
  const roll = Math.random() * 100;

  let rarity;
  if (roll > 90) {
    rarity = 'epic';
  } else if (roll > 70) {
    rarity = 'rare';
  } else {
    rarity = 'common';
  }

  const itemTypes = ['weapon', 'armor', 'artifact'];
  const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];

  const bonusMultiplier = rarity === 'epic' ? 3 : rarity === 'rare' ? 2 : 1;

  const stats = {
    atk: itemType === 'weapon' ? 5 * bonusMultiplier : 0,
    def: itemType === 'armor' ? 3 * bonusMultiplier : itemType === 'artifact' ? 2 : 0,
    hp: itemType === 'armor' ? 20 * bonusMultiplier : itemType === 'artifact' ? 10 : 0
  };

  return {
    rarity,
    itemType,
    stats
  };
}
