import { getToken, onMessage } from 'firebase/messaging';
import { initMessaging, vapidKey, isFirebaseConfigured } from './firebase';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  return Notification.requestPermission();
}

export async function registerPushToken(): Promise<string | null> {
  if (!isFirebaseConfigured) return null;

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') return null;

  const messaging = await initMessaging();
  if (!messaging || !vapidKey) return null;

  try {
    const token = await getToken(messaging, { vapidKey });
    localStorage.setItem('plantaddict-fcm-token', token);
    return token;
  } catch {
    return null;
  }
}

export function setupForegroundNotifications(
  onNotify: (title: string, body: string) => void
) {
  if (!isFirebaseConfigured) return;

  initMessaging().then((messaging) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? 'PlantAddict';
      const body = payload.notification?.body ?? '';
      onNotify(title, body);
    });
  });
}

export function scheduleLocalReminder(
  userPlantId: string,
  plantName: string,
  dueDate: string,
  doseMl: number
) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const today = new Date().toISOString().split('T')[0];
  if (dueDate !== today) return;

  const key = `reminder_shown_${userPlantId}_${dueDate}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');

  new Notification('PlantAddict — Engrais', {
    body: `${plantName}: ${doseMl} ml à appliquer aujourd'hui`,
    icon: '/favicon.svg',
    tag: userPlantId,
  });
}

export function checkDueReminders(
  plants: Array<{ id: string; nickname: string; nextFertilizerDate: string | null; doseMl: number }>
) {
  const today = new Date().toISOString().split('T')[0];
  for (const p of plants) {
    if (p.nextFertilizerDate && p.nextFertilizerDate <= today) {
      scheduleLocalReminder(p.id, p.nickname, p.nextFertilizerDate, p.doseMl);
    }
  }
}
