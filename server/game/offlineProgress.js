import { pool } from '../db/database.js';

/**
 * Calculate offline progress rewards
 * Maximum 8 hours of offline progression
 */
export async function calculateOfflineProgress(playerId) {
  try {
    const playerResult = await pool.query(
      'SELECT * FROM players WHERE id = $1',
      [playerId]
    );

    if (playerResult.rows.length === 0) {
      return { gold: 0, xp: 0 };
    }

    const player = playerResult.rows[0];
    const now = new Date();
    const lastLogin = new Date(player.last_login);
    const lastOfflineCalc = new Date(player.last_offline_calc);

    // Calculate time difference in hours
    const timeDiffMs = now - lastOfflineCalc;
    const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
    
    // Cap at 8 hours
    const offlineHours = Math.min(timeDiffHours, 8);

    // Calculate offline income
    // Base income: 10 gold per minute, 0.5 XP per minute (reduced from 5 to prevent fast leveling)
    const goldPerMinute = 10 + (player.atk / 10); // Scales with ATK
    const xpPerMinute = 0.5 + (player.level / 50); // Much slower XP growth

    const offlineMinutes = Math.floor(offlineHours * 60);
    const goldEarned = Math.floor(goldPerMinute * offlineMinutes);
    const xpEarned = Math.floor(xpPerMinute * offlineMinutes);

    // Apply clan bonuses
    let goldBonus = 0;
    let xpBonus = 0;

    if (player.clan_id) {
      const clanResult = await pool.query(
        'SELECT gold_bonus_percent, xp_bonus_percent FROM clans WHERE id = $1',
        [player.clan_id]
      );

      if (clanResult.rows.length > 0) {
        const clan = clanResult.rows[0];
        goldBonus = Math.floor(goldEarned * (clan.gold_bonus_percent / 100));
        xpBonus = Math.floor(xpEarned * (clan.xp_bonus_percent / 100));
      }
    }

    const totalGold = goldEarned + goldBonus;
    const totalXp = xpEarned + xpBonus;

    // Update last offline calculation
    await pool.query(
      'UPDATE players SET last_offline_calc = CURRENT_TIMESTAMP WHERE id = $1',
      [playerId]
    );

    return {
      gold: totalGold,
      xp: totalXp,
      offlineHours: offlineHours,
      baseGold: goldEarned,
      baseXp: xpEarned,
      goldBonus,
      xpBonus
    };
  } catch (error) {
    console.error('Offline progress error:', error);
    return { gold: 0, xp: 0 };
  }
}
