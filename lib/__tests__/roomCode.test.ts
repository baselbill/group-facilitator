import { describe, it, expect } from "vitest";
import { generateRoomCode } from "../room";

const ALLOWED = new Set("ABCDEFGHJKLMNPQRSTUVWXYZ23456789");
const FORBIDDEN = new Set("01OI");

describe("generateRoomCode", () => {
  it("returns exactly 4 characters", () => {
    expect(generateRoomCode()).toHaveLength(4);
  });

  it("only uses characters from the allowed charset", () => {
    for (let i = 0; i < 200; i++) {
      for (const ch of generateRoomCode()) {
        expect(ALLOWED.has(ch), `unexpected char: ${ch}`).toBe(true);
      }
    }
  });

  it("never includes confusable characters (0, 1, O, I)", () => {
    for (let i = 0; i < 200; i++) {
      for (const ch of generateRoomCode()) {
        expect(FORBIDDEN.has(ch), `forbidden char: ${ch}`).toBe(false);
      }
    }
  });

  it("returns only uppercase characters", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateRoomCode()).toMatch(/^[A-Z0-9]+$/);
    }
  });
});
