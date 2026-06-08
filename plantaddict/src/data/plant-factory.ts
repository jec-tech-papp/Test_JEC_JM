import type { Plant, LightLevel, WateringFrequency, Difficulty, PlantCategory } from '../types';

export type PlantInput = {
  id: string;
  nameEn: string;
  nameFr: string;
  scientificName: string;
  family: string;
  emoji: string;
  category?: PlantCategory;
  varieties?: string[];
  light?: LightLevel;
  watering?: WateringFrequency;
  humidity?: { min: number; max: number };
  temperature?: { min: number; max: number };
  fertilizerFrequencyDays?: number;
  fertilizerNpk?: string;
  difficulty?: Difficulty;
  toxicToPets?: boolean;
  careNotesEn?: string;
  careNotesFr?: string;
  fertilizerNotesEn?: string;
  fertilizerNotesFr?: string;
};

export function plant(input: PlantInput): Plant {
  const rare = input.category === 'rare';
  return {
    category: input.category ?? 'common',
    light: input.light ?? 'bright_indirect',
    watering: input.watering ?? 'when_dry',
    humidity: input.humidity ?? { min: 50, max: 70 },
    temperature: input.temperature ?? { min: 18, max: 26 },
    fertilizerFrequencyDays: input.fertilizerFrequencyDays ?? (rare ? 21 : 14),
    fertilizerNpk: input.fertilizerNpk ?? '3-1-2',
    fertilizerNotesEn:
      input.fertilizerNotesEn ??
      (rare
        ? 'Light feeding only. Dilute to quarter or half strength.'
        : 'Balanced fertilizer during spring and summer.'),
    fertilizerNotesFr:
      input.fertilizerNotesFr ??
      (rare
        ? 'Engrais léger uniquement. Diluer au quart ou à la demi-dose.'
        : 'Engrais équilibré au printemps et en été.'),
    careNotesEn: input.careNotesEn ?? 'Standard indoor plant care.',
    careNotesFr: input.careNotesFr ?? "Entretien standard de plante d'intérieur.",
    difficulty: input.difficulty ?? (rare ? 'hard' : 'medium'),
    toxicToPets: input.toxicToPets ?? true,
    ...input,
  };
}
