import { lessons, pointsPerLesson } from "./lessons.mjs";

export const storageKey = "industrylab.progress.v1";
const knownIds = new Set(lessons.map(lesson => lesson.id));

export function readBackup(data) {
  if (data?.app !== "IndustryLab" || data.version !== 1 || !Array.isArray(data.completed)) {
    throw new Error("Bitte wähle eine IndustryLab-Sicherung im JSON-Format.");
  }

  const completed = new Map();
  for (const entry of data.completed) {
    if (!knownIds.has(entry?.id) || typeof entry.at !== "string"
        || !/^\d{4}-\d{2}-\d{2}T/.test(entry.at) || !Number.isFinite(Date.parse(entry.at))) {
      throw new Error("Die Sicherung enthält einen ungültigen Aufgabenabschluss.");
    }
    const at = new Date(entry.at).toISOString();
    const previous = completed.get(entry.id);
    if (!previous || at < previous.at) completed.set(entry.id, { id: entry.id, at });
  }
  return [...completed.values()].sort((first, second) => first.at.localeCompare(second.at));
}

export function backupFor(completed) {
  return { app: "IndustryLab", version: 1, completed };
}

export function mergeProgress(first, second) {
  return readBackup(backupFor([...first, ...second]));
}

export function totalPoints(completed) {
  return completed.length * pointsPerLesson;
}
