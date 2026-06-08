import { getSubstrate } from '../data/substrates';
import { getFertilizer } from '../data/fertilizers';
import type { CustomFertilizer, DoseResult, SubstrateMixComponent } from '../types';

export function computeSubstrateFactor(
  substrateId: string | null,
  customMix: SubstrateMixComponent[]
): number {
  if (customMix.length > 0) {
    const total = customMix.reduce((sum, c) => sum + c.percentage, 0);
    if (total === 0) return 1.0;
    const weighted = customMix.reduce((sum, c) => {
      const sub = getSubstrate(c.substrateId);
      return sum + (sub?.fertilizerFactor ?? 1.0) * (c.percentage / total);
    }, 0);
    return Math.round(weighted * 100) / 100;
  }
  if (substrateId) {
    return getSubstrate(substrateId)?.fertilizerFactor ?? 1.0;
  }
  return 1.0;
}

export function getDilution(
  fertilizerId: string | null,
  customFertilizer: CustomFertilizer | null
): number {
  if (customFertilizer) return customFertilizer.dilutionMlPerL;
  if (fertilizerId) return getFertilizer(fertilizerId)?.dilutionMlPerL ?? 0;
  return 0;
}

export function calculateDose(
  potVolumeL: number,
  fertilizerId: string | null,
  customFertilizer: CustomFertilizer | null,
  substrateId: string | null,
  customMix: SubstrateMixComponent[]
): DoseResult {
  const dilution = getDilution(fertilizerId, customFertilizer);
  const substrateFactor = computeSubstrateFactor(substrateId, customMix);

  if (dilution === 0) {
    return {
      doseMl: 0,
      waterMl: potVolumeL * 1000,
      substrateFactor,
      explanationKey: 'dose.slowRelease',
    };
  }

  const baseDose = potVolumeL * dilution;
  const doseMl = Math.round(baseDose * substrateFactor * 10) / 10;
  const waterMl = potVolumeL * 1000;

  return {
    doseMl,
    waterMl,
    substrateFactor,
    explanationKey: 'dose.calculated',
  };
}

export function computeNextFertilizerDate(frequencyDays: number, fromDate = new Date()): string {
  const next = new Date(fromDate);
  next.setDate(next.getDate() + frequencyDays);
  return next.toISOString().split('T')[0];
}

export function isOverdue(dueDate: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dueDate < today;
}

export function daysUntil(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
