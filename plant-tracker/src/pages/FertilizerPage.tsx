import { useState } from 'react'
import { FlaskConical, Plus, Trash2, Info } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Dialog } from '@/components/ui/Dialog'
import { FertilizerDialog } from '@/components/fertilizer/FertilizerDialog'
import { SUBSTRATE_TEMPLATES } from '@/data/substrates'
import type { UserPlant, CustomSubstrate, SubstrateComponent } from '@/types'
import { addCustomSubstrate, deleteCustomSubstrate } from '@/lib/firestore'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface FertilizerPageProps {
  userId: string
  plants: UserPlant[]
  customSubstrates: CustomSubstrate[]
  onSubstratesChange: () => void
  onFertilize: (plant: UserPlant, product: string, ml: number, vol: number) => Promise<void>
}

const COMPONENT_OPTIONS = [
  'Terreau universel', 'Tourbe blonde', 'Tourbe noire', 'Fibre de coco', 'Compost végétal',
  'Perlite', 'Vermiculite', 'Sable grossier', 'Sable de quartz', 'Graviers fins',
  'Écorce de pin (petite)', 'Écorce de pin (moyenne)', 'Écorce de pin (grande)',
  'Sphaigne de NZ', 'Charbon de bois', 'Billes d\'argile (LECA)', 'Billes de bois',
  'Biogold', 'Pumice / pouzzolane', 'Terre de jardin', 'Autre',
]

const DRAINAGE_LABELS = ['', 'Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent']
const RETENTION_LABELS = ['', 'Très faible', 'Faible', 'Moyenne', 'Bonne', 'Très bonne']

