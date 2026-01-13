---
title: graphql/resolvers/queries/index.ts
nav_order: 9
parent: Modules
---

## index overview

GraphQL query resolver aggregation.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [queryResolver](#queryresolver)

---

# utils

## queryResolver

Resolver for all GraphQL queries.

**Signature**

```ts
export declare const queryResolver: R<{
  product: En<
    StandardSchemaV1<
      { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined } | null,
      { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined } | null
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
```

Added in v1.0.0
