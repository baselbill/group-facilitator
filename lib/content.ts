import { StudySchema, ValidatedStudy } from "./schema";
import rawData from "../data/heidelberg.json";

let validated: ValidatedStudy | null = null;
let loadError: string | null = null;

export function getStudy(): { study: ValidatedStudy | null; error: string | null } {
  if (validated) return { study: validated, error: null };
  if (loadError) return { study: null, error: loadError };

  const result = StudySchema.safeParse(rawData);
  if (!result.success) {
    loadError = "Content unavailable — check your connection or reload.";
    console.error("Content validation failed:", result.error);
    return { study: null, error: loadError };
  }

  validated = result.data;
  return { study: validated, error: null };
}

export function getSession(study: ValidatedStudy, sessionId: string) {
  return study.sessions.find((s) => s.id === sessionId) ?? null;
}
