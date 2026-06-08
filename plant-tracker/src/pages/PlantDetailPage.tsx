import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, Plus } from 'lucide-react';
import { getPlant } from '../data/plants';
import { useAuth, getUserId } from '../contexts/AuthContext';
import { addUserPlant, addWishlistItem } from '../lib/storage';

export function PlantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState<'portfolio' | 'wishlist' | null>(null);

  const plant = id ? getPlant(id) : undefined;
  const lang = i18n.language as 'en' | 'fr';

  if (!plant) {
    return (
      <div className="md:ml-48 text-center py-12">
        <p>Plant not found</p>
        <Link to="/library" className="text-leaf-600 hover:underline">
          {t('common.back')}
        </Link>
      </div>
    );
  }

  const name = lang === 'fr' ? plant.nameFr : plant.nameEn;

  const handleAddToPortfolio = async () => {
    if (!user) return;
    setAdding('portfolio');
    await addUserPlant({
      userId: getUserId(user),
      plantId: plant.id,
      nickname: name,
      potVolumeL: 3,
      substrateId: 'universal',
      customSubstrateMix: [],
      fertilizerId: 'biobizz-grow',
      customFertilizer: null,
      location: '',
      acquiredDate: new Date().toISOString().split('T')[0],
      lastFertilized: null,
      nextFertilizerDate: null,
      photoUrl: null,
    });
    setAdding(null);
    navigate('/portfolio');
  };

  const handleAddToWishlist = async () => {
    if (!user) return;
    setAdding('wishlist');
    await addWishlistItem({
      userId: getUserId(user),
      plantId: plant.id,
      notes: '',
      addedAt: new Date().toISOString(),
    });
    setAdding(null);
    navigate('/wishlist');
  };

  return (
    <div className="md:ml-48">
      <Link
        to="/library"
        className="mb-4 inline-flex items-center gap-1 text-sm text-leaf-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('common.back')}
      </Link>

      <div className="rounded-2xl border border-leaf-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="text-5xl">{plant.emoji}</span>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="italic text-soil-500">{plant.scientificName}</p>
            <p className="text-sm text-soil-400">{plant.family}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              plant.toxicToPets
                ? 'bg-red-100 text-red-700'
                : 'bg-leaf-100 text-leaf-700'
            }`}
          >
            {plant.toxicToPets ? t('library.toxic') : t('library.safe')}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: t('library.light'), value: t(`light.${plant.light}`) },
            { label: t('library.watering'), value: t(`watering.${plant.watering}`) },
            {
              label: t('library.humidity'),
              value: `${plant.humidity.min}–${plant.humidity.max}%`,
            },
            {
              label: t('library.temperature'),
              value: `${plant.temperature.min}–${plant.temperature.max}°C`,
            },
            { label: t('library.difficulty'), value: t(`difficulty.${plant.difficulty}`) },
            {
              label: t('library.fertilizer'),
              value: `${plant.fertilizerNpk} — ${t('library.frequency', { days: plant.fertilizerFrequencyDays })}`,
            },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-soil-50 p-3">
              <p className="text-xs font-medium text-soil-500">{item.label}</p>
              <p className="mt-1 text-sm font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <h3 className="font-semibold text-soil-800">{t('library.careNotes')}</h3>
            <p className="mt-1 text-sm text-soil-600">
              {lang === 'fr' ? plant.careNotesFr : plant.careNotesEn}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-soil-800">{t('library.fertilizerNotes')}</h3>
            <p className="mt-1 text-sm text-soil-600">
              {lang === 'fr' ? plant.fertilizerNotesFr : plant.fertilizerNotesEn}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleAddToPortfolio}
            disabled={adding !== null}
            className="flex items-center gap-2 rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {t('library.addToPortfolio')}
          </button>
          <button
            onClick={handleAddToWishlist}
            disabled={adding !== null}
            className="flex items-center gap-2 rounded-lg border border-leaf-300 px-4 py-2 text-sm font-medium text-leaf-700 hover:bg-leaf-50 disabled:opacity-50"
          >
            <Heart className="h-4 w-4" />
            {t('library.addToWishlist')}
          </button>
        </div>
      </div>
    </div>
  );
}
