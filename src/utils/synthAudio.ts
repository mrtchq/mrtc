import { calculateAmbientHumState, type AmbientHumState } from './cognitiveEngine';

interface AmbientGraph {
  subOsc: OscillatorNode;
  harmonicOsc: OscillatorNode;
  harmonicGain: GainNode;
  lfoOsc: OscillatorNode;
  lfoGain: GainNode;
  filter: BiquadFilterNode;
  masterGain: GainNode;
}

class SynthAudioEngine {
  private ctx: AudioContext | null = null;
  private ambient: AmbientGraph | null = null;
  private currentState: AmbientHumState = calculateAmbientHumState(0, 0);
  private lastProgress = 0;
  private settleTimer: number | null = null;
  private isHidden = false;
  public enabled = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public ensureAmbientStarted(): AmbientHumState {
    if (!this.enabled || this.isHidden) return this.currentState;
    try {
      const ctx = this.getContext();
      if (!ctx) return this.currentState;

      if (!this.ambient) {
        const now = ctx.currentTime;
        const subOsc = ctx.createOscillator();
        const harmonicOsc = ctx.createOscillator();
        const harmonicGain = ctx.createGain();
        const lfoOsc = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const masterGain = ctx.createGain();

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(this.currentState.baseFreqHz, now);

        harmonicOsc.type = 'triangle';
        harmonicOsc.frequency.setValueAtTime(this.currentState.harmonicFreqHz, now);
        harmonicGain.gain.setValueAtTime(0.24, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(this.currentState.filterCutoffHz, now);
        filter.Q.setValueAtTime(1.4, now);

        // Gentle 0.24 Hz breathing modulation
        lfoOsc.type = 'sine';
        lfoOsc.frequency.setValueAtTime(0.24, now);
        lfoGain.gain.setValueAtTime(0.0035, now);

        // Smooth fade-in from silence
        masterGain.gain.setValueAtTime(0.0001, now);
        masterGain.gain.setTargetAtTime(this.currentState.gain, now, 0.35);

        subOsc.connect(filter);
        harmonicOsc.connect(harmonicGain);
        harmonicGain.connect(filter);
        filter.connect(masterGain);

        lfoOsc.connect(lfoGain);
        lfoGain.connect(masterGain.gain);

        masterGain.connect(ctx.destination);

        subOsc.start(now);
        harmonicOsc.start(now);
        lfoOsc.start(now);

        this.ambient = {
          subOsc,
          harmonicOsc,
          harmonicGain,
          lfoOsc,
          lfoGain,
          filter,
          masterGain,
        };
      } else {
        const now = ctx.currentTime;
        this.ambient.masterGain.gain.setTargetAtTime(this.currentState.gain, now, 0.16);
      }
    } catch {
      // Ignore Web Audio restrictions prior to gesture
    }
    return this.currentState;
  }

  public modulateAmbient(progress: number, velocityNorm = 0): AmbientHumState {
    this.lastProgress = progress;
    const state = calculateAmbientHumState(progress, velocityNorm);
    this.currentState = state;

    if (this.ambient && this.ctx && this.enabled && !this.isHidden) {
      const now = this.ctx.currentTime;
      this.ambient.subOsc.frequency.setTargetAtTime(state.baseFreqHz, now, 0.07);
      this.ambient.harmonicOsc.frequency.setTargetAtTime(state.harmonicFreqHz, now, 0.07);
      this.ambient.filter.frequency.setTargetAtTime(state.filterCutoffHz, now, 0.08);
      this.ambient.masterGain.gain.setTargetAtTime(state.gain, now, 0.08);
    }

    if (typeof window !== 'undefined' && velocityNorm > 0.01) {
      if (this.settleTimer !== null) {
        window.clearTimeout(this.settleTimer);
      }
      this.settleTimer = window.setTimeout(() => {
        this.settleTimer = null;
        this.modulateAmbient(this.lastProgress, 0);
      }, 150);
    }

    return state;
  }

  public setEnabled(next: boolean) {
    this.enabled = next;
    if (!next) {
      if (this.ambient && this.ctx) {
        this.ambient.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.06);
      }
      return;
    }
    this.ensureAmbientStarted();
    if (this.ambient && this.ctx && !this.isHidden) {
      this.ambient.masterGain.gain.setTargetAtTime(this.currentState.gain, this.ctx.currentTime, 0.14);
    }
  }

  public setVisibilityPaused(hidden: boolean) {
    this.isHidden = hidden;
    if (!this.ambient || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (hidden || !this.enabled) {
      this.ambient.masterGain.gain.setTargetAtTime(0.0001, now, 0.08);
    } else {
      this.ambient.masterGain.gain.setTargetAtTime(this.currentState.gain, now, 0.2);
    }
  }

  public getAmbientState(): AmbientHumState {
    return this.currentState;
  }

  public isAmbientRunning(): boolean {
    return Boolean(this.ambient && this.enabled && !this.isHidden);
  }

  public playBeep(freq = 520, type: OscillatorType = 'sine', duration = 0.15, vol = 0.05) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.35, ctx.currentTime + duration);

      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore autoplay restrictions before user gesture
    }
  }

  public playWarpWhoosh() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.045, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Ignore autoplay restrictions before user gesture
    }
  }

  public playProtocolChord() {
    this.playBeep(880, 'sine', 0.25, 0.07);
    window.setTimeout(() => this.playBeep(1100, 'triangle', 0.2, 0.055), 120);
    window.setTimeout(() => this.playBeep(1320, 'sine', 0.3, 0.065), 240);
  }

  public playSuccessChime() {
    this.playBeep(980, 'triangle', 0.35, 0.07);
    window.setTimeout(() => this.playBeep(1200, 'sine', 0.3, 0.055), 150);
  }
}

export const synthAudio = new SynthAudioEngine();
