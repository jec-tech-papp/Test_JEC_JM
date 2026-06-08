import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { careEventLabel, type CareEventType } from "@/lib/plant-types";
import { formatDate, formatRelative } from "@/lib/format";
import { NotificationActions } from "@/components/NotificationActions";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";

export const metadata = { title: "Rappels · Plant Tracker" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const [pending, history] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id, status: "PENDING" },
      include: { userPlant: { include: { plant: true } } },
      orderBy: { dueAt: "asc" },
    }),
    prisma.notification.findMany({
      where: { userId: user.id, status: { in: ["DONE", "DISMISSED"] } },
      include: { userPlant: { include: { plant: true } } },
      orderBy: { dueAt: "desc" },
      take: 20,
    }),
  ]);

  const pushPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-leaf-900">Rappels</h1>
        <p className="text-leaf-700">
          Vos prochains soins planifiés, classés par échéance.
        </p>
      </header>

      <section className="card p-5">
        <h2 className="font-bold text-leaf-900 mb-2">🔔 Notifications navigateur</h2>
        <p className="text-sm text-leaf-700 mb-3">
          Activez les notifications push pour être prévenu·e même quand l'onglet est
          fermé. Sans cette option, les rappels restent visibles dans l'app.
        </p>
        <PushNotificationToggle publicKey={pushPublicKey} />
      </section>

      <section>
        <h2 className="text-xl font-bold text-leaf-900 mb-3">À venir</h2>
        {pending.length === 0 ? (
          <p className="text-leaf-700">Aucun rappel pour l'instant. 🌞</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((n) => {
              const overdue = n.dueAt.getTime() < Date.now();
              return (
                <li
                  key={n.id}
                  className={"card p-4 flex flex-col sm:flex-row sm:items-center gap-3 " +
                    (overdue ? "ring-2 ring-amber-300" : "")}
                >
                  <div className="grow">
                    <div className="text-xs uppercase font-semibold text-leaf-600">
                      {careEventLabel[n.type as CareEventType]}
                      {overdue && (
                        <span className="ml-2 text-amber-700">en retard</span>
                      )}
                    </div>
                    <div className="font-bold text-leaf-900">{n.title}</div>
                    <div className="text-sm text-leaf-700">{n.body}</div>
                    <div className="text-xs text-leaf-500 mt-1">
                      {formatRelative(n.dueAt)} · {formatDate(n.dueAt)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {n.userPlant && (
                      <Link href={`/collection/${n.userPlant.id}`} className="btn-secondary">
                        Ouvrir
                      </Link>
                    )}
                    <NotificationActions id={n.id} userPlantId={n.userPlant?.id} type={n.type as CareEventType} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {history.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-leaf-900 mb-3">Historique récent</h2>
          <ul className="space-y-2 text-sm">
            {history.map((n) => (
              <li
                key={n.id}
                className="card px-4 py-2 flex items-center justify-between gap-3"
              >
                <span>
                  <span className="text-leaf-600 mr-2">
                    {n.status === "DONE" ? "✅" : "✖️"}
                  </span>
                  {n.title}
                </span>
                <span className="text-xs text-leaf-500">{formatDate(n.dueAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
