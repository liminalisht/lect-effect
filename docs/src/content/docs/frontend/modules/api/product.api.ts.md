---
title: api/product.api.ts
nav_order: 2
parent: Modules
---

## product.api overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [CreateProductWithItemsApiError (type alias)](#createproductwithitemsapierror-type-alias)
  - [createProductWithItems](#createproductwithitems)

---

# utils

## CreateProductWithItemsApiError (type alias)

Errors possible from the createProductWithItems API call.

**Signature**

```ts
export type CreateProductWithItemsApiError = GraphQLClientError | ParseError
```

Added in v1.0.0

## createProductWithItems

Calls the createProductWithItems GraphQL mutation and returns the decoded result.

**Signature**

```ts
export declare const createProductWithItems: (
  rawInput: unknown
) => Effect.Effect<ProductWithItems, CreateProductWithItemsApiError, GraphQLClient>
```

Added in v1.0.0
