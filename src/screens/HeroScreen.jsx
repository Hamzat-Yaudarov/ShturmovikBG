import { useState } from 'react';
import { formatNumber } from '../utils/game';
import { api } from '../utils/api';
import '../styles/HeroScreen.css';

export default function HeroScreen({ gameState, setGameState }) {
  const character = gameState?.character;
  const [upgrading, setUpgrading] = useState(null);
  const [error, setError] = useState(null);

  if (!character) return <div className="hero-screen"><p>Loading...</p></div>;

  const nextLevelXp = character.level * 500;
  const xpProgress = (character.experience % nextLevelXp) / nextLevelXp * 100;

  // Calculate upgrade costs
  const upgradeCost = 100 * character.level;
  const canAffordUpgrade = gameState?.resources?.gold >= upgradeCost;

  // Calculate stat increases
  const atkIncrease = 5 + Math.floor(character.level / 5);
  const defIncrease = 3 + Math.floor(character.level / 7);
  const hpIncrease = 50 + character.level * 2;

  async function handleUpgrade(stat) {
    if (!canAffordUpgrade) {
      setError(`Need ${upgradeCost} gold to upgrade`);
      return;
    }

    setUpgrading(stat);
    setError(null);

    try {
      const result = await api.upgradeStat(stat);
      // Update game state with new player data
      setGameState(prev => ({
        ...prev,
        character: result.player,
        resources: {
          ...prev.resources,
          gold: result.player.gold
        }
      }));
      setUpgrading(null);
    } catch (err) {
      setError(err.message);
      setUpgrading(null);
    }
  }

  return (
    <div className="hero-screen">
      <div className="hero-header">
        <h1 className="hero-name">⚔️ Hero</h1>
        <div className="level-badge">LV {character.level}</div>
      </div>

      <div className="xp-container">
        <div className="xp-bar-wrapper">
          <div className="xp-bar" style={{ width: xpProgress + '%' }}></div>
        </div>
        <div className="xp-text">{character.experience} / {nextLevelXp} XP</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">❤️ HP</div>
          <div className="stat-value">{character.hp}/{character.maxHp}</div>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: (character.hp / character.maxHp) * 100 + '%', backgroundColor: '#ff4444' }}></div>
          </div>
          <button 
            className={`upgrade-btn ${upgrading === 'hp' ? 'loading' : ''} ${!canAffordUpgrade ? 'disabled' : ''}`}
            onClick={() => handleUpgrade('hp')}
            disabled={upgrading === 'hp' || !canAffordUpgrade}
            title={`+${hpIncrease} HP for ${upgradeCost} gold`}
          >
            {upgrading === 'hp' ? '⏳' : '➕'} +{hpIncrease}
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-label">⚡ ATK</div>
          <div className="stat-value">{character.atk}</div>
          <div className="stat-color" style={{ backgroundColor: '#ff9900' }}></div>
          <button 
            className={`upgrade-btn ${upgrading === 'atk' ? 'loading' : ''} ${!canAffordUpgrade ? 'disabled' : ''}`}
            onClick={() => handleUpgrade('atk')}
            disabled={upgrading === 'atk' || !canAffordUpgrade}
            title={`+${atkIncrease} ATK for ${upgradeCost} gold`}
          >
            {upgrading === 'atk' ? '⏳' : '➕'} +{atkIncrease}
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-label">🛡️ DEF</div>
          <div className="stat-value">{character.def}</div>
          <div className="stat-color" style={{ backgroundColor: '#4499ff' }}></div>
          <button 
            className={`upgrade-btn ${upgrading === 'def' ? 'loading' : ''} ${!canAffordUpgrade ? 'disabled' : ''}`}
            onClick={() => handleUpgrade('def')}
            disabled={upgrading === 'def' || !canAffordUpgrade}
            title={`+${defIncrease} DEF for ${upgradeCost} gold`}
          >
            {upgrading === 'def' ? '⏳' : '➕'} +{defIncrease}
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-label">⏱️ Speed</div>
          <div className="stat-value">{character.attackSpeed.toFixed(1)}x</div>
          <div className="stat-color" style={{ backgroundColor: '#ffaa00' }}></div>
          <div className="coming-soon">Coming Soon</div>
        </div>
      </div>

      <div className="upgrade-cost-banner">
        <div className="cost-info">
          💰 Upgrade Cost: <span className={canAffordUpgrade ? 'affordable' : 'unaffordable'}>{formatNumber(upgradeCost)} gold</span>
        </div>
        {error && <div className="upgrade-error">⚠️ {error}</div>}
      </div>

      <div className="resources-section">
        <h3>📦 Resources</h3>
        <div className="resource-grid">
          <div className="resource-card">
            <span className="resource-icon">💰</span>
            <span className="resource-label">Gold</span>
            <span className="resource-value">{formatNumber(gameState?.resources?.gold)}</span>
          </div>
          <div className="resource-card">
            <span className="resource-icon">✨</span>
            <span className="resource-label">Experience</span>
            <span className="resource-value">{formatNumber(character.experience)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
