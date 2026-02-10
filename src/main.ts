import Phaser from 'phaser';
import { RENDER, SCENES } from './config';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';
import { GameScene } from './scenes/GameScene';
import { ResultsScene } from './scenes/ResultsScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: RENDER.WIDTH,
  height: RENDER.HEIGHT,
  backgroundColor: '#0a0a1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, LevelSelectScene, LeaderboardScene, GameScene, ResultsScene],
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
  },
  fps: {
    target: RENDER.FPS,
    forceSetTimeOut: false,
  },
  input: {
    activePointers: 1,
  },
};

// Launch game
const game = new Phaser.Game(config);

// Handle window resize
window.addEventListener('resize', () => {
  game.scale.refresh();
});

export default game;
