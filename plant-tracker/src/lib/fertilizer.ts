// Fertilization dose & scheduling engine.
//
// We compute three things:
//   1. The recommended irrigation volume per fertilizing session.
//   2. The fertilizer dose in mL to mix into that water.
//   3. The next fertilization date.
//
// Inputs:
//   - Plant base recipe (baseDoseMlPerLiter, frequency, feeder level)
//   - Substrate (fertMultiplier, fertFrequencyShiftDays)
//   - Pot volume in liters
//   - Optional: season override (auto-detected from date otherwise)
//
// Conventions:
//   - Liquid fertilizer assumed to be a "standard" balanced NPK at 1 g/L stock
//     (typical EU houseplant fertilizer). The user can scale if they use a
//     concentrate (the recipe stays valid for the *dilution ratio*).
//   - Irrigation volume ≈ 20% of pot volume (one thorough watering until
//     runoff). Capped between 50 mL and 1500 mL to stay practical.

import type { FeederLevel } from "./plant-types";

export type FertInput = {
  potVolumeL: number;
  baseDoseMlPerLiter: number;       // from Plant
  feeder: FeederLevel;              // from Plant
  fertFrequencyDaysSummer: number;  // from Plant
  fertFrequencyDaysWinter: number;  // from Plant
  fertMultiplier: number;           // from Substrate
  fertFrequencyShiftDays: number;   // from Substrate
  season?: "summer" | "winter";     // override
  now?: Date;
};

export type FertResult = {
  irrigationVolumeMl: number;
  doseMl: number;
  dosePerLiter: number;
  frequencyDays: number;
  nextDate: Date;
  season: "summer" | "winter";
  explanation: string[];
};

const FEEDER_MULT: Record<FeederLevel, number> = {
  LIGHT: 0.6,
  MEDIUM: 1.0,
  HEAVY: 1.3,
};

export function detectSeason(date: Date): "summer" | "winter" {
  // Northern hemisphere growing season: roughly Apr → Sep (months 3..8).
  const month = date.getMonth(); // 0 = Jan
  return month >= 3 && month <= 8 ? "summer" : "winter";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function computeFertilization(input: FertInput): FertResult {
  const now = input.now ?? new Date();
  const season = input.season ?? detectSeason(now);

  const irrigationVolumeMl = clamp(input.potVolumeL * 1000 * 0.2, 50, 1500);

  const feederMult = FEEDER_MULT[input.feeder] ?? 1.0;
  const dosePerLiter =
    input.baseDoseMlPerLiter * input.fertMultiplier * feederMult;

  // Total fert dose mixed into the irrigation water.
  // Round to 0.1 mL for practical measurement.
  const doseRaw = (irrigationVolumeMl / 1000) * dosePerLiter;
  const doseMl = Math.max(0.1, roundTo(doseRaw, 0.1));

  const baseFreq =
    season === "summer"
      ? input.fertFrequencyDaysSummer
      : input.fertFrequencyDaysWinter;
  const frequencyDays = Math.max(3, baseFreq + input.fertFrequencyShiftDays);

  const nextDate = new Date(now.getTime() + frequencyDays * 86_400_000);

  const explanation: string[] = [];
  explanation.push(
    `Volume d'arrosage estimé : ${(irrigationVolumeMl / 1000).toFixed(2)} L (≈20 % du volume du pot, ${input.potVolumeL.toFixed(2)} L).`,
  );
  explanation.push(
    `Dose par litre d'eau : ${dosePerLiter.toFixed(2)} mL = base ${input.baseDoseMlPerLiter} mL/L × substrat ${input.fertMultiplier} × besoin plante ${feederMult}.`,
  );
  explanation.push(
    `Dose totale recommandée : ${doseMl.toFixed(1)} mL d'engrais liquide standard, dilués dans ~${irrigationVolumeMl.toFixed(0)} mL d'eau.`,
  );
  explanation.push(
    `Fréquence (${season === "summer" ? "saison de croissance" : "repos végétatif"}) : tous les ${frequencyDays} j (base ${baseFreq} j ${input.fertFrequencyShiftDays >= 0 ? "+" : ""}${input.fertFrequencyShiftDays} j substrat).`,
  );

  return {
    irrigationVolumeMl,
    doseMl,
    dosePerLiter,
    frequencyDays,
    nextDate,
    season,
    explanation,
  };
}
