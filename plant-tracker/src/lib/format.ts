export function formatRelative(date: Date, now: Date = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  const abs = Math.abs(diffMs);
  const days = Math.round(abs / 86_400_000);
  const hours = Math.round(abs / 3_600_000);
  const minutes = Math.round(abs / 60_000);

  if (abs < 60_000) return diffMs >= 0 ? "à l'instant" : "il y a un instant";
  if (minutes < 60)
    return diffMs >= 0 ? `dans ${minutes} min` : `il y a ${minutes} min`;
  if (hours < 24) return diffMs >= 0 ? `dans ${hours} h` : `il y a ${hours} h`;
  if (days < 60)
    return diffMs >= 0 ? `dans ${days} j` : `il y a ${days} j`;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
