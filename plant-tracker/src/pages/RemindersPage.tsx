import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Droplets, Check } from 'lucide-react';
import { useAuth, getUserId } from '../contexts/AuthContext';
import { subscribeUserPlants, updateUserPlant, addCareEvent } from '../lib/storage';
import { getPlant } from '../data/plants';
import { calculateDose, computeNextFertilizerDate, daysUntil, isOverdue } from '../lib/fertilizer';
import { requestNotificationPermission, checkDueReminders } from '../lib/notifications';
import type { UserPlant } from '../types';

export function RemindersPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (!user) return;
    return subscribeUserPlants(getUserId(user), setPlants);
  }, [user]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const reminders = plants
      .filter((p) => p.nextFertilizerDate)
      .map((p) => {
        const dose = calculateDose(
          p.potVolumeL,
          p.fertilizerId,
          p.customFertilizer,
          p.customSubstrateMix.length > 0 ? null : p.substrateId,
          p.customSubstrateMix
        );
        return {
          id: p.id,
          nickname: p.nickname,
          nextFertilizerDate: p.nextFertilizerDate!,
          doseMl: dose.doseMl,
        };
      });
    checkDueReminders(reminders);
  }, [plants]);

  const duePlants = plants
    .filter((p) => p.nextFertilizerDate)
    .sort((a, b) => (a.nextFertilizerDate! > b.nextFertilizerDate! ? 1 : -1));

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
  };

  const handleMarkDone = async (plant: UserPlant) => {
    if (!user) return;
    const catalog = getPlant(plant.plantId);
    const dose = calculateDose(
      plant.potVolumeL,
      plant.fertilizerId,
      plant.customFertilizer,
      plant.customSubstrateMix.length > 0 ? null : plant.substrateId,
      plant.customSubstrateMix
    );
    const today = new Date().toISOString().split('T')[0];
    const nextDate = catalog
      ? computeNextFertilizerDate(catalog.fertilizerFrequencyDays)
      : computeNextFertilizerDate(14);
    await updateUserPlant(getUserId(user), plant.id, {
      lastFertilized: today,
      nextFertilizerDate: nextDate,
    });
    await addCareEvent({
      userId: getUserId(user),
      userPlantId: plant.id,
      type: 'fertilize',
      date: today,
      doseMl: dose.doseMl,
      notes: '',
    });
  };

  return (
    <div className="md:ml-48">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-soil-900">{t('reminders.title')}</h2>
        </div>
        {notifPermission !== 'granted' && (
          <button
            onClick={handleEnableNotifications}
            className="flex items-center gap-2 rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
          >
            <Bell className="h-4 w-4" />
            {t('reminders.enableNotifications')}
          </button>
        )}
        {notifPermission === 'granted' && (
          <span className="text-sm text-leaf-600">{t('reminders.notificationsEnabled')}</span>
        )}
        {notifPermission === 'denied' && (
          <span className="text-sm text-red-500">{t('reminders.notificationsDenied')}</span>
        )}
      </div>

      {duePlants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-leaf-300 bg-white p-12 text-center">
          <Bell className="mx-auto h-10 w-10 text-leaf-300" />
          <p className="mt-3 text-lg font-medium text-soil-700">{t('reminders.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {duePlants.map((plant) => {
            const dose = calculateDose(
              plant.potVolumeL,
              plant.fertilizerId,
              plant.customFertilizer,
              plant.customSubstrateMix.length > 0 ? null : plant.substrateId,
              plant.customSubstrateMix
            );
            const overdue = plant.nextFertilizerDate
              ? isOverdue(plant.nextFertilizerDate)
              : false;
            const days = plant.nextFertilizerDate
              ? daysUntil(plant.nextFertilizerDate)
              : 0;
            const catalog = getPlant(plant.plantId);

            return (
              <div
                key={plant.id}
                className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm ${
                  overdue
                    ? 'border-red-200 bg-red-50'
                    : days === 0
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-leaf-200 bg-white'
                }`}
              >
                <span className="text-3xl">{catalog?.emoji ?? '🌱'}</span>
                <div className="flex-1">
                  <Link
                    to={`/portfolio/${plant.id}`}
                    className="font-semibold hover:text-leaf-600"
                  >
                    {plant.nickname}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <Droplets className="h-4 w-4 text-leaf-600" />
                    {overdue
                      ? t('reminders.overdue')
                      : days === 0
                        ? t('reminders.today')
                        : t('reminders.inDays', { days })}
                    {dose.doseMl > 0 && (
                      <span className="text-soil-600">
                        — {t('reminders.dose', { dose: dose.doseMl, water: dose.waterMl })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-soil-500">{plant.nextFertilizerDate}</p>
                </div>
                <button
                  onClick={() => handleMarkDone(plant)}
                  className="flex items-center gap-1 rounded-lg bg-leaf-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-leaf-700"
                >
                  <Check className="h-3 w-3" />
                  {t('reminders.markDone')}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
