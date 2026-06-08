import Link from "next/link";
import { prisma } from "@/lib/db";
import { careEventLabel, type CareEventType } from "@/lib/plant-types";
import { formatRelative } from "@/lib/format";

export async function UpcomingReminders({ userId }: { userId: string }) {
  const now = new Date();
  const upcoming = await prisma.notification.findMany({
    where: { userId, status: "PENDING" },
    include: { userPlant: { include: { plant: true } } },
    orderBy: { dueAt: "asc" },
    take: 6,
  });

  if (upcoming.length === 0) {
    return (
      <section className="card p-5">
        <h2 className="text-lg font-bold text-leaf-900">Rien à l'horizon ☀️</h2>
        <p className="text-leaf-700 text-sm mt-1">
          Vos plantes sont à jour. Ajoutez-en d'autres ou patientez jusqu'au prochain
          rappel.
        </p>
        <div className="mt-3 flex gap-2">
          <Link href="/collection/new" className="btn-secondary">
            + Ajouter une plante
          </Link>
          <Link href="/library" className="btn-ghost">
            Voir la bibliothèque
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-leaf-900">Prochains soins</h2>
        <Link className="text-sm font-semibold text-leaf-700 hover:underline" href="/notifications">
          Tout voir →
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {upcoming.map((n) => {
          const overdue = n.dueAt.getTime() < now.getTime();
          return (
            <li
              key={n.id}
              className={
                "card p-4 flex items-start justify-between gap-3 " +
                (overdue ? "ring-2 ring-amber-300" : "")
              }
            >
              <div className="min-w-0">
                <div className="text-xs uppercase font-semibold text-leaf-600">
                  {careEventLabel[n.type as CareEventType]}
                  {overdue && (
                    <span className="ml-2 text-amber-700">en retard</span>
                  )}
                </div>
                <div className="font-bold truncate text-leaf-900">{n.title}</div>
                <div className="text-xs text-leaf-700">{n.body}</div>
                <div className="text-xs text-leaf-500 mt-1">{formatRelative(n.dueAt)}</div>
              </div>
              {n.userPlant && (
                <Link
                  href={`/collection/${n.userPlant.id}`}
                  className="btn-secondary shrink-0"
                >
                  Ouvrir
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
