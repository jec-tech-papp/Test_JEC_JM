// Literal-union "enums" persisted as TEXT in SQLite.
// Keep these in sync with prisma/schema.prisma comments.

export const LIGHT_LEVELS = [
  "LOW",
  "MEDIUM_LOW",
  "MEDIUM",
  "BRIGHT_INDIRECT",
  "DIRECT_SUN",
] as const;
export type LightLevel = (typeof LIGHT_LEVELS)[number];

export const HUMIDITY_LEVELS = ["LOW", "AVERAGE", "HIGH", "VERY_HIGH"] as const;
export type HumidityLevel = (typeof HUMIDITY_LEVELS)[number];

export const FEEDER_LEVELS = ["LIGHT", "MEDIUM", "HEAVY"] as const;
export type FeederLevel = (typeof FEEDER_LEVELS)[number];

export const DIFFICULTIES = ["EASY", "MODERATE", "ADVANCED"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const CARE_EVENT_TYPES = [
  "FERTILIZE",
  "WATER",
  "REPOT",
  "PRUNE",
  "TREATMENT",
  "NOTE",
] as const;
export type CareEventType = (typeof CARE_EVENT_TYPES)[number];

export const NOTIFICATION_STATUSES = [
  "PENDING",
  "SENT",
  "DISMISSED",
  "DONE",
] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

// ─────────────────────────────────────────────────────────────────────────────
// Human-friendly labels (FR)
// ─────────────────────────────────────────────────────────────────────────────

export const lightLabel: Record<LightLevel, string> = {
  LOW: "Faible (loin de la fenêtre)",
  MEDIUM_LOW: "Faible à moyenne",
  MEDIUM: "Moyenne (lumière indirecte)",
  BRIGHT_INDIRECT: "Lumineuse indirecte",
  DIRECT_SUN: "Plein soleil",
};

export const humidityLabel: Record<HumidityLevel, string> = {
  LOW: "Faible (30–40 %)",
  AVERAGE: "Moyenne (40–55 %)",
  HIGH: "Élevée (55–70 %)",
  VERY_HIGH: "Très élevée (>70 %)",
};

export const feederLabel: Record<FeederLevel, string> = {
  LIGHT: "Faible — sensible aux engrais",
  MEDIUM: "Modéré",
  HEAVY: "Gourmand en engrais",
};

export const difficultyLabel: Record<Difficulty, string> = {
  EASY: "Facile",
  MODERATE: "Intermédiaire",
  ADVANCED: "Expert",
};

export const careEventLabel: Record<CareEventType, string> = {
  FERTILIZE: "Fertilisation",
  WATER: "Arrosage",
  REPOT: "Rempotage",
  PRUNE: "Taille",
  TREATMENT: "Traitement",
  NOTE: "Note",
};

export function isLightLevel(v: unknown): v is LightLevel {
  return typeof v === "string" && (LIGHT_LEVELS as readonly string[]).includes(v);
}
export function isHumidity(v: unknown): v is HumidityLevel {
  return typeof v === "string" && (HUMIDITY_LEVELS as readonly string[]).includes(v);
}
export function isFeeder(v: unknown): v is FeederLevel {
  return typeof v === "string" && (FEEDER_LEVELS as readonly string[]).includes(v);
}
export function isDifficulty(v: unknown): v is Difficulty {
  return typeof v === "string" && (DIFFICULTIES as readonly string[]).includes(v);
}
export function isCareEventType(v: unknown): v is CareEventType {
  return typeof v === "string" && (CARE_EVENT_TYPES as readonly string[]).includes(v);
}
