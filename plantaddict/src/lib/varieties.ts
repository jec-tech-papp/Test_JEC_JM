import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { getVarietyReferenceImage } from '../data/variety-images';
import type { PlantVariety } from '../types';

const LS_PREFIX = 'plantaddict_varieties_';

function readLS(userId: string): Record<string, string[]> {
  const raw = localStorage.getItem(`${LS_PREFIX}${userId}`);
  return raw ? JSON.parse(raw) : {};
}

function writeLS(userId: string, data: Record<string, string[]>) {
  localStorage.setItem(`${LS_PREFIX}${userId}`, JSON.stringify(data));
  window.dispatchEvent(
    new CustomEvent('plantaddict-varieties', { detail: { userId } })
  );
}

export async function getUserVarieties(userId: string): Promise<Record<string, string[]>> {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'customVarieties'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const result: Record<string, string[]> = {};
    for (const d of snap.docs) {
      const data = d.data();
      result[data.plantId] = data.varieties ?? [];
    }
    return result;
  }
  return readLS(userId);
}

export function subscribeUserVarieties(
  userId: string,
  callback: (varieties: Record<string, string[]>) => void
): Unsubscribe {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'customVarieties'), where('userId', '==', userId));
    return onSnapshot(q, (snap) => {
      const result: Record<string, string[]> = {};
      for (const d of snap.docs) {
        const data = d.data();
        result[data.plantId] = data.varieties ?? [];
      }
      callback(result);
    });
  }
  callback(readLS(userId));
  const handler = () => callback(readLS(userId));
  window.addEventListener('plantaddict-varieties', handler);
  return () => window.removeEventListener('plantaddict-varieties', handler);
}

export async function addUserVariety(
  userId: string,
  plantId: string,
  variety: string
): Promise<void> {
  const trimmed = variety.trim();
  if (!trimmed) return;

  if (isFirebaseConfigured && db) {
    const docId = `${userId}_${plantId}`;
    const existing = await getUserVarieties(userId);
    const list = existing[plantId] ?? [];
    if (list.includes(trimmed)) return;
    await setDoc(doc(db, 'customVarieties', docId), {
      userId,
      plantId,
      varieties: [...list, trimmed],
    });
    return;
  }

  const all = readLS(userId);
  const list = all[plantId] ?? [];
  if (!list.includes(trimmed)) {
    all[plantId] = [...list, trimmed];
    writeLS(userId, all);
  }
}

export function getAllVarietiesForPlant(
  catalogVarieties: string[] | undefined,
  userVarieties: string[],
  plantId: string,
  userPlantMap: Record<string, string[]>
): PlantVariety[] {
  const custom = userPlantMap[plantId] ?? userVarieties;
  const catalogNames = catalogVarieties ?? [];
  const allNames = [...new Set([...catalogNames, ...custom])];

  return allNames.map((name) => ({
    name,
    imageUrl: getVarietyReferenceImage(plantId, name),
    isCustom: !catalogNames.includes(name),
  }));
}
