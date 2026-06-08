import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Check } from 'lucide-react';
import type { PlantVariety } from '../types';

interface VarietySelectorProps {
  varieties: PlantVariety[];
  value: string;
  onChange: (variety: string) => void;
  onAddCustom?: (variety: string) => void;
  plantEmoji?: string;
}

function VarietyImage({
  variety,
  plantEmoji,
  selected,
}: {
  variety: PlantVariety;
  plantEmoji: string;
  selected: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 transition-all ${
        selected
          ? 'border-leaf-600 ring-2 ring-leaf-200'
          : 'border-leaf-100 hover:border-leaf-300'
      }`}
    >
      <div className="aspect-[4/3] w-full bg-gradient-to-br from-soil-100 to-leaf-50">
        {variety.imageUrl && !failed ? (
          <img
            src={variety.imageUrl}
            alt={variety.name}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center">
            <span className="text-3xl">{plantEmoji}</span>
            {variety.isCustom && (
              <span className="text-[10px] uppercase tracking-wide text-soil-400">perso</span>
            )}
          </div>
        )}
      </div>
      <div className="border-t border-leaf-100 bg-white px-2 py-2">
        <p className="truncate text-center text-xs font-medium text-soil-800">
          {variety.name}
        </p>
      </div>
      {selected && (
        <div className="absolute right-2 top-2 rounded-full bg-leaf-600 p-1 text-white shadow">
          <Check className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}

export function VarietySelector({
  varieties,
  value,
  onChange,
  onAddCustom,
  plantEmoji = '🌱',
}: VarietySelectorProps) {
  const { t } = useTranslation();
  const [custom, setCustom] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleAddCustom = () => {
    const trimmed = custom.trim();
    if (!trimmed) return;
    onAddCustom?.(trimmed);
    onChange(trimmed);
    setCustom('');
    setShowCustom(false);
  };

  if (varieties.length === 0 && !onAddCustom) return null;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-soil-700">
        {t('library.variety')}
      </label>
      <p className="text-xs text-soil-500">{t('library.varietyPhotoHint')}</p>

      {varieties.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <button
            type="button"
            onClick={() => onChange('')}
            className={`rounded-xl border-2 border-dashed p-4 text-center text-xs transition-colors ${
              value === ''
                ? 'border-leaf-600 bg-leaf-50 text-leaf-700'
                : 'border-soil-200 text-soil-500 hover:border-leaf-300'
            }`}
          >
            {t('library.noVariety')}
          </button>
          {varieties.map((v) => (
            <button
              key={v.name}
              type="button"
              onClick={() => onChange(v.name)}
              className="text-left"
            >
              <VarietyImage
                variety={v}
                plantEmoji={plantEmoji}
                selected={value === v.name}
              />
            </button>
          ))}
        </div>
      )}

      {onAddCustom && (
        <>
          {!showCustom ? (
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="flex items-center gap-1 text-sm text-leaf-600 hover:text-leaf-800"
            >
              <Plus className="h-4 w-4" />
              {t('library.addVariety')}
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder={t('library.customVarietyPlaceholder')}
                className="flex-1 rounded-lg border border-leaf-200 px-3 py-2 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              />
              <button
                type="button"
                onClick={handleAddCustom}
                className="rounded-lg bg-leaf-600 px-3 py-2 text-sm text-white hover:bg-leaf-700"
              >
                {t('library.addVarietyButton')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
