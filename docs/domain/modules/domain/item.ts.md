---
title: domain/item.ts
nav_order: 5
parent: Modules
---

## item overview

Item domain schema and related input shapes.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Item (type alias)](#item-type-alias)
  - [ItemId (type alias)](#itemid-type-alias)
  - [ItemIdInput (type alias)](#itemidinput-type-alias)
  - [ItemInput (type alias)](#iteminput-type-alias)
  - [itemIdInputSchema](#itemidinputschema)
  - [itemIdSchema](#itemidschema)
  - [itemInputSchema](#iteminputschema)
  - [itemSchema](#itemschema)

---

# utils

## Item (type alias)

Item domain entity.

**Signature**

```ts
export type Item = Schema.Schema.Type<typeof itemSchema>
```

Added in v1.0.0

## ItemId (type alias)

Item identifier.

**Signature**

```ts
export type ItemId = Schema.Schema.Type<typeof itemIdSchema>
```

Added in v1.0.0

## ItemIdInput (type alias)

GraphQL input for selecting an item by id.

**Signature**

```ts
export type ItemIdInput = Schema.Schema.Type<typeof itemIdInputSchema>
```

Added in v1.0.0

## ItemInput (type alias)

GraphQL input for creating or updating an item.

**Signature**

```ts
export type ItemInput = Schema.Schema.Type<typeof itemInputSchema>
```

Added in v1.0.0

## itemIdInputSchema

Input schema for selecting an item by id.

**Signature**

```ts
export declare const itemIdInputSchema: Schema.Struct<{ id: Schema.filter<typeof Schema.Number> }>
```

Added in v1.0.0

## itemIdSchema

Identifier schema for items.

**Signature**

```ts
export declare const itemIdSchema: Schema.filter<typeof Schema.Number>
```

Added in v1.0.0

## itemInputSchema

Input schema for creating or updating an item.

**Signature**

```ts
export declare const itemInputSchema: Schema.Struct<{
  description: Schema.optional<Schema.NullOr<typeof Schema.String>>
  pack_size: Schema.filter<typeof Schema.Number>
}>
```

Added in v1.0.0

## itemSchema

Item schema used across persistence and GraphQL layers.

**Signature**

```ts
export declare const itemSchema: Schema.Struct<{
  __typename: Schema.optional<Schema.Literal<["Item"]>>
  id: Schema.filter<typeof Schema.Number>
  description: Schema.NullOr<typeof Schema.String>
  pack_size: Schema.filter<typeof Schema.Number>
}>
```

Added in v1.0.0
