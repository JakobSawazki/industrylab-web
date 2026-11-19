import { lessons, pointsPerLesson } from "./lessons.mjs";
import { responseFields } from "./unterricht.mjs";

export const responsePrefix = "industrylab.response.v1.";
export const responseLimit = 1500;
export const responseIds = Object.entries(responseFields).flatMap(([unit, fields]) =>
  fields.map(([key]) => unit + "-" + key));
const knownResponses = new Set(responseIds);

export function readResponses(data = {}) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Die Antworten in der Sicherung sind ungültig.");
  }
  const responses = {};
  for (const [id, answer] of Object.entries(data)) {
    if (!knownResponses.has(id)) continue;
    if (typeof answer !== "string" || answer.length > responseLimit) {
      throw new Error("Eine Antwort in der Sicherung ist ungültig oder zu lang.");
    }
    if (answer.trim()) responses[id] = answer;
  }
  return responses;
}


export const storageKey = "industrylab.progress.v1";
export const completionPrefix = storageKey + ".";
export const profileStorageKey = "industrylab.profile.v1";
const knownIds = new Set(lessons.map(lesson => lesson.id));

function isCompletionTime(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
}

export function readBackup(data) {
  if (data?.app !== "IndustryLab" || data.version !== 1 || !Array.isArray(data.completed)) {
    throw new Error("Bitte wähle eine IndustryLab-Sicherung im JSON-Format.");
  }

  const completed = new Map();
  for (const entry of data.completed) {
    if (!knownIds.has(entry?.id) || !isCompletionTime(entry.at)) {
      throw new Error("Die Sicherung enthält einen ungültigen Aufgabenabschluss.");
    }
    const at = new Date(entry.at).toISOString();
    const previous = completed.get(entry.id);
    if (!previous || at < previous.at) completed.set(entry.id, { id: entry.id, at });
  }
  return [...completed.values()].sort((first, second) => first.at.localeCompare(second.at));
}

export function readStoredProgress(storage) {
  const raw = storage.getItem(storageKey);
  let legacy = [];
  let damaged = false;
  if (raw) {
    try {
      legacy = readBackup(JSON.parse(raw));
    } catch {
      damaged = true;
    }
  }
  const individual = [];
  for (const id of knownIds) {
    const at = storage.getItem(completionPrefix + id);
    if (at === null) continue;
    if (isCompletionTime(at)) individual.push({ id, at });
    else damaged = true;
  }
  return { completed: mergeProgress(legacy, individual), damaged };
}

export function writeStoredProgress(storage, entries) {
  for (const { id, at } of entries) {
    const key = completionPrefix + id;
    const previous = storage.getItem(key);
    if (!isCompletionTime(previous) || Date.parse(at) < Date.parse(previous)) storage.setItem(key, at);
  }
}

export function readProfile(data = {}) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Die Profildaten sind ungültig.");
  }

  function readField(key) {
    const value = data[key] ?? "";
    if (typeof value !== "string" || value.length > 24) {
      throw new Error("Kürzel und Klasse dürfen jeweils höchstens 24 Zeichen lang sein.");
    }
    return value.trim();
  }

  return { studentCode: readField("studentCode"), className: readField("className") };
}

export function backupFor(completed, profile, responses) {
  const backup = { app: "IndustryLab", version: 1, completed };
  if (profile) backup.profile = readProfile(profile);
  if (responses) backup.responses = readResponses(responses);
  return backup;
}

export function mergeProgress(first, second) {
  return readBackup(backupFor([...first, ...second]));
}

export function totalPoints(completed) {
  return completed.length * pointsPerLesson;
}
