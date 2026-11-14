export type HapticKind = 'slide' | 'orb';

export interface FocusIntervalPreset {
  minutes: number;
  label: string;
  subtitle: string;
}

export const FOCUS_INTERVAL_PRESETS: readonly FocusIntervalPreset[] = [
  { minutes: 5, label: '5m', subtitle: 'Micro Reset' },
  { minutes: 15, label: '15m', subtitle: 'Quick Sprint' },
  { minutes: 25, label: '25m', subtitle: 'Deep Focus' },
  { minutes: 45, label: '45m', subtitle: 'Hyperfocus' },
] as const;

export type DesktopNotificationPermission = NotificationPermission | 'unsupported';

export interface NavigatorLike {
  vibrate?: (pattern: number | number[]) => boolean;
  maxTouchPoints?: number;
  userAgent?: string;
}

export function isMobileOrTouchEnvironment(
  nav: NavigatorLike | undefined = typeof navigator !== 'undefined' ? navigator : undefined,
  win: Window | undefined = typeof window !== 'undefined' ? window : undefined
): boolean {
  if (!nav) return false;
  if ((nav.maxTouchPoints ?? 0) > 0) return true;
  if (typeof win?.matchMedia === 'function') {
    try {
      if (win.matchMedia('(pointer: coarse)').matches) return true;
    } catch {
      // Ignore matchMedia error
    }
  }
  const ua = nav.userAgent ?? '';
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
}

export function triggerSubtleHaptic(
  kind: HapticKind = 'slide',
  nav: NavigatorLike | undefined = typeof navigator !== 'undefined' ? navigator : undefined,
  win: Window | undefined = typeof window !== 'undefined' ? window : undefined
): boolean {
  if (!nav || typeof nav.vibrate !== 'function') return false;
  if (!isMobileOrTouchEnvironment(nav, win)) return false;
  const durationMs = kind === 'orb' ? 16 : 10;
  try {
    return Boolean(nav.vibrate(durationMs));
  } catch {
    return false;
  }
}

export function formatFocusCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export interface NotificationConstructorLike {
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  new (title: string, options?: NotificationOptions): unknown;
}

export function getDesktopNotificationPermission(
  notifApi: Pick<NotificationConstructorLike, 'permission'> | undefined =
    typeof window !== 'undefined' && 'Notification' in window ? window.Notification : undefined
): DesktopNotificationPermission {
  if (!notifApi) return 'unsupported';
  return notifApi.permission;
}

export async function requestDesktopNotificationPermission(
  notifApi: Pick<NotificationConstructorLike, 'permission' | 'requestPermission'> | undefined =
    typeof window !== 'undefined' && 'Notification' in window ? window.Notification : undefined
): Promise<DesktopNotificationPermission> {
  if (!notifApi) return 'unsupported';
  if (notifApi.permission !== 'default') return notifApi.permission;
  try {
    return await notifApi.requestPermission();
  } catch {
    return notifApi.permission;
  }
}

export function dispatchFocusDesktopNotification(
  intervalMinutes: number,
  notifApi: NotificationConstructorLike | undefined =
    typeof window !== 'undefined' && 'Notification' in window
      ? (window.Notification as unknown as NotificationConstructorLike)
      : undefined
): boolean {
  if (!notifApi || notifApi.permission !== 'granted') return false;
  try {
    new notifApi('Focus Interval Elapsed', {
      body: `Your ${intervalMinutes}-minute focus interval is complete. Take a gentle breath before your next sprint.`,
      tag: 'mrtc-focus-interval',
      silent: false,
    });
    return true;
  } catch {
    return false;
  }
}
