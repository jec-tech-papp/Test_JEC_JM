import { useState, useMemo } from 'react'
import { Calculator, CheckCircle } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { calculateFertilizerDose, getCurrentSeason, cn } from '@/lib/utils'
import { SUBSTRATE_TEMPLATES } from '@/data/substrates'
import type { UserPlant, CustomSubstrate } from '@/types'

interface FertilizerDialogProps {
  open: boolean
  onClose: () => void
  userPlant: UserPlant | null
  onConfirm: (product: string, concentrateMl: number, waterVolumeLiters: number) => Promise<void>
  customSubstrates?: CustomSubstrate[]
}

const SEASON_LABELS: Record<string, string> = {
  spring: '🌸 Printemps',
  summer: '☀️ Été',
  autumn: '🍂 Automne',
  winter: '❄️ Hiver',
}

export function FertilizerDialog({
  open,
  onClose,
  userPlant,
  onConfirm,
  customSubstrates = [],
}: FertilizerDialogProps) {
  const plant = userPlant?.plant
  const [product, setProduct] = useState('')
  const [customWaterVol, setCustomWaterVol] = useState('')
  const [loading, setLoading] = useState(false)

  const season = getCurrentSeason()

  const substrate = useMemo(() => {
    if (!userPlant) return null
    const template = SUBSTRATE_TEMPLATES.find(s => s.id === userPlant.substrateId)
    if (template) return template
    return customSubstrates.find(s => s.id === userPlant.substrateId) ?? null
  }, [userPlant, customSubstrates])

  const dose = useMemo(() => {
    if (!plant || !userPlant || !substrate) return null
    const waterVol = parseFloat(customWaterVol) || undefined
    return calculateFertilizerDose(plant, userPlant.potVolumeLiters, substrate, waterVol)
  }, [plant, userPlant, substrate, customWaterVol])

  if (!plant || !userPlant) return null

  const handleConfirm = async () => {
    if (!dose) return
    setLoading(true)
    try {
      await onConfirm(
        product || plant.care.fertilizer.type,
        dose.concentrateMl,
        dose.waterVolumeLiters,
      )
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const season_mult = plant.care.fertilizer.seasonalAdjustment[season]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Fertilisation — ${userPlant.nickname}`}
      size="md"
    >
      <div className="space-y-5">
        {/* Plant info */}
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
          {plant.imageUrl && (
            <img
              src={plant.imageUrl}
              alt={plant.nameFr}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/56/f0fdf4/16a34a?text=🌿' }}
            />
          )}
          <div>
            <p className="font-medium text-gray-900">{plant.nameFr}</p>
            <p className="text-sm text-gray-500">
              Pot : {userPlant.potVolumeLiters}L · {userPlant.substrateName}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Engrais recommandé : <span className="font-medium text-amber-700">{plant.care.fertilizer.type}</span>
            </p>
          </div>
        </div>

        {/* Season warning */}
        {season_mult === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-sm font-medium text-red-800">Fertilisation non recommandée</p>
              <p className="text-xs text-red-600 mt-0.5">
                En {SEASON_LABELS[season]}, cette plante est en repos végétatif. La fertilisation peut être néfaste.
              </p>
            </div>
          </div>
        )}

        {/* Dose calculator */}
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <Calculator className="h-4 w-4 text-amber-600" />
            Calculateur de dose
          </h3>

          <div className="mb-3">
            <label className="text-xs text-gray-500 block mb-1">
              Volume d&apos;eau d&apos;arrosage (litres)
            </label>
            <Input
              type="number"
              step="0.5"
              min="0.1"
              value={customWaterVol}
              onChange={e => setCustomWaterVol(e.target.value)}
              placeholder={`Par défaut : ${(userPlant.potVolumeLiters * 0.8).toFixed(1)}L (80% du pot)`}
            />
          </div>

          {dose && (
            <div className="space-y-3">
              {/* Main dose */}
              <div className="bg-white rounded-xl p-4 border border-amber-200 text-center">
                <p className="text-xs text-gray-500 mb-1">Concentré d&apos;engrais à ajouter</p>
                <p className={cn(
                  'text-4xl font-bold mb-1',
                  dose.concentrateMl === 0 ? 'text-red-500' : 'text-amber-600',
                )}>
                  {dose.concentrateMl === 0 ? '—' : `${dose.concentrateMl} ml`}
                </p>
                <p className="text-sm text-gray-500">
                  dans {dose.waterVolumeLiters}L d&apos;eau
                </p>
                {dose.concentrateMl > 0 && (
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    = {dose.finalDilution}
                  </p>
                )}
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white rounded-lg p-2 border border-amber-100">
                  <div className="text-gray-400">Base</div>
                  <div className="font-semibold text-gray-700">{plant.care.fertilizer.doseMlPer1L} ml/L</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-amber-100">
                  <div className="text-gray-400">{SEASON_LABELS[season]}</div>
                  <div className={cn(
                    'font-semibold',
                    dose.seasonMultiplier === 0 ? 'text-red-500' : dose.seasonMultiplier < 1 ? 'text-orange-500' : 'text-green-600',
                  )}>
                    ×{dose.seasonMultiplier}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-amber-100">
                  <div className="text-gray-400">Substrat</div>
                  <div className={cn(
                    'font-semibold',
                    dose.substrateMultiplier === 1.0 ? 'text-gray-700' : 'text-blue-600',
                  )}>
                    ×{dose.substrateMultiplier}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {dose.notes.length > 0 && (
                <div className="space-y-1">
                  {dose.notes.map((note, i) => (
                    <p key={i} className="text-xs text-amber-800 bg-amber-100 rounded-lg px-3 py-1.5">
                      {note}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Product */}
        <Input
          label="Produit utilisé (optionnel)"
          value={product}
          onChange={e => setProduct(e.target.value)}
          placeholder={plant.care.fertilizer.type}
          hint="Sera enregistré dans votre historique"
        />

        {/* NPK Info */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <p className="text-xs font-medium text-gray-600 mb-1">Ratio NPK recommandé</p>
          <div className="flex gap-2">
            {plant.care.fertilizer.npkRatio.split('-').map((val, i) => {
              const labels = ['N (Azote)', 'P (Phosphore)', 'K (Potasse)']
              const colors = ['bg-green-100 text-green-700', 'bg-orange-100 text-orange-700', 'bg-purple-100 text-purple-700']
              return (
                <div key={i} className={cn('flex-1 rounded-lg p-2 text-center text-xs', colors[i])}>
                  <div className="font-bold text-lg leading-none">{val}</div>
                  <div className="mt-0.5 opacity-80">{labels[i]}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            loading={loading}
            disabled={!dose || dose.concentrateMl === 0}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4" />
            Enregistrer la fertilisation
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
