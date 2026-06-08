import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useAuth, getUserId } from '../contexts/AuthContext';
import {
  subscribeUserPlants,
  updateUserPlant,
  deleteUserPlant,
  addCareEvent,
} from '../lib/storage';
import { getPlant } from '../data/plants';
import { calculateDose, computeNextFertilizerDate } from '../lib/fertilizer';
import { SubstrateSelector } from '../components/SubstrateSelector';
import { FertilizerSelector } from '../components/FertilizerSelector';
import { DoseCalculator } from '../components/DoseCalculator';
import { VarietySelector } from '../components/VarietySelector';
import {
  subscribeUserVarieties,
  addUserVariety,
  getAllVarietiesForPlant,
} from '../lib/varieties';
import type { UserPlant, SubstrateMixComponent, CustomFertilizer } from '../types';

export function UserPlantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plant, setPlant] = useState<UserPlant | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nickname, setNickname] = useState('');
  const [potVolumeL, setPotVolumeL] = useState(3);
  const [substrateId, setSubstrateId] = useState<string | null>('universal');
  const [useCustomMix, setUseCustomMix] = useState(false);
  const [customMix, setCustomMix] = useState<SubstrateMixComponent[]>([]);
  const [fertilizerId, setFertilizerId] = useState<string | null>('biobizz-grow');
  const [useCustomFertilizer, setUseCustomFertilizer] = useState(false);
  const [customFertilizer, setCustomFertilizer] = useState<CustomFertilizer | null>(null);
  const [location, setLocation] = useState('');
  const [variety, setVariety] = useState('');
  const [userVarietyMap, setUserVarietyMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!user) return;
    return subscribeUserVarieties(getUserId(user), setUserVarietyMap);
  }, [user]);

  useEffect(() => {
    if (!user || !id) return;
    return subscribeUserPlants(getUserId(user), (plants) => {
      const found = plants.find((p) => p.id === id);
      if (found) {
        setPlant(found);
        setNickname(found.nickname);
        setVariety(found.variety ?? '');
        setPotVolumeL(found.potVolumeL);
        setSubstrateId(found.substrateId);
        setUseCustomMix(found.customSubstrateMix.length > 0);
        setCustomMix(found.customSubstrateMix);
        setFertilizerId(found.fertilizerId);
        setUseCustomFertilizer(!!found.customFertilizer);
        setCustomFertilizer(found.customFertilizer);
        setLocation(found.location);
      }
    });
  }, [user, id]);

  const catalog = plant ? getPlant(plant.plantId) : undefined;
  const allVarieties = useMemo(
    () =>
      catalog && plant
        ? getAllVarietiesForPlant(
            catalog.varieties,
            userVarietyMap[plant.plantId] ?? [],
            plant.plantId,
            userVarietyMap
          )
        : [],
    [catalog, plant, userVarietyMap]
  );

  if (!plant) {
    return (
      <div className="md:ml-48 py-12 text-center">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  const dose = calculateDose(
    potVolumeL,
    useCustomFertilizer ? null : fertilizerId,
    useCustomFertilizer ? customFertilizer : null,
    useCustomMix ? null : substrateId,
    useCustomMix ? customMix : []
  );

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    if (variety && user) await addUserVariety(getUserId(user), plant.plantId, variety);
    await updateUserPlant(getUserId(user), plant.id, {
      nickname,
      variety: variety || null,
      potVolumeL,
      substrateId: useCustomMix ? null : substrateId,
      customSubstrateMix: useCustomMix ? customMix : [],
      fertilizerId: useCustomFertilizer ? null : fertilizerId,
      customFertilizer: useCustomFertilizer ? customFertilizer : null,
      location,
    });
    setEditing(false);
    setSaving(false);
  };

  const handleMarkFertilized = async () => {
    if (!user || !catalog) return;
    const today = new Date().toISOString().split('T')[0];
    const nextDate = computeNextFertilizerDate(catalog.fertilizerFrequencyDays);
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

  const handleDelete = async () => {
    if (!user || !confirm(t('common.confirm'))) return;
    await deleteUserPlant(getUserId(user), plant.id);
    navigate('/portfolio');
  };

  return (
    <div className="md:ml-48">
      <Link
        to="/portfolio"
        className="mb-4 inline-flex items-center gap-1 text-sm text-leaf-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('common.back')}
      </Link>

      <div className="rounded-2xl border border-leaf-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{catalog?.emoji ?? '🌱'}</span>
            <div>
              <h2 className="text-2xl font-bold">{nickname}</h2>
              {catalog && (
                <p className="text-sm italic text-soil-500">{catalog.scientificName}</p>
              )}
              {plant.variety && (
                <p className="text-sm text-violet-600">{plant.variety}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="rounded-lg border border-leaf-300 px-3 py-1.5 text-sm text-leaf-700 hover:bg-leaf-50"
            >
              {editing ? t('portfolio.cancel') : t('portfolio.editPlant')}
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {editing ? (
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('portfolio.nickname')}</label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-lg border border-leaf-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('portfolio.potVolume')}</label>
              <input
                type="number"
                min={0.1}
                step={0.5}
                value={potVolumeL}
                onChange={(e) => setPotVolumeL(Number(e.target.value))}
                className="w-full rounded-lg border border-leaf-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('portfolio.location')}</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-leaf-200 px-3 py-2 text-sm"
              />
            </div>
            {catalog && (
              <VarietySelector
                varieties={allVarieties}
                value={variety}
                onChange={setVariety}
                onAddCustom={
                  user
                    ? (v) => addUserVariety(getUserId(user), plant.plantId, v)
                    : undefined
                }
              />
            )}
            <SubstrateSelector
              substrateId={substrateId}
              customMix={customMix}
              useCustomMix={useCustomMix}
              onSubstrateChange={setSubstrateId}
              onUseCustomMixChange={setUseCustomMix}
              onMixChange={setCustomMix}
            />
            <FertilizerSelector
              fertilizerId={fertilizerId}
              customFertilizer={customFertilizer}
              useCustom={useCustomFertilizer}
              onFertilizerChange={setFertilizerId}
              onUseCustomChange={setUseCustomFertilizer}
              onCustomChange={setCustomFertilizer}
            />
            <DoseCalculator dose={dose} />
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-leaf-600 px-6 py-2 text-sm font-medium text-white hover:bg-leaf-700 disabled:opacity-50"
            >
              {saving ? t('common.loading') : t('portfolio.save')}
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-soil-50 p-3">
                <p className="text-xs text-soil-500">{t('portfolio.potVolume')}</p>
                <p className="font-semibold">{plant.potVolumeL} L</p>
              </div>
              {plant.location && (
                <div className="rounded-lg bg-soil-50 p-3">
                  <p className="text-xs text-soil-500">{t('portfolio.location')}</p>
                  <p className="font-semibold">{plant.location}</p>
                </div>
              )}
              {plant.lastFertilized && (
                <div className="rounded-lg bg-soil-50 p-3">
                  <p className="text-xs text-soil-500">{t('portfolio.lastFertilized')}</p>
                  <p className="font-semibold">{plant.lastFertilized}</p>
                </div>
              )}
              {plant.nextFertilizerDate && (
                <div className="rounded-lg bg-soil-50 p-3">
                  <p className="text-xs text-soil-500">{t('portfolio.nextFertilizer')}</p>
                  <p className="font-semibold">{plant.nextFertilizerDate}</p>
                </div>
              )}
            </div>
            <DoseCalculator dose={dose} />
            <button
              onClick={handleMarkFertilized}
              className="rounded-lg bg-leaf-600 px-6 py-2 text-sm font-medium text-white hover:bg-leaf-700"
            >
              {t('portfolio.markFertilized')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
