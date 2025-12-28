import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import '../styles/ClanScreen.css';

export default function ClanScreen({ gameState, setGameState }) {
  const [clanInfo, setClanInfo] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clanName, setClanName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (gameState?.character?.clan_id) {
      loadClanInfo(gameState.character.clan_id);
    } else {
      setLoading(false);
    }
  }, [gameState?.character?.clan_id]);

  async function loadClanInfo(clanId) {
    try {
      const info = await api.getClanInfo(clanId);
      setClanInfo(info);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load clan info:', error);
      setLoading(false);
    }
  }

  async function handleCreateClan(e) {
    e.preventDefault();
    if (!clanName.trim()) return;

    try {
      const result = await api.createClan(clanName);
      setClanInfo(result.clan);
      setClanName('');
      setShowCreateForm(false);
      // Refresh game state
      const newState = await api.getGameState();
      setGameState(newState);
    } catch (error) {
      console.error('Failed to create clan:', error);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="clan-screen">
      <h1>Clan</h1>

      {clanInfo ? (
        <>
          <div className="clan-header">
            <h2>{clanInfo.name}</h2>
            <div className="clan-level">Level {clanInfo.level}</div>
          </div>

          <div className="clan-bonuses">
            <div className="bonus-card">
              <div className="bonus-label">Gold Bonus</div>
              <div className="bonus-value">+{clanInfo.gold_bonus_percent}%</div>
            </div>
            <div className="bonus-card">
              <div className="bonus-label">XP Bonus</div>
              <div className="bonus-value">+{clanInfo.xp_bonus_percent}%</div>
            </div>
          </div>

          <div className="clan-members">
            <h3>Members ({clanInfo.members.length})</h3>
            <div className="member-list">
              {clanInfo.members.map(member => (
                <div key={member.id} className="member-card">
                  <div className="member-info">
                    <div className="member-name">{member.username}</div>
                    <div className="member-level">Lvl {member.level}</div>
                  </div>
                  <div className="member-role">{member.role}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="no-clan">
            <div className="no-clan-icon">👥</div>
            <p>You're not in a clan yet</p>
          </div>

          {!showCreateForm && (
            <button
              className="create-clan-btn"
              onClick={() => setShowCreateForm(true)}
            >
              Create Clan
            </button>
          )}

          {showCreateForm && (
            <form className="create-clan-form" onSubmit={handleCreateClan}>
              <input
                type="text"
                placeholder="Clan name"
                value={clanName}
                onChange={(e) => setClanName(e.target.value)}
                minLength={3}
                maxLength={50}
              />
              <button type="submit">Create</button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
