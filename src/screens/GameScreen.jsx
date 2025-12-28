import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { api } from '../utils/api';
import { calculateDamage, isCriticalHit } from '../utils/game';
import { ENEMY_DEFINITIONS } from '../constants/enemies';
import '../styles/GameScreen.css';

export default function GameScreen({ gameState, setGameState }) {
  const gameRef = useRef(null);
  const phaserRef = useRef(null);
  const [location, setLocation] = useState(gameState?.location || 'forest');
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (!gameRef.current) return;

    const parentWidth = gameRef.current.clientWidth || 800;
    const parentHeight = gameRef.current.clientHeight || 600;

    // Create Phaser game config
    const config = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: parentWidth,
      height: parentHeight,
      backgroundColor: '#000000',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: {
        preload: preload,
        create: create,
        update: update
      },
      render: {
        pixelArt: true,
        antialias: false
      }
    };

    const game = new Phaser.Game(config);
    phaserRef.current = game;

    function preload() {
      // Load player sprites
      this.load.image('player-idle', 'Assets/Player/Animation/Idle/sprite-64px-4 (23).png');
      this.load.image('player-run', 'Assets/Player/Animation/running/sprite-64px-4 (21).png');
      this.load.image('player-attack', 'Assets/Player/Animation/Attack/sprite-64px-4 (20).png');
      this.load.image('player-death', 'Assets/Player/Animation/death/sprite-64px-4 (22).png');

      // Load enemy sprites - Forest
      this.load.image('enemy-deer', 'Assets/Mobs/Лес/Deer Distorted/Attack/sprite-64px-4 (4).png');
      this.load.image('enemy-mushroom', 'Assets/Mobs/Лес/Mushroom Carrier/Attack/sprite-64px-4.png');
      this.load.image('enemy-whisperer', 'Assets/Mobs/Лес/Forest Whisperer/Attack/sprite-64px-4 (8).png');
      this.load.image('enemy-root', 'Assets/Mobs/Лес/Rotten root/Attack/sprite-64px-4 (2).png');

      // Load enemy sprites - Ruins
      this.load.image('enemy-guardian', 'Assets/Mobs/Руины/Bone Guardian/Attack/sprite-64px-4 (11).png');
      this.load.image('enemy-shadow', 'Assets/Mobs/Руины/Shadow Blade/Attack/sprite-64px-4 (14).png');
      this.load.image('enemy-psalm', 'Assets/Mobs/Руины/Scarlet Psalm-Reader/Attack/sprite-64px-4 (16).png');
      this.load.image('enemy-archivist', 'Assets/Mobs/Руины/Dusty Archivist/Attack/sprite-64px-4 (18).png');
    }

    function create() {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;

      // Create scrolling background
      const bg = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x0a0a0a);
      bg.setDepth(0);

      // Create foreground accent
      const fg = this.add.rectangle(centerX, centerY + 80, this.cameras.main.width, 20, 0x1a1a1a);
      fg.setDepth(5);

      // Create player
      const player = this.add.image(centerX - 100, centerY, 'player-run');
      player.setScale(3);
      player.setDepth(10);
      player.hp = gameStateRef.current?.character?.hp || 100;
      player.maxHp = gameStateRef.current?.character?.maxHp || 100;
      player.inCombat = false;
      player.combatEnemy = null;

      // Create health bar background
      const hpBarBg = this.add.rectangle(centerX - 100, centerY - 80, 80, 8, 0x333333);
      hpBarBg.setDepth(9);

      // Create health bar fill
      const hpBar = this.add.rectangle(centerX - 100, centerY - 80, 80, 8, 0xff4444);
      hpBar.setDepth(9);

      // Create enemy group
      this.enemies = this.add.group();
      this.playerSprite = player;
      this.hpBar = hpBar;
      this.hpBarBg = hpBarBg;
      this.centerX = centerX;
      this.centerY = centerY;

      // Spawn enemies
      this.spawnTimer = 0;
      this.spawnInterval = 3000;
      this.combatInProgress = false;
    }

    function update(time, delta) {
      // Spawn enemies
      if (!this.spawnTimer) this.spawnTimer = time;
      if (time - this.spawnTimer > this.spawnInterval && this.enemies.children.entries.length < 5) {
        spawnEnemy.call(this);
        this.spawnTimer = time;
      }

      // Update player position
      this.hpBarBg.x = this.playerSprite.x;
      this.hpBarBg.y = this.playerSprite.y - 80;
      this.hpBar.x = this.playerSprite.x;
      this.hpBar.y = this.playerSprite.y - 80;

      // Update health bar
      const healthPercent = Math.max(0, this.playerSprite.hp / this.playerSprite.maxHp);
      this.hpBar.width = 80 * healthPercent;

      // Update enemies
      this.enemies.children.entries.forEach((enemy, index) => {
        if (!enemy.inCombat) {
          enemy.x -= enemy.speed * delta / 1000;
        }

        // Remove if off screen
        if (enemy.x < -100) {
          enemy.destroy();
        }

        // Check collision with player
        const distance = Phaser.Math.Distance.Between(
          this.playerSprite.x, this.playerSprite.y,
          enemy.x, enemy.y
        );

        if (distance < 80 && !enemy.inCombat && !this.combatInProgress) {
          startCombat.call(this, enemy);
        }
      });
    }

    function spawnEnemy() {
      const centerY = this.centerY;
      const spawnX = this.cameras.main.width + 50;

      const enemyList = location === 'forest' ? ENEMY_DEFINITIONS.forest : ENEMY_DEFINITIONS.ruins;
      const randomEnemy = enemyList[Math.floor(Math.random() * enemyList.length)];

      const spriteKey = `enemy-${randomEnemy.id}`;
      const enemy = this.add.image(spawnX, centerY, spriteKey);
      enemy.setScale(3);
      enemy.setDepth(8);
      enemy.speed = 40 + Math.random() * 60;
      enemy.inCombat = false;
      enemy.hp = randomEnemy.hp;
      enemy.maxHp = randomEnemy.hp;
      enemy.def = randomEnemy.def;
      enemy.atk = randomEnemy.atk;
      enemy.xp = randomEnemy.xp;
      enemy.gold = randomEnemy.gold;
      enemy.definition = randomEnemy;

      // Enemy health bar
      const hpBg = this.add.rectangle(spawnX, centerY - 80, 80, 6, 0x333333);
      hpBg.setDepth(7);
      enemy.hpBarBg = hpBg;

      const hpBar = this.add.rectangle(spawnX, centerY - 80, 80, 6, 0xff4444);
      hpBar.setDepth(7);
      enemy.hpBar = hpBar;

      this.enemies.add(enemy);
    }

    async function startCombat(enemy) {
      this.combatInProgress = true;
      enemy.inCombat = true;
      this.playerSprite.inCombat = true;

      const character = gameStateRef.current?.character;
      if (!character) return;

      // Combat loop
      let playerHp = this.playerSprite.hp;
      let enemyHp = enemy.hp;
      let playerDamageTotal = 0;
      let enemyDamageTotal = 0;
      let xpGained = 0;
      let goldGained = 0;
      let isCrit = false;

      // Single combat round
      const isCriticalHit = Math.random() * 100 < (5 + character.level);
      const playerDamage = isCriticalHit ? Math.floor((character.atk - enemy.def) * 1.5) : character.atk - enemy.def;
      enemyHp -= Math.max(1, playerDamage);

      playerDamageTotal = playerDamage;
      isCrit = isCriticalHit;

      // Player attack animation
      this.playerSprite.setTexture('player-attack');
      enemy.setTint(0xff6666);

      // Damage numbers
      showDamage.call(this, enemy.x, enemy.y, playerDamage, isCriticalHit);

      await new Promise(r => setTimeout(r, 300));

      if (enemyHp <= 0) {
        // Enemy dies
        xpGained = enemy.xp;
        goldGained = enemy.gold;

        enemy.setTexture('enemy-root'); // Placeholder death animation
        enemy.setTint(0x666666);
        enemy.setAlpha(0.5);

        await new Promise(r => setTimeout(r, 400));
        enemy.destroy();
      } else {
        // Enemy counter-attacks
        const enemyDamage = Math.max(0, enemy.atk - character.def);
        playerHp -= enemyDamage;
        enemyDamageTotal = enemyDamage;

        enemy.hp = enemyHp;
        enemy.clearTint();
        enemy.setTexture('enemy-root'); // Placeholder attack animation

        showDamage.call(this, this.playerSprite.x, this.playerSprite.y, enemyDamage, false);

        await new Promise(r => setTimeout(r, 300));
        enemy.setTexture(`enemy-${enemy.definition.id}`);
      }

      // Update player health bar
      this.playerSprite.hp = Math.max(0, playerHp);
      const healthPercent = Math.max(0, this.playerSprite.hp / this.playerSprite.maxHp);
      this.hpBar.width = 80 * healthPercent;

      // Return player to running state
      this.playerSprite.setTexture('player-run');
      this.playerSprite.inCombat = false;

      // Report combat result
      try {
        await api.reportCombat({
          enemyName: enemy.definition.name,
          playerDamage: playerDamageTotal,
          enemyDamage: enemyDamageTotal,
          playerHpAfter: this.playerSprite.hp,
          experienceGained: xpGained,
          goldGained: goldGained,
          isCrit
        });
      } catch (error) {
        console.error('Combat error:', error);
      }

      this.combatInProgress = false;
    }

    function showDamage(x, y, damage, isCrit) {
      const damageText = this.add.text(x, y, damage.toString(), {
        font: `${isCrit ? 'bold' : ''} 20px Arial`,
        fill: isCrit ? '#ffff00' : '#ff6666'
      });
      damageText.setDepth(12);
      damageText.setOrigin(0.5);

      this.tweens.add({
        targets: damageText,
        y: y - 50,
        alpha: 0,
        duration: 800,
        onComplete: () => damageText.destroy()
      });
    }

    return () => {
      game.destroy(true);
    };
  }, [location]);

  async function handleLocationChange(newLocation) {
    try {
      await api.changeLocation(newLocation);
      setLocation(newLocation);
    } catch (error) {
      console.error('Location change error:', error);
    }
  }

  return (
    <div className="game-screen">
      <div className="hud">
        <div className="hud-left">
          <div className="stat hp">
            HP: {gameState?.character?.hp}/{gameState?.character?.maxHp}
          </div>
          <div className="stat level">
            Level: {gameState?.character?.level}
          </div>
        </div>

        <div className="hud-center">
          <div className="location-selector">
            <button
              className={`location-btn ${location === 'forest' ? 'active' : ''}`}
              onClick={() => handleLocationChange('forest')}
            >
              🌲 Forest
            </button>
            <button
              className={`location-btn ${location === 'ruins' ? 'active' : ''}`}
              onClick={() => handleLocationChange('ruins')}
            >
              🏚️ Ruins
            </button>
          </div>
        </div>

        <div className="hud-right">
          <div className="stat gold">
            💰 {gameState?.resources?.gold}
          </div>
          <div className="stat xp">
            ⭐ {gameState?.character?.experience}
          </div>
        </div>
      </div>

      <div className="canvas-container" ref={gameRef}></div>
    </div>
  );
}
