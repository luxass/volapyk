test("createVolapyk with default options returns a string of length 100", () => {
  const result = createVolapyk();
  expect(typeof result).toBe("string");
  expect(result.length).toBeGreaterThan(100);
  // minus -1 because the last character is a space
  expect(result.split(" ").length).toBe(100);
});

test("createVolapyk with type 'chunks' returns an array of strings", () => {
  const result = createVolapyk({ type: "chunks" });
  expect(Array.isArray(result)).toBe(true);
  expect(result.every((chunk) => typeof chunk === "string")).toBe(true);
});

test("createVolapyk with type 'chunks' returns an array of strings with length equal to options.length", () => {
  const words = 5;
  const result = createVolapyk({ type: "chunks", words });

  expect(Array.isArray(result)).toBe(true);
  expect(result.every((chunk) => chunk.split(" ").length === 5)).toBe(true);
});

test("createVolapyk with type 'text' returns a string", () => {
  const result = createVolapyk({ type: "text" });
  expect(typeof result).toBe("string");
});

test("createVolapyk with type 'text' returns a string with length equal to options.length", () => {
  const words = 5;
  const result = createVolapyk({ type: "text", words });

  expect(typeof result).toBe("string");
  expect(result.split(" ").length).toBe(5);
});

test("createVolapyk with invalid type option defaults to 'text'", () => {
  const result = createVolapyk({ type: "invalid" });
  expect(typeof result).toBe("string");
});

test("createVolapyk with custom charset option returns a string containing only characters from the charset", () => {
  const charset = "abc";
  const result = createVolapyk({ chars: charset, type: "text" });
  expect(typeof result).toBe("string");
  expect(result.split("").filter((char) => char !== " ").every((char: string) => charset.includes(char))).toBe(
    true,
  );
});
test("createVolapykChunks with default options returns an array of strings with length equal to 100", () => {
  const result = createVolapykChunks({ words: 5 });
  console.log(result);
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBe(100);
});

test("createVolapykChunks with custom options returns an array of strings with length equal to options.length", () => {
  const words = 10;
  const result = createVolapykChunks({ words });

  expect(Array.isArray(result)).toBe(true);
  expect(result.every((chunk) => chunk.split(" ").length === words)).toBe(
    true,
  );
});

test("createVolapykChunks with custom charset option returns an array of strings containing only characters from the charset", () => {
  const charset = "abc";
  const result = createVolapykChunks({ words: 5, chars: charset });
  expect(Array.isArray(result)).toBe(true);
  expect(
    result.every((chunk) =>
      chunk.split("").filter((char) => char !== " ").every((char: string) => charset.includes(char)),
    ),
  ).toBe(true);
});
test("createVolapykText with default options returns a string of length 100", () => {
  const result = createVolapykText({ words: 100 });
  expect(typeof result).toBe("string");
  expect(result.length).toBeGreaterThan(100);
  // minus -1 because the last character is a space
  expect(result.split(" ").length).toBe(100);
});

test("createVolapykText with custom options returns a string with length equal to options.words", () => {
  const words = 5;
  const result = createVolapykText({ words });

  expect(typeof result).toBe("string");
  expect(result.split(" ").length).toBe(words);
});

test("createVolapykText with custom charset option returns a string containing only characters from the charset", () => {
  const charset = "abc";
  const result = createVolapykText({ words: 10, chars: charset });
  expect(typeof result).toBe("string");
  expect(result.split("").filter((char) => char !== " ").every((char: string) => charset.includes(char))).toBe(
    true,
  );
});
