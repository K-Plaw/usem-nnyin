import confetti from 'canvas-confetti';

/**
 * Fires a joyful indigenous-themed celebratory confetti cannon (emerald greens, golden ochre, vibrant amber)
 */
export function triggerCelebrationConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#047857', '#F59E0B', '#10B981', '#FBBF24', '#D97706', '#E11D48'],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Realistic multi-stage burst
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

/**
 * Fires grand multi-cannon fireworks for complete course mastery!
 */
export function triggerCourseCompletionFireworks() {
  const duration = 4 * 1000;
  const animationEnd = Date.now() + duration;
  const colors = ['#047857', '#F59E0B', '#10B981', '#FBBF24', '#D97706', '#E11D48', '#8B5CF6'];

  // Initial center burst
  triggerCelebrationConfetti();

  const interval: ReturnType<typeof setInterval> = setInterval(function () {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 40 * (timeLeft / duration);

    confetti({
      particleCount,
      angle: 60,
      spread: 70,
      origin: { x: 0.1, y: 0.6 },
      colors,
    });
    confetti({
      particleCount,
      angle: 120,
      spread: 70,
      origin: { x: 0.9, y: 0.6 },
      colors,
    });
    confetti({
      particleCount: 25,
      spread: 100,
      origin: { x: 0.5, y: 0.4 },
      colors,
    });
  }, 300);
}

/**
 * Fires side cannons for milestone achievements or streak records
 */
export function triggerStreakRecordFanfare() {
  const end = Date.now() + 1.5 * 1000;
  const colors = ['#047857', '#F59E0B', '#FBBF24', '#34D399'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
