import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Droplets,
  FlaskConical,
  Leaf,
  Calendar,
  MapPin,
} from 'lucide-react';
import { useAuth, getUserId } from '../contexts/AuthContext';
import { subscribeUserPlants, subscribeCareEvents } from '../lib/storage';
import { computeGardenStats, computePlantStats } from '../lib/stats';
import type { CareEvent, UserPlant } from '../types';

function StatusBadge({
  status,
  labels,
}: {
  status: string;
  labels: Record<string, string>;
}) {
  const colors: Record<string, string> = {
    never: 'bg-soil-100 text-soil-600',
    overdue: 'bg-red-100 text-red-700',
    due_soon: 'bg-amber-100 text-amber-800',
    ok: 'bg-leaf-100 text-leaf-700',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? colors.never}`}>
      {labels[status] ?? status}
    </span>
  );
}

function BreakdownBar({ items, emptyLabel }: { items: { label: string; count: number; percentage: number }[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-soil-500">{emptyLabel}</p>;
  }
  return (
    <div className="space-y-2">
      {items.slice(0, 8).map((item) => (
        <div key={item.label}>
          <div className="mb-0.5 flex justify-between text-sm">
            <span className="truncate text-soil-700">{item.label}</span>
            <span className="ml-2 shrink-0 text-soil-500">
              {item.count} ({item.percentage}%)
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-soil-100">
            <div
              className="h-full rounded-full bg-leaf-500 transition-all"
              style={{ width: `${Math.max(item.percentage, 4)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'leaf',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: 'leaf' | 'blue' | 'amber' | 'violet';
}) {
  const iconColors = {
    leaf: 'text-leaf-600 bg-leaf-50',
    blue: 'text-blue-600 bg-blue-50',
    amber: 'text-amber-600 bg-amber-50',
    violet: 'text-violet-600 bg-violet-50',
  };
  return (
    <div className="rounded-xl border border-leaf-200 bg-white p-4 shadow-sm">
      <div className={`mb-2 inline-flex rounded-lg p-2 ${iconColors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs text-soil-500">{label}</p>
      <p className="text-2xl font-bold text-soil-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-soil-500">{sub}</p>}
    </div>
  );
}

export function StatsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = i18n.language as 'en' | 'fr';
  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [careEvents, setCareEvents] = useState<CareEvent[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'care' | 'composition'>('overview');

  useEffect(() => {
    if (!user) return;
    const uid = getUserId(user);
    const unsubPlants = subscribeUserPlants(uid, setPlants);
    const unsubEvents = subscribeCareEvents(uid, setCareEvents);
    return () => {
      unsubPlants();
      unsubEvents();
    };
  }, [user]);

  const stats = useMemo(() => {
    if (selectedPlantId === 'all') {
      return computeGardenStats(plants, careEvents, lang);
    }
    const plant = plants.find((p) => p.id === selectedPlantId);
    if (!plant) return computeGardenStats([], [], lang);
    return computePlantStats(plant, careEvents, lang);
  }, [plants, careEvents, selectedPlantId, lang]);

  const statusLabels = {
    never: t('stats.statusNever'),
    overdue: t('stats.statusOverdue'),
    due_soon: t('stats.statusDueSoon'),
    ok: t('stats.statusOk'),
  };

  const tabs = [
    { id: 'overview' as const, label: t('stats.tabOverview') },
    { id: 'care' as const, label: t('stats.tabCare') },
    { id: 'composition' as const, label: t('stats.tabComposition') },
  ];

  if (plants.length === 0) {
    return (
      <div className="md:ml-48">
        <h2 className="mb-2 text-2xl font-bold text-soil-900">{t('stats.title')}</h2>
        <div className="rounded-2xl border border-dashed border-leaf-300 bg-white p-12 text-center">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-leaf-300" />
          <p className="text-lg font-medium text-soil-700">{t('stats.empty')}</p>
          <p className="mt-2 text-soil-500">{t('stats.emptyHint')}</p>
          <Link
            to="/library"
            className="mt-4 inline-block rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
          >
            {t('portfolio.addPlant')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="md:ml-48">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-soil-900">{t('stats.title')}</h2>
        <p className="text-soil-500">{t('stats.subtitle')}</p>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-soil-700">{t('stats.filterPlant')}</label>
        <select
          value={selectedPlantId}
          onChange={(e) => setSelectedPlantId(e.target.value)}
          className="w-full max-w-md rounded-lg border border-leaf-200 px-3 py-2 text-sm sm:w-auto"
        >
          <option value="all">{t('stats.allGarden')}</option>
          {plants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nickname}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg border border-leaf-200 bg-white p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-leaf-600 text-white'
                : 'text-soil-600 hover:bg-soil-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Leaf} label={t('stats.totalPlants')} value={stats.totalPlants} color="leaf" />
            <StatCard
              icon={Calendar}
              label={t('stats.avgAge')}
              value={t('stats.daysCount', { count: stats.avgAgeDays })}
              sub={t('stats.avgInGarden', { count: stats.avgInGardenDays })}
              color="violet"
            />
            <StatCard
              icon={MapPin}
              label={t('stats.totalPotVolume')}
              value={`${stats.totalPotVolumeL} L`}
              sub={t('stats.avgPotVolume', { volume: stats.avgPotVolumeL })}
              color="blue"
            />
            <StatCard
              icon={BarChart3}
              label={t('stats.careEvents')}
              value={stats.fertilizeEventsCount + stats.waterEventsCount}
              sub={`${stats.fertilizeEventsCount} ${t('stats.fertilizeShort')} · ${stats.waterEventsCount} ${t('stats.waterShort')}`}
              color="amber"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-leaf-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-leaf-600" />
                <h3 className="font-semibold text-soil-900">{t('stats.fertilizerSummary')}</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-leaf-50 p-3">
                  <p className="text-2xl font-bold text-leaf-700">{stats.fertilizedCount}</p>
                  <p className="text-xs text-soil-500">{t('stats.fertilized')}</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-2xl font-bold text-red-700">{stats.overdueFertilizerCount}</p>
                  <p className="text-xs text-soil-500">{t('stats.overdue')}</p>
                </div>
                <div className="rounded-lg bg-soil-50 p-3">
                  <p className="text-2xl font-bold text-soil-600">{stats.neverFertilizedCount}</p>
                  <p className="text-xs text-soil-500">{t('stats.never')}</p>
                </div>
              </div>
              {stats.totalFertilizerDoseMl > 0 && (
                <p className="mt-3 text-sm text-soil-500">
                  {t('stats.totalFertilizerDose', { ml: stats.totalFertilizerDoseMl })}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-leaf-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-soil-900">{t('stats.waterSummary')}</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-2xl font-bold text-blue-700">{stats.wateredCount}</p>
                  <p className="text-xs text-soil-500">{t('stats.watered')}</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-2xl font-bold text-red-700">{stats.overdueWaterCount}</p>
                  <p className="text-xs text-soil-500">{t('stats.overdue')}</p>
                </div>
                <div className="rounded-lg bg-soil-50 p-3">
                  <p className="text-2xl font-bold text-soil-600">{stats.neverWateredCount}</p>
                  <p className="text-xs text-soil-500">{t('stats.never')}</p>
                </div>
              </div>
              {stats.totalWaterVolumeMl > 0 && (
                <p className="mt-3 text-sm text-soil-500">
                  {t('stats.totalWaterVolume', { ml: stats.totalWaterVolumeMl })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'care' && (
        <div className="overflow-hidden rounded-xl border border-leaf-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-leaf-100 bg-soil-50 text-left text-xs text-soil-500">
                  <th className="px-4 py-3">{t('stats.plant')}</th>
                  <th className="px-4 py-3">{t('stats.fertilizer')}</th>
                  <th className="px-4 py-3">{t('stats.lastFertilized')}</th>
                  <th className="px-4 py-3">{t('stats.watering')}</th>
                  <th className="px-4 py-3">{t('stats.lastWatered')}</th>
                  <th className="px-4 py-3">{t('stats.age')}</th>
                  <th className="px-4 py-3">{t('stats.inGarden')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.plantRows.map((row) => (
                  <tr key={row.userPlantId} className="border-b border-leaf-50 hover:bg-soil-50/50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/portfolio/${row.userPlantId}`}
                        className="flex items-center gap-2 font-medium text-leaf-700 hover:underline"
                      >
                        <span>{row.emoji}</span>
                        <span className="max-w-[140px] truncate">{row.nickname}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.fertilizerStatus} labels={statusLabels} />
                    </td>
                    <td className="px-4 py-3 text-soil-600">
                      {row.lastFertilized ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.waterStatus} labels={statusLabels} />
                    </td>
                    <td className="px-4 py-3 text-soil-600">
                      {row.lastWatered ?? '—'}
                      {row.daysSinceWatered !== null && (
                        <span className="ml-1 text-xs text-soil-400">
                          ({t('stats.daysAgo', { count: row.daysSinceWatered })})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-soil-600">
                      {t('stats.daysCount', { count: row.ageDays })}
                    </td>
                    <td className="px-4 py-3 text-soil-600">
                      {t('stats.daysCount', { count: row.inGardenDays })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'composition' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-leaf-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-soil-900">{t('stats.byFamily')}</h3>
            <BreakdownBar items={stats.byFamily} emptyLabel={t('stats.noData')} />
          </div>
          <div className="rounded-xl border border-leaf-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-soil-900">{t('stats.byCategory')}</h3>
            <BreakdownBar items={stats.byCategory} emptyLabel={t('stats.noData')} />
          </div>
          <div className="rounded-xl border border-leaf-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-soil-900">{t('stats.byDifficulty')}</h3>
            <BreakdownBar
              items={stats.byDifficulty.map((d) => ({
                ...d,
                label: t(`difficulty.${d.label}`),
              }))}
              emptyLabel={t('stats.noData')}
            />
          </div>
          <div className="rounded-xl border border-leaf-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-soil-900">{t('stats.byLight')}</h3>
            <BreakdownBar
              items={stats.byLight.map((d) => ({
                ...d,
                label: t(`light.${d.label}`),
              }))}
              emptyLabel={t('stats.noData')}
            />
          </div>
          <div className="rounded-xl border border-leaf-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-soil-900">{t('stats.byWateringNeed')}</h3>
            <BreakdownBar
              items={stats.byWateringNeed.map((d) => ({
                ...d,
                label: t(`watering.${d.label}`),
              }))}
              emptyLabel={t('stats.noData')}
            />
          </div>
          <div className="rounded-xl border border-leaf-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-soil-900">{t('stats.bySubstrate')}</h3>
            <BreakdownBar items={stats.bySubstrate} emptyLabel={t('stats.noData')} />
          </div>
          <div className="rounded-xl border border-leaf-200 bg-white p-5 shadow-sm sm:col-span-2">
            <h3 className="mb-4 font-semibold text-soil-900">{t('stats.byLocation')}</h3>
            <BreakdownBar items={stats.byLocation} emptyLabel={t('stats.noData')} />
          </div>
        </div>
      )}
    </div>
  );
}
