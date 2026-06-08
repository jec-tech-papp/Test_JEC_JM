"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Leaf, Sun, Droplets, ThermometerSun, Plus, Heart } from "lucide-react";
import { cn, getDifficultyColor, getDifficultyLabel, getLightLabel } from "@/lib/utils";
import { PlantDetailModal } from "@/components/plant-detail-modal";
import { AddToPortfolioModal } from "@/components/add-to-portfolio-modal";

interface Plant {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  description: string;
  difficulty: string;
  lightMin: number;
  lightMax: number;
  lightDescription: string;
  wateringFrequency: string;
  wateringFreqDays: number;
  tempMin: number;
  tempMax: number;
  tempIdealMin: number;
  tempIdealMax: number;
  fertilizerType: string;
  fertilizerFreqDays: number;
  fertilizerNPK: string;
  fertilizerDoseMLPerLiter: number;
  fertilizerNotes: string;
  preferredSubstrate: string;
  drainageNeeds: string;
  growthRate: string;
  maxHeight: string;
  origin: string;
  toxicity: string;
  category: { id: string; name: string; icon: string } | null;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function LibraryPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [addingPlant, setAddingPlant] = useState<Plant | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [search, selectedCategory, selectedDifficulty]);

  async function fetchCategories() {
    const res = await fetch("/api/plants/categories");
    const data = await res.json();
    setCategories(data);
  }

  async function fetchPlants() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedDifficulty) params.set("difficulty", selectedDifficulty);

    const res = await fetch(`/api/plants?${params}`);
    const data = await res.json();
    setPlants(data);
    setLoading(false);
  }

  async function addToWishlist(plantId: string) {
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantId }),
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bibliothèque de plantes</h1>
        <p className="text-gray-600">Explorez notre collection et ajoutez des plantes à votre portefeuille</p>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une plante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">Toutes catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">Toutes difficultés</option>
            <option value="easy">Facile</option>
            <option value="medium">Moyen</option>
            <option value="hard">Difficile</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {plants.length} plante{plants.length > 1 ? "s" : ""} trouvée{plants.length > 1 ? "s" : ""}
      </p>

      {/* Plants grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="h-20 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onView={() => setSelectedPlant(plant)}
              onAdd={() => setAddingPlant(plant)}
              onWishlist={() => addToWishlist(plant.id)}
            />
          ))}
        </div>
      )}

      {selectedPlant && (
        <PlantDetailModal
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
          onAdd={() => { setAddingPlant(selectedPlant); setSelectedPlant(null); }}
        />
      )}

      {addingPlant && (
        <AddToPortfolioModal
          plant={addingPlant}
          onClose={() => setAddingPlant(null)}
        />
      )}
    </div>
  );
}

function PlantCard({
  plant,
  onView,
  onAdd,
  onWishlist,
}: {
  plant: Plant;
  onView: () => void;
  onAdd: () => void;
  onWishlist: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{plant.commonName}</h3>
          <p className="text-sm text-gray-500 italic truncate">{plant.scientificName}</p>
        </div>
        <span className={cn("text-xs font-medium px-2 py-1 rounded-full ml-2 whitespace-nowrap", getDifficultyColor(plant.difficulty))}>
          {getDifficultyLabel(plant.difficulty)}
        </span>
      </div>

      {plant.category && (
        <p className="text-xs text-gray-500 mb-3">
          {plant.category.icon} {plant.category.name}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Sun className="h-3.5 w-3.5 text-amber-500" />
          <span>{getLightLabel(plant.lightMax)}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Droplets className="h-3.5 w-3.5 text-blue-500" />
          <span>{plant.wateringFreqDays}j</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <ThermometerSun className="h-3.5 w-3.5 text-red-500" />
          <span>{plant.tempIdealMin}-{plant.tempIdealMax}°C</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{plant.description}</p>

      <div className="flex items-center gap-2">
        <button
          onClick={onView}
          className="flex-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          Détails
        </button>
        <button
          onClick={onAdd}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Ajouter à mon portfolio"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={onWishlist}
          className="p-2 text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
          title="Ajouter à la wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
