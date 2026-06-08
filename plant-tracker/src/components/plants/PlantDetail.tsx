import {
  Sun,
  Droplets,
  Thermometer,
  Wind,
  FlaskConical,
  RepeatIcon,
  AlertTriangle,
  Star,
  Leaf,
  Heart,
  Plus,
} from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  LIGHT_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  CATEGORY_LABELS,
  cn,
} from '@/lib/utils'
import type { PlantLibraryEntry } from '@/types'

interface PlantDetailProps {
  plant: PlantLibraryEntry | null
  open: boolean
  onClose: () => void
  onAddToPortfolio?: () => void
  onAddToWishlist?: () => void
  isInWishlist?: boolean
  isInPortfolio?: boolean
}

export function PlantDetail({
  plant,
  open,
  onClose,
  onAddToPortfolio,
  onAddToWishlist,
  isInWishlist,
  isInPortfolio,
}: PlantDetailProps) {
  if (!plant) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={plant.nameFr}
      description={`${plant.scientificName} · ${plant.family}`}
      size="xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Hero image + meta */}
        <div className="flex gap-4">
          <img
            src={plant.imageUrl}
            alt={plant.nameFr}
            className="w-40 h-40 object-cover rounded-xl flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://via.placeholder.com/160x160/f0fdf4/16a34a?text=${encodeURIComponent(plant.nameFr)}`
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge>{CATEGORY_LABELS[plant.category]}</Badge>
              <Badge variant="secondary" className={cn(DIFFICULTY_COLORS[plant.care.difficulty], 'bg-transparent border-current')}>
                <Star className="h-3 w-3" />
                {DIFFICULTY_LABELS[plant.care.difficulty]}
              </Badge>
              {plant.care.toxicity.pets && (
                <Badge variant="warning">
                  <AlertTriangle className="h-3 w-3" />
                  Toxique animaux
                </Badge>
              )}
              {plant.care.toxicity.humans && (
                <Badge variant="warning">
                  <AlertTriangle className="h-3 w-3" />
                  Toxique humains
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{plant.description}</p>
            <p className="text-xs text-gray-400 mt-2">Origine : {plant.origin}</p>
          </div>
        </div>

        {/* Care grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <CareItem
            icon={<Sun className="h-4 w-4 text-amber-500" />}
            label="Lumière"
            value={LIGHT_LABELS[plant.care.light]}
            detail={plant.care.lightDetails}
          />
          <CareItem
            icon={<Droplets className="h-4 w-4 text-blue-500" />}
            label="Arrosage"
            value={plant.care.wateringDetails.split('.')[0]}
            detail={plant.care.wateringDetails}
          />
          <CareItem
            icon={<Wind className="h-4 w-4 text-cyan-500" />}
            label="Humidité"
            value={`${plant.care.humidity.ideal}%`}
            detail={`Min ${plant.care.humidity.min}% — Max ${plant.care.humidity.max}%`}
          />
          <CareItem
            icon={<Thermometer className="h-4 w-4 text-orange-500" />}
            label="Température"
            value={`${plant.care.temperature.ideal}°C idéal`}
            detail={`Min ${plant.care.temperature.min}°C — Max ${plant.care.temperature.max}°C`}
          />
          <CareItem
            icon={<RepeatIcon className="h-4 w-4 text-green-500" />}
            label="Rempotage"
            value={plant.care.repotting.frequency}
            detail={`Saison : ${plant.care.repotting.bestSeason}`}
          />
          <CareItem
            icon={<Leaf className="h-4 w-4 text-emerald-500" />}
            label="Croissance"
            value={plant.care.growthRate === 'slow' ? 'Lente' : plant.care.growthRate === 'fast' ? 'Rapide' : 'Moyenne'}
            detail={`pH idéal : ${plant.care.soil.ph.min}–${plant.care.soil.ph.max}`}
          />
        </div>

        {/* Fertilizer section */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <FlaskConical className="h-4 w-4 text-amber-600" />
            Fertilisation
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 text-xs">Fréquence</span>
              <p className="text-gray-800">{plant.care.fertilizer.frequency}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Type d&apos;engrais</span>
              <p className="text-gray-800">{plant.care.fertilizer.type}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Ratio NPK</span>
              <p className="text-gray-800 font-mono">{plant.care.fertilizer.npkRatio}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Dose de base</span>
              <p className="text-gray-800">{plant.care.fertilizer.doseMlPer1L} ml/L</p>
            </div>
          </div>
          {plant.care.fertilizer.notes && (
            <p className="mt-3 text-sm text-amber-800 bg-amber-100 rounded-lg px-3 py-2">
              💡 {plant.care.fertilizer.notes}
            </p>
          )}
          <div className="mt-3 grid grid-cols-4 gap-2">
            {Object.entries(plant.care.fertilizer.seasonalAdjustment).map(([season, mult]) => {
              const labels: Record<string, string> = { spring: '🌸 Prin.', summer: '☀️ Été', autumn: '🍂 Aut.', winter: '❄️ Hiv.' }
              return (
                <div key={season} className="text-center bg-white rounded-lg p-2 border border-amber-100">
                  <div className="text-xs text-gray-500">{labels[season]}</div>
                  <div className={cn(
                    'text-sm font-semibold mt-0.5',
                    mult === 0 ? 'text-red-500' : mult < 0.5 ? 'text-orange-500' : 'text-green-600',
                  )}>
                    {mult === 0 ? 'Arrêt' : `×${mult}`}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tips */}
        {plant.care.tips.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Conseils pratiques</h3>
            <ul className="space-y-1.5">
              {plant.care.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {plant.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs border border-gray-100">
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          {onAddToPortfolio && (
            <Button
              onClick={onAddToPortfolio}
              variant={isInPortfolio ? 'secondary' : 'primary'}
              disabled={isInPortfolio}
              className="flex-1"
            >
              <Plus className="h-4 w-4" />
              {isInPortfolio ? 'Dans votre collection' : 'Ajouter à ma collection'}
            </Button>
          )}
          {onAddToWishlist && (
            <Button
              onClick={onAddToWishlist}
              variant="outline"
              className={cn(isInWishlist && 'text-rose-500 border-rose-300 bg-rose-50')}
            >
              <Heart className={cn('h-4 w-4', isInWishlist && 'fill-rose-500 text-rose-500')} />
              {isInWishlist ? 'Dans wishlist' : 'Wishlist'}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  )
}

function CareItem({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail?: string
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-800 leading-tight">{value}</p>
      {detail && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{detail}</p>}
    </div>
  )
}
