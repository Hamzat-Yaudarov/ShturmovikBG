/**
 * Calculate damage based on attacker and defender stats
 */
export function calculateDamage(attacker, defender) {
  let damage = attacker.atk - defender.def;
  if (damage < 1) damage = 1;
  return damage;
}

/**
 * Calculate crit chance based on attacker level
 */
export function calculateCritChance(level) {
  // 5% base + 1% per level, cap at 25%
  return Math.min(5 + level, 25);
}

/**
 * Check if hit is critical
 */
export function isCriticalHit(level) {
  const critChance = calculateCritChance(level);
  return Math.random() * 100 < critChance;
}

/**
 * Get experience for next level
 */
export function getXpForLevel(level) {
  return 100 * level;
}

/**
 * Get remaining experience for next level
 */
export function getRemainingXp(currentXp, level) {
  const xpForLevel = getXpForLevel(level);
  return xpForLevel - currentXp;
}

/**
 * Format large numbers
 */
export function formatNumber(num) {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format time duration
 */
export function formatTime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity) {
  const colors = {
    common: '#888888',
    rare: '#0099ff',
    epic: '#9900ff',
    legendary: '#ffaa00'
  };
  return colors[rarity] || colors.common;
}
