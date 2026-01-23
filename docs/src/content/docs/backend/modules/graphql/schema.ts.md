---
title: graphql/schema.ts
nav_order: 7
parent: Modules
---

## schema overview

GraphQL schema construction helpers.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [GraphQL Resolver Types](#graphql-resolver-types)
  - [GraphQLResolver (type alias)](#graphqlresolver-type-alias)
- [GraphQL Schema Utilities](#graphql-schema-utilities)
  - [logSchema](#logschema)
  - [makeSchema](#makeschema)
  - [printSortedSchema](#printsortedschema)

---

# GraphQL Resolver Types

## GraphQLResolver (type alias)

Resolver type accepted by schema weaving.

**Signature**

```ts
export type GraphQLResolver = Parameters<typeof weave>[2]
```

Added in v1.0.0

# GraphQL Schema Utilities

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

## printSortedSchema

Produces a stable SDL string for a schema.

**Signature**

```ts
export declare const printSortedSchema: (schema: GraphQLSchema) => string
```

Added in v1.0.0
