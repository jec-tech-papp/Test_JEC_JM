import { getSubstrate } from '../data/substrates';
import type { SubstrateMixComponent } from '../types';

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
 * Suggested water volume (ml) for one watering session, based on pot capacity
 * and substrate water retention.
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
