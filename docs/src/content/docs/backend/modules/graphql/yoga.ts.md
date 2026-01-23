---
title: graphql/yoga.ts
nav_order: 9
parent: Modules
---

## yoga overview

GraphQL Yoga server setup.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [GraphQL Yoga Server Type](#graphql-yoga-server-type)
  - [Yoga (type alias)](#yoga-type-alias)
- [GraphQL Yoga Server Utilities](#graphql-yoga-server-utilities)
  - [makeYoga](#makeyoga)

---

# GraphQL Yoga Server Type

## Yoga (type alias)

Alias for the configured Yoga server instance.

**Signature**

```ts
export type Yoga<R> = YogaServerInstance<GraphQLContext<R>, Record<string, any>>
```

Added in v1.0.0

# GraphQL Yoga Server Utilities

## makeYoga

Constructs a Yoga server with the Effect runtime injected into context.

**Signature**

```ts
export declare const makeYoga: <R>(schema: GraphQLSchema) => Effect.Effect<Yoga<R>, never, R>
```

Added in v1.0.0
