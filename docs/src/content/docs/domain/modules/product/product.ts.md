---
title: product/product.ts
nav_order: 13
parent: Modules
---

## product overview

Product domain schema module.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Domain Schemas](#domain-schemas)
  - [productSchema](#productschema)
- [Domain Types](#domain-types)
  - [Product (type alias)](#product-type-alias)

---

# Domain Schemas

## productSchema

Product schema used across persistence and GraphQL layers.

**Signature**

```ts
export declare const productSchema: Schema.Struct<{
  __typename: Schema.optional<Schema.Literal<["Product"]>>
  id: Schema.refine<number, typeof Schema.Number>
  description: Schema.NullOr<Schema.SchemaClass<string, string, never>>
}>
```

Added in v1.0.0

# Domain Types

## Product (type alias)

Product domain entity.

**Signature**

```ts
export type Product = Schema.Schema.Type<typeof productSchema>
```

Added in v1.0.0
