---
title: utilities/decode.ts
nav_order: 26
parent: Modules
---

## decode overview

Decoding helpers for Effect schemas.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Decoding Helpers](#decoding-helpers)
  - [decodeMany](#decodemany)
  - [decodeOne](#decodeone)

---

# Decoding Helpers

## decodeMany

Decodes an array of unknown values with the provided schema.

**Signature**

```ts
export declare const decodeMany: <A>(
  schema: Schema.Schema<A>
) => (rows: readonly unknown[]) => Effect.Effect<A[], ParseError, never>
```

Added in v1.0.0

## decodeOne

Decodes a single unknown value with the provided schema.

**Signature**

```ts
export declare const decodeOne: <A>(schema: Schema.Schema<A>) => (u: unknown) => Effect.Effect<A, ParseError, never>
```

Added in v1.0.0
