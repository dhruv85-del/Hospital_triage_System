/**
 * Procedural Medical Chime Synthesizer using Web Audio API
 * No external mp3 files required.
 */
let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a pleasant 3-tone chime (F5 -> A5 -> C6) for patient call announcements
 */
export function playCallChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [698.46, 880.00, 1046.50]; // F5, A5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.16);

      // Envelope
      gain.gain.setValueAtTime(0, now + index * 0.16);
      gain.gain.linearRampToValueAtTime(0.2, now + index * 0.16 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.16 + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.16);
      osc.stop(now + index * 0.16 + 0.7);
    });
  } catch (err) {
    console.warn('Audio chime playback omitted (user interaction needed):', err);
  }
}

/**
 * Plays a soft positive confirmation sound (C5 -> G5)
 */
export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 783.99]; // C5, G5
    const now = ctx.currentTime;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.12);

      gain.gain.setValueAtTime(0, now + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, now + index * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.12);
      osc.stop(now + index * 0.12 + 0.5);
    });
  } catch (err) {
    console.warn('Audio chime omitted:', err);
  }
}
