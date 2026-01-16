---
title: graphql/yoga.ts
nav_order: 27
parent: Modules
---

## yoga overview

GraphQL Yoga server setup.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Yoga (type alias)](#yoga-type-alias)
  - [makeYoga](#makeyoga)

---

# utils

## Yoga (type alias)

Alias for the configured Yoga server instance.

**Signature**

```ts
export type Yoga<R> = YogaServerInstance<GraphQLContext<R>, Record<string, any>>
```

Added in v1.0.0

## makeYoga

Constructs a Yoga server with the Effect runtime injected into context.

**Signature**

```ts
export declare const makeYoga: <R>(schema: GraphQLSchema) => Effect.Effect<Yoga<R>, never, R>
```

Added in v1.0.0
