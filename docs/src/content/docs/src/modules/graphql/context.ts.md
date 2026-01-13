---
title: graphql/context.ts
nav_order: 27
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
export type GraphQLContext = YogaInitialContext & RuntimeForAppServicesShape
```

Added in v1.0.0
