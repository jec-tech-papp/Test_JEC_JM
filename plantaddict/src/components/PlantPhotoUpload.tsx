import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Trash2, Upload } from 'lucide-react';
import { PlantAvatar } from './PlantAvatar';
import { uploadPlantPhoto, deletePlantPhoto } from '../lib/photos';

interface PlantPhotoUploadProps {
  userId: string;
  userPlantId: string;
  photoUrl: string | null;
  emoji?: string;
  plantName: string;
  onPhotoChange: (url: string | null) => void;
}

export function PlantPhotoUpload({
  userId,
  userPlantId,
  photoUrl,
  emoji,
  plantName,
  onPhotoChange,
}: PlantPhotoUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const url = await uploadPlantPhoto(userId, userPlantId, file);
      onPhotoChange(url);
    } catch (e) {
      setError(
        e instanceof Error && e.message === 'too_large'
          ? t('portfolio.photoTooLarge')
          : t('portfolio.photoError')
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!photoUrl) return;
    setUploading(true);
    try {
      await deletePlantPhoto(userId, userPlantId, photoUrl);
      onPhotoChange(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-soil-700">
        {t('portfolio.photo')}
      </label>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative w-full max-w-xs">
          <PlantAvatar
            photoUrl={photoUrl}
            emoji={emoji}
            alt={plantName}
            size="xl"
            className="aspect-square w-full max-h-64"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 text-sm font-medium text-white">
              {t('common.loading')}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700 disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
            {photoUrl ? t('portfolio.changePhoto') : t('portfolio.addPhoto')}
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-lg border border-leaf-300 px-4 py-2 text-sm text-leaf-700 hover:bg-leaf-50 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {t('portfolio.uploadPhoto')}
          </button>
          {photoUrl && (
            <button
              type="button"
              disabled={uploading}
              onClick={handleRemove}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {t('portfolio.removePhoto')}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-soil-500">{t('portfolio.photoHint')}</p>
    </div>
  );
}
