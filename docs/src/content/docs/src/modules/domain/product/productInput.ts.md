---
title: domain/product/productInput.ts
nav_order: 24
parent: Modules
---

## productInput overview

Product input module for create/update operations.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [ProductInput (type alias)](#productinput-type-alias)
  - [productInputSchema](#productinputschema)

---

# utils

## ProductInput (type alias)

GraphQL input for creating or updating a product.

**Signature**

```ts
export type ProductInput = Schema.Schema.Type<typeof productInputSchema>
```

Added in v1.0.0

## productInputSchema

Input schema for creating or updating a product.

**Signature**

```ts
export declare const productInputSchema: Schema.Struct<{
  description: Schema.optional<Schema.NullOr<Schema.SchemaClass<string, string, never>>>
}>
```

Added in v1.0.0
