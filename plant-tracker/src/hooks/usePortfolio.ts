import { useState, useEffect, useCallback } from 'react'
import { addDays } from 'date-fns'
import toast from 'react-hot-toast'
import {
  getUserPlants,
  addUserPlant,
  updateUserPlant,
  deleteUserPlant,
  addCareLog,
  getCareLogs,
} from '@/lib/firestore'
import { getPlantById } from '@/data/plants'
import type { UserPlant, CareLog } from '@/types'

const WATERING_DAYS: Record<string, number> = {
  daily: 1,
  'twice-week': 3,
  weekly: 7,
  'bi-weekly': 14,
  monthly: 30,
}

export function usePortfolio(userId: string | undefined) {
  const [plants, setPlants] = useState<UserPlant[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const raw = await getUserPlants(userId)
    // Populate plant details
    const populated = raw.map(p => ({
      ...p,
      plant: getPlantById(p.plantId),
    }))
    setPlants(populated)
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  const addPlant = async (plant: Omit<UserPlant, 'id'>) => {
    const id = await addUserPlant(plant)
    await load()
    toast.success('Plante ajoutée à votre collection !')
    return id
  }

  const updatePlant = async (id: string, updates: Partial<UserPlant>) => {
    await updateUserPlant(id, updates)
    setPlants(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const removePlant = async (id: string) => {
    await deleteUserPlant(id)
    setPlants(prev => prev.filter(p => p.id !== id))
    toast.success('Plante supprimée de votre collection.')
  }

  const logWatering = async (userPlant: UserPlant) => {
    if (!userId) return
    const plantData = userPlant.plant ?? getPlantById(userPlant.plantId)
    const wateringDays = plantData ? WATERING_DAYS[plantData.care.wateringFrequency] ?? 7 : 7
    const now = new Date()
    const nextDue = addDays(now, wateringDays)

    await addCareLog({
      userId,
      userPlantId: userPlant.id,
      action: 'watering',
      date: now,
      notes: '',
    })

    await updateUserPlant(userPlant.id, {
      lastWatered: now,
      nextWaterDue: nextDue,
    })

    setPlants(prev => prev.map(p =>
      p.id === userPlant.id ? { ...p, lastWatered: now, nextWaterDue: nextDue } : p,
    ))

    toast.success(`${userPlant.nickname} arrosée ! Prochain arrosage le ${nextDue.toLocaleDateString('fr-FR')}`)
  }

  const logFertilizing = async (
    userPlant: UserPlant,
    product: string,
    concentrateMl: number,
    waterVolumeLiters: number,
  ) => {
    if (!userId) return
    const now = new Date()
    const nextDue = addDays(now, 14)

    await addCareLog({
      userId,
      userPlantId: userPlant.id,
      action: 'fertilizing',
      date: now,
      notes: `${product} — ${concentrateMl}ml dans ${waterVolumeLiters}L`,
      fertilizerProduct: product,
      calculatedDoseMl: concentrateMl,
      actualDoseMl: concentrateMl,
      waterVolumeLiters,
      dilutionRatio: `${(concentrateMl / waterVolumeLiters).toFixed(2)} ml/L`,
    })

    await updateUserPlant(userPlant.id, {
      lastFertilized: now,
      nextFertilizerDue: nextDue,
    })

    setPlants(prev => prev.map(p =>
      p.id === userPlant.id ? { ...p, lastFertilized: now, nextFertilizerDue: nextDue } : p,
    ))

    toast.success(`Fertilisation enregistrée pour ${userPlant.nickname} !`)
  }

  const getCareLogs_forPlant = async (userPlantId: string): Promise<CareLog[]> => {
    if (!userId) return []
    return getCareLogs(userId, userPlantId)
  }

  return {
    plants,
    loading,
    reload: load,
    addPlant,
    updatePlant,
    removePlant,
    logWatering,
    logFertilizing,
    getCareLogs_forPlant,
  }
}
