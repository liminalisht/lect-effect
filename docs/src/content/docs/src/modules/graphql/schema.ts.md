---
title: graphql/schema.ts
nav_order: 25
parent: Modules
---

## schema overview

GraphQL schema construction helpers.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [GraphQLResolver (type alias)](#graphqlresolver-type-alias)
  - [logSchema](#logschema)
  - [makeSchema](#makeschema)

---

# utils

## GraphQLResolver (type alias)

Resolver type accepted by schema weaving.

**Signature**

```ts
export type GraphQLResolver = Parameters<typeof weave>[2]
```

Added in v1.0.0

## logSchema

Logs a printable version of the schema for debugging.

**Signature**

```ts
export declare const logSchema: (schema: GraphQLSchema) => Effect.Effect<void>
```

Added in v1.0.0

## makeSchema

Builds the GraphQL schema from registered resolvers.

**Signature**

```ts
export declare const makeSchema: (resolvers: readonly GraphQLResolver[]) => GraphQLSchema
```

Added in v1.0.0
