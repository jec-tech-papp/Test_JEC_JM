import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, Plus, Sparkles } from 'lucide-react';
import { getPlant, getPlantCategory } from '../data/plants';
import { useAuth, getUserId } from '../contexts/AuthContext';
import { addUserPlant, addWishlistItem } from '../lib/storage';
import {
  subscribeUserVarieties,
  addUserVariety,
  getAllVarietiesForPlant,
} from '../lib/varieties';
import { getPlantReferenceImage } from '../data/variety-images';
import { PlantAvatar } from '../components/PlantAvatar';
import { VarietySelector } from '../components/VarietySelector';

function buildNickname(baseName: string, variety: string): string {
  return variety ? `${baseName} — ${variety}` : baseName;
}

export function PlantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState<'portfolio' | 'wishlist' | null>(null);
  const [variety, setVariety] = useState('');
  const [userVarietyMap, setUserVarietyMap] = useState<Record<string, string[]>>({});

  const plant = id ? getPlant(id) : undefined;
  const lang = i18n.language as 'en' | 'fr';

  useEffect(() => {
    if (!user) return;
    return subscribeUserVarieties(getUserId(user), setUserVarietyMap);
  }, [user]);

  if (!plant) {
    return (
      <div className="md:ml-48 text-center py-12">
        <p>{t('library.plantNotFound')}</p>
        <Link to="/library" className="text-leaf-600 hover:underline">
          {t('common.back')}
        </Link>
      </div>
    );
  }

  const name = lang === 'fr' ? plant.nameFr : plant.nameEn;
  const isRare = getPlantCategory(plant) === 'rare';
  const allVarieties = getAllVarietiesForPlant(
    plant.varieties,
    userVarietyMap[plant.id] ?? [],
    plant.id,
    userVarietyMap
  );

  const handleAddCustomVariety = async (v: string) => {
    if (!user) return;
    await addUserVariety(getUserId(user), plant.id, v);
  };

  const handleAddToPortfolio = async () => {
    if (!user) return;
    setAdding('portfolio');
    if (variety) await addUserVariety(getUserId(user), plant.id, variety);
    await addUserPlant({
      userId: getUserId(user),
      plantId: plant.id,
      nickname: buildNickname(name, variety),
      variety: variety || null,
      potVolumeL: 3,
      substrateId: isRare ? 'aroid' : 'universal',
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
    if (variety) await addUserVariety(getUserId(user), plant.id, variety);
    await addWishlistItem({
      userId: getUserId(user),
      plantId: plant.id,
      variety: variety || null,
      notes: variety ? `${t('library.variety')}: ${variety}` : '',
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

      <div
        className={`rounded-2xl border bg-white p-6 shadow-sm ${
          isRare ? 'border-violet-200' : 'border-leaf-200'
        }`}
      >
        {getPlantReferenceImage(plant.id) && (
          <div className="mb-6 flex justify-center">
            <PlantAvatar
              photoUrl={getPlantReferenceImage(plant.id)}
              emoji={plant.emoji}
              alt={name}
              size="xl"
              className="aspect-video max-h-56 w-full max-w-lg"
            />
          </div>
        )}
        <div className="flex items-start gap-4">
          {!getPlantReferenceImage(plant.id) && (
            <span className="text-5xl">{plant.emoji}</span>
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold">{name}</h2>
              {isRare && (
                <span className="flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                  <Sparkles className="h-3 w-3" />
                  {t('library.rareBadge')}
                </span>
              )}
            </div>
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

        <div className="mt-6 rounded-xl border border-leaf-100 bg-soil-50 p-4">
          <VarietySelector
            varieties={allVarieties}
            value={variety}
            onChange={setVariety}
            onAddCustom={user ? handleAddCustomVariety : undefined}
            plantEmoji={plant.emoji}
          />
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
