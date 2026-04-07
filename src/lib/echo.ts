'use client';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Echo
if (typeof window !== 'undefined') {
  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
}

let echoInstance: Echo<any> | null = null;

/**
 * Get or create the Echo instance
 * Uses Laravel Reverb as the WebSocket server
 */
export function getEcho(): Echo<any> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (echoInstance) {
    return echoInstance;
  }

  // Reverb is not yet configured for HealthShield — disable WebSocket entirely.
  // The app falls back to polling via useBoatCrmRealtime.ts.
  // Re-enable once Reverb server accepts this app's key.
  return null;
}

/**
 * Subscribe to a private channel
 */
export function subscribeToChannel(channelName: string) {
  const echo = getEcho();
  if (!echo) return null;
  return echo.private(channelName);
}

/**
 * Subscribe to a presence channel
 */
export function subscribeToPresenceChannel(channelName: string) {
  const echo = getEcho();
  if (!echo) return null;
  return echo.join(channelName);
}

/**
 * Unsubscribe from a channel
 */
export function unsubscribeFromChannel(channelName: string) {
  const echo = getEcho();
  if (!echo) return;
  echo.leave(channelName);
}

/**
 * Disconnect Echo
 */
export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}

/**
 * Update auth token (call after login)
 */
export function updateEchoAuth(token: string) {
  if (echoInstance) {
    echoInstance.options.auth = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
}

// Type exports
export type EchoChannel = ReturnType<NonNullable<ReturnType<typeof getEcho>>['private']>;
export type EchoPresenceChannel = ReturnType<NonNullable<ReturnType<typeof getEcho>>['join']>;
