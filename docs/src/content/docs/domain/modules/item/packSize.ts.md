---
title: item/packSize.ts
nav_order: 11
parent: Modules
---

## packSize overview

Item pack size value object definitions.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Domain Schemas](#domain-schemas)
  - [packSizeSchema](#packsizeschema)
- [Domain Types](#domain-types)
  - [PackSize (type alias)](#packsize-type-alias)

---

# Domain Schemas

## packSizeSchema

Schema for item pack size.

**Signature**

```ts
export declare const packSizeSchema: Schema.refine<number, typeof Schema.Number>
```

Added in v1.0.0

# Domain Types

## PackSize (type alias)

Pack size value object.

**Signature**

```ts
export type PackSize = Schema.Schema.Type<typeof packSizeSchema>
```

Added in v1.0.0
