import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { PlantCard } from '@/components/plants/PlantCard'
import { PlantDetail } from '@/components/plants/PlantDetail'
import { PLANT_LIBRARY, searchPlants } from '@/data/plants'
import { CATEGORY_LABELS, DIFFICULTY_LABELS, LIGHT_LABELS } from '@/lib/utils'
import type { PlantLibraryEntry } from '@/types'

interface LibraryPageProps {
  onAddToPortfolio: (plant: PlantLibraryEntry) => void
  onAddToWishlist: (plant: PlantLibraryEntry) => void
  isInWishlist: (plantId: string) => boolean
  isInPortfolio: (plantId: string) => boolean
}

const categoryOptions = [
  { value: '', label: 'Toutes les catégories' },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
]

const difficultyOptions = [
  { value: '', label: 'Toutes difficultés' },
  ...Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({ value, label })),
]

const lightOptions = [
  { value: '', label: 'Tout éclairage' },
  ...Object.entries(LIGHT_LABELS).map(([value, label]) => ({ value, label })),
]

export function LibraryPage({
  onAddToPortfolio,
  onAddToWishlist,
  isInWishlist,
  isInPortfolio,
}: LibraryPageProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [light, setLight] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPlant, setSelectedPlant] = useState<PlantLibraryEntry | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const filtered = useMemo(() => {
    let plants = search ? searchPlants(search) : PLANT_LIBRARY
    if (category) plants = plants.filter(p => p.category === category)
    if (difficulty) plants = plants.filter(p => p.care.difficulty === Number(difficulty))
    if (light) plants = plants.filter(p => p.care.light === light)
    return plants
  }, [search, category, difficulty, light])

  const hasActiveFilters = category || difficulty || light
  const resetFilters = () => { setCategory(''); setDifficulty(''); setLight('') }

  const handleView = (plant: PlantLibraryEntry) => {
    setSelectedPlant(plant)
    setDetailOpen(true)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bibliothèque de plantes</h1>
        <p className="text-gray-500 mt-1">
          {PLANT_LIBRARY.length} plantes avec fiches de soin détaillées
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher une plante (nom, famille, tag...)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={hasActiveFilters ? 'border-green-300 text-green-700 bg-green-50' : ''}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {hasActiveFilters && (
            <span className="ml-1 bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
              {[category, difficulty, light].filter(Boolean).length}
            </span>
          )}
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            options={categoryOptions}
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Catégorie"
          />
          <Select
            options={difficultyOptions}
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            placeholder="Difficulté"
          />
          <Select
            options={lightOptions}
            value={light}
            onChange={e => setLight(e.target.value)}
            placeholder="Éclairage"
          />
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 col-span-full"
            >
              <X className="h-3.5 w-3.5" /> Réinitialiser les filtres
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} plante{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(plant => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onView={handleView}
              onAddToPortfolio={onAddToPortfolio}
              onAddToWishlist={onAddToWishlist}
              isInWishlist={isInWishlist(plant.id)}
              isInPortfolio={isInPortfolio(plant.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">Aucune plante trouvée</p>
          <p className="text-sm mt-1">Essayez d&apos;autres mots-clés ou modifiez les filtres</p>
        </div>
      )}

      <PlantDetail
        plant={selectedPlant}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onAddToPortfolio={() => {
          if (selectedPlant) onAddToPortfolio(selectedPlant)
          setDetailOpen(false)
        }}
        onAddToWishlist={() => {
          if (selectedPlant) onAddToWishlist(selectedPlant)
        }}
        isInWishlist={selectedPlant ? isInWishlist(selectedPlant.id) : false}
        isInPortfolio={selectedPlant ? isInPortfolio(selectedPlant.id) : false}
      />
    </div>
  )
}
