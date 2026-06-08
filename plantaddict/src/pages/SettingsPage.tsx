import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { isFirebaseConfigured } from '../lib/firebase';
import { requestNotificationPermission, registerPushToken } from '../lib/notifications';

export function SettingsPage() {
  const { t } = useTranslation();
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const handleEnablePush = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted' && isFirebaseConfigured) {
      await registerPushToken();
    }
  };

  return (
    <div className="md:ml-48">
      <h2 className="mb-6 text-2xl font-bold text-soil-900">{t('settings.title')}</h2>

      <div className="space-y-4">
        <div className="rounded-xl border border-leaf-200 bg-white p-4">
          <h3 className="font-semibold">{t('settings.language')}</h3>
          <div className="mt-3">
            <LanguageSwitcher />
          </div>
        </div>

        <div className="rounded-xl border border-leaf-200 bg-white p-4">
          <h3 className="font-semibold">{t('settings.notifications')}</h3>
          <p className="mt-1 text-sm text-soil-500">
            {notifPermission === 'granted'
              ? t('reminders.notificationsEnabled')
              : notifPermission === 'denied'
                ? t('reminders.notificationsDenied')
                : t('settings.enablePush')}
          </p>
          {notifPermission !== 'granted' && (
            <button
              onClick={handleEnablePush}
              className="mt-3 flex items-center gap-2 rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
            >
              <Bell className="h-4 w-4" />
              {t('settings.enablePush')}
            </button>
          )}
        </div>

        <div className="rounded-xl border border-leaf-200 bg-white p-4">
          <h3 className="font-semibold">{t('settings.firebaseSetup')}</h3>
          <p className="mt-1 text-sm text-soil-500">
            {isFirebaseConfigured
              ? t('settings.firebaseConfigured')
              : t('settings.firebaseNotConfigured')}
          </p>
        </div>
      </div>
    </div>
  );
}
