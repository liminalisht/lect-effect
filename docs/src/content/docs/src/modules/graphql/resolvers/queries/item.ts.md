---
title: graphql/resolvers/queries/item.ts
nav_order: 36
parent: Modules
---

## item overview

GraphQL item query resolvers.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [itemQuery](#itemquery)
  - [itemQueryMap](#itemquerymap)
  - [itemQueryResolvers](#itemqueryresolvers)
  - [itemsQuery](#itemsquery)

---

# utils

## itemQuery

Query for fetching a single item.

**Signature**

```ts
export declare const itemQuery: En<
  StandardSchemaV1<
    { readonly id: number; readonly description: string | null; readonly pack_size: number } | null,
    { readonly id: number; readonly description: string | null; readonly pack_size: number } | null
  > &
    Schema.SchemaClass<
      { readonly id: number; readonly description: string | null; readonly pack_size: number } | null,
      { readonly id: number; readonly description: string | null; readonly pack_size: number } | null,
      never
    >,
  StandardSchemaV1<{ readonly id: number }, { readonly id: number }> &
    Schema.SchemaClass<{ readonly id: number }, { readonly id: number }, never>
>
```

Added in v1.0.0

## itemQueryMap

Map of item queries.

**Signature**

```ts
export declare const itemQueryMap: {
  item: En<
    StandardSchemaV1<
      { readonly id: number; readonly description: string | null; readonly pack_size: number } | null,
      { readonly id: number; readonly description: string | null; readonly pack_size: number } | null
    > &
      Schema.SchemaClass<
        { readonly id: number; readonly description: string | null; readonly pack_size: number } | null,
        { readonly id: number; readonly description: string | null; readonly pack_size: number } | null,
        never
      >,
    StandardSchemaV1<{ readonly id: number }, { readonly id: number }> &
      Schema.SchemaClass<{ readonly id: number }, { readonly id: number }, never>
  >
  items: En<
    StandardSchemaV1<
      readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
      readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[]
    > &
      Schema.SchemaClass<
        readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
        readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
        never
      >,
    void
  >
}
```

Added in v1.0.0

## itemQueryResolvers

Resolver for item queries.

**Signature**

```ts
export declare const itemQueryResolvers: R<{
  item: En<
    StandardSchemaV1<
      { readonly id: number; readonly description: string | null; readonly pack_size: number } | null,
      { readonly id: number; readonly description: string | null; readonly pack_size: number } | null
    > &
      Schema.SchemaClass<
        { readonly id: number; readonly description: string | null; readonly pack_size: number } | null,
        { readonly id: number; readonly description: string | null; readonly pack_size: number } | null,
        never
      >,
    StandardSchemaV1<{ readonly id: number }, { readonly id: number }> &
      Schema.SchemaClass<{ readonly id: number }, { readonly id: number }, never>
  >
  items: En<
    StandardSchemaV1<
      readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
      readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[]
    > &
      Schema.SchemaClass<
        readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
        readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
        never
      >,
    void
  >
}>
```

Added in v1.0.0

## itemsQuery

Query for listing items.

**Signature**

```ts
export declare const itemsQuery: En<
  StandardSchemaV1<
    readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
    readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[]
  > &
    Schema.SchemaClass<
      readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
      readonly { readonly id: number; readonly description: string | null; readonly pack_size: number }[],
      never
    >,
  void
>
```

Added in v1.0.0
