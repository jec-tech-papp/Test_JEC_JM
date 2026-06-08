"use client";

import { X, Sun, Droplets, ThermometerSun, Leaf, Beaker, AlertTriangle } from "lucide-react";
import { getDifficultyColor, getDifficultyLabel, getLightLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Plant {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  description: string;
  difficulty: string;
  lightMin: number;
  lightMax: number;
  lightDescription: string;
  wateringFrequency: string;
  wateringFreqDays: number;
  humidityMin?: number;
  humidityMax?: number;
  tempMin: number;
  tempMax: number;
  tempIdealMin: number;
  tempIdealMax: number;
  fertilizerType: string;
  fertilizerFreqDays: number;
  fertilizerNPK: string;
  fertilizerDoseMLPerLiter: number;
  fertilizerNotes: string;
  preferredSubstrate: string;
  soilPH?: string;
  drainageNeeds: string;
  growthRate: string;
  maxHeight: string;
  origin: string;
  toxicity: string;
  category: { name: string; icon: string } | null;
}

export function PlantDetailModal({
  plant,
  onClose,
  onAdd,
}: {
  plant: Plant;
  onClose: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{plant.commonName}</h2>
            <p className="text-sm text-gray-500 italic">{plant.scientificName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header info */}
          <div className="flex flex-wrap gap-2">
            {plant.category && (
              <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                {plant.category.icon} {plant.category.name}
              </span>
            )}
            <span className={cn("text-xs font-medium px-3 py-1 rounded-full", getDifficultyColor(plant.difficulty))}>
              {getDifficultyLabel(plant.difficulty)}
            </span>
            {plant.toxicity && plant.toxicity !== "none" && (
              <span className="text-xs bg-orange-50 text-orange-700 px-3 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Toxicité: {plant.toxicity}
              </span>
            )}
            {plant.origin && (
              <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                Origine: {plant.origin}
              </span>
            )}
          </div>

          <p className="text-gray-700">{plant.description}</p>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<Leaf className="h-4 w-4 text-green-600" />} label="Croissance" value={plant.growthRate === "slow" ? "Lente" : plant.growthRate === "fast" ? "Rapide" : "Moyenne"} />
            <StatCard icon={<Leaf className="h-4 w-4 text-green-600" />} label="Hauteur max" value={plant.maxHeight || "N/A"} />
            <StatCard icon={<Droplets className="h-4 w-4 text-blue-600" />} label="Arrosage" value={`Tous les ${plant.wateringFreqDays}j`} />
            <StatCard icon={<ThermometerSun className="h-4 w-4 text-red-600" />} label="Temp. idéale" value={`${plant.tempIdealMin}-${plant.tempIdealMax}°C`} />
          </div>

          {/* Light */}
          <section>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              Lumière
            </h3>
            <p className="text-sm text-gray-700">{plant.lightDescription}</p>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-2 flex-1 rounded-full",
                    level >= plant.lightMin && level <= plant.lightMax
                      ? "bg-amber-400"
                      : "bg-gray-100"
                  )}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Ombre</span>
              <span>Plein soleil</span>
            </div>
          </section>

          {/* Watering */}
          <section>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              Arrosage
            </h3>
            <p className="text-sm text-gray-700">{plant.wateringFrequency}</p>
            {plant.humidityMin && (
              <p className="text-sm text-gray-500 mt-1">
                Humidité idéale: {plant.humidityMin}-{plant.humidityMax}%
              </p>
            )}
          </section>

          {/* Fertilizer */}
          <section>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Beaker className="h-5 w-5 text-purple-500" />
              Engrais
            </h3>
            <div className="bg-purple-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="font-medium text-gray-900">{plant.fertilizerType}</p>
                </div>
                <div>
                  <span className="text-gray-500">NPK:</span>
                  <p className="font-medium text-gray-900">{plant.fertilizerNPK}</p>
                </div>
                <div>
                  <span className="text-gray-500">Fréquence:</span>
                  <p className="font-medium text-gray-900">Tous les {plant.fertilizerFreqDays} jours</p>
                </div>
                <div>
                  <span className="text-gray-500">Dose:</span>
                  <p className="font-medium text-gray-900">{plant.fertilizerDoseMLPerLiter} ml/L</p>
                </div>
              </div>
              {plant.fertilizerNotes && (
                <p className="text-sm text-purple-800 mt-2 pt-2 border-t border-purple-100">
                  {plant.fertilizerNotes}
                </p>
              )}
            </div>
          </section>

          {/* Substrate */}
          <section>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-amber-700" />
              Substrat
            </h3>
            <div className="bg-amber-50 rounded-lg p-4 space-y-2 text-sm">
              <p className="text-gray-900">{plant.preferredSubstrate}</p>
              <div className="flex gap-4 text-gray-600">
                {plant.soilPH && <span>pH: {plant.soilPH}</span>}
                <span>Drainage: {plant.drainageNeeds === "high" ? "Élevé" : plant.drainageNeeds === "medium" ? "Moyen" : "Faible"}</span>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onAdd}
              className="flex-1 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Ajouter à mon portfolio
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-1 mb-1">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
