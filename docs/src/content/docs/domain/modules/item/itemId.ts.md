---
title: item/itemId.ts
nav_order: 9
parent: Modules
---

## itemId overview

Item identifier value object definitions.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Domain Schemas](#domain-schemas)
  - [itemIdSchema](#itemidschema)
- [Domain Types](#domain-types)
  - [ItemId (type alias)](#itemid-type-alias)

---

# Domain Schemas

## itemIdSchema

Identifier schema for items.

**Signature**

```ts
export declare const itemIdSchema: Schema.refine<number, typeof Schema.Number>
```

Added in v0.1.0

# Domain Types

## ItemId (type alias)

Item identifier.

**Signature**

```ts
export type ItemId = Schema.Schema.Type<typeof itemIdSchema>
```

Added in v0.1.0
