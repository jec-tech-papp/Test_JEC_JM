import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
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
import { DoseCalculator } from "@/components/DoseCalculator";
import { WishlistToggle } from "@/components/WishlistToggle";

export default async function PlantDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const plant = await prisma.plant.findUnique({ where: { slug: params.slug } });
  if (!plant) notFound();

  const [substrates, user] = await Promise.all([
    prisma.substrate.findMany({ orderBy: { name: "asc" } }),
    getCurrentUser(),
  ]);

  const inWishlist = user
    ? await prisma.wishlistItem.findUnique({
        where: { userId_plantId: { userId: user.id, plantId: plant.id } },
      })
    : null;

  return (
    <article className="space-y-8">
      <header className="card p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-start">
        <div>
          <p className="uppercase text-xs font-bold tracking-wide text-leaf-600">
            {plant.category}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-leaf-900">
            {plant.commonName}
          </h1>
          <p className="italic text-leaf-700">
            {plant.latinName}
            {plant.family ? ` · ${plant.family}` : ""}
          </p>
          <p className="mt-4 text-leaf-900 max-w-prose">{plant.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {plant.toxicToPets && (
              <span className="badge-danger">⚠️ Toxique pour les animaux</span>
            )}
            <span className="badge-soft">{difficultyLabel[plant.difficulty as Difficulty]}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:items-end">
          {user ? (
            <>
              <Link href={`/collection/new?plantId=${plant.id}`} className="btn-primary">
                + Ajouter à ma collection
              </Link>
              <WishlistToggle plantId={plant.id} initial={Boolean(inWishlist)} />
            </>
          ) : (
            <Link href="/signup" className="btn-primary">
              Créez un compte pour suivre cette plante
            </Link>
          )}
        </div>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-leaf-900">Conditions de soin</h2>
          <CareRow label="Lumière">{lightLabel[plant.light as LightLevel]}</CareRow>
          <CareRow label="Température">
            {plant.minTempC}–{plant.maxTempC} °C
          </CareRow>
          <CareRow label="Hygrométrie">
            {humidityLabel[plant.humidity as HumidityLevel]}
          </CareRow>
          <CareRow label="Arrosage (été)">tous les {plant.wateringDaysSummer} j</CareRow>
          <CareRow label="Arrosage (hiver)">tous les {plant.wateringDaysWinter} j</CareRow>
          {plant.wateringNotes && (
            <p className="text-sm text-leaf-700 italic border-l-2 border-leaf-200 pl-3">
              {plant.wateringNotes}
            </p>
          )}
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-leaf-900">Engrais</h2>
          <CareRow label="Besoin">{feederLabel[plant.feeder as FeederLevel]}</CareRow>
          <CareRow label="Dose de base">
            {plant.baseDoseMlPerLiter} mL / L d'eau d'arrosage
          </CareRow>
          <CareRow label="Fréquence (été)">
            tous les {plant.fertFrequencyDaysSummer} j
          </CareRow>
          <CareRow label="Fréquence (hiver)">
            tous les {plant.fertFrequencyDaysWinter} j
          </CareRow>
          <CareRow label="NPK conseillé">{plant.recommendedNPK}</CareRow>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-leaf-900 mb-3">
          🧪 Calculer la dose pour mon pot
        </h2>
        <DoseCalculator plant={plant} substrates={substrates} />
      </section>
    </article>
  );
}

function CareRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 text-sm">
      <span className="text-leaf-600 w-40 shrink-0 uppercase text-xs font-semibold tracking-wide">
        {label}
      </span>
      <span className="text-leaf-900">{children}</span>
    </div>
  );
}
