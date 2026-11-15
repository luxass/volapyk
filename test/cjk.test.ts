/**
 * Tests for CJK handling, found while fixing https://github.com/luxass/volapyk/issues/89
 *
 * - With `oneCharPerWord`, chunk mode returned one chunk however many words you asked for.
 * - `CJK_CODE_RANGES` missed Katakana, CJK punctuation, and several ideograph blocks,
 *   so `inferCJK` returned false for normal Japanese text.
 */
import { describe, expect, it } from "vitest";

import { createVolapyk, createVolapykChunks, inferCJK } from "../src";

function charCounts(chunks: string[]): number[] {
  return chunks.map((chunk) => Array.from(chunk).length);
}

describe("oneCharPerWord in chunk mode", () => {
  it("splits 100 CJK words into 10 chunks, like non-CJK text", () => {
    expect(createVolapykChunks({ chars: "abc", words: 100 })).toHaveLength(10);
    expect(createVolapykChunks({ chars: "你好", words: 100 })).toHaveLength(10);
  });

  it.each([
    [25, [10, 10, 5]],
    [11, [10, 1]],
    [10, [10]],
    [3, [3]],
  ])("splits %i characters into %j", (words, expected) => {
    const result = createVolapyk({ type: "chunks", chars: "你好", words });
    expect(charCounts(result)).toEqual(expected);
  });

  it("does not add spaces inside chunks", () => {
    const result = createVolapykChunks({ chars: "你好", words: 30 });
    expect(result.every((chunk) => !chunk.includes(" "))).toBe(true);
  });

  it("also splits chunks when oneCharPerWord is set explicitly", () => {
    const result = createVolapykChunks({ chars: "abc", words: 20, oneCharPerWord: true });
    expect(charCounts(result)).toEqual([10, 10]);
  });
});

describe("inferCJK ranges", () => {
  // Common in everyday Japanese and Chinese text.
  it.each([
    ["Katakana", "カタカナ"],
    ["a single Katakana character", "ア"],
    ["Katakana Phonetic Extensions", "ㇰ"],
    ["CJK punctuation", "。「」"],
    ["Halfwidth Katakana", "ｶﾀｶﾅ"],
  ])("detects %s: %s", (_name, characters) => {
    expect(inferCJK(characters)).toBe(true);
  });

  // Rare ideographs, several added in Unicode 13 to 15.1.
  it.each([
    ["Extension A (U+3400..U+4DBF)", "\u{3400}"],
    ["Compatibility Ideographs (U+F900..U+FAFF)", "\u{F900}"],
    ["the end of Extension F (U+2EBE1..U+2EBEF)", "\u{2EBEF}"],
    ["Extension I (U+2EBF0..U+2EE5D)", "\u{2EBF0}"],
    ["Compatibility Ideographs Supplement (U+2F800..U+2FA1F)", "\u{2F800}"],
    ["Extension G (U+30000..U+3134A)", "\u{30000}"],
    ["Extension H (U+31350..U+323AF)", "\u{31350}"],
  ])("detects %s", (_name, characters) => {
    expect(inferCJK(characters)).toBe(true);
  });

  it.each([
    ["Latin", "abc"],
    ["Latin with accents", "àâéèê"],
    ["Fullwidth Latin", "ＡＢＣ"],
    ["emoji", "😀🎉"],
  ])("does not detect %s: %s", (_name, characters) => {
    expect(inferCJK(characters)).toBe(false);
  });

  it("generates Katakana as one character per word, without spaces", () => {
    const result = createVolapyk({ type: "text", chars: "アイウエオ", words: 5 });
    expect(result).not.toContain(" ");
    expect(result).toHaveLength(5);
  });
});
