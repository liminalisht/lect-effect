---
title: graphql/resolvers/queries/hello.ts
nav_order: 34
parent: Modules
---

## hello overview

GraphQL hello query resolvers.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [helloQueryMap](#helloquerymap)
  - [helloQueryResolver](#helloqueryresolver)

---

# utils

## helloQueryMap

Map of hello queries.

**Signature**

```ts
export declare const helloQueryMap: {
  hello: En<
    StandardSchemaV1<{ readonly greeting: string }, { readonly greeting: string & Brand<"Greeting"> }> &
      Schema.SchemaClass<{ readonly greeting: string & Brand<"Greeting"> }, { readonly greeting: string }, never>,
    StandardSchemaV1<{ readonly name: string | null | undefined }, { readonly name: string | null | undefined }> &
      Schema.SchemaClass<
        { readonly name: string | null | undefined },
        { readonly name: string | null | undefined },
        never
      >
  >
}
```

Added in v1.0.0

## helloQueryResolver

Resolver for hello queries.

**Signature**

```ts
export declare const helloQueryResolver: R<{
  hello: En<
    StandardSchemaV1<{ readonly greeting: string }, { readonly greeting: string & Brand<"Greeting"> }> &
      Schema.SchemaClass<{ readonly greeting: string & Brand<"Greeting"> }, { readonly greeting: string }, never>,
    StandardSchemaV1<{ readonly name: string | null | undefined }, { readonly name: string | null | undefined }> &
      Schema.SchemaClass<
        { readonly name: string | null | undefined },
        { readonly name: string | null | undefined },
        never
      >
  >
}>
```

Added in v1.0.0
