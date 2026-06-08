import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { UserPlant, WishlistItem, CareEvent } from '../types';

const LS_PREFIX = 'plantaddict_';

function lsKey(userId: string, collection: string) {
  return `${LS_PREFIX}${collection}_${userId}`;
}

function readLS<T>(userId: string, collection: string): T[] {
  const raw = localStorage.getItem(lsKey(userId, collection));
  return raw ? JSON.parse(raw) : [];
}

function writeLS<T>(userId: string, collection: string, data: T[]) {
  localStorage.setItem(lsKey(userId, collection), JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('plantaddict-storage', { detail: { userId, collection } }));
}

function generateId() {
  return crypto.randomUUID();
}

// --- User Plants ---

export async function getUserPlants(userId: string): Promise<UserPlant[]> {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'userPlants'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserPlant));
  }
  return readLS<UserPlant>(userId, 'userPlants');
}

export function subscribeUserPlants(
  userId: string,
  callback: (plants: UserPlant[]) => void
): Unsubscribe {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'userPlants'), where('userId', '==', userId));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserPlant)));
    });
  }
  callback(readLS<UserPlant>(userId, 'userPlants'));
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (!detail || (detail.userId === userId && detail.collection === 'userPlants')) {
      callback(readLS<UserPlant>(userId, 'userPlants'));
    }
  };
  window.addEventListener('plantaddict-storage', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('plantaddict-storage', handler);
    window.removeEventListener('storage', handler);
  };
}

export async function addUserPlant(
  data: Omit<UserPlant, 'id' | 'createdAt'>
): Promise<UserPlant> {
  const plant: Omit<UserPlant, 'id'> = {
    ...data,
    createdAt: new Date().toISOString(),
  };
  if (isFirebaseConfigured && db) {
    const ref = await addDoc(collection(db, 'userPlants'), plant);
    return { id: ref.id, ...plant };
  }
  const id = generateId();
  const full = { id, ...plant };
  const all = readLS<UserPlant>(data.userId, 'userPlants');
  all.push(full);
  writeLS(data.userId, 'userPlants', all);
  return full;
}

export async function updateUserPlant(
  userId: string,
  id: string,
  data: Partial<UserPlant>
): Promise<void> {
  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, 'userPlants', id), data);
    return;
  }
  const all = readLS<UserPlant>(userId, 'userPlants');
  const idx = all.findIndex((p) => p.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...data };
    writeLS(userId, 'userPlants', all);
  }
}

export async function deleteUserPlant(userId: string, id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, 'userPlants', id));
    return;
  }
  const all = readLS<UserPlant>(userId, 'userPlants').filter((p) => p.id !== id);
  writeLS(userId, 'userPlants', all);
}

// --- Wishlist ---

export function subscribeWishlist(
  userId: string,
  callback: (items: WishlistItem[]) => void
): Unsubscribe {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'wishlist'), where('userId', '==', userId));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as WishlistItem)));
    });
  }
  callback(readLS<WishlistItem>(userId, 'wishlist'));
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (!detail || (detail.userId === userId && detail.collection === 'wishlist')) {
      callback(readLS<WishlistItem>(userId, 'wishlist'));
    }
  };
  window.addEventListener('plantaddict-storage', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('plantaddict-storage', handler);
    window.removeEventListener('storage', handler);
  };
}

export async function addWishlistItem(
  data: Omit<WishlistItem, 'id'>
): Promise<WishlistItem> {
  if (isFirebaseConfigured && db) {
    const ref = await addDoc(collection(db, 'wishlist'), data);
    return { id: ref.id, ...data };
  }
  const id = generateId();
  const full = { id, ...data };
  const all = readLS<WishlistItem>(data.userId, 'wishlist');
  all.push(full);
  writeLS(data.userId, 'wishlist', all);
  return full;
}

export async function deleteWishlistItem(userId: string, id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, 'wishlist', id));
    return;
  }
  const all = readLS<WishlistItem>(userId, 'wishlist').filter((i) => i.id !== id);
  writeLS(userId, 'wishlist', all);
}

// --- Care Events ---

export function subscribeCareEvents(
  userId: string,
  callback: (events: CareEvent[]) => void
): Unsubscribe {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'careEvents'), where('userId', '==', userId));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CareEvent)));
    });
  }
  callback(readLS<CareEvent>(userId, 'careEvents'));
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (!detail || (detail.userId === userId && detail.collection === 'careEvents')) {
      callback(readLS<CareEvent>(userId, 'careEvents'));
    }
  };
  window.addEventListener('plantaddict-storage', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('plantaddict-storage', handler);
    window.removeEventListener('storage', handler);
  };
}

export async function addCareEvent(
  data: Omit<CareEvent, 'id'>
): Promise<CareEvent> {
  if (isFirebaseConfigured && db) {
    const ref = await addDoc(collection(db, 'careEvents'), data);
    return { id: ref.id, ...data };
  }
  const id = generateId();
  const full = { id, ...data };
  const all = readLS<CareEvent>(data.userId, 'careEvents');
  all.push(full);
  writeLS(data.userId, 'careEvents', all);
  return full;
}
