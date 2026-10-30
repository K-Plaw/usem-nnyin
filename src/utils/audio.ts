// Audio utilities using Web Audio API for tone synthesis, auditory cues, and speech

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
 * Synthesizes indigenous pitch/tone contours (High, Mid, Low, Falling, Rising)
 * simulating a warm marimba/wooden talking drum resonance for Ibibio and Efik tonal syllables.
 */
export function playIndigenousTone(word: string, toneNotes?: string): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    if (!ctx) {
      fallbackSpeech(word);
      resolve();
      return;
    }

    const syllables = word.split(/[-\s]+/).filter(Boolean);
    const count = Math.max(syllables.length, 1);
    const now = ctx.currentTime;
    const syllableDuration = 0.22;

    syllables.forEach((syl, i) => {
      const startTime = now + (i * syllableDuration);
      
      // Determine approximate pitch contour from tone hints or syllable characteristics
      let baseFreq = 260; // Mid tone
      const isHigh = /[áéíóọ́ẹ́ú\u0301]|high/i.test(syl) || (toneNotes && /high/i.test(toneNotes) && i === 0);
      const isLow = /[àèìòọ̀ẹ̀ù\u0300]|low/i.test(syl) || (toneNotes && /low/i.test(toneNotes) && i === syllables.length - 1);
      
      if (isHigh) baseFreq = 340;
      else if (isLow) baseFreq = 196;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, startTime);

      // Add gentle marimba decay
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.28, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + syllableDuration);

      // Add second harmonic for warm acoustic timber
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(baseFreq * 2, startTime);
      gain2.gain.setValueAtTime(0, startTime);
      gain2.gain.linearRampToValueAtTime(0.09, startTime + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + syllableDuration);

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(ctx.destination);
      gain2.connect(ctx.destination);

      osc.start(startTime);
      osc2.start(startTime);
      osc.stop(startTime + syllableDuration);
      osc2.stop(startTime + syllableDuration);
    });

    // Also trigger clean pronunciation speech if supported
    setTimeout(() => {
      fallbackSpeech(word);
      resolve();
    }, count * syllableDuration * 1000 * 0.7);
  });
}

function fallbackSpeech(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.05;
    utterance.volume = 0.8;
    // Attempt to pick a natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en-NG') || v.lang.startsWith('en-GB') || v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech errors
  }
}

/**
 * Play cheerful success chime for correct exercise answer
 */
export function playSuccessChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = now + (i * 0.08);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.35);
  });
}

/**
 * Play soft gentle wooden try-again cue
 */
export function playMistakeChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const notes = [311.13, 277.18]; // Eb4, Db4 descending
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = now + (i * 0.12);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.28);
  });
}

/**
 * Play celebratory lesson completion fanfare
 */
export function playLessonCompleteFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const arpeggio = [523.25, 659.25, 783.99, 880.00, 1046.50]; // C5, E5, G5, A5, C6
  arpeggio.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = now + (i * 0.1);

    osc.type = i === arpeggio.length - 1 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.6);
  });
}
