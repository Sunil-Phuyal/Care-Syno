import { API_BASE_URL } from './constants';

/**
 * Free hosting puts the API to sleep when it is idle, and waking it takes a few minutes.
 * Call this once when the app loads so the API is already waking up while the user is
 * still reading the login page. Fire and forget: the result does not matter, and a
 * failure here must never break the app.
 */
export function warmUpApi(): void {
  try {
    const origin = new URL(API_BASE_URL).origin;
    void fetch(`${origin}/hello`, { mode: 'no-cors', cache: 'no-store' }).catch(() => undefined);
  } catch {
    // ignore: a malformed URL must not stop the app from starting
  }
}