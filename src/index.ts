// the (string & {}) is just here, to make sure that everything passes.
// if the output type is not a "chunks" or "text", it will be defaulted to "text"
export type OutputType = "chunks" | "text" | (string & {});

export type Preset = "ansi";

export interface Options {
  chars?: `preset:${Preset}` | (string & {})
  type?: OutputType
  words?: number
}

const DEFAULT_OPTIONS = {
  chars: "preset:ansi",
  type: "text",
  words: 100,
} satisfies Options;

export const ANSI_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789àâéèêôùûçÀÂÉÈÔÙÛÇ";

/**
 * Create volapyk text.
 * @param {Options} [options=DEFAULT_OPTIONS] options - Options for the volapyk creation
 * @returns {string | string[]} A string or an array of strings, depending on the `type`.
 */
export function createVolapyk<TOptions extends Options = typeof DEFAULT_OPTIONS>(options?: TOptions): TOptions["type"] extends "chunks" ? string[] : TOptions["type"] extends "text" ? string : (string | string[]) {
  options = options ?? DEFAULT_OPTIONS as TOptions;
  if (options.type !== "chunks" && options.type !== "text") {
    options.type = "text";
  }

  let charset = options.chars;

  if (!charset || charset === "preset:ansi") {
    charset = ANSI_CHARACTERS;
  }

  const length = options.words || 100;

  if (options.type === "chunks") {
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

    return chunks as any;
  }
  let text = "";

  for (let i = 0; i < length; i++) {
    const wordLength = Math.ceil(Math.random() * 10);
    for (let j = 0; j < wordLength; j++) {
      text += charset[Math.floor(Math.random() * charset.length)];
    }
    if (i !== length - 1) text += " ";
  }

  return text as any;
}

export function createVolapykChunks(options: Pick<Options, "words" | "chars">): string[] {
  return createVolapyk({ ...options, type: "chunks" });
}

export function createVolapykText(options: Pick<Options, "words" | "chars">): string {
  return createVolapyk({ ...options, type: "text" });
}
