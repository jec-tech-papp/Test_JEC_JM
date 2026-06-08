"use client";

import { useState, useEffect } from "react";
import { Sprout, MapPin, Beaker, Droplets, Calendar, Trash2, Plus, FlaskConical } from "lucide-react";
import { cn, calculateFertilizerDose } from "@/lib/utils";
import Link from "next/link";

interface UserPlant {
  id: string;
  nickname: string | null;
  potVolumeLiters: number;
  potType: string | null;
  location: string | null;
  notes: string | null;
  createdAt: string;
  plant: {
    id: string;
    commonName: string;
    scientificName: string;
    fertilizerType: string;
    fertilizerFreqDays: number;
    fertilizerNPK: string;
    fertilizerDoseMLPerLiter: number;
    wateringFreqDays: number;
    category: { name: string; icon: string } | null;
  };
  substrate: {
    id: string;
    name: string;
    nutrientScore: number;
    drainageScore: number;
    retentionScore: number;
  } | null;
  schedules: Array<{ id: string; fertilizerName: string; nextDueDate: string; isActive: boolean }>;
}

export default function PortfolioPage() {
  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlants();
  }, []);

  async function fetchPlants() {
    const res = await fetch("/api/portfolio");
    const data = await res.json();
    setPlants(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function deletePlant(id: string) {
    if (!confirm("Supprimer cette plante de votre portfolio ?")) return;
    await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    setPlants(plants.filter((p) => p.id !== id));
  }

  async function logFertilizer(userPlant: UserPlant) {
    const { doseML, waterML } = calculateFertilizerDose(
      userPlant.plant.fertilizerDoseMLPerLiter,
      userPlant.potVolumeLiters,
      userPlant.substrate?.nutrientScore || 1.0
    );

    const confirmed = confirm(
      `Enregistrer un apport d'engrais pour ${userPlant.nickname || userPlant.plant.commonName} ?\n\n` +
      `Dose recommandée: ${doseML} ml de ${userPlant.plant.fertilizerType}\n` +
      `Dans ${waterML} ml d'eau\n` +
      `(Pot de ${userPlant.potVolumeLiters}L${userPlant.substrate ? `, substrat: ${userPlant.substrate.name}` : ""})`
    );

    if (!confirmed) return;

    await fetch("/api/fertilizer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userPlantId: userPlant.id,
        fertilizerName: userPlant.plant.fertilizerType,
        doseML,
        notes: `${doseML}ml dans ${waterML}ml d'eau`,
      }),
    });

    fetchPlants();
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes plantes</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-20 bg-gray-50 rounded" />
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
          <h1 className="text-3xl font-bold text-gray-900">Mes plantes</h1>
          <p className="text-gray-600 mt-1">{plants.length} plante{plants.length > 1 ? "s" : ""} dans votre collection</p>
        </div>
        <Link
          href="/library"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Link>
      </div>

      {plants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <Sprout className="h-16 w-16 text-green-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Votre collection est vide</h2>
          <p className="text-gray-600 mb-6">Commencez par explorer la bibliothèque et ajoutez vos premières plantes</p>
          <Link
            href="/library"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Explorer la bibliothèque
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plants.map((userPlant) => {
            const { doseML, waterML } = calculateFertilizerDose(
              userPlant.plant.fertilizerDoseMLPerLiter,
              userPlant.potVolumeLiters,
              userPlant.substrate?.nutrientScore || 1.0
            );

            return (
              <div key={userPlant.id} className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {userPlant.nickname || userPlant.plant.commonName}
                    </h3>
                    <p className="text-sm text-gray-500 italic">{userPlant.plant.scientificName}</p>
                  </div>
                  {userPlant.plant.category && (
                    <span className="text-lg">{userPlant.plant.category.icon}</span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {userPlant.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      {userPlant.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Beaker className="h-3.5 w-3.5 text-gray-400" />
                    Pot {userPlant.potVolumeLiters}L ({userPlant.potType || "standard"})
                  </div>
                  {userPlant.substrate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FlaskConical className="h-3.5 w-3.5 text-gray-400" />
                      {userPlant.substrate.name}
                    </div>
                  )}
                </div>

                {/* Fertilizer recommendation */}
                <div className="bg-purple-50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-medium text-purple-800 mb-1">Dose d&apos;engrais recommandée</p>
                  <p className="text-sm text-purple-900 font-semibold">
                    {doseML} ml de {userPlant.plant.fertilizerType}
                  </p>
                  <p className="text-xs text-purple-700">
                    Dans {waterML} ml d&apos;eau • NPK {userPlant.plant.fertilizerNPK} • Tous les {userPlant.plant.fertilizerFreqDays}j
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => logFertilizer(userPlant)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Droplets className="h-4 w-4" />
                    Fertiliser
                  </button>
                  <button
                    onClick={() => deletePlant(userPlant.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
