export async function initializeFirebase() {
  return null;
}

export async function getFCMToken(): Promise<string | null> {
  return null;
}

export function onForegroundMessage(_callback: (payload: unknown) => void): (() => void) | undefined {
  return undefined;
}

export function isNotificationsSupported(): boolean {
  return false;
}

export function getNotificationPermission(): NotificationPermission | null {
  return null;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  return "denied";
}