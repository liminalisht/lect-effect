---
title: domain/item/createItemInput.ts
nav_order: 6
parent: Modules
---

## createItemInput overview

Item creation/update input module.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [CreateItemInput (type alias)](#createiteminput-type-alias)
  - [createItemInputSchema](#createiteminputschema)

---

# utils

## CreateItemInput (type alias)

GraphQL input for creating or updating an item.

**Signature**

```ts
export type CreateItemInput = Schema.Schema.Type<typeof createItemInputSchema>
```

Added in v1.0.0

## createItemInputSchema

Input schema for creating or updating an item.

**Signature**

```ts
export declare const createItemInputSchema: Schema.Struct<{
  description: Schema.optional<Schema.NullOr<typeof Schema.String>>
  pack_size: Schema.refine<number, typeof Schema.Number>
}>
```

Added in v1.0.0
