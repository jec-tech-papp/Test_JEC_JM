import Link from "next/link";
import type { Plant } from "@prisma/client";
import {
  difficultyLabel,
  feederLabel,
  humidityLabel,
  lightLabel,
  type Difficulty,
  type FeederLevel,
  type HumidityLevel,
  type LightLevel,
} from "@/lib/plant-types";

export function PlantCard({ plant }: { plant: Plant }) {
  return (
    <Link
      href={`/library/${plant.slug}`}
      className="card p-4 hover:shadow-md hover:border-leaf-300 transition group"
    >
      <div className="aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-leaf-100 to-leaf-200 flex items-center justify-center text-5xl mb-3">
        {iconFor(plant.category)}
      </div>
      <div className="text-xs uppercase tracking-wide text-leaf-600 font-semibold">
        {plant.category}
      </div>
      <div className="font-bold text-leaf-900 group-hover:text-leaf-700">
        {plant.commonName}
      </div>
      <div className="text-xs italic text-leaf-700">{plant.latinName}</div>
      <div className="mt-3 flex flex-wrap gap-1">
        <span className="badge-soft" title={lightLabel[plant.light as LightLevel]}>
          ☀️ {shortLight(plant.light as LightLevel)}
        </span>
        <span className="badge-info" title={humidityLabel[plant.humidity as HumidityLevel]}>
          💧 {shortHumidity(plant.humidity as HumidityLevel)}
        </span>
        <span className="badge-soft" title={feederLabel[plant.feeder as FeederLevel]}>
          🧪 {shortFeeder(plant.feeder as FeederLevel)}
        </span>
        <span className="badge-warn" title={difficultyLabel[plant.difficulty as Difficulty]}>
          {difficultyLabel[plant.difficulty as Difficulty]}
        </span>
      </div>
    </Link>
  );
}

function iconFor(category: string): string {
  const map: Record<string, string> = {
    Aroïde: "🌿",
    Cactée: "🌵",
    Succulente: "🪴",
    Fougère: "🌿",
    Orchidée: "🌸",
    Marantacée: "🌱",
    Carnivore: "🪤",
    Ficus: "🌳",
    Hoya: "💐",
    Bégonia: "🌺",
    Pilea: "🌿",
    Dracaena: "🪴",
    Peperomia: "🌱",
    Vivace: "🌿",
  };
  return map[category] || "🪴";
}

function shortLight(l: LightLevel): string {
  return {
    LOW: "Faible",
    MEDIUM_LOW: "Faible+",
    MEDIUM: "Moyenne",
    BRIGHT_INDIRECT: "Vive indirecte",
    DIRECT_SUN: "Plein soleil",
  }[l];
}
function shortHumidity(h: HumidityLevel): string {
  return { LOW: "Sèche", AVERAGE: "Moyenne", HIGH: "Élevée", VERY_HIGH: "Très élevée" }[h];
}
function shortFeeder(f: FeederLevel): string {
  return { LIGHT: "Faible", MEDIUM: "Modéré", HEAVY: "Gourmand" }[f];
}
