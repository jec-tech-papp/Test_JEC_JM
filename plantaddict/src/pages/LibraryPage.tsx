import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Sparkles } from 'lucide-react';
import { plants, searchPlants, getPlantsByCategory } from '../data/plants';
import { PlantCard } from '../components/PlantCard';
import type { PlantCategory } from '../types';

type LibraryTab = 'all' | PlantCategory;

export function LibraryPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<LibraryTab>('all');

  const filtered = query
    ? searchPlants(query, tab)
    : getPlantsByCategory(tab);

  const rareCount = getPlantsByCategory('rare').length;
  const commonCount = getPlantsByCategory('common').length;

  const tabs: { id: LibraryTab; label: string; count: number }[] = [
    { id: 'all', label: t('library.tabAll'), count: plants.length },
    { id: 'common', label: t('library.tabCommon'), count: commonCount },
    { id: 'rare', label: t('library.tabRare'), count: rareCount },
  ];

  return (
    <div className="md:ml-48">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-soil-900">{t('library.title')}</h2>
        <p className="text-soil-500">
          {t('library.plants', { count: plants.length })} — {t('library.catalogHint')}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === id
                ? id === 'rare'
                  ? 'bg-violet-600 text-white'
                  : 'bg-leaf-600 text-white'
                : 'bg-white text-soil-600 border border-leaf-200 hover:bg-leaf-50'
            }`}
          >
            {id === 'rare' && <Sparkles className="h-3.5 w-3.5" />}
            {label}
            <span className="opacity-75">({count})</span>
          </button>
        ))}
      </div>

      {tab === 'rare' && (
        <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
          <Sparkles className="mb-1 inline h-4 w-4" /> {t('library.rarePanelHint')}
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soil-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('library.search')}
          className="w-full rounded-xl border border-leaf-200 bg-white py-2.5 pl-10 pr-4 shadow-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((plant) => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-soil-500">{t('library.noResults')}</p>
      )}
    </div>
  );
}
