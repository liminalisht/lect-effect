---
title: graphql/resolvers/fields/product.ts
nav_order: 5
parent: Modules
---

## product overview

Field resolvers for the Product type.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [productFieldResolvers](#productfieldresolvers)

---

# utils

## productFieldResolvers

Resolver map for Product fields.

**Signature**

```ts
export declare const productFieldResolvers: B<
  StandardSchemaV1<
    { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
    { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined }
  > &
    Schema.SchemaClass<
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
        Schema.SchemaClass<
          { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
          { readonly id: number; readonly description: string | null; readonly __typename?: "Product" | undefined },
          never
        >,
      StandardSchemaV1<
        readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
        readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[]
      > &
        Schema.SchemaClass<
          readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
          readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
          never
        >,
      undefined,
      undefined
    >
  }
>
```

Added in v1.0.0
