"use client";

import { useState, useEffect } from "react";
import { Beaker, Plus, FlaskConical, Droplets, Leaf, Zap } from "lucide-react";

interface SubstrateComponent {
  id: string;
  name: string;
  description: string;
  retentionFactor: number;
  drainageFactor: number;
  nutrientFactor: number;
  phEffect: string;
}

interface UserSubstrate {
  id: string;
  name: string;
  description: string | null;
  composition: string;
  retentionScore: number;
  drainageScore: number;
  nutrientScore: number;
}

interface CompositionItem {
  componentId: string;
  percentage: number;
}

export default function SubstratesPage() {
  const [substrates, setSubstrates] = useState<UserSubstrate[]>([]);
  const [components, setComponents] = useState<SubstrateComponent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [composition, setComposition] = useState<CompositionItem[]>([{ componentId: "", percentage: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/substrates").then((r) => r.json()),
      fetch("/api/substrates/components").then((r) => r.json()),
    ]).then(([subs, comps]) => {
      setSubstrates(Array.isArray(subs) ? subs : []);
      setComponents(Array.isArray(comps) ? comps : []);
      setLoading(false);
    });
  }, []);

  function addComponent() {
    setComposition([...composition, { componentId: "", percentage: 0 }]);
  }

  function removeComponent(index: number) {
    setComposition(composition.filter((_, i) => i !== index));
  }

  function updateComponent(index: number, field: keyof CompositionItem, value: string | number) {
    const updated = [...composition];
    updated[index] = { ...updated[index], [field]: value };
    setComposition(updated);
  }

  const totalPercentage = composition.reduce((sum, c) => sum + (c.percentage || 0), 0);

  // Calculate preview scores
  function calculatePreview() {
    let retention = 0, drainage = 0, nutrient = 0;
    for (const item of composition) {
      const comp = components.find((c) => c.id === item.componentId);
      if (comp && item.percentage > 0) {
        const weight = item.percentage / 100;
        retention += comp.retentionFactor * weight;
        drainage += comp.drainageFactor * weight;
        nutrient += comp.nutrientFactor * weight;
      }
    }
    return {
      retention: Math.round(retention * 100) / 100,
      drainage: Math.round(drainage * 100) / 100,
      nutrient: Math.round(nutrient * 100) / 100,
    };
  }

  const preview = calculatePreview();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }
    if (totalPercentage !== 100) {
      setError("Le total des pourcentages doit être 100%");
      return;
    }

    const validComposition = composition.filter((c) => c.componentId && c.percentage > 0);
    if (validComposition.length === 0) {
      setError("Ajoutez au moins un composant");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/substrates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, composition: validComposition }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur");
        return;
      }

      const newSubstrate = await res.json();
      setSubstrates([...substrates, newSubstrate]);
      setShowForm(false);
      setName("");
      setDescription("");
      setComposition([{ componentId: "", percentage: 0 }]);
    } catch {
      setError("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Substrats</h1>
          <p className="text-gray-600 mt-1">Créez des mélanges personnalisés pour vos plantes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau substrat
        </button>
      </div>

      {/* Creation form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Créer un substrat</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du substrat</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  placeholder="Ex: Mélange aroïdes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  placeholder="Pour Monstera, Philodendron..."
                />
              </div>
            </div>

            {/* Composition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Composition ({totalPercentage}% / 100%)
              </label>
              <div className="space-y-2">
                {composition.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={item.componentId}
                      onChange={(e) => updateComponent(index, "componentId", e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="">Choisir un composant...</option>
                      {components.map((comp) => (
                        <option key={comp.id} value={comp.id}>
                          {comp.name} - {comp.description}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.percentage || ""}
                        onChange={(e) => updateComponent(index, "percentage", parseInt(e.target.value) || 0)}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none text-center"
                        placeholder="%"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                    {composition.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeComponent(index)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addComponent}
                className="mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                + Ajouter un composant
              </button>
            </div>

            {/* Preview scores */}
            {totalPercentage > 0 && (
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-800 mb-2">Propriétés estimées du mélange</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Droplets className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Rétention</p>
                    <p className="font-bold text-gray-900">{preview.retention}</p>
                  </div>
                  <div className="text-center">
                    <FlaskConical className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Drainage</p>
                    <p className="font-bold text-gray-900">{preview.drainage}</p>
                  </div>
                  <div className="text-center">
                    <Zap className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Nutriments</p>
                    <p className="font-bold text-gray-900">{preview.nutrient}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || totalPercentage !== 100}
                className="px-6 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Création..." : "Créer le substrat"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing substrates */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : substrates.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <Beaker className="h-16 w-16 text-amber-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun substrat personnalisé</h2>
          <p className="text-gray-600 mb-6">Créez vos propres mélanges pour un suivi précis des apports en engrais</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Créer un substrat
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {substrates.map((substrate) => {
            let compositionItems: CompositionItem[] = [];
            try {
              compositionItems = JSON.parse(substrate.composition);
            } catch {}

            return (
              <div key={substrate.id} className="bg-white rounded-xl border border-stone-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{substrate.name}</h3>
                {substrate.description && (
                  <p className="text-sm text-gray-500 mb-3">{substrate.description}</p>
                )}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-blue-600">Rétention</p>
                    <p className="text-sm font-bold text-blue-800">{substrate.retentionScore}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-green-600">Drainage</p>
                    <p className="text-sm font-bold text-green-800">{substrate.drainageScore}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-purple-600">Nutriments</p>
                    <p className="text-sm font-bold text-purple-800">{substrate.nutrientScore}</p>
                  </div>
                </div>
                {compositionItems.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {compositionItems.map((item, i) => {
                      const comp = components.find((c) => c.id === item.componentId);
                      return comp ? (
                        <span key={i}>
                          {i > 0 && " • "}
                          {comp.name} {item.percentage}%
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Component reference */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Composants disponibles</h2>
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Composant</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Description</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Rétention</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Drainage</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Nutriments</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">pH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {components.map((comp) => (
                  <tr key={comp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{comp.name}</td>
                    <td className="px-4 py-3 text-gray-600">{comp.description}</td>
                    <td className="px-4 py-3 text-center">
                      <ScoreBadge value={comp.retentionFactor} color="blue" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ScoreBadge value={comp.drainageFactor} color="green" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ScoreBadge value={comp.nutrientFactor} color="purple" />
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 capitalize">{comp.phEffect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ value, color }: { value: number; color: "blue" | "green" | "purple" }) {
  const colors = {
    blue: value >= 1.5 ? "bg-blue-100 text-blue-800" : value >= 1 ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-500",
    green: value >= 1.5 ? "bg-green-100 text-green-800" : value >= 1 ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500",
    purple: value >= 1.5 ? "bg-purple-100 text-purple-800" : value >= 1 ? "bg-purple-50 text-purple-600" : "bg-gray-50 text-gray-500",
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[color]}`}>
      {value}
    </span>
  );
}
