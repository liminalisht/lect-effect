---
title: domain/nameInput.ts
nav_order: 7
parent: Modules
---

## nameInput overview

Input shape for greeting by name.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [NameInput (type alias)](#nameinput-type-alias)
  - [nameInputSchema](#nameinputschema)

---

# utils

## NameInput (type alias)

Input payload for greeting by name.

**Signature**

```ts
export type NameInput = Schema.Schema.Type<typeof nameInputSchema>
```

Added in v1.0.0

## nameInputSchema

Schema for the optional greeting name input.

**Signature**

```ts
export declare const nameInputSchema: Schema.Struct<{ name: Schema.NullishOr<typeof Schema.String> }>
```

Added in v1.0.0
