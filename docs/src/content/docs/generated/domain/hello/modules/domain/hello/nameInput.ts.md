---
title: domain/hello/nameInput.ts
nav_order: 4
parent: Modules
---

## nameInput overview

Hello domain input payloads.

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
export declare const nameInputSchema: Schema.Struct<{
  name: Schema.NullishOr<Schema.SchemaClass<string, string, never>>
}>
```

Added in v1.0.0
