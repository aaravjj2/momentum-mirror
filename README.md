# 🎮 Momentum Mirror

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://momentum-mirror.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Phaser](https://img.shields.io/badge/Phaser-3.90-orange)](https://phaser.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> *Physics-Based Ricochet Game with Measurable Skill Mastery*

A browser-based momentum physics game built with **Phaser 3**, **Matter.js**, **TypeScript**, and **Vite**. Master the art of momentum manipulation through 40 challenging levels that test your precision, timing, and physics intuition.

🎮 **[Play Now](https://momentum-mirror.vercel.app)**

## ✨ Features

### Core Gameplay
- 🎯 **40 Unique Levels** across 6 categories (Tutorial, Efficiency, Rhythm, Precision, Hybrid, Master)
- 🔴 **5 Surface Types** with distinct physics: Standard, Spring, Cushion, Curved, and Phase walls
- 📊 **4-Metric Skill System** providing quantifiable feedback on your mastery
- 🎵 **Dynamic Audio** with procedural sound effects and ambient background music
- 🏆 **Personal Leaderboards** tracking your best scores per level
- 💾 **Progress Persistence** via LocalStorage

### Technical Highlights
- ⚡ **60 FPS** deterministic physics with Matter.js
- 🎨 **Modern UI** with particle effects, trails, and smooth animations
- 📱 **Responsive Design** works on desktop and mobile (touch support)
- 🌐 **100% Client-Side** - no backend required
- ⚙️ **TypeScript** strict mode for type safety

## 🚀 Quick Start

### Play Online
Visit **[momentum-mirror.vercel.app](https://momentum-mirror.vercel.app)** and start playing immediately!

### Local Development

```bash
# Clone the repository
git clone https://github.com/aaravjj2/momentum-mirror.git
cd momentum-mirror

# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:5173 (or the port shown) in your browser.

## 🎯 How to Play

### Controls
- **Mouse**: Click and drag to swipe
- **Touch**: Touch and drag (mobile-friendly)

### Mechanics
1. **Swipe to Launch**: Click/touch, drag, and release to launch the ball
   - The ball moves **opposite** to your swipe direction
   - Longer swipes = more power
   - Trajectory preview shows your shot

2. **Reach the Goal**: Get the cyan ball to the golden star

3. **Surface Types**:
   - 🔵 **Blue (Standard)**: Normal bounce (0.85 restitution)
   - 🟢 **Green (Spring)**: Amplifies momentum (1.3x)
   - 🔴 **Red (Cushion)**: Absorbs momentum (0.4x)
   - 🟠 **Orange (Curved)**: Deflects your angle
   - 🟣 **Purple (Phase)**: Toggles on/off — time your passes!

### Skill Metrics
Your mastery is measured across four dimensions:

1. **Momentum Efficiency** (40%): Progress toward goal vs impulse used
2. **Rhythmic Consistency** (30%): Timing variance between swipes
3. **Energy Conservation** (20%): Momentum preserved through collisions
4. **Input Economy** (10%): Swipes used vs optimal

**Composite Score**: 0-100, weighted combination
**Skill Ratings**: Novice → Beginner → Intermediate → Advanced → Expert → Master

## 📚 Level Categories

### 🎓 Tutorial (Levels 1-5)
Master the basics: swipe mechanics, bounces, surfaces, and precision control

### 🎯 Efficiency (Levels 6-10)
Optimize your path with minimal force - economy of motion

### 🎵 Rhythm (Levels 11-15)
Phase walls demand perfect timing - master the beat

### 🎪 Precision (Levels 16-20)
Thread needles at high speed - zero margin for error

### 🌟 Hybrid (Levels 21-30)
All mechanics combined - complex puzzle solving

### 👑 Master (Levels 31-40)
Ultimate challenges - only the best survive these gauntlets

## 🧪 Manual Testing Guide

### Test Each Level Category:

**Level 1 (Tutorial)**: 
- Swipe away from the goal
- Watch the ball travel opposite direction
- Simple straight path

**Level 4 (Surfaces)**:
- Green walls speed you up
- Red walls slow you down
- Test both surface types

**Level 12 (Phase Walls)**:
- Purple walls appear/disappear
- Pass through when transparent
- Time your movement

**Level 16 (Precision)**:
- Navigate narrow gaps
- Requires accurate angle control

**Level 21 (Hybrid)**:
- All surface types present
- Multiple skills required

**Level 30 (Final)**:
- The ultimate test
- Dense obstacles
- Phase walls + all surfaces

### What to Verify:

✅ **Swipe Input**
- Click/drag/release triggers impulse
- Trajectory preview appears
- Power scales with duration
- Direction is opposite to swipe

✅ **Physics**
- Ball bounces realistically
- Speed feels responsive
- Collisions detect accurately
- Goal detection triggers level complete

✅ **Surfaces**
- Green walls boost speed noticeably
- Red walls dampen momentum
- Purple walls toggle on/off
- Each surface has distinct visual color

✅ **Metrics**
- HUD updates in real-time
- Completion shows all 4 metrics
- Score reflects performance
- Better paths = higher efficiency

✅ **Progression**
- Completing level 1 unlocks level 2
- Best scores save
- Refresh preserves progress
- Locked levels show 🔒

✅ **UI Flow**
- Menu → Level Select → Game → Results
- Back buttons work
- Restart button resets level
- Next Level button proceeds

## 🏗️ Project Structure

```
src/
├── config.ts           # Game constants, physics values
├── types.ts            # TypeScript interfaces
├── main.ts             # Phaser initialization
├── scenes/
│   ├── BootScene.ts    # Loading screen
│   ├── MenuScene.ts    # Main menu
│   ├── LevelSelectScene.ts  # Level picker
│   ├── GameScene.ts    # Core gameplay
│   └── ResultsScene.ts # Metrics display
├── levels/
│   └── LevelData.ts    # 30 level definitions
├── metrics/
│   └── MetricsEngine.ts # 4-metric tracking system
├── input/
│   └── SwipeHandler.ts # Touch/mouse input
└── utils/
    ├── Vector.ts       # Math utilities
    ├── Storage.ts      # LocalStorage persistence
    └── Replay.ts       # Replay recording
```

## 🔧 Technical Details

### Physics Constants
- Base Impulse: 1.5×
- Gravity: 0 (top-down)
- Friction: 0.02/second
- Fixed Timestep: 16.67ms (60 FPS)

### Metric Formulas

**Efficiency** = Σ(distance_toward_goal) / Σ(impulse_magnitude)

**Conservation** = (1 - Σ(momentum_loss) / initial) × complexity_factor

**Rhythm Entropy** = σ(inter_swipe_times) / μ(inter_swipe_times)

**Input Density** = actual_swipes / optimal_swipes

**Composite** = (efficiency × 0.4) + (rhythm × 0.3) + (conservation × 0.2) + (economy × 0.1)

## 📦 Build Commands

```bash
# Development server with hot reload
npm run dev

# TypeScript type checking
npx tsc --noEmit

# Production build
npm run build

# Preview production build
npm run preview
```

## 🎨 Design Principles

1. **Physically Felt Interaction**: Immediate, satisfying feedback on every action
2. **Low Floor, High Ceiling**: Easy to learn, infinitely difficult to master
3. **Measurable Compression**: Your skill leaves numerical fingerprints
4. **Metric Coupling**: No single metric can be optimized independently
5. **Motor > Cognitive**: Improvement comes from finger skill, not just planning

## 🎵 Audio System

The game features a **procedurally generated audio system** using the Web Audio API:

- **Swipe Sounds**: Pitch scales with power (200-400 Hz)
- **Collision Sounds**: Different waveforms for each surface type
  - Standard: Sine wave (150 Hz base)
  - Spring: Triangle wave (300 Hz)
  - Cushion: Soft sine (100 Hz)
  - Curved: Square wave (250 Hz)
  - Phase: Sawtooth (400 Hz)
- **Goal Celebration**: Harmonic chord progression (C5, E5, G5)
- **Ambient Music**: Layered sine waves with LFO modulation for atmospheric background
- **UI Sounds**: Click and hover feedback

All audio is generated in real-time - no audio files needed!

## ⚠️ Known Limitations

- Phase walls use instant toggling (no smooth fade transitions)
- Curved wall deflection uses simplified angular rotation
- Local leaderboards only (no online global leaderboards)
- No level editor or custom level support
- Audio system uses Web Audio API (no external audio files)

## 📝 Implementation Status

**✅ Fully Implemented:**
- Core swipe mechanics with trajectory preview
- Deterministic physics (Matter.js, 60 FPS)
- **40 challenging levels** across 6 categories
- 4-metric skill tracking system with real-time HUD
- All 5 surface types with distinct physics
- **Procedural audio system** (swipe, collision, goal sounds)
- **Ambient background music** with Web Audio API
- **Personal leaderboard** with progress tracking
- Progress persistence via LocalStorage
- Visual effects (particles, trails, glow animations)
- Responsive UI with touch support
- Audio controls (mute music/SFX)

**❌ Not Implemented:**
- Agent testing framework (Playwright) - for QA automation
- Learning detection algorithms
- Online global leaderboards (backend required)
- Level editor
- Replay sharing system

## 🎯 Success Criteria (from Spec)

✅ Smooth difficulty curve from beginner to advanced  
✅ Each level demonstrates unique skill expression  
✅ Visual feedback clearly communicates physics state  
✅ Measurable skill progression across 4 metrics  
✅ Deterministic physics for reliable testing  
✅ Performance: 60 FPS maintained  

## 🤝 Contributing

This is an educational project, but contributions are welcome! Feel free to:
- Report bugs or issues
- Suggest new level designs
- Improve the audio system
- Add new features

## 📄 License

MIT License - feel free to use this code for learning and educational purposes.

## 🎮 Start Playing!

**🌐 Online**: [momentum-mirror.vercel.app](https://momentum-mirror.vercel.app)

**💻 Local**:
```bash
git clone https://github.com/aaravjj2/momentum-mirror.git
cd momentum-mirror
npm install
npm run dev
```

---

**Target Audience**: Skill-focused gamers, speedrunners, physics puzzle enthusiasts  
**Estimated Playtime**: 3-6 hours to complete all 40 levels  
**Skill Ceiling**: Infinite — optimizing for master-level metrics never ends

Built with ❤️ using Phaser 3, Matter.js, TypeScript, and Web Audio API
**Estimated Playtime**: 2-4 hours to complete all 30 levels  
**Skill Ceiling**: Infinite — optimizing for world-class metrics never ends
