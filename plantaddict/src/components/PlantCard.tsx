import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Plant } from '../types';
import { getPlantCategory } from '../data/plants';

interface PlantCardProps {
  plant: Plant;
  actions?: React.ReactNode;
}

export function PlantCard({ plant, actions }: PlantCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'fr';
  const name = lang === 'fr' ? plant.nameFr : plant.nameEn;
  const isRare = getPlantCategory(plant) === 'rare';

  return (
    <div
      className={`flex flex-col rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        isRare ? 'border-violet-200' : 'border-leaf-200'
      }`}
    >
      <Link to={`/library/${plant.id}`} className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <span className="text-3xl">{plant.emoji}</span>
          <div className="flex flex-wrap justify-end gap-1">
            {isRare && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                {t('library.rareBadge')}
              </span>
            )}
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              plant.difficulty === 'easy'
                ? 'bg-leaf-100 text-leaf-700'
                : plant.difficulty === 'medium'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {t(`difficulty.${plant.difficulty}`)}
          </span>
          </div>
        </div>
        <h3 className="font-semibold text-soil-900">{name}</h3>
        <p className="text-sm italic text-soil-500">{plant.scientificName}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-soil-600">
          <span className="rounded bg-soil-100 px-2 py-0.5">
            {t(`light.${plant.light}`)}
          </span>
          <span className="rounded bg-soil-100 px-2 py-0.5">
            {t(`watering.${plant.watering}`)}
          </span>
        </div>
      </Link>
      {actions && <div className="border-t border-leaf-100 p-3">{actions}</div>}
    </div>
  );
}
