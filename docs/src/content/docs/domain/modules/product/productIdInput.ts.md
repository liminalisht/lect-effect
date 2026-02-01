---
title: product/productIdInput.ts
nav_order: 16
parent: Modules
---

## productIdInput overview

Product id input module.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Domain Schemas](#domain-schemas)
  - [productIdInputSchema](#productidinputschema)
- [Domain Types](#domain-types)
  - [ProductIdInput (type alias)](#productidinput-type-alias)

---

# Domain Schemas

## productIdInputSchema

Input schema for selecting a product by id.

**Signature**

```ts
export declare const productIdInputSchema: Schema.Struct<{ id: Schema.refine<number, typeof Schema.Number> }>
```

Added in v0.1.0

# Domain Types

## ProductIdInput (type alias)

GraphQL input for selecting a product by id.

**Signature**

```ts
export type ProductIdInput = Schema.Schema.Type<typeof productIdInputSchema>
```

Added in v0.1.0
