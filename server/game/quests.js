import { pool } from '../db/database.js';

const GAME_QUESTS = [
  {
    type: 'kill_enemies',
    name: 'Slay 10 Enemies',
    target: 10,
    reward_gold: 100,
    reward_xp: 200
  },
  {
    type: 'kill_enemies',
    name: 'Slay 50 Enemies',
    target: 50,
    reward_gold: 500,
    reward_xp: 1000
  },
  {
    type: 'earn_gold',
    name: 'Earn 500 Gold',
    target: 500,
    reward_gold: 250,
    reward_xp: 500
  },
  {
    type: 'earn_gold',
    name: 'Earn 2000 Gold',
    target: 2000,
    reward_gold: 1000,
    reward_xp: 2000
  },
  {
    type: 'level_up',
    name: 'Reach Level 5',
    target: 5,
    reward_gold: 300,
    reward_xp: 600
  },
  {
    type: 'level_up',
    name: 'Reach Level 10',
    target: 10,
    reward_gold: 1000,
    reward_xp: 2000
  },
  {
    type: 'equip_item',
    name: 'Equip Rare Item',
    target: 1,
    reward_gold: 200,
    reward_xp: 400
  }
];

const TELEGRAM_QUESTS = [
  {
    type: 'daily_login',
    name: 'Daily Login',
    target: 1,
    reward_gold: 50,
    reward_xp: 100
  },
  {
    type: 'consecutive_days',
    name: 'Log In 3 Days',
    target: 3,
    reward_gold: 300,
    reward_xp: 500
  },
  {
    type: 'join_clan',
    name: 'Join a Clan',
    target: 1,
    reward_gold: 100,
    reward_xp: 200
  },
  {
    type: 'clan_chat',
    name: 'Send Clan Message',
    target: 1,
    reward_gold: 50,
    reward_xp: 100
  },
  {
    type: 'invite_friend',
    name: 'Invite a Friend',
    target: 1,
    reward_gold: 200,
    reward_xp: 400
  }
];

/**
 * Initialize quests for new player
 */
export async function initializeQuestsForPlayer(playerId) {
  try {
    const allQuests = [...GAME_QUESTS, ...TELEGRAM_QUESTS];

    for (const quest of allQuests) {
      await pool.query(
        `INSERT INTO quests (player_id, quest_type, quest_name, target, reward_gold, reward_xp)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [
          playerId,
          quest.type,
          quest.name,
          quest.target,
          quest.reward_gold,
          quest.reward_xp
        ]
      );
    }
  } catch (error) {
    console.error('Quest initialization error:', error);
  }
}

/**
 * Update quest progress based on action
 */
export async function updateQuestProgress(playerId, actionType, value = 1) {
  try {
    // Map action type to quest type
    const questTypeMap = {
      kill_enemy: 'kill_enemies',
      earn_gold: 'earn_gold',
      level_up: 'level_up',
      equip_item: 'equip_item'
    };

    const questType = questTypeMap[actionType];
    if (!questType) return;

    // Update matching quests
    await pool.query(
      `UPDATE quests 
       SET progress = LEAST(progress + $1, target)
       WHERE player_id = $2 AND quest_type = $3 AND completed = false`,
      [value, playerId, questType]
    );
  } catch (error) {
    console.error('Quest progress update error:', error);
  }
}
