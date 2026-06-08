import { useState } from 'react'
import { Plus, Search, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { UserPlantCard } from '@/components/portfolio/UserPlantCard'
import { AddPlantForm } from '@/components/portfolio/AddPlantForm'
import { FertilizerDialog } from '@/components/fertilizer/FertilizerDialog'
import { PlantDetail } from '@/components/plants/PlantDetail'
import type { UserPlant, CustomSubstrate } from '@/types'

interface PortfolioPageProps {
  userId: string
  plants: UserPlant[]
  loading: boolean
  customSubstrates: CustomSubstrate[]
  onAddPlant: (plant: Omit<UserPlant, 'id'>) => Promise<void>
  onWater: (plant: UserPlant) => void
  onFertilize: (plant: UserPlant, product: string, concentrateMl: number, waterVolumeLiters: number) => Promise<void>
  onDelete: (plant: UserPlant) => void
}

export function PortfolioPage({
  userId,
  plants,
  loading,
  customSubstrates,
  onAddPlant,
  onWater,
  onFertilize,
  onDelete,
}: PortfolioPageProps) {
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [fertOpen, setFertOpen] = useState(false)
  const [selectedPlant, setSelectedPlant] = useState<UserPlant | null>(null)
  const [detailPlant, setDetailPlant] = useState<UserPlant | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<UserPlant | null>(null)

  const filtered = plants.filter(p => {
    const q = search.toLowerCase()
    return (
      p.nickname.toLowerCase().includes(q) ||
      (p.plant?.nameFr ?? '').toLowerCase().includes(q) ||
      (p.plant?.scientificName ?? '').toLowerCase().includes(q)
    )
  })

  const handleFertilize = (plant: UserPlant) => {
    setSelectedPlant(plant)
    setFertOpen(true)
  }

  const handleDelete = (plant: UserPlant) => {
    setConfirmDelete(plant)
  }

  const confirmDeleteAction = () => {
    if (confirmDelete) {
      onDelete(confirmDelete)
      setConfirmDelete(null)
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ma collection</h1>
          <p className="text-gray-500 mt-1">
            {plants.length} plante{plants.length !== 1 ? 's' : ''} dans votre collection
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Ajouter une plante
        </Button>
      </div>

      {/* Search */}
      {plants.length > 0 && (
        <div className="mb-4">
          <Input
            placeholder="Rechercher dans ma collection..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Plant grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(plant => (
            <UserPlantCard
              key={plant.id}
              userPlant={plant}
              onWater={onWater}
              onFertilize={handleFertilize}
              onDelete={handleDelete}
              onDetail={(p) => { setDetailPlant(p); setDetailOpen(true) }}
            />
          ))}
        </div>
      ) : plants.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sprout className="h-10 w-10 text-green-300" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Votre collection est vide</h2>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            Commencez par ajouter vos premières plantes depuis la bibliothèque ou avec le bouton ci-dessous.
          </p>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Ajouter ma première plante
          </Button>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>Aucune plante trouvée pour &quot;{search}&quot;</p>
        </div>
      )}

      {/* Add plant dialog */}
      <AddPlantForm
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={onAddPlant}
        userId={userId}
        customSubstrates={customSubstrates}
      />

      {/* Fertilizer dialog */}
      <FertilizerDialog
        open={fertOpen}
        onClose={() => setFertOpen(false)}
        userPlant={selectedPlant}
        onConfirm={(product, ml, vol) => {
          if (!selectedPlant) return Promise.resolve()
          return onFertilize(selectedPlant, product, ml, vol)
        }}
        customSubstrates={customSubstrates}
      />

      {/* Plant detail dialog */}
      <PlantDetail
        plant={detailPlant?.plant ?? null}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Supprimer cette plante ?</h2>
            <p className="text-gray-500 text-sm mb-5">
              &quot;{confirmDelete.nickname}&quot; sera retiré de votre collection. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setConfirmDelete(null)} className="flex-1">
                Annuler
              </Button>
              <Button variant="danger" onClick={confirmDeleteAction} className="flex-1">
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
