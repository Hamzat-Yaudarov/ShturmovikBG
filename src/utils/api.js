/**
 * Get Telegram Init Data
 */
function getInitData() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp.initData;
  }
  return '';
}

/**
 * Make API request
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Telegram-Init-Data': getInitData()
  };

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`/api${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

/**
 * API methods
 */
export const api = {
  // Game state
  getGameState: () => apiRequest('/game/state', 'POST'),
  changeLocation: (location) => apiRequest('/game/location', 'POST', { location }),
  reportCombat: (combatData) => apiRequest('/game/combat', 'POST', combatData),

  // Player
  getProfile: () => apiRequest('/player/profile'),
  getEquipment: () => apiRequest('/player/equipment'),
  equipItem: (itemId) => apiRequest('/player/equip', 'POST', { itemId }),

  // Quests
  getQuests: () => apiRequest('/quests'),
  completeQuest: (questId) => apiRequest(`/quests/${questId}/complete`, 'POST'),

  // Clans
  createClan: (clanName) => apiRequest('/clans/create', 'POST', { clanName }),
  joinClan: (clanId) => apiRequest('/clans/join', 'POST', { clanId }),
  getClanInfo: (clanId) => apiRequest(`/clans/${clanId}`)
};
