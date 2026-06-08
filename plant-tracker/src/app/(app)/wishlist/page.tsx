"use client";

import { useState, useEffect } from "react";
import { Heart, Trash2, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getDifficultyColor, getDifficultyLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface WishlistItem {
  id: string;
  priority: number;
  notes: string | null;
  plant: {
    id: string;
    commonName: string;
    scientificName: string;
    difficulty: string;
    category: { name: string; icon: string } | null;
  };
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const res = await fetch("/api/wishlist");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function removeItem(plantId: string) {
    await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantId }),
    });
    setItems(items.filter((i) => i.plant.id !== plantId));
  }

  const priorityLabels: Record<number, string> = {
    1: "Urgent",
    2: "Haute",
    3: "Moyenne",
    4: "Basse",
    5: "Un jour...",
  };

  const priorityColors: Record<number, string> = {
    1: "text-red-600 bg-red-50",
    2: "text-orange-600 bg-orange-50",
    3: "text-yellow-600 bg-yellow-50",
    4: "text-blue-600 bg-blue-50",
    5: "text-gray-600 bg-gray-50",
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Ma Wishlist</h1>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ma Wishlist</h1>
          <p className="text-gray-600 mt-1">{items.length} plante{items.length > 1 ? "s" : ""} dans votre liste de souhaits</p>
        </div>
        <Link
          href="/library"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Explorer
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <Heart className="h-16 w-16 text-pink-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Votre wishlist est vide</h2>
          <p className="text-gray-600 mb-6">Parcourez la bibliothèque et ajoutez les plantes qui vous font envie</p>
          <Link
            href="/library"
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors"
          >
            Explorer la bibliothèque
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="text-2xl">
                {item.plant.category?.icon || "🌱"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{item.plant.commonName}</h3>
                <p className="text-sm text-gray-500 italic">{item.plant.scientificName}</p>
              </div>
              <span className={cn("text-xs font-medium px-2 py-1 rounded-full", getDifficultyColor(item.plant.difficulty))}>
                {getDifficultyLabel(item.plant.difficulty)}
              </span>
              <span className={cn("text-xs font-medium px-2 py-1 rounded-full", priorityColors[item.priority] || priorityColors[3])}>
                {priorityLabels[item.priority] || "Moyenne"}
              </span>
              <button
                onClick={() => removeItem(item.plant.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Retirer de la wishlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
