# 🎮 Momentum Mirror

*Physics-Based Ricochet Game with Measurable Skill Mastery*

A browser-based game built with **Phaser 3**, **Matter.js**, **TypeScript**, and **Vite** that tests your motor skills through momentum-based physics puzzles.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 (or the port shown) in your browser.

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

### 🎓 Tutorial (1-5)
Master the basics: swipe, bounce, surfaces, precision

### 🎯 Efficiency (6-10)
Optimize your path with minimal force

### 🎵 Rhythm (11-15)
Phase walls demand perfect timing

### 🎪 Precision (16-20)
Thread needles at high speed

### 🌟 Hybrid (21-25)
All mechanics combined

### 🏆 Advanced (26-30)
Ultimate challenges for masters

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

1. **Physically Felt Interaction**: Immediate, satisfying feedback
2. **Low Floor, High Ceiling**: Easy to learn, hard to master
3. **Measurable Compression**: Skill leaves numerical fingerprints
4. **Metric Coupling**: No single metric can be optimized independently
5. **Motor > Cognitive**: Improvement from finger skill, not planning

## 🐛 Known Limitations

- No sound/music implementation
- Phase walls use visual toggling (no smooth fade)
- Curved wall deflection is simplified
- No online leaderboards
- No level editor
- Agent testing framework not implemented

## 📝 Implementation Status

**✅ Fully Implemented:**
- Core swipe mechanics
- Deterministic physics (Matter.js)
- 30 challenging levels
- 4-metric skill tracking system
- All 5 surface types
- Progress persistence
- Visual effects & polish
- Responsive UI

**❌ Not Implemented:**
- Agent testing framework (Playwright)
- Learning detection algorithms
- Online features (leaderboards, sharing)
- Sound effects / music
- Level editor

## 🎯 Success Criteria (from Spec)

✅ Smooth difficulty curve from beginner to advanced  
✅ Each level demonstrates unique skill expression  
✅ Visual feedback clearly communicates physics state  
✅ Measurable skill progression across 4 metrics  
✅ Deterministic physics for reliable testing  
✅ Performance: 60 FPS maintained  

## 📄 License

This is an educational implementation of the Momentum Mirror design specification (February 10, 2026).

## 🎮 Start Playing!

```bash
npm install
npm run dev
```

Navigate to the displayed URL and click **PLAY** to begin your momentum-mastery journey!

---

**Target Audience**: Skill-focused gamers, speedrunners, physics puzzle enthusiasts  
**Estimated Playtime**: 2-4 hours to complete all 30 levels  
**Skill Ceiling**: Infinite — optimizing for world-class metrics never ends
