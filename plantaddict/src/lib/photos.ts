import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase';

const LS_PREFIX = 'plantaddict_photo_';
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.82;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
        'image/jpeg',
        JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Invalid image'));
    };
    img.src = url;
  });
}

export async function uploadPlantPhoto(
  userId: string,
  userPlantId: string,
  file: File
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('invalid_type');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('too_large');
  }

  const compressed = await compressImage(file);

  if (isFirebaseConfigured && storage) {
    try {
      const path = `users/${userId}/plants/${userPlantId}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, compressed, { contentType: 'image/jpeg' });
      return getDownloadURL(storageRef);
    } catch {
      // Storage unavailable — fallback to local
    }
  }

  const dataUrl = await blobToDataUrl(compressed);
  localStorage.setItem(`${LS_PREFIX}${userPlantId}`, dataUrl);
  return dataUrl;
}

export async function deletePlantPhoto(
  userId: string,
  userPlantId: string,
  photoUrl: string
): Promise<void> {
  if (isFirebaseConfigured && storage && photoUrl.startsWith('https://')) {
    try {
      const storageRef = ref(storage, `users/${userId}/plants/${userPlantId}`);
      await deleteObject(storageRef);
    } catch {
      // file may already be gone
    }
  }
  localStorage.removeItem(`${LS_PREFIX}${userPlantId}`);
}

export function getLocalPhoto(userPlantId: string): string | null {
  return localStorage.getItem(`${LS_PREFIX}${userPlantId}`);
}
