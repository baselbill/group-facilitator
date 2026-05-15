import type { HighlightMap } from "./types";
import type { HighlightMsg } from "../party/server";

export function applyHighlight(prev: HighlightMap, msg: HighlightMsg): HighlightMap {
  const next = new Map(prev);
  if (!next.has(msg.questionId)) next.set(msg.questionId, new Map());
  const wordMap = new Map(next.get(msg.questionId)!);
  const users = new Set(wordMap.get(msg.wordIndex) ?? []);
  if (msg.active) users.add(msg.userId);
  else users.delete(msg.userId);
  wordMap.set(msg.wordIndex, users);
  next.set(msg.questionId, wordMap);
  return next;
}

export function deserializeHighlights(
  raw: Record<string, Record<number, string[]>>
): HighlightMap {
  const map: HighlightMap = new Map();
  for (const [qId, words] of Object.entries(raw)) {
    const wordMap = new Map<number, Set<string>>();
    for (const [widxStr, users] of Object.entries(words)) {
      wordMap.set(Number(widxStr), new Set(users));
    }
    map.set(qId, wordMap);
  }
  return map;
}
