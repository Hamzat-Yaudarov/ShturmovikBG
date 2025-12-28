import { useEffect, useState } from 'react';
import GameScreen from './screens/GameScreen';
import HeroScreen from './screens/HeroScreen';
import EquipmentScreen from './screens/EquipmentScreen';
import SkillsScreen from './screens/SkillsScreen';
import QuestScreen from './screens/QuestScreen';
import ClanScreen from './screens/ClanScreen';
import { api } from './utils/api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('game');
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGameState();
    
    // Refresh game state every 30 seconds
    const interval = setInterval(loadGameState, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadGameState() {
    try {
      const state = await api.getGameState();
      setGameState(state);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading">Loading game...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const screens = {
    game: <GameScreen gameState={gameState} setGameState={setGameState} />,
    hero: <HeroScreen gameState={gameState} />,
    equipment: <EquipmentScreen gameState={gameState} setGameState={setGameState} />,
    skills: <SkillsScreen gameState={gameState} />,
    quests: <QuestScreen gameState={gameState} setGameState={setGameState} />,
    clan: <ClanScreen gameState={gameState} setGameState={setGameState} />
  };

  return (
    <div className="app-container">
      <div className="game-content">
        {screens[activeTab]}
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-btn ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => setActiveTab('game')}
        >
          🎮 Game
        </button>
        <button
          className={`nav-btn ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          🦸 Hero
        </button>
        <button
          className={`nav-btn ${activeTab === 'equipment' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipment')}
        >
          ⚔️ Equipment
        </button>
        <button
          className={`nav-btn ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          💪 Skills
        </button>
        <button
          className={`nav-btn ${activeTab === 'quests' ? 'active' : ''}`}
          onClick={() => setActiveTab('quests')}
        >
          📋 Quests
        </button>
        <button
          className={`nav-btn ${activeTab === 'clan' ? 'active' : ''}`}
          onClick={() => setActiveTab('clan')}
        >
          👥 Clan
        </button>
      </nav>
    </div>
  );
}
