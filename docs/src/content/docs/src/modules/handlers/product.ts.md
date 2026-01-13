---
title: handlers/product.ts
nav_order: 43
parent: Modules
---

## product overview

Product handlers bridging GraphQL operations to repositories.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [createProduct](#createproduct)
  - [createProductWithItems](#createproductwithitems)
  - [getProduct](#getproduct)
  - [getProductWithItems](#getproductwithitems)
  - [itemsForProduct](#itemsforproduct)
  - [listProducts](#listproducts)

---

# utils

## createProduct

Creates a new product.

**Signature**

```ts
export declare const createProduct: (
  input: ProductInput
) => Effect.Effect<
  { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
  ProductRepoError,
  ProductRepo
>
```

Added in v1.0.0

## createProductWithItems

Creates a product and associated items, linking them.

**Signature**

```ts
export declare const createProductWithItems: (
  input: CreateProductWithItemsInput
) => Effect.Effect<
  {
    product: { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined }
    items: { readonly id: number; readonly description: string | null; readonly pack_size: number }[]
  },
  ParseError | SqlError | ProductNotFound,
  ProductRepo | ItemRepo
>
```

Added in v1.0.0

## getProduct

Fetches a single product by id or returns null.

**Signature**

```ts
export declare const getProduct: (
  id: ProductId
) => Effect.Effect<
  { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined } | null,
  ProductRepoError,
  ProductRepo
>
```

Added in v1.0.0

## getProductWithItems

Fetches a product with its items, or null when missing.

**Signature**

```ts
export declare const getProductWithItems: (
  id: ProductId
) => Effect.Effect<
  {
    product: { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined }
    items: readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[]
  } | null,
  ParseError | SqlError | ProductNotFound,
  ProductRepo | ItemRepo
>
```

Added in v1.0.0

## itemsForProduct

Lists items for a given product id.

**Signature**

```ts
export declare const itemsForProduct: (
  productId: ProductId
) => Effect.Effect<
  readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
  ItemRepoError,
  ItemRepo
>
```

Added in v1.0.0

## listProducts

Lists all products.

**Signature**

```ts
export declare const listProducts: Effect.Effect<
  readonly { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined }[],
  ProductRepoError,
  ProductRepo
>
```

Added in v1.0.0
