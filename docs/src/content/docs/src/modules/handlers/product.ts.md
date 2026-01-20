---
title: handlers/product.ts
nav_order: 31
parent: Modules
---

## product overview

Product handlers bridging GraphQL operations to repositories.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [createProduct](#createproduct)
  - [createProductMutation](#createproductmutation)
  - [createProductWithItems](#createproductwithitems)
  - [createProductWithItemsMutation](#createproductwithitemsmutation)
  - [getProduct](#getproduct)
  - [getProductQuery](#getproductquery)
  - [getProductWithItems](#getproductwithitems)
  - [getProductWithItemsQuery](#getproductwithitemsquery)
  - [itemsForProduct](#itemsforproduct)
  - [itemsForProductField](#itemsforproductfield)
  - [listProducts](#listproducts)
  - [listProductsQuery](#listproductsquery)
  - [productHandlers](#producthandlers)

---

# utils

## createProduct

Creates a new product.

**Signature**

```ts
export declare const createProduct: (
  input: ProductInput
) => Effect.Effect<
  { readonly __typename?: "Product" | undefined; readonly id: number; readonly description: string | null },
  ProductRepoError,
  ProductRepoService
>
```

Added in v1.0.0

## createProductMutation

Mutation handler for creating a product.

**Signature**

```ts
export declare const createProductMutation: MutationHandler<
  Schema.Struct<{ description: Schema.optional<Schema.NullOr<Schema.SchemaClass<string, string, never>>> }>,
  Schema.Struct<{
    __typename: Schema.optional<Schema.Literal<["Product"]>>
    id: Schema.refine<number, typeof Schema.Number>
    description: Schema.NullOr<Schema.SchemaClass<string, string, never>>
  }>,
  ProductRepoError,
  ProductRepoService
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
    product: { readonly __typename?: "Product" | undefined; readonly id: number; readonly description: string | null }
    items: { readonly id: number; readonly description: string | null; readonly pack_size: number }[]
  },
  SqlError | ParseError | ProductNotFound,
  ItemRepoService | ProductRepoService
>
```

Added in v1.0.0

## createProductWithItemsMutation

Mutation handler for creating a product and linking its items.

**Signature**

```ts
export declare const createProductWithItemsMutation: MutationHandler<
  Schema.Struct<{
    product: Schema.Struct<{ description: Schema.optional<Schema.NullOr<Schema.SchemaClass<string, string, never>>> }>
    items: Schema.Array$<
      Schema.Struct<{
        description: Schema.optional<Schema.NullOr<typeof Schema.String>>
        pack_size: Schema.refine<number, typeof Schema.Number>
      }>
    >
  }>,
  Schema.Struct<{
    product: Schema.Struct<{
      __typename: Schema.optional<Schema.Literal<["Product"]>>
      id: Schema.refine<number, typeof Schema.Number>
      description: Schema.NullOr<Schema.SchemaClass<string, string, never>>
    }>
    items: Schema.Array$<
      Schema.Struct<{
        id: Schema.refine<number, typeof Schema.Number>
        description: Schema.NullOr<typeof Schema.String>
        pack_size: Schema.refine<number, typeof Schema.Number>
      }>
    >
  }>,
  SqlError | ParseError | ProductNotFound,
  ItemRepoService | ProductRepoService
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
  { readonly __typename?: "Product" | undefined; readonly id: number; readonly description: string | null } | null,
  ProductRepoError,
  ProductRepoService
>
```

Added in v1.0.0

## getProductQuery

Query handler for fetching a single product.

**Signature**

```ts
export declare const getProductQuery: QueryHandler<
  Schema.Struct<{ id: Schema.refine<number, typeof Schema.Number> }>,
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

## getProductWithItems

Fetches a product with its items, or null when missing.

**Signature**

```ts
export declare const getProductWithItems: (
  id: ProductId
) => Effect.Effect<
  {
    product: { readonly __typename?: "Product" | undefined; readonly id: number; readonly description: string | null }
    items: readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[]
  } | null,
  SqlError | ParseError | ProductNotFound,
  ItemRepoService | ProductRepoService
>
```

Added in v1.0.0

## getProductWithItemsQuery

Query handler for fetching a product along with its items.

**Signature**

```ts
export declare const getProductWithItemsQuery: QueryHandler<
  Schema.Struct<{ id: Schema.refine<number, typeof Schema.Number> }>,
  Schema.NullOr<
    Schema.Struct<{
      product: Schema.Struct<{
        __typename: Schema.optional<Schema.Literal<["Product"]>>
        id: Schema.refine<number, typeof Schema.Number>
        description: Schema.NullOr<Schema.SchemaClass<string, string, never>>
      }>
      items: Schema.Array$<
        Schema.Struct<{
          id: Schema.refine<number, typeof Schema.Number>
          description: Schema.NullOr<typeof Schema.String>
          pack_size: Schema.refine<number, typeof Schema.Number>
        }>
      >
    }>
  >,
  SqlError | ParseError | ProductNotFound,
  ItemRepoService | ProductRepoService
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
  ItemRepoService
>
```

Added in v1.0.0

## itemsForProductField

Field resolver for loading items for the parent product.

**Signature**

```ts
export declare const itemsForProductField: FieldHandler<
  Schema.Struct<{
    __typename: Schema.optional<Schema.Literal<["Product"]>>
    id: Schema.refine<number, typeof Schema.Number>
    description: Schema.NullOr<Schema.SchemaClass<string, string, never>>
  }>,
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

## listProducts

Lists all products.

**Signature**

```ts
export declare const listProducts: Effect.Effect<
  readonly { readonly __typename?: "Product" | undefined; readonly id: number; readonly description: string | null }[],
  ProductRepoError,
  ProductRepoService
>
```

Added in v1.0.0

## listProductsQuery

Query handler for listing products.

**Signature**

```ts
export declare const listProductsQuery: QueryHandler<
  Schema.Struct<{}>,
  Schema.Array$<
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

## productHandlers

Registered product handlers for GraphQL resolver conversion.

**Signature**

```ts
export declare const productHandlers: (
  | QueryHandler<
      Schema.Struct<{ id: Schema.refine<number, typeof Schema.Number> }>,
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
  | QueryHandler<
      Schema.Struct<{}>,
      Schema.Array$<
        Schema.Struct<{
          __typename: Schema.optional<Schema.Literal<["Product"]>>
          id: Schema.refine<number, typeof Schema.Number>
          description: Schema.NullOr<Schema.SchemaClass<string, string, never>>
        }>
      >,
      ProductRepoError,
      ProductRepoService
    >
  | MutationHandler<
      Schema.Struct<{ description: Schema.optional<Schema.NullOr<Schema.SchemaClass<string, string, never>>> }>,
      Schema.Struct<{
        __typename: Schema.optional<Schema.Literal<["Product"]>>
        id: Schema.refine<number, typeof Schema.Number>
        description: Schema.NullOr<Schema.SchemaClass<string, string, never>>
      }>,
      ProductRepoError,
      ProductRepoService
    >
  | FieldHandler<
      Schema.Struct<{
        __typename: Schema.optional<Schema.Literal<["Product"]>>
        id: Schema.refine<number, typeof Schema.Number>
        description: Schema.NullOr<Schema.SchemaClass<string, string, never>>
      }>,
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
  | QueryHandler<
      Schema.Struct<{ id: Schema.refine<number, typeof Schema.Number> }>,
      Schema.NullOr<
        Schema.Struct<{
          product: Schema.Struct<{
            __typename: Schema.optional<Schema.Literal<["Product"]>>
            id: Schema.refine<number, typeof Schema.Number>
            description: Schema.NullOr<Schema.SchemaClass<string, string, never>>
          }>
          items: Schema.Array$<
            Schema.Struct<{
              id: Schema.refine<number, typeof Schema.Number>
              description: Schema.NullOr<typeof Schema.String>
              pack_size: Schema.refine<number, typeof Schema.Number>
            }>
          >
        }>
      >,
      SqlError | ParseError | ProductNotFound,
      ItemRepoService | ProductRepoService
    >
  | MutationHandler<
      Schema.Struct<{
        product: Schema.Struct<{
          description: Schema.optional<Schema.NullOr<Schema.SchemaClass<string, string, never>>>
        }>
        items: Schema.Array$<
          Schema.Struct<{
            description: Schema.optional<Schema.NullOr<typeof Schema.String>>
            pack_size: Schema.refine<number, typeof Schema.Number>
          }>
        >
      }>,
      Schema.Struct<{
        product: Schema.Struct<{
          __typename: Schema.optional<Schema.Literal<["Product"]>>
          id: Schema.refine<number, typeof Schema.Number>
          description: Schema.NullOr<Schema.SchemaClass<string, string, never>>
        }>
        items: Schema.Array$<
          Schema.Struct<{
            id: Schema.refine<number, typeof Schema.Number>
            description: Schema.NullOr<typeof Schema.String>
            pack_size: Schema.refine<number, typeof Schema.Number>
          }>
        >
      }>,
      SqlError | ParseError | ProductNotFound,
      ItemRepoService | ProductRepoService
    >
)[]
```

Added in v1.0.0
