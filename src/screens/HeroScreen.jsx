import { formatNumber } from '../utils/game';
import '../styles/HeroScreen.css';

export default function HeroScreen({ gameState }) {
  const character = gameState?.character;

  if (!character) return <div>Loading...</div>;

  const nextLevelXp = character.level * 100;
  const xpProgress = (character.experience % nextLevelXp) / nextLevelXp * 100;

  return (
    <div className="hero-screen">
      <div className="hero-header">
        <h1 className="hero-name">Hero</h1>
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
          <div className="stat-label">HP</div>
          <div className="stat-value">{character.hp}/{character.maxHp}</div>
          <div className="stat-bar">
            <div className="stat-bar-fill" style={{ width: (character.hp / character.maxHp) * 100 + '%', backgroundColor: '#ff4444' }}></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">ATK</div>
          <div className="stat-value">{character.atk}</div>
          <div className="stat-color" style={{ backgroundColor: '#ff9900' }}></div>
        </div>

        <div className="stat-card">
          <div className="stat-label">DEF</div>
          <div className="stat-value">{character.def}</div>
          <div className="stat-color" style={{ backgroundColor: '#4499ff' }}></div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Attack Speed</div>
          <div className="stat-value">{character.attackSpeed.toFixed(1)}x</div>
          <div className="stat-color" style={{ backgroundColor: '#ffaa00' }}></div>
        </div>
      </div>

      <div className="resources-section">
        <h3>Resources</h3>
        <div className="resource-card">
          <span className="resource-icon">💰</span>
          <span className="resource-label">Gold</span>
          <span className="resource-value">{formatNumber(gameState?.resources?.gold)}</span>
        </div>
      </div>
    </div>
  );
}
