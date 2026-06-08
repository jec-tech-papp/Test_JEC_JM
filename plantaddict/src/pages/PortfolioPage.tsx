import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Droplets, MapPin } from 'lucide-react';
import { PlantAvatar } from '../components/PlantAvatar';
import { useAuth, getUserId } from '../contexts/AuthContext';
import { subscribeUserPlants } from '../lib/storage';
import { getPlant } from '../data/plants';
import { calculateDose, daysUntil, isOverdue } from '../lib/fertilizer';
import type { UserPlant } from '../types';

export function PortfolioPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [plants, setPlants] = useState<UserPlant[]>([]);
  const lang = i18n.language as 'en' | 'fr';

  useEffect(() => {
    if (!user) return;
    return subscribeUserPlants(getUserId(user), setPlants);
  }, [user]);

  return (
    <div className="md:ml-48">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-soil-900">{t('portfolio.title')}</h2>
          <p className="text-soil-500">{plants.length} plantes</p>
        </div>
        <Link
          to="/library"
          className="flex items-center gap-1 rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
        >
          <Plus className="h-4 w-4" />
          {t('portfolio.addPlant')}
        </Link>
      </div>

      {plants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-leaf-300 bg-white p-12 text-center">
          <p className="text-lg font-medium text-soil-700">{t('portfolio.empty')}</p>
          <p className="mt-2 text-soil-500">{t('portfolio.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plants.map((up) => {
            const catalog = getPlant(up.plantId);
            const dose = calculateDose(
              up.potVolumeL,
              up.fertilizerId,
              up.customFertilizer,
              up.customSubstrateMix.length > 0 ? null : up.substrateId,
              up.customSubstrateMix
            );
            const name = up.nickname || (catalog ? (lang === 'fr' ? catalog.nameFr : catalog.nameEn) : up.plantId);

            return (
              <Link
                key={up.id}
                to={`/portfolio/${up.id}`}
                className="overflow-hidden rounded-xl border border-leaf-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {up.photoUrl && (
                  <PlantAvatar
                    photoUrl={up.photoUrl}
                    emoji={catalog?.emoji}
                    alt={name}
                    size="xl"
                    className="!rounded-none aspect-[16/9] max-h-40 w-full"
                  />
                )}
                <div className="flex items-start gap-3 p-4">
                  {!up.photoUrl && (
                    <PlantAvatar
                      photoUrl={null}
                      emoji={catalog?.emoji}
                      alt={name}
                      size="sm"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{name}</h3>
                    {catalog && (
                      <p className="text-sm italic text-soil-500">{catalog.scientificName}</p>
                    )}
                    {up.variety && (
                      <span className="mt-1 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">
                        {up.variety}
                      </span>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-soil-600">
                      <span className="rounded bg-soil-100 px-2 py-0.5">
                        {up.potVolumeL} L
                      </span>
                      {up.location && (
                        <span className="flex items-center gap-0.5 rounded bg-soil-100 px-2 py-0.5">
                          <MapPin className="h-3 w-3" />
                          {up.location}
                        </span>
                      )}
                    </div>
                    {up.nextFertilizerDate && (
                      <div
                        className={`mt-2 flex items-center gap-1 text-xs font-medium ${
                          isOverdue(up.nextFertilizerDate)
                            ? 'text-red-600'
                            : daysUntil(up.nextFertilizerDate) === 0
                              ? 'text-amber-600'
                              : 'text-leaf-600'
                        }`}
                      >
                        <Droplets className="h-3 w-3" />
                        {isOverdue(up.nextFertilizerDate)
                          ? t('reminders.overdue')
                          : daysUntil(up.nextFertilizerDate) === 0
                            ? t('reminders.today')
                            : t('reminders.inDays', { days: daysUntil(up.nextFertilizerDate) })}
                        {dose.doseMl > 0 && ` — ${dose.doseMl} ml`}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
