import { describe, it, expect } from "vitest";
import { tokenize } from "../tokenize";

describe("tokenize", () => {
  it("assigns stable word indices to each word", () => {
    const tokens = tokenize("Hello world");
    const words = tokens.filter((t) => t.isWord);
    expect(words[0]).toEqual({ text: "Hello", isWord: true, index: 0 });
    expect(words[1]).toEqual({ text: "world", isWord: true, index: 1 });
  });

  it("assigns index -1 to whitespace tokens", () => {
    const tokens = tokenize("Hello world");
    const spaces = tokens.filter((t) => !t.isWord);
    expect(spaces.every((t) => t.index === -1)).toBe(true);
  });

  it("preserves punctuation attached to words", () => {
    const tokens = tokenize("grace, mercy");
    const words = tokens.filter((t) => t.isWord);
    expect(words[0].text).toBe("grace,");
    expect(words[1].text).toBe("mercy");
  });

  it("handles empty string", () => {
    expect(tokenize("")).toEqual([]);
  });

  it("handles a single word", () => {
    const tokens = tokenize("Amen");
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toEqual({ text: "Amen", isWord: true, index: 0 });
  });

  it("handles leading/trailing whitespace", () => {
    const tokens = tokenize("  grace  ");
    const words = tokens.filter((t) => t.isWord);
    expect(words).toHaveLength(1);
    expect(words[0].index).toBe(0);
  });

  it("word indices are contiguous integers starting at 0", () => {
    const tokens = tokenize("the grace of God");
    const indices = tokens.filter((t) => t.isWord).map((t) => t.index);
    expect(indices).toEqual([0, 1, 2, 3]);
  });

  it("produces identical indices for the same text — deterministic across calls", () => {
    const text = "What is your only comfort in life and in death?";
    const first = tokenize(text).filter((t) => t.isWord).map((t) => t.index);
    const second = tokenize(text).filter((t) => t.isWord).map((t) => t.index);
    expect(first).toEqual(second);
  });
});
