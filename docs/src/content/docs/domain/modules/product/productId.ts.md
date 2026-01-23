---
title: product/productId.ts
nav_order: 15
parent: Modules
---

## productId overview

Product identifier value object definitions.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Domain Schemas](#domain-schemas)
  - [productIdSchema](#productidschema)
- [Domain Types](#domain-types)
  - [ProductId (type alias)](#productid-type-alias)

---

# Domain Schemas

## productIdSchema

Schema for product identifiers.

**Signature**

```ts
export declare const productIdSchema: Schema.refine<number, typeof Schema.Number>
```

Added in v1.0.0

# Domain Types

## ProductId (type alias)

Product identifier.

**Signature**

```ts
export type ProductId = Schema.Schema.Type<typeof productIdSchema>
```

Added in v1.0.0
