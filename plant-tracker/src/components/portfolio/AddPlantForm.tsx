import { useState } from 'react'
import { Search } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { PLANT_LIBRARY, searchPlants } from '@/data/plants'
import { SUBSTRATE_TEMPLATES } from '@/data/substrates'
import type { UserPlant, PlantLibraryEntry, CustomSubstrate, PotMaterial, SubstrateComponent } from '@/types'

interface AddPlantFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (plant: Omit<UserPlant, 'id'>) => Promise<void>
  userId: string
  preselectedPlant?: PlantLibraryEntry
  customSubstrates?: CustomSubstrate[]
}

const POT_MATERIALS: { value: PotMaterial; label: string }[] = [
  { value: 'plastic', label: 'Plastique' },
  { value: 'terracotta', label: 'Terre cuite' },
  { value: 'ceramic', label: 'Céramique / Grès' },
  { value: 'fabric', label: 'Pot tissu (Fabric pot)' },
  { value: 'glass', label: 'Verre' },
  { value: 'wood', label: 'Bois' },
  { value: 'other', label: 'Autre' },
]

export function AddPlantForm({
  open,
  onClose,
  onSubmit,
  userId,
  preselectedPlant,
  customSubstrates = [],
}: AddPlantFormProps) {
  const [plantSearch, setPlantSearch] = useState(preselectedPlant?.nameFr ?? '')
  const [selectedPlant, setSelectedPlant] = useState<PlantLibraryEntry | null>(preselectedPlant ?? null)
  const [showSearch, setShowSearch] = useState(!preselectedPlant)
  const [nickname, setNickname] = useState(preselectedPlant?.nameFr ?? '')
  const [acquisitionDate, setAcquisitionDate] = useState(new Date().toISOString().split('T')[0])
  const [acquisitionSource, setAcquisitionSource] = useState('')
  const [potVolume, setPotVolume] = useState('3')
  const [potMaterial, setPotMaterial] = useState<PotMaterial>('plastic')
  const [substrateId, setSubstrateId] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [fertilizingEnabled, setFertilizingEnabled] = useState(true)
  const [loading, setLoading] = useState(false)

  const searchResults = plantSearch.length >= 2 ? searchPlants(plantSearch) : PLANT_LIBRARY

  const allSubstrates: Array<{ id: string; nameFr: string; description: string; components: SubstrateComponent[]; fertilizerMultiplier: number }> = [
    ...SUBSTRATE_TEMPLATES.filter(s => s.id !== 'custom'),
    ...customSubstrates.map(s => ({ id: s.id, nameFr: s.name, description: s.description, components: s.components, fertilizerMultiplier: s.fertilizerMultiplier })),
  ]

  const substrateOptions = allSubstrates.map(s => ({
    value: s.id,
    label: s.nameFr,
  }))

  const selectedSubstrate = allSubstrates.find(s => s.id === substrateId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlant || !substrateId) return
    setLoading(true)
    try {
      await onSubmit({
        userId,
        plantId: selectedPlant.id,
        nickname: nickname || selectedPlant.nameFr,
        acquisitionDate: new Date(acquisitionDate),
        acquisitionSource,
        potVolumeLiters: parseFloat(potVolume) || 1,
        potMaterial,
        substrateId,
        substrateName: selectedSubstrate?.nameFr ?? substrateId,
        location,
        notes,
        fertilizingEnabled,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Ajouter une plante à ma collection"
      description="Renseignez les informations de votre nouvelle plante"
      size="lg"
      className="max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Plant search */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Espèce de plante *
          </label>
          {selectedPlant && !showSearch ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <img
                src={selectedPlant.imageUrl}
                alt={selectedPlant.nameFr}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48/f0fdf4/16a34a?text=🌿'
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{selectedPlant.nameFr}</p>
                <p className="text-xs text-gray-500 italic">{selectedPlant.scientificName}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Changer
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Rechercher une plante..."
                value={plantSearch}
                onChange={e => setPlantSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
              <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50">
                {searchResults.slice(0, 20).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlant(p)
                      setNickname(p.nameFr)
                      setShowSearch(false)
                      setPlantSearch(p.nameFr)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-green-50 transition-colors text-left"
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.nameFr}
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32/f0fdf4/16a34a?text=🌿'
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.nameFr}</p>
                      <p className="text-xs text-gray-400 italic">{p.scientificName}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Nickname */}
        <Input
          label="Surnom / nom personnalisé"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          placeholder="Ex: Mon Monstera, Kiwi..."
        />

        {/* Date + Source */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date d'acquisition"
            type="date"
            value={acquisitionDate}
            onChange={e => setAcquisitionDate(e.target.value)}
          />
          <Input
            label="Source"
            value={acquisitionSource}
            onChange={e => setAcquisitionSource(e.target.value)}
            placeholder="Pépinière, bouture, etc."
          />
        </div>

        {/* Pot info */}
        <div className="p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Information du pot</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Volume du pot (litres) *"
              type="number"
              step="0.5"
              min="0.1"
              value={potVolume}
              onChange={e => setPotVolume(e.target.value)}
              hint="Utilisé pour le calcul de dose d'engrais"
              required
            />
            <Select
              label="Matière du pot"
              options={POT_MATERIALS}
              value={potMaterial}
              onChange={e => setPotMaterial(e.target.value as PotMaterial)}
            />
          </div>
        </div>

        {/* Substrate */}
        <div className="space-y-2">
          <Select
            label="Substrat utilisé *"
            options={substrateOptions}
            value={substrateId}
            onChange={e => setSubstrateId(e.target.value)}
            placeholder="Choisir un substrat..."
            required
          />
          {selectedSubstrate && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-sm">
              <p className="text-amber-800 font-medium">{selectedSubstrate.nameFr}</p>
              <p className="text-amber-600 text-xs mt-0.5">{selectedSubstrate.description}</p>
              {'components' in selectedSubstrate && selectedSubstrate.components.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedSubstrate.components.map(c => (
                    <span key={c.name} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {c.percentage}% {c.name}
                    </span>
                  ))}
                </div>
              )}
              {'fertilizerMultiplier' in selectedSubstrate && selectedSubstrate.fertilizerMultiplier !== 1.0 && (
                <p className="text-xs text-amber-700 mt-1.5">
                  ⚗️ Multiplicateur de dose engrais : ×{selectedSubstrate.fertilizerMultiplier}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Location + Notes */}
        <Input
          label="Emplacement"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Salon, chambre, serre, balcon..."
        />

        <Textarea
          label="Notes personnelles"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Historique, observations, particularités..."
        />

        {/* Fertilizing reminders */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setFertilizingEnabled(!fertilizingEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${fertilizingEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${fertilizingEnabled ? 'translate-x-5' : ''}`} />
          </div>
          <span className="text-sm text-gray-700">Activer les rappels de fertilisation</span>
        </label>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
            disabled={!selectedPlant || !substrateId}
          >
            Ajouter à ma collection
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
