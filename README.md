# Telegram Idle RPG

A full-stack Idle RPG game built for Telegram Mini Apps with automatic combat, character progression, and offline rewards.

## Tech Stack

- **Frontend**: React + Phaser + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Neon)
- **Deployment**: Railway

## Project Structure

```
├── server/
│   ├── index.js                 # Main server file
│   ├── telegram/
│   │   └── bot.js              # Telegram bot setup
│   ├── db/
│   │   └── database.js         # Database initialization
│   ├── middleware/
│   │   └── auth.js             # Telegram authentication
│   ├── game/
│   │   ├── offlineProgress.js  # Offline progress calculation
│   │   ├── gameState.js        # Game state management
│   │   └── enemies.js          # Enemy definitions
│   └── routes/
│       ├── game.js             # Game state APIs
│       ├── player.js           # Player APIs
│       ├── quests.js           # Quest APIs
│       └── clans.js            # Clan APIs
├── src/
│   ├── main.jsx                # Entry point
│   ├── App.jsx                 # Main app component
│   ├── screens/                # Game screens
│   ├── utils/
│   │   ├── api.js              # API client
│   │   └── game.js             # Game utilities
│   └── styles/                 # Component styles
├── Assets/
│   ├── Player/                 # Player sprites
│   └── Mobs/                   # Enemy sprites
├── vite.config.js              # Vite config
└── package.json
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL/Neon account
- Telegram Bot Token

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Setup environment variables**

Create a `.env.local` file with:
```
BOT_TOKEN=your_telegram_bot_token
BOT_USERNAME=your_bot_username
WEBAPP_URL=https://your-webapp-url
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=8080
```

3. **Initialize database**

The database tables are automatically created on server startup.

4. **Start development**

```bash
npm run dev
```

This runs both the backend server (port 3000) and frontend dev server (port 5173).

### Building for Production

```bash
npm run build
npm start
```

## Game Features (MVP)

### Core Gameplay
- Auto-running character with automatic combat
- 2 locations: Forest and Ruins
- 8 enemy types with progressive difficulty
- Real-time damage calculation: Damage = ATK - DEF
- Critical hit system (5% + 1% per level, max 25%)

### Character Progression
- Level system with XP requirements
- 4 base stats: HP, ATK, DEF, Attack Speed
- Stat growth on level up and equipment

### Equipment System
- 3 equipment slots: Weapon, Armor, Artifact
- 3 rarity tiers: Common, Rare, Epic
- Stat bonuses: ATK, DEF, HP

### Offline Progression
- Max 8 hours of offline rewards
- Gold and XP generation based on stats
- Clan bonuses applied automatically

### Quests
- Game tasks: Kill enemies, earn gold, level up, equip items
- Telegram tasks: Login, consecutive days, clan activities
- Quest completion rewards: Gold and XP

### Clans
- Create and join clans
- Leader and member roles
- Clan bonuses: Gold%, XP%
- Member directory

## API Endpoints

### Game State
- `POST /api/game/state` - Get current game state
- `POST /api/game/location` - Change location
- `POST /api/game/combat` - Report combat result

### Player
- `GET /api/player/profile` - Get player profile
- `GET /api/player/equipment` - Get equipment
- `POST /api/player/equip` - Equip item

### Quests
- `GET /api/quests` - Get player quests
- `POST /api/quests/:id/complete` - Complete quest

### Clans
- `POST /api/clans/create` - Create clan
- `POST /api/clans/join` - Join clan
- `GET /api/clans/:id` - Get clan info

## Authentication

Uses Telegram Mini App authentication. The server verifies:
1. Init data signature
2. User identity through Telegram Web App

## Performance Optimization

- Sprite batching for multiple enemies
- Delta time-based animations
- Efficient canvas rendering
- Server-side combat calculation
- Offline progress caching

## Security

- Telegram signature verification
- Server-side combat validation
- No client-side stat manipulation
- SQL injection prevention (parameterized queries)
- CORS configured for safety

## Future Enhancements (Not MVP)

- PvP Arena
- Reincarnation system
- Boss battles
- In-game events
- Premium currency
- New locations
- Equipment enchanting
- Trading system
