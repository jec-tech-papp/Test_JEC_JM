import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatDate, formatRelative } from "@/lib/format";

export const metadata = { title: "Ma collection · Plant Tracker" };

export default async function CollectionPage() {
  const user = await requireUser();
  const items = await prisma.userPlant.findMany({
    where: { userId: user.id, archived: false },
    include: { plant: true, substrate: true },
    orderBy: [{ nextFertilizeAt: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-leaf-900">Ma collection</h1>
          <p className="text-leaf-700">
            {items.length} plante{items.length > 1 ? "s" : ""} suivie
            {items.length > 1 ? "s" : ""}.
          </p>
        </div>
        <Link href="/collection/new" className="btn-primary">
          + Ajouter une plante
        </Link>
      </header>

      {items.length === 0 && (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-2">🪴</div>
          <p className="text-leaf-700">Votre collection est vide pour l'instant.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/library" className="btn-secondary">
              Parcourir la bibliothèque
            </Link>
            <Link href="/collection/new" className="btn-primary">
              + Ajouter ma première plante
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((up) => {
          const overdue =
            up.nextFertilizeAt && up.nextFertilizeAt.getTime() < Date.now();
          return (
            <Link
              key={up.id}
              href={`/collection/${up.id}`}
              className={
                "card p-4 hover:shadow-md hover:border-leaf-300 transition " +
                (overdue ? "ring-2 ring-amber-300" : "")
              }
            >
              <div className="text-xs uppercase font-semibold text-leaf-600">
                {up.plant.category}
              </div>
              <div className="font-bold text-leaf-900">
                {up.nickname || up.plant.commonName}
              </div>
              <div className="text-xs italic text-leaf-700">{up.plant.latinName}</div>
              <div className="mt-3 text-xs text-leaf-700 space-y-1">
                <div>🪴 Pot : {up.potVolumeL.toFixed(2)} L</div>
                <div>🌱 Substrat : {up.substrate.name}</div>
                {up.location && <div>📍 {up.location}</div>}
                <div>
                  🧪 Prochaine fert :{" "}
                  {up.nextFertilizeAt ? (
                    <span className={overdue ? "text-amber-700 font-semibold" : ""}>
                      {formatRelative(up.nextFertilizeAt)} ({formatDate(up.nextFertilizeAt)})
                    </span>
                  ) : (
                    "à planifier"
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
