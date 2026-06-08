import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from '@/components/layout/Layout'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LibraryPage } from '@/pages/LibraryPage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { WishlistPage } from '@/pages/WishlistPage'
import { FertilizerPage } from '@/pages/FertilizerPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AddPlantForm } from '@/components/portfolio/AddPlantForm'
import { FertilizerDialog } from '@/components/fertilizer/FertilizerDialog'
import { useAuth } from '@/hooks/useAuth'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useWishlist } from '@/hooks/useWishlist'
import { getCustomSubstrates } from '@/lib/firestore'
import type { UserPlant, PlantLibraryEntry, WishlistItem, UserProfile, CustomSubstrate } from '@/types'

function useCustomSubstrates(userId: string | undefined) {
  const [substrates, setSubstrates] = useState<CustomSubstrate[]>([])
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    if (!userId) return
    const data = await getCustomSubstrates(userId)
    setSubstrates(data)
    setLoaded(true)
  }, [userId])

  if (!loaded && userId) {
    load()
  }

  return { substrates, reload: load }
}

function AppInner() {
  const { user, profile, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout } = useAuth()
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null)
  const currentProfile = localProfile ?? profile

  const { plants, loading: plantsLoading, addPlant, removePlant, logWatering, logFertilizing } = usePortfolio(user?.uid)
  const { items: wishlistItems, addToWishlist, updateItem: updateWishlistItem, removeFromWishlist, isInWishlist } = useWishlist(user?.uid)
  const { substrates, reload: reloadSubstrates } = useCustomSubstrates(user?.uid)

  // Cross-page state for dialogs triggered from library/dashboard
  const [addPlantOpen, setAddPlantOpen] = useState(false)
  const [preselectedPlant, setPreselectedPlant] = useState<PlantLibraryEntry | undefined>()
  const [fertDialogOpen, setFertDialogOpen] = useState(false)
  const [fertDialogPlant, setFertDialogPlant] = useState<UserPlant | null>(null)

  const isInPortfolio = (plantId: string) => plants.some(p => p.plantId === plantId)

  const handleAddToPortfolio = (plant: PlantLibraryEntry) => {
    setPreselectedPlant(plant)
    setAddPlantOpen(true)
  }

  const handleWater = (plant: UserPlant) => logWatering(plant)

  const handleFertilizeOpen = (plant: UserPlant) => {
    setFertDialogPlant(plant)
    setFertDialogOpen(true)
  }

  const handleFertilize = async (plant: UserPlant, product: string, ml: number, vol: number) => {
    await logFertilizing(plant, product, ml, vol)
  }

  const handleWishlistToPortfolio = (item: WishlistItem) => {
    if (item.plant) {
      setPreselectedPlant(item.plant)
      setAddPlantOpen(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl">🌿</span>
          </div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <AuthPage
        onLoginWithGoogle={loginWithGoogle}
        onLoginWithEmail={loginWithEmail}
        onRegister={registerWithEmail}
      />
    )
  }

  return (
    <Layout profile={currentProfile} onLogout={logout}>
      <Routes>
        <Route
          path="/"
          element={
            <DashboardPage
              profile={currentProfile}
              plants={plants}
              wishlistItems={wishlistItems}
              onWater={handleWater}
              onFertilize={handleFertilizeOpen}
              loading={plantsLoading}
            />
          }
        />
        <Route
          path="/library"
          element={
            <LibraryPage
              onAddToPortfolio={handleAddToPortfolio}
              onAddToWishlist={(plant) => addToWishlist(plant.id)}
              isInWishlist={isInWishlist}
              isInPortfolio={isInPortfolio}
            />
          }
        />
        <Route
          path="/portfolio"
          element={
            <PortfolioPage
              userId={user.uid}
          plants={plants}
          loading={plantsLoading}
          customSubstrates={substrates}
          onAddPlant={async (plant) => { await addPlant(plant) }}
          onWater={handleWater}
          onFertilize={handleFertilize}
          onDelete={(plant) => removePlant(plant.id)}
            />
          }
        />
        <Route
          path="/wishlist"
          element={
            <WishlistPage
              items={wishlistItems}
              loading={false}
              onRemove={removeFromWishlist}
              onUpdatePriority={(id, priority) => updateWishlistItem(id, { priority })}
              onMoveToPortfolio={handleWishlistToPortfolio}
            />
          }
        />
        <Route
          path="/fertilizer"
          element={
            <FertilizerPage
              userId={user.uid}
              plants={plants}
              customSubstrates={substrates}
              onSubstratesChange={reloadSubstrates}
              onFertilize={handleFertilize}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <SettingsPage
              profile={currentProfile}
              onProfileUpdate={setLocalProfile}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global add plant dialog */}
      {user && (
        <AddPlantForm
          open={addPlantOpen}
          onClose={() => { setAddPlantOpen(false); setPreselectedPlant(undefined) }}
          onSubmit={async (plant) => { await addPlant(plant) }}
          userId={user.uid}
          preselectedPlant={preselectedPlant}
          customSubstrates={substrates}
        />
      )}

      {/* Global fertilizer dialog */}
      <FertilizerDialog
        open={fertDialogOpen}
        onClose={() => setFertDialogOpen(false)}
        userPlant={fertDialogPlant}
        onConfirm={async (product, ml, vol) => {
          if (fertDialogPlant) await handleFertilize(fertDialogPlant, product, ml, vol)
        }}
        customSubstrates={substrates}
      />
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
        }}
      />
    </BrowserRouter>
  )
}
