import { Heart, Plus, Sun, Droplets, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  LIGHT_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  CATEGORY_LABELS,
} from '@/lib/utils'
import type { PlantLibraryEntry } from '@/types'
import { cn } from '@/lib/utils'

interface PlantCardProps {
  plant: PlantLibraryEntry
  onView?: (plant: PlantLibraryEntry) => void
  onAddToPortfolio?: (plant: PlantLibraryEntry) => void
  onAddToWishlist?: (plant: PlantLibraryEntry) => void
  isInWishlist?: boolean
  isInPortfolio?: boolean
}

const WATERING_ICONS: Record<string, string> = {
  daily: '💧💧💧',
  'twice-week': '💧💧',
  weekly: '💧',
  'bi-weekly': '🌵',
  monthly: '🏜️',
}

export function PlantCard({
  plant,
  onView,
  onAddToPortfolio,
  onAddToWishlist,
  isInWishlist,
  isInPortfolio,
}: PlantCardProps) {
  return (
    <Card
      hoverable
      onClick={() => onView?.(plant)}
      className="overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-green-50">
        <img
          src={plant.imageUrl}
          alt={plant.nameFr}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/f0fdf4/16a34a?text=${encodeURIComponent(plant.nameFr)}`
          }}
        />
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-700 border-0">
            {CATEGORY_LABELS[plant.category]}
          </Badge>
        </div>
        {isInPortfolio && (
          <div className="absolute top-2 right-2">
            <Badge variant="success" className="bg-green-600 text-white border-0">
              ✓ Collection
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <h3 className="font-semibold text-gray-900 leading-tight">{plant.nameFr}</h3>
        <p className="text-xs text-gray-400 italic mt-0.5 mb-2">{plant.scientificName}</p>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{plant.description}</p>

        {/* Quick stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Sun className="h-3.5 w-3.5 text-amber-400" />
            {LIGHT_LABELS[plant.care.light]}
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="h-3.5 w-3.5 text-blue-400" />
            {WATERING_ICONS[plant.care.wateringFrequency]}
          </span>
          <span className={cn('flex items-center gap-1 ml-auto font-medium', DIFFICULTY_COLORS[plant.care.difficulty])}>
            <Star className="h-3.5 w-3.5" />
            {DIFFICULTY_LABELS[plant.care.difficulty]}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2" onClick={e => e.stopPropagation()}>
        {onAddToPortfolio && (
          <Button
            size="sm"
            variant={isInPortfolio ? 'secondary' : 'primary'}
            onClick={() => onAddToPortfolio(plant)}
            className="flex-1"
            disabled={isInPortfolio}
          >
            <Plus className="h-3.5 w-3.5" />
            {isInPortfolio ? 'Déjà dans collection' : 'Ajouter'}
          </Button>
        )}
        {onAddToWishlist && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddToWishlist(plant)}
            className={cn(isInWishlist && 'text-rose-500 border-rose-200 bg-rose-50')}
          >
            <Heart className={cn('h-3.5 w-3.5', isInWishlist && 'fill-rose-500 text-rose-500')} />
          </Button>
        )}
      </div>
    </Card>
  )
}
