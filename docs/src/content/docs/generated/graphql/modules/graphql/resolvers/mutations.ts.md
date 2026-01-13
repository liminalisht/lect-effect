---
title: graphql/resolvers/mutations.ts
nav_order: 7
parent: Modules
---

## mutations overview

GraphQL mutation resolvers.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [createItemMutation](#createitemmutation)
  - [createProductMutation](#createproductmutation)
  - [createProductWithItemsMutation](#createproductwithitemsmutation)
  - [mutationsMap](#mutationsmap)
  - [mutationsResolver](#mutationsresolver)

---

# utils

## createItemMutation

Mutation for creating an item.

**Signature**

```ts
export declare const createItemMutation: wn<
  StandardSchemaV1<
    { readonly id: number; readonly description: string | null; readonly pack_size: number },
    { readonly id: number; readonly description: string | null; readonly pack_size: number }
  > &
    Schema.SchemaClass<
      { readonly id: number; readonly description: string | null; readonly pack_size: number },
      { readonly id: number; readonly description: string | null; readonly pack_size: number },
      never
    >,
  StandardSchemaV1<
    { readonly pack_size: number; readonly description?: string | null | undefined },
    { readonly description?: string | null | undefined; readonly pack_size: number }
  > &
    Schema.SchemaClass<
      { readonly description?: string | null | undefined; readonly pack_size: number },
      { readonly pack_size: number; readonly description?: string | null | undefined },
      never
    >
>
```

Added in v1.0.0

## createProductMutation

Mutation for creating a product.

**Signature**

```ts
export declare const createProductMutation: wn<
  StandardSchemaV1<
    { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
    { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined }
  > &
    Schema.SchemaClass<
      { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
      { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
      never
    >,
  StandardSchemaV1<
    { readonly description?: string | null | undefined },
    { readonly description?: string | null | undefined }
  > &
    Schema.SchemaClass<
      { readonly description?: string | null | undefined },
      { readonly description?: string | null | undefined },
      never
    >
>
```

Added in v1.0.0

## createProductWithItemsMutation

Mutation for creating a product and its items together.

**Signature**

```ts
export declare const createProductWithItemsMutation: wn<
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
    },
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
    }
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
      },
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
      },
      never
    >,
  StandardSchemaV1<
    {
      readonly product: { readonly description?: string | null | undefined }
      readonly items: readonly { readonly pack_size: number; readonly description?: string | null | undefined }[]
    },
    {
      readonly product: { readonly description?: string | null | undefined }
      readonly items: readonly { readonly description?: string | null | undefined; readonly pack_size: number }[]
    }
  > &
    Schema.SchemaClass<
      {
        readonly product: { readonly description?: string | null | undefined }
        readonly items: readonly { readonly description?: string | null | undefined; readonly pack_size: number }[]
      },
      {
        readonly product: { readonly description?: string | null | undefined }
        readonly items: readonly { readonly pack_size: number; readonly description?: string | null | undefined }[]
      },
      never
    >
>
```

Added in v1.0.0

## mutationsMap

Mapping of mutation resolvers.

**Signature**

```ts
export declare const mutationsMap: {
  createItem: wn<
    StandardSchemaV1<
      { readonly id: number; readonly description: string | null; readonly pack_size: number },
      { readonly id: number; readonly description: string | null; readonly pack_size: number }
    > &
      Schema.SchemaClass<
        { readonly id: number; readonly description: string | null; readonly pack_size: number },
        { readonly id: number; readonly description: string | null; readonly pack_size: number },
        never
      >,
    StandardSchemaV1<
      { readonly pack_size: number; readonly description?: string | null | undefined },
      { readonly description?: string | null | undefined; readonly pack_size: number }
    > &
      Schema.SchemaClass<
        { readonly description?: string | null | undefined; readonly pack_size: number },
        { readonly pack_size: number; readonly description?: string | null | undefined },
        never
      >
  >
  createProduct: wn<
    StandardSchemaV1<
      { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
      { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined }
    > &
      Schema.SchemaClass<
        { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
        { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
        never
      >,
    StandardSchemaV1<
      { readonly description?: string | null | undefined },
      { readonly description?: string | null | undefined }
    > &
      Schema.SchemaClass<
        { readonly description?: string | null | undefined },
        { readonly description?: string | null | undefined },
        never
      >
  >
  createProductWithItems: wn<
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
      },
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
      }
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
        },
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
        },
        never
      >,
    StandardSchemaV1<
      {
        readonly product: { readonly description?: string | null | undefined }
        readonly items: readonly { readonly pack_size: number; readonly description?: string | null | undefined }[]
      },
      {
        readonly product: { readonly description?: string | null | undefined }
        readonly items: readonly { readonly description?: string | null | undefined; readonly pack_size: number }[]
      }
    > &
      Schema.SchemaClass<
        {
          readonly product: { readonly description?: string | null | undefined }
          readonly items: readonly { readonly description?: string | null | undefined; readonly pack_size: number }[]
        },
        {
          readonly product: { readonly description?: string | null | undefined }
          readonly items: readonly { readonly pack_size: number; readonly description?: string | null | undefined }[]
        },
        never
      >
  >
}
```

Added in v1.0.0

## mutationsResolver

Resolver for all GraphQL mutations.

**Signature**

```ts
export declare const mutationsResolver: R<{
  createItem: wn<
    StandardSchemaV1<
      { readonly id: number; readonly description: string | null; readonly pack_size: number },
      { readonly id: number; readonly description: string | null; readonly pack_size: number }
    > &
      Schema.SchemaClass<
        { readonly id: number; readonly description: string | null; readonly pack_size: number },
        { readonly id: number; readonly description: string | null; readonly pack_size: number },
        never
      >,
    StandardSchemaV1<
      { readonly pack_size: number; readonly description?: string | null | undefined },
      { readonly description?: string | null | undefined; readonly pack_size: number }
    > &
      Schema.SchemaClass<
        { readonly description?: string | null | undefined; readonly pack_size: number },
        { readonly pack_size: number; readonly description?: string | null | undefined },
        never
      >
  >
  createProduct: wn<
    StandardSchemaV1<
      { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
      { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined }
    > &
      Schema.SchemaClass<
        { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
        { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
        never
      >,
    StandardSchemaV1<
      { readonly description?: string | null | undefined },
      { readonly description?: string | null | undefined }
    > &
      Schema.SchemaClass<
        { readonly description?: string | null | undefined },
        { readonly description?: string | null | undefined },
        never
      >
  >
  createProductWithItems: wn<
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
      },
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
      }
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
        },
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
        },
        never
      >,
    StandardSchemaV1<
      {
        readonly product: { readonly description?: string | null | undefined }
        readonly items: readonly { readonly pack_size: number; readonly description?: string | null | undefined }[]
      },
      {
        readonly product: { readonly description?: string | null | undefined }
        readonly items: readonly { readonly description?: string | null | undefined; readonly pack_size: number }[]
      }
    > &
      Schema.SchemaClass<
        {
          readonly product: { readonly description?: string | null | undefined }
          readonly items: readonly { readonly description?: string | null | undefined; readonly pack_size: number }[]
        },
        {
          readonly product: { readonly description?: string | null | undefined }
          readonly items: readonly { readonly pack_size: number; readonly description?: string | null | undefined }[]
        },
        never
      >
  >
}>
```

Added in v1.0.0
