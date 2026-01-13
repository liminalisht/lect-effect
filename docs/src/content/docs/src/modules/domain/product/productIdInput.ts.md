---
title: domain/product/productIdInput.ts
nav_order: 23
parent: Modules
---

## productIdInput overview

Product id input module.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [ProductIdInput (type alias)](#productidinput-type-alias)
  - [productIdInputSchema](#productidinputschema)

---

# utils

## ProductIdInput (type alias)

GraphQL input for selecting a product by id.

**Signature**

```ts
export type ProductIdInput = Schema.Schema.Type<typeof productIdInputSchema>
```

Added in v1.0.0

## productIdInputSchema

Input schema for selecting a product by id.

**Signature**

```ts
export declare const productIdInputSchema: Schema.Struct<{ id: Schema.refine<number, typeof Schema.Number> }>
```

Added in v1.0.0
