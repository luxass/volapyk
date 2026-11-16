/**
 * Regression tests for https://github.com/luxass/volapyk/issues/89
 *
 * - Supplementary-plane characters (emoji, CJK extensions) produced lone surrogates.
 * - `inferCJK` never matched the 0x20000..0x2EBE0 CJK extension range.
 * - `"chunks"` mode put 11 words in the first chunk and appended `""` when `words % 10 === 1`.
 * - `createVolapyk` mutated the passed `options` object.
 */
import { describe, expect, it } from "vitest";

import { createVolapyk, createVolapykChunks, createVolapykText, inferCJK } from "../src";

// In unicode mode, a surrogate class only matches unpaired (lone) surrogates.
const LONE_SURROGATE = /[\uD800-\uDFFF]/u;

function wordCounts(chunks: string[]): number[] {
  return chunks.map((chunk) => chunk.split(" ").length);
}

describe("issue #89: characters outside the Basic Multilingual Plane", () => {
  it("repeats a single emoji without lone surrogates", () => {
    const result = createVolapykText({ chars: "😀", words: 5, oneCharPerWord: true });
    expect(result).not.toMatch(LONE_SURROGATE);
    expect(result).toBe("😀😀😀😀😀");
  });

  it("builds words from whole emoji", () => {
    const charset = "😀🎉🚀";
    const result = createVolapykText({ chars: charset, words: 20 });

    expect(result).not.toMatch(LONE_SURROGATE);
    expect(result.split(" ")).toHaveLength(20);
    expect(
      result.split(" ").every((word) => Array.from(word).every((char) => charset.includes(char))),
    ).toBe(true);
  });

  it("keeps whole characters in chunks", () => {
    const result = createVolapykChunks({ chars: "😀🎉🚀", words: 30 });
    expect(result.every((chunk) => !LONE_SURROGATE.test(chunk))).toBe(true);
  });

  it("keeps multi-code-point graphemes together", () => {
    const family = "👨‍👩‍👧";
    const result = createVolapykText({ chars: family, words: 3, oneCharPerWord: true });
    expect(result).toBe(family.repeat(3));
  });

  it("infers CJK for CJK extension ideographs and keeps them whole", () => {
    const charset = "𠀀𠀁𠀂";
    expect(inferCJK(charset)).toBe(true);

    const result = createVolapykText({ chars: charset, words: 4 });
    expect(result).not.toMatch(LONE_SURROGATE);
    expect(Array.from(result)).toHaveLength(4);
  });
});

describe("issue #89: chunk word counts", () => {
  it.each([
    [30, [10, 10, 10]],
    [11, [10, 1]],
    [10, [10]],
    [9, [9]],
    [1, [1]],
    [25, [10, 10, 5]],
  ])("splits %i words into %j", (words, expected) => {
    const result = createVolapykChunks({ words, chars: "abc" });
    expect(wordCounts(result)).toEqual(expected);
  });

  it("never produces empty chunks", () => {
    for (let words = 1; words <= 50; words++) {
      const result = createVolapykChunks({ words, chars: "abc" });
      expect(result.every((chunk) => chunk !== "")).toBe(true);
    }
  });
});

describe("issue #89: options are not mutated", () => {
  it("leaves the caller's options object unchanged", () => {
    const options = { chars: "abc", words: 5 };
    createVolapyk(options);
    expect(options).toEqual({ chars: "abc", words: 5 });
  });

  it("leaves an unknown type unchanged", () => {
    const options = { chars: "abc", words: 5, type: "unknown" };
    createVolapyk(options);
    expect(options.type).toBe("unknown");
  });

  it("re-infers CJK handling when the same options object is reused", () => {
    const options: { chars: string; words: number } = { chars: "abc", words: 5 };
    createVolapyk(options);

    options.chars = "你好";
    const result = createVolapyk(options);

    expect(options).not.toHaveProperty("oneCharPerWord");
    expect(result).not.toContain(" ");
  });

  it("does not leak inferred state between calls without options", () => {
    createVolapyk();
    const result = createVolapyk({ chars: "你好", words: 5 });
    expect(result).toHaveLength(5);
    expect(result).not.toContain(" ");
  });
});
