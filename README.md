# 🗣️ volapyk

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

`/vɔlɑˈpyg/`, "volapyk", or "volapük"

## 📦 Installation

```sh
npm install volapyk
```

## 📚 Usage

```ts
import { createVolapyk, createVolapykChunks, createVolapykText } from "volapyk";

// will create a text string of 10 words
const volapyk = createVolapyk({
  type: "text",
  words: 10
});

// will create a text string of 10 words using only the characters "abcdefghijkl"
const volapyk = createVolapyk({
  type: "text",
  words: 10,
  chars: "abcdefghijkl"
});

// create chunks instead of a string, or you can use the createVolapykChunks function
const volapyk = createVolapyk({
  type: "chunks"
});
```

## 📄 License

Published under [MIT License](./LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/volapyk?style=flat&colorA=18181B&colorB=4169E1
[npm-version-href]: https://npmjs.com/package/volapyk
[npm-downloads-src]: https://img.shields.io/npm/dm/volapyk?style=flat&colorA=18181B&colorB=4169E1
[npm-downloads-href]: https://npmjs.com/package/volapyk
