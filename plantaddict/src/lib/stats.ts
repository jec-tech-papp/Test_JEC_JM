import { getPlant, getPlantCategory } from '../data/plants';
import { getSubstrate } from '../data/substrates';
import { daysUntil, isOverdue } from './fertilizer';
import {
  daysSince,
  getWateringIntervalDays,
  isWaterOverdue,
} from './watering';
import type { CareEvent, Plant, UserPlant } from '../types';

export type FertilizerStatus = 'never' | 'overdue' | 'due_soon' | 'ok';
export type WaterStatus = 'never' | 'overdue' | 'due_soon' | 'ok';

export interface PlantCareRow {
  userPlantId: string;
  nickname: string;
  plantId: string;
  emoji: string;
  fertilizerStatus: FertilizerStatus;
  lastFertilized: string | null;
  nextFertilizerDate: string | null;
  waterStatus: WaterStatus;
  lastWatered: string | null;
  daysSinceWatered: number | null;
  ageDays: number;
  inGardenDays: number;
  acquiredDate: string;
  potVolumeL: number;
  location: string;
  family: string;
  category: 'common' | 'rare';
}

export interface CountBreakdown {
  label: string;
  count: number;
  percentage: number;
}

export interface GardenStats {
  totalPlants: number;
  totalPotVolumeL: number;
  avgPotVolumeL: number;
  avgAgeDays: number;
  avgInGardenDays: number;
  fertilizedCount: number;
  neverFertilizedCount: number;
  overdueFertilizerCount: number;
  wateredCount: number;
  neverWateredCount: number;
  overdueWaterCount: number;
  totalWaterVolumeMl: number;
  totalFertilizerDoseMl: number;
  fertilizeEventsCount: number;
  waterEventsCount: number;
  byFamily: CountBreakdown[];
  byCategory: CountBreakdown[];
  byDifficulty: CountBreakdown[];
  byLight: CountBreakdown[];
  byWateringNeed: CountBreakdown[];
  bySubstrate: CountBreakdown[];
  byLocation: CountBreakdown[];
  plantRows: PlantCareRow[];
}

function getFertilizerStatus(plant: UserPlant): FertilizerStatus {
  if (!plant.lastFertilized) return 'never';
  if (plant.nextFertilizerDate) {
    if (isOverdue(plant.nextFertilizerDate)) return 'overdue';
    if (daysUntil(plant.nextFertilizerDate) <= 3) return 'due_soon';
  }
  return 'ok';
}

function getWaterStatusForPlant(plant: UserPlant, catalog: Plant | undefined): WaterStatus {
  if (!plant.lastWatered) return 'never';
  if (!catalog) return 'ok';
  if (isWaterOverdue(plant.lastWatered, catalog.watering)) return 'overdue';
  const interval = getWateringIntervalDays(catalog.watering);
  const since = daysSince(plant.lastWatered);
  if (interval - since <= 2) return 'due_soon';
  return 'ok';
}

