import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import '../styles/QuestScreen.css';

export default function QuestScreen({ gameState, setGameState }) {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuests();
  }, []);

  async function loadQuests() {
    try {
      const data = await api.getQuests();
      setQuests(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load quests:', error);
      setLoading(false);
    }
  }

  async function handleCompleteQuest(questId) {
    try {
      const result = await api.completeQuest(questId);
      await loadQuests();
      // Refresh game state
      const newState = await api.getGameState();
      setGameState(newState);
    } catch (error) {
      console.error('Failed to complete quest:', error);
    }
  }

  if (loading) return <div>Loading...</div>;

  const activeQuests = quests.filter(q => !q.completed);
  const completedQuests = quests.filter(q => q.completed);

  return (
    <div className="quest-screen">
      <h1>Quests & Tasks</h1>

      <div className="quest-section">
        <h3>Active Quests</h3>
        {activeQuests.length === 0 ? (
          <div className="no-quests">No active quests</div>
        ) : (
          <div className="quest-list">
            {activeQuests.map(quest => (
              <div key={quest.id} className="quest-card">
                <div className="quest-header">
                  <h4 className="quest-name">{quest.quest_name}</h4>
                  <span className="quest-type">{quest.quest_type}</span>
                </div>

                <div className="quest-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: (quest.progress / quest.target) * 100 + '%' }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {quest.progress} / {quest.target}
                  </div>
                </div>

                <div className="quest-rewards">
                  <span className="reward gold">💰 {quest.reward_gold}</span>
                  <span className="reward xp">⭐ {quest.reward_xp}</span>
                </div>

                {quest.progress >= quest.target && (
                  <button
                    className="complete-btn"
                    onClick={() => handleCompleteQuest(quest.id)}
                  >
                    Claim Reward
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="quest-section">
        <h3>Completed</h3>
        {completedQuests.length === 0 ? (
          <div className="no-quests">No completed quests yet</div>
        ) : (
          <div className="completed-list">
            {completedQuests.slice(-5).map(quest => (
              <div key={quest.id} className="completed-quest">
                <span className="quest-check">✓</span>
                <span className="quest-name">{quest.quest_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
