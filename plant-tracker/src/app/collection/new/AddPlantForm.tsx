"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { computeFertilization } from "@/lib/fertilizer";
import type { FeederLevel } from "@/lib/plant-types";

type PlantLite = {
  id: string;
  commonName: string;
  latinName: string;
  baseDoseMlPerLiter: number;
  feeder: string;
  fertFrequencyDaysSummer: number;
  fertFrequencyDaysWinter: number;
};

type SubstrateLite = {
  id: string;
  name: string;
  description: string;
  fertMultiplier: number;
  fertFrequencyShiftDays: number;
};

export function AddPlantForm({
  plants,
  substrates,
  defaultPlantId,
}: {
  plants: PlantLite[];
  substrates: SubstrateLite[];
  defaultPlantId?: string;
}) {
  const router = useRouter();
  const [plantId, setPlantId] = useState<string>(defaultPlantId || plants[0]?.id || "");
  const [substrateId, setSubstrateId] = useState<string>(
    substrates.find((s) => s.name.startsWith("Terreau universel"))?.id || substrates[0]?.id || "",
  );
  const [nickname, setNickname] = useState("");
  const [location, setLocation] = useState("");
  const [potVolumeL, setPotVolumeL] = useState<number>(1.5);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plant = plants.find((p) => p.id === plantId);
  const substrate = substrates.find((s) => s.id === substrateId);

  const preview = useMemo(() => {
    if (!plant || !substrate) return null;
    return computeFertilization({
      potVolumeL,
      baseDoseMlPerLiter: plant.baseDoseMlPerLiter,
      feeder: plant.feeder as FeederLevel,
      fertFrequencyDaysSummer: plant.fertFrequencyDaysSummer,
      fertFrequencyDaysWinter: plant.fertFrequencyDaysWinter,
      fertMultiplier: substrate.fertMultiplier,
      fertFrequencyShiftDays: substrate.fertFrequencyShiftDays,
    });
  }, [plant, substrate, potVolumeL]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/collection", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        plantId,
        substrateId,
        nickname: nickname || undefined,
        location: location || undefined,
        potVolumeL,
      }),
    });
    setPending(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Erreur lors de l'ajout");
      return;
    }
    const j = await res.json();
    router.push(`/collection/${j.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="plant">
            Plante
          </label>
          <select
            id="plant"
            className="select"
            value={plantId}
            onChange={(e) => setPlantId(e.target.value)}
            required
          >
            {plants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.commonName} — {p.latinName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="nickname">
            Surnom (facultatif)
          </label>
          <input
            id="nickname"
            className="input"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Gigi, le grand vert…"
          />
        </div>
        <div>
          <label className="label" htmlFor="volume">
            Volume du pot (L)
          </label>
          <input
            id="volume"
            type="number"
            min={0.05}
            max={50}
            step={0.05}
            className="input"
            value={potVolumeL}
            onChange={(e) => setPotVolumeL(Math.max(0.05, Number(e.target.value)))}
            required
          />
          <p className="text-xs text-leaf-600 mt-1">
            Ø14 cm ≈ 1 L · Ø17 ≈ 2 L · Ø20 ≈ 3,5 L · Ø25 ≈ 7 L
          </p>
        </div>
        <div>
          <label className="label" htmlFor="substrate">
            Substrat
          </label>
          <select
            id="substrate"
            className="select"
            value={substrateId}
            onChange={(e) => setSubstrateId(e.target.value)}
            required
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
        <div className="md:col-span-2">
          <label className="label" htmlFor="location">
            Emplacement (facultatif)
          </label>
          <input
            id="location"
            className="input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Salon, fenêtre est"
          />
        </div>
      </div>

      {preview && (
        <div className="rounded-xl bg-leaf-50 border border-leaf-200 p-4">
          <div className="text-xs uppercase font-semibold text-leaf-700 mb-1">
            Aperçu du suivi engrais
          </div>
          <p className="text-leaf-900">
            <strong>{preview.doseMl.toFixed(1)} mL</strong> d'engrais dans{" "}
            <strong>{(preview.irrigationVolumeMl / 1000).toFixed(2)} L</strong> d'eau,
            tous les <strong>{preview.frequencyDays} jours</strong> en ce moment
            ({preview.season === "summer" ? "saison de croissance" : "repos végétatif"}).
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={() => router.back()}>
          Annuler
        </button>
        <button className="btn-primary" disabled={pending}>
          {pending ? "…" : "Ajouter à ma collection"}
        </button>
      </div>
    </form>
  );
}
