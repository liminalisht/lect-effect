---
title: services/itemRepo/interface.ts
nav_order: 48
parent: Modules
---

## interface overview

Item repository service contract and live implementation.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [ItemRepoError (type alias)](#itemrepoerror-type-alias)
  - [ItemRepoService (class)](#itemreposervice-class)
  - [ItemRepoShape (type alias)](#itemreposhape-type-alias)

---

# utils

## ItemRepoError (type alias)

Error type union for item repository operations.

**Signature**

```ts
export type ItemRepoError = SqlError.SqlError | ParseError
```

Added in v1.0.0

## ItemRepoService (class)

Service tag for the item repository.

**Signature**

```ts
export declare class ItemRepoService
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
