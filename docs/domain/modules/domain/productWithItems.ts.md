---
title: domain/productWithItems.ts
nav_order: 10
parent: Modules
---

## productWithItems overview

Product domain composite that bundles a product with its items.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [CreateProductWithItemsInput (type alias)](#createproductwithitemsinput-type-alias)
  - [ProductWithItems (type alias)](#productwithitems-type-alias)
  - [createProductWithItemsInputSchema](#createproductwithitemsinputschema)
  - [productIdInputSchema](#productidinputschema)
  - [productWithItemsSchema](#productwithitemsschema)

---

# utils

## CreateProductWithItemsInput (type alias)

Mutation payload for creating a product with its items.

**Signature**

```ts
export type CreateProductWithItemsInput = Schema.Schema.Type<typeof createProductWithItemsInputSchema>
```

Added in v1.0.0

## ProductWithItems (type alias)

Product paired with its items.

**Signature**

```ts
export type ProductWithItems = Schema.Schema.Type<typeof productWithItemsSchema>
```

Added in v1.0.0

## createProductWithItemsInputSchema

Schema for creating a product along with its items.

**Signature**

```ts
export declare const createProductWithItemsInputSchema: Schema.Struct<{
  product: Schema.Struct<{ description: Schema.optional<Schema.NullOr<typeof Schema.String>> }>
  items: Schema.Array$<
    Schema.Struct<{
      description: Schema.optional<Schema.NullOr<typeof Schema.String>>
      pack_size: Schema.filter<typeof Schema.Number>
    }>
  >
}>
```

Added in v1.0.0

## productIdInputSchema

Re-exported product id input schema to preserve import paths.

**Signature**

```ts
export declare const productIdInputSchema: Schema.Struct<{ id: Schema.filter<typeof Schema.Number> }>
```

Added in v1.0.0

## productWithItemsSchema

Schema representing a product with its items.

**Signature**

```ts
export declare const productWithItemsSchema: Schema.Struct<{
  product: Schema.Struct<{
    __typename: Schema.optional<Schema.Literal<["Product"]>>
    id: Schema.filter<typeof Schema.Number>
    description: Schema.NullOr<typeof Schema.String>
  }>
  items: Schema.Array$<
    Schema.Struct<{
      __typename: Schema.optional<Schema.Literal<["Item"]>>
      id: Schema.filter<typeof Schema.Number>
      description: Schema.NullOr<typeof Schema.String>
      pack_size: Schema.filter<typeof Schema.Number>
    }>
  >
}>
```

Added in v1.0.0
