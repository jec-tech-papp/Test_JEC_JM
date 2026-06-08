import { useTranslation } from 'react-i18next';
import { catalogFertilizers } from '../data/fertilizers';
import type { CustomFertilizer } from '../types';

interface FertilizerSelectorProps {
  fertilizerId: string | null;
  customFertilizer: CustomFertilizer | null;
  useCustom: boolean;
  onFertilizerChange: (id: string) => void;
  onUseCustomChange: (use: boolean) => void;
  onCustomChange: (f: CustomFertilizer) => void;
}

export function FertilizerSelector({
  fertilizerId,
  customFertilizer,
  useCustom,
  onFertilizerChange,
  onUseCustomChange,
  onCustomChange,
}: FertilizerSelectorProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'fr';

  const custom = customFertilizer ?? {
    name: '',
    npk: '',
    dilutionMlPerL: 4,
    type: 'liquid' as const,
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={!useCustom}
            onChange={() => onUseCustomChange(false)}
            className="accent-leaf-600"
          />
          {t('portfolio.fertilizer')}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={useCustom}
            onChange={() => onUseCustomChange(true)}
            className="accent-leaf-600"
          />
          {t('portfolio.customFertilizer')}
        </label>
      </div>

      {!useCustom ? (
        <select
          value={fertilizerId ?? ''}
          onChange={(e) => onFertilizerChange(e.target.value)}
          className="w-full rounded-lg border border-leaf-200 px-3 py-2 text-sm"
        >
          <option value="">—</option>
          {catalogFertilizers.map((f) => (
            <option key={f.id} value={f.id}>
              {f.brand} — {lang === 'fr' ? f.nameFr : f.nameEn} ({f.npk})
            </option>
          ))}
        </select>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            type="text"
            value={custom.name}
            onChange={(e) => onCustomChange({ ...custom, name: e.target.value })}
            placeholder={t('portfolio.fertilizerName')}
            className="rounded-lg border border-leaf-200 px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={custom.npk}
            onChange={(e) => onCustomChange({ ...custom, npk: e.target.value })}
            placeholder={t('portfolio.npk')}
            className="rounded-lg border border-leaf-200 px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={0}
            step={0.5}
            value={custom.dilutionMlPerL}
            onChange={(e) =>
              onCustomChange({ ...custom, dilutionMlPerL: Number(e.target.value) })
            }
            placeholder={t('portfolio.dilution')}
            className="rounded-lg border border-leaf-200 px-3 py-2 text-sm"
          />
          <select
            value={custom.type}
            onChange={(e) =>
              onCustomChange({
                ...custom,
                type: e.target.value as CustomFertilizer['type'],
              })
            }
            className="rounded-lg border border-leaf-200 px-3 py-2 text-sm"
          >
            <option value="liquid">{t('fertilizerType.liquid')}</option>
            <option value="granular">{t('fertilizerType.granular')}</option>
            <option value="slow_release">{t('fertilizerType.slow_release')}</option>
          </select>
        </div>
      )}
    </div>
  );
}
