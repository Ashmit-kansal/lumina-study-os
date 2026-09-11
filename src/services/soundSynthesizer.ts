/**
 * Web Audio API Sound Synthesizer
 * Provides crystal clear alert chimes, metronome ticks, and procedural ambient audio
 * (Rain, Cafe murmurs, Binaural 432Hz focus waves, White/Pink noise)
 */

class SoundSynthesizer {
  private audioCtx: AudioContext | null = null;
  private ambientNodes: Map<string, { gain: GainNode; stop: () => void }> = new Map();

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays a tranquil, modern Zen chime for Focus completion
   */
  public playFocusCompleteChime(volume: number = 0.7): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Harmonic bell chords (F# major pentatonic for uplifting completion)
      const frequencies = [554.37, 659.25, 830.61, 1108.73, 1318.51];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        // Soft exponential decay
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime((volume * 0.25) / (idx + 1), now + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 2.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 3.0);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Plays a refreshing, dual-tone chime for Break completion
   */
  public playBreakCompleteChime(volume: number = 0.7): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const freqs = [440, 554.37, 659.25];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(volume * 0.2, now + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 2.0);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Plays a soft wooden tick sound for Pomodoro countdown
   */
  public playTick(volume: number = 0.15): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

      gain.gain.setValueAtTime(volume * 0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // ignore
    }
  }

  /**
   * Procedural Ambient Generators
   */
  public startAmbientLayer(type: 'rain' | 'cafe' | 'binaural' | 'whitenoise' | 'forest', volume: number): void {
    try {
      const ctx = this.getAudioContext();
      this.stopAmbientLayer(type);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(Math.max(0.0001, volume / 100 * 0.4), ctx.currentTime);
      gain.connect(ctx.destination);

      let stopFn = () => {};

      if (type === 'binaural') {
        // 432Hz Alpha/Theta Focus frequency (Left: 432Hz, Right: 440Hz -> 8Hz Alpha beat)
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        const panL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const panR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(432, ctx.currentTime);

        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(440, ctx.currentTime); // 8Hz beat

        if (panL && panR) {
          panL.pan.setValueAtTime(-1, ctx.currentTime);
          panR.pan.setValueAtTime(1, ctx.currentTime);
          oscL.connect(panL).connect(gain);
          oscR.connect(panR).connect(gain);
        } else {
          oscL.connect(gain);
          oscR.connect(gain);
        }

        oscL.start();
        oscR.start();

        stopFn = () => {
          try {
            oscL.stop();
            oscR.stop();
          } catch {}
        };
      } else if (type === 'whitenoise' || type === 'rain' || type === 'cafe' || type === 'forest') {
        // Buffer-based procedural noise generator with bandpass / lowpass filtering
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
          const data = noiseBuffer.getChannelData(channel);
          let lastOut = 0.0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // Pink/Brown noise filtering
            if (type === 'rain' || type === 'cafe') {
              lastOut = (lastOut + 0.02 * white) / 1.02;
              data[i] = lastOut * 3.5;
            } else if (type === 'forest') {
              lastOut = (lastOut + 0.05 * white) / 1.05;
              data[i] = lastOut * 2.0;
            } else {
              data[i] = white * 0.3;
            }
          }
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        if (type === 'rain') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, ctx.currentTime);
        } else if (type === 'cafe') {
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(450, ctx.currentTime);
          filter.Q.setValueAtTime(1.5, ctx.currentTime);
        } else if (type === 'forest') {
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(1200, ctx.currentTime);
        } else {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(3000, ctx.currentTime);
        }

        noiseSource.connect(filter);
        filter.connect(gain);
        noiseSource.start();

        stopFn = () => {
          try {
            noiseSource.stop();
          } catch {}
        };
      }

      this.ambientNodes.set(type, { gain, stop: stopFn });
    } catch {
      // handle audio context errors
    }
  }

  public updateAmbientVolume(type: string, volume: number): void {
    const node = this.ambientNodes.get(type);
    if (node && this.audioCtx) {
      node.gain.gain.setValueAtTime(Math.max(0.0001, (volume / 100) * 0.4), this.audioCtx.currentTime);
    }
  }

  public stopAmbientLayer(type: string): void {
    const node = this.ambientNodes.get(type);
    if (node) {
      node.stop();
      this.ambientNodes.delete(type);
    }
  }

  public stopAllAmbient(): void {
    this.ambientNodes.forEach((node) => node.stop());
    this.ambientNodes.clear();
  }
}

export const soundSynthesizer = new SoundSynthesizer();
