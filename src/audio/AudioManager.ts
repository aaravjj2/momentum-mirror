/**
 * AudioManager - Handles all game audio using Web Audio API
 * Generates procedural sound effects and manages background music
 */

export class AudioManager {
  private context: AudioContext;
  private masterGain: GainNode;
  private musicGain: GainNode;
  private sfxGain: GainNode;
  private muted: boolean = false;
  private musicMuted: boolean = false;
  private currentMusic: OscillatorNode[] = [];

  constructor() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);

    this.musicGain = this.context.createGain();
    this.musicGain.connect(this.masterGain);
    this.musicGain.gain.value = 0.3;

    this.sfxGain = this.context.createGain();
    this.sfxGain.connect(this.masterGain);
    this.sfxGain.gain.value = 0.5;
  }

  /**
   * Resume audio context (needed after user interaction)
   */
  async resume(): Promise<void> {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  /**
   * Play swipe sound - rising pitch based on power
   */
  playSwipe(power: number): void {
    if (this.muted) return;
    this.resume();

    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.type = 'sine';
    const basePitch = 200 + power * 200; // 200-400 Hz based on power
    osc.frequency.setValueAtTime(basePitch, now);
    osc.frequency.exponentialRampToValueAtTime(basePitch * 1.5, now + 0.1);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Play collision sound - pitch varies by impact speed
   */
  playCollision(velocity: number, surfaceType: string): void {
    if (this.muted) return;
    this.resume();

    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    // Different tones for different surfaces
    let baseFreq = 150;
    let waveType: OscillatorType = 'sine';
    
    switch (surfaceType) {
      case 'spring':
        baseFreq = 300;
        waveType = 'triangle';
        break;
      case 'cushion':
        baseFreq = 100;
        waveType = 'sine';
        break;
      case 'curved':
        baseFreq = 250;
        waveType = 'square';
        break;
      case 'phase':
        baseFreq = 400;
        waveType = 'sawtooth';
        break;
    }

    osc.type = waveType;
    const pitch = baseFreq + velocity * 50;
    osc.frequency.setValueAtTime(pitch, now);

    const volume = Math.min(0.4, velocity * 0.1);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Play goal reached success sound
   */
  playGoal(): void {
    if (this.muted) return;
    this.resume();

    const now = this.context.currentTime;
    
    // Chord progression for success
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.connect(gain);
      gain.connect(this.sfxGain);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      
      const delay = i * 0.08;
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.3, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.4);
      
      osc.start(now + delay);
      osc.stop(now + delay + 0.4);
    });
  }

  /**
   * Play menu navigation sound
   */
  playClick(): void {
    if (this.muted) return;
    this.resume();

    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Play menu hover sound
   */
  playHover(): void {
    if (this.muted) return;
    this.resume();

    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * Start ambient background music
   */
  startMusic(): void {
    if (this.musicMuted) return;
    this.stopMusic();
    this.resume();

    const now = this.context.currentTime;
    
    // Create a simple ambient pad with multiple layers
    const notes = [
      { freq: 110, detune: 0 },    // A2
      { freq: 165, detune: 5 },    // E3 (slightly detuned)
      { freq: 220, detune: -5 },   // A3 (slightly detuned)
      { freq: 277.18, detune: 3 }, // C#4 (slightly detuned)
    ];

    notes.forEach((note, i) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      const filter = this.context.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.type = 'sine';
      osc.frequency.value = note.freq;
      osc.detune.value = note.detune;

      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 1;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 2);

      // Add subtle LFO for movement
      const lfo = this.context.createOscillator();
      const lfoGain = this.context.createGain();
      lfo.frequency.value = 0.1 + i * 0.05;
      lfoGain.gain.value = 10;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      lfo.start(now);

      osc.start(now);
      this.currentMusic.push(osc);
    });
  }

  /**
   * Stop background music
   */
  stopMusic(): void {
    const now = this.context.currentTime;
    this.currentMusic.forEach(osc => {
      try {
        osc.stop(now + 0.5);
      } catch (e) {
        // Already stopped
      }
    });
    this.currentMusic = [];
  }

  /**
   * Toggle sound effects mute
   */
  toggleMute(): boolean {
    this.muted = !this.muted;
    this.sfxGain.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  }

  /**
   * Toggle music mute
   */
  toggleMusic(): boolean {
    this.musicMuted = !this.musicMuted;
    if (this.musicMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.musicMuted;
  }

  /**
   * Set master volume
   */
  setVolume(volume: number): void {
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current mute state
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Get current music mute state
   */
  isMusicMuted(): boolean {
    return this.musicMuted;
  }
}

// Global singleton instance
let audioManager: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManager) {
    audioManager = new AudioManager();
  }
  return audioManager;
}
