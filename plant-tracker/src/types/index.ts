// ─── Plant Library ───────────────────────────────────────────────────────────

export type LightLevel = 'very-low' | 'low' | 'medium' | 'bright-indirect' | 'direct'
export type WateringFrequency = 'daily' | 'twice-week' | 'weekly' | 'bi-weekly' | 'monthly'
export type FertilizerNeed = 'none' | 'low' | 'medium' | 'high'
export type GrowthRate = 'slow' | 'medium' | 'fast'
export type PlantCategory =
  | 'tropical'
  | 'succulent'
  | 'cactus'
  | 'fern'
  | 'orchid'
  | 'palm'
  | 'aroid'
  | 'carnivore'
  | 'herb'
  | 'climbing'
  | 'tree'
  | 'aquatic'
  | 'other'

export interface PlantCareInfo {
  light: LightLevel
  lightDetails: string
  wateringFrequency: WateringFrequency
  wateringDetails: string
  humidity: { min: number; max: number; ideal: number }
  temperature: { min: number; max: number; ideal: number }
  fertilizer: {
    need: FertilizerNeed
    frequency: string
    npkRatio: string
    type: string
    notes: string
    doseMlPer1L: number        // ml of fertilizer concentrate per 1L of water
    seasonalAdjustment: {
      spring: number           // multiplier (e.g. 1.0 = full dose)
      summer: number
      autumn: number
      winter: number
    }
  }
  soil: {
    preferred: string[]        // substrate type slugs
    ph: { min: number; max: number }
    drainage: 'poor' | 'moderate' | 'good' | 'excellent'
  }
  repotting: {
    frequency: string
    bestSeason: string
    potSizeIncrement: string
  }
  toxicity: {
    humans: boolean
    pets: boolean
    details: string
  }
  growthRate: GrowthRate
  difficulty: 1 | 2 | 3 | 4 | 5
  tips: string[]
}

export interface PlantLibraryEntry {
  id: string
  nameFr: string
  nameEn: string
  scientificName: string
  family: string
  origin: string
  category: PlantCategory
  description: string
  care: PlantCareInfo
  imageUrl: string
  tags: string[]
}

// ─── Substrate ───────────────────────────────────────────────────────────────

export interface SubstrateComponent {
  name: string
  percentage: number
}

export interface SubstrateTemplate {
  id: string
  slug: string
  nameFr: string
  description: string
  components: SubstrateComponent[]
  drainageLevel: 1 | 2 | 3 | 4 | 5
  retentionLevel: 1 | 2 | 3 | 4 | 5
  ph: { min: number; max: number }
  idealFor: PlantCategory[]
  fertilizerMultiplier: number  // affects dose (e.g. LECA = 1.5x because nutrients don't stay)
}

export interface CustomSubstrate {
  id: string
  userId: string
  name: string
  description: string
  components: SubstrateComponent[]
  drainageLevel: 1 | 2 | 3 | 4 | 5
  retentionLevel: 1 | 2 | 3 | 4 | 5
  ph: { min: number; max: number }
  fertilizerMultiplier: number
  createdAt: Date
}

// ─── User Portfolio ───────────────────────────────────────────────────────────

export type WateringUnit = 'ml' | 'L'
export type PotMaterial = 'terracotta' | 'plastic' | 'ceramic' | 'fabric' | 'glass' | 'wood' | 'other'

export interface UserPlant {
  id: string
  userId: string
  plantId: string                // reference to PlantLibraryEntry
  plant?: PlantLibraryEntry      // populated on read
  nickname: string
  acquisitionDate: Date
  acquisitionSource: string
  potVolumeLiters: number
  potMaterial: PotMaterial
  substrateId: string            // reference to SubstrateTemplate or CustomSubstrate
  substrateName: string          // denormalized for display
  location: string
  notes: string
  imageUrl?: string
  lastWatered?: Date
  nextWaterDue?: Date
  lastFertilized?: Date
  nextFertilizerDue?: Date
  fertilizingEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export type WishlistPriority = 'low' | 'medium' | 'high' | 'dream'

export interface WishlistItem {
  id: string
  userId: string
  plantId: string
  plant?: PlantLibraryEntry
  priority: WishlistPriority
  notes: string
  estimatedPrice?: number
  targetDate?: Date
  addedAt: Date
}

// ─── Care Logs ───────────────────────────────────────────────────────────────

export type CareActionType = 'watering' | 'fertilizing' | 'repotting' | 'pruning' | 'treatment' | 'other'

export interface CareLog {
  id: string
  userId: string
  userPlantId: string
  action: CareActionType
  date: Date
  notes: string
  // Fertilizer specific
  fertilizerProduct?: string
  calculatedDoseMl?: number
  actualDoseMl?: number
  waterVolumeLiters?: number
  dilutionRatio?: string
  // Watering specific
  waterAmountMl?: number
}

// ─── Fertilizer ───────────────────────────────────────────────────────────────

export interface FertilizerProduct {
  id: string
  name: string
  brand: string
  npk: string
  type: 'liquid' | 'granule' | 'stick' | 'powder'
  concentrateMlPer1L: number   // recommended by manufacturer per 1L water
  notes: string
}

export interface FertilizerDoseResult {
  waterVolumeLiters: number
  concentrateMl: number
  finalDilution: string
  adjustedForSubstrate: boolean
  substrateMultiplier: number
  seasonMultiplier: number
  notes: string[]
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType = 'watering' | 'fertilizing' | 'repotting' | 'general'

export interface CareReminder {
  id: string
  userId: string
  userPlantId: string
  plantNickname: string
  plantNameFr: string
  action: NotificationType
  dueDate: Date
  completed: boolean
  snoozedUntil?: Date
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  preferences: {
    language: 'fr' | 'en'
    notificationsEnabled: boolean
    reminderDaysBefore: number
    theme: 'light' | 'dark' | 'system'
  }
  createdAt: Date
}
