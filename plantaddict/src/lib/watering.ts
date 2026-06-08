import type { Plant, UserPlant, WateringFrequency } from '../types';

const WATERING_INTERVAL_DAYS: Record<WateringFrequency, number> = {
  weekly: 7,
  biweekly: 14,
  when_dry: 10,
  moist: 3,
};

export function getWateringIntervalDays(watering: WateringFrequency): number {
  return WATERING_INTERVAL_DAYS[watering];
}

export function suggestWaterVolumeMl(potVolumeL: number): number {
  return Math.round(potVolumeL * 1000 * 0.2);
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
