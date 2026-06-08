import {
  Droplets,
  FlaskConical,
  MapPin,
  Trash2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatRelative, isOverdue, isDueSoon, cn } from '@/lib/utils'
import type { UserPlant } from '@/types'

interface UserPlantCardProps {
  userPlant: UserPlant
  onWater: (plant: UserPlant) => void
  onFertilize: (plant: UserPlant) => void
  onDelete: (plant: UserPlant) => void
  onDetail?: (plant: UserPlant) => void
}

export function UserPlantCard({
  userPlant,
  onWater,
  onFertilize,
  onDelete,
  onDetail,
}: UserPlantCardProps) {
  const plant = userPlant.plant

  const waterOverdue = userPlant.nextWaterDue && isOverdue(userPlant.nextWaterDue)
  const waterSoon = userPlant.nextWaterDue && !waterOverdue && isDueSoon(userPlant.nextWaterDue)
  const fertOverdue = userPlant.fertilizingEnabled && userPlant.nextFertilizerDue && isOverdue(userPlant.nextFertilizerDue)
  const fertSoon = userPlant.fertilizingEnabled && userPlant.nextFertilizerDue && !fertOverdue && isDueSoon(userPlant.nextFertilizerDue, 3)

  return (
    <Card className="overflow-hidden">
      {/* Alert banner */}
      {(waterOverdue || fertOverdue) && (
        <div className="bg-red-50 border-b border-red-100 px-4 py-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="text-xs text-red-700 font-medium">
            {waterOverdue && 'Arrosage en retard'}
            {waterOverdue && fertOverdue && ' · '}
            {fertOverdue && 'Engrais en retard'}
          </span>
        </div>
      )}

      <div className="flex gap-4 p-4">
        {/* Plant image */}
        <div
          className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-green-50 cursor-pointer"
          onClick={() => onDetail?.(userPlant)}
        >
          {plant?.imageUrl ? (
            <img
              src={plant.imageUrl}
              alt={userPlant.nickname}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96/f0fdf4/16a34a?text=🌿'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">🌿</div>
          )}
          {waterSoon && (
            <div className="absolute bottom-0 left-0 right-0 bg-blue-500/80 text-white text-[10px] text-center py-0.5">
              💧 Bientôt
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3
                className="font-semibold text-gray-900 cursor-pointer hover:text-green-700 leading-tight"
                onClick={() => onDetail?.(userPlant)}
              >
                {userPlant.nickname}
              </h3>
              {plant && (
                <p className="text-xs text-gray-400 italic mt-0.5">{plant.scientificName}</p>
              )}
            </div>
            <button
              onClick={() => onDelete(userPlant)}
              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              🪴 {userPlant.potVolumeLiters}L
            </span>
            <span className="flex items-center gap-1 truncate max-w-[120px]">
              🌱 {userPlant.substrateName}
            </span>
            {userPlant.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {userPlant.location}
              </span>
            )}
          </div>

          {/* Care status */}
          <div className="flex flex-wrap gap-2 mt-2">
            {/* Water status */}
            <div className={cn(
              'flex items-center gap-1 text-xs px-2 py-1 rounded-lg',
              waterOverdue ? 'bg-red-50 text-red-700' : waterSoon ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500',
            )}>
              <Droplets className="h-3 w-3" />
              {userPlant.lastWatered ? (
                <span>
                  {waterOverdue ? '⚠️ ' : waterSoon ? '🔔 ' : <CheckCircle className="h-3 w-3 inline text-green-500 mr-0.5" />}
                  {formatRelative(userPlant.lastWatered)}
                </span>
              ) : (
                <span className="text-gray-400">Jamais arrosée</span>
              )}
            </div>

            {/* Fertilizer status */}
            {userPlant.fertilizingEnabled && (
              <div className={cn(
                'flex items-center gap-1 text-xs px-2 py-1 rounded-lg',
                fertOverdue ? 'bg-red-50 text-red-700' : fertSoon ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-500',
              )}>
                <FlaskConical className="h-3 w-3" />
                {userPlant.lastFertilized ? (
                  <span>
                    {fertOverdue ? '⚠️ ' : fertSoon ? '🔔 ' : ''}
                    {formatRelative(userPlant.lastFertilized)}
                  </span>
                ) : (
                  <span className="text-gray-400">Jamais fertilisée</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onWater(userPlant)}
          className="flex-1"
        >
          <Droplets className="h-3.5 w-3.5 text-blue-500" />
          Arroser
        </Button>
        {userPlant.fertilizingEnabled && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onFertilize(userPlant)}
            className="flex-1 text-amber-700 border-amber-200 hover:bg-amber-50"
          >
            <FlaskConical className="h-3.5 w-3.5 text-amber-500" />
            Engrais
          </Button>
        )}
      </div>
    </Card>
  )
}
