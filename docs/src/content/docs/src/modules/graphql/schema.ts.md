---
title: graphql/schema.ts
nav_order: 38
parent: Modules
---

## schema overview

GraphQL schema construction helpers.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [logSchema](#logschema)
  - [makeSchema](#makeschema)

---

# utils

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
export declare const makeSchema: () => GraphQLSchema
```

Added in v1.0.0
