import { getSubstrate } from '../data/substrates';
import type { Plant, SubstrateMixComponent, UserPlant, WateringFrequency } from '../types';

const WATERING_INTERVAL_DAYS: Record<WateringFrequency, number> = {
  weekly: 7,
  biweekly: 14,
  when_dry: 10,
  moist: 3,
};

/** Fraction of pot volume actually filled with substrate (below rim, root ball). */
const SUBSTRATE_FILL_RATIO = 0.88;

/**
 * Fraction of effective substrate volume to add per watering session
 * (maintenance dose from moderately dry → adequately moist).
 */
const BASE_WATER_FRACTION = 0.13;

/** Low-retention mixes drain faster → pour more; high-retention → less per session. */
const RETENTION_WATER_FACTOR: Record<'low' | 'medium' | 'high', number> = {
  low: 1.35,
  medium: 1.0,
  high: 0.72,
};

export function getWateringIntervalDays(watering: WateringFrequency): number {
  return WATERING_INTERVAL_DAYS[watering];
}

export function computeWaterRetentionFactor(
  substrateId: string | null,
  customMix: SubstrateMixComponent[]
): number {
  if (customMix.length > 0) {
    const total = customMix.reduce((sum, c) => sum + c.percentage, 0);
    if (total === 0) return RETENTION_WATER_FACTOR.medium;
    const weighted = customMix.reduce((sum, c) => {
      const retention = getSubstrate(c.substrateId)?.waterRetention ?? 'medium';
      return sum + RETENTION_WATER_FACTOR[retention] * (c.percentage / total);
    }, 0);
    return Math.round(weighted * 100) / 100;
  }
  if (substrateId) {
    const retention = getSubstrate(substrateId)?.waterRetention ?? 'medium';
    return RETENTION_WATER_FACTOR[retention];
  }
  return RETENTION_WATER_FACTOR.medium;
}

/**
 * Suggested water volume (ml) from pot capacity and substrate retention.
 * effectiveSubstrate = potVolume × fillRatio
 * water = effectiveSubstrate × baseFraction × retentionFactor
 */
export function suggestWaterVolumeMl(
  potVolumeL: number,
  substrateId: string | null = null,
  customMix: SubstrateMixComponent[] = []
): number {
  if (potVolumeL <= 0) return 0;
  const effectiveSubstrateMl = potVolumeL * 1000 * SUBSTRATE_FILL_RATIO;
  const retentionFactor = computeWaterRetentionFactor(substrateId, customMix);
  const raw = effectiveSubstrateMl * BASE_WATER_FRACTION * retentionFactor;
  const rounded = Math.round(raw / 5) * 5;
  return Math.max(25, rounded);
}

export function suggestWaterVolumeForPlant(plant: UserPlant): number {
  return suggestWaterVolumeMl(
    plant.potVolumeL,
    plant.customSubstrateMix.length > 0 ? null : plant.substrateId,
    plant.customSubstrateMix
  );
}

export function computeNextWaterDate(
  watering: WateringFrequency,
  fromDate = new Date()
): string {
  const next = new Date(fromDate);
  next.setDate(next.getDate() + getWateringIntervalDays(watering));
  return next.toISOString().split('T')[0];
}

export function daysSince(date: string): number {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function isWaterOverdue(lastWatered: string | null, watering: WateringFrequency): boolean {
  if (!lastWatered) return true;
  return daysSince(lastWatered) > getWateringIntervalDays(watering);
}

export function daysUntilWaterDue(lastWatered: string | null, watering: WateringFrequency): number {
  if (!lastWatered) return -1;
  const interval = getWateringIntervalDays(watering);
  return interval - daysSince(lastWatered);
}

export function getWaterStatus(
  plant: UserPlant,
  catalog: Plant | undefined
): 'never' | 'overdue' | 'due_soon' | 'ok' {
  if (!plant.lastWatered) return 'never';
  if (!catalog) return 'ok';
  const daysUntil = daysUntilWaterDue(plant.lastWatered, catalog.watering);
  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 2) return 'due_soon';
  return 'ok';
}
