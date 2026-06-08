import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getWishlist, addWishlistItem, updateWishlistItem, deleteWishlistItem } from '@/lib/firestore'
import { getPlantById } from '@/data/plants'
import type { WishlistItem, WishlistPriority } from '@/types'

export function useWishlist(userId: string | undefined) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const raw = await getWishlist(userId)
    const populated = raw.map(item => ({
      ...item,
      plant: getPlantById(item.plantId),
    }))
    setItems(populated)
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  const addToWishlist = async (
    plantId: string,
    priority: WishlistPriority = 'medium',
    notes = '',
  ) => {
    if (!userId) return
    const already = items.find(i => i.plantId === plantId)
    if (already) {
      toast.error('Cette plante est déjà dans votre wishlist !')
      return
    }
    await addWishlistItem({ userId, plantId, priority, notes, addedAt: new Date() })
    await load()
    toast.success('Ajoutée à votre wishlist 🌱')
  }

  const updateItem = async (id: string, updates: Partial<WishlistItem>) => {
    await updateWishlistItem(id, updates)
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }

  const removeFromWishlist = async (id: string) => {
    await deleteWishlistItem(id)
    setItems(prev => prev.filter(i => i.id !== id))
    toast.success('Retirée de votre wishlist.')
  }

  const isInWishlist = (plantId: string) => items.some(i => i.plantId === plantId)

  return { items, loading, reload: load, addToWishlist, updateItem, removeFromWishlist, isInWishlist }
}
