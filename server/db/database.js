import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Log database configuration for debugging
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ WARNING: DATABASE_URL environment variable not set');
  console.warn('📌 Please set DATABASE_URL in your Railway project settings');
} else {
  console.log('✓ DATABASE_URL is configured');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

let dbInitialized = false;

export async function initDatabase() {
  if (dbInitialized) return;

  try {
    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connected:', result.rows[0]);

    // Create tables
    await createTables();
    dbInitialized = true;
    console.log('✓ Database tables initialized');
  } catch (error) {
    console.error('✗ Database connection error:', error.message);
    console.error('📌 Make sure DATABASE_URL is correct in your environment variables');
    console.error('📌 Connection string format: postgresql://user:password@host:port/database');

    // Don't crash the app - retry on next API call
    console.log('⏳ Database initialization deferred - will retry on next request');
  }
}

async function createTables() {
  const queries = [
    // Players table
    `CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      telegram_id BIGINT UNIQUE NOT NULL,
      username VARCHAR(255),
      level INT DEFAULT 1,
      experience BIGINT DEFAULT 0,
      gold BIGINT DEFAULT 0,
      hp INT DEFAULT 100,
      max_hp INT DEFAULT 100,
      atk INT DEFAULT 10,
      def INT DEFAULT 5,
      attack_speed FLOAT DEFAULT 1.0,
      current_location VARCHAR(50) DEFAULT 'forest',
      last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_offline_calc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      clan_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Equipment table
    `CREATE TABLE IF NOT EXISTS equipment (
      id SERIAL PRIMARY KEY,
      player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      item_type VARCHAR(50) NOT NULL,
      rarity VARCHAR(20) NOT NULL,
      name VARCHAR(255) NOT NULL,
      atk_bonus INT DEFAULT 0,
      def_bonus INT DEFAULT 0,
      hp_bonus INT DEFAULT 0,
      equipped BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Quests table
    `CREATE TABLE IF NOT EXISTS quests (
      id SERIAL PRIMARY KEY,
      player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      quest_type VARCHAR(50) NOT NULL,
      quest_name VARCHAR(255) NOT NULL,
      progress INT DEFAULT 0,
      target INT NOT NULL,
      reward_gold INT DEFAULT 0,
      reward_xp INT DEFAULT 0,
      completed BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Clans table
    `CREATE TABLE IF NOT EXISTS clans (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      leader_id INT NOT NULL REFERENCES players(id),
      level INT DEFAULT 1,
      member_count INT DEFAULT 1,
      gold_bonus_percent INT DEFAULT 0,
      xp_bonus_percent INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Clan members table
    `CREATE TABLE IF NOT EXISTS clan_members (
      id SERIAL PRIMARY KEY,
      clan_id INT NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
      player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      role VARCHAR(50) DEFAULT 'member',
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(clan_id, player_id)
    )`,

    // Combat log table
    `CREATE TABLE IF NOT EXISTS combat_log (
      id SERIAL PRIMARY KEY,
      player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      enemy_name VARCHAR(255) NOT NULL,
      player_damage INT NOT NULL,
      enemy_damage INT NOT NULL,
      player_hp_after INT NOT NULL,
      experience_gained INT NOT NULL,
      gold_gained INT NOT NULL,
      is_crit BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const query of queries) {
    try {
      await pool.query(query);
    } catch (error) {
      console.error('Table creation error:', error);
    }
  }
}

export { pool };
