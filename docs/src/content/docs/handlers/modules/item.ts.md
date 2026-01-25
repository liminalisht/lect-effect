---
title: item.ts
nav_order: 4
parent: Modules
---

## item overview

Item handlers bridging GraphQL operations to item and product repositories.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Item Handler Effects](#item-handler-effects)
  - [createItem](#createitem)
  - [getItem](#getitem)
  - [listItems](#listitems)
  - [productForItem](#productforitem)
- [Item Handlers](#item-handlers)
  - [createItemMutation](#createitemmutation)
  - [getItemQuery](#getitemquery)
  - [itemHandlers](#itemhandlers)
  - [listItemsQuery](#listitemsquery)
  - [productForItemField](#productforitemfield)

---

# Item Handler Effects

## createItem

Creates a new item.

**Signature**

```ts
export declare const createItem: (
  input: CreateItemInput
) => Effect.Effect<
  { readonly id: number; readonly description: string | null; readonly pack_size: number },
  ItemRepoError,
  ItemRepoService
>
```

Added in v1.0.0

## getItem

Fetches an item by id.

**Signature**

```ts
export declare const getItem: (
  id: ItemId
) => Effect.Effect<
  { readonly id: number; readonly description: string | null; readonly pack_size: number } | null,
  ItemRepoError,
  ItemRepoService
>
```

Added in v1.0.0

## listItems

Lists all items.

**Signature**

```ts
export declare const listItems: Effect.Effect<
  readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
  ItemRepoError,
  ItemRepoService
>
```

Added in v1.0.0

## productForItem

Looks up the product for a given item id, returning null when absent.

**Signature**

```ts
export declare const productForItem: (
  itemId: ItemId
) => Effect.Effect<
  { readonly __typename?: "Product" | undefined; readonly id: number; readonly description: string | null } | null,
  ProductRepoError,
  ProductRepoService
>
```

Added in v1.0.0

# Item Handlers

## createItemMutation

Mutation handler for creating a new item.

**Signature**

```ts
export declare const createItemMutation: MutationHandler<
  Schema.Struct<{
    description: Schema.optional<Schema.NullOr<typeof Schema.String>>
    pack_size: Schema.refine<number, typeof Schema.Number>
  }>,
  Schema.Struct<{
    id: Schema.refine<number, typeof Schema.Number>
    description: Schema.NullOr<typeof Schema.String>
    pack_size: Schema.refine<number, typeof Schema.Number>
  }>,
  ItemRepoError,
  ItemRepoService
>
```

Added in v1.0.0

## getItemQuery

Query handler for fetching a single item.

**Signature**

```ts
export declare const getItemQuery: QueryHandler<
  Schema.Struct<{ id: Schema.refine<number, typeof Schema.Number> }>,
  Schema.NullOr<
    Schema.Struct<{
      id: Schema.refine<number, typeof Schema.Number>
      description: Schema.NullOr<typeof Schema.String>
      pack_size: Schema.refine<number, typeof Schema.Number>
    }>
  >,
  ItemRepoError,
  ItemRepoService
>
```

Added in v1.0.0

## itemHandlers

Registered item handlers for GraphQL resolver conversion.

**Signature**

```ts
export declare const itemHandlers: (
  | QueryHandler<
      Schema.Struct<{ id: Schema.refine<number, typeof Schema.Number> }>,
      Schema.NullOr<
        Schema.Struct<{
          id: Schema.refine<number, typeof Schema.Number>
          description: Schema.NullOr<typeof Schema.String>
          pack_size: Schema.refine<number, typeof Schema.Number>
        }>
      >,
      ItemRepoError,
      ItemRepoService
    >
  | QueryHandler<
      Schema.Struct<{}>,
      Schema.Array$<
        Schema.Struct<{
          id: Schema.refine<number, typeof Schema.Number>
          description: Schema.NullOr<typeof Schema.String>
          pack_size: Schema.refine<number, typeof Schema.Number>
        }>
      >,
      ItemRepoError,
      ItemRepoService
    >
  | MutationHandler<
      Schema.Struct<{
        description: Schema.optional<Schema.NullOr<typeof Schema.String>>
        pack_size: Schema.refine<number, typeof Schema.Number>
      }>,
      Schema.Struct<{
        id: Schema.refine<number, typeof Schema.Number>
        description: Schema.NullOr<typeof Schema.String>
        pack_size: Schema.refine<number, typeof Schema.Number>
      }>,
      ItemRepoError,
      ItemRepoService
    >
  | FieldHandler<
      Schema.Struct<{
        id: Schema.refine<number, typeof Schema.Number>
        description: Schema.NullOr<typeof Schema.String>
        pack_size: Schema.refine<number, typeof Schema.Number>
      }>,
      Schema.Struct<{}>,
      Schema.NullOr<
        Schema.Struct<{
          __typename: Schema.optional<Schema.Literal<["Product"]>>
          id: Schema.refine<number, typeof Schema.Number>
          description: Schema.NullOr<Schema.SchemaClass<string, string, never>>
        }>
      >,
      ProductRepoError,
      ProductRepoService
    >
)[]
```

Added in v1.0.0

## listItemsQuery

Query handler for listing all items.

**Signature**

```ts
export declare const listItemsQuery: QueryHandler<
  Schema.Struct<{}>,
  Schema.Array$<
    Schema.Struct<{
      id: Schema.refine<number, typeof Schema.Number>
      description: Schema.NullOr<typeof Schema.String>
      pack_size: Schema.refine<number, typeof Schema.Number>
    }>
  >,
  ItemRepoError,
  ItemRepoService
>
```

Added in v1.0.0

## productForItemField

Field resolver for loading the product related to an item.

**Signature**

```ts
export declare const productForItemField: FieldHandler<
  Schema.Struct<{
    id: Schema.refine<number, typeof Schema.Number>
    description: Schema.NullOr<typeof Schema.String>
    pack_size: Schema.refine<number, typeof Schema.Number>
  }>,
  Schema.Struct<{}>,
  Schema.NullOr<
    Schema.Struct<{
      __typename: Schema.optional<Schema.Literal<["Product"]>>
      id: Schema.refine<number, typeof Schema.Number>
      description: Schema.NullOr<Schema.SchemaClass<string, string, never>>
    }>
  >,
  ProductRepoError,
  ProductRepoService
>
```

Added in v1.0.0
