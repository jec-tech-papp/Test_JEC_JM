import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { plants, searchPlants } from '../data/plants';
import { PlantCard } from '../components/PlantCard';

export function LibraryPage() {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const lang = i18n.language as 'en' | 'fr';

  const filtered = query ? searchPlants(query, lang) : plants;

  return (
    <div className="md:ml-48">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-soil-900">{t('library.title')}</h2>
        <p className="text-soil-500">{t('library.plants', { count: plants.length })}</p>
      </div>

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
        <p className="py-12 text-center text-soil-500">No results</p>
      )}
    </div>
  );
}
