---
title: item/createItemInput.ts
nav_order: 6
parent: Modules
---

## createItemInput overview

Item creation/update input module.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Domain Schemas](#domain-schemas)
  - [createItemInputSchema](#createiteminputschema)
- [Domain Types](#domain-types)
  - [CreateItemInput (type alias)](#createiteminput-type-alias)

---

# Domain Schemas

## createItemInputSchema

Input schema for creating or updating an item.

**Signature**

```ts
export declare const createItemInputSchema: Schema.Struct<{
  description: Schema.optional<Schema.NullOr<typeof Schema.String>>
  pack_size: Schema.refine<number, typeof Schema.Number>
}>
```

Added in v0.1.0

# Domain Types

## CreateItemInput (type alias)

GraphQL input for creating or updating an item.

**Signature**

```ts
export type CreateItemInput = Schema.Schema.Type<typeof createItemInputSchema>
```

Added in v0.1.0
