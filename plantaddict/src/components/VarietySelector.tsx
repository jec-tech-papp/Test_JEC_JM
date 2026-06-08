import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

interface VarietySelectorProps {
  varieties: string[];
  value: string;
  onChange: (variety: string) => void;
  onAddCustom?: (variety: string) => void;
}

export function VarietySelector({
  varieties,
  value,
  onChange,
  onAddCustom,
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
    <div className="space-y-2">
      <label className="block text-sm font-medium text-soil-700">
        {t('library.variety')}
      </label>

      {varieties.length > 0 && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-leaf-200 px-3 py-2 text-sm"
        >
          <option value="">{t('library.noVariety')}</option>
          {varieties.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
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
