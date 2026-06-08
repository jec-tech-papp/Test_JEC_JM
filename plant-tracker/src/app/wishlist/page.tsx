import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { PlantCard } from "@/components/PlantCard";
import { WishlistRemove } from "@/components/WishlistRemove";

export const metadata = { title: "Wishlist · Plant Tracker" };

export default async function WishlistPage() {
  const user = await requireUser();
  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: { plant: true },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold text-leaf-900">Ma wishlist</h1>
        <p className="text-leaf-700">
          {items.length} plante{items.length > 1 ? "s" : ""} en attente d'adoption.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-2">💚</div>
          <p className="text-leaf-700">
            Votre wishlist est vide. Ajoutez les plantes qui vous font envie depuis la
            bibliothèque.
          </p>
          <Link href="/library" className="btn-primary mt-4 inline-flex">
            Parcourir la bibliothèque
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.id} className="relative">
              <PlantCard plant={it.plant} />
              <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                <span className="badge-warn">
                  {it.priority === 1 ? "⭐ haute" : it.priority === 2 ? "⭐ moyenne" : "⭐ basse"}
                </span>
                <WishlistRemove plantId={it.plantId} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
