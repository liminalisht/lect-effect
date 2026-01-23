---
title: product/productDescription.ts
nav_order: 14
parent: Modules
---

## productDescription overview

Product description value object definitions.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Domain Schemas](#domain-schemas)
  - [productDescriptionSchema](#productdescriptionschema)
- [Domain Types](#domain-types)
  - [ProductDescription (type alias)](#productdescription-type-alias)

---

# Domain Schemas

## productDescriptionSchema

Schema for product descriptions.

**Signature**

```ts
export declare const productDescriptionSchema: Schema.SchemaClass<string, string, never>
```

Added in v1.0.0

# Domain Types

## ProductDescription (type alias)

Product description value object.

**Signature**

```ts
export type ProductDescription = Schema.Schema.Type<typeof productDescriptionSchema>
```

Added in v1.0.0
