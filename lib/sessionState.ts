"use client";

import { QuestionState, SessionStateMap, StoredQuestionState } from "./types";

const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function storageKey(studyId: string, sessionId: string): string {
  return `gf:${studyId}:${sessionId}`;
}

function questionKey(questionId: string): string {
  return questionId;
}

// In-memory fallback for private browsing / blocked localStorage
const memoryStore: Record<string, SessionStateMap> = {};

function readRaw(key: string): SessionStateMap | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as SessionStateMap;
  } catch {
    return memoryStore[key] ?? null;
  }
}

function writeRaw(key: string, map: SessionStateMap): void {
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    memoryStore[key] = map;
  }
}

function isExpired(entry: StoredQuestionState): boolean {
  return Date.now() - entry.timestamp > TTL_MS;
}

export function readState(
  studyId: string,
  sessionId: string,
  questionId: string
): QuestionState {
  const key = storageKey(studyId, sessionId);
  const map = readRaw(key);
  if (!map) return "pending";

  const entry = map[questionKey(questionId)];
  if (!entry) return "pending";

  if (isExpired(entry)) {
    // Delete stale entry and persist
    const updated = { ...map };
    delete updated[questionKey(questionId)];
    writeRaw(key, updated);
    return "pending";
  }

  return entry.state;
}

export function writeState(
  studyId: string,
  sessionId: string,
  questionId: string,
  state: QuestionState
): void {
  const key = storageKey(studyId, sessionId);
  const map = readRaw(key) ?? {};
  map[questionKey(questionId)] = { state, timestamp: Date.now() };
  writeRaw(key, map);
}

export function readSessionMap(
  studyId: string,
  sessionId: string
): SessionStateMap {
  const key = storageKey(studyId, sessionId);
  return readRaw(key) ?? {};
}

/** Returns the index of the first pending question, or -1 if all are done. */
export function firstPendingIndex(
  studyId: string,
  sessionId: string,
  questionIds: string[]
): number {
  const map = readSessionMap(studyId, sessionId);
  for (let i = 0; i < questionIds.length; i++) {
    const entry = map[questionIds[i]];
    if (!entry || entry.state === "pending" || isExpired(entry)) return i;
  }
  return -1;
}

/** Returns true if this session has any non-pending question state stored. */
export function hasInProgressSession(
  studyId: string,
  sessionId: string
): boolean {
  const map = readSessionMap(studyId, sessionId);
  return Object.values(map).some(
    (e) => e.state !== "pending" && !isExpired(e)
  );
}

export function markSessionDone(studyId: string, sessionId: string): void {
  const key = storageKey(studyId, sessionId);
  const map = readRaw(key) ?? {};
  // Store a sentinel key to indicate the session was completed
  map["__done__"] = { state: "covered", timestamp: Date.now() };
  writeRaw(key, map);
}

export function isSessionDone(studyId: string, sessionId: string): boolean {
  const map = readSessionMap(studyId, sessionId);
  const done = map["__done__"];
  return !!done && !isExpired(done);
}

export function clearInstallBannerDismissed(): void {
  try {
    localStorage.removeItem("gf:install-banner-dismissed");
  } catch {
    // ignore
  }
}

export function getInstallBannerDismissed(): boolean {
  try {
    return localStorage.getItem("gf:install-banner-dismissed") === "1";
  } catch {
    return false;
  }
}

export function setInstallBannerDismissed(): void {
  try {
    localStorage.setItem("gf:install-banner-dismissed", "1");
  } catch {
    // ignore
  }
}
