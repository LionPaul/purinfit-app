/**
 * Screen Wake Lock Utility
 * Prevents mobile screens from dimming or locking during active workouts, rest timers, and dance sessions.
 */

let wakeLockSentinel: any = null;

export async function requestScreenWakeLock(): Promise<boolean> {
  if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
    return false;
  }
  try {
    if (!wakeLockSentinel || wakeLockSentinel.released) {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    }
    return true;
  } catch {
    // Wake Lock request can fail if page is not visible or low battery
    return false;
  }
}

export async function releaseScreenWakeLock(): Promise<void> {
  if (wakeLockSentinel && !wakeLockSentinel.released) {
    try {
      await wakeLockSentinel.release();
    } catch {
      // Ignore
    } finally {
      wakeLockSentinel = null;
    }
  }
}
