import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateFertilizerDose(
  doseMLPerLiter: number,
  potVolumeLiters: number,
  substrateNutrientFactor: number = 1.0
): { doseML: number; waterML: number } {
  const adjustedDose = doseMLPerLiter / substrateNutrientFactor;
  const waterML = potVolumeLiters * 300; // ~30% of pot volume for thorough watering
  const doseML = adjustedDose * (waterML / 1000);

  return {
    doseML: Math.round(doseML * 100) / 100,
    waterML: Math.round(waterML),
  };
}

export function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "easy": return "text-green-600 bg-green-50";
    case "medium": return "text-yellow-600 bg-yellow-50";
    case "hard": return "text-red-600 bg-red-50";
    default: return "text-gray-600 bg-gray-50";
  }
}

export function getDifficultyLabel(difficulty: string) {
  switch (difficulty) {
    case "easy": return "Facile";
    case "medium": return "Moyen";
    case "hard": return "Difficile";
    default: return difficulty;
  }
}

export function getLightLabel(level: number) {
  switch (level) {
    case 1: return "Très faible";
    case 2: return "Faible";
    case 3: return "Moyenne";
    case 4: return "Vive";
    case 5: return "Plein soleil";
    default: return `Niveau ${level}`;
  }
}
