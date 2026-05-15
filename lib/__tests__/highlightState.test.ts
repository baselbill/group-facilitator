import { describe, it, expect } from "vitest";
import { applyHighlight, deserializeHighlights } from "../highlightState";
import type { HighlightMap } from "../types";

describe("applyHighlight", () => {
  const baseMsg = { type: "highlight" as const, userId: "u1", questionId: "q1", wordIndex: 3, active: true };

  it("adds a highlight for a new questionId", () => {
    const result = applyHighlight(new Map(), baseMsg);
    expect(result.get("q1")?.get(3)?.has("u1")).toBe(true);
  });

  it("adds a second user to an existing word", () => {
    const initial: HighlightMap = new Map([["q1", new Map([[3, new Set(["u2"])]])]]);
    const result = applyHighlight(initial, baseMsg);
    expect(result.get("q1")?.get(3)?.has("u1")).toBe(true);
    expect(result.get("q1")?.get(3)?.has("u2")).toBe(true);
  });

  it("removes a highlight when active is false", () => {
    const initial: HighlightMap = new Map([["q1", new Map([[3, new Set(["u1", "u2"])]])]]);
    const result = applyHighlight(initial, { ...baseMsg, active: false });
    expect(result.get("q1")?.get(3)?.has("u1")).toBe(false);
    expect(result.get("q1")?.get(3)?.has("u2")).toBe(true);
  });

  it("is immutable — does not mutate the previous map", () => {
    const initial: HighlightMap = new Map();
    applyHighlight(initial, baseMsg);
    expect(initial.size).toBe(0);
  });

  it("no-ops when removing a user who has no highlight", () => {
    const initial: HighlightMap = new Map([["q1", new Map([[3, new Set(["u2"])]])]]);
    const result = applyHighlight(initial, { ...baseMsg, active: false });
    expect(result.get("q1")?.get(3)?.has("u2")).toBe(true);
    expect(result.get("q1")?.get(3)?.size).toBe(1);
  });
});

describe("deserializeHighlights", () => {
  it("converts a plain object to HighlightMap", () => {
    const raw = { q1: { 3: ["u1", "u2"], 7: ["u3"] } };
    const result = deserializeHighlights(raw);
    expect(result.get("q1")?.get(3)?.has("u1")).toBe(true);
    expect(result.get("q1")?.get(3)?.has("u2")).toBe(true);
    expect(result.get("q1")?.get(7)?.has("u3")).toBe(true);
  });

  it("handles an empty object", () => {
    const result = deserializeHighlights({});
    expect(result.size).toBe(0);
  });

  it("handles a question with no highlights", () => {
    const raw = { q1: {} };
    const result = deserializeHighlights(raw);
    expect(result.get("q1")?.size).toBe(0);
  });

  it("converts string keys to number word indices", () => {
    const raw = { q1: { 0: ["u1"] } };
    const result = deserializeHighlights(raw);
    expect(result.get("q1")?.get(0)?.has("u1")).toBe(true);
    expect(result.get("q1")?.get("0" as unknown as number)).toBeUndefined();
  });
});
