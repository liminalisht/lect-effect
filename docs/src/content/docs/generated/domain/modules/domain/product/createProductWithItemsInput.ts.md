---
title: domain/product/createProductWithItemsInput.ts
nav_order: 12
parent: Modules
---

## createProductWithItemsInput overview

Product-with-items creation input module.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [CreateProductWithItemsInput (type alias)](#createproductwithitemsinput-type-alias)
  - [createProductWithItemsInputSchema](#createproductwithitemsinputschema)

---

# utils

## CreateProductWithItemsInput (type alias)

Mutation payload for creating a product with its items.

**Signature**

```ts
export type CreateProductWithItemsInput = Schema.Schema.Type<typeof createProductWithItemsInputSchema>
```

Added in v1.0.0

## createProductWithItemsInputSchema

Schema for creating a product along with its items.

**Signature**

```ts
export declare const createProductWithItemsInputSchema: Schema.Struct<{
  product: Schema.Struct<{ description: Schema.optional<Schema.NullOr<Schema.SchemaClass<string, string, never>>> }>
  items: Schema.Array$<
    Schema.Struct<{
      description: Schema.optional<Schema.NullOr<typeof Schema.String>>
      pack_size: Schema.refine<number, typeof Schema.Number>
    }>
  >
}>
```

Added in v1.0.0
