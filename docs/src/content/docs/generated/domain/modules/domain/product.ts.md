---
title: domain/product.ts
nav_order: 9
parent: Modules
---

## product overview

Product domain schema and related input shapes.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Product (type alias)](#product-type-alias)
  - [ProductId (type alias)](#productid-type-alias)
  - [ProductIdInput (type alias)](#productidinput-type-alias)
  - [ProductInput (type alias)](#productinput-type-alias)
  - [productIdInputSchema](#productidinputschema)
  - [productIdSchema](#productidschema)
  - [productInputSchema](#productinputschema)
  - [productSchema](#productschema)

---

# utils

## Product (type alias)

Product domain entity.

**Signature**

```ts
export type Product = Schema.Schema.Type<typeof productSchema>
```

Added in v1.0.0

## ProductId (type alias)

Product identifier.

**Signature**

```ts
export type ProductId = Schema.Schema.Type<typeof productIdSchema>
```

Added in v1.0.0

## ProductIdInput (type alias)

GraphQL input for selecting a product by id.

**Signature**

```ts
export type ProductIdInput = Schema.Schema.Type<typeof productIdInputSchema>
```

Added in v1.0.0

## ProductInput (type alias)

GraphQL input for creating or updating a product.

**Signature**

```ts
export type ProductInput = Schema.Schema.Type<typeof productInputSchema>
```

Added in v1.0.0

## productIdInputSchema

Input schema for selecting a product by id.

**Signature**

```ts
export declare const productIdInputSchema: Schema.Struct<{ id: Schema.filter<typeof Schema.Number> }>
```

Added in v1.0.0

## productIdSchema

Schema for product identifiers.

**Signature**

```ts
export declare const productIdSchema: Schema.filter<typeof Schema.Number>
```

Added in v1.0.0

## productInputSchema

Input schema for creating or updating a product.

**Signature**

```ts
export declare const productInputSchema: Schema.Struct<{
  description: Schema.optional<Schema.NullOr<typeof Schema.String>>
}>
```

Added in v1.0.0

## productSchema

Product schema used across persistence and GraphQL layers.

**Signature**

```ts
export declare const productSchema: Schema.Struct<{
  __typename: Schema.optional<Schema.Literal<["Product"]>>
  id: Schema.filter<typeof Schema.Number>
  description: Schema.NullOr<typeof Schema.String>
}>
```

Added in v1.0.0
