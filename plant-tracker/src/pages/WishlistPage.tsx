import { useState } from 'react'
import { Heart, Trash2, Search, BookOpen, ArrowRight, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { PlantDetail } from '@/components/plants/PlantDetail'
import { PRIORITY_LABELS, PRIORITY_COLORS, CATEGORY_LABELS, formatDate, cn } from '@/lib/utils'
import type { WishlistItem, WishlistPriority, PlantLibraryEntry } from '@/types'

interface WishlistPageProps {
  items: WishlistItem[]
  loading: boolean
  onRemove: (id: string) => void
  onUpdatePriority: (id: string, priority: WishlistPriority) => void
  onMoveToPortfolio: (item: WishlistItem) => void
}

const priorityOrder: Record<WishlistPriority, number> = {
  dream: 0, high: 1, medium: 2, low: 3,
}

export function WishlistPage({
  items,
  loading,
  onRemove,
  onUpdatePriority,
  onMoveToPortfolio,
}: WishlistPageProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'name'>('priority')
  const [selectedPlant, setSelectedPlant] = useState<PlantLibraryEntry | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const filtered = items
    .filter(item => {
      const q = search.toLowerCase()
      return (
        (item.plant?.nameFr ?? '').toLowerCase().includes(q) ||
        (item.plant?.scientificName ?? '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority]
      if (sortBy === 'date') return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      if (sortBy === 'name') return (a.plant?.nameFr ?? '').localeCompare(b.plant?.nameFr ?? '')
      return 0
    })

  const dreamItems = filtered.filter(i => i.priority === 'dream')
  const otherItems = filtered.filter(i => i.priority !== 'dream')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ma wishlist</h1>
        <p className="text-gray-500 mt-1">
          {items.length} plante{items.length !== 1 ? 's' : ''} dans votre liste de souhaits
        </p>
      </div>

      {items.length > 0 && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select
            options={[
              { value: 'priority', label: 'Par priorité' },
              { value: 'date', label: 'Par date' },
              { value: 'name', label: 'Par nom' },
            ]}
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
          />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-10 w-10 text-rose-200" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Votre wishlist est vide</h2>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            Parcourez la bibliothèque et ajoutez des plantes à votre liste de souhaits.
          </p>
          <Button variant="secondary" onClick={() => window.location.hash = '#library'}>
            <BookOpen className="h-4 w-4" />
            Explorer la bibliothèque
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dream plants section */}
          {dreamItems.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-purple-500 fill-purple-500" />
                Coups de cœur
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dreamItems.map(item => (
                  <WishlistItemCard
                    key={item.id}
                    item={item}
                    onRemove={() => onRemove(item.id)}
                    onUpdatePriority={(p) => onUpdatePriority(item.id, p)}
                    onMoveToPortfolio={() => onMoveToPortfolio(item)}
                    onViewDetail={() => {
                      if (item.plant) { setSelectedPlant(item.plant); setDetailOpen(true) }
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other plants */}
          {otherItems.length > 0 && (
            <div>
              {dreamItems.length > 0 && (
                <h2 className="text-base font-semibold text-gray-700 mb-3">Autres souhaits</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherItems.map(item => (
                  <WishlistItemCard
                    key={item.id}
                    item={item}
                    onRemove={() => onRemove(item.id)}
                    onUpdatePriority={(p) => onUpdatePriority(item.id, p)}
                    onMoveToPortfolio={() => onMoveToPortfolio(item)}
                    onViewDetail={() => {
                      if (item.plant) { setSelectedPlant(item.plant); setDetailOpen(true) }
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <PlantDetail
        plant={selectedPlant}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}

function WishlistItemCard({
  item,
  onRemove,
  onUpdatePriority,
  onMoveToPortfolio,
  onViewDetail,
}: {
  item: WishlistItem
  onRemove: () => void
  onUpdatePriority: (p: WishlistPriority) => void
  onMoveToPortfolio: () => void
  onViewDetail: () => void
}) {
  const plant = item.plant
  const priorities: WishlistPriority[] = ['low', 'medium', 'high', 'dream']

  return (
    <Card className="overflow-hidden">
      <div className="relative h-36 bg-green-50">
        {plant?.imageUrl ? (
          <img
            src={plant.imageUrl}
            alt={plant.nameFr}
            className="w-full h-full object-cover cursor-pointer"
            onClick={onViewDetail}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x144/f0fdf4/16a34a?text=🌿'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🌿</div>
        )}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <div className="absolute bottom-2 left-2">
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium border', PRIORITY_COLORS[item.priority])}>
            {PRIORITY_LABELS[item.priority]}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 cursor-pointer hover:text-green-700" onClick={onViewDetail}>
          {plant?.nameFr ?? 'Plante inconnue'}
        </h3>
        <p className="text-xs text-gray-400 italic">{plant?.scientificName}</p>
        {plant?.category && (
          <p className="text-xs text-gray-500 mt-1">{CATEGORY_LABELS[plant.category]}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">Ajouté le {formatDate(item.addedAt)}</p>

        {item.notes && (
          <p className="text-xs text-gray-600 mt-2 italic line-clamp-2">&quot;{item.notes}&quot;</p>
        )}

        {/* Priority selector */}
        <div className="flex gap-1 mt-3">
          {priorities.map(p => (
            <button
              key={p}
              onClick={() => onUpdatePriority(p)}
              className={cn(
                'flex-1 py-1 rounded-lg text-xs font-medium transition-all border',
                item.priority === p ? PRIORITY_COLORS[p] + ' border-current' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100',
              )}
            >
              {p === 'dream' ? '⭐' : p === 'high' ? '🔥' : p === 'medium' ? '💛' : '🌱'}
            </button>
          ))}
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="w-full mt-3"
          onClick={onMoveToPortfolio}
        >
          <ArrowRight className="h-3.5 w-3.5" />
          Ajouter à ma collection
        </Button>
      </div>
    </Card>
  )
}
