import { useState } from 'react'
import { User, Bell, Info } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { setUserProfile } from '@/lib/firestore'
import toast from 'react-hot-toast'
import type { UserProfile } from '@/types'

interface SettingsPageProps {
  profile: UserProfile | null
  onProfileUpdate: (profile: UserProfile) => void
}

export function SettingsPage({ profile, onProfileUpdate }: SettingsPageProps) {
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    profile?.preferences.notificationsEnabled ?? true,
  )
  const [reminderDaysBefore, setReminderDaysBefore] = useState(
    profile?.preferences.reminderDaysBefore ?? 1,
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const updated: UserProfile = {
        ...profile,
        displayName,
        preferences: {
          ...profile.preferences,
          notificationsEnabled,
          reminderDaysBefore,
        },
      }
      await setUserProfile(updated)
      onProfileUpdate(updated)
      toast.success('Profil mis à jour !')
    } finally {
      setSaving(false)
    }
  }

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Votre navigateur ne supporte pas les notifications.')
      return
    }
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      toast.success('Notifications activées !')
      setNotificationsEnabled(true)
      new Notification('PlantAddict', {
        body: '🌿 Vous recevrez des rappels pour soigner vos plantes.',
        icon: '/favicon.ico',
      })
    } else {
      toast.error('Permission de notification refusée.')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 mt-1">Gérez votre profil et vos préférences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <User className="h-4 w-4" />
            Mon profil
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl">
                  {profile?.displayName?.[0]?.toUpperCase() ?? 'P'}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{profile?.email}</p>
                <p className="text-sm text-gray-400">Membre depuis {profile?.createdAt ? profile.createdAt.toLocaleDateString('fr-FR') : '—'}</p>
              </div>
            </div>
            <Input
              label="Prénom / pseudo"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Rappels de soins</p>
                <p className="text-xs text-gray-400">Recevoir des notifications pour les arrosages et fertilisations</p>
              </div>
              <div
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notificationsEnabled ? 'translate-x-5' : ''}`} />
              </div>
            </div>

            {notificationsEnabled && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Rappeler {reminderDaysBefore} jour(s) avant
                </label>
                <input
                  type="range"
                  min={0}
                  max={7}
                  value={reminderDaysBefore}
                  onChange={e => setReminderDaysBefore(Number(e.target.value))}
                  className="w-full accent-green-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Le jour J</span>
                  <span>7 jours avant</span>
                </div>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={requestNotificationPermission}>
              <Bell className="h-3.5 w-3.5" />
              Tester les notifications navigateur
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Info className="h-4 w-4" />
            À propos
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>🌿 <strong>PlantAddict</strong> — Application de suivi de plantes d&apos;intérieur</p>
            <p>Version 1.0.0</p>
            <p className="text-xs text-gray-400">
              Fiches de soins basées sur des sources horticoles. Les doses d&apos;engrais sont indicatives — adaptez toujours selon les recommandations du fabricant.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} loading={saving} className="w-full sm:w-auto">
        Sauvegarder les modifications
      </Button>
    </div>
  )
}
