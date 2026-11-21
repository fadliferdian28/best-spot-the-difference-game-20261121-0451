// Harbour Lights — tiny WebAudio sound kit. No audio files, no network:
// every sound is a few oscillators shaped in code. M mutes everything.
export function createSoundKit() {
  let audioContext = null;
  let muted = false;

  function context() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      audioContext = new AudioContextClass();
    }
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  }

  function tone(frequency, startAt, duration, type, volume) {
    const ctx = context();
    if (!ctx || muted) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(ctx.currentTime + startAt);
    oscillator.stop(ctx.currentTime + startAt + duration + 0.05);
  }

  return {
    get muted() { return muted; },
    toggleMute() { muted = !muted; return muted; },
    chime() { tone(880, 0, 0.35, 'sine', 0.22); tone(1318, 0.09, 0.4, 'sine', 0.18); },
    wrong() { tone(180, 0, 0.18, 'square', 0.08); tone(140, 0.1, 0.22, 'square', 0.08); },
    hint() { tone(660, 0, 0.2, 'triangle', 0.16); tone(990, 0.12, 0.3, 'triangle', 0.14); },
    roundWin() { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.4, 'sine', 0.2)); },
    finalWin() { [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => tone(f, i * 0.12, 0.5, 'sine', 0.2)); },
    click() { tone(440, 0, 0.08, 'triangle', 0.1); },
  };
}
