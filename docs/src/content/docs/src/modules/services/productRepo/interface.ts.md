---
title: services/productRepo/interface.ts
nav_order: 59
parent: Modules
---

## interface overview

Product repository service contract and live implementation.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [ProductNotFound (class)](#productnotfound-class)
  - [ProductRepoError (type alias)](#productrepoerror-type-alias)
  - [ProductRepoService (class)](#productreposervice-class)
  - [ProductRepoShape (type alias)](#productreposhape-type-alias)

---

# utils

## ProductNotFound (class)

Error thrown when a product lookup fails.

**Signature**

```ts
export declare class ProductNotFound { constructor(readonly id: ProductId) }
```

Added in v1.0.0

## ProductRepoError (type alias)

Error type union for product repository operations.

**Signature**

```ts
export type ProductRepoError = SqlError.SqlError | ProductNotFound | ParseError
```

Added in v1.0.0

## ProductRepoService (class)

Service tag for the product repository.

**Signature**

```ts
export declare class ProductRepoService
```

Added in v1.0.0

## ProductRepoShape (type alias)

Interface for product repository capabilities.

**Signature**

```ts
export type ProductRepoShape = {
  readonly getById: (id: ProductId) => Effect.Effect<Option.Option<Product>, ProductRepoError>
  readonly getForItem: (itemId: ItemId) => Effect.Effect<Option.Option<Product>, ProductRepoError>
  readonly list: Effect.Effect<readonly Product[], ProductRepoError>
  readonly create: (input: ProductInput) => Effect.Effect<Product, ProductRepoError>
}
```

Added in v1.0.0
