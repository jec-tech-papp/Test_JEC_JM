export type LightLevel = 'low' | 'medium' | 'bright_indirect' | 'direct';
export type WateringFrequency = 'weekly' | 'biweekly' | 'when_dry' | 'moist';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type FertilizerType = 'liquid' | 'granular' | 'slow_release';
export type CareEventType = 'fertilize' | 'water' | 'repot';
export type PlantCategory = 'common' | 'rare';

export interface Plant {
  id: string;
  nameEn: string;
  nameFr: string;
  scientificName: string;
  family: string;
  category?: PlantCategory;
  varieties?: string[];
  light: LightLevel;
  watering: WateringFrequency;
  humidity: { min: number; max: number };
  temperature: { min: number; max: number };
  fertilizerFrequencyDays: number;
  fertilizerNpk: string;
  fertilizerNotesEn: string;
  fertilizerNotesFr: string;
  careNotesEn: string;
  careNotesFr: string;
  difficulty: Difficulty;
  toxicToPets: boolean;
  emoji: string;
}

export interface Substrate {
  id: string;
  nameEn: string;
  nameFr: string;
  waterRetention: 'low' | 'medium' | 'high';
  fertilizerFactor: number;
  descriptionEn: string;
  descriptionFr: string;
}

export interface SubstrateMixComponent {
  substrateId: string;
  percentage: number;
}

export interface Fertilizer {
  id: string;
  nameEn: string;
  nameFr: string;
  brand: string;
  npk: string;
  dilutionMlPerL: number;
  type: FertilizerType;
  isCatalog: boolean;
  notesEn?: string;
  notesFr?: string;
}

export interface UserPlant {
  id: string;
  userId: string;
  plantId: string;
  nickname: string;
  variety: string | null;
  potVolumeL: number;
  substrateId: string | null;
  customSubstrateMix: SubstrateMixComponent[];
  fertilizerId: string | null;
  customFertilizer: CustomFertilizer | null;
  location: string;
  acquiredDate: string;
  lastFertilized: string | null;
  nextFertilizerDate: string | null;
  photoUrl: string | null;
  createdAt: string;
}

export interface CustomFertilizer {
  name: string;
  npk: string;
  dilutionMlPerL: number;
  type: FertilizerType;
}

export interface WishlistItem {
  id: string;
  userId: string;
  plantId: string;
  variety: string | null;
  notes: string;
  addedAt: string;
}

export interface CareEvent {
  id: string;
  userId: string;
  userPlantId: string;
  type: CareEventType;
  date: string;
  doseMl: number | null;
  notes: string;
}

export interface Reminder {
  id: string;
  userId: string;
  userPlantId: string;
  type: CareEventType;
  dueDate: string;
  doseMl: number | null;
  completed: boolean;
}

export interface DoseResult {
  doseMl: number;
  waterMl: number;
  substrateFactor: number;
  explanationKey: string;
}
