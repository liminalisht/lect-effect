---
title: domain/item/itemId.ts
nav_order: 4
parent: Modules
---

## itemId overview

Item identifier value object definitions.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [ItemId (type alias)](#itemid-type-alias)
  - [itemIdSchema](#itemidschema)

---

# utils

## ItemId (type alias)

Item identifier.

**Signature**

```ts
export type ItemId = Schema.Schema.Type<typeof itemIdSchema>
```

Added in v1.0.0

## itemIdSchema

Identifier schema for items.

**Signature**

```ts
export declare const itemIdSchema: Schema.refine<number, typeof Schema.Number>
```

Added in v1.0.0
