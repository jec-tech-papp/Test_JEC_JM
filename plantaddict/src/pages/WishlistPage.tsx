import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Plus, Trash2 } from 'lucide-react';
import { useAuth, getUserId } from '../contexts/AuthContext';
import { subscribeWishlist, deleteWishlistItem, addUserPlant } from '../lib/storage';
import { getPlant } from '../data/plants';
import type { WishlistItem } from '../types';

export function WishlistPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const lang = i18n.language as 'en' | 'fr';

  useEffect(() => {
    if (!user) return;
    return subscribeWishlist(getUserId(user), setItems);
  }, [user]);

  const handleMoveToPortfolio = async (item: WishlistItem) => {
    if (!user) return;
    const catalog = getPlant(item.plantId);
    const name = catalog ? (lang === 'fr' ? catalog.nameFr : catalog.nameEn) : item.plantId;
    const displayName = item.variety ? `${name} — ${item.variety}` : name;
    await addUserPlant({
      userId: getUserId(user),
      plantId: item.plantId,
      nickname: displayName,
      variety: item.variety,
      potVolumeL: 3,
      substrateId: 'universal',
      customSubstrateMix: [],
      fertilizerId: 'biobizz-grow',
      customFertilizer: null,
      location: '',
      acquiredDate: new Date().toISOString().split('T')[0],
      lastFertilized: null,
      nextFertilizerDate: null,
      lastWatered: null,
      photoUrl: null,
    });
    await deleteWishlistItem(getUserId(user), item.id);
  };

  const handleRemove = async (id: string) => {
    if (!user) return;
    await deleteWishlistItem(getUserId(user), id);
  };

  return (
    <div className="md:ml-48">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-soil-900">{t('wishlist.title')}</h2>
          <p className="text-soil-500">{items.length} plantes</p>
        </div>
        <Link
          to="/library"
          className="flex items-center gap-1 rounded-lg border border-leaf-300 px-4 py-2 text-sm font-medium text-leaf-700 hover:bg-leaf-50"
        >
          <Plus className="h-4 w-4" />
          {t('library.title')}
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-leaf-300 bg-white p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-leaf-300" />
          <p className="mt-3 text-lg font-medium text-soil-700">{t('wishlist.empty')}</p>
          <p className="mt-2 text-soil-500">{t('wishlist.emptyHint')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const catalog = getPlant(item.plantId);
            const name = catalog
              ? lang === 'fr'
                ? catalog.nameFr
                : catalog.nameEn
              : item.plantId;

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-leaf-200 bg-white p-4 shadow-sm"
              >
                <span className="text-3xl">{catalog?.emoji ?? '🌱'}</span>
                <div className="flex-1">
                  <Link
                    to={`/library/${item.plantId}`}
                    className="font-semibold hover:text-leaf-600"
                  >
                    {name}
                  </Link>
                  {catalog && (
                    <p className="text-sm italic text-soil-500">{catalog.scientificName}</p>
                  )}
                  {item.variety && (
                    <span className="mt-1 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">
                      {item.variety}
                    </span>
                  )}
                  {item.notes && !item.variety && (
                    <p className="mt-1 text-sm text-soil-600">{item.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMoveToPortfolio(item)}
                    className="rounded-lg bg-leaf-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-leaf-700"
                  >
                    {t('wishlist.moveToPortfolio')}
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
