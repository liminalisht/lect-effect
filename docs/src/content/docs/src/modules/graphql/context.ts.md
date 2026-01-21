---
title: graphql/context.ts
nav_order: 3
parent: Modules
---

## context overview

GraphQL execution context bindings.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [GraphQLContext (type alias)](#graphqlcontext-type-alias)

---

# utils

## GraphQLContext (type alias)

GraphQL context enriched with an Effect runtime for `AppServices`.

**Signature**

```ts
export type GraphQLContext<R> = YogaInitialContext & RuntimeForServiceRequirements<R>
```

Added in v1.0.0
