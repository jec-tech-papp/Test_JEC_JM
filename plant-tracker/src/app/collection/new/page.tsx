import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { AddPlantForm } from "./AddPlantForm";

export const metadata = { title: "Ajouter une plante · Plant Tracker" };

export default async function NewUserPlantPage({
  searchParams,
}: {
  searchParams: { plantId?: string };
}) {
  await requireUser();
  const [plants, substrates] = await Promise.all([
    prisma.plant.findMany({ orderBy: { commonName: "asc" } }),
    prisma.substrate.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-3xl font-extrabold text-leaf-900">Ajouter une plante</h1>
      <p className="text-leaf-700">
        Renseignez votre pot et votre substrat pour que le calcul d'engrais soit le
        plus précis possible.
      </p>

      <AddPlantForm
        plants={plants.map((p) => ({
          id: p.id,
          commonName: p.commonName,
          latinName: p.latinName,
          baseDoseMlPerLiter: p.baseDoseMlPerLiter,
          feeder: p.feeder,
          fertFrequencyDaysSummer: p.fertFrequencyDaysSummer,
          fertFrequencyDaysWinter: p.fertFrequencyDaysWinter,
        }))}
        substrates={substrates.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          fertMultiplier: s.fertMultiplier,
          fertFrequencyShiftDays: s.fertFrequencyShiftDays,
        }))}
        defaultPlantId={searchParams.plantId}
      />
    </div>
  );
}
