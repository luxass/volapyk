// the (string & {}) is just here, to make sure that everything passes.
// if the output type is not a "chunks" or "text", it will be defaulted to "text"
export type OutputType = "chunks" | "text" | (string & {});

export type Preset = "ansi";

export interface Options {
  /**
   * The characters to use for the volapyk.
   *
   * @default "preset:ansi"
   */
  chars?: `preset:${Preset}` | (string & {})

  /**
   * The type of the output.
   *
   * @default "text"
   */
  type?: OutputType

  /**
   * The amount of words to generate.
   */
  words?: number

  /**
   * If you are using CJK characters, you should set this to `true`.
   * We will try to infer this automatically, but it's not always possible.
   *
   * @default false
   */
  oneCharPerWord?: boolean
}

const DEFAULT_OPTIONS = {
  chars: "preset:ansi",
  type: "text",
  words: 100,
} satisfies Options;

export const ANSI_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789àâéèêôùûçÀÂÉÈÔÙÛÇ";

// There is probably more CJK code ranges..
const CJK_CODE_RANGES = [
  [0x3040, 0x309F],
  // CJK Unified ideographs
  [0x4E00, 0x9FFF],
  // Hangul
  [0xAC00, 0xD7A3],
  // CJK extensions
  [0x20000, 0x2EBE0],
];

function inferCJK(charset: string & {}): boolean | undefined {
  if (!charset) return false;

  for (const char of charset) {
    const code = char.charCodeAt(0);

    for (const [start, end] of CJK_CODE_RANGES) {
      if (!start || !end) return false;
      if (code >= start && code <= end) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Create volapyk text.
 * @param {Options} [options=DEFAULT_OPTIONS] options - Options for the volapyk creation
 * @returns {string | string[]} A string or an array of strings, depending on the `type`.
 */
export function createVolapyk<TOptions extends Options>(options?: TOptions): TOptions["type"] extends "chunks" ? string[] : TOptions["type"] extends "text" ? string : (string | string[]) {
  options = options ?? DEFAULT_OPTIONS as TOptions;
  if (options.type !== "chunks" && options.type !== "text") {
    options.type = "text";
  }

  let charset = options.chars;

  if (!charset || charset === "preset:ansi") {
    charset = ANSI_CHARACTERS;
  }

  const length = options.words || 100;

  if (options.oneCharPerWord === undefined) {
    options.oneCharPerWord = inferCJK(charset);
  }

  const oneCharPerWord = options.oneCharPerWord || false;

  if (options.type === "chunks") {
    const chunks: string[] = [];

    let chunk = "";

    if (oneCharPerWord) {
      const charsLength = charset.length;
      for (let i = 0; i < length; i++) {
        chunk += charset[Math.floor(Math.random() * charsLength)];
      }

      return [chunk] as any;
    }

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

    return chunks as any;
  }
  let text = "";

  if (oneCharPerWord) {
    const charsLength = charset.length;
    for (let i = 0; i < length; i++) {
      text += charset[Math.floor(Math.random() * charsLength)];
    }
    return text as any;
  }

  for (let i = 0; i < length; i++) {
    const wordLength = Math.ceil(Math.random() * 10);
    for (let j = 0; j < wordLength; j++) {
      text += charset[Math.floor(Math.random() * charset.length)];
    }
    if (i !== length - 1) text += " ";
  }

  return text as any;
}

/**
 * Create volapyk chunks.
 * @param {Options} [options=DEFAULT_OPTIONS] options - Options for the volapyk creation
 * @returns {string[]} A string of volapyk chunks.
 */
export function createVolapykChunks(options: Pick<Options, "words" | "chars" | "oneCharPerWord">): string[] {
  return createVolapyk({ ...options, type: "chunks" });
}

/**
 * Create volapyk text.
 * @param {Options} [options=DEFAULT_OPTIONS] options - Options for the volapyk creation
 * @returns {string} A string of volapyk text.
 */
export function createVolapykText(options: Pick<Options, "words" | "chars" | "oneCharPerWord">): string {
  return createVolapyk({ ...options, type: "text" });
}
