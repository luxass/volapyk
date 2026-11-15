/** Accepts known output modes and custom strings, which fall back to text. */
export type OutputType = "chunks" | "text" | (string & Record<never, never>);

/** Names the built-in character presets. */
export type Preset = "ansi";

/** Controls the character set, output mode, and number of generated words. */
export interface Options {
  /**
   * The characters to use for the volapyk.
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

const DEFAULT_OPTIONS = {
  chars: "preset:ansi",
  type: "text",
  words: 100,
} satisfies Options;

/** Contains the characters used by the default preset. */
export const ANSI_CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789àâéèêôùûçÀÂÉÈÔÙÛÇ";

/** Lists the inclusive Unicode ranges used to detect CJK characters. */
export const CJK_CODE_RANGES = [
  [0x3040, 0x309f],
  // CJK Unified ideographs
  [0x4e00, 0x9fff],
  // Hangul
  [0xac00, 0xd7a3],
  // CJK extensions
  [0x20000, 0x2ebe0],
];

/**
 * Infer if the characters are CJK characters.
 * @param {string} characters - The characters to use
 * @returns {boolean | undefined} `true` if the characters are CJK characters, `false` if they are not.
 */
export function inferCJK(characters: string): boolean | undefined {
  if (characters === "") return false;

  for (const char of characters) {
    const code = char.codePointAt(0);
    if (code === undefined) continue;

    for (const [start, end] of CJK_CODE_RANGES) {
      if (start === undefined || end === undefined) return false;
      if (code >= start && code <= end) {
        return true;
      }
    }
  }

  return false;
}

/** Generates a continuous sequence using one character per word. */
function generateCharacterSequence(charset: string, length: number): string {
  let text = "";
  for (let i = 0; i < length; i++) {
    text += charset[Math.floor(Math.random() * charset.length)];
  }
  return text;
}

/** Generates space-separated words in the existing chunk boundaries. */
function generateVolapykChunks(charset: string, length: number): string[] {
  const chunks: string[] = [];
  let chunk = "";

  for (let i = 0; i < length; i++) {
    const wordLength = Math.ceil(Math.random() * 10);
    for (let j = 0; j < wordLength; j++) {
      chunk += charset[Math.floor(Math.random() * charset.length)];
    }
    chunk += " ";

    if (i !== 0 && i % 10 === 0) {
      if (chunk.endsWith(" ")) chunk = chunk.slice(0, -1);
      chunks.push(chunk);
      chunk = "";
    }
  }
  if (chunk.endsWith(" ")) chunk = chunk.slice(0, -1);
  chunks.push(chunk);

  return chunks;
}

/** Generates random words separated by a single space. */
function generateVolapykText(charset: string, length: number): string {
  let text = "";
  for (let i = 0; i < length; i++) {
    const wordLength = Math.ceil(Math.random() * 10);
    for (let j = 0; j < wordLength; j++) {
      text += charset[Math.floor(Math.random() * charset.length)];
    }
    if (i !== length - 1) text += " ";
  }
  return text;
}

/**
 * Creates volapyk with a return type inferred from the output mode.
 * Unknown output modes fall back to text.
 */
export function createVolapyk<TOptions extends Options>(
  options?: TOptions,
): TOptions["type"] extends "chunks"
  ? string[]
  : TOptions["type"] extends "text"
    ? string
    : string | string[];
export function createVolapyk(options?: Options): string | string[] {
  options ??= DEFAULT_OPTIONS;
  if (options.type !== "chunks" && options.type !== "text") {
    options.type = "text";
  }

  let charset = options.chars;
  if (charset === undefined || charset === "" || charset === "preset:ansi") {
    charset = ANSI_CHARACTERS;
  }

  // Preserve the existing fallback for zero and NaN as well as omitted counts.
  const length = options.words === 0 || Number.isNaN(options.words) ? 100 : (options.words ?? 100);
  options.oneCharPerWord ??= inferCJK(charset);
  const oneCharPerWord = options.oneCharPerWord ?? false;

  if (oneCharPerWord) {
    const text = generateCharacterSequence(charset, length);
    return options.type === "chunks" ? [text] : text;
  }

  return options.type === "chunks"
    ? generateVolapykChunks(charset, length)
    : generateVolapykText(charset, length);
}

/**
 * Create volapyk chunks.
 * @param {Options} [options] options - Options for the volapyk creation
 * @returns {string[]} A string of volapyk chunks.
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
