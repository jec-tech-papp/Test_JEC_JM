"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Plant {
  id: string;
  commonName: string;
  scientificName: string;
}

interface Substrate {
  id: string;
  name: string;
  drainageScore: number;
  retentionScore: number;
  nutrientScore: number;
}

export function AddToPortfolioModal({ plant, onClose }: { plant: Plant; onClose: () => void }) {
  const router = useRouter();
  const [substrates, setSubstrates] = useState<Substrate[]>([]);
  const [nickname, setNickname] = useState("");
  const [potVolume, setPotVolume] = useState("2");
  const [potType, setPotType] = useState("plastic");
  const [location, setLocation] = useState("");
  const [substrateId, setSubstrateId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/substrates")
      .then((res) => res.json())
      .then((data) => setSubstrates(Array.isArray(data) ? data : []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantId: plant.id,
          nickname: nickname || null,
          potVolumeLiters: parseFloat(potVolume),
          potType,
          location: location || null,
          substrateId: substrateId || null,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'ajout");
        return;
      }

      router.push("/portfolio");
      router.refresh();
      onClose();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ajouter à mon portfolio</h2>
            <p className="text-sm text-gray-500">{plant.commonName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Surnom (optionnel)</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="Ex: Ma Monstera du salon"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Volume du pot (L)</label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={potVolume}
                onChange={(e) => setPotVolume(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de pot</label>
              <select
                value={potType}
                onChange={(e) => setPotType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="plastic">Plastique</option>
                <option value="terracotta">Terre cuite</option>
                <option value="ceramic">Céramique</option>
                <option value="fabric">Tissu (Fabric pot)</option>
                <option value="glass">Verre</option>
                <option value="concrete">Béton</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="Ex: Salon fenêtre sud, Salle de bain..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Substrat</label>
            <select
              value={substrateId}
              onChange={(e) => setSubstrateId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="">Aucun substrat sélectionné</option>
              {substrates.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Créez vos substrats personnalisés dans l&apos;onglet Substrats
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
              placeholder="Notes sur cette plante..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Ajout..." : "Ajouter au portfolio"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
