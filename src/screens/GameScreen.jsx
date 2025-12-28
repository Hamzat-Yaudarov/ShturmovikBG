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
  const [enemiesKilled, setEnemiesKilled] = useState(0);
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
      // Load backgrounds
      this.load.image('bg-forest', '/Mobs/Лес/Фон/gen-043ead7a-b125-42d2-b8e9-36e2583e024e.png');
      this.load.image('bg-ruins', '/Mobs/Руины/Фон/gen-4c74d1f4-f249-41ad-91d2-39a8725e26c2.png');

      // Load player sprite sheets (4 frames 64x64)
      this.load.spritesheet('player-idle', '/Player/Animation/Idle/sprite-64px-4 (23).png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('player-run', '/Player/Animation/running/sprite-64px-4 (21).png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('player-attack', '/Player/Animation/Attack/sprite-64px-4 (20).png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('player-death', '/Player/Animation/death/sprite-64px-4 (22).png', { frameWidth: 64, frameHeight: 64 });

      // Load enemy sprite sheets - Forest
      this.load.spritesheet('enemy-deer', '/Mobs/Лес/Deer Distorted/Attack/sprite-64px-4 (4).png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('enemy-deer-death', '/Mobs/Лес/Deer Distorted/Death/sprite-64px-4 (5).png', { frameWidth: 64, frameHeight: 64 });

      this.load.spritesheet('enemy-mushroom', '/Mobs/Лес/Mushroom Carrier/Attack/sprite-64px-4.png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('enemy-mushroom-death', '/Mobs/Лес/Mushroom Carrier/Death/sprite-64px-4 (1).png', { frameWidth: 64, frameHeight: 64 });

      this.load.spritesheet('enemy-whisperer', '/Mobs/Лес/Forest Whisperer/Attack/sprite-64px-4 (8).png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('enemy-whisperer-death', '/Mobs/Лес/Forest Whisperer/Death/sprite-64px-4 (10).png', { frameWidth: 64, frameHeight: 64 });

      this.load.spritesheet('enemy-root', '/Mobs/Лес/Rotten root/Attack/sprite-64px-4 (2).png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('enemy-root-death', '/Mobs/Лес/Rotten root/Death/sprite-64px-4 (3).png', { frameWidth: 64, frameHeight: 64 });

      // Load enemy sprite sheets - Ruins
      this.load.spritesheet('enemy-guardian', '/Mobs/Руины/Bone Guardian/Attack/sprite-64px-4 (11).png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('enemy-guardian-death', '/Mobs/Руины/Bone Guardian/Death/sprite-64px-4 (12).png', { frameWidth: 64, frameHeight: 64 });

      this.load.spritesheet('enemy-shadow', '/Mobs/Руины/Shadow Blade/Attack/sprite-64px-4 (14).png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('enemy-shadow-death', '/Mobs/Руины/Shadow Blade/Death/sprite-64px-4 (13).png', { frameWidth: 64, frameHeight: 64 });

      this.load.spritesheet('enemy-psalm', '/Mobs/Руины/Scarlet Psalm-Reader/Attack/sprite-64px-4 (16).png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('enemy-psalm-death', '/Mobs/Руины/Scarlet Psalm-Reader/Death/sprite-64px-4 (17).png', { frameWidth: 64, frameHeight: 64 });

      this.load.spritesheet('enemy-archivist', '/Mobs/Руины/Dusty Archivist/Attack/sprite-64px-4 (18).png', { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('enemy-archivist-death', '/Mobs/Руины/Dusty Archivist/Death/sprite-64px-4 (19).png', { frameWidth: 64, frameHeight: 64 });
    }

    function create() {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;

      // Create background
      const bgKey = location === 'forest' ? 'bg-forest' : 'bg-ruins';
      const bg = this.add.image(centerX, centerY, bgKey);
      bg.setOrigin(0.5, 0.5);
      bg.setDepth(0);
      
      // Scale background to fill screen
      const scaleX = (this.cameras.main.width) / bg.width;
      const scaleY = (this.cameras.main.height) / bg.height;
      const scale = Math.max(scaleX, scaleY);
      bg.setScale(scale);

      // Create player at left side
      const playerX = 100;
      const player = this.add.sprite(playerX, centerY, 'player-run', 0);
      player.setScale(4);
      player.setDepth(10);
      player.hp = gameStateRef.current?.character?.hp || 100;
      player.maxHp = gameStateRef.current?.character?.maxHp || 100;
      player.inCombat = false;
      player.combatEnemy = null;

      // Create animations
      createAnimations.call(this);

      // Play idle animation
      player.play('player-idle', true);

      // Create health bar background
      const hpBarBg = this.add.rectangle(playerX, centerY - 100, 100, 12, 0x333333);
      hpBarBg.setDepth(9);
      hpBarBg.setStrokeStyle(2, 0xffffff);

      // Create health bar fill
      const hpBar = this.add.rectangle(playerX, centerY - 100, 100, 12, 0xff4444);
      hpBar.setDepth(9);

      // Enemy group
      this.enemies = this.add.group();
      this.playerSprite = player;
      this.hpBar = hpBar;
      this.hpBarBg = hpBarBg;
      this.centerX = centerX;
      this.centerY = centerY;
      this.locationRef = location;

      // Spawn timers
      this.spawnTimer = 0;
      this.spawnInterval = 2500;
      this.combatInProgress = false;
      this.killCount = 0;

      // HUD text
      this.killCountText = this.add.text(20, 20, `Kills: ${this.killCount}`, {
        font: '24px Arial',
        fill: '#ffffff'
      });
      this.killCountText.setDepth(15);
    }

    function createAnimations() {
      // Player animations
      if (!this.anims.exists('player-idle')) {
        this.anims.create({
          key: 'player-idle',
          frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 3 }),
          frameRate: 8,
          repeat: -1
        });
      }

      if (!this.anims.exists('player-run')) {
        this.anims.create({
          key: 'player-run',
          frames: this.anims.generateFrameNumbers('player-run', { start: 0, end: 3 }),
          frameRate: 10,
          repeat: -1
        });
      }

      if (!this.anims.exists('player-attack')) {
        this.anims.create({
          key: 'player-attack',
          frames: this.anims.generateFrameNumbers('player-attack', { start: 0, end: 3 }),
          frameRate: 12,
          repeat: 0
        });
      }

      if (!this.anims.exists('player-death')) {
        this.anims.create({
          key: 'player-death',
          frames: this.anims.generateFrameNumbers('player-death', { start: 0, end: 3 }),
          frameRate: 8,
          repeat: 0
        });
      }

      // Enemy animations - Forest
      const forestEnemies = ['deer', 'mushroom', 'whisperer', 'root'];
      forestEnemies.forEach(enemyType => {
        if (!this.anims.exists(`enemy-${enemyType}-attack`)) {
          this.anims.create({
            key: `enemy-${enemyType}-attack`,
            frames: this.anims.generateFrameNumbers(`enemy-${enemyType}`, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
          });
        }

        if (!this.anims.exists(`enemy-${enemyType}-death`)) {
          this.anims.create({
            key: `enemy-${enemyType}-death`,
            frames: this.anims.generateFrameNumbers(`enemy-${enemyType}-death`, { start: 0, end: 3 }),
            frameRate: 8,
            repeat: 0
          });
        }
      });

      // Enemy animations - Ruins
      const ruinsEnemies = ['guardian', 'shadow', 'psalm', 'archivist'];
      ruinsEnemies.forEach(enemyType => {
        if (!this.anims.exists(`enemy-${enemyType}-attack`)) {
          this.anims.create({
            key: `enemy-${enemyType}-attack`,
            frames: this.anims.generateFrameNumbers(`enemy-${enemyType}`, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
          });
        }

        if (!this.anims.exists(`enemy-${enemyType}-death`)) {
          this.anims.create({
            key: `enemy-${enemyType}-death`,
            frames: this.anims.generateFrameNumbers(`enemy-${enemyType}-death`, { start: 0, end: 3 }),
            frameRate: 8,
            repeat: 0
          });
        }
      });
    }

    function update(time, delta) {
      // Spawn enemies
      if (!this.spawnTimer) this.spawnTimer = time;
      if (time - this.spawnTimer > this.spawnInterval && this.enemies.children.entries.length < 3) {
        spawnEnemy.call(this);
        this.spawnTimer = time;
      }

      // Update player position (moves right)
      this.playerSprite.x += 15 * delta / 1000;

      // Clamp player to screen
      if (this.playerSprite.x > this.cameras.main.width - 100) {
        this.playerSprite.x = this.cameras.main.width - 100;
      }

      // Update health bar
      this.hpBarBg.x = this.playerSprite.x;
      this.hpBarBg.y = this.playerSprite.y - 100;
      this.hpBar.x = this.playerSprite.x;
      this.hpBar.y = this.playerSprite.y - 100;

      const healthPercent = Math.max(0, this.playerSprite.hp / this.playerSprite.maxHp);
      this.hpBar.width = 100 * healthPercent;

      // Update enemies
      this.enemies.children.entries.forEach((enemy, index) => {
        if (!enemy.inCombat) {
          // Move enemy left towards player
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

        if (distance < 100 && !enemy.inCombat && !this.combatInProgress) {
          startCombat.call(this, enemy);
        }
      });
    }

    function spawnEnemy() {
      const centerY = this.centerY;
      const spawnX = this.cameras.main.width + 100;

      const enemyList = this.locationRef === 'forest' ? ENEMY_DEFINITIONS.forest : ENEMY_DEFINITIONS.ruins;
      const randomEnemy = enemyList[Math.floor(Math.random() * enemyList.length)];

      const spriteKey = `enemy-${randomEnemy.id}`;
      const enemy = this.add.sprite(spawnX, centerY, spriteKey, 0);
      enemy.setScale(4);
      enemy.setDepth(8);
      enemy.setFlipX(true); // Face left
      enemy.speed = 60 + Math.random() * 40;
      enemy.inCombat = false;
      enemy.hp = randomEnemy.hp;
      enemy.maxHp = randomEnemy.hp;
      enemy.def = randomEnemy.def;
      enemy.atk = randomEnemy.atk;
      enemy.xp = randomEnemy.xp;
      enemy.gold = randomEnemy.gold;
      enemy.definition = randomEnemy;

      // Play attack animation
      enemy.play(`enemy-${randomEnemy.id}-attack`, true);

      // Enemy health bar
      const hpBg = this.add.rectangle(spawnX, centerY - 100, 80, 10, 0x333333);
      hpBg.setDepth(7);
      hpBg.setStrokeStyle(1, 0xffffff);
      enemy.hpBarBg = hpBg;

      const hpBar = this.add.rectangle(spawnX, centerY - 100, 80, 10, 0xff4444);
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

      let playerHp = this.playerSprite.hp;
      let enemyHp = enemy.hp;
      let xpGained = 0;
      let goldGained = 0;
      let isCrit = false;

      // Combat loop - single round for now
      const isCriticalHit = Math.random() * 100 < (5 + character.level);
      const playerDamage = Math.max(1, isCriticalHit 
        ? Math.floor((character.atk - enemy.def) * 1.5) 
        : character.atk - enemy.def);
      
      enemyHp -= playerDamage;
      isCrit = isCriticalHit;

      // Player attack animation
      this.playerSprite.play('player-attack', false);

      showDamage.call(this, enemy.x, enemy.y, playerDamage, isCriticalHit);

      await new Promise(r => setTimeout(r, 400));

      if (enemyHp <= 0) {
        // Enemy dies
        xpGained = enemy.xp;
        goldGained = enemy.gold;

        enemy.play(`enemy-${enemy.definition.id}-death`, false);
        enemy.setTint(0x666666);

        await new Promise(r => setTimeout(r, 500));
        enemy.destroy();

        // Update kill count
        this.killCount += 1;
        this.killCountText.setText(`Kills: ${this.killCount}`);
        setEnemiesKilled(this.killCount);

        // Check if should change location (6-9 kills)
        if (this.killCount >= 6 && this.killCount <= 9 && this.killCount % 1 === 0) {
          const shouldChange = this.killCount === 6 || this.killCount === 7 || this.killCount === 8 || this.killCount === 9;
          if (shouldChange && Math.random() > 0.5) {
            const newLocation = this.locationRef === 'forest' ? 'ruins' : 'forest';
            changeLocation.call(this, newLocation);
          }
        }
      } else {
        // Enemy counter-attacks
        const enemyDamage = Math.max(0, enemy.atk - character.def);
        playerHp -= enemyDamage;

        enemy.hp = enemyHp;
        enemy.hpBar.width = 80 * (enemyHp / enemy.maxHp);

        showDamage.call(this, this.playerSprite.x, this.playerSprite.y, enemyDamage, false);

        await new Promise(r => setTimeout(r, 300));
      }

      // Update player health bar
      this.playerSprite.hp = Math.max(0, playerHp);
      const healthPercent = Math.max(0, this.playerSprite.hp / this.playerSprite.maxHp);
      this.hpBar.width = 100 * healthPercent;

      // Return to running
      if (!this.playerSprite.anims.isPlaying) {
        this.playerSprite.play('player-run', true);
      }
      this.playerSprite.inCombat = false;

      // Report combat
      try {
        await api.reportCombat({
          enemyName: enemy.definition.name,
          playerDamage: playerDamage,
          enemyDamage: enemyHp > 0 ? (character.atk - enemy.def) : 0,
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

    async function changeLocation(newLocation) {
      try {
        await api.changeLocation(newLocation);
        setLocation(newLocation);
        this.locationRef = newLocation;
        // Game will restart with new location
      } catch (error) {
        console.error('Location change error:', error);
      }
    }

    function showDamage(x, y, damage, isCrit) {
      const damageText = this.add.text(x, y, damage.toString(), {
        font: `${isCrit ? 'bold' : ''} 24px Arial`,
        fill: isCrit ? '#ffff00' : '#ff6666',
        stroke: '#000000',
        strokeThickness: 3
      });
      damageText.setDepth(12);
      damageText.setOrigin(0.5);

      this.tweens.add({
        targets: damageText,
        y: y - 60,
        alpha: 0,
        duration: 1000,
        onComplete: () => damageText.destroy()
      });
    }

    return () => {
      game.destroy(true);
    };
  }, [location]);

  return (
    <div className="game-screen">
      <div className="hud">
        <div className="hud-left">
          <div className="stat hp">
            ❤️ HP: {gameState?.character?.hp}/{gameState?.character?.maxHp}
          </div>
          <div className="stat level">
            ⭐ Level: {gameState?.character?.level}
          </div>
        </div>

        <div className="hud-center">
          <div className="location-display">
            {location === 'forest' ? '🌲 Forest' : '🏚️ Ruins'}
          </div>
        </div>

        <div className="hud-right">
          <div className="stat gold">
            💰 {gameState?.resources?.gold}
          </div>
          <div className="stat xp">
            ✨ {gameState?.character?.experience}
          </div>
        </div>
      </div>

      <div className="canvas-container" ref={gameRef}></div>
    </div>
  );
}
