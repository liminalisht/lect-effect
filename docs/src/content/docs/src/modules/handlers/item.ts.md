---
title: handlers/item.ts
nav_order: 42
parent: Modules
---

## item overview

Item handlers bridging GraphQL operations to item and product repositories.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [createItem](#createitem)
  - [getItem](#getitem)
  - [listItems](#listitems)
  - [productForItem](#productforitem)

---

# utils

## createItem

Creates a new item.

**Signature**

```ts
export declare const createItem: (
  input: CreateItemInput
) => Effect.Effect<
  { readonly id: number; readonly description: string | null; readonly pack_size: number },
  ItemRepoError,
  ItemRepo
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
  ItemRepo
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
  ItemRepo
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
  { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined } | null,
  ProductRepoError,
  ProductRepo
>
```

Added in v1.0.0
