---
title: item/itemIdInput.ts
nav_order: 10
parent: Modules
---

## itemIdInput overview

Item identifier input module.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Domain Schemas](#domain-schemas)
  - [itemIdInputSchema](#itemidinputschema)
- [Domain Types](#domain-types)
  - [ItemIdInput (type alias)](#itemidinput-type-alias)

---

# Domain Schemas

## itemIdInputSchema

Input schema for selecting an item by id.

**Signature**

```ts
export declare const itemIdInputSchema: Schema.Struct<{ id: Schema.refine<number, typeof Schema.Number> }>
```

Added in v1.0.0

# Domain Types

## ItemIdInput (type alias)

GraphQL input for selecting an item by id.

**Signature**

```ts
export type ItemIdInput = Schema.Schema.Type<typeof itemIdInputSchema>
```

Added in v1.0.0
