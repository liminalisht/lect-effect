---
title: product/productWithItems.ts
nav_order: 18
parent: Modules
---

## productWithItems overview

Product composite (product plus items) module.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Domain Schemas](#domain-schemas)
  - [productWithItemsSchema](#productwithitemsschema)
- [Domain Types](#domain-types)
  - [ProductWithItems (type alias)](#productwithitems-type-alias)

---

# Domain Schemas

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

Added in v0.1.0

# Domain Types

## ProductWithItems (type alias)

Product paired with its items.

**Signature**

```ts
export type ProductWithItems = Schema.Schema.Type<typeof productWithItemsSchema>
```

Added in v0.1.0
