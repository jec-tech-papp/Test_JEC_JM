"use client";

import { useState, useEffect } from "react";
import { Calendar, Bell, Check, Clock, Droplets, Plus, AlertCircle } from "lucide-react";
import { format, isPast, isToday, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { calculateFertilizerDose, cn } from "@/lib/utils";

interface Schedule {
  id: string;
  fertilizerName: string;
  fertilizerNPK: string | null;
  doseMLPerLiter: number;
  frequencyDays: number;
  nextDueDate: string;
  isActive: boolean;
  userPlant: {
    id: string;
    nickname: string | null;
    potVolumeLiters: number;
    plant: {
      commonName: string;
      scientificName: string;
    };
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface UserPlant {
  id: string;
  nickname: string | null;
  potVolumeLiters: number;
  plant: {
    commonName: string;
    fertilizerType: string;
    fertilizerNPK: string;
    fertilizerDoseMLPerLiter: number;
    fertilizerFreqDays: number;
  };
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"schedules" | "notifications">("schedules");

  // Form state
  const [selectedPlantId, setSelectedPlantId] = useState("");
  const [fertilizerName, setFertilizerName] = useState("");
  const [fertilizerNPK, setFertilizerNPK] = useState("");
  const [doseMLPerLiter, setDoseMLPerLiter] = useState("1");
  const [frequencyDays, setFrequencyDays] = useState("14");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [schedulesRes, notificationsRes, plantsRes] = await Promise.all([
      fetch("/api/fertilizer/schedule"),
      fetch("/api/notifications"),
      fetch("/api/portfolio"),
    ]);

    const schedulesData = await schedulesRes.json();
    const notifData = await notificationsRes.json();
    const plantsData = await plantsRes.json();

    setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
    setNotifications(Array.isArray(notifData) ? notifData : []);
    setUserPlants(Array.isArray(plantsData) ? plantsData : []);
    setLoading(false);
  }

  async function markNotificationRead(id: string) {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  async function handleCreateSchedule(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    await fetch("/api/fertilizer/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userPlantId: selectedPlantId,
        fertilizerName,
        fertilizerNPK: fertilizerNPK || null,
        doseMLPerLiter: parseFloat(doseMLPerLiter),
        frequencyDays: parseInt(frequencyDays),
      }),
    });

    setShowAddForm(false);
    setSelectedPlantId("");
    setFertilizerName("");
    setFertilizerNPK("");
    setDoseMLPerLiter("1");
    setFrequencyDays("14");
    setSubmitting(false);
    fetchData();
  }

  function handlePlantSelect(plantId: string) {
    setSelectedPlantId(plantId);
    const plant = userPlants.find((p) => p.id === plantId);
    if (plant) {
      setFertilizerName(plant.plant.fertilizerType);
      setFertilizerNPK(plant.plant.fertilizerNPK);
      setDoseMLPerLiter(String(plant.plant.fertilizerDoseMLPerLiter));
      setFrequencyDays(String(plant.plant.fertilizerFreqDays));
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendrier & Notifications</h1>
          <p className="text-gray-600 mt-1">Gérez vos plannings d&apos;engrais et notifications</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau planning
        </button>
      </div>

      {/* Add schedule form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Créer un planning d&apos;engrais</h2>
          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plante</label>
              <select
                value={selectedPlantId}
                onChange={(e) => handlePlantSelect(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="">Sélectionner une plante...</option>
                {userPlants.map((up) => (
                  <option key={up.id} value={up.id}>
                    {up.nickname || up.plant.commonName} ({up.potVolumeLiters}L)
                  </option>
                ))}
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Engrais</label>
                <input
                  type="text"
                  value={fertilizerName}
                  onChange={(e) => setFertilizerName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Ex: Engrais liquide plantes vertes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NPK</label>
                <input
                  type="text"
                  value={fertilizerNPK}
                  onChange={(e) => setFertilizerNPK(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Ex: 10-10-10"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dose (ml/L d&apos;eau)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={doseMLPerLiter}
                  onChange={(e) => setDoseMLPerLiter(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence (jours)</label>
                <input
                  type="number"
                  min="1"
                  value={frequencyDays}
                  onChange={(e) => setFrequencyDays(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Création..." : "Créer le planning"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab("schedules")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "schedules" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Calendar className="h-4 w-4 inline mr-2" />
          Plannings ({schedules.length})
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors relative",
            activeTab === "notifications" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Bell className="h-4 w-4 inline mr-2" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : activeTab === "schedules" ? (
        <SchedulesList schedules={schedules} />
      ) : (
        <NotificationsList
          notifications={notifications}
          onMarkRead={markNotificationRead}
        />
      )}
    </div>
  );
}

function SchedulesList({ schedules }: { schedules: Schedule[] }) {
  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
        <Calendar className="h-16 w-16 text-purple-200 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun planning</h2>
        <p className="text-gray-600">Créez un planning d&apos;engrais pour vos plantes</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {schedules.map((schedule) => {
        const dueDate = new Date(schedule.nextDueDate);
        const overdue = isPast(dueDate) && !isToday(dueDate);
        const dueToday = isToday(dueDate);
        const daysUntil = differenceInDays(dueDate, new Date());

        const waterML = schedule.userPlant.potVolumeLiters * 300;
        const doseML = Math.round(schedule.doseMLPerLiter * (waterML / 1000) * 100) / 100;

        return (
          <div
            key={schedule.id}
            className={cn(
              "bg-white rounded-xl border p-5 transition-shadow hover:shadow-sm",
              overdue ? "border-red-200 bg-red-50/50" : dueToday ? "border-amber-200 bg-amber-50/50" : "border-stone-200"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                overdue ? "bg-red-100" : dueToday ? "bg-amber-100" : "bg-purple-100"
              )}>
                {overdue ? (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                ) : dueToday ? (
                  <Clock className="h-6 w-6 text-amber-600" />
                ) : (
                  <Droplets className="h-6 w-6 text-purple-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {schedule.userPlant.nickname || schedule.userPlant.plant.commonName}
                </h3>
                <p className="text-sm text-gray-600">
                  {schedule.fertilizerName} {schedule.fertilizerNPK && `(${schedule.fertilizerNPK})`}
                </p>
                <p className="text-xs text-gray-500">
                  Dose: {doseML}ml dans {waterML}ml d&apos;eau • Tous les {schedule.frequencyDays}j
                </p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-sm font-medium",
                  overdue ? "text-red-600" : dueToday ? "text-amber-600" : "text-gray-600"
                )}>
                  {overdue
                    ? `En retard de ${Math.abs(daysUntil)}j`
                    : dueToday
                    ? "Aujourd'hui"
                    : `Dans ${daysUntil}j`}
                </p>
                <p className="text-xs text-gray-400">
                  {format(dueDate, "dd MMM yyyy", { locale: fr })}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NotificationsList({
  notifications,
  onMarkRead,
}: {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}) {
  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
        <Bell className="h-16 w-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune notification</h2>
        <p className="text-gray-600">Vous serez notifié quand il sera temps de fertiliser vos plantes</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={cn(
            "bg-white rounded-xl border p-4 flex items-start gap-3",
            notif.isRead ? "border-stone-200 opacity-60" : "border-purple-200 bg-purple-50/30"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
            notif.type === "fertilizer" ? "bg-purple-100" : "bg-blue-100"
          )}>
            <Droplets className={cn("h-4 w-4", notif.type === "fertilizer" ? "text-purple-600" : "text-blue-600")} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm">{notif.title}</h4>
            <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
            <p className="text-xs text-gray-400 mt-1">
              {format(new Date(notif.createdAt), "dd MMM yyyy à HH:mm", { locale: fr })}
            </p>
          </div>
          {!notif.isRead && (
            <button
              onClick={() => onMarkRead(notif.id)}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex-shrink-0"
              title="Marquer comme lu"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
