import { useTranslation } from 'react-i18next';
import { Droplets } from 'lucide-react';
import type { DoseResult } from '../types';

interface DoseCalculatorProps {
  dose: DoseResult;
}

export function DoseCalculator({ dose }: DoseCalculatorProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-leaf-200 bg-leaf-50 p-4">
      <div className="flex items-center gap-2 text-leaf-700">
        <Droplets className="h-5 w-5" />
        <h4 className="font-semibold">{t('portfolio.dose')}</h4>
      </div>
      {dose.doseMl > 0 ? (
        <div className="mt-2">
          <p className="text-2xl font-bold text-leaf-800">
            {dose.doseMl} ml
          </p>
          <p className="text-sm text-soil-600">
            {t('reminders.dose', {
              dose: dose.doseMl,
              water: dose.waterMl,
            })}
          </p>
          <p className="mt-1 text-xs text-soil-500">
            {t(dose.explanationKey, { factor: dose.substrateFactor })}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-soil-600">{t(dose.explanationKey)}</p>
      )}
    </div>
  );
}
