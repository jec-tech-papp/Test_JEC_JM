import { useTranslation } from 'react-i18next';
import { setLanguage } from '../i18n';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'fr' | 'en';

  return (
    <div className="flex rounded-lg border border-leaf-200 bg-white p-0.5 text-sm">
      {(['fr', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLanguage(l)}
          className={`rounded-md px-3 py-1 font-medium transition-colors ${
            lang === l
              ? 'bg-leaf-600 text-white'
              : 'text-soil-700 hover:bg-leaf-50'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
