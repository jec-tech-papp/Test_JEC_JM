import { prisma } from "@/lib/db";
import { PlantCard } from "@/components/PlantCard";

export const metadata = { title: "Bibliothèque · Plant Tracker" };

type SearchParams = {
  q?: string;
  category?: string;
  light?: string;
  difficulty?: string;
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = searchParams.q?.trim();
  const category = searchParams.category?.trim();
  const light = searchParams.light?.trim();
  const difficulty = searchParams.difficulty?.trim();

  const filters: Parameters<typeof prisma.plant.findMany>[0] = { where: {} };
  if (q) {
    filters.where = {
      ...filters.where,
      OR: [
        { commonName: { contains: q } },
        { latinName: { contains: q } },
        { category: { contains: q } },
        { family: { contains: q } },
      ],
    };
  }
  if (category) filters.where = { ...filters.where, category };
  if (light) filters.where = { ...filters.where, light };
  if (difficulty) filters.where = { ...filters.where, difficulty };

  const [plants, categories] = await Promise.all([
    prisma.plant.findMany({ ...filters, orderBy: { commonName: "asc" } }),
    prisma.plant.findMany({ distinct: ["category"], select: { category: true } }),
  ]);

  const allCategories = Array.from(new Set(categories.map((c) => c.category))).sort();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-leaf-900">Bibliothèque</h1>
        <p className="text-leaf-700">
          {plants.length} plante{plants.length > 1 ? "s" : ""} trouvée
          {plants.length > 1 ? "s" : ""}. Cliquez pour voir les conditions de soin
          détaillées et calculer la dose d'engrais.
        </p>
      </header>

      <form className="card p-4 grid gap-3 md:grid-cols-5">
        <div className="md:col-span-2">
          <label className="label" htmlFor="q">
            Recherche
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Monstera, philodendron, cactus…"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="category">
            Catégorie
          </label>
          <select id="category" name="category" defaultValue={category} className="select">
            <option value="">Toutes</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="light">
            Lumière
          </label>
          <select id="light" name="light" defaultValue={light} className="select">
            <option value="">Toutes</option>
            <option value="LOW">Faible</option>
            <option value="MEDIUM_LOW">Faible à moyenne</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="BRIGHT_INDIRECT">Lumineuse indirecte</option>
            <option value="DIRECT_SUN">Plein soleil</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="difficulty">
            Difficulté
          </label>
          <select id="difficulty" name="difficulty" defaultValue={difficulty} className="select">
            <option value="">Toutes</option>
            <option value="EASY">Facile</option>
            <option value="MODERATE">Intermédiaire</option>
            <option value="ADVANCED">Expert</option>
          </select>
        </div>
        <div className="md:col-span-5 flex gap-2 justify-end">
          <a href="/library" className="btn-ghost">
            Réinitialiser
          </a>
          <button className="btn-primary">Filtrer</button>
        </div>
      </form>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {plants.map((p) => (
          <PlantCard key={p.id} plant={p} />
        ))}
      </div>

      {plants.length === 0 && (
        <p className="text-center text-leaf-700 py-10">
          Aucune plante ne correspond. Essayez d'élargir vos filtres.
        </p>
      )}
    </div>
  );
}