function countBy<T extends string>(
  items: T[],
  labelFn: (key: T) => string
): CountBreakdown[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const label = labelFn(item);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const total = items.length || 1;
  return Array.from(counts.entries())
    .map(([label, count]) => ({
      label,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

function ageDays(plant: UserPlant): number {
  const ref = plant.acquiredDate || plant.createdAt.split('T')[0];
  return daysSince(ref);
}

function inGardenDays(plant: UserPlant): number {
  return daysSince(plant.createdAt.split('T')[0]);
}

export function computeGardenStats(
  plants: UserPlant[],
  careEvents: CareEvent[],
  lang: 'en' | 'fr'
): GardenStats {
  const filtered = plants;
  const plantRows: PlantCareRow[] = filtered.map((up) => {
    const catalog = getPlant(up.plantId);
    return {
      userPlantId: up.id,
      nickname: up.nickname,
      plantId: up.plantId,
      emoji: catalog?.emoji ?? '🌱',
      fertilizerStatus: getFertilizerStatus(up),
      lastFertilized: up.lastFertilized,
      nextFertilizerDate: up.nextFertilizerDate,
      waterStatus: getWaterStatusForPlant(up, catalog),
      lastWatered: up.lastWatered ?? null,
      daysSinceWatered: up.lastWatered ? daysSince(up.lastWatered) : null,
      ageDays: ageDays(up),
      inGardenDays: inGardenDays(up),
      acquiredDate: up.acquiredDate || up.createdAt.split('T')[0],
      potVolumeL: up.potVolumeL,
      location: up.location || (lang === 'fr' ? 'Non renseigné' : 'Unspecified'),
      family: catalog?.family ?? (lang === 'fr' ? 'Inconnu' : 'Unknown'),
      category: catalog ? getPlantCategory(catalog) : 'common',
    };
  });

  const fertilizeEvents = careEvents.filter((e) => e.type === 'fertilize');
  const waterEvents = careEvents.filter((e) => e.type === 'water');

  const families = plantRows.map((r) => r.family);
  const categories = plantRows.map((r) => r.category);
  const difficulties = filtered.map((up) => getPlant(up.plantId)?.difficulty ?? 'medium');
  const lights = filtered.map((up) => getPlant(up.plantId)?.light ?? 'medium');
  const wateringNeeds = filtered.map((up) => getPlant(up.plantId)?.watering ?? 'weekly');
  const substrates = filtered.map((up) => {
    if (up.customSubstrateMix.length > 0) {
      return lang === 'fr' ? 'Mix personnalisé' : 'Custom mix';
    }
    const sub = up.substrateId ? getSubstrate(up.substrateId) : null;
    return sub ? (lang === 'fr' ? sub.nameFr : sub.nameEn) : (lang === 'fr' ? 'Non renseigné' : 'Unspecified');
  });
  const locations = plantRows.map((r) => r.location);

  const totalPotVolume = filtered.reduce((s, p) => s + p.potVolumeL, 0);

  return {
    totalPlants: filtered.length,
    totalPotVolumeL: Math.round(totalPotVolume * 10) / 10,
    avgPotVolumeL: filtered.length ? Math.round((totalPotVolume / filtered.length) * 10) / 10 : 0,
    avgAgeDays: plantRows.length
      ? Math.round(plantRows.reduce((s, r) => s + r.ageDays, 0) / plantRows.length)
      : 0,
    avgInGardenDays: plantRows.length
      ? Math.round(plantRows.reduce((s, r) => s + r.inGardenDays, 0) / plantRows.length)
      : 0,
    fertilizedCount: plantRows.filter((r) => r.fertilizerStatus !== 'never').length,
    neverFertilizedCount: plantRows.filter((r) => r.fertilizerStatus === 'never').length,
    overdueFertilizerCount: plantRows.filter((r) => r.fertilizerStatus === 'overdue').length,
    wateredCount: plantRows.filter((r) => r.waterStatus !== 'never').length,
    neverWateredCount: plantRows.filter((r) => r.waterStatus === 'never').length,
    overdueWaterCount: plantRows.filter((r) => r.waterStatus === 'overdue').length,
    totalWaterVolumeMl: waterEvents.reduce((s, e) => s + (e.doseMl ?? 0), 0),
    totalFertilizerDoseMl: fertilizeEvents.reduce((s, e) => s + (e.doseMl ?? 0), 0),
    fertilizeEventsCount: fertilizeEvents.length,
    waterEventsCount: waterEvents.length,
    byFamily: countBy(families, (f) => f),
    byCategory: countBy(categories, (c) =>
      c === 'rare' ? (lang === 'fr' ? 'Rares & exotiques' : 'Rare & exotic') : (lang === 'fr' ? 'Classiques' : 'Classic')
    ),
    byDifficulty: countBy(difficulties, (d) => d),
    byLight: countBy(lights, (l) => l),
    byWateringNeed: countBy(wateringNeeds, (w) => w),
    bySubstrate: countBy(substrates, (s) => s),
    byLocation: countBy(locations, (l) => l),
    plantRows,
  };
}

export function computePlantStats(
  plant: UserPlant,
  careEvents: CareEvent[],
  lang: 'en' | 'fr'
): GardenStats {
  const plantEvents = careEvents.filter((e) => e.userPlantId === plant.id);
  return computeGardenStats([plant], plantEvents, lang);
}
