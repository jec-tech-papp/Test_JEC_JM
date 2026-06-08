import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, addDays, isAfter, isBefore } from 'date-fns'
import { fr } from 'date-fns/locale'
import type {
  FertilizerDoseResult,
  PlantLibraryEntry,
  SubstrateTemplate,
  CustomSubstrate,
} from '@/types'
import { SUBSTRATE_TEMPLATES } from '@/data/substrates'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date utils ──────────────────────────────────────────────────────────────

export const formatDate = (date: Date) => format(date, 'dd MMMM yyyy', { locale: fr })
export const formatShortDate = (date: Date) => format(date, 'dd/MM/yyyy')
export const formatRelative = (date: Date) => formatDistanceToNow(date, { locale: fr, addSuffix: true })

export const isOverdue = (date: Date) => isBefore(date, new Date())
export const isDueSoon = (date: Date, days = 2) => {
  const now = new Date()
  const threshold = addDays(now, days)
  return isAfter(date, now) && isBefore(date, threshold)
}

// ─── Fertilizer dose calculation ─────────────────────────────────────────────

export function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

export function calculateFertilizerDose(
  plant: PlantLibraryEntry,
  potVolumeLiters: number,
  substrate: SubstrateTemplate | CustomSubstrate,
  waterVolumeLiters?: number,
): FertilizerDoseResult {
  const season = getCurrentSeason()
  const fertilizer = plant.care.fertilizer

  // Use pot volume as default water volume if not specified
  const actualWaterVol = waterVolumeLiters ?? potVolumeLiters * 0.8

  // Base dose per liter
  const baseDosePer1L = fertilizer.doseMlPer1L

  // Season multiplier
  const seasonMultiplier = fertilizer.seasonalAdjustment[season]

  // Substrate multiplier
  const substrateMultiplier = 'fertilizerMultiplier' in substrate
    ? substrate.fertilizerMultiplier
    : 1.0

  // Calculate total concentrate needed
  const concentrateMl = baseDosePer1L * actualWaterVol * seasonMultiplier * substrateMultiplier

  // Build notes
  const notes: string[] = []
  if (seasonMultiplier < 0.5) {
    notes.push(`⚠️ Dose réduite pour ${season === 'winter' ? 'l\'hiver' : 'l\'automne'} (repos végétatif)`)
  }
  if (seasonMultiplier === 0) {
    notes.push('🛑 Pas de fertilisation recommandée en cette saison')
  }
  if (substrateMultiplier > 1.1) {
    notes.push(`📊 Dose augmentée (×${substrateMultiplier}) pour substrat à faible rétention de nutriments`)
  }
  if (substrateMultiplier < 0.1) {
    notes.push('🚫 Aucune fertilisation dans le substrat — plante carnivore')
  }
  if (potVolumeLiters >= 10) {
    notes.push(`🪣 Grand pot (${potVolumeLiters}L) — arroser progressivement`)
  }

  return {
    waterVolumeLiters: actualWaterVol,
    concentrateMl: Math.round(concentrateMl * 10) / 10,
    finalDilution: concentrateMl > 0
      ? `${(concentrateMl / actualWaterVol).toFixed(2)} ml/L`
      : '0 ml/L (pas de fertilisation)',
    adjustedForSubstrate: substrateMultiplier !== 1.0,
    substrateMultiplier,
    seasonMultiplier,
    notes,
  }
}

// ─── Substrate helpers ────────────────────────────────────────────────────────

export const getSubstrateById = (id: string, customSubstrates: CustomSubstrate[] = []) => {
  const template = SUBSTRATE_TEMPLATES.find(s => s.id === id)
  if (template) return template
  return customSubstrates.find(s => s.id === id)
}

// ─── Light level labels ───────────────────────────────────────────────────────

export const LIGHT_LABELS: Record<string, string> = {
  'very-low': 'Très faible',
  'low': 'Faible',
  'medium': 'Moyenne',
  'bright-indirect': 'Vive indirecte',
  'direct': 'Soleil direct',
}

export const LIGHT_COLORS: Record<string, string> = {
  'very-low': 'bg-slate-200 text-slate-700',
  'low': 'bg-blue-100 text-blue-700',
  'medium': 'bg-yellow-100 text-yellow-700',
  'bright-indirect': 'bg-orange-100 text-orange-700',
  'direct': 'bg-red-100 text-red-700',
}

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Très facile',
  2: 'Facile',
  3: 'Intermédiaire',
  4: 'Difficile',
  5: 'Expert',
}

export const DIFFICULTY_COLORS: Record<number, string> = {
  1: 'text-green-600',
  2: 'text-lime-600',
  3: 'text-yellow-600',
  4: 'text-orange-600',
  5: 'text-red-600',
}

export const CATEGORY_LABELS: Record<string, string> = {
  tropical: 'Tropical',
  succulent: 'Succulente',
  cactus: 'Cactus',
  fern: 'Fougère',
  orchid: 'Orchidée',
  palm: 'Palmier',
  aroid: 'Aracée',
  carnivore: 'Carnivore',
  herb: 'Herbe / Aromatique',
  climbing: 'Grimpante',
  tree: 'Arbre',
  aquatic: 'Aquatique',
  other: 'Autre',
}

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Envie',
  medium: 'Souhait',
  high: 'Prioritaire',
  dream: '🌟 Coup de cœur',
}

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  dream: 'bg-purple-100 text-purple-700',
}
