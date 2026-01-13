---
title: services/itemRepo.ts
nav_order: 55
parent: Modules
---

## itemRepo overview

Item repository service contract and live implementation.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [ItemRepo (class)](#itemrepo-class)
  - [ItemRepoError (type alias)](#itemrepoerror-type-alias)
  - [ItemRepoLive](#itemrepolive)
  - [ItemRepoShape (type alias)](#itemreposhape-type-alias)

---

# utils

## ItemRepo (class)

Service tag for the item repository.

**Signature**

```ts
export declare class ItemRepo
```

Added in v1.0.0

## ItemRepoError (type alias)

Error type union for item repository operations.

**Signature**

```ts
export type ItemRepoError = SqlError.SqlError | ParseError
```

Added in v1.0.0

## ItemRepoLive

Live implementation of the ItemRepo.

**Signature**

```ts
export declare const ItemRepoLive: Effect.Effect<ItemRepoShape, never, MasterdataDb>
```

Added in v1.0.0

## ItemRepoShape (type alias)

Interface for item repository capabilities.

**Signature**

```ts
export type ItemRepoShape = {
  readonly getById: (id: ItemId) => Effect.Effect<Item | null, ItemRepoError>
  readonly list: Effect.Effect<readonly Item[], ItemRepoError>
  readonly create: (input: CreateItemInput) => Effect.Effect<Item, ItemRepoError>
  readonly listForProduct: (productId: ProductId) => Effect.Effect<readonly Item[], ItemRepoError>
  readonly linkToProduct: (itemId: ItemId, productId: ProductId) => Effect.Effect<void, ItemRepoError>
}
```

Added in v1.0.0