export function FertilizerPage({
  userId,
  plants,
  customSubstrates,
  onSubstratesChange,
  onFertilize,
}: FertilizerPageProps) {
  const [activeTab, setActiveTab] = useState<'calculator' | 'substrates'>('calculator')
  const [selectedPlantId, setSelectedPlantId] = useState('')
  const [fertOpen, setFertOpen] = useState(false)
  const [addSubstrateOpen, setAddSubstrateOpen] = useState(false)

  // Substrate form
  const [substrateName, setSubstrateName] = useState('')
  const [substrateDesc, setSubstrateDesc] = useState('')
  const [components, setComponents] = useState<SubstrateComponent[]>([
    { name: '', percentage: 50 },
    { name: '', percentage: 50 },
  ])
  const [drainage, setDrainage] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [retention, setRetention] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [phMin, setPhMin] = useState('6.0')
  const [phMax, setPhMax] = useState('7.0')
  const [fertMultiplier, setFertMultiplier] = useState('1.0')
  const [savingSubstrate, setSavingSubstrate] = useState(false)

  const selectedPlant = plants.find(p => p.id === selectedPlantId)

  const addComponent = () => setComponents(prev => [...prev, { name: '', percentage: 0 }])
  const removeComponent = (i: number) => setComponents(prev => prev.filter((_, idx) => idx !== i))
  const updateComponent = (i: number, field: keyof SubstrateComponent, value: string | number) =>
    setComponents(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c))

  const totalPercentage = components.reduce((sum, c) => sum + (Number(c.percentage) || 0), 0)

  const handleSaveSubstrate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!substrateName || totalPercentage !== 100) {
      toast.error('Vérifiez que le total fait 100%')
      return
    }
    setSavingSubstrate(true)
    try {
      await addCustomSubstrate({
        userId,
        name: substrateName,
        description: substrateDesc,
        components: components.filter(c => c.name && c.percentage > 0),
        drainageLevel: drainage,
        retentionLevel: retention,
        ph: { min: parseFloat(phMin), max: parseFloat(phMax) },
        fertilizerMultiplier: parseFloat(fertMultiplier) || 1.0,
        createdAt: new Date(),
      })
      onSubstratesChange()
      setAddSubstrateOpen(false)
      setSubstrateName('')
      setSubstrateDesc('')
      setComponents([{ name: '', percentage: 50 }, { name: '', percentage: 50 }])
      toast.success('Substrat personnalisé créé !')
    } finally {
      setSavingSubstrate(false)
    }
  }

  const handleDeleteSubstrate = async (id: string) => {
    await deleteCustomSubstrate(id)
    onSubstratesChange()
    toast.success('Substrat supprimé.')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fertilisation & Substrats</h1>
        <p className="text-gray-500 mt-1">Calculez les doses précises et gérez vos substrats</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { key: 'calculator', label: '🧪 Calculateur', icon: FlaskConical },
          { key: 'substrates', label: '🌱 Mes substrats' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={cn(
              'px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.key
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'calculator' && (
        <div className="space-y-5 max-w-2xl">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-800">Sélectionner une plante à fertiliser</h2>
              <p className="text-sm text-gray-500 mt-1">
                Sélectionnez une plante pour calculer la dose adaptée à son pot et son substrat.
              </p>
            </CardHeader>
            <CardContent>
              {plants.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Ajoutez des plantes à votre collection pour utiliser le calculateur.
                </p>
              ) : (
                <div className="space-y-3">
                  <Select
                    label="Plante"
                    options={plants
                      .filter(p => p.fertilizingEnabled)
                      .map(p => ({ value: p.id, label: `${p.nickname} — ${p.potVolumeLiters}L (${p.substrateName})` }))}
                    value={selectedPlantId}
                    onChange={e => setSelectedPlantId(e.target.value)}
                    placeholder="Choisir une plante..."
                  />

                  {selectedPlant && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Espèce</span>
                        <span className="font-medium">{selectedPlant.plant?.nameFr}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Volume du pot</span>
                        <span className="font-medium">{selectedPlant.potVolumeLiters} litres</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Substrat</span>
                        <span className="font-medium">{selectedPlant.substrateName}</span>
                      </div>
                      {selectedPlant.plant && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Engrais recommandé</span>
                          <span className="font-medium text-amber-700 text-right max-w-[200px]">
                            {selectedPlant.plant.care.fertilizer.type}
                          </span>
                        </div>
                      )}
                      <Button
                        className="w-full mt-2"
                        onClick={() => setFertOpen(true)}
                      >
                        <FlaskConical className="h-4 w-4" />
                        Ouvrir le calculateur de dose
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info card */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Comment fonctionne le calculateur ?
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">1.</span>
                  <p><strong>Dose de base</strong> : définie par les besoins nutritifs de l&apos;espèce (ml de concentré par litre d&apos;eau)</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">2.</span>
                  <p><strong>Multiplicateur saisonnier</strong> : réduit automatiquement en automne/hiver lors du repos végétatif</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">3.</span>
                  <p><strong>Multiplicateur substrat</strong> : ajuste la dose selon la rétention du substrat (LECA = ×1.5 car peu de rétention)</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 mt-2 text-xs text-blue-700">
                  Formule : <code className="font-mono">Dose = Base × Volume eau × Saison × Substrat</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'substrates' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">Mes substrats personnalisés</h2>
            <Button size="sm" onClick={() => setAddSubstrateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nouveau substrat
            </Button>
          </div>

          {/* Default substrates */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Substrats de référence</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUBSTRATE_TEMPLATES.filter(s => s.id !== 'custom').map(s => (
                <SubstrateCard key={s.id} substrate={s} />
              ))}
            </div>
          </div>

          {/* Custom substrates */}
          {customSubstrates.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Mes créations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customSubstrates.map(s => (
                  <SubstrateCard
                    key={s.id}
                    substrate={{ id: s.id, nameFr: s.name, description: s.description, components: s.components, drainageLevel: s.drainageLevel, retentionLevel: s.retentionLevel, fertilizerMultiplier: s.fertilizerMultiplier }}
                    onDelete={() => handleDeleteSubstrate(s.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add substrate dialog */}
      <Dialog
        open={addSubstrateOpen}
        onClose={() => setAddSubstrateOpen(false)}
        title="Créer un substrat personnalisé"
        size="lg"
        className="max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSaveSubstrate} className="space-y-4">
          <Input
            label="Nom du substrat *"
            value={substrateName}
            onChange={e => setSubstrateName(e.target.value)}
            placeholder="Ex: Mon mix Monstera maison"
            required
          />
          <Textarea
            label="Description"
            value={substrateDesc}
            onChange={e => setSubstrateDesc(e.target.value)}
            placeholder="Notes sur ce substrat..."
          />

          {/* Components */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Composition
                <span className={cn('ml-2 text-xs', totalPercentage === 100 ? 'text-green-600' : 'text-red-500')}>
                  ({totalPercentage}% / 100%)
                </span>
              </label>
              <button type="button" onClick={addComponent} className="text-xs text-green-600 hover:text-green-700 font-medium">
                + Ajouter un composant
              </button>
            </div>
            <div className="space-y-2">
              {components.map((comp, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <select
                      value={comp.name}
                      onChange={e => updateComponent(i, 'name', e.target.value)}
                      className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Choisir...</option>
                      {COMPONENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={comp.percentage}
                      onChange={e => updateComponent(i, 'percentage', parseInt(e.target.value) || 0)}
                      placeholder="%"
                    />
                  </div>
                  {components.length > 1 && (
                    <button type="button" onClick={() => removeComponent(i)} className="p-2 text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Properties */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Drainage"
              options={[1, 2, 3, 4, 5].map(v => ({ value: String(v), label: DRAINAGE_LABELS[v] }))}
              value={String(drainage)}
              onChange={e => setDrainage(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
            />
            <Select
              label="Rétention d'eau"
              options={[1, 2, 3, 4, 5].map(v => ({ value: String(v), label: RETENTION_LABELS[v] }))}
              value={String(retention)}
              onChange={e => setRetention(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
            />
            <Input
              label="pH min"
              type="number"
              step="0.1"
              value={phMin}
              onChange={e => setPhMin(e.target.value)}
            />
            <Input
              label="pH max"
              type="number"
              step="0.1"
              value={phMax}
              onChange={e => setPhMax(e.target.value)}
            />
          </div>

          <Input
            label="Multiplicateur de dose engrais"
            type="number"
            step="0.1"
            min="0"
            max="3"
            value={fertMultiplier}
            onChange={e => setFertMultiplier(e.target.value)}
            hint="1.0 = dose normale | 1.5 = LECA (faible rétention) | 0.5 = tourbe (forte rétention)"
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddSubstrateOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button
              type="submit"
              loading={savingSubstrate}
              disabled={totalPercentage !== 100}
              className="flex-1"
            >
              Sauvegarder
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Fertilizer dialog */}
      <FertilizerDialog
        open={fertOpen}
        onClose={() => setFertOpen(false)}
        userPlant={selectedPlant ?? null}
        onConfirm={(product, ml, vol) => {
          if (!selectedPlant) return Promise.resolve()
          return onFertilize(selectedPlant, product, ml, vol)
        }}
        customSubstrates={customSubstrates}
      />
    </div>
  )
}

function SubstrateCard({
  substrate,
  onDelete,
}: {
  substrate: { id: string; nameFr: string; description: string; components: SubstrateComponent[]; drainageLevel: number; retentionLevel: number; fertilizerMultiplier: number }
  onDelete?: () => void
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{substrate.nameFr}</h4>
        <div className="flex items-center gap-1">
          {substrate.fertilizerMultiplier !== 1.0 && (
            <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">
              ×{substrate.fertilizerMultiplier}
            </span>
          )}
          {onDelete && (
            <button onClick={onDelete} className="p-1 text-gray-300 hover:text-red-500 rounded">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{substrate.description}</p>

      {/* Properties */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 bg-blue-50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-500">Drainage</div>
          <div className="flex justify-center gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5].map(v => (
              <div key={v} className={cn('w-2 h-2 rounded-full', v <= substrate.drainageLevel ? 'bg-blue-500' : 'bg-blue-100')} />
            ))}
          </div>
        </div>
        <div className="flex-1 bg-green-50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-500">Rétention</div>
          <div className="flex justify-center gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5].map(v => (
              <div key={v} className={cn('w-2 h-2 rounded-full', v <= substrate.retentionLevel ? 'bg-green-500' : 'bg-green-100')} />
            ))}
          </div>
        </div>
      </div>

      {/* Components */}
      {substrate.components.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {substrate.components.map((c, i) => (
            <span key={i} className="text-[11px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100">
              {c.percentage}% {c.name}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}
