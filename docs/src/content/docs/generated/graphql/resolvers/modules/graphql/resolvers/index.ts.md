---
title: graphql/resolvers/index.ts
nav_order: 3
parent: Modules
---

## index overview

Root GraphQL resolver assembly.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [makeResolvers](#makeresolvers)

---

# utils

## makeResolvers

Assembles query, mutation, and field resolvers for the schema.

**Signature**

```ts
export declare const makeResolvers: () => (
  | R<{
      createItem: wn<
        StandardSchemaV1<
          { readonly id: number; readonly description: string | null; readonly pack_size: number },
          { readonly id: number; readonly description: string | null; readonly pack_size: number }
        > &
          SchemaClass<
            { readonly id: number; readonly description: string | null; readonly pack_size: number },
            { readonly id: number; readonly description: string | null; readonly pack_size: number },
            never
          >,
        StandardSchemaV1<
          { readonly pack_size: number; readonly description?: string | null | undefined },
          { readonly description?: string | null | undefined; readonly pack_size: number }
        > &
          SchemaClass<
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
          SchemaClass<
            { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
            { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
            never
          >,
        StandardSchemaV1<
          { readonly description?: string | null | undefined },
          { readonly description?: string | null | undefined }
        > &
          SchemaClass<
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
          SchemaClass<
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
          SchemaClass<
            {
              readonly product: { readonly description?: string | null | undefined }
              readonly items: readonly {
                readonly description?: string | null | undefined
                readonly pack_size: number
              }[]
            },
            {
              readonly product: { readonly description?: string | null | undefined }
              readonly items: readonly {
                readonly pack_size: number
                readonly description?: string | null | undefined
              }[]
            },
            never
          >
      >
    }>
  | R<{
      product: En<
        StandardSchemaV1<
          {
            readonly id: number
            readonly description: string | null
            readonly __typename?: "Product" | undefined
          } | null,
          {
            readonly id: number
            readonly description: string | null
            readonly __typename?: "Product" | undefined
          } | null
        > &
          SchemaClass<
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
          SchemaClass<{ readonly id: number }, { readonly id: number }, never>
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
          SchemaClass<
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
          SchemaClass<
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
          SchemaClass<{ readonly id: number }, { readonly id: number }, never>
      >
      item: En<
        StandardSchemaV1<
          { readonly id: number; readonly description: string | null; readonly pack_size: number } | null,
          { readonly id: number; readonly description: string | null; readonly pack_size: number } | null
        > &
          SchemaClass<
            { readonly id: number; readonly description: string | null; readonly pack_size: number } | null,
            { readonly id: number; readonly description: string | null; readonly pack_size: number } | null,
            never
          >,
        StandardSchemaV1<{ readonly id: number }, { readonly id: number }> &
          SchemaClass<{ readonly id: number }, { readonly id: number }, never>
      >
      items: En<
        StandardSchemaV1<
          readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
          readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[]
        > &
          SchemaClass<
            readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
            readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
            never
          >,
        void
      >
      hello: En<
        StandardSchemaV1<{ readonly greeting: string }, { readonly greeting: string & Brand<"Greeting"> }> &
          SchemaClass<{ readonly greeting: string & Brand<"Greeting"> }, { readonly greeting: string }, never>,
        StandardSchemaV1<{ readonly name: string | null | undefined }, { readonly name: string | null | undefined }> &
          SchemaClass<{ readonly name: string | null | undefined }, { readonly name: string | null | undefined }, never>
      >
    }>
  | B<
      StandardSchemaV1<
        { readonly id: number; readonly description: string | null; readonly pack_size: number },
        { readonly id: number; readonly description: string | null; readonly pack_size: number }
      > &
        SchemaClass<
          { readonly id: number; readonly description: string | null; readonly pack_size: number },
          { readonly id: number; readonly description: string | null; readonly pack_size: number },
          never
        >,
      {
        productForItem: xn<
          StandardSchemaV1<
            { readonly id: number; readonly description: string | null; readonly pack_size: number },
            { readonly id: number; readonly description: string | null; readonly pack_size: number }
          > &
            SchemaClass<
              { readonly id: number; readonly description: string | null; readonly pack_size: number },
              { readonly id: number; readonly description: string | null; readonly pack_size: number },
              never
            >,
          StandardSchemaV1<
            {
              readonly id: number
              readonly description: string | null
              readonly __typename?: "Product" | undefined
            } | null,
            {
              readonly id: number
              readonly description: string | null
              readonly __typename?: "Product" | undefined
            } | null
          > &
            SchemaClass<
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
          undefined,
          undefined
        >
      }
    >
  | B<
      StandardSchemaV1<
        { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
        { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined }
      > &
        SchemaClass<
          { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
          { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
          never
        >,
      {
        itemsForProduct: xn<
          StandardSchemaV1<
            { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
            { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined }
          > &
            SchemaClass<
              { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
              { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
              never
            >,
          StandardSchemaV1<
            readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
            readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[]
          > &
            SchemaClass<
              readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
              readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
              never
            >,
          undefined,
          undefined
        >
      }
    >
)[]
```

Added in v1.0.0
