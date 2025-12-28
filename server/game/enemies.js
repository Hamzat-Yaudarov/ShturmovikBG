/**
 * Enemy definitions for each location
 */
export const ENEMY_DEFINITIONS = {
  forest: [
    {
      id: 'deer',
      name: 'Deer Distorted',
      level: 1,
      hp: 30,
      atk: 5,
      def: 2,
      xp: 50,
      gold: 20,
      spriteSheet: 'Assets/Mobs/Лес/Deer Distorted'
    },
    {
      id: 'mushroom',
      name: 'Mushroom Carrier',
      level: 2,
      hp: 45,
      atk: 8,
      def: 3,
      xp: 80,
      gold: 35,
      spriteSheet: 'Assets/Mobs/Лес/Mushroom Carrier'
    },
    {
      id: 'whisperer',
      name: 'Forest Whisperer',
      level: 3,
      hp: 60,
      atk: 12,
      def: 4,
      xp: 120,
      gold: 50,
      spriteSheet: 'Assets/Mobs/Лес/Forest Whisperer'
    },
    {
      id: 'root',
      name: 'Rotten root',
      level: 4,
      hp: 75,
      atk: 15,
      def: 5,
      xp: 150,
      gold: 65,
      spriteSheet: 'Assets/Mobs/Лес/Rotten root'
    }
  ],
  ruins: [
    {
      id: 'guardian',
      name: 'Bone Guardian',
      level: 5,
      hp: 90,
      atk: 18,
      def: 6,
      xp: 200,
      gold: 80,
      spriteSheet: 'Assets/Mobs/Руины/Bone Guardian'
    },
    {
      id: 'shadow',
      name: 'Shadow Blade',
      level: 6,
      hp: 100,
      atk: 22,
      def: 7,
      xp: 250,
      gold: 100,
      spriteSheet: 'Assets/Mobs/Руины/Shadow Blade'
    },
    {
      id: 'psalm',
      name: 'Scarlet Psalm-Reader',
      level: 7,
      hp: 110,
      atk: 25,
      def: 8,
      xp: 300,
      gold: 120,
      spriteSheet: 'Assets/Mobs/Руины/Scarlet Psalm-Reader'
    },
    {
      id: 'archivist',
      name: 'Dusty Archivist',
      level: 8,
      hp: 125,
      atk: 28,
      def: 9,
      xp: 350,
      gold: 140,
      spriteSheet: 'Assets/Mobs/Руины/Dusty Archivist'
    }
  ]
};

/**
 * Get spawning chance for each enemy based on location
 */
export function getEnemyForLocation(location, playerLevel) {
  const enemies = ENEMY_DEFINITIONS[location];
  
  if (!enemies) {
    return ENEMY_DEFINITIONS.forest[0];
  }

  // Filter enemies based on player level
  const availableEnemies = enemies.filter(
    enemy => enemy.level <= Math.min(playerLevel + 3, 8)
  );

  // Weighted random selection - higher level players see higher level enemies
  const totalWeight = availableEnemies.reduce((sum, enemy) => {
    return sum + (Math.max(0, enemy.level - playerLevel + 3));
  }, 0);

  let roll = Math.random() * totalWeight;
  
  for (const enemy of availableEnemies) {
    roll -= Math.max(0, enemy.level - playerLevel + 3);
    if (roll <= 0) {
      return enemy;
    }
  }

  return availableEnemies[availableEnemies.length - 1];
}

/**
 * Get spawn interval for enemies (ms)
 */
export function getSpawnInterval(playerAttackSpeed = 1.0) {
  // Base spawn every 3 seconds, affected by player attack speed
  return Math.max(1500, 3000 / playerAttackSpeed);
}
