"use client";

import { useMemo, useState } from "react";
import type { Plant, Substrate } from "@prisma/client";
import { computeFertilization } from "@/lib/fertilizer";
import type { FeederLevel } from "@/lib/plant-types";

export function DoseCalculator({
  plant,
  substrates,
}: {
  plant: Plant;
  substrates: Substrate[];
}) {
  const [substrateId, setSubstrateId] = useState<string>(
    substrates.find((s) => s.slug === "terreau-universel")?.id || substrates[0]?.id || "",
  );
  const [potVolumeL, setPotVolumeL] = useState<number>(1.5);
  const [season, setSeason] = useState<"summer" | "winter" | "auto">("auto");

  const substrate = substrates.find((s) => s.id === substrateId);

  const result = useMemo(() => {
    if (!substrate) return null;
    return computeFertilization({
      potVolumeL,
      baseDoseMlPerLiter: plant.baseDoseMlPerLiter,
      feeder: plant.feeder as FeederLevel,
      fertFrequencyDaysSummer: plant.fertFrequencyDaysSummer,
      fertFrequencyDaysWinter: plant.fertFrequencyDaysWinter,
      fertMultiplier: substrate.fertMultiplier,
      fertFrequencyShiftDays: substrate.fertFrequencyShiftDays,
      season: season === "auto" ? undefined : season,
    });
  }, [plant, substrate, potVolumeL, season]);

  return (
    <div className="card p-5">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="label" htmlFor="substrate">Substrat</label>
          <select
            id="substrate"
            value={substrateId}
            onChange={(e) => setSubstrateId(e.target.value)}
            className="select"
          >
            {substrates.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {substrate && (
            <p className="text-xs text-leaf-600 mt-1">{substrate.description}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="volume">Volume du pot (L)</label>
          <input
            id="volume"
            type="number"
            min={0.05}
            max={50}
            step={0.05}
            value={potVolumeL}
            onChange={(e) => setPotVolumeL(Math.max(0.05, Number(e.target.value)))}
            className="input"
          />
          <p className="text-xs text-leaf-600 mt-1">
            Astuce : un pot de Ø14 cm ≈ 1 L, Ø17 cm ≈ 2 L, Ø20 cm ≈ 3,5 L.
          </p>
        </div>
        <div>
          <label className="label" htmlFor="season">Saison</label>
          <select
            id="season"
            value={season}
            onChange={(e) => setSeason(e.target.value as "summer" | "winter" | "auto")}
            className="select"
          >
            <option value="auto">Automatique (selon la date)</option>
            <option value="summer">Croissance (printemps/été)</option>
            <option value="winter">Repos (automne/hiver)</option>
          </select>
        </div>
      </div>

      {result && (
        <div className="mt-5 rounded-xl bg-leaf-50 border border-leaf-200 p-4">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <div>
              <div className="text-xs uppercase font-semibold text-leaf-700">
                Dose d'engrais
              </div>
              <div className="text-3xl font-extrabold text-leaf-800">
                {result.doseMl.toFixed(1)} <span className="text-base font-bold">mL</span>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase font-semibold text-leaf-700">
                dans l'eau
              </div>
              <div className="text-xl font-bold text-leaf-900">
                ~{(result.irrigationVolumeMl / 1000).toFixed(2)} L
              </div>
            </div>
            <div>
              <div className="text-xs uppercase font-semibold text-leaf-700">
                Prochaine fert.
              </div>
              <div className="text-xl font-bold text-leaf-900">
                dans {result.frequencyDays} j
              </div>
            </div>
            <div>
              <div className="text-xs uppercase font-semibold text-leaf-700">
                Saison estimée
              </div>
              <div className="text-xl font-bold text-leaf-900">
                {result.season === "summer" ? "🌞 croissance" : "❄️ repos"}
              </div>
            </div>
          </div>
          <ul className="mt-3 text-sm text-leaf-800 list-disc pl-5 space-y-0.5">
            {result.explanation.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
