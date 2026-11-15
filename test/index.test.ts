import { describe, expect, expectTypeOf, it, vi } from "vitest";

import {
  ANSI_CHARACTERS,
  createVolapyk,
  createVolapykChunks,
  createVolapykText,
  inferCJK,
} from "../src";

export const CJK_CHARACTERS = "안녕하세요こんにちは你好你好吗";

describe("createVolapyk", () => {
  it("should return a string of length 100 by default", () => {
    const result = createVolapyk({
      type: "text",
    });
    expect(result.split(" ")).toHaveLength(100);
    expect(result).toBeTypeOf("string");
  });

  it('should return an array of strings if type is "chunks"', () => {
    const result = createVolapyk({ type: "chunks" });
    expect(Array.isArray(result)).toBe(true);
    expect(result.every((chunk) => typeof chunk === "string")).toBe(true);
  });

  it('should return a string with words separated by spaces if type is "text"', () => {
    const result = createVolapyk({ type: "text" });
    expect(result).toBeTypeOf("string");
    expect(result.split(" ")).toHaveLength(100);
  });

  it("should use the provided charset if specified", () => {
    const charset = "abc";
    const result = createVolapyk({ chars: charset, type: "text" });
    expect(
      result.split(" ").every((word) => word.split("").every((char) => charset.includes(char))),
    ).toBe(true);
  });

  it('should use ANSI characters if "preset:ansi" is specified as charset', () => {
    const result = createVolapyk({ chars: "preset:ansi", type: "text" });
    expect(
      result
        .split(" ")
        .every((word) => word.split("").every((char) => ANSI_CHARACTERS.includes(char))),
    ).toBe(true);
  });

  it("should use the provided number of words if specified", () => {
    const words = 50;
    const result = createVolapyk({ words, type: "text" });
    expect(result.split(" ")).toHaveLength(words);
  });
});

describe("createVolapyk fallback behavior", () => {
  it.each([undefined, 0, Number.NaN])("keeps the default count for %s words", (words) => {
    const result = createVolapykText({ chars: "a", words, oneCharPerWord: true });
    expect(result).toBe("a".repeat(100));
  });

  it("falls back to text for unknown output modes", () => {
    expect(createVolapyk({ type: "unknown", chars: "a", words: 3, oneCharPerWord: true })).toBe(
      "aaa",
    );
  });

  it("preserves an explicit false for CJK character handling", () => {
    const result = createVolapykText({ chars: CJK_CHARACTERS, words: 3, oneCharPerWord: false });
    expect(result.split(" ")).toHaveLength(3);
  });

  it("splits chunks after every 10th word", () => {
    // 0.5 gives words of floor(0.5 * 10) + 1 = 6 characters.
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);
    try {
      const result = createVolapykChunks({ chars: "a", words: 12, oneCharPerWord: false });
      const word = "aaaaaa";
      expect(result).toEqual([Array.from({ length: 10 }, () => word).join(" "), `${word} ${word}`]);
    } finally {
      random.mockRestore();
    }
  });
});

describe("inferCJK", () => {
  it.each(["", "abc"])("does not classify %s as CJK", (characters) => {
    expect(inferCJK(characters)).toBe(false);
  });

  it.each(["漢", "안", "あ", "\u{20000}"])("recognizes the code point in %s", (characters) => {
    expect(inferCJK(characters)).toBe(true);
  });
});

describe("createVolapyk return types", () => {
  it('should return a string if type is "text"', () => {
    const result = createVolapyk({ type: "text" });
    expect(result).toBeTypeOf("string");
    expectTypeOf(result).toEqualTypeOf<string>();
  });

  it('should return an array of strings if type is "chunks"', () => {
    const result = createVolapyk({ type: "chunks" });
    expect(Array.isArray(result)).toBe(true);
    expect(result.every((chunk) => typeof chunk === "string")).toBe(true);
    expectTypeOf(result).toEqualTypeOf<string[]>();
  });

  it('should return string | string[] if type is neither "text" nor "chunks"', () => {
    // type can't be inferred
    const type: string = "text";

    const result = createVolapyk({
      type,
    });
    expectTypeOf(result).toEqualTypeOf<string | string[]>();
  });
});

