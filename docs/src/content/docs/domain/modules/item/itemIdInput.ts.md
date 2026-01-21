---
title: item/itemIdInput.ts
nav_order: 10
parent: Modules
---

## itemIdInput overview

Item identifier input module.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [ItemIdInput (type alias)](#itemidinput-type-alias)
  - [itemIdInputSchema](#itemidinputschema)

---

# utils

## ItemIdInput (type alias)

GraphQL input for selecting an item by id.

**Signature**

```ts
export type ItemIdInput = Schema.Schema.Type<typeof itemIdInputSchema>
```

Added in v1.0.0

## itemIdInputSchema

Input schema for selecting an item by id.

**Signature**

```ts
export declare const itemIdInputSchema: Schema.Struct<{ id: Schema.refine<number, typeof Schema.Number> }>
```

Added in v1.0.0
