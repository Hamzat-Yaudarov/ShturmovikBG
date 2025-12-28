import '../styles/SkillsScreen.css';

export default function SkillsScreen({ gameState }) {
  const character = gameState?.character;

  return (
    <div className="skills-screen">
      <h1>Skills & Abilities</h1>

      <div className="skills-info">
        <p>Skills are automatically unlocked as you level up.</p>
      </div>

      <div className="skill-tree">
        <div className="skill-category">
          <h3>Combat Skills</h3>
          <div className="skill-list">
            <div className="skill-card unlocked">
              <div className="skill-icon">⚔️</div>
              <div className="skill-info">
                <div className="skill-name">Basic Attack</div>
                <div className="skill-desc">Deal damage based on ATK stat</div>
              </div>
            </div>

            {character?.level >= 5 && (
              <div className="skill-card unlocked">
                <div className="skill-icon">💥</div>
                <div className="skill-info">
                  <div className="skill-name">Power Strike</div>
                  <div className="skill-desc">Deal 1.5x damage, 25% crit chance</div>
                </div>
              </div>
            )}

            {character?.level >= 10 && (
              <div className="skill-card unlocked">
                <div className="skill-icon">🌪️</div>
                <div className="skill-info">
                  <div className="skill-name">Whirlwind</div>
                  <div className="skill-desc">Hit all enemies in range</div>
                </div>
              </div>
            )}

            {character?.level < 5 && (
              <div className="skill-card locked">
                <div className="skill-icon">🔒</div>
                <div className="skill-info">
                  <div className="skill-name">Power Strike</div>
                  <div className="skill-desc">Unlock at Level 5</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="skill-category">
          <h3>Passive Skills</h3>
          <div className="skill-list">
            <div className="skill-card unlocked">
              <div className="skill-icon">💪</div>
              <div className="skill-info">
                <div className="skill-name">Strength Training</div>
                <div className="skill-desc">+2% ATK per level</div>
              </div>
            </div>

            <div className="skill-card unlocked">
              <div className="skill-icon">🛡️</div>
              <div className="skill-info">
                <div className="skill-name">Toughness</div>
                <div className="skill-desc">+1% DEF per level</div>
              </div>
            </div>

            {character?.level >= 15 && (
              <div className="skill-card unlocked">
                <div className="skill-icon">⚡</div>
                <div className="skill-info">
                  <div className="skill-name">Regeneration</div>
                  <div className="skill-desc">Restore 5% HP after combat</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
