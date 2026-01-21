---
title: product/productWithItems.ts
nav_order: 18
parent: Modules
---

## productWithItems overview

Product composite (product plus items) module.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [ProductWithItems (type alias)](#productwithitems-type-alias)
  - [productWithItemsSchema](#productwithitemsschema)

---

# utils

## ProductWithItems (type alias)

Product paired with its items.

**Signature**

```ts
export type ProductWithItems = Schema.Schema.Type<typeof productWithItemsSchema>
```

Added in v1.0.0

## productWithItemsSchema

Schema representing a product with its items.

**Signature**

```ts
export declare const productWithItemsSchema: Schema.Struct<{
  product: Schema.Struct<{
    __typename: Schema.optional<Schema.Literal<["Product"]>>
    id: Schema.refine<number, typeof Schema.Number>
    description: Schema.NullOr<Schema.SchemaClass<string, string, never>>
  }>
  items: Schema.Array$<
    Schema.Struct<{
      id: Schema.refine<number, typeof Schema.Number>
      description: Schema.NullOr<typeof Schema.String>
      pack_size: Schema.refine<number, typeof Schema.Number>
    }>
  >
}>
```

Added in v1.0.0
