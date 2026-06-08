import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { computeFertilization } from "@/lib/fertilizer";
import type { FeederLevel } from "@/lib/plant-types";
import { careEventLabel, type CareEventType } from "@/lib/plant-types";
import { formatDate, formatDateTime, formatRelative } from "@/lib/format";
import { FertilizeButton } from "./FertilizeButton";
import { EditCollectionForm } from "./EditCollectionForm";
import { DeletePlantButton } from "./DeletePlantButton";

export default async function UserPlantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();
  const userPlant = await prisma.userPlant.findUnique({
    where: { id: params.id },
    include: {
      plant: true,
      substrate: true,
      events: { orderBy: { occurredAt: "desc" }, take: 25 },
    },
  });
  if (!userPlant || userPlant.userId !== user.id) notFound();

  const substrates = await prisma.substrate.findMany({ orderBy: { name: "asc" } });

  const fert = computeFertilization({
    potVolumeL: userPlant.potVolumeL,
    baseDoseMlPerLiter: userPlant.plant.baseDoseMlPerLiter,
    feeder: userPlant.plant.feeder as FeederLevel,
    fertFrequencyDaysSummer: userPlant.plant.fertFrequencyDaysSummer,
    fertFrequencyDaysWinter: userPlant.plant.fertFrequencyDaysWinter,
    fertMultiplier: userPlant.substrate.fertMultiplier,
    fertFrequencyShiftDays: userPlant.substrate.fertFrequencyShiftDays,
  });

  const overdue =
    userPlant.nextFertilizeAt &&
    userPlant.nextFertilizeAt.getTime() < Date.now();

  return (
    <div className="space-y-8">
      <header className="card p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6">
        <div>
          <p className="uppercase text-xs font-bold tracking-wide text-leaf-600">
            {userPlant.plant.category}
          </p>
          <h1 className="text-3xl font-extrabold text-leaf-900">
            {userPlant.nickname || userPlant.plant.commonName}
          </h1>
          <p className="italic text-leaf-700">{userPlant.plant.latinName}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="badge-soft">🪴 {userPlant.potVolumeL.toFixed(2)} L</span>
            <span className="badge-info">🌱 {userPlant.substrate.name}</span>
            {userPlant.location && (
              <span className="badge-soft">📍 {userPlant.location}</span>
            )}
            <Link className="badge-soft underline" href={`/library/${userPlant.plant.slug}`}>
              fiche bibliothèque ↗
            </Link>
          </div>
        </div>
        <div>
          <DeletePlantButton id={userPlant.id} />
        </div>
      </header>

      <section className={"card p-6 " + (overdue ? "ring-2 ring-amber-300" : "")}>
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div>
            <h2 className="font-bold text-leaf-900">Prochaine fertilisation</h2>
            <p className="text-leaf-700 text-sm">
              {userPlant.nextFertilizeAt ? (
                <>
                  {overdue && <span className="text-amber-700 font-semibold">En retard · </span>}
                  prévue {formatRelative(userPlant.nextFertilizeAt)} ({formatDate(userPlant.nextFertilizeAt)})
                </>
              ) : (
                "à planifier"
              )}
              {userPlant.lastFertilizedAt && (
                <> · dernière le {formatDate(userPlant.lastFertilizedAt)}</>
              )}
            </p>
          </div>
          <FertilizeButton id={userPlant.id} suggestedDose={fert.doseMl} />
        </div>
        <div className="mt-4 rounded-xl bg-leaf-50 border border-leaf-200 p-4">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <div>
              <div className="text-xs uppercase font-semibold text-leaf-700">Dose</div>
              <div className="text-2xl font-extrabold text-leaf-800">
                {fert.doseMl.toFixed(1)} mL
              </div>
            </div>
            <div>
              <div className="text-xs uppercase font-semibold text-leaf-700">
                dans l'eau
              </div>
              <div className="text-xl font-bold text-leaf-900">
                ~{(fert.irrigationVolumeMl / 1000).toFixed(2)} L
              </div>
            </div>
            <div>
              <div className="text-xs uppercase font-semibold text-leaf-700">
                Fréquence
              </div>
              <div className="text-xl font-bold text-leaf-900">
                tous les {fert.frequencyDays} j
              </div>
            </div>
            <div>
              <div className="text-xs uppercase font-semibold text-leaf-700">
                Saison
              </div>
              <div className="text-xl font-bold text-leaf-900">
                {fert.season === "summer" ? "🌞 croissance" : "❄️ repos"}
              </div>
            </div>
          </div>
          <ul className="mt-2 text-xs text-leaf-700 list-disc pl-5">
            {fert.explanation.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-bold text-leaf-900 mb-3">Ajuster les paramètres</h2>
          <EditCollectionForm
            userPlant={{
              id: userPlant.id,
              nickname: userPlant.nickname ?? "",
              location: userPlant.location ?? "",
              potVolumeL: userPlant.potVolumeL,
              substrateId: userPlant.substrateId,
              notes: userPlant.notes ?? "",
            }}
            substrates={substrates.map((s) => ({ id: s.id, name: s.name }))}
          />
        </div>

        <div className="card p-5">
          <h2 className="font-bold text-leaf-900 mb-3">Historique de soins</h2>
          {userPlant.events.length === 0 && (
            <p className="text-sm text-leaf-700">Aucun événement enregistré pour l'instant.</p>
          )}
          <ul className="space-y-2 text-sm">
            {userPlant.events.map((ev) => (
              <li
                key={ev.id}
                className="flex items-baseline justify-between border-b last:border-0 border-leaf-100 py-2"
              >
                <div>
                  <span className="font-semibold text-leaf-900">
                    {careEventLabel[ev.type as CareEventType] || ev.type}
                  </span>
                  {ev.doseMl ? <span className="text-leaf-700"> · {ev.doseMl.toFixed(1)} mL</span> : null}
                  {ev.notes && <div className="text-xs text-leaf-600 italic">{ev.notes}</div>}
                </div>
                <span className="text-xs text-leaf-500">{formatDateTime(ev.occurredAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
