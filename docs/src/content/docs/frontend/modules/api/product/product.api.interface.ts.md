---
title: api/product/product.api.interface.ts
nav_order: 4
parent: Modules
---

## product.api.interface overview

Product API interface definitions and service tag.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [ProductApi (type alias)](#productapi-type-alias)
  - [ProductApiError (type alias)](#productapierror-type-alias)
  - [ProductApiService (class)](#productapiservice-class)

---

# utils

## ProductApi (type alias)

Public surface of the product API service.

**Signature**

```ts
export type ProductApi = {
  readonly createProductWithItems: (input: unknown) => Effect.Effect<ProductWithItems, ProductApiError>
}
```

Added in v1.0.0

## ProductApiError (type alias)

Error union produced by product API operations.

**Signature**

```ts
export type ProductApiError = GraphQLClientError | ParseError
```

Added in v1.0.0

## ProductApiService (class)

Tag for locating the product API service in an Effect environment.

**Signature**

```ts
export declare class ProductApiService
```

Added in v1.0.0
