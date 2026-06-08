import { useMemo } from 'react'
import { addDays, isBefore } from 'date-fns'
import {
  Sprout,
  Heart,
  Droplets,
  FlaskConical,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Leaf,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate, formatRelative, cn } from '@/lib/utils'
import type { UserPlant, WishlistItem, UserProfile } from '@/types'

interface DashboardPageProps {
  profile: UserProfile | null
  plants: UserPlant[]
  wishlistItems: WishlistItem[]
  onWater: (plant: UserPlant) => void
  onFertilize: (plant: UserPlant) => void
  loading: boolean
}

export function DashboardPage({
  profile,
  plants,
  wishlistItems,
  onWater,
  onFertilize,
  loading,
}: DashboardPageProps) {
  const now = new Date()
  const in3days = addDays(now, 3)
  const in7days = addDays(now, 7)

  const { overdueWater, dueSoonWater, overdueFert, dueSoonFert } = useMemo(() => {
    const overdueWater: UserPlant[] = []
    const dueSoonWater: UserPlant[] = []
    const overdueFert: UserPlant[] = []
    const dueSoonFert: UserPlant[] = []

    for (const p of plants) {
      if (p.nextWaterDue) {
        if (isBefore(p.nextWaterDue, now)) overdueWater.push(p)
        else if (isBefore(p.nextWaterDue, in3days)) dueSoonWater.push(p)
      }
      if (p.fertilizingEnabled && p.nextFertilizerDue) {
        if (isBefore(p.nextFertilizerDue, now)) overdueFert.push(p)
        else if (isBefore(p.nextFertilizerDue, in7days)) dueSoonFert.push(p)
      }
    }

    return { overdueWater, dueSoonWater, overdueFert, dueSoonFert }
  }, [plants, now])

  const totalAlerts = overdueWater.length + overdueFert.length
  const greeting = getGreeting()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {profile?.displayName?.split(' ')[0] ?? 'Plant Addict'} 👋
        </h1>
        <p className="text-gray-500 mt-1">{formatDate(now)}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Sprout className="h-5 w-5 text-green-600" />}
          label="Plantes"
          value={plants.length}
          bg="bg-green-50"
          href="/portfolio"
        />
        <StatCard
          icon={<Heart className="h-5 w-5 text-rose-500" />}
          label="Wishlist"
          value={wishlistItems.length}
          bg="bg-rose-50"
          href="/wishlist"
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          label="En retard"
          value={totalAlerts}
          bg={totalAlerts > 0 ? 'bg-red-50' : 'bg-gray-50'}
          alert={totalAlerts > 0}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
          label="À faire cette semaine"
          value={dueSoonWater.length + dueSoonFert.length}
          bg="bg-blue-50"
        />
      </div>

      {/* Alerts */}
      {totalAlerts > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <h2 className="font-semibold text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Soins en retard ({totalAlerts})
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueWater.map(p => (
                <AlertRow
                  key={`w-${p.id}`}
                  plant={p}
                  action="arrosage"
                  icon={<Droplets className="h-4 w-4 text-blue-500" />}
                  onAction={() => onWater(p)}
                  actionLabel="Arroser"
                  dueDate={p.nextWaterDue}
                />
              ))}
              {overdueFert.map(p => (
                <AlertRow
                  key={`f-${p.id}`}
                  plant={p}
                  action="fertilisation"
                  icon={<FlaskConical className="h-4 w-4 text-amber-500" />}
                  onAction={() => onFertilize(p)}
                  actionLabel="Fertiliser"
                  dueDate={p.nextFertilizerDue}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Due soon */}
      {(dueSoonWater.length > 0 || dueSoonFert.length > 0) && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              À faire bientôt
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dueSoonWater.map(p => (
                <AlertRow
                  key={`ws-${p.id}`}
                  plant={p}
                  action="arrosage"
                  icon={<Droplets className="h-4 w-4 text-blue-400" />}
                  onAction={() => onWater(p)}
                  actionLabel="Arroser"
                  dueDate={p.nextWaterDue}
                  muted
                />
              ))}
              {dueSoonFert.map(p => (
                <AlertRow
                  key={`fs-${p.id}`}
                  plant={p}
                  action="fertilisation"
                  icon={<FlaskConical className="h-4 w-4 text-amber-400" />}
                  onAction={() => onFertilize(p)}
                  actionLabel="Fertiliser"
                  dueDate={p.nextFertilizerDue}
                  muted
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All good */}
      {!loading && plants.length > 0 && totalAlerts === 0 && dueSoonWater.length === 0 && dueSoonFert.length === 0 && (
        <Card className="bg-green-50 border-green-100">
          <CardContent className="py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <h2 className="font-semibold text-green-800 text-lg">Tout est à jour !</h2>
            <p className="text-green-600 text-sm mt-1">Toutes vos plantes ont été soignées récemment. Bravo !</p>
          </CardContent>
        </Card>
      )}

      {/* Recent plants snapshot */}
      {plants.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Ma collection</h2>
            <Link to="/portfolio" className="text-sm text-green-600 hover:text-green-700 font-medium">
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {plants.slice(0, 8).map(p => (
              <Link to="/portfolio" key={p.id}>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-green-200 transition-all">
                  <div className="h-24 bg-green-50 overflow-hidden">
                    {p.plant?.imageUrl ? (
                      <img
                        src={p.plant.imageUrl}
                        alt={p.nickname}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x96/f0fdf4/16a34a?text=🌿'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🌿</div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-800 truncate">{p.nickname}</p>
                    <p className="text-[11px] text-gray-400 truncate italic">{p.plant?.scientificName}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && plants.length === 0 && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="py-12 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="h-10 w-10 text-green-200" />
            </div>
            <h2 className="font-semibold text-gray-700 text-lg mb-2">Bienvenue sur PlantAddict !</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              Commencez par explorer notre bibliothèque de plantes et ajoutez vos premières plantes à votre collection.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/library">
                <Button variant="primary">Explorer la bibliothèque</Button>
              </Link>
              <Link to="/portfolio">
                <Button variant="outline">Ajouter une plante</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  bg,
  href,
  alert,
}: {
  icon: React.ReactNode
  label: string
  value: number
  bg: string
  href?: string
  alert?: boolean
}) {
  const content = (
    <div className={cn('rounded-2xl p-4 border', bg, alert ? 'border-red-200' : 'border-transparent')}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p className={cn('text-3xl font-bold', alert && value > 0 ? 'text-red-600' : 'text-gray-900')}>
        {value}
      </p>
    </div>
  )

  if (href) {
    return <Link to={href}>{content}</Link>
  }
  return content
}

function AlertRow({
  plant,
  action,
  icon,
  onAction,
  actionLabel,
  dueDate,
  muted,
}: {
  plant: UserPlant
  action: string
  icon: React.ReactNode
  onAction: () => void
  actionLabel: string
  dueDate?: Date
  muted?: boolean
}) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl',
      muted ? 'bg-gray-50' : 'bg-white',
    )}>
      {plant.plant?.imageUrl ? (
        <img
          src={plant.plant.imageUrl}
          alt={plant.nickname}
          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40/f0fdf4/16a34a?text=🌿' }}
        />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 text-xl">🌿</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{plant.nickname}</p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          {icon}
          {action}
          {dueDate && ` · ${formatRelative(dueDate)}`}
        </p>
      </div>
      <Button size="sm" variant={muted ? 'outline' : 'secondary'} onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bonjour'
  if (hour < 18) return 'Bon après-midi'
  return 'Bonsoir'
}
