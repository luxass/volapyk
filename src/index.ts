/** Accepts known output modes and custom strings, which fall back to text. */
export type OutputType = "chunks" | "text" | (string & Record<never, never>);

/** Names the built-in character presets. */
export type Preset = "ansi";

/** Controls the character set, output mode, and number of generated words. */
export interface Options {
  /**
   * The characters to use for the volapyk.
   *
   * Characters are split into user-perceived characters (grapheme clusters),
   * so emoji, flags, and combined accents are never broken apart.
   *
   * @default "preset:ansi"
   */

  chars?: `preset:${Preset}` | (string & Record<never, never>);

  /**
   * The type of the output.
   *
   * @default "text"
   */
  type?: OutputType;

  /**
   * The amount of words to generate.
   *
   * @default 100
   */
  words?: number;

  /**
   * If you are using CJK characters, you should set this to `true`.
   * We will try to infer this automatically, but it's not always possible.
   *
   * @default false
   */
  oneCharPerWord?: boolean;
}

/** Contains the characters used by the default preset. */
export const ANSI_CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789àâéèêôùûçÀÂÉÈÔÙÛÇ";

/** Lists the inclusive Unicode code point ranges used to detect CJK characters. */
export const CJK_CODE_RANGES: ReadonlyArray<readonly [start: number, end: number]> = [
  // Hiragana
  [0x3040, 0x309f],
  // CJK Unified ideographs
  [0x4e00, 0x9fff],
  // Hangul
  [0xac00, 0xd7a3],
  // CJK extensions
  [0x20000, 0x2ebe0],
];

/** The number of words in each chunk when `type` is `"chunks"`. */
const WORDS_PER_CHUNK = 10;

/** The longest word generated when `oneCharPerWord` is off. */
const MAX_WORD_LENGTH = 10;

const DEFAULT_WORD_COUNT = 100;

const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/**
 * Infer if the characters are CJK characters.
 * @param {string} characters - The characters to use
 * @returns {boolean} `true` if any character is a CJK character, `false` if none are.
 */
export function inferCJK(characters: string): boolean {
  // Iterating a string yields full code points, so supplementary-plane
  // characters such as U+20000 are compared as a single value.
  for (const char of characters) {
    const code = char.codePointAt(0);
    if (code === undefined) continue;

    if (CJK_CODE_RANGES.some(([start, end]) => code >= start && code <= end)) {
      return true;
    }
  }

  return false;
}

/** Options after defaults are applied. Never shares state with the caller. */
interface ResolvedOptions {
  type: "chunks" | "text";
  /** The charset split into grapheme clusters, so each entry is one whole character. */
  chars: readonly string[];
  words: number;
  oneCharPerWord: boolean;
}

/** Applies defaults without mutating the caller's options. */
function resolveOptions(options: Options): ResolvedOptions {
  const charset =
    options.chars === undefined || options.chars === "" || options.chars === "preset:ansi"
      ? ANSI_CHARACTERS
      : options.chars;

  // Zero and NaN fall back to the default, like an omitted count.
  const words =
    options.words === undefined || options.words === 0 || Number.isNaN(options.words)
      ? DEFAULT_WORD_COUNT
      : options.words;

  return {
    type: options.type === "chunks" ? "chunks" : "text",
    chars: Array.from(graphemeSegmenter.segment(charset), ({ segment }) => segment),
    words,
    oneCharPerWord: options.oneCharPerWord ?? inferCJK(charset),
  };
}

/** Picks one whole character from the charset. */
function pickChar(chars: readonly string[]): string {
  // `chars` is never empty: an empty charset falls back to ANSI_CHARACTERS.
  return chars[Math.floor(Math.random() * chars.length)]!;
}

/** Generates one word of 1 to MAX_WORD_LENGTH characters. */
function generateWord(chars: readonly string[]): string {
  // `Math.random()` can return 0, so floor + 1 keeps every word non-empty.
  const wordLength = Math.floor(Math.random() * MAX_WORD_LENGTH) + 1;

  let word = "";
  for (let i = 0; i < wordLength; i++) {
    word += pickChar(chars);
  }
  return word;
}

/** Generates the requested number of words. */
function generateWords(chars: readonly string[], count: number): string[] {
  return Array.from({ length: Math.max(0, count) }, () => generateWord(chars));
}

/** Groups words into chunks of WORDS_PER_CHUNK, leaving any remainder in the last chunk. */
function groupIntoChunks(words: readonly string[]): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += WORDS_PER_CHUNK) {
    chunks.push(words.slice(i, i + WORDS_PER_CHUNK).join(" "));
  }
  return chunks;
}

/**
 * Creates volapyk with a return type inferred from the output mode.
 * Unknown output modes fall back to text.
 *
 * The passed `options` object is never modified.
 */
export function createVolapyk<TOptions extends Options>(
  options?: TOptions,
): TOptions["type"] extends "chunks"
  ? string[]
  : TOptions["type"] extends "text"
    ? string
    : string | string[];
export function createVolapyk(options: Options = {}): string | string[] {
  const { type, chars, words, oneCharPerWord } = resolveOptions(options);

  if (oneCharPerWord) {
    let text = "";
    for (let i = 0; i < words; i++) {
      text += pickChar(chars);
    }
    return type === "chunks" ? [text] : text;
  }

  const generatedWords = generateWords(chars, words);
  return type === "chunks" ? groupIntoChunks(generatedWords) : generatedWords.join(" ");
}

/**
 * Create volapyk chunks.
 * @param {Options} [options] options - Options for the volapyk creation
 * @returns {string[]} An array of chunks with up to 10 words each.
 */
export function createVolapykChunks(
  options: Pick<Options, "words" | "chars" | "oneCharPerWord">,
): string[] {
  return createVolapyk({ ...options, type: "chunks" });
}

/**
 * Create volapyk text.
 * @param {Options} [options] options - Options for the volapyk creation
 * @returns {string} A string of volapyk text.
 */
export function createVolapykText(
  options: Pick<Options, "words" | "chars" | "oneCharPerWord">,
): string {
  return createVolapyk({ ...options, type: "text" });
}