describe("createVolapyk character handling", () => {
  it("should infer `oneCharPerWord` value if not specified", () => {
    const length = 10;
    const result = createVolapyk({
      type: "text",
      chars: CJK_CHARACTERS,
      words: length,
    });

    expect(result).toBeTypeOf("string");
    expect(result.length).toBe(length);
  });

  it("should use `oneCharPerWord`", () => {
    const length = 10;
    const result = createVolapyk({
      type: "text",
      oneCharPerWord: true,
      words: length,
    });

    expect(result).toBeTypeOf("string");
    expect(result.length).toBe(length);
  });
});

describe("createVolapykChunks", () => {
  it("should return an array of strings with length equal to the number of chunks requested", () => {
    const result = createVolapykChunks({ words: 100, chars: "abc" });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(10);
    expect(result.every((chunk) => typeof chunk === "string")).toBe(true);
  });

  it("should return an array of strings with length equal to the number of words requested divided by the number of chunks requested", () => {
    const result = createVolapykChunks({ words: 100, chars: "abc" });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(10);
    expect(result.every((chunk) => typeof chunk === "string")).toBe(true);
    expect(result.reduce((acc, chunk) => acc + chunk.split(" ").length, 0)).toBe(100);
  });

  it("should use the provided charset if specified", () => {
    const charset = "abc";
    const result = createVolapykChunks({ words: 100, chars: charset });
    expect(
      result.every((chunk) =>
        chunk.split(" ").every((word) => word.split("").every((char) => charset.includes(char))),
      ),
    ).toBe(true);
  });

  it('should use ANSI characters if "preset:ansi" is specified as charset', () => {
    const result = createVolapykChunks({ words: 100, chars: "preset:ansi" });
    expect(
      result.every((chunk) =>
        chunk
          .split(" ")
          .every((word) => word.split("").every((char) => ANSI_CHARACTERS.includes(char))),
      ),
    ).toBe(true);
  });

  it("should use the provided number of words if specified", () => {
    const words = 50;
    const result = createVolapykChunks({ words, chars: "abc" });
    expect(result.reduce((acc, chunk) => acc + chunk.split(" ").length, 0)).toBe(words);
  });
});

describe("createVolapykChunks character handling", () => {
  it("should infer `oneCharPerWord` value if not specified", () => {
    const length = 10;
    const result = createVolapykChunks({
      chars: CJK_CHARACTERS,
      words: length,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result).toBeTypeOf("object");
    expect(result.every((chunk) => chunk.length === length)).toBe(true);
  });

  it("should use `oneCharPerWord`", () => {
    const length = 10;
    const result = createVolapykChunks({
      oneCharPerWord: true,
      words: length,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result).toBeTypeOf("object");
    expect(result.every((chunk) => chunk.length === length)).toBe(true);
  });
});

describe("createVolapykText", () => {
  it("should return a string of length 100 by default", () => {
    const result = createVolapykText({});
    expect(result.split(" ")).toHaveLength(100);
    expect(result).toBeTypeOf("string");
  });

  it("should use the provided number of words if specified", () => {
    const words = 50;
    const result = createVolapykText({ words });

    expect(result.split(" ")).toHaveLength(words);
    expect(result).toBeTypeOf("string");
  });

  it("should use the provided charset if specified", () => {
    const charset = "abc";
    const result = createVolapykText({ chars: charset });

    expect(result).toBeTypeOf("string");
    expect(
      result.split(" ").every((word) => word.split("").every((char) => charset.includes(char))),
    ).toBe(true);
  });

  it('should use ANSI characters if "preset:ansi" is specified as charset', () => {
    const result = createVolapykText({ chars: "preset:ansi" });

    expect(result).toBeTypeOf("string");
    expect(
      result
        .split(" ")
        .every((word) => word.split("").every((char) => ANSI_CHARACTERS.includes(char))),
    ).toBe(true);
  });
});

describe("createVolapykText character handling", () => {
  it("should infer `oneCharPerWord` value if not specified", () => {
    const length = 10;
    const result = createVolapykText({
      chars: CJK_CHARACTERS,
      words: length,
    });

    expect(result).toBeTypeOf("string");
    expect(result.length).toBe(length);
    expect(result.split("").every((char) => CJK_CHARACTERS.includes(char))).toBe(true);
  });

  it("should use `oneCharPerWord`", () => {
    const length = 10;
    const result = createVolapykText({
      oneCharPerWord: true,
      words: length,
    });

    expect(result).toBeTypeOf("string");
    expect(result.length).toBe(length);
    expect(result.split("").every((char) => ANSI_CHARACTERS.includes(char))).toBe(true);
  });
});
