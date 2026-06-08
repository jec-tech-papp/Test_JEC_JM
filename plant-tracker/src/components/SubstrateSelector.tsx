import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { substrates } from '../data/substrates';
import type { SubstrateMixComponent } from '../types';

interface SubstrateSelectorProps {
  substrateId: string | null;
  customMix: SubstrateMixComponent[];
  useCustomMix: boolean;
  onSubstrateChange: (id: string) => void;
  onUseCustomMixChange: (use: boolean) => void;
  onMixChange: (mix: SubstrateMixComponent[]) => void;
}

export function SubstrateSelector({
  substrateId,
  customMix,
  useCustomMix,
  onSubstrateChange,
  onUseCustomMixChange,
  onMixChange,
}: SubstrateSelectorProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'en' | 'fr';

  const addComponent = () => {
    onMixChange([...customMix, { substrateId: substrates[0].id, percentage: 0 }]);
  };

  const updateComponent = (index: number, field: keyof SubstrateMixComponent, value: string | number) => {
    const updated = [...customMix];
    updated[index] = { ...updated[index], [field]: value };
    onMixChange(updated);
  };

  const removeComponent = (index: number) => {
    onMixChange(customMix.filter((_, i) => i !== index));
  };

  const mixTotal = customMix.reduce((s, c) => s + c.percentage, 0);

  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={!useCustomMix}
            onChange={() => onUseCustomMixChange(false)}
            className="accent-leaf-600"
          />
          {t('portfolio.substrate')}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={useCustomMix}
            onChange={() => onUseCustomMixChange(true)}
            className="accent-leaf-600"
          />
          {t('portfolio.substrateMix')}
        </label>
      </div>

      {!useCustomMix ? (
        <select
          value={substrateId ?? ''}
          onChange={(e) => onSubstrateChange(e.target.value)}
          className="w-full rounded-lg border border-leaf-200 px-3 py-2 text-sm"
        >
          <option value="">{t('portfolio.selectSubstrate')}</option>
          {substrates.map((s) => (
            <option key={s.id} value={s.id}>
              {lang === 'fr' ? s.nameFr : s.nameEn}
            </option>
          ))}
        </select>
      ) : (
        <div className="space-y-2">
          {customMix.map((comp, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={comp.substrateId}
                onChange={(e) => updateComponent(i, 'substrateId', e.target.value)}
                className="flex-1 rounded-lg border border-leaf-200 px-2 py-1.5 text-sm"
              >
                {substrates.map((s) => (
                  <option key={s.id} value={s.id}>
                    {lang === 'fr' ? s.nameFr : s.nameEn}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                max={100}
                value={comp.percentage}
                onChange={(e) => updateComponent(i, 'percentage', Number(e.target.value))}
                className="w-20 rounded-lg border border-leaf-200 px-2 py-1.5 text-sm"
                placeholder="%"
              />
              <span className="text-sm text-soil-500">%</span>
              <button
                type="button"
                onClick={() => removeComponent(i)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addComponent}
            className="flex items-center gap-1 text-sm text-leaf-600 hover:text-leaf-800"
          >
            <Plus className="h-4 w-4" />
            {t('portfolio.addComponent')}
          </button>
          {customMix.length > 0 && (
            <p className={`text-xs ${mixTotal === 100 ? 'text-leaf-600' : 'text-amber-600'}`}>
              Total: {mixTotal}% {mixTotal !== 100 && '(should be 100%)'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
