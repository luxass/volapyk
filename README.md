# 🗣️ volapyk

`/vɔlɑˈpyg/`, "volapyk", or "volapük"

## 📦 Installation

```sh
pnpm install volapyk
```

## 📚 Usage

```ts
import { createVolapyk, createVolapykChunks, createVolapykText } from "volapyk";

const volapyk = createVolapyk({
  type: "text",
  words: 10
});

// will create a text string of 10 words

// use a different charset
const volapyk = createVolapyk({
  type: "text",
  words: 10,
  chars: "abcdefghijkl"
});

// will create a text string of 10 words using only the characters "abcdefghijkl"

// create chunks instead of a string, or you can use the createVolapykChunks function
const volapyk = createVolapyk({
  type: "chunks"
});
```

## 📄 License

Published under [MIT License](./LICENSE).
