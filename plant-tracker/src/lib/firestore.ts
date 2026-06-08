import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  UserProfile,
  UserPlant,
  WishlistItem,
  CareLog,
  CustomSubstrate,
  CareReminder,
} from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDate = (v: Timestamp | Date | undefined) =>
  v instanceof Timestamp ? v.toDate() : (v ?? new Date())

// ─── User Profile ─────────────────────────────────────────────────────────────

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const d = snap.data()
  return { ...d, uid, createdAt: toDate(d.createdAt) } as UserProfile
}

export const setUserProfile = async (profile: Omit<UserProfile, 'createdAt'> & { createdAt?: Date }) => {
  const { uid, ...data } = profile
  await setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt: profile.createdAt ? Timestamp.fromDate(profile.createdAt) : Timestamp.now(),
  }, { merge: true })
}

// ─── User Plants (Portfolio) ──────────────────────────────────────────────────

export const getUserPlants = async (userId: string): Promise<UserPlant[]> => {
  const q = query(
    collection(db, 'userPlants'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => {
    const data = d.data()
    return {
      ...data,
      id: d.id,
      acquisitionDate: toDate(data.acquisitionDate),
      lastWatered: data.lastWatered ? toDate(data.lastWatered) : undefined,
      nextWaterDue: data.nextWaterDue ? toDate(data.nextWaterDue) : undefined,
      lastFertilized: data.lastFertilized ? toDate(data.lastFertilized) : undefined,
      nextFertilizerDue: data.nextFertilizerDue ? toDate(data.nextFertilizerDue) : undefined,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    } as UserPlant
  })
}

export const addUserPlant = async (plant: Omit<UserPlant, 'id'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'userPlants'), {
    ...plant,
    acquisitionDate: Timestamp.fromDate(plant.acquisitionDate),
    lastWatered: plant.lastWatered ? Timestamp.fromDate(plant.lastWatered) : null,
    nextWaterDue: plant.nextWaterDue ? Timestamp.fromDate(plant.nextWaterDue) : null,
    lastFertilized: plant.lastFertilized ? Timestamp.fromDate(plant.lastFertilized) : null,
    nextFertilizerDue: plant.nextFertilizerDue ? Timestamp.fromDate(plant.nextFertilizerDue) : null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return ref.id
}

export const updateUserPlant = async (id: string, updates: Partial<UserPlant>) => {
  const data: Record<string, unknown> = { ...updates, updatedAt: Timestamp.now() }
  if (updates.acquisitionDate) data.acquisitionDate = Timestamp.fromDate(updates.acquisitionDate)
  if (updates.lastWatered) data.lastWatered = Timestamp.fromDate(updates.lastWatered)
  if (updates.nextWaterDue) data.nextWaterDue = Timestamp.fromDate(updates.nextWaterDue)
  if (updates.lastFertilized) data.lastFertilized = Timestamp.fromDate(updates.lastFertilized)
  if (updates.nextFertilizerDue) data.nextFertilizerDue = Timestamp.fromDate(updates.nextFertilizerDue)
  await updateDoc(doc(db, 'userPlants', id), data)
}

export const deleteUserPlant = async (id: string) => {
  await deleteDoc(doc(db, 'userPlants', id))
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export const getWishlist = async (userId: string): Promise<WishlistItem[]> => {
  const q = query(
    collection(db, 'wishlist'),
    where('userId', '==', userId),
    orderBy('addedAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => {
    const data = d.data()
    return {
      ...data,
      id: d.id,
      addedAt: toDate(data.addedAt),
      targetDate: data.targetDate ? toDate(data.targetDate) : undefined,
    } as WishlistItem
  })
}

export const addWishlistItem = async (item: Omit<WishlistItem, 'id'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'wishlist'), {
    ...item,
    addedAt: Timestamp.now(),
    targetDate: item.targetDate ? Timestamp.fromDate(item.targetDate) : null,
  })
  return ref.id
}

export const updateWishlistItem = async (id: string, updates: Partial<WishlistItem>) => {
  await updateDoc(doc(db, 'wishlist', id), updates)
}

export const deleteWishlistItem = async (id: string) => {
  await deleteDoc(doc(db, 'wishlist', id))
}

// ─── Care Logs ───────────────────────────────────────────────────────────────

export const getCareLogs = async (userId: string, userPlantId?: string): Promise<CareLog[]> => {
  const constraints = [where('userId', '==', userId), orderBy('date', 'desc')]
  if (userPlantId) constraints.splice(1, 0, where('userPlantId', '==', userPlantId))
  const q = query(collection(db, 'careLogs'), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map(d => {
    const data = d.data()
    return { ...data, id: d.id, date: toDate(data.date) } as CareLog
  })
}

export const addCareLog = async (log: Omit<CareLog, 'id'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'careLogs'), {
    ...log,
    date: Timestamp.fromDate(log.date),
  })
  return ref.id
}

// ─── Custom Substrates ───────────────────────────────────────────────────────

export const getCustomSubstrates = async (userId: string): Promise<CustomSubstrate[]> => {
  const q = query(collection(db, 'substrates'), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map(d => {
    const data = d.data()
    return { ...data, id: d.id, createdAt: toDate(data.createdAt) } as CustomSubstrate
  })
}

export const addCustomSubstrate = async (substrate: Omit<CustomSubstrate, 'id'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'substrates'), {
    ...substrate,
    createdAt: Timestamp.now(),
  })
  return ref.id
}

export const deleteCustomSubstrate = async (id: string) => {
  await deleteDoc(doc(db, 'substrates', id))
}

// ─── Reminders ───────────────────────────────────────────────────────────────

export const getReminders = async (userId: string): Promise<CareReminder[]> => {
  const q = query(
    collection(db, 'reminders'),
    where('userId', '==', userId),
    where('completed', '==', false),
    orderBy('dueDate', 'asc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => {
    const data = d.data()
    return {
      ...data,
      id: d.id,
      dueDate: toDate(data.dueDate),
      snoozedUntil: data.snoozedUntil ? toDate(data.snoozedUntil) : undefined,
    } as CareReminder
  })
}

export const markReminderDone = async (id: string) => {
  await updateDoc(doc(db, 'reminders', id), { completed: true })
}
