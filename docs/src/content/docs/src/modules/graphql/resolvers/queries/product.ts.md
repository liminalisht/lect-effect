---
title: graphql/resolvers/queries/product.ts
nav_order: 37
parent: Modules
---

## product overview

GraphQL product query resolvers.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [productQuery](#productquery)
  - [productQueryMap](#productquerymap)
  - [productQueryResolvers](#productqueryresolvers)
  - [productWithItemsQuery](#productwithitemsquery)
  - [productsQuery](#productsquery)

---

# utils

## productQuery

Query for fetching a product by id.

**Signature**

```ts
export declare const productQuery: En<
  StandardSchemaV1<
    { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined } | null,
    { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined } | null
  > &
    Schema.SchemaClass<
      { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined } | null,
      { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined } | null,
      never
    >,
  StandardSchemaV1<{ readonly id: number }, { readonly id: number }> &
    Schema.SchemaClass<{ readonly id: number }, { readonly id: number }, never>
>
```

Added in v1.0.0

## productQueryMap

Map of product queries.

**Signature**

```ts
export declare const productQueryMap: {
  product: En<
    StandardSchemaV1<
      { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined } | null,
      { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined } | null
    > &
      Schema.SchemaClass<
        {
          readonly id: number
          readonly description: string | null
          readonly __typename?: "Product" | undefined
        } | null,
        {
          readonly id: number
          readonly description: string | null
          readonly __typename?: "Product" | undefined
        } | null,
        never
      >,
    StandardSchemaV1<{ readonly id: number }, { readonly id: number }> &
      Schema.SchemaClass<{ readonly id: number }, { readonly id: number }, never>
  >
  products: En<
    StandardSchemaV1<
      readonly {
        readonly id: number
        readonly description: string | null
        readonly __typename?: "Product" | undefined
      }[],
      readonly {
        readonly id: number
        readonly description: string | null
        readonly __typename?: "Product" | undefined
      }[]
    > &
      Schema.SchemaClass<
        readonly {
          readonly id: number
          readonly description: string | null
          readonly __typename?: "Product" | undefined
        }[],
        readonly {
          readonly id: number
          readonly description: string | null
          readonly __typename?: "Product" | undefined
        }[],
        never
      >,
    void
  >
  productWithItems: En<
    StandardSchemaV1<
      {
        readonly product: {
          readonly id: number
          readonly description: string | null
          readonly __typename?: "Product" | undefined
        }
        readonly items: readonly {
          readonly id: number
          readonly description: string | null
          readonly pack_size: number
        }[]
      } | null,
      {
        readonly product: {
          readonly id: number
          readonly description: string | null
          readonly __typename?: "Product" | undefined
        }
        readonly items: readonly {
          readonly id: number
          readonly description: string | null
          readonly pack_size: number
        }[]
      } | null
    > &
      Schema.SchemaClass<
        {
          readonly product: {
            readonly id: number
            readonly description: string | null
            readonly __typename?: "Product" | undefined
          }
          readonly items: readonly {
            readonly id: number
            readonly description: string | null
            readonly pack_size: number
          }[]
        } | null,
        {
          readonly product: {
            readonly id: number
            readonly description: string | null
            readonly __typename?: "Product" | undefined
          }
          readonly items: readonly {
            readonly id: number
            readonly description: string | null
            readonly pack_size: number
          }[]
        } | null,
        never
      >,
    StandardSchemaV1<{ readonly id: number }, { readonly id: number }> &
      Schema.SchemaClass<{ readonly id: number }, { readonly id: number }, never>
  >
}
```

Added in v1.0.0

## productQueryResolvers

Resolver for product queries.

**Signature**

```ts
export declare const productQueryResolvers: R<{
  product: En<
    StandardSchemaV1<
      { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined } | null,
      { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined } | null
    > &
      Schema.SchemaClass<
        {
          readonly id: number
          readonly description: string | null
          readonly __typename?: "Product" | undefined
        } | null,
        {
          readonly id: number
          readonly description: string | null
          readonly __typename?: "Product" | undefined
        } | null,
        never
      >,
    StandardSchemaV1<{ readonly id: number }, { readonly id: number }> &
      Schema.SchemaClass<{ readonly id: number }, { readonly id: number }, never>
  >
  products: En<
    StandardSchemaV1<
      readonly {
        readonly id: number
        readonly description: string | null
        readonly __typename?: "Product" | undefined
      }[],
      readonly {
        readonly id: number
        readonly description: string | null
        readonly __typename?: "Product" | undefined
      }[]
    > &
      Schema.SchemaClass<
        readonly {
          readonly id: number
          readonly description: string | null
          readonly __typename?: "Product" | undefined
        }[],
        readonly {
          readonly id: number
          readonly description: string | null
          readonly __typename?: "Product" | undefined
        }[],
        never
      >,
    void
  >
  productWithItems: En<
    StandardSchemaV1<
      {
        readonly product: {
          readonly id: number
          readonly description: string | null
          readonly __typename?: "Product" | undefined
        }
        readonly items: readonly {
          readonly id: number
          readonly description: string | null
          readonly pack_size: number
        }[]
      } | null,
      {
        readonly product: {
          readonly id: number
          readonly description: string | null
          readonly __typename?: "Product" | undefined
        }
        readonly items: readonly {
          readonly id: number
          readonly description: string | null
          readonly pack_size: number
        }[]
      } | null
    > &
      Schema.SchemaClass<
        {
          readonly product: {
            readonly id: number
            readonly description: string | null
            readonly __typename?: "Product" | undefined
          }
          readonly items: readonly {
            readonly id: number
            readonly description: string | null
            readonly pack_size: number
          }[]
        } | null,
        {
          readonly product: {
            readonly id: number
            readonly description: string | null
            readonly __typename?: "Product" | undefined
          }
          readonly items: readonly {
            readonly id: number
            readonly description: string | null
            readonly pack_size: number
          }[]
        } | null,
        never
      >,
    StandardSchemaV1<{ readonly id: number }, { readonly id: number }> &
      Schema.SchemaClass<{ readonly id: number }, { readonly id: number }, never>
  >
}>
```

Added in v1.0.0

## productWithItemsQuery

Query for fetching a product and its items.

**Signature**

```ts
export declare const productWithItemsQuery: En<
  StandardSchemaV1<
    {
      readonly product: {
        readonly id: number
        readonly description: string | null
        readonly __typename?: "Product" | undefined
      }
      readonly items: readonly {
        readonly id: number
        readonly description: string | null
        readonly pack_size: number
      }[]
    } | null,
    {
      readonly product: {
        readonly id: number
        readonly description: string | null
        readonly __typename?: "Product" | undefined
      }
      readonly items: readonly {
        readonly id: number
        readonly description: string | null
        readonly pack_size: number
      }[]
    } | null
  > &
    Schema.SchemaClass<
      {
        readonly product: {
          readonly id: number
          readonly description: string | null
          readonly __typename?: "Product" | undefined
        }
        readonly items: readonly {
          readonly id: number
          readonly description: string | null
          readonly pack_size: number
        }[]
      } | null,
      {
        readonly product: {
          readonly id: number
          readonly description: string | null
          readonly __typename?: "Product" | undefined
        }
        readonly items: readonly {
          readonly id: number
          readonly description: string | null
          readonly pack_size: number
        }[]
      } | null,
      never
    >,
  StandardSchemaV1<{ readonly id: number }, { readonly id: number }> &
    Schema.SchemaClass<{ readonly id: number }, { readonly id: number }, never>
>
```

Added in v1.0.0

## productsQuery

Query for listing products.

**Signature**

```ts
export declare const productsQuery: En<
  StandardSchemaV1<
    readonly {
      readonly id: number
      readonly description: string | null
      readonly __typename?: "Product" | undefined
    }[],
    readonly { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined }[]
  > &
    Schema.SchemaClass<
      readonly {
        readonly id: number
        readonly description: string | null
        readonly __typename?: "Product" | undefined
      }[],
      readonly {
        readonly id: number
        readonly description: string | null
        readonly __typename?: "Product" | undefined
      }[],
      never
    >,
  void
>
```

Added in v1.0.0
