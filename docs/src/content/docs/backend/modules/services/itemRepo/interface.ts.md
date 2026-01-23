---
title: services/itemRepo/interface.ts
nav_order: 30
parent: Modules
---

## interface overview

Item repository service contract and live implementation.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Service Errors](#service-errors)
  - [ItemRepoError (type alias)](#itemrepoerror-type-alias)
- [Service Interfaces](#service-interfaces)
  - [ItemRepoShape (type alias)](#itemreposhape-type-alias)
- [Services](#services)
  - [ItemRepoService (class)](#itemreposervice-class)

---

# Service Errors

## ItemRepoError (type alias)

Error type union for item repository operations.

**Signature**

```ts
export type ItemRepoError = SqlError.SqlError | ParseError
```

Added in v1.0.0

# Service Interfaces

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

# Services

## ItemRepoService (class)

Service tag for the item repository.

**Signature**

```ts
export declare class ItemRepoService
```

Added in v1.0.0
