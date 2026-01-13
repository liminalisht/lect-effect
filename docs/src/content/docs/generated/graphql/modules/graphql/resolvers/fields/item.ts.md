---
title: graphql/resolvers/fields/item.ts
nav_order: 4
parent: Modules
---

## item overview

Field resolvers for the Item type.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [itemFieldResolvers](#itemfieldresolvers)

---

# utils

## itemFieldResolvers

Resolver map for Item fields.

**Signature**

```ts
export declare const itemFieldResolvers: B<
  StandardSchemaV1<
    { readonly id: number; readonly description: string | null; readonly pack_size: number },
    { readonly id: number; readonly description: string | null; readonly pack_size: number }
  > &
    Schema.SchemaClass<
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
        Schema.SchemaClass<
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
      undefined,
      undefined
    >
  }
>
```

Added in v1.0.0
