import Link from "next/link";
import { Leaf, Droplets, Bell, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <nav className="border-b border-green-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-green-600" />
            <span className="text-xl font-bold text-green-900">PlantKeeper</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-green-900 mb-6">
            Prenez soin de vos plantes
            <br />
            <span className="text-green-600">comme un pro</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Suivez votre collection, gérez les apports en engrais avec des doses précises,
            et ne manquez plus jamais un soin grâce aux notifications intelligentes.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300"
          >
            <Leaf className="h-5 w-5" />
            Commencer gratuitement
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <FeatureCard
            icon={<BookOpen className="h-8 w-8 text-green-600" />}
            title="Bibliothèque complète"
            description="Plus de 30 plantes documentées avec conditions de maintenance détaillées"
          />
          <FeatureCard
            icon={<Leaf className="h-8 w-8 text-emerald-600" />}
            title="Portfolio & Wishlist"
            description="Gérez votre collection et votre liste de souhaits de plantes"
          />
          <FeatureCard
            icon={<Droplets className="h-8 w-8 text-blue-600" />}
            title="Dosage précis"
            description="Calcul automatique de l'engrais selon le volume du pot et le substrat"
          />
          <FeatureCard
            icon={<Bell className="h-8 w-8 text-amber-600" />}
            title="Notifications"
            description="Rappels personnalisés pour ne jamais oublier un apport en engrais"
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
