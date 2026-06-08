import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { PlantCard } from "@/components/PlantCard";
import { UpcomingReminders } from "@/components/UpcomingReminders";

export default async function HomePage() {
  const user = await getCurrentUser();
  const [plantCount, substrateCount, popular] = await Promise.all([
    prisma.plant.count(),
    prisma.substrate.count(),
    prisma.plant.findMany({ take: 6, orderBy: { commonName: "asc" } }),
  ]);

  return (
    <div className="space-y-12">
      <section className="card p-6 md:p-10 bg-gradient-to-br from-white to-leaf-100">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <p className="text-leaf-700 font-semibold tracking-wide uppercase text-xs">
              Pour les plant addicts
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-leaf-900 mt-2">
              Suivez vos plantes. <br />
              <span className="text-leaf-600">Dosez juste.</span> Fertilisez à temps.
            </h1>
            <p className="text-leaf-800 mt-4 max-w-prose">
              Une bibliothèque de plus de {plantCount} plantes et{" "}
              {substrateCount} substrats, un calculateur d'engrais qui tient compte
              du volume du pot et du substrat utilisé, des rappels intelligents pour
              ne plus rien oublier.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {user ? (
                <>
                  <Link className="btn-primary" href="/collection">
                    Voir ma collection
                  </Link>
                  <Link className="btn-secondary" href="/library">
                    Parcourir la bibliothèque
                  </Link>
                </>
              ) : (
                <>
                  <Link className="btn-primary" href="/signup">
                    Démarrer gratuitement
                  </Link>
                  <Link className="btn-secondary" href="/library">
                    Explorer la bibliothèque
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <FeatureTile emoji="📚" title="Bibliothèque" body={`${plantCount} plantes documentées avec lumière, T°, hygrométrie, fertilité.`} />
            <FeatureTile emoji="🧪" title="Dosage exact" body="Calcul de la dose d'engrais selon le pot et le substrat." />
            <FeatureTile emoji="📅" title="Rappels" body="Notifications push + rappels en-app personnalisés." />
            <FeatureTile emoji="🪴" title="Collection & wishlist" body="Cataloguez vos plantes, listez vos envies." />
          </div>
        </div>
      </section>

      {user && <UpcomingReminders userId={user.id} />}

      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl font-bold text-leaf-900">Quelques plantes</h2>
          <Link className="text-sm font-semibold text-leaf-700 hover:underline" href="/library">
            Toute la bibliothèque →
          </Link>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((p) => (
            <PlantCard key={p.id} plant={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

function FeatureTile({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl bg-white/70 border border-leaf-100 p-4">
      <div className="text-2xl">{emoji}</div>
      <div className="font-semibold mt-1 text-leaf-900">{title}</div>
      <div className="text-leaf-700 text-xs mt-1 leading-snug">{body}</div>
    </div>
  );
}
