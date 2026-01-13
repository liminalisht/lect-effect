---
title: domain/item/item.ts
nav_order: 7
parent: Modules
---

## item overview

Item domain schema module.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Item (type alias)](#item-type-alias)
  - [itemSchema](#itemschema)

---

# utils

## Item (type alias)

Item domain entity.

**Signature**

```ts
export type Item = Schema.Schema.Type<typeof itemSchema>
```

Added in v1.0.0

## itemSchema

Item schema used across persistence and GraphQL layers.

**Signature**

```ts
export declare const itemSchema: Schema.Struct<{
  id: Schema.refine<number, typeof Schema.Number>
  description: Schema.NullOr<typeof Schema.String>
  pack_size: Schema.refine<number, typeof Schema.Number>
}>
```

Added in v1.0.0
